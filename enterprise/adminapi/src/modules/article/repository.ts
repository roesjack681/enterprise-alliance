import {sequelize} from "../../storage/mysql";
import {QueryTypes} from "sequelize";
import {articleCategoryModel, articleModel} from "./proto";

// 获取分类列表
export const getCategoryList = async (): Promise<any> => {
  let sql: string = "SELECT id, name, status, create_time FROM article_category WHERE status >= 0 ORDER BY id DESC";
  const res: any = await sequelize.query(sql, {
    type: QueryTypes.SELECT
  })
  return res;
}

// 添加分类
export const addCategory = async (data: articleCategoryModel): Promise<number|null> => {
  let sql: string = "INSERT INTO article_category (name, status, create_time) VALUES (:name, :status, :create_time)";
  const [id, rows] = await sequelize.query(sql, {
    replacements: {
      name: data.name,
      status: data.status,
      create_time: data.create_time || Math.floor(Date.now() / 1000)
    },
    type: QueryTypes.INSERT,
    plain: true
  })
  if (1 == rows) {
    return id
  } else {
    return null
  }
}

// 更新分类
export const updateCategory = async (id: number, data: articleCategoryModel): Promise<any> => {
  let sql: string = "UPDATE article_category SET name = :name, status = :status WHERE id = :id";
  const [updateId, rows] = await sequelize.query(sql, {
    replacements: {
      id: id,
      name: data.name,
      status: data.status
    },
    type: QueryTypes.UPDATE,
    plain: true
  })
  if (1 == rows) {
    return rows
  } else {
    return null
  }
}

// 设置分类状态
export const setCategoryStatus = async (id: number, status: number): Promise<any> => {
  let sql: string = "UPDATE article_category SET status = :status WHERE id = :id";
  const [rows] = await sequelize.query(sql, {
    replacements: {
      id: id,
      status: status
    },
    type: QueryTypes.UPDATE,
    plain: true
  })
  return 1;
}

// 获取文章列表
export const getArticleList = async (): Promise<any> => {
  let sql: string = "SELECT a.id, a.type, a.name, a.content, a.status, a.create_time, a.update_time, c.name as cate_name FROM article a LEFT JOIN article_category c ON a.type = c.id WHERE a.status >= 0 ORDER BY a.id DESC";
  const res: any = await sequelize.query(sql, {
    type: QueryTypes.SELECT
  })
  return res;
}

// 添加文章
export const addArticle = async (data: articleModel): Promise<number|null> => {
  let sql: string = "INSERT INTO article (type, name, content, status, create_time) VALUES (:type, :name, :content, :status, :create_time)";
  const [id, rows] = await sequelize.query(sql, {
    replacements: {
      type: data.type,
      name: data.name,
      content: data.content,
      status: data.status,
      create_time: Math.floor(Date.now() / 1000)
    },
    type: QueryTypes.INSERT,
    plain: true
  })
  if (1 == rows) {
    return id
  } else {
    return null
  }
}

// 更新文章
export const updateArticle = async (id: number, data: articleModel): Promise<any> => {
  let sql: string = "UPDATE article SET type = :type, name = :name, content = :content, status = :status, update_time = :update_time WHERE id = :id";
  const [updateId, rows] = await sequelize.query(sql, {
    replacements: {
      id: id,
      type: data.type,
      name: data.name,
      content: data.content,
      status: data.status,
      update_time: Math.floor(Date.now() / 1000)
    },
    type: QueryTypes.UPDATE,
    plain: true
  })
  if (1 == rows) {
    return rows
  } else {
    return null
  }
}

// 设置文章状态
export const setArticleStatus = async (id: number, status: number): Promise<any> => {
  let sql: string = "UPDATE article SET status = :status WHERE id = :id";
  const [rows] = await sequelize.query(sql, {
    replacements: {
      id: id,
      status: status
    },
    type: QueryTypes.UPDATE,
    plain: true
  })
  return 1;
}

// 软删除文章
export const deleteArticle = async (id: number): Promise<any> => {
  let sql: string = "UPDATE article SET status = -1 WHERE id = :id";
  const res = await sequelize.query(sql, {
    replacements: { id: id },
    type: QueryTypes.UPDATE
  })
  return true;
}

// 软删除分类
export const deleteCategory = async (id: number): Promise<any> => {
  let sql: string = "UPDATE article_category SET status = -1 WHERE id = :id";
  const res = await sequelize.query(sql, {
    replacements: { id: id },
    type: QueryTypes.UPDATE
  })
  return true;
}
