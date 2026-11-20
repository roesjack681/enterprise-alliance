import {
  MarketStats,
  MarketGuest,
  MarketNeed,
  MarketHistory,
  MarketTask,
  MarketQueryParams,
  MarketListResponse,
  MarketGuestCreate,
  TeamMember,
  TeamListParams,
  UpdateTeamMemberTagsParams
} from "./proto";
import { ResponseData, TokenData, rpcResult } from "../app/proto";
import { rpcPost } from "../../common/common";

export interface IMarketService<TokenData> {
  // 统计相关
  getStats(brokerId: number): Promise<ResponseData>;
  updateStats(brokerId: number): Promise<ResponseData>;
  
  // 客户管理相关
  addGuest(data: MarketGuestCreate): Promise<ResponseData>;
  getGuestDetail(id: number, brokerId: number): Promise<ResponseData>;
  getGuestList(brokerId: number, params: MarketQueryParams): Promise<ResponseData>;
  
  // 需求跟进相关
  addNeed(data: MarketNeed): Promise<ResponseData>;
  updateNeed(data: MarketNeed): Promise<ResponseData>;
  getNeedDetail(id: number, brokerId: number): Promise<ResponseData>;
  getNeedList(brokerId: number, params: MarketQueryParams): Promise<ResponseData>;
  
  // 待办事项相关
  addTask(data: MarketTask): Promise<ResponseData>;
  updateTask(data: MarketTask): Promise<ResponseData>;
  getTaskDetail(id: number, brokerId: number): Promise<ResponseData>;
  getTaskList(brokerId: number, params: MarketQueryParams): Promise<ResponseData>;
  
  // 操作历史相关
  addHistory(data: MarketHistory): Promise<ResponseData>;
  getHistoryList(brokerId: number, params: MarketQueryParams): Promise<ResponseData>;
  
  // 趋势数据相关
  getIncomeTrend(brokerId: number, params: any): Promise<ResponseData>;
  
  // 团队管理相关
  getTeamList(entityId: number, params: TeamListParams): Promise<ResponseData>;
  updateTeamMemberTags(entityId: number, params: UpdateTeamMemberTagsParams): Promise<ResponseData>;
}

// ======================== 经纪人服务相关 ========================

export class MarketService implements IMarketService<TokenData> {
  protected token: string;
  
  constructor(token: string) {
    this.token = token;
  }

  /**
   * 获取经纪人统计数据
   */
  async getStats(brokerId: number): Promise<ResponseData> {
    try {
      const sql = `SELECT id, broker_id, total_guests, active_guests, success_rate, in_progress, completed, pending, monthly_income, total_income, this_month_deals, last_update_time, create_time FROM market_stats WHERE broker_id = ?`;
      const params = [brokerId];

      const res = <rpcResult>(
        await rpcPost("/select", { params, sql }, this.token)
      );


      if (res && res.code === 0) {
        const result = JSON.parse(res.data.result);
        //处理result为null的情况
        if (result === null) {
          return await this.createInitialStats(brokerId);
        }
        if (result.length > 0) {
          return { msg: "ok", data: result[0] };
        } else {
          // 如果没有统计数据，创建初始数据
          return await this.createInitialStats(brokerId);
        }
      } else {
        return { msg: "query_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 创建初始统计数据
   */
  private async createInitialStats(brokerId: number): Promise<ResponseData> {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const sql = `INSERT INTO market_stats (broker_id, create_time, last_update_time) VALUES (?, ?, ?)`;
      const params = [brokerId, currentTime, currentTime];

      const res = <rpcResult>(
        await rpcPost("/insert", { params, sql }, this.token)
      );

      if (res && res.code === 0) {
        return { msg: "ok", data: { id: res.data, broker_id: brokerId } };
      } else {
        return { msg: "insert_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新统计数据
   */
  async updateStats(brokerId: number): Promise<ResponseData> {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const startOfMonth = Math.floor(new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000);
      
      // 统计各项数据
      const statsQueries = [
        "SELECT COUNT(id) as total_guests FROM market_guest WHERE broker_id = ?",
        "SELECT COUNT(id) as active_guests FROM market_guest WHERE broker_id = ? AND status IN (1, 2)",
        "SELECT COUNT(id) as in_progress FROM market_need WHERE broker_id = ? AND status = 3",
        "SELECT COUNT(id) as completed FROM market_need WHERE broker_id = ? AND status = 4", 
        "SELECT COUNT(id) as pending FROM market_task WHERE broker_id = ? AND status = 0"
      ];

      let stats = {};
      
      for (const query of statsQueries) {
        const res = <rpcResult>(
          await rpcPost("/select", { params: [brokerId], sql: query }, this.token)
        );
        if (res && res.code === 0) {
          const result = JSON.parse(res.data.result);
          stats = { ...stats, ...result[0] };
        }
      }

      // 计算收入统计（从订单表查询，这里先用模拟数据）
      const monthlyIncome = Math.floor(Math.random() * 50000) + 10000; // 模拟本月收入
      const totalIncome = monthlyIncome * (Math.floor(Math.random() * 12) + 1); // 模拟总收入
      const thisMonthDeals = stats['completed'] || 0;

      // 计算成功率
      const totalContacts = stats['total_guests'] || 0;
      const successfulContacts = stats['completed'] || 0;
      const successRate = totalContacts > 0 ? (successfulContacts / totalContacts * 100).toFixed(2) : 0;

      // 更新统计表
      const updateSql = `UPDATE market_stats SET total_guests = ?, active_guests = ?, success_rate = ?, in_progress = ?, completed = ?, pending = ?, monthly_income = ?, total_income = ?, this_month_deals = ?, last_update_time = ? WHERE broker_id = ?`;
      const updateParams = [
        stats['total_guests'] || 0,
        stats['active_guests'] || 0,
        successRate,
        stats['in_progress'] || 0,
        stats['completed'] || 0,
        stats['pending'] || 0,
        monthlyIncome,
        totalIncome,
        thisMonthDeals,
        currentTime,
        brokerId
      ];

      const updateRes = <rpcResult>(
        await rpcPost("/update", { params: updateParams, sql: updateSql }, this.token)
      );
      
      if (updateRes && updateRes.code === 0) {
        return { msg: "ok", data: { affectedRows: updateRes.data } };
      } else {
        return { msg: "update_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 添加客户
   */
  async addGuest(data: MarketGuestCreate): Promise<ResponseData> {
    try {
      // 1. 首先查询企业基本信息
      const entitySql = "SELECT id, nickname, mobile,avatar, email, province, city, town, street FROM entities WHERE id = ?";
      const entityRes = <rpcResult>(
        await rpcPost("/select", { sql: entitySql, params: [data.entity_id] }, this.token)
      );
      
      if (entityRes.code !== 0 || !entityRes.data) {
        return { msg: "entity_not_found", data: null };
      }
      
      const entities = JSON.parse(entityRes.data.result);
      if (!Array.isArray(entities) || entities.length === 0) {
        return { msg: "entity_not_found", data: null };
      }
      
      const entity = entities[0];
      
      // 2. 查询企业详细信息
      const entityInfoSql = "SELECT name, logo,company_present_name, company_present_mobile, address FROM entity_detail_info WHERE entity_id = ?";
      const entityInfoRes = <rpcResult>(
        await rpcPost("/select", { sql: entityInfoSql, params: [data.entity_id] }, this.token)
      );
      
      let entityInfo = null;
      if (entityInfoRes.code === 0 && entityInfoRes.data) {
        const entityInfoList = JSON.parse(entityInfoRes.data.result);
        if (Array.isArray(entityInfoList) && entityInfoList.length > 0) {
          entityInfo = entityInfoList[0];
        }
      }
      
      // 3. 检查是否已经是客户
      const checkSql = "SELECT id FROM market_guest WHERE broker_id = ? AND entity_id = ?";
      const checkRes = <rpcResult>(
        await rpcPost("/select", { sql: checkSql, params: [data.broker_id, data.entity_id] }, this.token)
      );
      
      if (checkRes.code === 0 && checkRes.data) {
        const existingGuests = JSON.parse(checkRes.data.result);
        if (Array.isArray(existingGuests) && existingGuests.length > 0) {
          return { msg: "already_exists", data: null };
        }
      }
      
      // 4. 准备客户数据，优先使用传入的数据，否则使用企业信息
      const currentTime = Math.floor(Date.now() / 1000);
      const guestData = {
        enterprise_name: data.enterprise_name || entityInfo?.name || entity.nickname || '未知企业',
        logo: entityInfo?.logo ||entity.avatar|| '',
        contact_person: data.contact_person || entityInfo?.company_present_name || '未知联系人',
        contact_phone: data.contact_phone || entityInfo?.company_present_mobile || entity.mobile || '',
        contact_email: data.contact_email || entity.email || '',
        province: data.province || entity.province || 0,
        city: data.city || entity.city || 0,
        status: data.status || 0,
        tags: data.tags || '[]',
        remark: data.remark || `从企业信息自动导入: ${entityInfo?.name || entity.nickname}`
      };
      
      // 5. 插入客户记录
      const sql = `INSERT INTO market_guest (broker_id, entity_id, enterprise_name, logo, contact_person, contact_phone, contact_email, status, tags, remark, province, city, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const params = [
        data.broker_id, data.entity_id, guestData.enterprise_name, guestData.logo || '',
        guestData.contact_person, guestData.contact_phone, guestData.contact_email,
        guestData.status, guestData.tags, guestData.remark,
        guestData.province, guestData.city, currentTime, currentTime
      ];

      const res = <rpcResult>(
        await rpcPost("/insert", { params, sql }, this.token)
      );
      

      
      if (res && res.code === 0) {
        const guestId = typeof res.data === 'object' ? res.data.lastId : res.data;
        
        // 6. 记录操作历史
        // await this.addHistory({
        //   id: 0,
        //   broker_id: data.broker_id,
        //   action_type: 'contact',
        //   target_type: 'guest',
        //   target_id: guestId,
        //   title: `添加客户: ${guestData.enterprise_name}`,
        //   content: guestData.remark,
        //   result: '成功',
        //   extra_data: JSON.stringify({ entity_id: data.entity_id, auto_import: true }),
        //   ip_address: '',
        //   user_agent: '',
        //   create_time: currentTime
        // });

        return { msg: "ok", data: { id: guestId, guest_data: guestData } };
      } else {
        return { msg: "insert_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }



  /**
   * 获取客户详情
   */
  async getGuestDetail(id: number, brokerId: number): Promise<ResponseData> {
    try {
      const sql = `SELECT id, broker_id, entity_id, enterprise_name, logo, contact_person, contact_phone, contact_email, status, tags, remark, success_rate, follow_up_count, last_contact_time, next_contact_time, total_orders, total_amount, province, city, create_time, update_time FROM market_guest WHERE entity_id = ? AND broker_id = ?`;
      const params = [id, brokerId];

      const res = <rpcResult>(
        await rpcPost("/select", { params, sql }, this.token)
      );

      if (res && res.code === 0) {
        const result = JSON.parse(res.data.result);
        if (result.length > 0) {
          return { msg: "ok", data: result[0] };
        } else {
          return { msg: "not_found", data: null };
        }
      } else {
        return { msg: "query_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取客户列表
   */
  async getGuestList(brokerId: number, params: MarketQueryParams): Promise<ResponseData> {
    try {
      const page = params.page || 1;
      const pageSize = params.page_size || 20;
      const offset = (page - 1) * pageSize;

      const whereConditions: string[] = ["broker_id = ?"];
      const queryParams: any[] = [brokerId];

      if (params.keyword) {
        whereConditions.push("(enterprise_name LIKE ? OR contact_person LIKE ?)");
        queryParams.push(`%${params.keyword}%`, `%${params.keyword}%`);
      }

      if (params.status) {
        whereConditions.push("status = ?");
        queryParams.push(params.status);
      }

      const whereClause = whereConditions.join(" AND ");
      const sortBy = params.sort_by || "create_time";
      const sortOrder = params.sort_order || "desc";

      // 查询总数
      const countSql = `SELECT COUNT(id) as total FROM market_guest WHERE ${whereClause}`;
      const countRes = <rpcResult>(
        await rpcPost("/select", { params: queryParams, sql: countSql }, this.token)
      );

      let total = 0;
      if (countRes && countRes.code === 0) {
        const countResult = JSON.parse(countRes.data.result);
        total = countResult[0]?.total || 0;
      }

      // 查询列表
      const listSql = `SELECT id, broker_id, entity_id, enterprise_name, logo, contact_person, contact_phone, contact_email, status, tags, remark, success_rate, follow_up_count, last_contact_time, next_contact_time, total_orders, total_amount, province, city, create_time, update_time FROM market_guest WHERE ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ${offset}, ${pageSize}`;

      const listRes = <rpcResult>(
        await rpcPost("/select", { params: queryParams, sql: listSql }, this.token)
      );

      if (listRes && listRes.code === 0) {
        const listResult = JSON.parse(listRes.data.result);
        const response: MarketListResponse = {
          list: listResult,
          total,
          page,
          page_size: pageSize,
          total_pages: Math.ceil(total / pageSize),
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
   * 添加需求跟进
   */
  async addNeed(data: { broker_id: number; demand_id: number }): Promise<ResponseData> {
    try {
      // 1. 首先查询需求详细信息
      const demandSql = "SELECT id, title, user_id, type, category_id, province, city, district, address, content, person, mobile, company_name, visibility, budget_price FROM demand WHERE id = ? AND status != 3";
      const demandRes = <rpcResult>(
        await rpcPost("/select", { sql: demandSql, params: [data.demand_id] }, this.token)
      );
      
      if (demandRes.code !== 0 || !demandRes.data) {
        return { msg: "demand_not_found", data: null };
      }
      
      const demands = JSON.parse(demandRes.data.result);
      if (!Array.isArray(demands) || demands.length === 0) {
        return { msg: "demand_not_found", data: null };
      }
      
      const demand = demands[0];

      
      // 2. 检查是否已经在跟进
      const checkSql = "SELECT id FROM market_need WHERE broker_id = ? AND demand_id = ?";
      const checkRes = <rpcResult>(
        await rpcPost("/select", { sql: checkSql, params: [data.broker_id, data.demand_id] }, this.token)
      );
      
      if (checkRes.code === 0 && checkRes.data) {
        const existingNeeds = JSON.parse(checkRes.data.result);
        if (Array.isArray(existingNeeds) && existingNeeds.length > 0) {
  
          return { msg: "already_exists", data: null };
        }
      }
      
      // 3. 准备跟进数据
      const currentTime = Math.floor(Date.now() / 1000);
      const needData = {
        demand_title: demand.title || '未知需求',
        demand_type: demand.type || 1,
        budget_price: demand.budget_price || 0,
        entity_id: demand.user_id,
        status: 0,
        priority: 2, // 默认中等优先级
        remark: `从需求详情页添加的意向需求: ${demand.title}`
      };
      
      // 4. 插入需求跟进记录
      const sql = `INSERT INTO market_need (broker_id, demand_id, entity_id, demand_title, demand_type, budget_price, status, contact_method, quoted_price, success_probability, competitor_count, priority, remark, next_follow_time, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const params = [
        data.broker_id, data.demand_id, needData.entity_id, needData.demand_title,
        needData.demand_type, needData.budget_price, needData.status,
        '', 0, 0, 0, needData.priority, needData.remark,
        0, currentTime, currentTime
      ];

      const res = <rpcResult>(
        await rpcPost("/insert", { params, sql }, this.token)
      );
      
      if (res && res.code === 0) {
        return { msg: "ok", data: { id: res.data } };
      } else {
        return { msg: "insert_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新需求跟进
   */
  async updateNeed(data: MarketNeed): Promise<ResponseData> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];

      if (data.status !== undefined) {
        updateFields.push("status = ?");
        params.push(data.status);
      }
      if (data.contact_method !== undefined) {
        updateFields.push("contact_method = ?");
        params.push(data.contact_method);
      }
      if (data.quoted_price !== undefined) {
        updateFields.push("quoted_price = ?");
        params.push(data.quoted_price);
      }
      if (data.success_probability !== undefined) {
        updateFields.push("success_probability = ?");
        params.push(data.success_probability);
      }
      if (data.competitor_count !== undefined) {
        updateFields.push("competitor_count = ?");
        params.push(data.competitor_count);
      }
      if (data.priority !== undefined) {
        updateFields.push("priority = ?");
        params.push(data.priority);
      }
      if (data.remark !== undefined) {
        updateFields.push("remark = ?");
        params.push(data.remark);
      }
      if (data.next_follow_time !== undefined) {
        updateFields.push("next_follow_time = ?");
        params.push(data.next_follow_time);
      }

      if (updateFields.length === 0) {
        return { msg: "no_fields_to_update", data: null };
      }

      updateFields.push("update_time = ?", "last_follow_time = ?");
      params.push(Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000));

      const sql = `UPDATE market_need SET ${updateFields.join(", ")} WHERE id = ? AND broker_id = ?`;
      params.push(data.id, data.broker_id);

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
   * 获取需求跟进详情
   */
  async getNeedDetail(id: number, brokerId: number): Promise<ResponseData> {
    try {
      const sql = `SELECT id, broker_id, demand_id, entity_id, demand_title, demand_type, budget_price, status, contact_method, quoted_price, success_probability, competitor_count, remark, next_follow_time, first_contact_time, last_follow_time, priority, create_time, update_time FROM market_need WHERE id = ? AND broker_id = ?`;
      const params = [id, brokerId];

      const res = <rpcResult>(
        await rpcPost("/select", { params, sql }, this.token)
      );

      if (res && res.code === 0) {
        const result = JSON.parse(res.data.result);
        if (result.length > 0) {
          return { msg: "ok", data: result[0] };
        } else {
          return { msg: "not_found", data: null };
        }
      } else {
        return { msg: "query_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取需求跟进列表
   */
  async getNeedList(brokerId: number, params: MarketQueryParams): Promise<ResponseData> {
    try {
      const page = params.page || 1;
      const pageSize = params.page_size || 20;
      const offset = (page - 1) * pageSize;

      const whereConditions: string[] = ["broker_id = ?"];
      const queryParams: any[] = [brokerId];

      if (params.keyword) {
        whereConditions.push("demand_title LIKE ?");
        queryParams.push(`%${params.keyword}%`);
      }

      if (params.status) {
        whereConditions.push("status = ?");
        queryParams.push(params.status);
      }

      if (params.priority) {
        whereConditions.push("priority = ?");
        queryParams.push(params.priority);
      }

      const whereClause = whereConditions.join(" AND ");
      const sortBy = params.sort_by || "create_time";
      const sortOrder = params.sort_order || "desc";

      // 查询总数
      const countSql = `SELECT COUNT(id) as total FROM market_need WHERE ${whereClause}`;
      const countRes = <rpcResult>(
        await rpcPost("/select", { params: queryParams, sql: countSql }, this.token)
      );

      let total = 0;
      if (countRes && countRes.code === 0) {
        const countResult = JSON.parse(countRes.data.result);
        total = countResult[0]?.total || 0;
      }

      // 查询列表
      const listSql = `SELECT id, broker_id, demand_id, entity_id, demand_title, demand_type, budget_price, status, contact_method, quoted_price, success_probability, competitor_count, remark, next_follow_time, first_contact_time, last_follow_time, priority, create_time, update_time FROM market_need WHERE ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ${offset}, ${pageSize}`;

      const listRes = <rpcResult>(
        await rpcPost("/select", { params: queryParams, sql: listSql }, this.token)
      );

      if (listRes && listRes.code === 0) {
        const listResult = JSON.parse(listRes.data.result);
        const response: MarketListResponse = {
          list: listResult,
          total,
          page,
          page_size: pageSize,
          total_pages: Math.ceil(total / pageSize),
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
   * 添加待办事项
   */
  async addTask(data: MarketTask): Promise<ResponseData> {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const sql = `INSERT INTO market_task (broker_id, title, content, task_type, priority, related_type, related_id, scheduled_time, reminder_time, estimated_duration, remark, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const params = [
        data.broker_id, data.title, data.content || '', data.task_type,
        data.priority || 1, data.related_type || '', data.related_id || 0,
        data.scheduled_time || 0, data.reminder_time || 0, data.estimated_duration || 0,
        data.remark || '', currentTime, currentTime
      ];

      const res = <rpcResult>(
        await rpcPost("/insert", { params, sql }, this.token)
      );

      if (res && res.code === 0) {
        return { msg: "ok", data: { id: res.data } };
      } else {
        return { msg: "insert_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新待办事项
   */
  async updateTask(data: MarketTask): Promise<ResponseData> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];

      if (data.title !== undefined) {
        updateFields.push("title = ?");
        params.push(data.title);
      }
      if (data.content !== undefined) {
        updateFields.push("content = ?");
        params.push(data.content);
      }
      if (data.task_type !== undefined) {
        updateFields.push("task_type = ?");
        params.push(data.task_type);
      }
      if (data.priority !== undefined) {
        updateFields.push("priority = ?");
        params.push(data.priority);
      }
      if (data.status !== undefined) {
        updateFields.push("status = ?");
        params.push(data.status);
        if (data.status === 2) { // 已完成
          updateFields.push("completed_time = ?");
          params.push(Math.floor(Date.now() / 1000));
        }
      }
      if (data.scheduled_time !== undefined) {
        updateFields.push("scheduled_time = ?");
        params.push(data.scheduled_time);
      }
      if (data.reminder_time !== undefined) {
        updateFields.push("reminder_time = ?");
        params.push(data.reminder_time);
      }
      if (data.estimated_duration !== undefined) {
        updateFields.push("estimated_duration = ?");
        params.push(data.estimated_duration);
      }
      if (data.actual_duration !== undefined) {
        updateFields.push("actual_duration = ?");
        params.push(data.actual_duration);
      }
      if (data.remark !== undefined) {
        updateFields.push("remark = ?");
        params.push(data.remark);
      }

      if (updateFields.length === 0) {
        return { msg: "no_fields_to_update", data: null };
      }

      updateFields.push("update_time = ?");
      params.push(Math.floor(Date.now() / 1000));

      const sql = `UPDATE market_task SET ${updateFields.join(", ")} WHERE id = ? AND broker_id = ?`;
      params.push(data.id, data.broker_id);

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
   * 获取待办事项详情
   */
  async getTaskDetail(id: number, brokerId: number): Promise<ResponseData> {
    try {
      const sql = `SELECT id, broker_id, title, content, task_type, priority, status, related_type, related_id, scheduled_time, completed_time, reminder_time, is_reminded, estimated_duration, actual_duration, remark, create_time, update_time FROM market_task WHERE id = ? AND broker_id = ?`;
      const params = [id, brokerId];

      const res = <rpcResult>(
        await rpcPost("/select", { params, sql }, this.token)
      );

      if (res && res.code === 0) {
        const result = JSON.parse(res.data.result);
        if (result.length > 0) {
          return { msg: "ok", data: result[0] };
        } else {
          return { msg: "not_found", data: null };
        }
      } else {
        return { msg: "query_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取待办事项列表
   */
  async getTaskList(brokerId: number, params: MarketQueryParams): Promise<ResponseData> {
    try {
      const page = params.page || 1;
      const pageSize = params.page_size || 20;
      const offset = (page - 1) * pageSize;

      const whereConditions: string[] = ["broker_id = ?"];
      const queryParams: any[] = [brokerId];

      if (params.keyword) {
        whereConditions.push("title LIKE ?");
        queryParams.push(`%${params.keyword}%`);
      }

      if (params.type) {
        whereConditions.push("task_type = ?");
        queryParams.push(params.type);
      }

      if (params.status !== undefined) {
        whereConditions.push("status = ?");
        queryParams.push(params.status);
      }

      if (params.priority) {
        whereConditions.push("priority = ?");
        queryParams.push(params.priority);
      }

      const whereClause = whereConditions.join(" AND ");
      const sortBy = params.sort_by || "create_time";
      const sortOrder = params.sort_order || "desc";

      // 查询总数
      const countSql = `SELECT COUNT(id) as total FROM market_task WHERE ${whereClause}`;
      const countRes = <rpcResult>(
        await rpcPost("/select", { params: queryParams, sql: countSql }, this.token)
      );

      let total = 0;
      if (countRes && countRes.code === 0) {
        const countResult = JSON.parse(countRes.data.result);
        total = countResult[0]?.total || 0;
      }

      // 查询列表
      const listSql = `SELECT id, broker_id, title, content, task_type, priority, status, related_type, related_id, scheduled_time, completed_time, reminder_time, is_reminded, estimated_duration, actual_duration, remark, create_time, update_time FROM market_task WHERE ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ${offset}, ${pageSize}`;

      const listRes = <rpcResult>(
        await rpcPost("/select", { params: queryParams, sql: listSql }, this.token)
      );

      if (listRes && listRes.code === 0) {
        const listResult = JSON.parse(listRes.data.result);
        const response: MarketListResponse = {
          list: listResult,
          total,
          page,
          page_size: pageSize,
          total_pages: Math.ceil(total / pageSize),
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
   * 添加操作历史
   */
  async addHistory(data: MarketHistory): Promise<ResponseData> {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const sql = `INSERT INTO market_history (broker_id, action_type, target_type, target_id, title, content, result, extra_data, ip_address, user_agent, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const params = [
        data.broker_id, data.action_type, data.target_type, data.target_id,
        data.title, data.content || '', data.result || '', data.extra_data || '{}',
        data.ip_address || '', data.user_agent || '', currentTime
      ];

      const res = <rpcResult>(
        await rpcPost("/insert", { params, sql }, this.token)
      );

      if (res && res.code === 0) {
        return { msg: "ok", data: { id: res.data } };
      } else {
        return { msg: "insert_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取操作历史列表
   */
  async getHistoryList(brokerId: number, params: MarketQueryParams): Promise<ResponseData> {
    try {
      const page = params.page || 1;
      const pageSize = params.page_size || 20;
      const offset = (page - 1) * pageSize;

      const whereConditions: string[] = ["broker_id = ?"];
      const queryParams: any[] = [brokerId];

      if (params.action_type) {
        whereConditions.push("action_type = ?");
        queryParams.push(params.action_type);
      }

      if (params.start_time) {
        whereConditions.push("create_time >= ?");
        queryParams.push(params.start_time);
      }

      if (params.end_time) {
        whereConditions.push("create_time <= ?");
        queryParams.push(params.end_time);
      }

      const whereClause = whereConditions.join(" AND ");
      const sortBy = params.sort_by || "create_time";
      const sortOrder = params.sort_order || "desc";

      // 查询总数
      const countSql = `SELECT COUNT(id) as total FROM market_history WHERE ${whereClause}`;
      const countRes = <rpcResult>(
        await rpcPost("/select", { params: queryParams, sql: countSql }, this.token)
      );

      let total = 0;
      if (countRes && countRes.code === 0) {
        const countResult = JSON.parse(countRes.data.result);
        total = countResult[0]?.total || 0;
      }

      // 查询列表
      const listSql = `SELECT id, broker_id, action_type, target_type, target_id, title, content, result, extra_data, ip_address, user_agent, create_time FROM market_history WHERE ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ${offset}, ${pageSize}`;

      const listRes = <rpcResult>(
        await rpcPost("/select", { params: queryParams, sql: listSql }, this.token)
      );

      if (listRes && listRes.code === 0) {
        const listResult = JSON.parse(listRes.data.result);
        const response: MarketListResponse = {
          list: listResult,
          total,
          page,
          page_size: pageSize,
          total_pages: Math.ceil(total / pageSize),
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
   * 获取收入趋势数据
   */
  async getIncomeTrend(brokerId: number, params: any): Promise<ResponseData> {
    try {
      const days = params.days || 7; // 默认7天
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime - (days * 24 * 3600);
      
      // 模拟近7天的收入数据，实际项目中应该从订单表或收入记录表查询
      const trendData = [];
      const baseIncome = 1000;
      
      for (let i = 0; i < days; i++) {
        const dayTime = startTime + (i * 24 * 3600);
        const date = new Date(dayTime * 1000);
        const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
        
        // 模拟数据，实际应该查询数据库
        const income = Math.floor(baseIncome + Math.random() * 1000);
        
        trendData.push({
          date: date.toISOString().split('T')[0],
          day_label: dayOfWeek,
          income: income,
          orders: Math.floor(income / 200) // 模拟订单数
        });
      }

      return { msg: "ok", data: trendData };
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  // ======================== 团队管理相关 ========================
  
  /**
   * 获取团队列表（上级和下级）
   */
  async getTeamList(entityId: number, params: TeamListParams): Promise<ResponseData> {
    try {
     
      // 计算分表后缀
      const tableSuffix = entityId % 10;
      
      // 查询上级关系（我的上级）
      const superiorSql = `SELECT id, entity_id, pid, diff, role, tags, create_time FROM relation_p_${tableSuffix} WHERE entity_id = ? AND diff = 1`;
      const superiorResult = <rpcResult>(
        await rpcPost("/select", { sql: superiorSql, params: [entityId] }, this.token)
      );
     
      // 查询下级关系（我的团队，2级）
      const subordinateSql = `SELECT id, entity_id, sid, diff, role, tags, create_time FROM relation_s_${tableSuffix} WHERE entity_id = ? AND diff = 1 ORDER BY diff ASC, create_time DESC`;
      const subordinateResult = <rpcResult>(
        await rpcPost("/select", { sql: subordinateSql, params: [entityId] }, this.token)
      );      
      if (superiorResult.code !== 0 || subordinateResult.code !== 0) {
        return { msg: "database_error", data: null };
      }
      
      // 收集所有相关的 entity_id
      const allEntityIds: number[] = [];
      const relationMap: { [key: number]: any } = {};
      
      // 处理上级关系
      if (superiorResult.data && superiorResult.data.result) {
        const superiorData = JSON.parse(superiorResult.data.result); 
        if (Array.isArray(superiorData)) {
          superiorData.forEach((item: any) => {
            if (item.pid && !allEntityIds.includes(item.pid)) {
              allEntityIds.push(item.pid);
              relationMap[item.pid] = {
                ...item,
                relation_type: 'superior',
                target_entity_id: item.pid
              };
            }
          });
        }
      }
      
      // 处理下级关系
      if (subordinateResult.data && subordinateResult.data.result) {
        const subordinateData = JSON.parse(subordinateResult.data.result); 
        if (Array.isArray(subordinateData)) {
          subordinateData.forEach((item: any) => {
            if (item.sid && !allEntityIds.includes(item.sid)) {
              allEntityIds.push(item.sid);
              relationMap[item.sid] = {
                ...item,
                relation_type: 'subordinate',
                target_entity_id: item.sid
              };
            }
          });
        }
      }
      
      if (allEntityIds.length === 0) {
        return {
          msg: "ok",
          data: {
            list: [],           
          }
        };
      }
        // 查询企业信息
        const entityIdPlaceholders = allEntityIds.map(() => '?').join(',');
        let enterpriseSql = `SELECT id, nickname, avatar, mobile, email, province, city, create_time FROM entities WHERE id IN (${entityIdPlaceholders}) AND status = 1`;
      
      // 构建查询参数
      let queryParams: any[] = [...allEntityIds];      
      
      
      const enterpriseResult = <rpcResult>(
        await rpcPost("/select", { sql: enterpriseSql, params: queryParams }, this.token)
      );
        if (enterpriseResult.code !== 0) {
          return { msg: "database_error", data: null };
        }
        
        // 组合数据
        const enterpriseData = enterpriseResult.data && enterpriseResult.data.result ? 
          JSON.parse(enterpriseResult.data.result) : [];
        
        const teamMembers: TeamMember[] = Array.isArray(enterpriseData) ? 
          enterpriseData.map((enterprise: any) => {
          const relation = relationMap[enterprise.id];
          return {
            id: enterprise.id,
            entity_id: enterprise.id,
            enterprise_name: enterprise.nickname || '未命名企业',
            logo: enterprise.avatar || '',
            contact_person: enterprise.nickname || '未知联系人',
            contact_phone: enterprise.mobile || '',
            contact_email: enterprise.email || '',
            province: enterprise.province || 0,
            city: enterprise.city || 0,
            role: relation?.role || 0,
            diff: relation?.diff || 0,
            tags: relation?.tags || '',
            relation_type: relation?.relation_type || 'subordinate',
            create_time: enterprise.create_time || 0
          };
        }) : [];
      
      
      return {
        msg: "ok",
        data: {
          list: teamMembers,          
        }
      };
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新团队成员标签
   */
  async updateTeamMemberTags(entityId: number, params: UpdateTeamMemberTagsParams): Promise<ResponseData> {
    try {
      const { target_entity_id, tags } = params;
      
      // 验证标签数量和长度
      if (!Array.isArray(tags)) {
        return { msg: "invalid_tag_format", data: null };
      }
      
      if (tags.length > 5) {
        return { msg: "too_many_tags", data: null };
      }
      
      for (const tag of tags) {
        if (!tag.name || tag.name.length > 10 || !tag.color) {
          return { msg: "invalid_tag_name", data: null };
        }
      }
      
      // 计算分表后缀
      const tableSuffix = entityId % 10;
      
      // 简化标签数据结构，只保留 n(name) 和 c(color)
      const processedTags = tags.map(tag => ({
        n: tag.name,
        c: tag.color
      }));
      
      const tagsJson = JSON.stringify(processedTags);
      
      // 先查找关系记录，确定是上级关系还是下级关系
      // 查询上级关系（我的上级）
      const superiorSql = `SELECT id FROM relation_p_${tableSuffix} WHERE entity_id = ? AND pid = ?`;
      const superiorResult = <rpcResult>(
        await rpcPost("/select", { sql: superiorSql, params: [entityId, target_entity_id] }, this.token)
      );
      
      if (superiorResult.code === 0 && superiorResult.data && superiorResult.data.result) {
        const superiorData = JSON.parse(superiorResult.data.result);
        if (Array.isArray(superiorData) && superiorData.length > 0) {
          // 找到上级关系，更新上级关系表
          const relationId = superiorData[0].id;
          const updateSql = `UPDATE relation_p_${tableSuffix} SET tags = ? WHERE id = ?`;
          const updateResult = <rpcResult>(
            await rpcPost("/update", { 
              sql: updateSql, 
              params: [tagsJson, relationId]
            }, this.token)
          );
          
          if (updateResult.code === 0) {
            return { msg: "ok", data: { updated: true, relation_type: 'superior', relation_id: relationId } };
          }
        }
      }
      
      // 查询下级关系（我的下级）
      const subordinateSql = `SELECT id FROM relation_s_${tableSuffix} WHERE entity_id = ? AND sid = ?`;
      const subordinateResult = <rpcResult>(
        await rpcPost("/select", { sql: subordinateSql, params: [entityId, target_entity_id] }, this.token)
      );
      
      if (subordinateResult.code === 0 && subordinateResult.data && subordinateResult.data.result) {
        const subordinateData = JSON.parse(subordinateResult.data.result);
        if (Array.isArray(subordinateData) && subordinateData.length > 0) {
          // 找到下级关系，更新下级关系表
          const relationId = subordinateData[0].id;
          const updateSql = `UPDATE relation_s_${tableSuffix} SET tags = ? WHERE id = ?`;
          const updateResult = <rpcResult>(
            await rpcPost("/update", { 
              sql: updateSql, 
              params: [tagsJson, relationId]
            }, this.token)
          );
          
          if (updateResult.code === 0) {
            return { msg: "ok", data: { updated: true, relation_type: 'subordinate', relation_id: relationId } };
          }
        }
      }
      
      // 如果两个表都没有找到关系，说明关系不存在
      return { msg: "relation_not_found", data: null };
      
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }
}