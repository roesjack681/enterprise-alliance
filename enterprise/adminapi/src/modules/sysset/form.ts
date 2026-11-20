import {body} from "express-validator";

// 按IDs获取配置的表单验证（支持单个或多个ID）
export const getByIdsForm = [
    body("ids").isArray({min: 1})
]

// 更新配置的表单验证
export const updateSysSetForm = [
    body("id").isInt({min: 1}),
    body("title").optional().isLength({max: 255}),
    body("json").notEmpty(),
    body("status").optional().isInt({min: 0, max: 1})
]