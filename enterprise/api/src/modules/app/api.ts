import {Request, Response} from "express";
import {decodeJWT, http400Error, httpSuccess} from "../../common/common";
import * as jwt from "jsonwebtoken"
import { config } from "../../config/config"; 
const fs =require('fs/promises');
const path=require('path')
//获取访问token
export const refreshToken = async (req:Request,res:Response) => {  
    let key:string= req.body.key 
    if (key !== 'admin112233.'){
        return http400Error(res, "无效key信息")
    }
    let token = jwt.sign({
        data: {
            id: 1,
            username: 'admin',
            privateKey:key
        },
        exp: Math.floor(Date.now() / 1000) + config.JWT_EXPIRED_TIME,
    }, config.JWT_KEY)
    return httpSuccess(res, { token: token }, "ok")
}



 
