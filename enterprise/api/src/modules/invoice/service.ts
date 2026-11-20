import {
  InvoiceModel,
  InvoiceQueryModel,
  InvoiceDetailModel,
  InvoiceUpdateModel,
  SetDefaultInvoiceModel,
} from "./proto";
import { ResponseData, TokenData } from "../app/proto";
import { rpcPost } from "../../common/common";

export interface IInvoiceService<TokenData> {
  // 发票管理相关方法
  createInvoice(data: InvoiceModel): Promise<ResponseData>;
  updateInvoice(data: InvoiceUpdateModel): Promise<ResponseData>;
  deleteInvoice(id: number, entityId: number): Promise<ResponseData>;
  getInvoiceDetail(id: number, entityId: number): Promise<ResponseData>;
  getInvoiceList(query: InvoiceQueryModel): Promise<ResponseData>;
  setDefaultInvoice(data: SetDefaultInvoiceModel): Promise<ResponseData>;
  getDefaultInvoice(entityId: number): Promise<ResponseData>;
}

// ======================== 发票管理服务相关 ========================

export class InvoiceService implements IInvoiceService<TokenData> {
  protected token: string;
  constructor(token: string) {
    this.token = token;
  }

  /**
   * 创建发票信息
   */
  async createInvoice(data: InvoiceModel): Promise<ResponseData> {
    try {
      // 如果设置为默认发票，先将其他发票的默认状态清除
      if (data.is_default === 1) {
        const clearDefaultSql = "UPDATE invoices SET is_default = 0 WHERE entity_id = ? AND status = 1";
        await rpcPost("/update", {
          sql: clearDefaultSql,
          params: [data.entity_id],
        }, this.token);
      }

      const sql = "INSERT INTO invoices (title, tax_number, invoice_type, company_address, company_phone, bank_name, bank_account, entity_id, is_default, status, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const params = [
        data.title,
        data.tax_number,
        data.invoice_type,
        data.company_address || "",
        data.company_phone || "",
        data.bank_name || "",
        data.bank_account || "",
        data.entity_id,
        data.is_default || 0,
        1, // status 默认为正常
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000),
      ];
    
      const result = await rpcPost("/insert", {
        sql: sql,
        params: params,
      }, this.token); 
     
      if (result.code == 0 && result.data && result.data.lastId) {
        return { msg: "ok", data: { id: result.data.lastId } };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      console.error("创建发票信息失败:", error);
      return { msg: "err", data: null };
    }
  }

  /**
   * 更新发票信息
   */
  async updateInvoice(data: InvoiceUpdateModel): Promise<ResponseData> {
    try {
      // 首先验证发票是否存在且属于当前用户
      const checkSql = "SELECT entity_id FROM invoices WHERE id = ? AND status = 1";
      const checkResult = await rpcPost("/select", {
        sql: checkSql,
        params: [data.id],
      }, this.token);

      // 参考列表查询的方式解析JSON数据
      const checkData = JSON.parse(checkResult.data.result) || [];

      if (!checkData || checkData.length === 0) {
        return { msg: "not_found", data: null };
      }

      const entityId = checkData[0].entity_id;

      // 如果设置为默认发票，先将其他发票的默认状态清除
      if (data.is_default === 1) {
        const clearDefaultSql = "UPDATE invoices SET is_default = 0 WHERE entity_id = ? AND status = 1 AND id != ?";
        await rpcPost("/update", {
          sql: clearDefaultSql,
          params: [entityId, data.id],
        }, this.token);
      }

      // 构建动态更新SQL
      const updateFields = [];
      const updateValues = [];

      if (data.title !== undefined) {
        updateFields.push("title = ?");
        updateValues.push(data.title);
      }
      if (data.tax_number !== undefined) {
        updateFields.push("tax_number = ?");
        updateValues.push(data.tax_number);
      }
      if (data.invoice_type !== undefined) {
        updateFields.push("invoice_type = ?");
        updateValues.push(data.invoice_type);
      }
      if (data.company_address !== undefined) {
        updateFields.push("company_address = ?");
        updateValues.push(data.company_address);
      }
      if (data.company_phone !== undefined) {
        updateFields.push("company_phone = ?");
        updateValues.push(data.company_phone);
      }
      if (data.bank_name !== undefined) {
        updateFields.push("bank_name = ?");
        updateValues.push(data.bank_name);
      }
      if (data.bank_account !== undefined) {
        updateFields.push("bank_account = ?");
        updateValues.push(data.bank_account);
      }
      if (data.is_default !== undefined) {
        updateFields.push("is_default = ?");
        updateValues.push(data.is_default);
      }

      if (updateFields.length === 0) {
        return { msg: "no_changes", data: null };
      }

      updateFields.push("update_time = ?");
      updateValues.push(Math.floor(Date.now() / 1000));
      updateValues.push(data.id);

      const sql = `UPDATE invoices SET ${updateFields.join(", ")} WHERE id = ? AND status = 1`;

      const result = await rpcPost("/update", {
        sql: sql,
        params: updateValues,
      }, this.token);

      if (result.code == 0) {
        return { msg: "ok", data: null };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      console.error("更新发票信息失败:", error);
      return { msg: "err", data: null };
    }
  }

  /**
   * 删除发票信息（软删除）
   */
  async deleteInvoice(id: number, entityId: number): Promise<ResponseData> {
    try {
      // 验证发票是否存在且属于当前用户
      const checkSql = "SELECT id, is_default FROM invoices WHERE id = ? AND entity_id = ? AND status = 1";
      const checkResult = await rpcPost("/select", {
        sql: checkSql,
        params: [id, entityId],
      }, this.token);

      // 参考列表查询的方式解析JSON数据
      const checkData = JSON.parse(checkResult.data.result) || [];

      if (!checkData || checkData.length === 0) {
        return { msg: "not_found", data: null };
      }

      // 软删除发票
      const sql = "UPDATE invoices SET status = 0, update_time = ? WHERE id = ? AND entity_id = ?";
      const result = await rpcPost("/update", {
        sql: sql,
        params: [Math.floor(Date.now() / 1000), id, entityId],
      }, this.token);

      if (result.code == 0) {
        return { msg: "ok", data: null };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      console.error("删除发票信息失败:", error);
      return { msg: "err", data: null };
    }
  }

  /**
   * 获取发票详情
   */
  async getInvoiceDetail(id: number, entityId: number): Promise<ResponseData> {
    try {
      
      const sql = "SELECT id, title, tax_number, invoice_type, company_address, company_phone, bank_name, bank_account, entity_id, is_default, status, create_time,update_time FROM invoices WHERE id = ? AND entity_id = ? AND status = 1";

      const result = await rpcPost("/select", {
        sql: sql,
        params: [id, entityId],
      }, this.token);


      // 参考列表查询的方式解析JSON数据
      const data = JSON.parse(result.data.result) || [];

      if (data && data.length > 0) {
        return { msg: "ok", data: data[0] };
      } else {
        return { msg: "not_found", data: null };
      }
    } catch (error) {
      console.error("获取发票详情失败:", error);
      return { msg: "err", data: null };
    }
  }

  /**
   * 获取发票列表
   */
  async getInvoiceList(query: InvoiceQueryModel): Promise<ResponseData> {
    try {
      let whereConditions = ["entity_id = ?", "status = 1"];
      let queryParams: any[] = [query.entity_id];

      // 添加筛选条件
      if (query.invoice_type) {
        whereConditions.push("invoice_type = ?");
        queryParams.push(query.invoice_type);
      }

      if (query.status !== undefined) {
        whereConditions[1] = "status = ?"; // 更新状态条件
        queryParams.push(+query.status);
      }

      const whereClause = whereConditions.join(" AND ");
      
      // 获取总数
      const countSql = `SELECT COUNT(id) as total FROM invoices WHERE ${whereClause}`;
      
      const countResult = await rpcPost("/select", {
        sql: countSql,
        params: queryParams,
      }, this.token);

      const total = countResult.data[0]?.total || 0;

      // 获取分页数据
      const offset = (query.page - 1) * query.page_size;
      const listSql = `SELECT id, title, tax_number, invoice_type, company_address, company_phone, bank_name, bank_account, entity_id, is_default, status,  create_time,update_time FROM invoices WHERE ${whereClause} ORDER BY is_default DESC, create_time DESC LIMIT ${query.page_size} OFFSET ${offset}`;

      //queryParams.push(query.page_size, offset);
       
      const listResult = await rpcPost("/select", {
        sql: listSql,
        params: queryParams,
      }, this.token);
      return {
        msg: "ok",
        data: {
          list: JSON.parse(listResult.data.result) || [],
          total: total,
          page: query.page,
          page_size: query.page_size,
          total_pages: Math.ceil(total / query.page_size),
        },
      };
    } catch (error) {
      console.error("获取发票列表失败:", error);
      return { msg: "err", data: null };
    }
  }

  /**
   * 设置默认发票
   */
  async setDefaultInvoice(data: SetDefaultInvoiceModel): Promise<ResponseData> {
    try {
      
      // 验证发票是否存在且属于当前用户
      const checkSql = "SELECT id FROM invoices WHERE id = ? AND entity_id = ? AND status = 1";
      const checkResult = await rpcPost("/select", {
        sql: checkSql,
        params: [data.id, data.entity_id],
      }, this.token);


      // 参考列表查询的方式解析JSON数据
      const checkData = JSON.parse(checkResult.data.result) || [];

      if (!checkData || checkData.length === 0) {
        return { msg: "not_found", data: null };
      }

      // 先将所有发票的默认状态清除
      const clearDefaultSql = "UPDATE invoices SET is_default = 0 WHERE entity_id = ? AND status = 1";
      const clearResult = await rpcPost("/update", {
        sql: clearDefaultSql,
        params: [data.entity_id],
      }, this.token);


      // 设置指定发票为默认
      const setDefaultSql = "UPDATE invoices SET is_default = 1, update_time = ? WHERE id = ? AND entity_id = ?";
      const result = await rpcPost("/update", {
        sql: setDefaultSql,
        params: [Math.floor(Date.now() / 1000), data.id, data.entity_id],
      }, this.token);


      if (result.code==0 ) {
        return { msg: "ok", data:null};
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      console.error("设置默认发票失败:", error);
      return { msg: "err", data: null };
    }
  }

  /**
   * 获取默认发票
   */
  async getDefaultInvoice(entityId: number): Promise<ResponseData> {
    try {
      const sql = "SELECT id, title, tax_number, invoice_type, company_address, company_phone, bank_name, bank_account, entity_id, is_default, status, create_time, update_time FROM invoices WHERE entity_id = ? AND is_default = 1 AND status = 1 LIMIT 1";

      const result = await rpcPost("/select", {
        sql: sql,
        params: [entityId],
      }, this.token);

      // 参考列表查询的方式解析JSON数据
      const data = JSON.parse(result.data.result) || [];

      if (data && data.length > 0) {
        return { msg: "ok", data: data[0] };
      } else {
        return { msg: "no_default", data: null };
      }
    } catch (error) {
      console.error("获取默认发票失败:", error);
      return { msg: "err", data: null };
    }
  }
}