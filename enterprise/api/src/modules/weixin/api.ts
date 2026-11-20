import { Request, Response } from "express";
import { weixinService, getUrlLink, getMiniQrcode as getMiniQrcodeService, getPayToken as getPayTokenService, weixinUnifiedOrder as unifiedOrderService, weixinPayNotify as payNotifyService, manualCheckPayment as manualCheckPaymentService } from "./service";
import {
  handleException,
  http400Error,
  httpSuccess,
} from "../../common/common";
import { getLang } from "../../lang";
import { ManualCheckPaymentParams } from "./protos";

// ======================== 微信相关接口 ========================

/**
 * 获取微信 access_token
 */
export const getAccessToken = async (req: Request, res: Response) => {
    const access_token = await weixinService.getAccessToken();
    const handlerMap = {
        0: () => httpSuccess(res, access_token.data, getLang("success")),
        400: () => http400Error(res, access_token.msg || getLang("failure")),
        401: () => http400Error(res, access_token.msg || getLang("unauthorized")),
        500: () => http400Error(res, access_token.msg || getLang("server_error")),
        default: () => http400Error(res, access_token.msg || getLang("server_error")),
    };
    return (handlerMap[access_token.code] || handlerMap["default"])();
};

/**
 * 获取微信小程序码
 */
export const getMiniQrcode = async (req: Request, res: Response) => {
    try {
        const scene = req.body.scene;
        const result = await getMiniQrcodeService(scene);
        const handlerMap = {
            0: () => httpSuccess(res, result.data, getLang("success")),
            400: () => http400Error(res, result.msg || getLang("failure")),
            401: () => http400Error(res, result.msg || getLang("unauthorized")),
            500: () => http400Error(res, result.msg || getLang("server_error")),
            default: () => http400Error(res, result.msg || getLang("server_error")),
        };
        return (handlerMap[result.code] || handlerMap["default"])();
    } catch (error: any) {
        return handleException(res, error, "getMiniQrcode");
    }
};

/**
 * 获取微信支付 token
 */
export const getPayToken = async (req: Request, res: Response) => {
    try {
        const { prepay_id } = req.body;
        const result = await getPayTokenService(prepay_id);
        const handlerMap = {
            0: () => httpSuccess(res, result.data, getLang("success")),
            400: () => http400Error(res, result.msg || getLang("failure")),
            401: () => http400Error(res, result.msg || getLang("unauthorized")),
            500: () => http400Error(res, result.msg || getLang("server_error")),
            default: () => http400Error(res, result.msg || getLang("server_error")),
        };
        return (handlerMap[result.code] || handlerMap["default"])();
    } catch (err: any) {
        return handleException(res, err, "getPayToken");
    }
};

/**
 * 微信统一下单
 */
export const weixinUnifiedOrder = async (req: Request, res: Response) => {
    try {
        const result = await unifiedOrderService({ req });
        const handlerMap = {
            0: () => httpSuccess(res, result.data, getLang("success")),
            400: () => http400Error(res, result.msg || getLang("failure")),
            401: () => http400Error(res, result.msg || getLang("unauthorized")),
            500: () => http400Error(res, result.msg || getLang("server_error")),
            default: () => http400Error(res, result.msg || getLang("server_error")),
        };
        return (handlerMap[result.code] || handlerMap["default"])();
    } catch (error: any) {
        return handleException(res, error, "weixinUnifiedOrder");
    }
};

/**
 * 微信支付回调
 */
export const weixinPayNotify = async (req: Request, res: Response) => {
    try {
        const result = await payNotifyService({ req });
        const handlerMap = {
            0: () => httpSuccess(res, {}, getLang("success")),
            400: () => http400Error(res, result.msg || getLang("failure")),
            401: () => http400Error(res, result.msg || getLang("unauthorized")),
            500: () => http400Error(res, result.msg || getLang("server_error")),
            default: () => http400Error(res, result.msg || getLang("server_error")),
        };
        return (handlerMap[result.code] || handlerMap["default"])();
    } catch (error: any) {
        return handleException(res, error, "weixinPayNotify");
    }
};

/**
 * 获取微信短链
 */
export const getLink = async (req: Request, res: Response) => {
    try {
        const query = req.body.query;
        const result = await getUrlLink(query);
        const handlerMap = {
            0: () => httpSuccess(res, result.data, getLang("success")),
            400: () => http400Error(res, result.msg || getLang("failure")),
            401: () => http400Error(res, result.msg || getLang("unauthorized")),
            500: () => http400Error(res, result.msg || getLang("server_error")),
            default: () => http400Error(res, result.msg || getLang("server_error")),
        };
        return (handlerMap[result.code] || handlerMap["default"])();
    } catch (error: any) {
        return handleException(res, error, "getLink");
    }
};

/**
 * 手动查询支付状态
 */
export const manualCheckPayment = async (req: Request, res: Response) => {
    try {
        const { out_trade_no } = req.body;
        const userId = req["entity_id"]; // Assuming entity_id is the user id from token middleware

        if (!out_trade_no || !userId) {
            return http400Error(res, "缺少参数");
        }

        const params: ManualCheckPaymentParams = {
            userId,
            out_trade_no,
        };

        const result = await manualCheckPaymentService(params);

        const handlerMap = {
            0: () => httpSuccess(res, result.data, result.msg),
            400: () => http400Error(res, result.msg || getLang("failure")),
            500: () => http400Error(res, result.msg || getLang("server_error")),
            default: () => http400Error(res, result.msg || getLang("server_error")),
        };
        return (handlerMap[result.code] || handlerMap["default"])();

    } catch (error: any) {
        return handleException(res, error, "manualCheckPayment");
    }
};