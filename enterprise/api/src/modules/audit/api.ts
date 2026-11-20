import { Request, Response } from "express";
import { AuditService } from "./service";
import { httpSuccess, handleException, decodeJWT } from "../../common/common";

/**
 * 创建审核记录
 */
export const createAuditRecord = async (req: Request, res: Response) => {
  try {
    const service = new AuditService(req["token"]);
    const data = {
      audit_type: parseInt(req.body.audit_type),
      related_id: parseInt(req.body.related_id),
      entity_id: parseInt(req.body.entity_id),
      entity_name: req.body.entity_name || '',
      title: req.body.title,
      content: req.body.content || '',
      auditor_id: req.body.auditor_id || null,
      auditor_name: req.body.auditor_name || '',
      status: parseInt(req.body.status) || 1,
      remark: req.body.remark || ''
    };
    
    const result = await service.createAuditRecord(data);
    
    const handlerMap = {
      "ok": () => httpSuccess(res, result.data, "创建成功"),
      "error": () => httpSuccess(res, null, "创建失败"),
      "default": () => httpSuccess(res, null, "未知错误")
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "createAuditRecord");
  }
};

/**
 * 获取审核记录列表（根据当前用户角色）
 */
export const getAuditList = async (req: Request, res: Response) => {
  try { 
    const service = new AuditService(req["token"]);
    const result = await service.getAuditListByRole(req["entity_id"],req["role_id"]);
    
    const handlerMap = {
      "ok": () => httpSuccess(res, result.data, "获取成功"),
      "error": () => httpSuccess(res, null, "获取失败"),
      "default": () => httpSuccess(res, null, "未知错误")
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getAuditList");
  }
};

