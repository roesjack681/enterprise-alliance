import {config} from "../../config/config";
import {httpGet} from "../../common/common";
import * as repository from "./repository";
import {mchModel} from "./proto";

export const mchAdd = async (data:mchModel):Promise<any>=> {
    return await repository.mchAdd(data) 
}
export const mchUpdate = async (data:mchModel):Promise<any>=> {
    return await repository.mchUpdate(data) 
}
export const mchDetail = async (id: number,userId:number):Promise<mchModel>=> {
    const data:mchModel|null= await repository.mchDetail(id,userId) as mchModel;
    return data
}
export const mchDel = async (id: number,userId:number):Promise<any>=> {
    const data:any= await repository.mchDel(id,userId)  
    return data
}
export const mchList = async (userId: number):Promise<any>=> {
    const data:any= await repository.mchList(userId) 
    return data
}
export const mchListPage = async (userId: number,currentPage: number,pageSize: number):Promise<any>=> {
    const data:any= await repository.mchListPage(userId,currentPage,pageSize) 
    return data
}