// 文章分类模型
export type articleCategoryModel = {
  id: number,
  name: string,
  status: number,
  create_time?: number
}

// 文章模型
export type articleModel = {
  id: number,
  type: number,
  name: string,
  content: string,
  status: number,
  cate_name?: string,
  create_time?: number,
  update_time?: number
}

