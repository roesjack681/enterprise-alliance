import e = require("express");
import {sequelize} from "../../storage/mysql";
import {QueryTypes} from "sequelize";
export const areaList= async (type:number):Promise<any>=>{
    let sql: string = `SELECT id,code, name,parent_code,type FROM  vip_areas ;` // WHERE type = :type 
    const res:any = await sequelize.query(sql,{
        replacements:{
            type:type
        },
        type: QueryTypes.SELECT, 
    })
    return res;
} 
export const addArea = async (data:any)=> {
    let sql: string = "INSERT INTO vip_areas (code,name,parent_code,type) "+
        " VALUES (:code,:name,:parent_code,:type);"

    const [id,rows] = await sequelize.query(sql,{
        replacements:{...data},
        type: QueryTypes.INSERT,
        plain: true
    })
    if (1 == rows){
        return id
    }else{
        return null
    }
     
} 
export const categoryList= async ():Promise<any>=>{
    let sql: string = `SELECT id,name,parent_id,status FROM  category ;` // WHERE type = :type 
    const res:any = await sequelize.query(sql,{
        replacements:{
          
        },
        type: QueryTypes.SELECT, 
    })
    return res;
} 
export const addCategory = async (data:any)=> {
    let sql: string = "INSERT INTO category (name,parent_id,status,sort) "+
        " VALUES (:name,:parent_id,:status,:sort);" 

    const [id,rows] = await sequelize.query(sql,{
        replacements:{...data},
        type: QueryTypes.INSERT,
        plain: true
    })
    if (1 == rows){
        return id
    }else{
        return null
    }
     
}
//修改统计表数据 statistics
export const updateStatistics = async (data:any)=> {
    let sql: string = `UPDATE statistics SET `
    if(data.today_post)
        sql+= `today_post=:today_post ,`
    if(data.total_post)
        sql+= `total_post=:total_post ,`
    if(data.today_company)
        sql+= `today_company =:today_company ,`
    if(data.total_company)
        sql+= `total_company=:total_company ,`
    if(data.today_source)
        sql+= `today_source=:today_source ,`
    if(data.total_source)
        sql+= `total_source=:total_source ,`
    if(data.today_demand)
        sql+= `today_demand=:today_demand ,`
    if(data.total_demand)
        sql+= `total_demand=:total_demand ,`
    if(data.today_user)
        sql+= `today_user=:today_user,`
    if(data.total_user)
        sql+= `total_user=:total_user,`
    if(data.today_tender)
        sql+= `today_tender=:today_tender,`
    if(data.total_tender)
        sql+= `total_tender=:total_tender,`  
    sql+=`update_time=:update_time WHERE id = :id;`

    const [id,rows] = await sequelize.query(sql,{
        replacements:{...data,update_time:(+new Date()/1000)},
        type: QueryTypes.UPDATE,
        plain: true
    })
    if (1 == rows){
        return id
    }else{
        return null
    }
     
}
//修改统计表数据 statistics
export const addStatistics = async (data:any)=> {
    let sql: string = `UPDATE statistics SET `
    if(data.today_post && data.today_post>0)
        sql+= `today_post=today_post+${data.today_post} ,`
    if(data.total_post && data.total_post>0)
        sql+= `total_post=total_post+${data.total_post} ,`
    if(data.today_company && data.today_company>0)
        sql+= `today_company =today_company+${data.today_company} ,`
    if(data.total_company && data.total_company>0)
        sql+= `total_company=total_company+${data.total_company} ,`
    if(data.today_source && data.today_source>0)
        sql+= `today_source=today_source+${data.today_source} ,`
    if(data.total_source && data.total_source>0)
        sql+= `total_source=total_source+${data.total_source} ,`
    if(data.today_demand && data.today_demand>0)
        sql+= `today_demand=today_demand+${data.today_demand} ,`
    if(data.total_demand && data.total_demand>0)
        sql+= `total_demand=total_demand+${data.total_demand} ,`
    if(data.today_user && data.today_user>0)
        sql+= `today_user=today_user+${data.today_user},`
    if(data.total_user && data.total_user>0)
        sql+= `total_user=total_user+${data.total_user},`
    if(data.today_tender && data.today_tender>0)
        sql+= `today_tender=today_tender+${data.today_tender},` 
    if(data.total_tender && data.total_tender>0)
        sql+= `total_tender=total_tender+${data.total_tender},`
    
    sql+=`update_time=:update_time  WHERE id = :id `
    console.log(sql)
    const [id,rows] = await sequelize.query(sql,{
        replacements:{id:data.id,update_time:(+new Date()/1000)},
        type: QueryTypes.UPDATE,
        plain: true
    })
    if (1 == rows){
        return id
    }else{
        return null
    }
     
}
//获取统计表数据 statistics
export const getStatistics = async (id:number=1)=> {
    let sql: string = "SELECT id, status, today_post, total_post, today_company, total_company, today_source, total_source, today_demand, total_demand, today_user, total_user,today_tender,total_tender FROM statistics WHERE status=1 AND id = :id;"  
    const res = await sequelize.query(sql,{
        replacements:{id:id},
        type: QueryTypes.SELECT,
    })
    return res
     
}