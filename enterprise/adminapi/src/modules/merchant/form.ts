import {body} from "express-validator";

export const addForm = [
    //body("test").isBoolean().notEmpty().isInt().isLength({min:1,max:10}).isArray()
    
    //body("id").isInt(),
    body("name").notEmpty(),
    body("code").notEmpty(),
    //body("status").isInt(),
    //body("create_time").isInt(),
]

export const updateForm = [ 
    
    body("id").isInt(),
    body("name").notEmpty(),
    body("code").notEmpty(),
    //body("status").isInt(),
    //body("create_time").isInt(),
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
