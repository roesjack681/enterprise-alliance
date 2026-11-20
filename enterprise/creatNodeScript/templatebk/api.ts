import {Request, Response} from "express";
import * as service from "./service";
import {decodeJWT, http400Error, httpSuccess} from "../../common/common";
import {<%=modelName%>Model} from "./proto";
import {JWTUserInfo} from "../user/proto";

export const <%=modelName%>Add= async(req:Request,res:Response) => {    
    //let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token"))  //用token取用户信息
    //let user_id:number=jwtUserInfo.id //使用token反解用户ID
    <%for(let i=1;i<fields.length;i++){%>
    let <%=fields[i].name%>:<%=fields[i].type%>=req.body.<%=fields[i].name%><%}%> 
    const data:<%=modelName%>Model={<%for(let i=1;i<fields.length;i++){%><%=fields[i].name%>:<%=fields[i].name==''?'null':fields[i].name%>,<%}%>}
    const result = await service.<%=modelName%>Add(data) 
    if(result)
        return httpSuccess(res,null,'添加成功');
    else
        return http400Error(res,'添加错误')
}
export const <%=modelName%>Update = async(req:Request,res:Response) => {
//let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token"))  //用token取用户信息
    //let user_id:number=jwtUserInfo.id //使用token反解用户ID
    <%for(let i=0;i<fields.length;i++){%>
    let <%=fields[i].name%>:<%=fields[i].type%>=req.body.<%=fields[i].name%><%}%> 
    const data:<%=modelName%>Model={<%for(let i=0;i<fields.length;i++){%><%=fields[i].name%>:<%=fields[i].name==''?'null':fields[i].name%>,<%}%>}
    const result = await service.<%=modelName%>Update(data) 
    if(result)
        return httpSuccess(res,null,'更新成功');
    else
        return http400Error(res,'更新错误')
}
export const <%=modelName%>Detail = async(req:Request,res:Response) => {
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'')
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let id:number= req.body.id 
    const result = await service.<%=modelName%>Detail(id,user_id)
    if(result)
        return httpSuccess(res,result,'获取成功');
    else
        return http400Error(res,'获取错误')
}
export const <%=modelName%>Del = async(req:Request,res:Response) => {
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'')
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let id:number= req.body.id 
    const result = await service.<%=modelName%>Del(id,user_id)     
    if(result)
        return httpSuccess(res,null,'删除成功');
    else
        return http400Error(res,'删除错误')
}
export const <%=modelName%>List = async (req:Request,res:Response) => {  
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'') 
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    const result = await service.<%=modelName%>List(user_id)     
    if(result)
        return httpSuccess(res,result,'成功');
    else
        return http400Error(res,'错误')
 }
 export const <%=modelName%>ListPage = async (req:Request,res:Response) => {  
    let jwtUserInfo = <JWTUserInfo>await decodeJWT(req.header("token")||'') 
    let user_id:number=jwtUserInfo.id //使用token反解用户ID
    let currentPage=req.body.current_page
    let pageSize=req.body.page_size
    const result = await service.<%=modelName%>ListPage(user_id,currentPage,pageSize)     
    if(result)
        return httpSuccess(res,result,'成功');
    else
        return http400Error(res,'错误')
 }