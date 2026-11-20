import { ArticleCategory, Article } from './proto';
import { rpcPost } from "../../common/common";
import { rpcResult } from "../app/proto";
import { ResponseData } from "../app/proto";

export class ArticleService {
  
  /**
   * 获取启用的分类列表
   * @returns 分类数据数组
   */
  async getActiveCategoryList(): Promise<ResponseData> {
    try {
      const sql = "SELECT id, name FROM article_category WHERE status = 1 ORDER BY id DESC";
      const params: any[] = [];
      
      const res = <rpcResult>(
        await rpcPost("/select", { params, sql }, '')
      );
      
      if (res && res.code === 0 && res.data) {
        return {
          msg: "ok",
          data: JSON.parse(res.data.result)
        };
      } else {
        return {
          msg: "error",
          data: null
        };
      }
    } catch (error) {
      return {
        msg: "error",
        data: null
      };
    }
  }
  
  /**
   * 获取启用的文章列表（可按分类筛选）
   * @param categoryId 分类ID（可选）
   * @returns 文章数据数组
   */
  async getActiveArticleList(categoryId?: number): Promise<ResponseData> {
    try {
      let sql: string;
      let params: any[];
      
      if (categoryId) {
        sql = "SELECT id, type, name, content, create_time FROM article WHERE status = 1 AND type = ? ORDER BY id DESC";
        params = [categoryId];
      } else {
        sql = "SELECT id, type, name, content, create_time FROM article WHERE status = 1 ORDER BY id DESC";
        params = [];
      }
      
      const res = <rpcResult>(
        await rpcPost("/select", { params, sql }, '')
      );
      
      if (res && res.code === 0 && res.data) {
        return {
          msg: "ok",
          data: JSON.parse(res.data.result)
        };
      } else {
        return {
          msg: "error",
          data: null
        };
      }
    } catch (error) {
      return {
        msg: "error",
        data: null
      };
    }
  }
}

