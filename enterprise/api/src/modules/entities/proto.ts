//模型结构体定义
export type EntityModel = {
  id: number;
  status: number;
  review_status: number;
  pid: number;
  username: string;
  password: string;
  mobile: string;
  email: string;
  salt: string;
  openid: string;
  nickname: string;
  avatar: string;
  role: number;
  province: number;
  city: number;
  town: number;
  street: number;
  entityInfo: any;
  create_time: number;
  last_login_time: number;
  tags?: string;
};

export type loginSaltResult = [
  {
    id: number;
    role: number;
    password: string;
    salt: string;
    status: number;
  },
];

export type AssociationEntity = {
  name?: string; // 公司名称
  role_type: number; // 角色类型
  province?: number; // 省份
  city?: number; // 城市
  district?: number; // 区县
  town?: number; // 乡镇
  username?: string; // 用户名
  password: string; // 密码
  mobile: string; // 手机号
  salt?: string; // 加密盐值
  id: number;
  pid:number;
  info_id?: number;
  avatar?: string;
  review_status?: number;
  nikname?: string;
  referrer?: string; // 推荐人加密值
};

// 协会统计数据类型
export type AssociationStatistics = {
  associated_enterprises: number; // 已关联企业数量
  associated_providers: number; // 关联服务商数量
  total_cooperation_projects: number; // 累积合作项目数量
  total_products: number; // 总产品数量
  total_orders: number; // 总订单数量
  total_revenue: number; // 总收入
  monthly_stats: {
    new_enterprises: number; // 本月新增企业
    new_providers: number; // 本月新增服务商
    new_projects: number; // 本月新增项目
    revenue: number; // 本月收入
  };
};
