import { body } from 'express-validator';

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