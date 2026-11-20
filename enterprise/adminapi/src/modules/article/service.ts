import * as repository from "./repository";
import {articleCategoryModel, articleModel} from "./proto";

// 获取分类列表
export const getCategoryList = async (): Promise<any> => {
  const data: any = await repository.getCategoryList()
  return data
}

// 添加分类
export const addCategory = async (data: articleCategoryModel): Promise<any> => {
  return await repository.addCategory(data)
}

// 更新分类
export const updateCategory = async (id: number, data: articleCategoryModel): Promise<any> => {
  return await repository.updateCategory(id, data)
}

// 设置分类状态
export const setCategoryStatus = async (id: number, status: number): Promise<any> => {
  return await repository.setCategoryStatus(id, status)
}

// 获取文章列表
export const getArticleList = async (): Promise<any> => {
  const data: any = await repository.getArticleList()
  return data
}

// 添加文章
export const addArticle = async (data: articleModel): Promise<any> => {
  return await repository.addArticle(data)
}

// 更新文章
export const updateArticle = async (id: number, data: articleModel): Promise<any> => {
  return await repository.updateArticle(id, data)
}

// 设置文章状态
export const setArticleStatus = async (id: number, status: number): Promise<any> => {
  return await repository.setArticleStatus(id, status)
}

// 删除文章
export const deleteArticle = async (id: number): Promise<any> => {
  return await repository.deleteArticle(id)
}

// 删除分类
export const deleteCategory = async (id: number): Promise<any> => {
  return await repository.deleteCategory(id)
}
