import {config} from "../../config/config";
import {httpGet} from "../../common/common";
import * as repository from "./repository";
import {rolesModel} from "./proto";

export const rolesAdd = async (data:rolesModel):Promise<any>=> {
    return await repository.rolesAdd(data) 
}
export const rolesUpdate = async (data:rolesModel):Promise<any>=> {
    return await repository.rolesUpdate(data) 
}
export const rolesDetail = async (id: number):Promise<rolesModel>=> {
    const data:rolesModel|null= await repository.rolesDetail(id) as rolesModel;
    return data
}
export const rolesDel = async (id: number):Promise<any>=> {
    const data:any= await repository.rolesDel(id)  
    return data
}
export const rolesList = async (userId: number):Promise<any>=> {
    const data:any= await repository.rolesList(userId) 
    return data
}
export const rolesListPage = async (userId: number,currentPage: number,pageSize: number):Promise<any>=> {
    const data:any= await repository.rolesListPage(userId,currentPage,pageSize) 
    return data
}