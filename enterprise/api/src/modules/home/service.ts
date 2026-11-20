import { HomeConfig } from './proto';
import { rpcPost } from "../../common/common";
import { rpcResult } from "../app/proto";

export class HomeService {
  
  /**
   * 根据IDs获取首页配置
   * @param ids 配置ID数组
   * @returns 配置数据数组
   */
  async getConfigByIds(ids: number[]): Promise<{ msg: string, data: any | null }> {
    try {
      // 构建SQL查询，获取指定ID的配置
      const placeholders = ids.map(() => '?').join(',');
      const sql = `SELECT id, title, json, status FROM system_config WHERE id IN (${placeholders}) AND status = 1`;
      const params = ids;
      
      const res = <rpcResult>(
        await rpcPost("/select", { params, sql }, '')
      );
      
      if (res && res.code === 0 && res.data) { 
        return {
          msg: "ok",
          data:JSON.parse( res.data.result)
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