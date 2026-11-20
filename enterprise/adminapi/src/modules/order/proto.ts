//订单模型结构体定义 - 基于数据库表字段

// 通用订单模型
export type OrderModel = {
  id?: number;
  order_no: string;
  entity_id: number;
  
  // 业务信息
  business_type: 'service' | 'product' | 'invoice' | 'member';
  business_id: string;
  provider_id?: number; // 服务商ID（提供服务的企业ID）
  business_title: string;
  business_data?: any;
  
  // 价格信息
  original_price: number;
  discount_price: number;
  actual_price: number;
  
  // 订单状态
  status: 1 | 2 | 3 | 4 | 5; // 1-待支付，2-已支付，3-已完成，4-已取消，5-已退款
  payment_status: 0 | 1 | 2; // 0-未支付，1-已支付，2-支付失败
  
  // 支付信息
  payment_method?: string;
  payment_time?: number;
  payment_order_no?: string;
  
  // 业务处理状态
  business_status: 0 | 1; // 0-未处理，1-已处理
  business_order_id?: string;
  
  // 其他信息
  invoice_id?: number;
  remark?: string;
  cancel_reason?: string;
  refund_reason?: string;
  refund_amount?: number;
  refund_time?: number;
  
  // 时间信息
  create_time?: number;
  update_time?: number;
};

// 订单日志模型
export type OrderLogModel = {
  id?: number;
  order_id: number;
  order_no: string;
  old_status?: number;
  new_status: number;
  action_type: 'create' | 'pay' | 'complete' | 'cancel' | 'refund' | 'ship' | 'return_agree' | 'return_refuse' | 'refund_agree' | 'refund_refuse';
  message?: string;
  operator_id?: number;
  operator_type: 1 | 2 | 3; // 1-用户，2-管理员，3-系统
  extra_data?: any;
  create_time?: number;
};


// 支付订单查询参数
export type OrderQueryParams = {
  entity_id?: number;
  provider_id?: number; // 服务商ID，用于查询服务商的订单
  business_type?: string;
  status?: number;
  payment_status?: number;
  start_date?: number;
  end_date?: number;
  current_page: number;
  page_size: number;
  // 基础搜索字段
  order_number?: string;
  username?: string;
};

// 支付参数
export type PaymentParams = {
  order_no: string;
  payment_method: string;
  payment_order_no: string;
  actual_price?: number;
  operator_id?: number;
};

// 退款参数
export type RefundParams = {
  order_no: string;
  refund_amount: number;
  refund_reason: string;
  operator_id: number;
};

// Redis 缓存订单模型（未支付订单）
export type CachedOrderModel = {
  order_no: string;
  entity_id: number;
  business_type: string;
  business_id: string;
  provider_id?: number; // 服务商ID（提供服务的企业ID）
  business_title: string;
  business_data?: any;
  original_price: number;
  discount_price: number;
  actual_price: number;
  remark?: string;
  create_time: number;
  expire_time: number; // 过期时间戳，默认30分钟
};


// 导出参数
export type ExportOrderParams = {
  entity_id?: number;
  provider_id?: number; // 服务商ID，用于导出服务商订单
  business_type?: string;
  status?: number;
  payment_status?: number;
  start_date?: number;
  end_date?: number;
  order_number?: string;
  username?: string;
};

