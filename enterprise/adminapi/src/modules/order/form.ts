import { body } from "express-validator";


// 处理支付验证
export const processPaymentForm = [
  body("order_no").notEmpty().isString(),
  body("payment_method").notEmpty().isString(),
  body("payment_order_no").notEmpty().isString(),
  body("actual_price").optional().isFloat({ min: 0 })
];

// 查询支付订单列表验证
export const queryOrderListForm = [
  body("entity_id").optional().isInt({ min: 1 }),
  body("provider_id").optional().isInt({ min: 1 }),
  body("business_type").optional().isIn(['service', 'product', 'invoice', 'member']),
  body("status").optional().isInt({ min: 1, max: 5 }),
  body("payment_status").optional().isInt({ min: 0, max: 2 }),
  body("start_date").optional().isInt({ min: 0 }),
  body("end_date").optional().isInt({ min: 0 }),
  body("current_page").optional().isInt({ min: 1 }),
  body("page_size").optional().isInt({ min: 1, max: 100 }),
  body("limit").optional().isInt({ min: 1, max: 100 }),
  body("offset").optional().isInt({ min: 0 }),
  // 基础搜索字段
  body("order_number").optional().isString(),
  body("username").optional().isString()
];

// 获取订单详情验证
export const getOrderDetailForm = [
  body("order_no").notEmpty().isString()
];

// 取消订单验证
export const cancelOrderForm = [
  body("order_no").notEmpty().isString(),
  body("reason").notEmpty().isString()
];

// 处理退款验证
export const processRefundForm = [
  body("order_no").notEmpty().isString(),
  body("refund_amount").isFloat({ min: 0 }),
  body("refund_reason").notEmpty().isString()
];

// 更新订单状态验证
export const updateOrderStatusForm = [
  body("order_no").notEmpty().isString(),
  body("status").isInt({ min: 1, max: 5 }),
  body("message").optional().isString()
];

// 获取订单统计验证
export const getOrderStatisticsForm = [
  body("entity_id").optional().isInt({ min: 1 }),
  body("business_type").optional().isIn(['service', 'product', 'invoice', 'member'])
];

// 清理过期缓存订单验证（无需参数）
export const cleanExpiredCachedOrdersForm = [];

// 批量更新业务状态验证
export const batchUpdateBusinessStatusForm = [
  body("order_nos").isArray().notEmpty(),
  body("order_nos.*").isString(),
  body("business_status").isInt({ min: 0, max: 1 })
];

// 获取订单日志验证
export const getOrderLogsForm = [
  body("order_no").notEmpty().isString(),
  body("current_page").optional().isInt({ min: 1 }),
  body("page_size").optional().isInt({ min: 1, max: 100 })
];


// 导出订单验证
export const exportOrderExcelForm = [
  body("entity_id").optional().isInt({ min: 1 }),
  body("business_type").optional().isIn(['service', 'product', 'invoice', 'member']),
  body("status").optional().isInt({ min: 0, max: 15 }),
  body("payment_status").optional().isInt({ min: 0, max: 3 }),
  body("start_date").optional().isInt({ min: 0 }),
  body("end_date").optional().isInt({ min: 0 }),
  body("order_number").optional().isString(),
  body("username").optional().isString()
];

// 确认订单处理验证
export const confirmOrderProcessForm = [
  body("order_no").notEmpty().isString(),
  body("operator_id").optional().isInt({ min: 0 })
];