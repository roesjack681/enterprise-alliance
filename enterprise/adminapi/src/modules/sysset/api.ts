import {Request, Response} from "express";
import * as service from "./service";
import {http400Error, httpSuccess, handleException} from "../../common/common";

// 按IDs获取系统配置
export const getByIds = async (req: Request, res: Response) => {
    try {
        const ids: number[] = req.body.ids;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return http400Error(res, "ids参数不能为空且必须为数组");
        }
        
        const result = await service.getByIds(ids);
        return httpSuccess(res, result, "获取成功");
    } catch (error) {
        return handleException(res, error, "getByIds");
    }
}

// 编辑系统配置
export const updateSysSet = async (req: Request, res: Response) => {
    try {
        const id: number = req.body.id;
        const title: string = req.body.title;
        const json: string = req.body.json;
        const status: number = req.body.status || 1;
        
        if (!json) {
            return http400Error(res, "json配置内容不能为空");
        }
        
        // 验证JSON格式
        try {
            JSON.parse(json);
        } catch (e) {
            return http400Error(res, "json格式不正确");
        }
        
        const result = await service.updateSysSet(id, { title, json, status });
        
        if (result.success) {
            return httpSuccess(res, {}, result.message);
        } else {
            return http400Error(res, result.message);
        }
    } catch (error) {
        return handleException(res, error, "updateSysSet");
    }
}
