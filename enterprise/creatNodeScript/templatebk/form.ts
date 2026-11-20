import {body} from "express-validator";

export const addForm = [
    //body("test").isBoolean().notEmpty().isInt().isLength({min:1,max:10}).isArray()
    <%for(let i=0;i<fields.length;i++){%>
    body("<%=fields[i].name%>")<%=fields[i].type=="number"?'.isInt()':'.notEmpty()'%>,<%}%>
]

export const updateForm = [ 
    <%for(let i=0;i<fields.length;i++){%>
    body("<%=fields[i].name%>")<%=fields[i].type=="number"?'.isInt()':'.notEmpty()'%>,<%}%>
]

export const delForm = [
    body("id").isInt()
]
export const detailForm = [
    body("id").isInt()
]
export const listForm = [
    body("current_page").isInt({min:1}),
    body("page_size").isInt({min:10}),
 ]
