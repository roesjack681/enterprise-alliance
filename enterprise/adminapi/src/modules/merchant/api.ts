import {Request, Response} from "express";
import * as service from "./service";
import {decodeJWT, http400Error, httpSuccess} from "../../common/common";
import {mchModel} from "./proto";
import {JWTUserInfo} from "../admin/proto";

export const mchAdd= async(req:Request,res:Response) => {    
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token"))  //用token取用户信息
    //let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let role_id:number=jwtUserInfo.role_id //使用token反解用户ID
    if(role_id!==1){
        return http400Error(res,'无权限')
    }
    let name:string=req.body.name||''
    let code:string=req.body.code||''
    let address:string=req.body.address||''
    let private_key=req.body.private_key||''
    let status:number=1
    let create_time:number=+new Date()
    const data:mchModel={id:0,name:name,code:code,address:address,private_key:private_key,status:status,create_time:create_time,}
    const result = await service.mchAdd(data) 
    if(result)
        return httpSuccess(res,null,'添加成功');
    else
        return http400Error(res,'添加错误')
}
export const mchUpdate = async(req:Request,res:Response) => {
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token"))  //用token取用户信息
    //let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let role_id:number=jwtUserInfo.role_id //使用token反解用户ID
    if(role_id!==1){
        return http400Error(res,'无权限')
    }
    let id:number=req.body.id
    let name:string=req.body.name||''
    let code:string=req.body.code||''
    let address:string=req.body.address||''
    let private_key=req.body.private_key||''
    let status:number=1
    let create_time:number=+ new Date()
    const data:mchModel={id:id,name:name,code:code,address:address,private_key:private_key,status:status,create_time:create_time,}
    const result = await service.mchUpdate(data) 
    if(result)
        return httpSuccess(res,null,'更新成功');
    else
        return http400Error(res,'更新错误')
}
export const mchDetail = async(req:Request,res:Response) => {
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'')
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let id:number= req.body.id 
    const result = await service.mchDetail(id,user_id)
    if(result)
        return httpSuccess(res,result,'获取成功');
    else
        return http400Error(res,'获取错误')
}
export const mchDel = async(req:Request,res:Response) => {
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'')
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let role_id:number=jwtUserInfo.role_id //使用token反解用户ID
    if(role_id!==1){
        return http400Error(res,'无权限')
    }
    let id:number= req.body.id 
    const result = await service.mchDel(id,user_id)     
    if(result)
        return httpSuccess(res,null,'删除成功');
    else
        return http400Error(res,'删除错误')
}
export const mchList = async (req:Request,res:Response) => {  
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'') 
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let role_id:number=jwtUserInfo.role_id //使用token反解用户ID
     
    if(role_id!==1)
        return http400Error(res,'权限不足')
    
    const result = await service.mchList(user_id)     
    if(result)
        return httpSuccess(res,result,'成功');
    else
        return http400Error(res,'错误')
 }
 export const mchListPage = async (req:Request,res:Response) => {  
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'') 
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let currentPage=req.body.current_page
    let pageSize=req.body.page_size
    const result = await service.mchListPage(user_id,currentPage,pageSize)     
    if(result)
        return httpSuccess(res,result,'成功');
    else
        return http400Error(res,'错误')
 }