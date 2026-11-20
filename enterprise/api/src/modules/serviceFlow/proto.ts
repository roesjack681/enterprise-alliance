//服务流程管理模型结构体定义

// 服务订单模型
export type ServiceOrderModel = {
  order_id: string;
  user_id: string;
  service_id: number;
  provider_id?: number; // 服务商ID（提供服务的企业ID）
  title: string; // 服务名称
  service_type: 'one_time' | 'recurring'; // 一次性或周期性
  status: 'Pending' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';
  current_step: string;
  start_date: number;
  end_date?: number;
  cycle_months?: number; // 周期服务的月数
  price: number;
  remarks?: string;
  create_time: number;
  update_time: number;
};

// 流程模板模型
export type ProcessTemplateModel = {
  template_id: string;
  service_id: number;
  template_name: string;
  steps: ProcessStepModel[];
  create_time: number;
  update_time: number;
};

// 流程步骤模型
export type ProcessStepModel = {
  step: string;
  sequence: number;
  role: string;
  description?: string;
  estimated_days?: number;
  required_files?: string[];
};

// 流程实例模型
export type ProcessInstanceModel = {
  instance_id: string;
  order_id: string;
  template_id: string;
  current_step: string;
  current_sequence: number;
  status: 'NotStarted' | 'InProgress' | 'Completed' | 'Cancelled';
  step_history: StepHistoryModel[];
  create_time: number;
  update_time: number;
};

// 步骤历史记录
export type StepHistoryModel = {
  step: string;
  sequence: number;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Skipped';
  operator_id?: string;
  operator_name?: string;
  start_time?: number;
  complete_time?: number;
  remarks?: string;
  attachments?: string[];
};


// 查询参数类型
export type OrderQueryParams = {
  user_id?: string;
  provider_id?: number; // 服务商ID，用于查询服务商的订单
  service_type?: string;
  status?: string;
  current_page: number;
  page_size: number;
};

// 流程推进参数
export type ProcessAdvanceParams = {
  order_id: string;
  current_step: string;
  next_step?: string;
  remarks?: string;
  attachments?: string[];
};
