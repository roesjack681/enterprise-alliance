import { Request, Response } from "express";
import { provinceService } from "./service";
import {
  httpSuccess,
  http400Error,
  handleException,
} from "../../common/common";

import { getLang } from "../../lang";
// ======================== 省市区相关接口 ========================

/**
 * 获取省份列表
 */
export const listProvince = async (req: Request, res: Response) => {
    try {
        const service = new provinceService({ token: req["token"] });
        const result = await service.listProvince();
        const handlerMap = {
            ok: () => httpSuccess(res, result.data, getLang("success")),
            not_found: () => http400Error(res, getLang("not_found")),
            err: () => http400Error(res, getLang("failure")),
            server_error: () => http400Error(res, getLang("server_error")),
            default: () => http400Error(res, getLang("server_error")),
        };
        return (handlerMap[result.msg] || handlerMap["default"])();
    } catch (error) {
        return handleException(res, error, "listProvince");
    }
};
export const listCity = async (req: Request, res: Response) => {
  try {
    const service = new provinceService({ token: req["token"] });
    const result = await service.listCity(req.body.provinceCode);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      not_found: () => http400Error(res, getLang("not_found")),
      err: () => http400Error(res, getLang("failure")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "listCity");
  }
};
export const listDistrict = async (req: Request, res: Response) => {
  try {
    const service = new provinceService({ token: req["token"] });
    const result = await service.listDistrict(
      req.body.provinceCode,
      req.body.cityCode
    );
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      not_found: () => http400Error(res, getLang("not_found")),
      err: () => http400Error(res, getLang("failure")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "listDistrict");
  }
};
export const listTown = async (req: Request, res: Response) => {
  try {
    const service = new provinceService({ token: req["token"] });
    const result = await service.listTown(
      req.body.provinceCode,
      req.body.cityCode,
      req.body.areaCode
    );
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      not_found: () => http400Error(res, getLang("not_found")),
      err: () => http400Error(res, getLang("failure")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "listTown");
  }
};
