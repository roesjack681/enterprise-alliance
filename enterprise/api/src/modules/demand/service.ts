import {
  DemandModel,
  DemandQueryModel,
  DemandListResponse,
  DemandDetailResponse,
} from "./proto";
import { ResponseData, TokenData, rpcResult } from "../app/proto";
import { rpcPost } from "../../common/common";
import { MeiliService } from "../../middles/meilisearch";
export interface IDemandService<TokenData> {
  // 需求相关方法
  createDemand(data: DemandModel): Promise<ResponseData>;
  updateDemand(data: DemandModel): Promise<ResponseData>;
  deleteDemand(id: number, userId: number): Promise<ResponseData>;
  getDemandDetail(id: number, userId?: number, userRole?: number): Promise<ResponseData>;
  getDemandList(query: DemandQueryModel): Promise<ResponseData>;
  getMyDemandList(userId: number, query: DemandQueryModel): Promise<ResponseData>;
  getDemandListForBroker(query: DemandQueryModel): Promise<ResponseData>;
  updateDemandStatus(id: number, status: number, userId: number, remark?: string): Promise<ResponseData>;
}

// ======================== 需求服务相关 ========================

export class DemandService implements IDemandService<TokenData> {
  protected token: string;
  
  constructor(token: string) {
    this.token = token;
  }

  /**
   * 创建需求
   */
  async createDemand(data: DemandModel): Promise<ResponseData> {
    try {
      const sql = `INSERT INTO demand (title, user_id, type, category_id, province, city, district, street, address, content, images, person, mobile, company_name, remark, visibility, budget_price, status, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const params = [
        data.title,
        data.user_id,
        data.type,
        data.category_id,
        data.province,
        data.city,
        data.district,
        data.street,
        data.address,
        data.content,
        data.images || '[]',
        data.person,
        data.mobile,
        data.company_name || '',
        data.remark || '',
        data.visibility || 1, // 默认可见性为公开
        data.budget_price || 0, // 默认预算价格为0
        data.status || 1, // 默认状态为发布中
        Math.floor(Date.now() / 1000),
      ];

      const res = <rpcResult>(
        await rpcPost("/insert", { params, sql }, this.token)
      );

      if (res && res.code === 0) {
        //meilisearch
        const meilisearch = new MeiliService('demand');
        meilisearch.addDocuments([{
          id: res.data.lastId,
          title: data.title,
          //description: data.content,
        }]);
       // await meilisearch.setSearchableFields(['title', 'description']);
        return { msg: "ok", data: { id: res.data } };
      } else {
        return { msg: "insert_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新需求
   */
  async updateDemand(data: DemandModel): Promise<ResponseData> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];

      // 动态构建更新字段
      if (data.title !== undefined) {
        updateFields.push("title = ?");
        params.push(data.title);
      }
      if (data.content !== undefined) {
        updateFields.push("content = ?");
        params.push(data.content);
      }
      if (data.type !== undefined) {
        updateFields.push("type = ?");
        params.push(data.type);
      }
      if (data.category_id !== undefined) {
        updateFields.push("category_id = ?");
        params.push(data.category_id);
      }
      if (data.province !== undefined) {
        updateFields.push("province = ?");
        params.push(data.province);
      }
      if (data.city !== undefined) {
        updateFields.push("city = ?");
        params.push(data.city);
      }
      if (data.district !== undefined) {
        updateFields.push("district = ?");
        params.push(data.district);
      }
      if (data.street !== undefined) {
        updateFields.push("street = ?");
        params.push(data.street);
      }
      if (data.address !== undefined) {
        updateFields.push("address = ?");
        params.push(data.address);
      }
      if (data.images !== undefined) {
        updateFields.push("images = ?");
        params.push(data.images);
      }
      if (data.person !== undefined) {
        updateFields.push("person = ?");
        params.push(data.person);
      }
      if (data.mobile !== undefined) {
        updateFields.push("mobile = ?");
        params.push(data.mobile);
      }
      if (data.company_name !== undefined) {
        updateFields.push("company_name = ?");
        params.push(data.company_name);
      }
      if (data.remark !== undefined) {
        updateFields.push("remark = ?");
        params.push(data.remark);
      }
      if (data.visibility !== undefined) {
        updateFields.push("visibility = ?");
        params.push(data.visibility);
      }
      if (data.budget_price !== undefined) {
        updateFields.push("budget_price = ?");
        params.push(data.budget_price);
      }
      if (data.status !== undefined) {
        updateFields.push("status = ?");
        params.push(data.status);
      }

      if (updateFields.length === 0) {
        return { msg: "no_fields_to_update", data: null };
      }

      const sql = `UPDATE demand SET ${updateFields.join(", ")} WHERE id = ? AND user_id = ?`;
      params.push(data.id, data.user_id);

      const res = <rpcResult>(
        await rpcPost("/update", { params, sql }, this.token)
      );

      if (res && res.code === 0) {
        //meilisearch
        const meilisearch = new MeiliService('demand');
        meilisearch.updateDocuments([{
          id: data.id,
          title: data.title,
          //description: data.content,
        }]);
        //await meilisearch.setSearchableFields(['title', 'description']);
        return { msg: "ok", data: { affectedRows: res.data } };
      } else {
        return { msg: "update_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 删除需求（软删除，将状态设为已取消）
   */
  async deleteDemand(id: number, userId: number): Promise<ResponseData> {
    try {
      const sql = `UPDATE demand SET status = 3 WHERE id = ? AND user_id = ?`;
      const params = [id, userId];

      const res = <rpcResult>(
        await rpcPost("/update", { params, sql }, this.token)
      );

      if (res && res.code === 0) {
        return { msg: "ok", data: { affectedRows: res.data } };
      } else {
        return { msg: "delete_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取需求详情
   */
  async getDemandDetail(id: number, userId?: number, userRole?: number): Promise<ResponseData> {
    try {
      const sql = `SELECT id, title, user_id, type, category_id, province, city, district, street, address, content, images, person, mobile, company_name, remark, visibility, budget_price, status, create_time FROM demand WHERE id = ? AND status != 3`;
      const params = [id];

      const res = <rpcResult>(
        await rpcPost("/select", { params, sql }, this.token)
      );

      if (res && res.code === 0) {
        const result = JSON.parse(res.data.result);
        if (result.length > 0) {
          const demand = result[0];
          
          // 如果是经纪人（role=10）查看需求详情，添加浏览记录
          if (userId && userRole == 10) {
            await this.addBrokerViewHistory(userId, id, demand.title);
          }
          
          // 格式化响应数据
          const response: DemandDetailResponse = demand

          return { msg: "ok", data: response };
        } else {
          return { msg: "not_found", data: null };
        }
      } else {
        return { msg: "get_detail_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }
  async getmyDemandDetail(id: number,user_id:number): Promise<ResponseData> {
    try {
      const sql = `SELECT id, title, user_id, type, category_id, province, city, district, street, address, content, images, person, mobile, company_name, remark, visibility, budget_price, status, create_time FROM demand WHERE id = ? AND user_id = ?`;
      const params = [id,user_id];

      const res = <rpcResult>(
        await rpcPost("/select", { params, sql }, this.token)
      );

      if (res && res.code === 0) {
        const result = JSON.parse(res.data.result);
        if (result.length > 0) {
          const demand = result[0];
          
          // 格式化响应数据
          const response: DemandDetailResponse = demand

          return { msg: "ok", data: response };
        } else {
          return { msg: "not_found", data: null };
        }
      } else {
        return { msg: "get_detail_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }
  /**
   * 关键词搜索需求
   * meilisearch,返回ids数组
   */ 
  async searchKeyword(keyword: string): Promise<any[]> {
    try {
      const meilisearch = new MeiliService('demand');
      const result = await meilisearch.search(keyword);
      console.log(result.hits);
      return result.hits.map((item: any) => item.id);
    } catch (error: any) {
      return [];
    }
  }
  /**
   * 获取需求列表
   */
  async getDemandList(query: DemandQueryModel): Promise<ResponseData> {
    try {
      // 确保 page 和 page_size 是数字类型
      const page = parseInt(query.page as any) || 1;
      const page_size = parseInt(query.page_size as any) || 20;
      const offset = (page - 1) * page_size;
      
      // 处理其他可能是字符串的数字参数
      const processedQuery = {
        ...query,
        page,
        page_size,
        status: query.status ? parseInt(query.status as any) : undefined,
        type: query.type ? parseInt(query.type as any) : undefined,
        category_id: query.category_id  ? parseInt(query.category_id as any) : undefined,
        province: query.province  ? parseInt(query.province as any) : undefined,
        city: query.city ? parseInt(query.city as any) : undefined,
        district: query.district  ? parseInt(query.district as any) : undefined,
        user_id: query.user_id ? parseInt(query.user_id as any) : undefined,
        visibility: query.visibility ? parseInt(query.visibility as any) : undefined,
      };
      
      // 构建查询条件
      const whereConditions: string[] = []; // 基础查询条件
      const params: any[] = [];
      
      // 默认只显示发布中的需求，除非明确指定状态
      // 但当查询的是“我的发布”（即包含 user_id）时，不强制限定为发布中
      if (processedQuery.status === undefined) {
        if (processedQuery.user_id === undefined) {
          whereConditions.push("status = 1"); // 公共列表默认只显示发布中
        }
      }

      // 可见性过滤
      // 规则：
      // - 经纪人(role=10)：不加默认可见性限制，除非显式传入 visibility
      // - 非经纪人：仅当未显式传入 visibility 时，默认限制为 visibility = 1
      if (processedQuery.role == 10 ||processedQuery.visibility !== undefined) {
        // whereConditions.push("visibility = ?");
        // params.push(processedQuery.visibility);
      } else {
        whereConditions.push("visibility = 1");
      }

      if (processedQuery.keyword) {
        const ids = await this.searchKeyword(processedQuery.keyword);
        if(ids.length>0){
          whereConditions.push(`id IN (${ids.map(() => '?').join(',')})`);
          params.push(...ids);
        }else{
          //没有词条件为 id=0
          whereConditions.push("id = 0"); 
        }
      }

      if (processedQuery.status !== undefined) {
        whereConditions.push("status = ?");
        params.push(processedQuery.status);
      }

      if (processedQuery.type !== undefined) {
        whereConditions.push("type = ?");
        params.push(processedQuery.type);
      }

      if (processedQuery.category_id !== undefined) {
        whereConditions.push("category_id = ?");
        params.push(processedQuery.category_id);
      }

      if (processedQuery.province !== undefined) {
        whereConditions.push("province = ?");
        params.push(processedQuery.province);
      }

      if (processedQuery.city !== undefined) {
        whereConditions.push("city = ?");
        params.push(processedQuery.city);
      }

      if (processedQuery.district !== undefined) {
        whereConditions.push("district = ?");
        params.push(processedQuery.district);
      }

      if (processedQuery.user_id !== undefined) {
        whereConditions.push("user_id = ?");
        params.push(processedQuery.user_id);
      }

      if (processedQuery.start_time !== undefined) {
        whereConditions.push("create_time >= ?");
        params.push(processedQuery.start_time);
      }

      if (processedQuery.end_time !== undefined) {
        whereConditions.push("create_time <= ?");
        params.push(processedQuery.end_time);
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

      // 排序
      const sortBy = query.sort_by || "create_time";
      const sortOrder = query.sort_order || "desc";
      const orderClause = `ORDER BY ${sortBy} ${sortOrder}`;

      // 查询总数
      const countSql = `SELECT COUNT(id) as total FROM demand ${whereClause}`; 
      const countRes = <rpcResult>(
        await rpcPost("/select", { params, sql: countSql }, this.token)
      );

      let total = 0;
      if (countRes && countRes.code === 0) {
        const countResult = JSON.parse(countRes.data.result);
        total = countResult[0]?.total || 0;
      }

      // 查询列表数据
      const listSql = `SELECT  id,title,user_id,status,create_time,type,province,city,district,street,address,images,person,mobile,company_name,visibility,budget_price FROM demand  ${whereClause} ${orderClause} LIMIT ${offset}, ${page_size} `;
      
      const listParams = [...params];
      
      const listRes = <rpcResult>(
        await rpcPost("/select", { params: listParams, sql: listSql }, this.token)
      );
      //console.log(listSql,listParams,listRes)
      //console.log(listSql,listParams,listRes)
      if (listRes && listRes.code === 0) {
        const listResult = JSON.parse(listRes.data.result);
        const list = listResult

        const response: DemandListResponse = {
          list,
          total,
          page,
          page_size,
          total_pages: Math.ceil(total / page_size),
        };

        return { msg: "ok", data: response };
      } else {
        return { msg: "query_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取我的需求列表
   */
  async getMyDemandList(userId: number, query: DemandQueryModel): Promise<ResponseData> {
    try {
      const queryWithUserId = { ...query, user_id: userId };
      return await this.getDemandList(queryWithUserId);
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取需求列表（经纪人权限 - 可以看到所有可见性的需求）
   */
  async getDemandListForBroker(query: DemandQueryModel): Promise<ResponseData> {
    try {
      const { page, page_size } = query;
      const offset = (page - 1) * page_size;
      
      // 构建查询条件（经纪人可以看到所有可见性的需求）
      const whereConditions: string[] = []; // 基础查询条件
      const params: any[] = [];

      // 默认只显示发布中的需求，除非明确指定状态
      if (query.status === undefined) {
        whereConditions.push("d.status = 1"); // 只显示发布中的需求
      }

      // 经纪人可以看到所有可见性的需求，不添加visibility过滤

      if (query.keyword) {
        const ids = await this.searchKeyword(query.keyword);
        if(ids.length>0){
          whereConditions.push(`d.id IN (${ids.map(() => '?').join(',')})`);
          params.push(...ids);
        }else{
          //没有词条件为 id=0
          whereConditions.push("d.id = 0"); 
        }
      }

      if (query.status !== undefined) {
        whereConditions.push("d.status = ?");
        params.push(query.status);
      }

      if (query.type !== undefined) {
        whereConditions.push("d.type = ?");
        params.push(query.type);
      }

      if (query.category_id !== undefined) {
        whereConditions.push("d.category_id = ?");
        params.push(query.category_id);
      }

      if (query.province !== undefined) {
        whereConditions.push("d.province = ?");
        params.push(query.province);
      }

      if (query.city !== undefined) {
        whereConditions.push("d.city = ?");
        params.push(query.city);
      }

      if (query.district !== undefined) {
        whereConditions.push("d.district = ?");
        params.push(query.district);
      }

      if (query.user_id !== undefined) {
        whereConditions.push("d.user_id = ?");
        params.push(query.user_id);
      }

      if (query.visibility !== undefined) {
        whereConditions.push("d.visibility = ?");
        params.push(query.visibility);
      }

      if (query.start_time !== undefined) {
        whereConditions.push("d.create_time >= ?");
        params.push(query.start_time);
      }

      if (query.end_time !== undefined) {
        whereConditions.push("d.create_time <= ?");
        params.push(query.end_time);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

      // 排序
      const sortBy = query.sort_by || "create_time";
      const sortOrder = query.sort_order || "desc";
      const orderClause = `ORDER BY d.${sortBy} ${sortOrder}`;
     
      // 查询总数
      const countSql = `SELECT COUNT(*) as total FROM demand d ${whereClause}`;

      const countRes = <rpcResult>(
        await rpcPost("/select", { params, sql: countSql }, this.token)
      );

      let total = 0;
      if (countRes && countRes.code === 0) {
        const countResult = JSON.parse(countRes.data.result);
        total = countResult[0]?.total || 0;
      }
      // 查询需求列表数据
      const listSql = `SELECT * FROM demand d ${whereClause} ${orderClause} LIMIT ?, ?`;

      const listParams = [...params, offset, page_size];
      const listRes = <rpcResult>(
        await rpcPost("/select", { params: listParams, sql: listSql }, this.token)
      );

      if (listRes && listRes.code === 0) {
        const listResult = JSON.parse(listRes.data.result);
        
        // 获取所有用户ID，用于查询发布者信息
        const userIds = [...new Set(listResult.map((item: any) => item.user_id))];
        
        // 分别查询用户信息和企业信息
        let publisherMap: { [key: number]: any } = {};
        
        if (userIds.length > 0) {
          // 查询用户基本信息
          const userSql = `SELECT id, nickname, avatar, role FROM entities WHERE id IN (${userIds.map(() => '?').join(',')})`;
          const userRes = <rpcResult>(
            await rpcPost("/select", { params: userIds, sql: userSql }, this.token)
          );
          
          if (userRes && userRes.code === 0) {
            const userResult = JSON.parse(userRes.data.result);
            userResult.forEach((user: any) => {
              publisherMap[user.id] = {
                id: user.id,
                nickname: user.nickname,
                avatar: user.avatar,
                role: user.role,
                company_name: ''
              };
            });
          }
          
          // 查询企业信息
          const companyInfoSql = `SELECT entity_id, company_name FROM entity_info WHERE entity_id IN (${userIds.map(() => '?').join(',')})`;
          const companyRes = <rpcResult>(
            await rpcPost("/select", { params: userIds, sql: companyInfoSql }, this.token)
          );
          
          if (companyRes && companyRes.code === 0) {
            const companyResult = JSON.parse(companyRes.data.result);
            companyResult.forEach((company: any) => {
              if (publisherMap[company.entity_id]) {
                publisherMap[company.entity_id].company_name = company.company_name;
              }
            });
          }
        }
        
        const list = listResult.map((item: any) => ({
          id: item.id,
          title: item.title,
          user_id: item.user_id,
          create_time: item.create_time,
          status: item.status,
          type: item.type,
          category_id: item.category_id,
          province: item.province,
          city: item.city,
          district: item.district,
          street: item.street,
          address: item.address,
          content: item.content.substring(0, 200) + (item.content.length > 200 ? '...' : ''), // 列表中只显示前200字符
          images: item.images,
          person: item.person,
          mobile: item.mobile,
          company_name: item.company_name,
          remark: item.remark,
          visibility: item.visibility,
          budget_price: item.budget_price,
          publisher: publisherMap[item.user_id] || {
            id: item.user_id,
            nickname: '',
            avatar: '',
            company_name: '',
            role: 0
          }
        }));

        const response: DemandListResponse = {
          list,
          total,
          page,
          page_size,
          total_pages: Math.ceil(total / page_size),
        };

        return { msg: "ok", data: response };
      } else {
        return { msg: "query_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新需求状态
   */
  async updateDemandStatus(id: number, status: number, userId: number, remark?: string): Promise<ResponseData> {
    try {
      const sql = `UPDATE demand SET status = ?, remark = ? WHERE id = ? AND user_id = ?`;
      const params = [status, remark || '', id, userId];

      const res = <rpcResult>(
        await rpcPost("/update", { params, sql }, this.token)
      );

      if (res && res.code === 0) {
        return { msg: "ok", data: { affectedRows: res.data } };
      } else {
        return { msg: "update_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 添加经纪人浏览记录
   */
  private async addBrokerViewHistory(brokerId: number, demandId: number, demandTitle: string): Promise<void> {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      
      // 检查是否已有浏览记录，避免重复记录
      const checkSql = `SELECT id FROM market_history WHERE broker_id = ? AND action_type = 'view' AND target_type = 'demand' AND target_id = ?`;
      
      const checkParams = [brokerId, demandId];
      
      const checkRes = <rpcResult>(
        await rpcPost("/select", { params: checkParams, sql: checkSql }, this.token)
      );
      
      if (checkRes && checkRes.code === 0) {
        const checkResult = JSON.parse(checkRes.data.result); 
        if (checkResult && checkResult.length > 0) {
          // 已有浏览记录，不重复添加
          return;
        }
      }
      
      // 添加浏览记录
      const insertSql = `INSERT INTO market_history (broker_id, action_type, target_type, target_id, title, content,result, extra_data, ip_address, user_agent, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `;
      
      const insertParams = [
        brokerId, 
        'view', 
        'demand', 
        demandId,
        demandTitle,
        `经纪人浏览需求详情 #${demandId}`,
        'success',
        JSON.stringify({ demand_id: demandId, demand_title: demandTitle }),
        '', // ip_address - 可以后续从request中获取
        '', // user_agent - 可以后续从request中获取
        currentTime
      ];
     
      await rpcPost("/insert", { params: insertParams, sql: insertSql }, this.token);
      
    } catch (error: any) {
      // 浏览记录添加失败不应该影响主要功能，只记录错误但不抛出
      console.error('Failed to add broker view history:', error);
    }
  }
}