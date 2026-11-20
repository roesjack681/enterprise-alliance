import * as repository from "./repository";

export const areaList = async (type: number):Promise<any>=> {
    const data:any= await repository.areaList(type) 
    return data
}
export const addArea = async (data: any)=> {
    return await repository.addArea(data) 
}
export const categoryList = async ():Promise<any>=> {
    const data:any= await repository.categoryList() 
    return data
}
export const addCategory = async (data: any)=> {
    return await repository.addCategory(data) 
}
export const updateStatistics = async (data: any)=> {
    return await repository.updateStatistics(data) 
}
export const addStatistics = async (data: any):Promise<any>=> {
    return await repository.addStatistics(data)
}
export const getStatistics = async (id: number):Promise<any>=> {
    return await repository.getStatistics(id)
}