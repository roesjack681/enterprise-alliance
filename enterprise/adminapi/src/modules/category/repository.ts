import {sequelize} from "../../storage/mysql";
import {QueryTypes} from "sequelize";
import {categoryModel, categoryTreeModel} from "./proto";

// 添加分类
export const categoryAdd = async (data: categoryModel): Promise<number|null> => {
    let sql: string = `INSERT INTO category (name, icon, sort, pid, status, remark)
                        VALUES (:name, :icon, :sort, :pid, :status, :remark);`

    const [id, rows] = await sequelize.query(sql, {
        replacements: {
            name: data.name,
            icon: data.icon,
            sort: data.sort,
            pid: data.pid,
            status: data.status,
            remark: data.remark || ''
        },
        type: QueryTypes.INSERT,
        plain: true
    })
    
    if (1 == rows) {
        return id
    } else {
        return null
    }
}

// 更新分类
export const categoryUpdate = async (data: categoryModel): Promise<any> => {
    let sql: string = `UPDATE category
                        SET name = :name, icon = :icon, sort = :sort, pid = :pid, 
                            status = :status, remark = :remark
                        WHERE id = :id;`

    const [id, rows] = await sequelize.query(sql, {
        replacements: {
            id: data.id,
            name: data.name,
            icon: data.icon,
            sort: data.sort,
            pid: data.pid,
            status: data.status,
            remark: data.remark || ''
        },
        type: QueryTypes.UPDATE,
        plain: true
    })
    
    if (1 == rows) {
        return rows
    } else {
        return null
    }
}

// 设置状态
export const setStatus = async (id: number, status: number): Promise<any> => {
    let sql: string = `UPDATE category SET status = :status WHERE id = :id;`

    const [rows] = await sequelize.query(sql, {
        replacements: {
            id: id,
            status: status
        },
        type: QueryTypes.UPDATE,
        plain: true
    })
    return 1;
}

// 删除分类
export const categoryDel = async (id: number): Promise<any> => {
    // 检查是否有子分类
    const hasChildren = await sequelize.query(`SELECT COUNT(*) as count FROM category WHERE pid = :id`, {
        replacements: { id: id },
        type: QueryTypes.SELECT,
        plain: true
    }) as any
    
    if (hasChildren.count > 0) {
        throw new Error("该分类下有子分类，无法删除")
    }
    
    let sql: string = `DELETE FROM category WHERE id = :id;`
    const res = await sequelize.query(sql, {
        replacements: { id: id },
        type: QueryTypes.DELETE
    })
    return true;
}

// 获取分类详情
export const categoryDetail = async (id: number): Promise<categoryModel|null> => {
    let sql: string = `SELECT id, name, icon, sort, pid, status, remark
                        FROM category WHERE id = :id;`
    
    const res: categoryModel|null = await sequelize.query<categoryModel>(sql, {
        replacements: { id: id },
        type: QueryTypes.SELECT,
        plain: true
    })
    return res;
}

// 获取分类列表
export const categoryList = async (): Promise<any> => {
    let sql: string = `SELECT id, name, icon, sort, pid, status, remark
                        FROM category ORDER BY sort ASC, id ASC;`
    
    const res: any = await sequelize.query(sql, {
        type: QueryTypes.SELECT
    })
    return res;
}

// 获取分类列表（分页）
export const categoryListPage = async (currentPage: number, pageSize: number): Promise<any> => {
    let sql: string = `SELECT id, name, icon, sort, pid, status, remark
                        FROM category ORDER BY sort ASC, id ASC LIMIT :start, :end;`
    
    const res: any = await sequelize.query(sql, {
        replacements: {
            start: (currentPage - 1) * pageSize,
            end: pageSize
        },
        type: QueryTypes.SELECT
    })
    return res;
}

// 获取分类总数
export const categoryCount = async (): Promise<number> => {
    let sql: string = `SELECT COUNT(*) as count FROM category;`
    
    const res: any = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        plain: true
    })
    return res.count;
}

// 获取父级分类列表（pid=0的分类）
export const getParentCategories = async (): Promise<any> => {
    let sql: string = `SELECT id, name, icon, sort, pid, status, remark
                        FROM category WHERE pid = 0 AND status = 1 ORDER BY sort ASC, id ASC;`
    
    const res: any = await sequelize.query(sql, {
        type: QueryTypes.SELECT
    })
    return res;
}

// 根据父级ID获取子分类
export const getChildCategories = async (pid: number): Promise<any> => {
    let sql: string = `SELECT id, name, icon, sort, pid, status, remark
                        FROM category WHERE pid = :pid AND status = 1 ORDER BY sort ASC, id ASC;`
    
    const res: any = await sequelize.query(sql, {
        replacements: { pid: pid },
        type: QueryTypes.SELECT
    })
    return res;
} 