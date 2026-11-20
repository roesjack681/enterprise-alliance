import { body } from "express-validator";

// 创建需求表单验证
export const createDemandForm = [
  body("title").notEmpty().isLength({ max: 250 }),
  body("content").notEmpty(),
  body("type").isInt({ min: 1, max: 7 }),
  body("category_id").isInt({ min: 1 }),
  body("province").isInt({ min: 1 }),
  body("city").isInt({ min: 1 }),
  body("district").isInt({ min: 1 }),
  body("street").isInt({ min: 1 }),
  body("address").notEmpty().isLength({ max: 250 }),
  body("person").notEmpty().isLength({ max: 100 }),
  body("mobile").notEmpty().isLength({ max: 20 }),
  body("company_name").optional().isLength({ max: 100 }),
  body("images").optional().isJSON(),
  body("remark").optional().isLength({ max: 250 }),
  body("visibility").optional().isInt({ min: 1, max: 2 }),
  body("budget_price").optional().isFloat({ min: 0 }),
  body("status").optional().isInt({ min: 1, max: 3 }), // 需求状态（1:发布中 2:已完成 3:已取消）
];

// 更新需求表单验证
export const updateDemandForm = [
  body("id").isInt({ min: 1 }),
  body("title").optional().isLength({ max: 250 }),
  body("content").optional(),
  body("type").optional().isInt({ min: 1, max: 7 }),
  body("category_id").optional().isInt({ min: 1 }),
  body("province").optional().isInt({ min: 1 }),
  body("city").optional().isInt({ min: 1 }),
  body("district").optional().isInt({ min: 1 }),
  body("street").optional().isInt({ min: 1 }),
  body("address").optional().isLength({ max: 250 }),
  body("person").optional().isLength({ max: 100 }),
  body("mobile").optional().isLength({ max: 20 }),
  body("company_name").optional().isLength({ max: 100 }),
  body("images").optional().isJSON(),
  body("remark").optional().isLength({ max: 250 }),
  body("visibility").optional().isInt({ min: 1, max: 2 }),
  body("budget_price").optional().isFloat({ min: 0 }),
  body("status").optional().isInt({ min: 1, max: 3 }), // 需求状态（1:发布中 2:已完成 3:已取消）
];

// 需求查询表单验证
export const demandQueryForm = [
  body("page").isInt({ min: 1 }),
  body("page_size").isInt({ min: 1, max: 100 }),
  body("keyword").optional().isLength({ max: 100 }),
  body("status").optional().isInt({ min: 1, max: 3 }),
  body("type").optional(),
  body("category_id").optional().isInt({ min: 1 }),
  body("province").optional().isInt({ min: 1 }),
  body("city").optional().isInt({ min: 1 }),
  body("district").optional().isInt({ min: 1 }),
  body("user_id").optional().isInt({ min: 1 }),
  body("start_time").optional().isInt({ min: 0 }),
  body("end_time").optional().isInt({ min: 0 }),
  body("sort_by").optional().isIn(['create_time', 'title', 'status', 'type']),
  body("sort_order").optional().isIn(['asc', 'desc']),
];

// 需求详情表单验证
export const demandDetailForm = [
  body("id").isInt({ min: 1 }),
];

// 需求ID表单验证
export const demandIdForm = [
  body("id").isInt({ min: 1 }),
];

// 更新需求状态表单验证
export const updateDemandStatusForm = [
  body("id").isInt({ min: 1 }),
  body("status").isInt({ min: 1, max: 3 }),
  body("remark").optional().isLength({ max: 250 }),
];