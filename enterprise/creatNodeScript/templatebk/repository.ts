import {sequelize} from "../../storage/mysql";
import {QueryTypes} from "sequelize";
import {<%=modelName%>Model} from "./proto";

export const <%=modelName%>Add = async (data: <%=modelName%>Model): Promise<number|null> => {
    let sql: string =`INSERT INTO <%=tableName%> (<%for(let i=1;i<fields.length;i++){%><%=fields.length-1==i?fields[i].name:fields[i].name+','%><%}%>)
                        VALUES (<%for(let i=1;i<fields.length;i++){%>:<%=fields.length-1==i?fields[i].name:fields[i].name+','%><%}%>);`

    const [id,rows] = await sequelize.query(sql,{
        replacements:{
            <%for(let i=1;i<fields.length;i++){%><%=fields[i].name%>:data.<%=fields[i].name%>,<%}%>
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
export const <%=modelName%>Update = async (data: <%=modelName%>Model): Promise<any> => {
    let sql: string = `UPDATE <%=tableName%>
                        SET 
                        <%for(let i=0;i<fields.length;i++){%><%=fields[i].name%>=:<%=fields.length-1==i?fields[i].name:fields[i].name+','%><%}%>
                        WHERE 
                            id = :id AND user_id = :user_id;`

    const [id,rows] = await sequelize.query(sql,{
        replacements:{
            <%for(let i=0;i<fields.length;i++){%><%=fields[i].name%>:data.<%=fields[i].name%>,<%}%>
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
export const <%=modelName%>Del= async (id:number,userId:number):Promise<any>=>{
    let sql: string = `DELETE  FROM  <%=tableName%>  WHERE id = :id AND user_id=:user_id ;` 
    const res = await sequelize.query(sql,{
        replacements:{
            id:id,
            user_id:userId
        },
        type: QueryTypes.DELETE,
         
    })
    return res;
}
export const <%=modelName%>Detail= async (id:number,userId:number):Promise<<%=modelName%>Model|null>=>{
    let sql: string = `SELECT 
    <%for(let i=0;i<fields.length;i++){%><%=fields.length-1==i?fields[i].name:fields[i].name+','%><%}%>
                    FROM  <%=tableName%>  WHERE id = :id AND user_id=:user_id;`
    
    const res:<%=modelName%>Model|null = await sequelize.query<<%=modelName%>Model>(sql,{
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
export const <%=modelName%>List= async (userId:number):Promise<any>=>{
    let sql: string = `SELECT 
    <%for(let i=0;i<fields.length;i++){%><%=fields.length-1==i?fields[i].name:fields[i].name+','%><%}%> 
    FROM  
    <%=tableName%>  WHERE user_id = :user_id ;`
    const res:any = await sequelize.query(sql,{
        replacements:{
            user_id:userId
        },
        type: QueryTypes.SELECT, 
    })
    return res;
} 
export const <%=modelName%>ListPage= async (userId:number,currentPage: number,pageSize: number):Promise<any>=>{
    let sql: string = `SELECT 
    <%for(let i=0;i<fields.length;i++){%><%=fields.length-1==i?fields[i].name:fields[i].name+','%><%}%> 
    FROM  
    <%=tableName%>  WHERE user_id = :user_id limit :start,:end;`
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