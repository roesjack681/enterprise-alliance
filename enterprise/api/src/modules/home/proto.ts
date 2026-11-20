// 首页配置模型
export type HomeConfig = {
  id: number;
  title: string;
  json: string;
  status: number;
};

// 轮播图配置
export type BannerConfig = {
  image: string;
  title: string;
  subtitle: string;
  link: string;
  status: number;
};

// 活动配置
export type ActivityConfig = {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  button_text: string;
  link: string;
  status: number;
};