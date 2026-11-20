import {sequelize} from "../../storage/mysql";
import {QueryTypes} from "sequelize";
import {adminModel} from "./proto";

//登录查询
export const login = async (username: string,password: string): Promise<adminModel|null> => {
   
    let sql: string = `SELECT 
    id,role_id,mch_id,username,password,realname,mobile,email,create_time,status
                    FROM  admin  WHERE username =:username AND password=:password;`
    
    const res:adminModel|null = await sequelize.query<adminModel>(sql,{
        replacements:{
            username:username,
            password:password
        },
        type: QueryTypes.SELECT,
        plain:true 
    })
    return res;
}
export const adminAdd = async (data: adminModel): Promise<number|null> => {
    let sql: string =`INSERT INTO admin (role_id,mch_id,username,password,realname,mobile,email,create_time,status)
                        VALUES (:role_id,:mch_id,:username,:password,:realname,:mobile,:email,:create_time,:status);`

    const [id,rows] = await sequelize.query(sql,{
        replacements:{
            role_id:data.role_id,mch_id:data.mch_id,username:data.username,password:data.password,realname:data.realname,mobile:data.mobile,email:data.email,create_time:data.create_time,status:data.status,
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
export const adminUpdate = async (data: adminModel): Promise<any> => {
    let sql: string = `UPDATE admin
                        SET 
                        role_id=:role_id,mch_id=:mch_id,username=:username,password=:password,realname=:realname,mobile=:mobile,email=:email,update_time=:create_time
                        WHERE 
                            id = :id ;`

    const [id,rows] = await sequelize.query(sql,{
        replacements:{
            id:data.id,role_id:data.role_id,mch_id:data.mch_id,username:data.username,password:data.password,realname:data.realname,mobile:data.mobile,email:data.email,create_time:data.create_time,status:data.status,
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
export const setStatus = async (id:number,status:number): Promise<any> => {
    let sql: string = `UPDATE admin
                        SET 
                        status=:status
                        WHERE 
                        id =:id;`

    const [rows] = await sequelize.query(sql,{
        replacements:{
            id:id,
            status:status
        },
        type: QueryTypes.UPDATE,
        plain: true
    })
   return 1;
     
} 
export const adminDel= async (id:number,userId:number):Promise<any>=>{
    let sql: string = `DELETE  FROM  admin  WHERE id = :id ;` 
    const res = await sequelize.query(sql,{
        replacements:{
            id:id  
        },
        type: QueryTypes.DELETE,
         
    })
    return res;
}
export const adminDetail= async (id:number):Promise<adminModel|null>=>{
    let sql: string = `SELECT 
    id,role_id,mch_id,username,realname,mobile,email,create_time,status
                    FROM  admin  WHERE id = :id ;`
    
    const res:adminModel|null = await sequelize.query<adminModel>(sql,{
        replacements:{
            id:id,
        },
        type: QueryTypes.SELECT,
        plain:true 
    })
    return res;
}
//差个分页方法
export const adminList= async (userId:number):Promise<any>=>{
    let sql: string = `SELECT 
    id,role_id,mch_id,username,password,realname,mobile,email,create_time,status 
    FROM  
    admin  WHERE 1 = 1 ;`
    const res:any = await sequelize.query(sql,{
        replacements:{
            user_id:userId
        },
        type: QueryTypes.SELECT, 
    })
    return res;
} 
export const adminListPage= async (userId:number,currentPage: number,pageSize: number):Promise<any>=>{
    let sql: string = `SELECT 
    id,role_id,mch_id,username,password,realname,mobile,email,create_time,status 
    FROM  
    admin  WHERE user_id = :user_id limit :start,:end;`
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