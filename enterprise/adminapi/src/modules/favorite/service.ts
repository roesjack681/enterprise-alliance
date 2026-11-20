import {config} from "../../config/config";
import {httpGet} from "../../common/common";
import * as repository from "./repository";
import {favoriteModel} from "./proto";

export const favoriteAdd = async (data:favoriteModel):Promise<any>=> {
    return await repository.favoriteAdd(data) 
}
export const favoriteUpdate = async (data:favoriteModel):Promise<any>=> {
    return await repository.favoriteUpdate(data) 
}
export const favoriteDetail = async (id: number,userId:number):Promise<favoriteModel>=> {
    const data:favoriteModel|null= await repository.favoriteDetail(id,userId) as favoriteModel;
    return data
}
export const favoriteDel = async (id: number,userId:number):Promise<any>=> {
    const data:any= await repository.favoriteDel(id,userId)  
    return data
}
export const favoriteList = async (userId: number):Promise<any>=> {
    const data:any= await repository.favoriteList(userId) 
    return data
}
export const favoriteListPage = async (userId: number,currentPage: number,pageSize: number):Promise<any>=> {
    const data:any= await repository.favoriteListPage(userId,currentPage,pageSize) 
    return data
}