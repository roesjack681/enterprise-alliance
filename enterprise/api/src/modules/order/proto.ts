// 订单创建数据模型
export type OrderCreateModel = {
  // 业务信息
  business_type?: string; // 业务类型，默认'service'
  business_id: string; // 业务ID（必需）
  business_title?: string; // 业务标题，可选，会自动获取
  business_data?: any; // 业务扩展数据
  provider_id?: number; // 服务商ID（提供服务的企业ID）
  
  // 价格信息
  actual_price: number; // 实付金额（必需）
  original_price?: number; // 原价（可选，会自动获取）
  discount_price?: number; // 优惠金额
  
  // 其他信息
  remark?: string; // 订单备注
  invoice_id?: number; // 发票ID
};

// 订单详情模型
export type OrderModel = {
  id?: number;
  order_no?: string;
  entity_id?: number; // 用户ID（企业ID）
  business_type?: string;
  business_id?: string;
  business_title?: string;
  business_data?: any;
  provider_id?: number; // 服务商ID（提供服务的企业ID）
  original_price?: number;
  discount_price?: number;
  actual_price: number;
  status?: number; // 1-待支付，2-已支付，3-已完成，4-已取消，5-已退款
  payment_status?: number; // 0-未支付，1-已支付，2-支付失败
  payment_method?: string;
  payment_time?: number;
  payment_order_no?: string;
  business_status?: number; // 0-未处理，1-已处理
  business_order_id?: string;
  invoice_id?: number;
  remark?: string;
  cancel_reason?: string;
  refund_reason?: string;
  refund_amount?: number;
  refund_time?: number;
  create_time?: number;
  update_time?: number;
};

// 订单查询模型
export type OrderQueryModel = {
  entity_id?: number;
  user_id?: number;
  provider_id?: number; // 服务商ID，用于查询服务商的订单
  business_type?: string;
  business_id?: string;
  status?: number;
  payment_status?: number;
  business_status?: number;
  start_date?: number;
  end_date?: number;
  page?: number;
  page_size?: number;
};

// 订单状态更新模型
export type OrderStatusUpdateModel = {
  id: number;
  status?: number;
  payment_status?: number;
  payment_method?: string;
  payment_order_no?: string;
  business_status?: number;
  business_order_id?: string;
  cancel_reason?: string;
  refund_reason?: string;
  refund_amount?: number;
};

// 订单日志模型
export type OrderLogModel = {
  id?: number;
  order_id: number;
  order_no: string;
  old_status?: number;
  new_status: number;
  action_type: string; // create,pay,complete,cancel,refund
  message?: string;
  operator_id?: number;
  operator_type?: number; // 1-用户，2-管理员，3-系统
  extra_data?: any;
  create_time?: number;
}; 