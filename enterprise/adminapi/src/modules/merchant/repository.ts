import {sequelize} from "../../storage/mysql";
import {QueryTypes} from "sequelize";
import {mchModel} from "./proto";

export const mchAdd = async (data: mchModel): Promise<number|null> => {
    let sql: string =`INSERT INTO merchant (name,code,status,address,private_key,create_time)
                        VALUES (:name,:code,:status,address,private_key,:create_time);`

    const [id,rows] = await sequelize.query(sql,{
        replacements:{
            name:data.name,code:data.code,status:data.status,
            address:data.address,
            private_key:data.private_key,
            create_time:data.create_time,
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
export const mchUpdate = async (data: mchModel): Promise<any> => {
    let sql: string = `UPDATE merchant
                        SET 
                        id=:id,name=:name,code=:code,status=:status,address=:address,private_key=:private_key
                        WHERE 
                            id = :id ;`

    const [id,rows] = await sequelize.query(sql,{
        replacements:{
            id:data.id,name:data.name,code:data.code,status:data.status,
            address:data.address,
            private_key:data.private_key,
        },
        type: QueryTypes.UPDATE,
        plain: true
    })
    return 1
     
} 
export const mchDel= async (id:number,userId:number):Promise<any>=>{
    let sql: string = `DELETE  FROM  merchant  WHERE id = :id;` 
    const res = await sequelize.query(sql,{
        replacements:{
            id:id,
            user_id:userId
        },
        type: QueryTypes.DELETE,
         
    })
    return res;
}
export const mchDetail= async (id:number,userId:number):Promise<mchModel|null>=>{
    let sql: string = `SELECT 
    id,name,code,status,address,private_key,create_time
                    FROM  merchant  WHERE id = :id ;`
    
    const res:mchModel|null = await sequelize.query<mchModel>(sql,{
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
export const mchList= async (userId:number):Promise<any>=>{
    let sql: string = `SELECT 
    id,name,code,status,address,private_key,create_time 
    FROM  
    merchant  WHERE 1 = 1 ;`
    const res:any = await sequelize.query(sql,{
        replacements:{
            user_id:userId
        },
        type: QueryTypes.SELECT, 
    })
    return res;
} 
export const mchListPage= async (userId:number,currentPage: number,pageSize: number):Promise<any>=>{
    let sql: string = `SELECT 
    id,name,code,status,address,private_key,create_time 
    FROM  
    merchant  WHERE user_id = :user_id limit :start,:end;`
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