import { Request, Response } from "express";
import { ContactsService } from "./service";
import {
  httpSuccess,
  http400Error,
  handleException,
} from "../../common/common";
import { getLang } from "../../lang";

// ======================== 通讯录相关接口 ========================

/**
 * 查询联系人列表
 */
export const queryContactsList = async (req: Request, res: Response) => {
  try {
    const service = new ContactsService({ token: req["token"] });
    const userId = req["entity_id"];
    const params = {
      keyword: req.body.keyword,
      role: req.body.role,
      status: req.body.status,
      department: req.body.department,
      current_page: req.body.current_page,
      page_size: req.body.page_size
    };

    const result = await service.queryContactsList(params, userId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("query_success")),
      query_failed: () => http400Error(res, getLang("query_failed")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "queryContactsList");
  }
};

/**
 * 搜索联系人
 */
export const searchContacts = async (req: Request, res: Response) => {
  try {
    const service = new ContactsService({ token: req["token"] });
    const userId = req["entity_id"];
    const keyword = req.body.keyword;
    const currentPage = req.body.current_page || 1;
    const pageSize = req.body.page_size || 20;

    const result = await service.searchContacts(keyword, userId, currentPage, pageSize);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("search_success")),
      search_failed: () => http400Error(res, getLang("search_failed")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "searchContacts");
  }
};

/**
 * 获取联系人详情
 */
export const getContactDetail = async (req: Request, res: Response) => {
  try {
    const service = new ContactsService({ token: req["token"] });
    const userId = req["entity_id"];
    const contactId = req.body.contact_id;

    const result = await service.getContactDetail(contactId, userId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("query_success")),
      contact_not_found: () => http400Error(res, getLang("contact_not_found")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getContactDetail");
  }
};

/**
 * 更新在线状态
 */
export const updateOnlineStatus = async (req: Request, res: Response) => {
  try {
    const service = new ContactsService({ token: req["token"] });
    const userId = req["entity_id"];
    const status = req.body.status;

    const result = await service.updateOnlineStatus(userId, status);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("update_success")),
      update_failed: () => http400Error(res, getLang("update_failed")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "updateOnlineStatus");
  }
};

/**
 * 获取联系人统计信息
 */
export const getContactsStatistics = async (req: Request, res: Response) => {
  try {
    const service = new ContactsService({ token: req["token"] });
    const userId = req["entity_id"];

    const result = await service.getContactsStatistics(userId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("query_success")),
      query_failed: () => http400Error(res, getLang("query_failed")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getContactsStatistics");
  }
};