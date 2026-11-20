import {body} from "express-validator";

// 添加/编辑分类表单
export const setCategoryForm = [
  body("id").optional(),
  body("name").notEmpty(),
  body("status").optional().isInt({min: 0, max: 1})
]

// 设置分类状态表单
export const setCategoryStatusForm = [
  body("id").notEmpty(),
  body("status").isInt({min: 0, max: 1})
]

// 添加文章表单
export const addArticleForm = [
  body("type").notEmpty(),
  body("name").notEmpty(),
  body("content").optional(),
  body("status").optional().isInt({min: 0, max: 1})
]

// 更新文章表单
export const updateArticleForm = [
  body("id").notEmpty(),
  body("type").notEmpty(),
  body("name").notEmpty(),
  body("content").optional(),
  body("status").optional().isInt({min: 0, max: 1})
]

// 设置文章状态表单
export const setStatusForm = [
  body("id").notEmpty(),
  body("status").isInt({min: 0, max: 1})
]

// 删除文章表单
export const deleteArticleForm = [
  body("id").notEmpty()
]

// 删除分类表单
export const deleteCategoryForm = [
  body("id").notEmpty()
]

