import {<%=modelName%>Model} from "./proto";
import { rpcPost} from "../../common/common";
import { ResponseData, TokenData,rpcResult } from "../app/proto";

export interface I<%=modelName%>Service<TokenData> {   
    add(data: <%=modelName%>Model): Promise<ResponseData>
    update(data: <%=modelName%>Model): Promise<ResponseData>
    del(id: number,userId:number): Promise<ResponseData>
    detail(id:number,userId:number): Promise<ResponseData>
    listall(userId: number): Promise<ResponseData>
    listPage(userId: number, currentPage: number, pageSize: number): Promise<ResponseData>    
}

export class <%=modelName%>Service implements I<%=modelName%>Service<TokenData> {
    protected token: string
    constructor(tokenData: TokenData) {
        this.token = tokenData.token
    }
    async add(data: <%=modelName%>Model): Promise<ResponseData> {
        try{
            const fields = [<% for(let i=1; i<fields.length; i++){ %>'<%= fields[i].name %>'<% if (i < fields.length - 1) { %>,<% } %> <% } %>];
            const placeholders = fields.map(() => '?').join(',');
            const sql = `INSERT INTO <%=tableName%> (${fields.join(',')}) VALUES (${placeholders});`;
            const params = fields.map(key => (data as any)[key]);
            const res =<rpcResult> await rpcPost('/insert', {sql,params},this.token);
            if (res && res.code === 0) {                
                return { msg: "ok", data: null };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            console.error("Error in <%=modelName%>ListPage:", error);
            return { msg: "server_error", data: null };
        }
    }
    async update(data: <%=modelName%>Model): Promise<ResponseData> {
        try{
            const fields = [<% for(let i=1; i<fields.length; i++){ %>'<%= fields[i].name %>'<% if (i < fields.length - 1) { %>,<% } %> <% } %>];    
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const sql = `UPDATE <%=tableName%> SET ${setClause} WHERE id = ?`;
            const params = fields.map(key => (data as any)[key]).concat(data.id);
            const res =<rpcResult> await rpcPost('/update', { sql, params },this.token);
            if (res && res.code === 0) {                
                return { msg: "ok", data: null };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            console.error("Error in <%=modelName%>ListPage:", error);
            return { msg: "server_error", data: null };
        }
    }
    async del(id:number,userId:number): Promise<ResponseData> {
        try{
            const sql = `UPDATE <%=tableName%> SET status = 0 WHERE id = ? AND user_id = ?`;
            const params = [id, userId];
            const res =<rpcResult> await rpcPost('/update', { sql, params },this.token);
            if (res && res.code === 0) {                
                return { msg: "ok", data: null };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            console.error("Error in <%=modelName%>ListPage:", error);
            return { msg: "server_error", data: null };
        }
    }
    async detail(id:number,userId:number): Promise<ResponseData> {
        try{
            const sql = "SELECT <%for(let i=0;i<fields.length;i++){%><%=fields.length-1==i?fields[i].name:fields[i].name+','%><%}%> FROM <%=tableName%> WHERE  id = ? AND user_id = ? AND status = 1; ";
            const params = [id, userId];
            const res =<rpcResult> await rpcPost('/select', { sql, params },this.token);
            if (res && res.code === 0) {
                const data: <%=modelName%>Model[] = JSON.parse(res.data.result);
                if (!Array.isArray(data) || data.length === 0) {
                    return { msg: "no_data", data: null };
                }
                return { msg: "ok", data: data[0] };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            console.error("Error in <%=modelName%>ListPage:", error);
            return { msg: "server_error", data: null };
        }
    }
    async listall(userId:number): Promise<ResponseData> {
        try{
            const  sql = `SELECT <%for(let i=0;i<fields.length;i++){%><%=fields.length-1==i?fields[i].name:fields[i].name+','%><%}%>  FROM <%=tableName%> WHERE AND user_id = ? AND status = 1 ORDER BY id DESC LIMIT ? OFFSET ?;`; 
            const params = [userId]; 
            const res =<rpcResult> await rpcPost('/select', { sql, params },this.token); 
        
            if (res && res.code === 0) {
                const data: <%=modelName%>Model[] = JSON.parse(res.data.result);
                if (!Array.isArray(data) || data.length === 0) {
                    return { msg: "no_data", data: null };
                }
                return { msg: "ok", data: data };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            console.error("Error in <%=modelName%>ListPage:", error);
            return { msg: "server_error", data: null };
        }
    }
    async listPage(userId: number, currentPage: number = 1, pageSize: number = 10): Promise<ResponseData> {
        try {
            const offset = (currentPage - 1) * pageSize;
            const sql = `SELECT <%for(let i=0;i<fields.length;i++){%><%=fields.length-1==i?fields[i].name:fields[i].name+','%><%}%> FROM <%=tableName%> WHERE  user_id = ? AND status = 1 ORDER BY id DESC LIMIT ?,?;`;
            const params = [userId, offset, pageSize];
            const res=<rpcResult> await rpcPost('/select', { sql, params },this.token);
            if (res && res.code === 0) {
                const data: <%=modelName%>Model[] = JSON.parse(res.data.result);
                if (!Array.isArray(data) || data.length === 0) {
                    return { msg: "no_data", data: null };
                }
                return { msg: "ok", data: data };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            console.error("Error in <%=modelName%>ListPage:", error);
            return { msg: "server_error", data: null };
        }
    }
}
