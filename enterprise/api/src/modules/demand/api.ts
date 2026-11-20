import { Request, Response } from "express";
import { DemandService } from "./service";
import {
  httpSuccess,
  http400Error,
  handleException,
} from "../../common/common";
import { getLang } from "../../lang";

// ======================== 需求相关接口 ========================

/**
 * 创建需求
 */
export const createDemand = async (req: Request, res: Response) => {
  try {
    const service = new DemandService(req["token"]);
    const data = { ...req.body, user_id: req["entity_id"] };
    const result = await service.createDemand(data);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      insert_error: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "createDemand");
  }
};

/**
 * 更新需求
 */
export const updateDemand = async (req: Request, res: Response) => {
  try {
    const service = new DemandService(req["token"]);
    const data = { ...req.body, user_id: req["entity_id"] };
    const result = await service.updateDemand(data);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      no_fields_to_update: () => http400Error(res, getLang("no_fields_to_update")),
      no_permission_or_not_found: () => http400Error(res, getLang("no_permission")),
      update_error: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "updateDemand");
  }
};

/**
 * 删除需求
 */
export const deleteDemand = async (req: Request, res: Response) => {
  try {
    const service = new DemandService(req["token"]);
    const result = await service.deleteDemand(req.body.id, req["entity_id"]);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      no_permission_or_not_found: () => http400Error(res, getLang("no_permission")),
      delete_error: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "deleteDemand");
  }
};

/**
 * 获取需求详情
 */
export const getDemandDetail = async (req: Request, res: Response) => {
  try {
    const service = new DemandService(req["token"]);
    const userId = req["entity_id"];
    const userRole = req["role_id"];
    const result = await service.getDemandDetail(req.body.id, userId, userRole);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      not_found: () => http400Error(res, getLang("not_found")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getDemandDetail");
  }
};

export const getmyDemandDetail = async (req: Request, res: Response) => {
  try {
    const service = new DemandService(req["token"]);
    const result = await service.getmyDemandDetail(req.body.id,req["entity_id"]);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      not_found: () => http400Error(res, getLang("not_found")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getmyDemandDetail");
  }
};

/**
 * 获取需求列表
 */
export const getDemandList = async (req: Request, res: Response) => {
  try {
    const service = new DemandService(req["token"]);
    const result = await service.getDemandList({...req.body,role:req["role_id"]});
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      query_error: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getDemandList");
  }
};

/**
 * 获取我的需求列表
 */
export const getMyDemandList = async (req: Request, res: Response) => {
  try {
    const service = new DemandService(req["token"]);
    const userId = req["entity_id"];
    
    if (!userId) {
      return http400Error(res, "用户ID不能为空");
    }
    
    const result = await service.getMyDemandList(userId, req.body);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      query_error: () => http400Error(res, "数据库查询失败"),
      server_error: () => http400Error(res, "服务器内部错误"),
      default: () => http400Error(res, "操作失败"),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getMyDemandList");
  }
};

/**
 * 更新需求状态
 */
export const updateDemandStatus = async (req: Request, res: Response) => {
  try {
    const service = new DemandService(req["token"]);
    const { id, status, remark } = req.body;
    const result = await service.updateDemandStatus(id, status, req["entity_id"], remark);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      no_permission_or_not_found: () => http400Error(res, getLang("no_permission")),
      update_error: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "updateDemandStatus");
  }
};