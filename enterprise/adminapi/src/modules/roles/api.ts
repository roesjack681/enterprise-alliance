import {Request, Response} from "express";
import * as service from "./service";
import {decodeJWT, http400Error, httpSuccess} from "../../common/common";
import {rolesModel} from "./proto";
import {JWTUserInfo} from "../admin/proto";

export const rolesAdd= async(req:Request,res:Response) => {    
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token"))  //用token取用户信息
    //let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let role_id:number=jwtUserInfo.role_id //使用token反解用户ID
    if(role_id!==1){
        return http400Error(res,'无权限')
    }
    let name:string=req.body.name
    let nodes:string=req.body.nodes
    let status:number=1
    const data:rolesModel={id:0,name:name,nodes:nodes,status:status,}
    const result = await service.rolesAdd(data) 
    if(result)
        return httpSuccess(res,null,'添加成功');
    else
        return http400Error(res,'添加错误')
}
export const rolesUpdate = async(req:Request,res:Response) => {
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token"))  //用token取用户信息
    let role_id:number=jwtUserInfo.role_id //使用token反解用户ID
    if(role_id!==1){
        return http400Error(res,'无权限')
    }
    let id:number=req.body.id
    let name:string=req.body.name
    let nodes:string=req.body.nodes
    let status:number=1
    const data:rolesModel={id:id,name:name,nodes:nodes,status:status,}

    const result = await service.rolesUpdate(data) 
    if(result)
        return httpSuccess(res,null,'更新成功');
    else
        return http400Error(res,'未更新')
}
export const rolesDetail = async(req:Request,res:Response) => {
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'')
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let id:number= req.body.id 
    const result = await service.rolesDetail(id)
    if(result)
        return httpSuccess(res,result,'获取成功');
    else
        return http400Error(res,'获取错误')
}
export const rolesDel = async(req:Request,res:Response) => {
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'')
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let role_id:number=jwtUserInfo.role_id //使用token反解用户ID
    if(role_id!==1){
        return http400Error(res,'无权限')
    }
    let id:number= req.body.id 
    const result = await service.rolesDel(id)  
    console.log(result,'111111111111')  
    if(result)
        return httpSuccess(res,null,'删除成功');
    else
        return http400Error(res,'删除错误')
}
export const rolesList = async (req:Request,res:Response) => {  
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'') 
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let role_id:number=jwtUserInfo.role_id //使用token反解用户ID
     
    if(role_id!==1)
        return http400Error(res,'权限不足')
    
    const result = await service.rolesList(user_id)     
    if(result)
        return httpSuccess(res,result,'成功');
    else
        return http400Error(res,'错误')
 }
 export const rolesListPage = async (req:Request,res:Response) => {  
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'') 
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let currentPage=req.body.current_page
    let pageSize=req.body.page_size
    const result = await service.rolesListPage(user_id,currentPage,pageSize)     
    if(result)
        return httpSuccess(res,result,'成功');
    else
        return http400Error(res,'错误')
 }