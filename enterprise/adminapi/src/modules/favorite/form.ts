import {body} from "express-validator";

export const addForm = [
    //body("test").isBoolean().notEmpty().isInt().isLength({min:1,max:10}).isArray()
     
    body("article_id").isInt(),
    body("title").notEmpty(),
    body("content").notEmpty(),
    body("addtime").isInt(),
    body("source").notEmpty(),
    body("sourceurl").notEmpty(),
     
]

export const updateForm = [ 
    
    body("id").isInt(), 
    body("article_id").isInt(),
    body("title").notEmpty(),
    body("content").notEmpty(),
    body("addtime").isInt(),
    body("source").notEmpty(),
    body("sourceurl").notEmpty(),
     
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
