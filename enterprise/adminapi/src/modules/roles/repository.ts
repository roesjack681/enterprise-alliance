import {sequelize} from "../../storage/mysql";
import {QueryTypes} from "sequelize";
import {rolesModel} from "./proto";

export const rolesAdd = async (data: rolesModel): Promise<number|null> => {
    let sql: string =`INSERT INTO roles (name,nodes,status)
                        VALUES (:name,:nodes,:status);`

    const [id,rows] = await sequelize.query(sql,{
        replacements:{
            name:data.name,nodes:data.nodes,status:data.status,
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
export const rolesUpdate = async (data: rolesModel): Promise<any> => {
    let sql: string = `UPDATE roles
                        SET 
                        id=:id,name=:name,nodes=:nodes,status=:status
                        WHERE 
                            id = :id ;`

    const [id,rows] = await sequelize.query(sql,{
        replacements:{
            id:data.id,name:data.name,nodes:data.nodes,status:data.status,
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
export const rolesDel= async (id:number):Promise<any>=>{
    let sql: string = `DELETE  FROM  roles  WHERE id = :id ;` 
    const res = await sequelize.query(sql,{
        replacements:{
            id:id,
        },
        type: QueryTypes.DELETE,
         
    })
    return true;
}
export const rolesDetail= async (id:number):Promise<rolesModel|null>=>{
    let sql: string = `SELECT 
    id,name,nodes,status
                    FROM  roles  WHERE id = :id ;`
    
    const res:rolesModel|null = await sequelize.query<rolesModel>(sql,{
        replacements:{
            id:id,            
        },
        type: QueryTypes.SELECT,
        plain:true 
    })
    return res;
}
//差个分页方法
export const rolesList= async (userId:number):Promise<any>=>{
    let sql: string = `SELECT 
    id,name,nodes,status 
    FROM  
    roles  WHERE 1 = 1;`
    const res:any = await sequelize.query(sql,{
        replacements:{
            user_id:userId
        },
        type: QueryTypes.SELECT, 
    })
    return res;
} 
export const rolesListPage= async (userId:number,currentPage: number,pageSize: number):Promise<any>=>{
    let sql: string = `SELECT 
    id,name,nodes,status 
    FROM  
    roles  WHERE user_id = :user_id limit :start,:end;`
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