import {body} from "express-validator";

export const areaForm = [
    body('type').isInt()
 ]
export const areaAddForm = [
   // body('code').notEmpty(),
    body('name').notEmpty(),
   // body('parent_code').notEmpty(),
   // body('type').notEmpty(), 
]