//通讯录模型结构体定义

// 联系人模型
export type ContactModel = {
  id: number;
  username: string;
  nickname: string;
  email: string;
  mobile: string;
  avatar: string;
  role: number;
  status: number;
  province: number;
  city: number;
  town: number;
  street: number;
  position?: string;
  department?: string;
  online_status: 'online' | 'offline' | 'away' | 'busy';
  last_active_time: number;
  create_time: number;
  update_time: number;
};

// 查询参数类型
export type ContactQueryParams = {
  keyword?: string;
  role?: number;
  status?: number;
  department?: string;
  current_page: number;
  page_size: number;
};

// 联系人统计
export type ContactStatistics = {
  total_contacts: number;
  online_contacts: number;
  offline_contacts: number;
  by_role: {
    [key: number]: number;
  };
  by_department: {
    [key: string]: number;
  };
};