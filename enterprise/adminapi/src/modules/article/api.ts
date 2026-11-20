import {Request, Response} from "express";
import * as service from "./service";
import {http400Error, httpSuccess} from "../../common/common";
import {articleCategoryModel, articleModel} from "./proto";

// 获取分类列表
export const getCategoryList = async (req: Request, res: Response) => {
  try {
    const result = await service.getCategoryList()
    return httpSuccess(res, result, '获取成功')
  } catch (error: any) {
    return http400Error(res, error.message || '获取失败')
  }
}

// 添加/编辑分类
export const setCategory = async (req: Request, res: Response) => {
  let id: any = req.body.id
  let name: string = req.body.name
  let status: number = req.body.status
  
  const data: articleCategoryModel = {
    id: 0,
    name: name,
    status: status
  }
  
  try {
    let result: any
    if (id) {
      // 编辑
      result = await service.updateCategory(id, data)
      if (result) {
        return httpSuccess(res, null, '更新成功')
      } else {
        return http400Error(res, '更新失败')
      }
    } else {
      // 添加
      result = await service.addCategory(data)
      if (result) {
        return httpSuccess(res, { id: result }, '添加成功')
      } else {
        return http400Error(res, '添加失败')
      }
    }
  } catch (error: any) {
    return http400Error(res, error.message || '操作失败')
  }
}

// 设置分类状态
export const setCategoryStatus = async (req: Request, res: Response) => {
  let id: any = req.body.id
  let status: number = req.body.status
  
  try {
    const result = await service.setCategoryStatus(id, status)
    if (result) {
      return httpSuccess(res, { updated: 1 }, '状态更新成功')
    } else {
      return http400Error(res, '状态更新失败')
    }
  } catch (error: any) {
    return http400Error(res, error.message || '状态更新失败')
  }
}

// 删除分类
export const deleteCategory = async (req: Request, res: Response) => {
  let id: any = req.body.id
  
  try {
    const result = await service.deleteCategory(id)
    if (result) {
      return httpSuccess(res, { status: 1 }, '删除成功')
    } else {
      return http400Error(res, '删除失败')
    }
  } catch (error: any) {
    return http400Error(res, error.message || '删除失败')
  }
}

// 获取文章列表
export const getList = async (req: Request, res: Response) => {
  try {
    const result = await service.getArticleList()
    return httpSuccess(res, result, '获取成功')
  } catch (error: any) {
    return http400Error(res, error.message || '获取失败')
  }
}

// 添加文章
export const addArticle = async (req: Request, res: Response) => {
  let type: number = req.body.type
  let name: string = req.body.name
  let content: string = req.body.content
  let status: number = req.body.status
  
  const data: articleModel = {
    id: 0,
    type: type,
    name: name,
    content: content,
    status: status
  }
  
  try {
    const result = await service.addArticle(data)
    if (result) {
      return httpSuccess(res, { status: 1, msg: '添加成功' }, '添加成功')
    } else {
      return http400Error(res, '添加失败')
    }
  } catch (error: any) {
    return http400Error(res, error.message || '添加失败')
  }
}

// 更新文章
export const updateArticle = async (req: Request, res: Response) => {
  let id: any = req.body.id
  let type: number = req.body.type
  let name: string = req.body.name
  let content: string = req.body.content
  let status: number = req.body.status
  
  const data: articleModel = {
    id: 0,
    type: type,
    name: name,
    content: content,
    status: status
  }
  
  try {
    const result = await service.updateArticle(id, data)
    if (result) {
      return httpSuccess(res, { status: 1, msg: '更新成功' }, '更新成功')
    } else {
      return http400Error(res, '更新失败')
    }
  } catch (error: any) {
    return http400Error(res, error.message || '更新失败')
  }
}

// 设置文章状态
export const setStatus = async (req: Request, res: Response) => {
  let id: any = req.body.id
  let status: number = req.body.status
  
  try {
    const result = await service.setArticleStatus(id, status)
    if (result) {
      return httpSuccess(res, { updated: 1 }, '状态更新成功')
    } else {
      return http400Error(res, '状态更新失败')
    }
  } catch (error: any) {
    return http400Error(res, error.message || '状态更新失败')
  }
}

// 删除文章
export const deleteArticle = async (req: Request, res: Response) => {
  let id: any = req.body.id
  
  try {
    const result = await service.deleteArticle(id)
    if (result) {
      return httpSuccess(res, { status: 1 }, '删除成功')
    } else {
      return http400Error(res, '删除失败')
    }
  } catch (error: any) {
    return http400Error(res, error.message || '删除失败')
  }
}

