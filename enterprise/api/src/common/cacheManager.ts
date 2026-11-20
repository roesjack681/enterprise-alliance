const fs = require('fs');
const path = require('path');

interface CacheEntry {
    data: { [id: string]: any }; // 数据索引
    timestamp: number; // 时间戳
}

class CacheManager {
    private cache: { [key: string]: CacheEntry } = {}; // 缓存数据
    private cacheDuration: number; // 缓存时长（毫秒）
    private cacheFilePath: string; // 缓存文件路径

    constructor(cacheDuration: number = 5 * 60 * 1000, cacheFilePath: string = path.join(__dirname, 'cache.json')) {
        this.cacheDuration = cacheDuration;
        this.cacheFilePath = cacheFilePath;

        this.ensureCacheDir(); // 确保缓存目录存在
        this.loadCache(); // 加载缓存
        //this.cleanExpiredCache(); // 清理过期缓存
    }

    // ----------- 核心功能 -------------

    /**
     * 获取某个 key 下的整个列表
     * @param key 缓存 key
     * @returns 数据列表（数组形式）
     */
    getList<T>(key: string): T[] {
        const entry = this.cache[key];
        if (entry) {//&& Date.now() - entry.timestamp < this.cacheDuration
            return Object.values(entry.data);
        }
        return [];
    }

    /**
     * 获取某个 id 对应的对象
     * @param key 缓存 key
     * @param id 唯一标识符
     * @returns 对象数据或 null
     */
    getItem<T>(key: string, id: string): T | null {
        const entry = this.cache[key];
        if (entry && entry.data[id]) {
            return entry.data[id];
        }
        return null;
    }

    /**
     * 添加或更新单个对象
     * @param key 缓存 key
     * @param id 唯一标识符
     * @param newItem 新的对象数据
     */
    upsertItem(key: string, id: string, newItem: any): void {
        const entry = this.cache[key] || { data: {}, timestamp: Date.now() };
        entry.data[id] = { ...entry.data[id], ...newItem }; // 更新或新增
        //entry.timestamp = Date.now();

        this.cache[key] = entry;
    }

    /**
     * 删除单个对象
     * @param key 缓存 key
     * @param id 唯一标识符
     */
    removeItem(key: string, id: string): void {
        const entry = this.cache[key];
        if (entry && entry.data[id]) {
            delete entry.data[id];
            entry.timestamp = Date.now();
        }
    }
    // 根据指定字段排序数据
    getSortedList<T>(
        key: string,
        field: string,
        order: "asc" | "desc" = "asc"
    ): T[] {
        const list = this.getList<T>(key);
        if (!list || !Array.isArray(list)) return [];

        return list.sort((a: any, b: any) => {
            const aValue = Number(a[field]); // 将字段转换为数值
            const bValue = Number(b[field]);

            if (isNaN(aValue) || isNaN(bValue)) return 0; // 如果无法转换为数值，跳过

            if (order === "asc") {
                return aValue - bValue; // 升序
            } else {
                return bValue - aValue; // 降序
            }
        });
    }
    /**
     * 批量初始化数据（数组形式）
     * @param key 缓存 key
     * @param list 初始化的数组数据
     * @param idField 数据对象中的标识字段名
     */
    setList(key: string, list: any[], idField: string): void {
        const data = list.reduce((acc, item) => {
            acc[item[idField]] = item;
            return acc;
        }, {} as { [id: string]: any });

        this.cache[key] = { data, timestamp: Date.now() };
    }

    // ----------- 基础功能 -------------

    /**
     * 检查缓存是否有效
     * @param key 缓存 key
     * @returns 是否有效
     */
    isCacheValid(key: string): boolean {
        //const entry = this.cache[key];
        return this.cache[key] ? true : false;// && Date.now() - entry.timestamp < this.cacheDuration;
    }

    /**
     * 删除缓存
     * @param key 缓存 key
     */
    removeCache(key: string): void {
        delete this.cache[key];
    }

    /**
     * 清空所有缓存
     */
    clearAllCache(): void {
        this.cache = {};
    }

    // ----------- 文件读写 -------------

    /**
     * 手动保存缓存数据到文件
     * 
     */
    save(): void {
         this.saveCache();
    }

    /**
     * 加载缓存文件
     */
    private loadCache(): void {
        if (fs.existsSync(this.cacheFilePath)) {
            const fileData = fs.readFileSync(this.cacheFilePath, 'utf-8');
            try {
                const cachedData = JSON.parse(fileData);
                this.cache = cachedData;
            } catch (error) {
                 //console.error('Error parsing cache file:', error);
            }
        }
    }

    /**
     * 保存缓存数据到文件
     */
    private saveCache(): void {
        try {
            fs.writeFileSync(this.cacheFilePath, JSON.stringify(this.cache), 'utf-8');
             //console.log('Cache saved successfully.');
        } catch (error) {
             //console.error('Error saving cache file:', error);
        }
    }

    /**
     * 确保缓存目录存在，不存在则创建
     */
    private ensureCacheDir(): void {
        const dir = path.dirname(this.cacheFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    /**
     * 清理所有已过期的缓存条目
     */
    private cleanExpiredCache(): void {
        const now = Date.now();
        let hasExpired = false;

        for (const key in this.cache) {
            if (now - this.cache[key].timestamp >= this.cacheDuration) {
                delete this.cache[key];
                hasExpired = true;
            }
        }

        if (hasExpired) {
            this.saveCache(); // 保存清理后的缓存
        }
    }
}

export default CacheManager;
