import {config} from "../../config/config";
import {httpGet} from "../../common/common";
import * as repository from "./repository";
import {<%=modelName%>Model} from "./proto";

export const <%=modelName%>Add = async (data:<%=modelName%>Model):Promise<any>=> {
    return await repository.<%=modelName%>Add(data) 
}
export const <%=modelName%>Update = async (data:<%=modelName%>Model):Promise<any>=> {
    return await repository.<%=modelName%>Update(data) 
}
export const <%=modelName%>Detail = async (id: number,userId:number):Promise<<%=modelName%>Model>=> {
    const data:<%=modelName%>Model|null= await repository.<%=modelName%>Detail(id,userId) as <%=modelName%>Model;
    return data
}
export const <%=modelName%>Del = async (id: number,userId:number):Promise<any>=> {
    const data:any= await repository.<%=modelName%>Del(id,userId)  
    return data
}
export const <%=modelName%>List = async (userId: number):Promise<any>=> {
    const data:any= await repository.<%=modelName%>List(userId) 
    return data
}
export const <%=modelName%>ListPage = async (userId: number,currentPage: number,pageSize: number):Promise<any>=> {
    const data:any= await repository.<%=modelName%>ListPage(userId,currentPage,pageSize) 
    return data
}