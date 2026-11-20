import {sequelize} from "../../storage/mysql";
import {QueryTypes} from "sequelize";
import {sysSetModel} from "./proto";

// 按IDs获取系统配置
export const getByIds = async (ids: number[]): Promise<sysSetModel[]> => {
    const sql = "SELECT id, title, json, status FROM system_config WHERE id IN (:ids) AND status = 1";
    
    const res: sysSetModel[] = await sequelize.query<sysSetModel>(sql, {
        replacements: {
            ids: ids
        },
        type: QueryTypes.SELECT
    });
    
    return res;
}

// 编辑系统配置
export const updateSysSet = async (id: number, data: Partial<sysSetModel>): Promise<number> => {
    const sql = "UPDATE system_config SET title = :title, json = :json, status = :status WHERE id = :id";
    
    await sequelize.query(sql, {
        replacements: {
            id: id,
            title: data.title,
            json: data.json,
            status: data.status
        },
        type: QueryTypes.UPDATE
    });
    
    return 1;
}


// 获取单个配置
export const getById = async (id: number): Promise<sysSetModel | null> => {
    const sql = "SELECT id, title, json, status FROM system_config WHERE id = :id";
    
    const res: sysSetModel | null = await sequelize.query<sysSetModel>(sql, {
        replacements: {
            id: id
        },
        type: QueryTypes.SELECT,
        plain: true
    });
    
    return res;
}