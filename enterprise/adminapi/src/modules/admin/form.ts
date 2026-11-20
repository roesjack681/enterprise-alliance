import {body} from "express-validator";

export const loginForm = [
    body("username").notEmpty(),
    body("password").notEmpty(),
]
export const userInfoForm = []
export const refreshTokenForm = []

export const addForm = [
    //body("test").isBoolean().notEmpty().isInt().isLength({min:1,max:10}).isArray()
    
    body("role_id").isInt(),
    //body("branch_id").isInt(),
    body("username").notEmpty(),
    body("password").notEmpty(),
    //body("realname").notEmpty(),
    //body("mobile").notEmpty(),
    //body("email").notEmpty(),
    //body("create_time").isInt(),
    //body("status").isInt(),
]

export const updateForm = [ 
    
    body("id").isInt(),
    body("role_id").isInt(),
    //body("branch_id").isInt(),
    body("username").notEmpty(),
    body("password").notEmpty(),
    //body("realname").notEmpty(),
    //body("mobile").notEmpty(),
    //body("email").notEmpty(),
    //body("create_time").isInt(),
   // body("status").isInt(),
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
