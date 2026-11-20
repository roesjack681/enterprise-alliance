import { body } from 'express-validator';

// 房间相关验证
export const createGroupRoomValidation = [
  body('room_name').notEmpty(),
  body('member_ids').notEmpty(),
  body('avatar').optional(),
  body('desc').optional(),
];

export const getMessageHistoryValidation = [
  body('room_id').notEmpty(),
  body('page').optional().isInt({ min: 1 }),
  body('page_size').optional().isInt({ min: 1, max: 100 }),
];


// ==========================================================
// 以下是旧的验证规则，在重构完成后可以考虑删除
// ==========================================================

// 聊天消息相关验证
export const sendMessageValidation = [
  body('conversation_id').notEmpty(),
  body('message_type').isInt({ min: 1, max: 5 }),
  body('content').notEmpty(),
  body('file_url').optional().isURL(),
  body('file_name').optional().isString(),
  body('file_size').optional().isInt({ min: 0 }),
  body('duration').optional().isInt({ min: 0 }),
  body('reply_to').optional().isString(),
];

export const getMessagesValidation = [
  body('conversation_id').notEmpty(),
  body('page').optional().isInt({ min: 1 }),
  body('page_size').optional().isInt({ min: 1, max: 100 }),
  body('message_type').optional().isInt({ min: 1, max: 5 }),
  body('start_time').optional().isISO8601(),
  body('end_time').optional().isISO8601(),
];

export const markMessageAsReadValidation = [
  body('message_id').notEmpty(),
];

export const deleteMessageValidation = [
  body('message_id').notEmpty(),
];

// 会话相关验证
export const createConversationValidation = [
  body('conversation_type').isInt({ min: 1, max: 2 }),
  body('name').optional().isString(),
  body('avatar').optional().isURL(),
  body('participants').isArray({ min: 1 }),
  body('participants.*').isInt({ min: 1 }),
];

export const getConversationsValidation = [
  body('conversation_type').optional().isInt({ min: 1, max: 2 }),
  body('page').optional().isInt({ min: 1 }),
  body('page_size').optional().isInt({ min: 1, max: 100 }),
];

export const getConversationDetailValidation = [
  body('conversation_id').notEmpty(),
];

export const updateConversationValidation = [
  body('conversation_id').notEmpty(),
  body('name').optional().isString(),
  body('avatar').optional().isURL(),
  body('is_muted').optional().isBoolean(),
  body('is_pinned').optional().isBoolean(),
];

export const deleteConversationValidation = [
  body('conversation_id').notEmpty(),
];

// 系统通知相关验证
export const createSystemNotificationValidation = [
  body('title').notEmpty(),
  body('content').notEmpty(),
  body('type').isInt({ min: 1, max: 8 }),
  body('priority').isInt({ min: 1, max: 4 }),
  body('target_users').optional().isArray(),
  body('target_users.*').optional().isInt({ min: 1 }),
  body('target_entities').optional().isArray(),
  body('target_entities.*').optional().isInt({ min: 1 }),
];

export const getSystemNotificationsValidation = [
  body('user_id').optional().isInt({ min: 1 }),
  body('type').optional().isInt({ min: 1, max: 8 }),
  body('is_read').optional().isBoolean(),
  body('page').optional().isInt({ min: 1 }),
  body('page_size').optional().isInt({ min: 1, max: 100 }),
];

export const markSystemNotificationAsReadValidation = [
  body('notification_id').notEmpty(),
];

// 业务通知相关验证
export const createBusinessNotificationValidation = [
  body('user_id').isInt({ min: 1 }),
  body('entity_id').optional().isInt({ min: 1 }),
  body('title').notEmpty(),
  body('content').notEmpty(),
  body('type').isInt({ min: 1, max: 8 }),
  body('related_id').optional().isString(),
  body('related_type').optional().isString(),
];

export const getBusinessNotificationsValidation = [
  body('type').optional().isInt({ min: 1, max: 8 }),
  body('is_read').optional().isBoolean(),
  body('page').optional().isInt({ min: 1 }),
  body('page_size').optional().isInt({ min: 1, max: 100 }),
];

export const markBusinessNotificationAsReadValidation = [
  body('notification_id').notEmpty(),
];

// 问题咨询相关验证
export const createConsultationValidation = [
  body('entity_id').optional().isInt({ min: 1 }),
  body('title').notEmpty(),
  body('content').notEmpty(),
  body('category').isInt({ min: 1, max: 4 }),
  body('priority').isInt({ min: 1, max: 4 }),
  body('images').optional().isArray(),
  body('images.*').optional().isURL(),
];

export const getConsultationsValidation = [
  body('user_id').optional().isInt({ min: 1 }),
  body('entity_id').optional().isInt({ min: 1 }),
  body('status').optional().isInt({ min: 1, max: 3 }),
  body('category').optional().isInt({ min: 1, max: 4 }),
  body('page').optional().isInt({ min: 1 }),
  body('page_size').optional().isInt({ min: 1, max: 100 }),
];

export const getConsultationDetailValidation = [
  body('consultation_id').notEmpty(),
];

export const replyConsultationValidation = [
  body('consultation_id').notEmpty(),
  body('content').notEmpty(),
];

export const closeConsultationValidation = [
  body('consultation_id').notEmpty(),
];

// 统计相关验证
export const getUnreadCountValidation = [];

// ======================== 用户房间关联相关验证 ========================

// 用户房间关联相关验证
export const createUserRoomValidation = [
  body('user_id').isInt({ min: 1 }),
  body('room_id').isInt({ min: 1 }),
  body('room_name').optional().isString(),
  body('room_avatar').optional().isURL(),
  body('is_pinned').optional().isBoolean(),
  body('is_muted').optional().isBoolean(),
];

export const getUserRoomsValidation = [
  body('user_id').isInt({ min: 1 }),
  body('room_id').optional().isInt({ min: 1 }),
  body('is_pinned').optional().isBoolean(),
  body('is_deleted').optional().isBoolean(),
  body('page').optional().isInt({ min: 1 }),
  body('page_size').optional().isInt({ min: 1, max: 100 }),
];

export const getUserRoomDetailValidation = [
  body('user_id').isInt({ min: 1 }),
  body('room_id').isInt({ min: 1 }),
];

export const updateUserRoomValidation = [ 
  body('room_id').isInt({ min: 1 }),
  body('room_name').optional().isString(),
  body('avatar').optional(), 
  body('is_muted').optional(),
  body('descp').optional(),
 
];

export const deleteUserRoomValidation = [
  body('user_id').isInt({ min: 1 }),
  body('room_id').isInt({ min: 1 }),
];

export const markUserRoomAsReadValidation = [
  body('user_id').isInt({ min: 1 }),
  body('room_id').isInt({ min: 1 }),
  // 移除 message_id 参数要求，因为service方法已经简化
];

// 获取用户房间列表验证（支持分页）
export const getUserRoomsListValidation = [
  body('page').optional().isInt({ min: 1 }),
  body('page_size').optional().isInt({ min: 1, max: 100 }),
]; 