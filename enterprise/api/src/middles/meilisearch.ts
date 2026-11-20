// meili.ts
import { MeiliSearch, Index } from 'meilisearch';

export interface IndexDocument {
  id: number | string;
  [key: string]: any;
}

export class MeiliService<T extends IndexDocument> {
  private client: MeiliSearch;
  private indexName: string;
  private indexObj: Index<T>;

  constructor(indexName: string, host = process.env.MEILI_HOST || 'http://127.0.0.1:7700', apiKey = process.env.MEILI_MASTER_KEY || '') {
    this.indexName = indexName;
    const options = { host, apiKey };
    this.client = new MeiliSearch(options);
    this.indexObj = this.client.index<T>(indexName);
  }

  // 创建索引
  async createIndex(primaryKey?: keyof T) {
    try {
      await this.client.createIndex(this.indexName, { primaryKey: primaryKey as string });
      //console.log(`索引 ${this.indexName} 创建成功`);
    } catch (err: any) {
      if (err.code === 'index_already_exists') {
        //console.log(`索引 ${this.indexName} 已存在`);
      } else {
        throw err;
      }
    }
  }

  // 添加文档
  async addDocuments(documents: T[]) {
    return this.indexObj.addDocuments(documents);
  }

  // 更新文档
  async updateDocuments(documents: T[]) {
    return this.indexObj.updateDocuments(documents);
  }

  // 删除文档
  async deleteDocuments(ids: string[]) {
    return this.indexObj.deleteDocuments(ids);
  }

  // 搜索
  async search(query: string, options?: { limit?: number; offset?: number }) {
    const defaultOptions = {
      limit: 1000, // Meilisearch 默认最大值10000，返回所有匹配结果
      offset: 0,
      ...options
    };
    return this.indexObj.search(query, defaultOptions);
  } 
  //指定索引字段
  async setSearchableFields(fields: string[]) {
    return this.indexObj.updateSearchableAttributes(fields);
  }
  //指定过滤字段
  async setFilterableFields(fields: string[]) {
    return this.indexObj.updateFilterableAttributes(fields);
  }
}
