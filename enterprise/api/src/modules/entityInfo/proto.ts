//模型结构体定义
export type entityInfoModel = {
  id?: number;
  status?: number;
  entity_id?: number;
  province: number;
  city: number;
  town: number;
  street: number;
  name: string;
  descp: string;
  company_number?: string;
  role?: number;
  company_present_name?: string;
  company_present_id_number?: string;
  company_present_mobile?: string;
  company_id_pic?: string;
  company_present_id_up_pic?: string;
  company_present_id_down_pic?: string;
  company_other_files?: string;
  create_time?: number;
  logo?: string;
  address?: string;
  team_photos?: string;
  tags?: string;
};
