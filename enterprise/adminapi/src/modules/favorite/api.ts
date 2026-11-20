import {Request, Response} from "express";
import * as service from "./service";
import {decodeJWT, http400Error, httpSuccess} from "../../common/common";
import {favoriteModel} from "./proto";
import {JWTUserInfo} from "../admin/proto";

export const favoriteAdd= async(req:Request,res:Response) => { 
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token"))  //用token取用户信息
    let user_id:number=jwtUserInfo.id //使用token反解用户ID 
   
    let article_id:number=req.body.article_id
    let title:string=req.body.title
    let content:string=req.body.content
    let addtime:number=req.body.addtime
    let source:string=req.body.source
    let sourceurl:string=req.body.sourceurl
    let create_time:number=+new Date()
    const data:favoriteModel={id:0,user_id:user_id,article_id:article_id,title:title,content:content,addtime:addtime,source:source,sourceurl:sourceurl,create_time:create_time,}
    
    const resa=await service.favoriteDetail(article_id,user_id)
    if(resa)
        return httpSuccess(res,null,'已经收藏过了')

    const result = await service.favoriteAdd(data) 
    if(result)
        return httpSuccess(res,null,'添加成功');
    else
        return http400Error(res,'添加错误')
}
export const favoriteUpdate = async(req:Request,res:Response) => {
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token"))  //用token取用户信息
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    
    let id:number=req.body.id
    
    let article_id:number=req.body.article_id
    let title:string=req.body.title
    let content:string=req.body.content
    let addtime:number=req.body.addtime
    let source:string=req.body.source
    let sourceurl:string=req.body.sourceurl
    let create_time:number=+new Date()
    const data:favoriteModel={id:id,user_id:user_id,article_id:article_id,title:title,content:content,addtime:addtime,source:source,sourceurl:sourceurl,create_time:create_time,}
    const result = await service.favoriteUpdate(data) 
    if(result)
        return httpSuccess(res,null,'更新成功');
    else
        return http400Error(res,'更新错误')
}
export const favoriteDetail = async(req:Request,res:Response) => {
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'')
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let id:number= req.body.id 
    const result = await service.favoriteDetail(id,user_id)
    if(result)
        return httpSuccess(res,result,'获取成功');
    else
        return http400Error(res,'获取错误')
}
export const favoriteDel = async(req:Request,res:Response) => {
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'')
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let id:number= req.body.id 
    const result = await service.favoriteDel(id,user_id)     
    if(result)
        return httpSuccess(res,null,'删除成功');
    else
        return http400Error(res,'删除错误')
}
export const favoriteList = async (req:Request,res:Response) => {  
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'') 
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    const result = await service.favoriteList(user_id)     
    if(result)
        return httpSuccess(res,result,'成功');
    else
        return http400Error(res,'错误')
 }
 export const favoriteListPage = async (req:Request,res:Response) => {  
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'') 
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let currentPage=req.body.current_page
    let pageSize=req.body.page_size
    const result = await service.favoriteListPage(user_id,currentPage,pageSize)     
    if(result)
        return httpSuccess(res,result,'成功');
    else
        return http400Error(res,'错误')
 }