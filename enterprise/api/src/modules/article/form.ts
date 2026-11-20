import { body } from 'express-validator';

// 获取文章列表表单验证
export const getArticleListForm = [
  body("category_id").optional().isInt({ min: 1 })
];

