// ======================== 微信服务类型定义 ========================

/**
 * 通用响应数据类型
 */
export type ResponseData<T = any> = {
  code: number;
  msg: string;
  data?: T;
};

/**
 * 微信API通用响应（包含错误信息）
 */
export type WxApiResponse<T = any> = T & {
  errcode?: number;
  errmsg?: string;
};

// ======================== 微信支付相关类型 ========================

/**
 * 微信支付令牌数据
 */
export type WxPayTokenData = {
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
};

/**
 * 统一下单响应数据
 */
export type UnifiedOrderResponse = WxPayTokenData & {
  orderNo: string;
};

/**
 * 待支付订单数据（Redis缓存）
 */
export type PendingOrderData = {
  order_no: string;
  userOrderId: string;
  systemOrderId: string;
  userId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  payStartTime: Date;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * 微信支付V2统一下单请求数据
 */
export type WxPayV2UnifiedOrderData = {
  appid: string;
  mch_id: string;
  nonce_str: string;
  body: string;
  out_trade_no: string;
  total_fee: number;
  spbill_create_ip: string;
  notify_url: string;
  trade_type: string;
  openid: string;
  sign?: string;
};

/**
 * 微信支付V2统一下单响应数据
 */
export type WxPayV2UnifiedOrderResponse = {
  return_code: string;
  return_msg?: string;
  result_code: string;
  err_code?: string;
  err_code_des?: string;
  prepay_id?: string;
  code_url?: string;
  sign?: string;
  [key: string]: any;
};

/**
 * 微信支付V2回调数据
 */
export type WxPaymentCallbackData = {
  return_code: string;
  return_msg?: string;
  result_code: string;
  err_code?: string;
  err_code_des?: string;
  appid: string;
  mch_id: string;
  nonce_str: string;
  out_trade_no: string;
  transaction_id: string;
  trade_type: string;
  bank_type?: string;
  total_fee: string;
  cash_fee: string;
  time_end: string;
  openid: string;
  sign?: string;
};

/**
 * 微信支付V2查询请求数据
 */
export type WxPayV2QueryData = {
  appid: string;
  mch_id: string;
  out_trade_no: string;
  nonce_str: string;
  sign?: string;
};

/**
 * 微信支付V2查询响应数据
 */
export type WxPayV2QueryResponse = {
  return_code: string;
  return_msg?: string;
  result_code: string;
  err_code?: string;
  err_code_des?: string;
  appid: string;
  mch_id: string;
  nonce_str: string;
  out_trade_no: string;
  transaction_id?: string;
  trade_state: string;
  bank_type?: string;
  total_fee: string;
  cash_fee: string;
  time_end?: string;
  openid?: string;
  sign?: string;
};

/**
 * 微信支付查询结果
 */
export type PaymentQueryResult = {
  success: boolean;
  trade_state?: string;
  transaction_id?: string;
  amount?: number;
  error?: string;
};

/**
 * 手动查询支付状态参数
 */
export type ManualCheckPaymentParams = {
  userId: number;
  out_trade_no: string;
};

/**
 * 手动查询支付状态响应
 */
export type ManualCheckPaymentResponse = {
  status: 'paid' | 'pending' | 'failed' | 'error';
  transaction_id?: string;
  trade_state?: string;
};

/**
 * 失败支付回调数据（Redis队列）
 */
export type FailedPaymentCallbackData = {
  out_trade_no: string;
  transaction_id: string;
  trade_state: string;
  callback_time: string;
  error: string;
};

// ======================== 订单日志相关类型 ========================

/**
 * 订单日志数据
 */
export type OrderLogData = {
  userOrderId: string;
  systemOrderId: string;
  oldStatus: number;
  newStatus: number;
  message: string;
  orderData: any;
};

// ======================== 微信小程序相关类型 ========================

/**
 * 微信AccessToken响应
 */
export type WxAccessTokenResponse = WxApiResponse<{
  access_token?: string;
  expires_in?: number;
}>;

/**
 * 微信登录会话响应
 */
export type WxSessionResponse = WxApiResponse<{
  openid?: string;
  session_key?: string;
  unionid?: string;
}>;
