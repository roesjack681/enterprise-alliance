import { body } from "express-validator";

// 工作台统计数据验证
export const getWorkbenchStatisticsForm = [
  body("admin_id").optional().isString()
];

// 订单列表查询验证
export const queryOrderListForm = [
  body("entity_id").optional().isString(),
  body("service_id").optional({ checkFalsy: true }).isInt({ min: 1 }),
  body("provider_id").optional({ checkFalsy: true }).isInt({ min: 1 }),
  body("service_type").optional().isIn(['one_time', 'recurring']),
  body("status").optional().isIn(['Pending', 'Active', 'Paused', 'Completed', 'Cancelled']),
  body("priority").optional().isIn(['Low', 'Normal', 'High', 'Urgent']),
  body("assigned_admin").optional().isString(),
  body("start_date").optional({ checkFalsy: true }).isInt({ min: 0 }),
  body("end_date").optional({ checkFalsy: true }).isInt({ min: 0 }),
  body("current_page").optional().isInt({ min: 1 }),
  body("page_size").optional().isInt({ min: 1, max: 100 })
];

// 订单详情验证
export const getOrderDetailForm = [
  body("order_id").notEmpty().isString()
];

// 流程推进验证
export const advanceProcessForm = [
  body("order_id").notEmpty().isString(),
  body("current_step").notEmpty().isString(),
  body("next_step").optional().isString(),
  body("remarks").optional().isString(),
  body("attachments").optional().isArray(),
  body("auto_advance").optional().isBoolean()
];

// 任务分配验证
export const assignTasksForm = [
  body("order_ids").isArray().notEmpty(),
  body("order_ids.*").isString(),
  body("admin_id").notEmpty().isString(),
  body("remarks").optional().isString()
];

// 批量操作验证
export const batchOperationForm = [
  body("order_ids").isArray().notEmpty(),
  body("order_ids.*").isString(),
  body("operation").isIn(['assign', 'priority', 'status', 'remarks']),
  body("value").notEmpty().isString(),
  body("remarks").optional().isString()
];

// 创建流程模板验证
export const createTemplateForm = [
  body("service_id").notEmpty().isInt({ min: 1 }),
  body("template_name").notEmpty().isString(),
  body("description").optional().isString(),
  body("steps").isArray().notEmpty(),
  body("steps.*.step").notEmpty().isString(),
  body("steps.*.sequence").isInt({ min: 1 }),
  body("steps.*.role").notEmpty().isString(),
  body("steps.*.description").optional().isString(),
  body("steps.*.estimated_days").optional().isInt({ min: 1 }),
  body("steps.*.required_files").optional().isArray(),
  body("steps.*.approval_required").optional().isInt({ min: 0, max: 1 }),
  body("steps.*.auto_advance").optional().isInt({ min: 0, max: 1 })
];

// 更新流程模板验证
export const updateTemplateForm = [
  body("template_id").notEmpty().isString(),
  body("template_name").optional().isString(),
  body("description").optional().isString(),
  body("steps").optional().isArray(),
  body("steps.*.step").optional().isString(),
  body("steps.*.sequence").optional().isInt({ min: 1 }),
  body("steps.*.role").optional().isString(),
  body("steps.*.description").optional().isString(),
  body("steps.*.estimated_days").optional().isInt({ min: 1 }),
  body("steps.*.required_files").optional().isArray(),
  body("steps.*.approval_required").optional().isInt({ min: 0, max: 1 }),
  body("steps.*.auto_advance").optional().isInt({ min: 0, max: 1 })
];

// 删除流程模板验证
export const deleteTemplateForm = [
  body("template_id").notEmpty().isString()
];

// 查询模板列表验证
export const queryTemplatesForm = [
  body("current_page").optional().isInt({ min: 1 }),
  body("page_size").optional().isInt({ min: 1, max: 100 }),
  body("service_id").optional().isInt({ min: 1 })
];

// 设置订单优先级验证
export const setOrderPriorityForm = [
  body("order_id").notEmpty().isString(),
  body("priority").isIn(['Low', 'Normal', 'High', 'Urgent'])
];

// 添加订单备注验证
export const addOrderRemarksForm = [
  body("order_id").notEmpty().isString(),
  body("remarks").notEmpty().isString()
];

// 查询告警列表验证
export const queryAlertsForm = [
  body("current_page").optional().isInt({ min: 1 }),
  body("page_size").optional().isInt({ min: 1, max: 100 }),
  body("alert_type").optional().isIn(['overdue', 'quality', 'exception', 'reminder']),
  body("severity").optional().isIn(['Low', 'Medium', 'High', 'Critical'])
];

// 解决告警验证
export const resolveAlertForm = [
  body("alert_id").notEmpty().isString()
];

// 获取订单统计验证
export const getOrderStatisticsForm = [
  body("admin_id").optional().isString(),
  body("start_date").optional().isInt({ min: 0 }),
  body("end_date").optional().isInt({ min: 0 })
];