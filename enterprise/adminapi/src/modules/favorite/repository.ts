import {sequelize} from "../../storage/mysql";
import {QueryTypes} from "sequelize";
import {favoriteModel} from "./proto";

export const favoriteAdd = async (data: favoriteModel): Promise<number|null> => {
    let sql: string =`INSERT INTO favorite (user_id,article_id,title,content,addtime,source,sourceurl,create_time)
                        VALUES (:user_id,:article_id,:title,:content,:addtime,:source,:sourceurl,:create_time);`

    const [id,rows] = await sequelize.query(sql,{
        replacements:{
            user_id:data.user_id,article_id:data.article_id,title:data.title,content:data.content,addtime:data.addtime,source:data.source,sourceurl:data.sourceurl,create_time:data.create_time,
        },
        type: QueryTypes.INSERT,
        plain: true
    })
    if (1 == rows){
        return id
    }else{
        return null
    }
     
}  
export const favoriteUpdate = async (data: favoriteModel): Promise<any> => {
    let sql: string = `UPDATE favorite
                        SET 
                        id=:id,user_id=:user_id,article_id=:article_id,title=:title,content=:content,addtime=:addtime,source=:source,sourceurl=:sourceurl,create_time=:create_time
                        WHERE 
                            id = :id AND user_id = :user_id;`

    const [id,rows] = await sequelize.query(sql,{
        replacements:{
            id:data.id,user_id:data.user_id,article_id:data.article_id,title:data.title,content:data.content,addtime:data.addtime,source:data.source,sourceurl:data.sourceurl,create_time:data.create_time,
        },
        type: QueryTypes.UPDATE,
        plain: true
    })
    if (1 == rows){
        return rows
    }else{
        return null
    }
     
} 
export const favoriteDel= async (id:number,userId:number):Promise<any>=>{
    let sql: string = `DELETE  FROM  favorite  WHERE id = :id AND user_id=:user_id ;` 
    const res = await sequelize.query(sql,{
        replacements:{
            id:id,
            user_id:userId
        },
        type: QueryTypes.DELETE,
         
    })
    return res;
}
export const favoriteDetail= async (id:number,userId:number):Promise<favoriteModel|null>=>{
    let sql: string = `SELECT 
    id,user_id,article_id,title,content,addtime,source,sourceurl,create_time
                    FROM  favorite  WHERE article_id = :id AND user_id=:user_id;`
    
    const res:favoriteModel|null = await sequelize.query<favoriteModel>(sql,{
        replacements:{
            id,
            user_id:userId
        },
        type: QueryTypes.SELECT,
        plain:true 
    })
    return res;
}
//差个分页方法
export const favoriteList= async (userId:number):Promise<any>=>{
    let sql: string = `SELECT 
    id,user_id,article_id,title,content,addtime,source,sourceurl,create_time 
    FROM  
    favorite  WHERE user_id = :user_id  order by id desc;`
    const res:any = await sequelize.query(sql,{
        replacements:{
            user_id:userId
        },
        type: QueryTypes.SELECT, 
    })
    return res;
} 
export const favoriteListPage= async (userId:number,currentPage: number,pageSize: number):Promise<any>=>{
    let sql: string = `SELECT 
    id,user_id,article_id,title,content,addtime,source,sourceurl,create_time 
    FROM  
    favorite  WHERE user_id = :user_id order by id desc limit :start,:end;`
    const res:any = await sequelize.query(sql,{
        replacements:{
            user_id:userId,
            start: (currentPage-1)*pageSize,
            end: pageSize
        },
        type: QueryTypes.SELECT, 
    })
    return res;
}