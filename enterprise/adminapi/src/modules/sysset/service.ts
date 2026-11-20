import * as repository from "./repository";
import {sysSetModel} from "./proto";

// 按IDs获取系统配置
export const getByIds = async (ids: number[]): Promise<sysSetModel[]> => {
    return await repository.getByIds(ids);
}

// 编辑系统配置
export const updateSysSet = async (id: number, data: Partial<sysSetModel>): Promise<any> => {
    // 直接更新配置（配置预先已存在）
    const affectedRows = await repository.updateSysSet(id, data); 
    if (affectedRows > 0) {
        return { success: true, message: '配置更新成功' };
    } else {
        return { success: false, message: '配置更新失败' };
    }
}

// 获取单个配置
export const getById = async (id: number): Promise<sysSetModel | null> => {
    return await repository.getById(id);
}