import { body } from 'express-validator';

// 创建审核记录表单验证
export const createAuditRecordForm = [
  body("audit_type").notEmpty().isInt({ min: 1, max: 3 }),
  body("related_id").notEmpty().isInt({ min: 1 }),
  body("entity_id").notEmpty().isInt({ min: 1 }),
  body("title").notEmpty(),
  body("content").optional(),
  body("entity_name").optional(),
  body("auditor_id").optional(),
  body("auditor_name").optional(),
  body("status").optional().isInt({ min: 1, max: 3 }),
  body("remark").optional()
];

