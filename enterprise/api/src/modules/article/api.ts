import { Request, Response } from "express";
import { ArticleService } from "./service";
import { httpSuccess, handleException } from "../../common/common";

/**
 * 获取启用的文章分类列表
 */
export const getActiveCategoryList = async (req: Request, res: Response) => {
  try {
    const service = new ArticleService();
    const result = await service.getActiveCategoryList();
    
    const handlerMap = {
      "ok": () => httpSuccess(res, result.data, "获取成功"),
      "error": () => httpSuccess(res, null, "获取失败"),
      "default": () => httpSuccess(res, null, "未知错误")
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getActiveCategoryList");
  }
};

/**
 * 获取启用的文章列表
 * 支持按分类筛选
 */
export const getActiveArticleList = async (req: Request, res: Response) => {
  try {
    const service = new ArticleService();
    const categoryId = req.body.category_id ? parseInt(req.body.category_id) : undefined;
    
    const result = await service.getActiveArticleList(categoryId);
    
    const handlerMap = {
      "ok": () => httpSuccess(res, result.data, "获取成功"),
      "error": () => httpSuccess(res, null, "获取失败"),
      "default": () => httpSuccess(res, null, "未知错误")
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getActiveArticleList");
  }
};

