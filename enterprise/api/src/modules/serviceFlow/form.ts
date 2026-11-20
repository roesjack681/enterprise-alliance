import { body } from "express-validator";

// 创建服务订单表单验证
export const createOrderForm = [
  body("service_id").notEmpty(),
  body("provider_id").optional().isInt({ min: 1 }),
  body("service_type").isIn(['one_time', 'recurring']),
  body("start_date").isInt({ min: 1 }),
  body("price").isFloat({ min: 0 }),
  body("cycle_months").optional().isInt({ min: 1 })
];

// 查询订单列表表单验证
export const queryOrderForm = [
  body("provider_id").optional().isInt({ min: 1 }),
  body("current_page").isInt({ min: 1 }),
  body("page_size").isInt({ min: 1, max: 100 })
];

// 流程推进表单验证
export const advanceProcessForm = [
  body("order_id").notEmpty(),
  body("current_step").notEmpty(),
  body("remarks").optional().isString()
];

// 上传附件表单验证
export const uploadAttachmentForm = [
  body("order_id").notEmpty(),
  body("step").notEmpty(),
  body("file_urls").isArray()
];

// 订单详情表单验证
export const orderDetailForm = [
  body("order_id").notEmpty()
];

// 取消订单表单验证
export const cancelOrderForm = [
  body("order_id").notEmpty(),
  body("reason").optional().isString()
];

// 暂停/恢复订单表单验证
export const pauseResumeOrderForm = [
  body("order_id").notEmpty(),
  body("action").isIn(['pause', 'resume']),
  body("reason").optional().isString()
];

// 获取流程模板表单验证
export const getProcessTemplateForm = [
  body("service_id").notEmpty()
];

// 手动创建流程实例表单验证
