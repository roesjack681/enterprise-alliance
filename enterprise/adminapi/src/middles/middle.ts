import { NextFunction, Request, Response } from "express";
import { http400Error, httpSuccess, httpTokenError } from "../common/common";

import * as jwt from "jsonwebtoken"
import { config } from "../config/config";

export const CheckLangAndToken = async (req: Request, res: Response, next: NextFunction) => {

    try {
        //微信支付回调，判断是否微信支付服务器发来的，不需要验证，直接放行        
        // if(req.url=="/order/wxnotify"){ 
        //     return next()
        // }
        if ("GET" === req.method) {
            return next();
            //return  http400Error(res,"禁止访问")
        }
        if (!req.header("token") && !req.header("lang")) {
            return http400Error(res, "缺少参数")
        }

        if ((req.url == "/admin/login") || (req.url == "/admin/refresh-token")) {
            return next()
        } else {
            jwt.verify(req.header("token") as string, config.JWT_KEY)
        }

    } catch (e) {
        return httpTokenError(res, "令牌过期，请重新登录")
    }

    return next()

}