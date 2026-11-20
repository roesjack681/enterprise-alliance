import {Request, Response} from "express";
import * as service from "./service";
import {http400Error, httpSuccess} from "../../common/common";
import {categoryModel} from "./proto";

// 添加分类
export const categoryAdd = async (req: Request, res: Response) => {
    let name: string = req.body.name
    let icon: string = req.body.icon
    let sort: number = req.body.sort || 0
    let pid: number = req.body.pid || 0
    let status: number = req.body.status || 1
    let remark: string = req.body.remark || ''
    
    const data: categoryModel = {
        id: 0,
        name: name,
        icon: icon,
        sort: sort,
        pid: pid,
        status: status,
        remark: remark
    }
    
    try {
        const result = await service.categoryAdd(data)
        if (result) {
            return httpSuccess(res, { id: result }, '添加成功')
        } else {
            return http400Error(res, '添加失败')
        }
    } catch (error: any) {
        return http400Error(res, error.message || '添加失败')
    }
}

// 更新分类
export const categoryUpdate = async (req: Request, res: Response) => {
    let id: number = req.body.id
    let name: string = req.body.name
    let icon: string = req.body.icon
    let sort: number = req.body.sort || 0
    let pid: number = req.body.pid || 0
    let status: number = req.body.status || 1
    let remark: string = req.body.remark || ''
    
    const data: categoryModel = {
        id: id,
        name: name,
        icon: icon,
        sort: sort,
        pid: pid,
        status: status,
        remark: remark
    }
    
    try {
        const result = await service.categoryUpdate(data)
        if (result) {
            return httpSuccess(res, null, '更新成功')
        } else {
            return http400Error(res, '更新失败')
        }
    } catch (error: any) {
        return http400Error(res, error.message || '更新失败')
    }
}

// 设置状态
export const setStatus = async (req: Request, res: Response) => {
    let id: number = req.body.id
    let status: number = req.body.status
    
    try {
        const result = await service.setStatus(id, status)
        if (result) {
            return httpSuccess(res, null, '状态更新成功')
        } else {
            return http400Error(res, '状态更新失败')
        }
    } catch (error: any) {
        return http400Error(res, error.message || '状态更新失败')
    }
}

// 删除分类
export const categoryDel = async (req: Request, res: Response) => {
    let id: number = req.body.id
    
    try {
        const result = await service.categoryDel(id)
        if (result) {
            return httpSuccess(res, null, '删除成功')
        } else {
            return http400Error(res, '删除失败')
        }
    } catch (error: any) {
        return http400Error(res, error.message || '删除失败')
    }
}

// 获取分类详情
export const categoryDetail = async (req: Request, res: Response) => {
    let id: number = req.body.id
    
    try {
        const result = await service.categoryDetail(id)
        if (result) {
            return httpSuccess(res, result, '获取成功')
        } else {
            return http400Error(res, '分类不存在')
        }
    } catch (error: any) {
        return http400Error(res, error.message || '获取失败')
    }
}

// 获取分类列表
export const categoryList = async (req: Request, res: Response) => {
    try {
        const result = await service.categoryList()
        return httpSuccess(res, result, '获取成功')
    } catch (error: any) {
        return http400Error(res, error.message || '获取失败')
    }
}

// 获取分类列表（分页）
export const categoryListPage = async (req: Request, res: Response) => {
    let currentPage: number = req.body.current_page || 1
    let pageSize: number = req.body.page_size || 20
    
    try {
        const [list, total] = await Promise.all([
            service.categoryListPage(currentPage, pageSize),
            service.categoryCount()
        ])
        
        return httpSuccess(res, {
            list: list,
            total: total,
            current_page: currentPage,
            page_size: pageSize,
            total_pages: Math.ceil(total / pageSize)
        }, '获取成功')
    } catch (error: any) {
        return http400Error(res, error.message || '获取失败')
    }
}

// 获取父级分类列表
export const getParentCategories = async (req: Request, res: Response) => {
    try {
        const result = await service.getParentCategories()
        return httpSuccess(res, result, '获取成功')
    } catch (error: any) {
        return http400Error(res, error.message || '获取失败')
    }
}

// 根据父级ID获取子分类
export const getChildCategories = async (req: Request, res: Response) => {
    let pid: number = req.body.pid || 0
    
    try {
        const result = await service.getChildCategories(pid)
        return httpSuccess(res, result, '获取成功')
    } catch (error: any) {
        return http400Error(res, error.message || '获取失败')
    }
}

// 获取分类树结构
export const getCategoryTree = async (req: Request, res: Response) => {
    try {
        const result = await service.buildCategoryTree()
        return httpSuccess(res, result, '获取成功')
    } catch (error: any) {
        return http400Error(res, error.message || '获取失败')
    }
}

// 获取启用状态的分类树
export const getActiveCategoryTree = async (req: Request, res: Response) => {
    try {
        const result = await service.getActiveCategoryTree()
        return httpSuccess(res, result, '获取成功')
    } catch (error: any) {
        return http400Error(res, error.message || '获取失败')
    }
} 