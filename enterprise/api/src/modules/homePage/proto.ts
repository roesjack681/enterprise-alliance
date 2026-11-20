// 企业主页轮播图
export type Banner = {
  id: number;
  enterprise_id: number;
  title: string;
  image_url: string;
  link_url?: string;
  sort_order: number;
  is_active: boolean;
};

// 企业关于我们
export type About = {
  id: number;
  enterprise_id: number;
  company_name: string;
  description: string;
  vision?: string;
  mission?: string;
  values?: string;
  history?: string;
  team_intro?: string;
  logo_url?: string;
  cover_image?: string;
  contact_info?: {
    phone: string;
    email: string;
    address: string;
    website: string;
  };
  created_at: number;
  updated_at: number;
};

// 企业联系信息
export type Contact = {
  id: number;
  enterprise_id: number;
  contact_person: string;
  phone: string;
  email?: string;
  address: string;
  website?: string;
  wechat?: string;
  qq?: string;
  work_time?: string;
  latitude?: number;
  longitude?: number;
  created_at: number;
  updated_at: number;
};

// 企业产品
export type Product = {
  id: number;
  enterprise_id: number;
  name: string;
  description: string;
  category_id: number; // 分类ID
  price?: number;
  image_urls: string[];
  features?: string;
  specifications?: string;
  is_featured: boolean;
  status: boolean;
  created_at: number;
  updated_at: number;
  thumb?: string; // 产品主图
};

// 企业文章类型
export type Article = {
  id: number;
  enterprise_id: number;
  title: string;
  content: string;
  summary: string;
  cover_image: string;
  category_id: number;
  tags: string[];
  author: string;
  view_count: number;
  is_published: boolean|string;
  published_at: number;
  status: number;
  created_at: number;
  updated_at: number;
};

// 企业案例
export type Case = {
  id: number;
  enterprise_id: number;
  title: string;
  description: string;
  content: string;
  cover_image?: string;
  image_urls?: string;
  video_url?: string;
  category_id?: number; // 分类ID
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  status: number;
  created_at: number;
  updated_at: number;
};

// 企业主页设置
export type Settings = {
  id: number;
  enterprise_id: number;
  show_banner: boolean|string;
  show_about: boolean|string;
  show_products: boolean|string;
  show_articles: boolean|string;
  show_cases: boolean|string;
  show_contact: boolean|string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  created_at: number;
  updated_at: number;
};

// 创建轮播图请求
export type CreateBannerReq = {
  enterprise_id: number;
  title: string;
  image_url: string;
  link_url?: string;
  sort_order?: number;
  is_active?: boolean;
};

// 更新轮播图请求
export type UpdateBannerReq = {
  id: number;
  enterprise_id: number;
  title?: string;
  image_url?: string;
  link_url?: string;
  sort_order?: number;
  is_active?: boolean;
};

// 创建产品请求
export type CreateProductReq = {
  enterprise_id: number;
  name: string;
  description: string;
  category_id: number; // 分类ID
  price?: number;
  image_urls?: string[];
  features?: string;
  specifications?: string;
  is_featured?: boolean;
  status?: boolean;
  thumb?: string; // 产品主图
};

// 创建/更新请求
export type CreateArticleReq = Omit<Article, 'id' | 'view_count' | 'created_at' | 'updated_at' | 'status'>;
export type UpdateArticleReq = Partial<CreateArticleReq> & { id: number };

// 创建案例请求
export type CreateCaseReq = {
  enterprise_id: number;
  title: string;
  description: string;
  content: string;
  cover_image?: string;
  image_urls?: string;
  video_url?: string;
  category_id?: number; // 分类ID
  is_featured?: boolean;
  is_published?: boolean|string;
  status?: boolean;
};

// 企业分类类型
export type EnterpriseCategory = {
  id: number; // 分类ID
  enterprise_id: number; // 企业ID
  name: string; // 分类名称
  type: 'product' | 'article' | 'case'; // 分类类型
  sort_order: number; // 排序
  status: number; // 状态：1正常，0删除
  created_at: number; // 创建时间
  updated_at: number; // 更新时间
};

// 创建分类请求
export type CreateCategoryReq = {
  enterprise_id: number; // 企业ID
  name: string; // 分类名称
  type: 'product' | 'article' | 'case'; // 分类类型
  sort_order?: number; // 排序
  status?: number; // 状态
};

// 更新分类请求
export type UpdateCategoryReq = {
  id: number; // 分类ID
  name?: string; // 分类名称
  type?: 'product' | 'article' | 'case'; // 分类类型
  sort_order?: number; // 排序
  status?: number; // 状态
};

// 查询参数
export type QueryParams = {
  page?: number;
  page_size?: number;
  enterprise_id?: number;
  category_id?: number; // 分类ID
  status?: string;
  is_featured?: boolean;
  is_published?: boolean|string;
  keyword?: string;
};

// 分页响应
export type PageResult<T> = {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

// 企业主页完整数据
export type HomepageData = {
  banners: Banner[];
  about: About | null;
  contact: Contact | null;
  products: Product[];
  articles: Article[];
  cases: Case[];
  settings: Settings | null;
}; 