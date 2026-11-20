import { body } from "express-validator";

// 查询联系人列表表单验证
export const queryContactsForm = [
  body("current_page").isInt({ min: 1 }),
  body("page_size").isInt({ min: 1, max: 100 })
];

// 搜索联系人表单验证
export const searchContactsForm = [
  body("keyword").notEmpty(),
  body("current_page").optional().isInt({ min: 1 }),
  body("page_size").optional().isInt({ min: 1, max: 100 })
];

// 获取联系人详情表单验证
export const contactDetailForm = [
  body("contact_id").isInt({ min: 1 })
];

// 更新在线状态表单验证
export const updateOnlineStatusForm = [
  body("status").isIn(['online', 'offline', 'away', 'busy'])
];