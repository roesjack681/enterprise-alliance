import { ContactModel, ContactQueryParams, ContactStatistics } from "./proto";
import { ResponseData, TokenData } from "../app/proto";
import { rpcPost } from "../../common/common";

export interface IContactsService<TokenData> {
  queryContactsList(params: ContactQueryParams, userId: string): Promise<ResponseData>;
  searchContacts(keyword: string, userId: string, currentPage?: number, pageSize?: number): Promise<ResponseData>;
  getContactDetail(contactId: number, userId: string): Promise<ResponseData>;
  updateOnlineStatus(userId: string, status: string): Promise<ResponseData>;
  getContactsStatistics(userId: string): Promise<ResponseData>;
}

export class ContactsService implements IContactsService<TokenData> {
  protected token: string;

  constructor(tokenData: TokenData) {
    this.token = tokenData.token;
  }

  /**
   * 查询联系人列表
   */
  async queryContactsList(params: ContactQueryParams, userId: string): Promise<ResponseData> {
    try {
      const queryParams = {
        user_id: userId,
        keyword: params.keyword,
        role: params.role,
        status: params.status,
        department: params.department,
        current_page: params.current_page,
        page_size: params.page_size
      };

      const result = await rpcPost("contacts_query_list", [queryParams]);
      if (result.success) {
        return { msg: "ok", data: result.data };
      }
      return { msg: "query_failed", data: null };
    } catch (error) {
      console.error("查询联系人列表异常:", error);
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 搜索联系人
   */
  async searchContacts(keyword: string, userId: string, currentPage: number = 1, pageSize: number = 20): Promise<ResponseData> {
    try {
      const params = {
        user_id: userId,
        keyword: keyword,
        current_page: currentPage,
        page_size: pageSize
      };

      const result = await rpcPost("contacts_search", [params]);
      if (result.success) {
        return { msg: "ok", data: result.data };
      }
      return { msg: "search_failed", data: null };
    } catch (error) {
      console.error("搜索联系人异常:", error);
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取联系人详情
   */
  async getContactDetail(contactId: number, userId: string): Promise<ResponseData> {
    try {
      const params = {
        contact_id: contactId,
        user_id: userId
      };

      const result = await rpcPost("contacts_detail", [params]);
      if (result.success) {
        return { msg: "ok", data: result.data };
      }
      return { msg: "contact_not_found", data: null };
    } catch (error) {
      console.error("获取联系人详情异常:", error);
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新在线状态
   */
  async updateOnlineStatus(userId: string, status: string): Promise<ResponseData> {
    try {
      const updateData = {
        user_id: userId,
        online_status: status,
        last_active_time: Date.now()
      };

      const result = await rpcPost("contacts_update_online_status", [updateData]);
      if (result.success) {
        return { msg: "ok", data: null };
      }
      return { msg: "update_failed", data: null };
    } catch (error) {
      console.error("更新在线状态异常:", error);
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取联系人统计信息
   */
  async getContactsStatistics(userId: string): Promise<ResponseData> {
    try {
      const params = {
        user_id: userId
      };

      const result = await rpcPost("contacts_statistics", [params]);
      if (result.success) {
        return { msg: "ok", data: result.data };
      }
      return { msg: "query_failed", data: null };
    } catch (error) {
      console.error("获取联系人统计异常:", error);
      return { msg: "server_error", data: null };
    }
  }
}