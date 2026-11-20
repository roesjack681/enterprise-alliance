import {NextFunction, Request, Response} from "express";
import {http400Error, httpSuccess, httpTokenError,rpcPost} from "../common/common";
import * as jwt from "jsonwebtoken"
import {config} from "../config/config";
import { http } from "winston";

const privateKey = process.env.INTERNAL_API_KEY || ''

export const CheckLangAndToken = async (req: Request,res: Response,next: NextFunction) => {
    try{

        if ("GET" === req.method){
            return next(); // 允许 GET 请求通过
        }
        
        const allowUrls = [
            "/entity/login",
            "/entity/send-sms",
            "/entity/find_password",
            "/entity/register",
            "/entity/login-by-code",
            "/entity/find-password",
            "/home/config"
        ]
        if(allowUrls.includes(req.url)){
            return next()
        }else{
            if (!req.header("token") && !req.header("lang") && (!privateKey || req.header("x-api-key")!==privateKey)){
                return httpTokenError(res)
            }

            // 反解并验证token
            //console.log(req.header("token"))
            const token = req.header("token")
            const lang = req.header("lang")
            
            if (["zh_CN","en_US"].indexOf(lang) == -1){
                return httpTokenError(res)
            }

            let result = await rpcPost('/auth/parse-token', { token },token);
            //console.log(result)
            if (result.code == 0){
                req["token"] = token
                req["lang"] = lang
                req["entity_id"] = result["data"]["id"]
                req["role_id"] = result["data"]["role"]
                return next()
            }

            return httpTokenError(res)
        }
    }catch(error){
        return httpTokenError(res)
    }
}
