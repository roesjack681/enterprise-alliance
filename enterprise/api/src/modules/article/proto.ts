// 文章分类模型
export type ArticleCategory = {
  id: number;
  name: string;
};

// 文章模型
export type Article = {
  id: number;
  type: number;
  name: string;
  content: string;
  create_time: number;
  cate_name?: string;
};

