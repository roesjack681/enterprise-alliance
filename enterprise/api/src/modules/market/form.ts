import { body } from "express-validator";

// 客户状态常量 (数值型)
const GUEST_STATUSES = [0, 1, 2, 3, 4]; // 0-待沟通, 1-已沟通, 2-跟进中, 3-成交, 4-已失效

// 需求跟进状态常量 (数值型)
const NEED_STATUSES = [0, 1, 2, 3, 4, 5]; // 0-关注, 1-已联系, 2-报价, 3-跟进中, 4-成交, 5-失败

// 联系方式常量
const CONTACT_METHODS = ["电话", "微信", "邮件", "面谈"];

// 任务类型常量
const TASK_TYPES = ["follow_up", "quote", "meeting", "call", "other"];

// 操作类型常量
const ACTION_TYPES = ["view", "contact", "follow_up", "quote", "close_deal", "add_remark"];

// 目标类型常量
const TARGET_TYPES = ["guest", "need", "demand", "task"];

// ======================= 客户管理表单验证 =======================

// 添加客户表单验证
export const addGuestForm = [
  body("entity_id").isInt({ min: 1 }), 
];



// 查询客户列表表单验证
export const queryGuestForm = [
  body("page").isInt({ min: 1 }),
  body("page_size").isInt({ min: 1, max: 1000 }),
  body("keyword").optional().isLength({ max: 100 }),
  body("status").optional().isInt({ min: 0, max: 4 }),
  body("sort_by").optional().isIn(["create_time", "last_contact_time", "total_amount"]),
  body("sort_order").optional().isIn(["asc", "desc"])
];

// ======================= 需求跟进表单验证 =======================

// 添加需求跟进表单验证
export const addNeedForm = [
  body("demand_id").isInt({ min: 1 }).withMessage("需求ID是必填项"),
 
];

// 更新需求跟进表单验证
export const updateNeedForm = [
  body("id").isInt({ min: 1 }),
  body("status").optional().isInt({ min: 0, max: 5 }),
  body("contact_method").optional().isIn(CONTACT_METHODS),
  body("quoted_price").optional().isFloat({ min: 0 }),
  body("success_probability").optional().isInt({ min: 0, max: 100 }),
  body("competitor_count").optional().isInt({ min: 0 }),
  body("priority").optional().isInt({ min: 1, max: 4 }),
  body("remark").optional().isLength({ max: 1000 }),
  body("next_follow_time").optional().isInt({ min: 0 })
];

// 查询需求跟进列表表单验证
export const queryNeedForm = [
  body("page").isInt({ min: 1 }),
  body("page_size").isInt({ min: 1, max: 100 }),
  body("keyword").optional({ nullable: true }).isLength({ max: 100 }),
  body("status").optional({ nullable: true }).isInt({ min: 0, max: 5 }),
  body("priority").optional({ nullable: true }).isInt({ min: 1, max: 4 }),
  body("sort_by").optional({ nullable: true }).isIn(["create_time", "next_follow_time", "quoted_price"]),
  body("sort_order").optional({ nullable: true }).isIn(["asc", "desc"])
];

// ======================= 待办事项表单验证 =======================

// 添加待办事项表单验证
export const addTaskForm = [
  body("title").notEmpty().isLength({ max: 200 }),
  body("task_type").isIn(TASK_TYPES),
  body("priority").isInt({ min: 1, max: 4 })
];

// 更新待办事项表单验证
export const updateTaskForm = [
  body("id").isInt({ min: 1 }),
  body("title").optional({ nullable: true }).isLength({ max: 200 }),
  body("content").optional({ nullable: true }).isLength({ max: 1000 }),
  body("task_type").optional({ nullable: true }).isIn(TASK_TYPES),
  body("priority").optional({ nullable: true }).isInt({ min: 1, max: 4 }),
  body("status").optional({ nullable: true }).isInt({ min: 0, max: 3 }),
  body("scheduled_time").optional({ nullable: true }).isInt({ min: 0 }),
  body("reminder_time").optional({ nullable: true }).isInt({ min: 0 }),
  body("estimated_duration").optional({ nullable: true }).isInt({ min: 0 }),
  body("actual_duration").optional({ nullable: true }).isInt({ min: 0 }),
  body("remark").optional({ nullable: true }).isLength({ max: 1000 })
];

// 查询待办事项列表表单验证
export const queryTaskForm = [
  body("page").isInt({ min: 1 }),
  body("page_size").isInt({ min: 1, max: 100 }),
  body("keyword").optional({ nullable: true }).isLength({ max: 100 }),
  body("task_type").optional({ nullable: true }).isIn(TASK_TYPES),
  body("status").optional({ nullable: true }).isInt({ min: 0, max: 3 }),
  body("priority").optional({ nullable: true }).isInt({ min: 1, max: 4 }),
  body("sort_by").optional({ nullable: true }).isIn(["create_time", "scheduled_time", "priority"]),
  body("sort_order").optional({ nullable: true }).isIn(["asc", "desc"])
];

// ======================= 操作历史表单验证 =======================

// 查询操作历史表单验证
export const queryHistoryForm = [
  body("page").isInt({ min: 1 }),
  body("page_size").isInt({ min: 1, max: 100 }),
  body("action_type").optional().isIn(ACTION_TYPES),
  body("target_type").optional().isIn(TARGET_TYPES),
  body("target_id").optional().isInt({ min: 1 }),
  body("start_time").optional().isInt({ min: 0 }),
  body("end_time").optional().isInt({ min: 0 }),
  body("sort_by").optional().isIn(["create_time"]),
  body("sort_order").optional().isIn(["asc", "desc"])
];

// ID表单验证
export const idForm = [
  body("id").isInt({ min: 1 })
];

// ======================= 旧版兼容接口表单验证 =======================

// 经纪人联系记录列表表单验证 (兼容旧版)
export const brokerContactsForm = [
  body("page").isInt({ min: 1 }),
  body("page_size").isInt({ min: 1, max: 100 }),
  body("keyword").optional().isLength({ max: 100 }),
  body("status").optional().isInt({ min: 0, max: 4 }),
  body("sort_by").optional().isIn(["create_time", "last_contact_time"]),
  body("sort_order").optional().isIn(["asc", "desc"])
];

// 更新联系状态表单验证 (兼容旧版)
export const updateContactForm = [
  body("contact_id").isInt({ min: 1 }),
  body("status").optional().isInt({ min: 0, max: 4 }),
  body("remark").optional().isLength({ max: 1000 })
];

// 添加客户标签表单验证 (兼容旧版)
export const addCustomerTagForm = [
  body("entity_id").isInt({ min: 1 }),
  body("tag").notEmpty().isLength({ max: 50 }),
  body("color").optional().matches(/^#[0-9A-Fa-f]{6}$/)
];

// 删除客户标签表单验证 (兼容旧版)
export const removeCustomerTagForm = [
  body("tag_id").isInt({ min: 1 })
];

// 联系企业表单验证 (兼容旧版)
export const contactEnterpriseForm = [
  body("entity_id").isInt({ min: 1 }),
  body("remark").optional().isLength({ max: 1000 })
];

// 团队列表查询表单验证
export const teamListForm = [
  body("page").isInt({ min: 1 }),
  body("page_size").isInt({ min: 1, max: 100 }),
  body("keyword").optional().isLength({ max: 50 })
];

// 更新团队成员标签表单验证
export const updateTeamMemberTagsForm = [
  body("target_entity_id").notEmpty(),
  body("tags").notEmpty()
];