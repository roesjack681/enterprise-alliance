import { Request, Response } from "express";
import { ProductService } from "./service";
import {
  httpSuccess,
  http400Error,
  handleException,
} from "../../common/common";
import { getLang } from "../../lang";

// ======================== 产品相关接口 ========================

/**
 * 创建服务产品
 */
export const createServiceProduct = async (req: Request, res: Response) => {
    try {
        const service = new ProductService(req["token"]);
        const data = { ...req.body, entity_id: req["entity_id"] };
        const result = await service.createServiceProduct(data);
        const handlerMap = {
            ok: () => httpSuccess(res, result.data, getLang("success")),
            err: () => http400Error(res, getLang("failure")),
            default: () => http400Error(res, getLang("server_error")),
        };
        return (handlerMap[result.msg] || handlerMap["default"])();
    } catch (error) {
        return handleException(res, error, "failure");
    }
};

/**
 * 更新服务产品
 */
export const updateServiceProduct = async (req: Request, res: Response) => {
    try {
        const service = new ProductService(req["token"]);
        const result = await service.updateServiceProduct(req.body);
        const handlerMap = {
            ok: () => httpSuccess(res, result.data, getLang("success")),
            err: () => http400Error(res, getLang("failure")),
            default: () => http400Error(res, getLang("server_error")),
        };
        return (handlerMap[result.msg] || handlerMap["default"])();
    } catch (error) {
        return handleException(res, error, "failure");
    }
};

// 删除服务产品
export const deleteServiceProduct = async (req: Request, res: Response) => {
  try {
    const service = new ProductService(req["token"]);
    const result = await service.deleteServiceProduct(req.body.id);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "failure");
  }
};

// 获取服务产品详情
export const getServiceProductDetail = async (req: Request, res: Response) => {
  try {
    const service = new ProductService(req["token"]);
    const result = await service.getServiceProductDetail(
      req.body.id,
      req["entity_id"]
    );
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "failure");
  }
};

// 获取特定协会服务产品列表
export const getTransactionServiceProductList = async (req: Request, res: Response) => {
  try {
    const service = new ProductService(req["token"]);
    const entity_id = req["entity_id"];
    const role_id = req["role_id"];
    const data = { ...req.body, entity_id,role_id};

    const result = await service.getTransactionServiceProductList(data);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      no_data: () => http400Error(res, getLang("no_data")),
      unauthorized: () => http400Error(res, getLang("unauthorized")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "failure");
  }
};


// 获取服务产品列表
export const getServiceProductList = async (req: Request, res: Response) => {
  try {
    const service = new ProductService(req["token"]);
    const result = await service.getServiceProductList(req.body);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "failure");
  }
};

// 获取我的服务产品
export const getMyServiceProducts = async (req: Request, res: Response) => {
  try {
    const service = new ProductService(req["token"]);
    const result = await service.getMyServiceProducts(
      req["entity_id"],
      req.body
    );
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "failure");
  }
};

// 审核服务产品
export const auditServiceProduct = async (req: Request, res: Response) => {
  try {
    const service = new ProductService(req["token"]);
    const data = { ...req.body, audit_user_id: req["entity_id"], role_id: req["role_id"] };
    const result = await service.auditServiceProduct(data);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      unauthorized: () => http400Error(res, getLang("unauthorized")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "failure");
  }
};

// 切换服务状态
export const toggleServiceStatus = async (req: Request, res: Response) => {
  try {
    const service = new ProductService(req["token"]);
    const result = await service.toggleServiceStatus(
      req.body.id,
      req.body.status,
      req["entity_id"]
    );
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      unauthorized: () => http400Error(res, getLang("unauthorized")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "failure");
  }
};

// 收藏/取消收藏服务
export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const service = new ProductService(req["token"]);
    const result = await service.toggleFavorite(
      req.body.service_id,
      req["entity_id"],
      req.body.action
    );
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "failure");
  }
};

// 获取收藏的服务列表
export const getFavoriteServices = async (req: Request, res: Response) => {
  try {
    const service = new ProductService(req["token"]);
    const result = await service.getFavoriteServices(
      req["entity_id"],
      req.body
    );
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "failure");
  }
};


//服务分类
export const getServiceCategory = async (req: Request, res: Response) => { 
  try {
    const entity_id=req.body.entity_id
    const service = new ProductService(req["token"]);
    const result = await service.getServiceCategory(entity_id);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      no_data:()=>http400Error(res,getLang("no_data")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "failure");
  }
};