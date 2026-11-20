// 聊天模块相关模型定义

// 消息类型枚举
export enum MessageType {
  TEXT = 1,           // 文本消息
  IMAGE = 2,          // 图片消息
  VOICE = 3,          // 语音消息
  VIDEO = 4,          // 视频消息
  FILE = 5,           // 文件消息
}

// 会话类型枚举
export enum ConversationType {
  PRIVATE = 1,        // 私聊
  GROUP = 2,          // 群聊
}

// 消息状态枚举
export enum MessageStatus {
  SENDING = 0,        // 发送中
  SENT = 1,           // 已发送
  DELIVERED = 2,      // 已送达
  READ = 3,           // 已读
  FAILED = 4,         // 发送失败
}

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

// 聊天消息模型
export type ChatMessageModel = {
  id?: string;
  conversation_id: string;    // 会话ID
  sender_id: number;          // 发送者ID
  sender_type: number;        // 发送者类型：1-用户，2-企业，3-服务商，4-协会
  sender_name?: string;       // 发送者名称
  sender_avatar?: string;     // 发送者头像
  message_type: MessageType;  // 消息类型
  content: string;            // 消息内容
  file_url?: string;          // 文件URL
  file_name?: string;         // 文件名
  file_size?: number;         // 文件大小
  duration?: number;          // 语音/视频时长
  reply_to?: string;          // 回复的消息ID
  status: MessageStatus;      // 消息状态
  is_deleted?: boolean;       // 是否已删除
  created_at?: Date;          // 创建时间
  updated_at?: Date;          // 更新时间
};

// 会话模型
export type ConversationModel = {
  id?: string;
  conversation_type: ConversationType;  // 会话类型
  name?: string;                        // 会话名称
  avatar?: string;                      // 会话头像
  participants: number[];               // 参与者ID列表
  last_message?: ChatMessageModel;      // 最后一条消息
  unread_count: number;                 // 未读消息数
  is_muted?: boolean;                   // 是否静音
  is_pinned?: boolean;                  // 是否置顶
  created_at?: Date;                    // 创建时间
  updated_at?: Date;                    // 更新时间
};

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
export type ChatQueryModel = {
  conversation_id?: string;             // 会话ID
  page: number;                         // 页码
  page_size: number;                    // 每页数量
  message_type?: MessageType;           // 消息类型
  start_time?: Date;                    // 开始时间
  end_time?: Date;                      // 结束时间
};

export type ConversationQueryModel = {
  user_id: number;                      // 用户ID
  conversation_type?: ConversationType; // 会话类型
  page: number;                         // 页码
  page_size: number;                    // 每页数量
};

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

// 发送消息请求模型
export type SendMessageModel = {
  conversation_id: string;              // 会话ID
  message_type: MessageType;            // 消息类型
  content: string;                      // 消息内容
  file_url?: string;                    // 文件URL
  file_name?: string;                   // 文件名
  file_size?: number;                   // 文件大小
  duration?: number;                    // 时长
  reply_to?: string;                    // 回复的消息ID
};

// 创建会话请求模型
export type CreateConversationModel = {
  conversation_type: ConversationType;  // 会话类型
  name?: string;                        // 会话名称
  avatar?: string;                      // 会话头像
  participants: number[];               // 参与者ID列表
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

// ======================== 用户房间关联相关模型 ========================

// 用户房间关联模型
export type UserRoomModel = {
  id?: number;                              // 用户房间关联ID
  user_id: number;                          // 用户ID
  room_id: number;                          // 房间ID
  room_name?: string;                       // 房间显示名称 (用户自定义)
  room_avatar?: string;                     // 房间头像 (用户自定义)
  is_pinned: boolean;                       // 是否置顶
  is_muted: boolean;                        // 是否免打扰
  unread_count: number;                     // 未读消息数
  last_read_message_id?: string;            // 最后读取的消息ID
  last_read_time?: Date;                    // 最后读取时间
  is_deleted: boolean;                      // 是否已删除 (用户主动删除)
  deleted_at?: Date;                        // 删除时间
  created_at?: Date;                        // 创建时间
  updated_at?: Date;                        // 更新时间
};

// 用户房间查询模型
export type UserRoomQueryModel = {
  user_id: number;                          // 用户ID
  room_id?: number;                         // 房间ID
  is_pinned?: boolean;                      // 是否置顶
  is_deleted?: boolean;                     // 是否已删除
  page: number;                             // 页码
  page_size: number;                        // 每页数量
};

// 创建用户房间关联模型
export type CreateUserRoomModel = {
  user_id: number;                          // 用户ID
  room_id: number;                          // 房间ID
  room_name?: string;                       // 房间显示名称
  room_avatar?: string;                     // 房间头像
  is_pinned?: boolean;                      // 是否置顶
  is_muted?: boolean;                       // 是否免打扰
};

// 更新用户房间关联模型
export type UpdateUserRoomModel = {
  room_name?: string;                       // 房间显示名称
  avatar?: string;                     // 房间头像 
  is_muted?: boolean;                       // 是否免打扰
  descp?: string;                    //描述
   
}; 