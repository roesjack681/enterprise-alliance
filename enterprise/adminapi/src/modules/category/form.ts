import {body} from "express-validator";

export const addForm = [
    body("name").notEmpty(),
    body("icon").notEmpty(),
    body("sort").isInt({min: 0}),
    body("pid").isInt({min: 0}),
    body("status").isInt({min: 0, max: 1}),
    body("remark").optional().isString()
]

export const updateForm = [
    body("id").isInt({min: 1}),
    body("name").notEmpty(),
    body("icon").notEmpty(),
    body("sort").isInt({min: 0}),
    body("pid").isInt({min: 0}),
    body("status").isInt({min: 0, max: 1}),
    body("remark").optional().isString()
]

export const delForm = [
    body("id").isInt({min: 1})
]

export const detailForm = [
    body("id").isInt({min: 1})
]

export const setStatusForm = [
    body("id").isInt({min: 1}),
    body("status").isInt({min: 0, max: 1})
]

export const listForm = [
    body("current_page").optional().isInt({min: 1}),
    body("page_size").optional().isInt({min: 1, max: 100})
] 