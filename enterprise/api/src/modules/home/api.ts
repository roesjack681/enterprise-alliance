import { Request, Response } from "express";
import { HomeService } from "./service";
import { httpSuccess, handleException } from "../../common/common";

/**
 * 获取首页配置
 * 根据IDs获取轮播图、活动等配置信息
 */
export const getHomeConfig = async (req: Request, res: Response) => {
  try {
    const service = new HomeService();
    let ids: number[];
    
    // 处理参数格式，支持数组和字符串两种格式
    if (req.body.ids) {
      if (Array.isArray(req.body.ids)) {
        ids = req.body.ids.map(id => parseInt(id));
      } else if (typeof req.body.ids === 'string') {
        // 如果是字符串"3,4"，转换为数组[3,4]
        ids = req.body.ids.split(',').map(id => parseInt(id.trim()));
      } else {
        return httpSuccess(res, null, "ids参数格式错误");
      }
    } else {
      return httpSuccess(res, null, "ids参数不能为空");
    }
    
    // 验证转换后的数据
    if (!ids || ids.length === 0 || ids.some(id => isNaN(id) || id <= 0)) {
      return httpSuccess(res, null, "ids必须为有效的正整数");
    }
    
    const result = await service.getConfigByIds(ids);
    
    const handlerMap = {
      "ok": () => httpSuccess(res, result.data, "获取成功"),
      "error": () => httpSuccess(res, null, "获取失败"),
      "default": () => httpSuccess(res, null, "未知错误")
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getHomeConfig");
  }
};