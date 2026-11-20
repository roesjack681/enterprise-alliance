import { Request, Response } from "express";
import { <%=modelName%>Service}  from "./service";
import { httpSuccess,http400Error,handleException } from "../../common/common";
import { <%=modelName%>Model} from "./proto";
import { getLang } from "../../lang";


export const <%=modelName%>Add= async(req:Request,res:Response) => { 
    try{
        const service = new <%=modelName%>Service({ token: req["token"] });
        <%for(let i=1;i<fields.length;i++){%>
        let <%=fields[i].name%>:<%=fields[i].type%>=req.body.<%=fields[i].name%><%}%> 
        const data:<%=modelName%>Model={id:0,<%for(let i=1;i<fields.length;i++){%><%=fields[i].name%>,<%}%>}
      
        const result = await service.add(data)
        const handlerMap = {
            ok: () => httpSuccess(res, result.data, getLang('add_success')),
            err: () => http400Error(res, getLang('failure')),            
            default:()=> http400Error(res, getLang('server_error'))                     
        };
        return (handlerMap[result.msg] ||handlerMap['default'])();
    } catch (error) {
        return handleException(res, error, 'entityAdd');
    }
}
export const <%=modelName%>Update = async(req:Request,res:Response) => {
    try{
        const service = new <%=modelName%>Service({ token: req["token"] });
        <%for(let i=0;i<fields.length;i++){%>
        let <%=fields[i].name%>:<%=fields[i].type%>=req.body.<%=fields[i].name%><%}%> 
        const data:<%=modelName%>Model={<%for(let i=0;i<fields.length;i++){%><%=fields[i].name%>,<%}%>}
        
        const result = await service.update(data)
        const handlerMap = {
            ok: () => httpSuccess(res, result.data, getLang('update_success')),
            err: () => http400Error(res, getLang('failure')),            
            default:()=> http400Error(res, getLang('server_error'))                     
        };
        return (handlerMap[result.msg] ||handlerMap['default'])();

    } catch (error) {
        return handleException(res, error, 'entityUpdate');
    }
}
export const <%=modelName%>Detail = async(req:Request,res:Response) => {
    try{
        const service = new <%=modelName%>Service({ token: req["token"] });
        let user_id:number=req["entity_id"]
        let id:number= req.body.id 
        const result = await service.detail(id,user_id);
        const handlerMap = {
            ok: () => httpSuccess(res, result.data, getLang('success')),
            err: () => http400Error(res, getLang('failure')),
            no_data: () => http400Error(res, getLang('no_data')),            
            default:()=> http400Error(res, getLang('server_error'))                     
        };
        return (handlerMap[result.msg] ||handlerMap['default'])();
    } catch (error: any) {
        return handleException(res, error, 'entityDetail');
    }
}
export const <%=modelName%>Del = async(req:Request,res:Response) => {
    try{
        const service = new <%=modelName%>Service({ token: req["token"] });
        let user_id:number=req["entity_id"]
        let id:number= req.body.id 
        const result = await service.del(id,user_id)     
        const handlerMap = {
            ok: () => httpSuccess(res, result.data, getLang('success')),
            err: () => http400Error(res, getLang('failure')),
            no_data: () => http400Error(res, getLang('no_data')),            
            default:()=> http400Error(res, getLang('server_error'))                     
        };
        return (handlerMap[result.msg] ||handlerMap['default'])();
    } catch (error: any) {
        return handleException(res, error, 'entityDetail');
    }
}
export const <%=modelName%>List = async (req:Request,res:Response) => {
    try{
        const service = new <%=modelName%>Service({ token: req["token"] });
        let user_id:number=req["entity_id"]
        const result = await service.listall(user_id)     
        const handlerMap = {
            ok: () => httpSuccess(res, result.data, getLang('success')),
            err: () => http400Error(res, getLang('failure')),
            no_data: () => http400Error(res, getLang('no_data')),            
            default:()=> http400Error(res, getLang('server_error'))                     
        };
        return (handlerMap[result.msg] ||handlerMap['default'])();
    } catch (error) {
        return handleException(res, error, 'entityList');
    }
 }
 export const <%=modelName%>ListPage = async (req:Request,res:Response) => { 
    try{
        const service = new <%=modelName%>Service({ token: req["token"] });
        let user_id:number=req["entity_id"]
        let currentPage=req.body.current_page
        let pageSize=req.body.page_size
        const result = await service.listPage(user_id,currentPage,pageSize)     
        const handlerMap = {
            ok: () => httpSuccess(res, result.data, getLang('success')),
            err: () => http400Error(res, getLang('failure')),
            no_data: () => http400Error(res, getLang('no_data')),           
            default:()=> http400Error(res, getLang('server_error'))                     
        };
        return (handlerMap[result.msg] ||handlerMap['default'])();
    } catch (error) {
        return handleException(res, error, 'entityList');
    }
 }