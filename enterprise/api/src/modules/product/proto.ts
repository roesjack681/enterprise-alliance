// 服务产品相关模型定义
export type ServiceProductModel = {
  id?: number;
  title: string; // 服务标题
  description: string; // 服务描述
  category_id: number; // 分类ID
  sub_category_id: number; // 子分类ID
  tags: string; // 标签，JSON格式
  price: number; // 价格
  price_type: number; // 价格类型：1-固定价格，2-议价
  unit: string; // 计价单位
  province: number; // 服务省份
  city: number; // 服务城市
  district: number; // 服务区县
  address: string; // 详细地址
  contact_name: string; // 联系人
  contact_phone: string; // 联系电话
  contact_wechat: string; // 微信号
  images: string; // 服务图片，JSON格式
  videos: string; // 服务视频，JSON格式
  service_area: string; // 服务区域
  service_time: string; // 服务时间
  qualification: string; // 资质证书，JSON格式
  status: number; // 状态：0-草稿，1-待审核，2-已发布，3-已下架
  view_count: number; // 浏览次数
  favorite_count: number; // 收藏次数
  entity_id: number; // 发布企业ID
  create_time?: string; // 创建时间
  update_time?: string; // 更新时间
  audit_time?: string; // 审核时间
  audit_user_id?: number; // 审核人ID
  audit_remark?: string; // 审核备注
};
export type ServiceProductQueryModel = {
  page: number; // 页码
  page_size: number; // 每页数量
  category_id?: number; // 分类ID
  sub_category_id?: number; // 子分类ID
  province?: number; // 省份
  city?: number; // 城市
  district?: number; // 区县
  keyword?: string; // 关键词搜索
  price_min?: number; // 最低价格
  price_max?: number; // 最高价格
  price_type?: number; // 价格类型
  status?: number; // 状态筛选
  entity_id?: number; // 企业ID
  role_id?: number; // 角色ID
  sort_by?: string; // 排序字段
  sort_order?: string; // 排序方向：asc/desc
};
export type ServiceProductDetailModel = {
  id: number;
  title: string;
  description: string;
  category_id: number;
  sub_category_id: number;
  category_name: string;
  sub_category_name: string;
  tags: string;
  price: number;
  price_type: number;
  unit: string;
  province: number;
  city: number;
  district: number;
  province_name: string;
  city_name: string;
  district_name: string;
  address: string;
  contact_name: string;
  contact_phone: string;
  contact_wechat: string;
  images: string;
  videos: string;
  service_area: string;
  service_time: string;
  qualification: string;
  status: number;
  view_count: number;
  favorite_count: number;
  entity_id: number;
  entity_name: string;
  entity_avatar: string;
  entity_rating: number;
  create_time: string;
  update_time: string;
  is_favorite: boolean; // 当前用户是否收藏
};
export type ServiceAuditModel = {
  service_id: number; // 服务ID
  status: number; // 审核状态：1-通过，2-拒绝
  remark: string; // 审核备注
  audit_user_id: number; // 审核人ID
  role_id?: number; // 角色ID
};
export type ServiceFavoriteModel = {
  service_id: number; // 服务ID
  entity_id: number; // 企业ID
  action: string; // 操作：add-收藏，remove-取消收藏
};
