import { body } from "express-validator";

// 创建订单表单验证
export const createOrderForm = [
  // 业务信息
  body("business_id").notEmpty().isLength({ min: 1, max: 64 }),
  body("business_type").optional().isLength({ min: 1, max: 50 }),
  body("business_title").optional().isLength({ min: 1, max: 255 }),
  body("business_data").optional(),
  
  // 价格信息
  body("actual_price").isFloat({ min: 0.01 }),
  body("original_price").optional().isFloat({ min: 0 }),
  body("discount_price").optional().isFloat({ min: 0 }),
  
  // 其他信息
  body("invoice_id").optional().isInt({ min: 1 }),
  body("remark").optional().isLength({ max: 500 })
];

// 获取订单详情表单验证
export const getOrderDetailForm = [
  body("id").isInt({ min: 1 })
];

// 订单列表查询表单验证
export const getOrderListForm = [
  body("entity_id").optional().isInt({ min: 1 }),
  body("business_type").optional().isLength({ max: 50 }),
  body("business_id").optional().isLength({ max: 64 }),
  body("status").optional().isInt({ min: 1, max: 5 }),
  body("payment_status").optional().isInt({ min: 0, max: 2 }),
  body("business_status").optional().isInt({ min: 0, max: 1 }),
  body("start_date").optional().isInt({ min: 0 }),
  body("end_date").optional().isInt({ min: 0 }),
  body("page").optional().isInt({ min: 1 }),
  body("page_size").optional().isInt({ min: 1, max: 100 })
];

// 更新订单状态表单验证
export const updateOrderStatusForm = [
  body("id").isInt({ min: 1 }),
  body("status").optional().isInt({ min: 1, max: 5 }),
  body("payment_status").optional().isInt({ min: 0, max: 2 }),
  body("payment_method").optional().isLength({ max: 50 }),
  body("payment_order_no").optional().isLength({ max: 128 }),
  body("business_status").optional().isInt({ min: 0, max: 1 }),
  body("business_order_id").optional().isLength({ max: 64 }),
  body("cancel_reason").optional().isLength({ max: 500 }),
  body("refund_reason").optional().isLength({ max: 500 }),
  body("refund_amount").optional().isFloat({ min: 0 })
];

// 处理支付成功表单验证
export const processPaymentSuccessForm = [
  body("order_no").notEmpty().isLength({ min: 1, max: 64 }),
  body("payment_data").isObject(),
  body("payment_data.payment_method").notEmpty().isLength({ max: 50 }),
  body("payment_data.payment_order_no").optional().isLength({ max: 128 })
];

// 确认订单表单验证
export const confirmOrderForm = [
  body("order_no").notEmpty().isLength({ min: 1, max: 64 }),
  body("payment_data").isObject(),
  body("payment_data.payment_method").notEmpty().isLength({ max: 50 }),
  body("payment_data.payment_order_no").optional().isLength({ max: 128 })
];

// 根据订单号获取订单表单验证
export const getOrderByNoForm = [
  body("order_no").notEmpty().isLength({ min: 1, max: 64 })
];

// 创建业务订单表单验证
export const createBusinessOrderForm = [
  body("order_id").isInt({ min: 1 })
];

// 更新订单支付方式表单验证
export const updatePaymentMethodForm = [
  body("order_no").notEmpty().isLength({ min: 1, max: 64 }),
  body("payment_method").notEmpty().isIn(['wechat', 'alipay', 'bank_transfer'])
];

// 取消订单表单验证
export const cancelOrderForm = [
  body("id").isInt({ min: 1 }),
  body("reason").notEmpty().isLength({ max: 500 })
];

// 获取订单日志表单验证
export const getOrderLogsForm = [
  body("order_id").isInt({ min: 1 })
];

// 获取服务商订单统计表单验证
export const getProviderOrderStatsForm = [];

// 获取服务商订单列表表单验证
export const getProviderOrderListForm = [
  body("page").optional().isInt({ min: 1 }),
  body("page_size").optional().isInt({ min: 1, max: 100 }),
  body("status").optional().isInt({ min: 1, max: 5 }),
  body("business_type").optional().isString(),
  body("start_date").optional().isInt({ min: 0 }),
  body("end_date").optional().isInt({ min: 0 })
]; 