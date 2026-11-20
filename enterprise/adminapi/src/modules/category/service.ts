import * as repository from "./repository";
import {categoryModel, categoryTreeModel} from "./proto";

// 添加分类
export const categoryAdd = async (data: categoryModel): Promise<any> => {
    return await repository.categoryAdd(data)
}

// 更新分类
export const categoryUpdate = async (data: categoryModel): Promise<any> => {
    return await repository.categoryUpdate(data)
}

// 设置状态
export const setStatus = async (id: number, status: number): Promise<any> => {
    return await repository.setStatus(id, status)
}

// 删除分类
export const categoryDel = async (id: number): Promise<any> => {
    return await repository.categoryDel(id)
}

// 获取分类详情
export const categoryDetail = async (id: number): Promise<categoryModel> => {
    const data: categoryModel|null = await repository.categoryDetail(id) as categoryModel;
    return data
}

// 获取分类列表
export const categoryList = async (): Promise<any> => {
    const data: any = await repository.categoryList()
    return data
}

// 获取分类列表（分页）
export const categoryListPage = async (currentPage: number, pageSize: number): Promise<any> => {
    const data: any = await repository.categoryListPage(currentPage, pageSize)
    return data
}

// 获取分类总数
export const categoryCount = async (): Promise<number> => {
    return await repository.categoryCount()
}

// 获取父级分类列表
export const getParentCategories = async (): Promise<any> => {
    const data: any = await repository.getParentCategories()
    return data
}

// 根据父级ID获取子分类
export const getChildCategories = async (pid: number): Promise<any> => {
    const data: any = await repository.getChildCategories(pid)
    return data
}

// 构建分类树结构
export const buildCategoryTree = async (): Promise<categoryTreeModel[]> => {
    const allCategories = await repository.categoryList()
    const tree: categoryTreeModel[] = []
    
    // 创建映射表
    const categoryMap = new Map()
    allCategories.forEach((category: categoryModel) => {
        categoryMap.set(category.id, {
            ...category,
            children: []
        })
    })
    
    // 构建树结构
    allCategories.forEach((category: categoryModel) => {
        const node = categoryMap.get(category.id)
        if (category.pid === 0) {
            // 根节点
            tree.push(node)
        } else {
            // 子节点
            const parent = categoryMap.get(category.pid)
            if (parent) {
                parent.children.push(node)
            }
        }
    })
    
    return tree
}

// 获取启用状态的分类树
export const getActiveCategoryTree = async (): Promise<categoryTreeModel[]> => {
    const allCategories = await repository.categoryList()
    const activeCategories = allCategories.filter((category: categoryModel) => category.status === 1)
    const tree: categoryTreeModel[] = []
    
    // 创建映射表
    const categoryMap = new Map()
    activeCategories.forEach((category: categoryModel) => {
        categoryMap.set(category.id, {
            ...category,
            children: []
        })
    })
    
    // 构建树结构
    activeCategories.forEach((category: categoryModel) => {
        const node = categoryMap.get(category.id)
        if (category.pid === 0) {
            // 根节点
            tree.push(node)
        } else {
            // 子节点
            const parent = categoryMap.get(category.pid)
            if (parent) {
                parent.children.push(node)
            }
        }
    })
    
    return tree
} 