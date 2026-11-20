// 需求大厅相关模型定义

export type DemandModel = {
  id?: number;
  title: string; // 需求标题
  user_id: number; // 发布者用户ID
  create_time?: number; // 发布时间（时间戳）
  status: number; // 需求状态（1:发布中 2:已完成 3:已取消）
  type: number; // 需求类型（1:服务，2:供需，3:招采，4:项目，5:招聘，6:沙龙，7:外贸）
  category_id: number; // 需求分类ID
  province: number; // 需求省份
  city: number; // 需求城市
  district: number; // 需求区县
  street: number; // 需求街道
  address: string; // 需求联系地址
  content: string; // 需求内容详情
  images: string; // 需求相关图片（JSON格式存储）
  person: string; // 需求联系人
  mobile: string; // 需求联系电话
  company_name: string; // 需求company_name
  remark: string; // 需求备注信息
  visibility: number; // 可见性（1:公开 2:仅认证经纪人可见）
  budget_price: number; // 预算价格
};

export type DemandQueryModel = {
  page: number; // 页码
  page_size: number; // 每页数量
  keyword?: string; // 关键词搜索
  status?: number; // 状态筛选
  type?: number; // 需求类型筛选
  category_id?: number; // 分类ID筛选
  province?: number; // 省份筛选
  city?: number; // 城市筛选
  district?: number; // 区县筛选
  user_id?: number; // 发布者ID筛选
  role?: number; // 角色筛选
  visibility?: number; // 可见性筛选（1:公开 2:仅认证经纪人可见）
  start_time?: number; // 开始时间筛选
  end_time?: number; // 结束时间筛选
  sort_by?: string; // 排序字段
  sort_order?: string; // 排序方向：asc/desc
};

export type DemandListResponse = {
  list: DemandModel[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type DemandDetailResponse = {
  demand: DemandModel;
  publisher?: {
    id: number;
    nickname: string;
    avatar: string;
    company_name?: string;
    role: number;
  };
};

