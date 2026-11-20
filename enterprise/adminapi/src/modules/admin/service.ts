import {config} from "../../config/config";
import {httpGet} from "../../common/common";
import * as repository from "./repository";
import {adminModel} from "./proto";

//登录
export const login = async (username:string,password:string) => {
    return await repository.login(username,password)
}
export const adminAdd = async (data:adminModel):Promise<any>=> {
    return await repository.adminAdd(data) 
}
export const adminUpdate = async (data:adminModel):Promise<any>=> {
    return await repository.adminUpdate(data) 
}
export const setStatus=async (id:number,status:number): Promise<any> => {
    return await repository.setStatus(id,status) 
}
export const adminDetail = async (id: number):Promise<adminModel>=> {
    const data:adminModel|null= await repository.adminDetail(id) as adminModel;
    return data
}
export const adminDel = async (id: number,userId:number):Promise<any>=> {
    const data:any= await repository.adminDel(id,userId)  
    return data
}
export const adminList = async (userId: number):Promise<any>=> {
    const data:any= await repository.adminList(userId) 
    return data
}
export const adminListPage = async (userId: number,currentPage: number,pageSize: number):Promise<any>=> {
    const data:any= await repository.adminListPage(userId,currentPage,pageSize) 
    return data
}