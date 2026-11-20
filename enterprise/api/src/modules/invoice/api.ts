import { Request, Response } from "express";
import { InvoiceService } from "./service";
import {
  httpSuccess,
  http400Error,
  handleException,
} from "../../common/common";
import { getLang } from "../../lang";

// ======================== 发票管理相关接口 ========================

/**
 * 创建发票信息
 */
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const service = new InvoiceService(req["token"]);
    const data = { ...req.body, entity_id: req["entity_id"] };
    const result = await service.createInvoice(data);
   
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "createInvoice");
  }
};

/**
 * 更新发票信息
 */
export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const service = new InvoiceService(req["token"]);
    const result = await service.updateInvoice(req.body);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      not_found: () => http400Error(res, getLang("not_found")),
      no_changes: () => http400Error(res, getLang("no_changes")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "updateInvoice");
  }
};

/**
 * 删除发票信息
 */
export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const service = new InvoiceService(req["token"]);
    const { id } = req.body;
    const entityId = req["entity_id"];
    const result = await service.deleteInvoice(id, entityId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      not_found: () => http400Error(res, getLang("not_found")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "deleteInvoice");
  }
};

/**
 * 获取发票详情
 */
export const getInvoiceDetail = async (req: Request, res: Response) => {
  try {
    const service = new InvoiceService(req["token"]);
    const { id } = req.body;
    const entityId = req["entity_id"];
    const result = await service.getInvoiceDetail(id, entityId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      not_found: () => http400Error(res, getLang("not_found")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getInvoiceDetail");
  }
};

/**
 * 获取发票列表
 */
export const getInvoiceList = async (req: Request, res: Response) => {
  try {
    const service = new InvoiceService(req["token"]);
    const query = { ...req.body, entity_id: req["entity_id"] };
    const result = await service.getInvoiceList(query);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getInvoiceList");
  }
};

/**
 * 设置默认发票
 */
export const setDefaultInvoice = async (req: Request, res: Response) => {
  try {
    const service = new InvoiceService(req["token"]);
    const data = { ...req.body, entity_id: req["entity_id"] };
    const result = await service.setDefaultInvoice(data);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      not_found: () => http400Error(res, getLang("not_found")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "setDefaultInvoice");
  }
};

/**
 * 获取默认发票
 */
export const getDefaultInvoice = async (req: Request, res: Response) => {
  try {
    const service = new InvoiceService(req["token"]);
    const entityId = req["entity_id"];
    const result = await service.getDefaultInvoice(entityId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      no_default: () => httpSuccess(res, null, getLang("no_default_invoice")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getDefaultInvoice");
  }
};