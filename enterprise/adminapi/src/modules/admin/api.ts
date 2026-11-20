import {Request, Response} from "express";
import * as service from "./service";
import * as roleService from "../roles/service";
import {decodeJWT, http400Error, httpSuccess, md5Encode,} from "../../common/common";
import {adminModel,JWTUserInfo} from "./proto"; 
import * as jwt from "jsonwebtoken"
import { config } from "../../config/config";


export const login = async (req: Request, res: Response) => {
    let username: string = req.body.username
    let password: string = req.body.password
    password=await md5Encode(password)
    //console.log(username,password)
    let userInfo = await service.login(username,password)
    if (userInfo === null){
        return http400Error(res, "无效用户信息")
    }
    let token = jwt.sign({
        data: {
            id: userInfo.id,
            username: userInfo.username,          
            realname: userInfo.realname,
            role_id: userInfo.role_id,
            mch_id: userInfo.mch_id, //部门ID 
        },
        exp: Math.floor(Date.now() / 1000) + config.JWT_EXPIRED_TIME,
    }, config.JWT_KEY)
    return httpSuccess(res, { token: token }, "登录成功")
}

export const refreshToken = async (req: Request, res: Response) => {
    let jwtUserInfo = await decodeJWT(req.header("token") || '')
    let token = jwt.sign({
        data: jwtUserInfo,
        exp: Math.floor(Date.now() / 1000) + config.JWT_EXPIRED_TIME,
    }, config.JWT_KEY)
    return httpSuccess(res, { token: token }, "置换令牌成功")
}

export const adminAdd= async(req:Request,res:Response) => {    
    //let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token"))  //用token取用户信息
    //let user_id:number=jwtUserInfo.id //使用token反解用户ID
    
    let role_id:number=req.body.role_id
    let mch_id:number=req.body.mch_id||0
    let username:string=req.body.username
    let password:string=req.body.password
        password=await md5Encode(password)
    let realname:string=req.body.realname||''
    let mobile:string=req.body.mobile||''
    let email:string=req.body.email||''
    let create_time:number=+new Date()
    let status:number=1
    const data:adminModel={id:0,role_id:role_id,mch_id:mch_id,username:username,password:password,realname:realname,mobile:mobile,email:email,create_time:create_time,status:status,access:[],access_name:''}
    const result = await service.adminAdd(data) 
    if(result)
        return httpSuccess(res,null,'添加成功');
    else
        return http400Error(res,'添加错误')
}
export const adminUpdate = async(req:Request,res:Response) => {
    //let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token"))  //用token取用户信息
    //let user_id:number=jwtUserInfo.id //使用token反解用户ID
    
    let id:number=req.body.id
    let role_id:number=req.body.role_id
    let mch_id:number=req.body.mch_id||0
    let username:string=req.body.username
    let password:string=req.body.password
    if(password&& password.length<30)
        password=await md5Encode(password)

    let realname:string=req.body.realname||''
    let mobile:string=req.body.mobile||''
    let email:string=req.body.email||''
    let create_time:number=+new Date() //update_time
    //let status:number=req.body.status 
    const data:adminModel={id:id,role_id:role_id,mch_id:mch_id,username:username,password:password,realname:realname,mobile:mobile,email:email,create_time:create_time,status:0,access:[],access_name:''}
    const result = await service.adminUpdate(data) 
    if(result)
        return httpSuccess(res,null,'更新成功');
    else
        return http400Error(res,'更新错误')
}
export const setStatus = async(req:Request,res:Response) => {
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token"))  //用token取用户信息
    let role_id:number=jwtUserInfo.role_id //1管理员
    let id = req.body.id
    let status = req.body.status    
    //console.log(id,status)
    if(role_id===1 ){
        const result = await service.setStatus(id,status)  
        if(result)
            return httpSuccess(res,null,'更新成功');
        else
            return http400Error(res,'更新错误')
    }else{
        return http400Error(res,'更新错误')
    }
}
export const adminDetail = async(req:Request,res:Response) => {
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'')
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let id:number= user_id
    const result = await service.adminDetail(id)
    const role=await roleService.rolesDetail(result.role_id)
    result.access_name=role.name
    result.access=role.nodes.split(',')||[]
     
    if(result)
        return httpSuccess(res,result,'获取成功');
    else
        return http400Error(res,'获取错误')
}
export const adminDel = async(req:Request,res:Response) => {
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'')
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let id:number= req.body.id 
    const result = await service.adminDel(id,user_id)     
    if(result)
        return httpSuccess(res,null,'删除成功');
    else
        return http400Error(res,'删除错误')
}
export const adminList = async (req:Request,res:Response) => {  
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'') 
    let role_id:number=jwtUserInfo.role_id //使用token反解用户ID
     
    if(role_id!==1)
        return http400Error(res,'权限不足')
    
    const result = await service.adminList(jwtUserInfo.id)     
    if(result)
        return httpSuccess(res,result,'成功');
    else
        return http400Error(res,'错误')
 }
 export const adminListPage = async (req:Request,res:Response) => {  
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'') 
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let currentPage=req.body.current_page
    let pageSize=req.body.page_size
    const result = await service.adminListPage(user_id,currentPage,pageSize)     
    if(result)
        return httpSuccess(res,result,'成功');
    else
        return http400Error(res,'错误')
 }