// 管理后台服务流程管理模型定义

// 服务订单模型
export type AdminServiceOrderModel = {
  order_id: string;
  user_id: string;
  service_id: number;
  provider_id?: number; // 服务商ID（提供服务的企业ID）
  title: string;
  service_type: 'one_time' | 'recurring';
  status: 'Pending' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';
  current_step: string;
  start_date: number;
  end_date?: number;
  cycle_months?: number;
  price: number;
  remarks?: string;
  create_time: number;
  update_time: number;
};

// 流程模板模型
export type AdminProcessTemplateModel = {
  template_id: string;
  service_id: number;
  template_name: string;
  description?: string;
  steps_json: string;
  is_active: number;
  created_by?: string;
  version?: string;
  create_time: number;
  update_time: number;
};

// 流程步骤模型
export type AdminProcessStepModel = {
  step: string;
  sequence: number;
  role: string;
  description?: string;
  estimated_days?: number;
  required_files?: string[];
  approval_required: number;
  auto_advance: number;
};

// 流程实例模型
export type AdminProcessInstanceModel = {
  instance_id: string;
  order_id: string;
  template_id: string;
  current_step: string;
  current_sequence: number;
  status: 'NotStarted' | 'InProgress' | 'Completed' | 'Cancelled';
  assigned_staff?: string;
  create_time: number;
  update_time: number;
};

// 管理后台流程步骤历史模型
export type AdminProcessStepHistoryModel = {
  history_id: string;
  order_id: string;
  instance_id: string;
  step: string;
  sequence: number;
  role: string;
  description: string;
  estimated_days: number;
  required_files?: string[];
  approval_required: number;
  auto_advance: number;
  status: 'NotStarted' | 'InProgress' | 'Completed' | 'Cancelled' | 'Overdue';
  start_time?: number;
  end_time?: number;
  operator_id?: string;
  operator_name?: string;
  operator_type?: 'admin' | 'enterprise' | 'service_provider' | 'system';
  remarks?: string;
  create_time: number;
  update_time: number;
};


// 工作台统计数据
export type WorkbenchStatistics = {
  total_orders: number;
  pending_orders: number;
  active_orders: number;
  completed_orders: number;
  overdue_tasks: number;
  pending_approvals: number;
  today_completed: number;
  month_completed: number;
};

// 管理后台订单查询参数
export type AdminOrderQueryParams = {
  entity_id?: string;
  service_id?: number;
  provider_id?: number; // 服务商ID，用于查询服务商的订单
  service_type?: string;
  status?: string;
  priority?: string;
  assigned_admin?: string;
  start_date?: number;
  end_date?: number;
  current_page: number;
  page_size: number;
};

// 管理后台流程推进参数
export type AdminProcessAdvanceParams = {
  order_id: string;
  current_step: string;
  next_step?: string;
  admin_id: string;
  operator_name?: string;
  remarks?: string;
  attachments?: string[];
  auto_advance?: boolean;
};

// 任务分配参数
export type TaskAssignParams = {
  order_ids: string[];
  admin_id: string;
  remarks?: string;
};

// 模板创建参数
export type TemplateCreateParams = {
  service_id: string;
  template_name: string;
  description?: string;
  steps: AdminProcessStepModel[];
};

// 批量操作参数
export type BatchOperationParams = {
  order_ids: string[];
  operation: 'assign' | 'priority' | 'status' | 'remarks';
  value: string;
  admin_id: string;
  remarks?: string;
};

// 告警模型
export type AlertModel = {
  alert_id: string;
  order_id: string;
  alert_type: 'overdue' | 'quality' | 'exception' | 'reminder';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  assigned_admin?: string;
  create_time: number;
  resolve_time?: number;
};