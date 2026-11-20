// 通知模块相关模型定义

// 通知类型枚举
export enum NotificationType {
  SYSTEM_MAINTENANCE = 1,  // 系统维护
  FEATURE_UPDATE = 2,      // 功能更新
  SECURITY_ALERT = 3,      // 安全提醒
  ACTIVITY_NOTICE = 4,     // 活动通知
  ORDER_STATUS = 5,        // 订单状态
  SERVICE_AUDIT = 6,       // 服务审核
  PAYMENT_REMINDER = 7,    // 支付提醒
  REVIEW_REMINDER = 8,     // 评价提醒
}

// 咨询分类枚举
export enum ConsultationCategory {
  PRODUCT = 1,        // 产品咨询
  SERVICE = 2,        // 服务咨询
  TECHNICAL = 3,      // 技术咨询
  OTHER = 4,          // 其他
}

// 优先级枚举
export enum Priority {
  LOW = 1,            // 低
  MEDIUM = 2,         // 中
  HIGH = 3,           // 高
  URGENT = 4,         // 紧急
}

// 系统通知模型
export type SystemNotificationModel = {
  id?: string;
  title: string;                        // 通知标题
  content: string;                      // 通知内容
  type: NotificationType;               // 通知类型
  priority: Priority;                   // 优先级
  target_users?: number[];              // 目标用户ID列表（为空表示全部用户）
  target_entities?: number[];           // 目标企业ID列表
  is_read?: boolean;                    // 是否已读
  created_at?: Date;                    // 创建时间
  updated_at?: Date;                    // 更新时间
};

// 业务通知模型
export type BusinessNotificationModel = {
  id?: string;
  user_id: number;                      // 用户ID
  entity_id?: number;                   // 企业ID
  title: string;                        // 通知标题
  content: string;                      // 通知内容
  type: NotificationType;               // 通知类型
  related_id?: string;                  // 关联业务ID
  related_type?: string;                // 关联业务类型
  is_read?: boolean;                    // 是否已读
  created_at?: Date;                    // 创建时间
  updated_at?: Date;                    // 更新时间
};

// 问题咨询模型
export type ConsultationModel = {
  id?: string;
  user_id: number;                      // 咨询用户ID
  entity_id?: number;                   // 咨询企业ID
  title: string;                        // 咨询标题
  content: string;                      // 咨询内容
  category: ConsultationCategory;       // 咨询分类
  status: number;                       // 状态：1-待回复，2-已回复，3-已关闭
  priority: Priority;                   // 优先级
  images?: string[];                    // 图片列表
  reply_content?: string;               // 回复内容
  reply_time?: Date;                    // 回复时间
  reply_user_id?: number;               // 回复用户ID
  created_at?: Date;                    // 创建时间
  updated_at?: Date;                    // 更新时间
};

// 查询参数模型
export type NotificationQueryModel = {
  user_id: number;                      // 用户ID
  type?: NotificationType;              // 通知类型
  is_read?: boolean;                    // 是否已读
  page: number;                         // 页码
  page_size: number;                    // 每页数量
};

export type ConsultationQueryModel = {
  user_id?: number;                     // 用户ID
  entity_id?: number;                   // 企业ID
  status?: number;                      // 状态
  category?: ConsultationCategory;      // 分类
  page: number;                         // 页码
  page_size: number;                    // 每页数量
};

// 创建系统通知请求模型
export type CreateSystemNotificationModel = {
  title: string;                        // 通知标题
  content: string;                      // 通知内容
  type: NotificationType;               // 通知类型
  priority: Priority;                   // 优先级
  target_users?: number[];              // 目标用户ID列表
  target_entities?: number[];           // 目标企业ID列表
};

// 创建业务通知请求模型
export type CreateBusinessNotificationModel = {
  user_id: number;                      // 用户ID
  entity_id?: number;                   // 企业ID
  title: string;                        // 通知标题
  content: string;                      // 通知内容
  type: NotificationType;               // 通知类型
  related_id?: string;                  // 关联业务ID
  related_type?: string;                // 关联业务类型
};

// 创建问题咨询请求模型
export type CreateConsultationModel = {
  entity_id?: number;                   // 咨询企业ID
  title: string;                        // 咨询标题
  content: string;                      // 咨询内容
  category: ConsultationCategory;       // 咨询分类
  priority: Priority;                   // 优先级
  images?: string[];                    // 图片列表
};

// 回复问题咨询请求模型
export type ReplyConsultationModel = {
  consultation_id: string;              // 咨询ID
  content: string;                      // 回复内容
};

 