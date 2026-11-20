//经纪人模块数据类型定义

// 经纪人统计数据模型
export type MarketStats = {
  id: number;
  broker_id: number;
  total_guests: number;
  active_guests: number;
  success_rate: number;
  in_progress: number;
  completed: number;
  pending: number;
  monthly_income: number;
  total_income: number;
  this_month_deals: number;
  last_update_time: number;
  create_time: number;
};

// 经纪人客户关系模型
export type MarketGuest = {
  id: number;
  broker_id: number;
  entity_id: number;
  enterprise_name: string;
  logo: string; // 企业logo
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  status: number; // 0-待沟通 1-已沟通 2-跟进中 3-成交 4-已失效
  tags: string; // JSON格式标签
  remark: string;
  success_rate: number;
  follow_up_count: number;
  last_contact_time: number;
  next_contact_time: number;
  total_orders: number;
  total_amount: number;
  province: number;
  city: number;
  create_time: number;
  update_time: number;
};

// 经纪人需求跟进模型
export type MarketNeed = {
  id: number;
  broker_id: number;
  demand_id: number;
  entity_id: number;
  demand_title: string;
  demand_type: number; // 1-需求 2-求购 3-货物 4-服务 5-易货
  budget_price: number;
  status: string; // 关注/已联系/报价/跟进中/成交/失败
  contact_method: string; // 电话/微信/邮件/面谈
  quoted_price: number;
  success_probability: number;
  competitor_count: number;
  remark: string;
  next_follow_time: number;
  first_contact_time: number;
  last_follow_time: number;
  priority: number; // 1-低 2-中 3-高 4-紧急
  create_time: number;
  update_time: number;
};

// 经纪人操作历史模型
export type MarketHistory = {
  id: number;
  broker_id: number;
  action_type: string; // contact/follow_up/quote/close_deal/add_remark
  target_type: string; // guest/need/task
  target_id: number;
  title: string;
  content: string;
  result: string;
  extra_data: string; // JSON格式
  ip_address: string;
  user_agent: string;
  create_time: number;
};

// 经纪人待办事项模型
export type MarketTask = {
  id: number;
  broker_id: number;
  title: string;
  content: string;
  task_type: string; // follow_up/quote/meeting/call/other
  priority: number; // 1-低 2-中 3-高 4-紧急
  status: number; // 0-待处理 1-处理中 2-已完成 3-已取消
  related_type: string; // guest/need
  related_id: number;
  scheduled_time: number;
  completed_time: number;
  reminder_time: number;
  is_reminded: number;
  estimated_duration: number;
  actual_duration: number;
  remark: string;
  create_time: number;
  update_time: number;
};

// 查询参数类型
export type MarketQueryParams = {
  page: number;
  page_size: number;
  keyword?: string;
  status?: string;
  type?: string;
  action_type?:string;
  priority?: number;
  start_time?: number;
  end_time?: number;
  sort_by?: string;
  sort_order?: string;
};

// 响应数据类型
export type MarketListResponse = {
  list: any[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};



// 客户创建数据类型 (不需要id)
export type MarketGuestCreate = Omit<MarketGuest, 'id'>;

// 团队关系数据模型
export type TeamRelation = {
  id: number;
  entity_id: number;
  pid: number;
  diff: number; // 层级
  role: number;
  tags: string;
  create_time: number;
};

// 团队成员信息模型
export type TeamMember = {
  id: number;
  entity_id: number;
  enterprise_name: string;
  logo: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  province: number;
  city: number;
  role: number;
  diff: number;
  tags: string;
  relation_type: string; // 'superior' | 'subordinate'
  create_time: number;
};

// 团队列表查询参数
export type TeamListParams = {
  page: number;
  page_size: number;
  keyword?: string;
};

// 团队成员标签数据模型
export type TeamMemberTag = {
  name: string;
  color?: string;
  create_time?: number;
};

// 更新团队成员标签参数
export type UpdateTeamMemberTagsParams = {
  target_entity_id: number;
  tags: TeamMemberTag[];
};