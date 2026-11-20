import { Request, Response } from "express";
import { ServiceFlowService } from "./service";
import {
  httpSuccess,
  http400Error,
  handleException,
} from "../../common/common";
import { getLang } from "../../lang";

// ======================== 服务流程管理相关接口 ========================

/**
 * 创建服务订单
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const service = new ServiceFlowService({ token: req["token"] });
    const userId = req["entity_id"];
    const orderData = {
      service_id: req.body.service_id,
      service_type: req.body.service_type,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      cycle_months: req.body.cycle_months,
      price: req.body.price,
      remarks: req.body.remarks
    };

    const result = await service.createOrder(orderData, userId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("create_order_success")),
      template_not_found: () => http400Error(res, getLang("template_not_found")),
      create_order_failed: () => http400Error(res, getLang("create_order_failed")),
      create_instance_failed: () => http400Error(res, getLang("create_instance_failed")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "createOrder");
  }
};

/**
 * 查询订单列表
 */
export const queryOrderList = async (req: Request, res: Response) => {
  try {
    const service = new ServiceFlowService({ token: req["token"] });
    const userId = req["entity_id"];
    const params = {
      provider_id: req.body.provider_id,
      service_type: req.body.service_type,
      status: req.body.status,
      current_page: req.body.current_page,
      page_size: req.body.page_size
    };

    const result = await service.queryOrderList(params, userId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("query_success")),
      query_failed: () => http400Error(res, getLang("query_failed")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "queryOrderList");
  }
};

/**
 * 查询服务商订单列表（专用接口）
 */
export const queryProviderOrders = async (req: Request, res: Response) => {
  try {
    const service = new ServiceFlowService({ token: req["token"] });
    const providerId = req["entity_id"];
    const params = {
      provider_id: providerId,
      service_type: req.body.service_type,
      status: req.body.status,
      current_page: req.body.current_page,
      page_size: req.body.page_size
    };

    const result = await service.queryOrderList(params, providerId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("query_success")),
      query_failed: () => http400Error(res, getLang("query_failed")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "queryProviderOrders");
  }
};

/**
 * 获取订单详情
 */
export const getOrderDetail = async (req: Request, res: Response) => {
  try {
    const service = new ServiceFlowService({ token: req["token"] });
    const userId = req["entity_id"];
    const orderId = req.body.order_id;

    const result = await service.getOrderDetail(orderId, userId);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("query_success")),
      order_not_found: () => http400Error(res, getLang("order_not_found")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getOrderDetail");
  }
};

/**
 * 推进流程
 */
export const advanceProcess = async (req: Request, res: Response) => {
  try {
    const service = new ServiceFlowService({ token: req["token"] });
    const userId = req["entity_id"];
    const params = {
      order_id: req.body.order_id,
      current_step: req.body.current_step,
      next_step: req.body.next_step,
      remarks: req.body.remarks,
      attachments: req.body.attachments
    };

    const result = await service.advanceProcess(params, userId);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("advance_process_success")),
      order_not_found: () => http400Error(res, getLang("order_not_found")),
      instance_not_found: () => http400Error(res, getLang("instance_not_found")),
      step_mismatch: () => http400Error(res, getLang("step_mismatch")),
      template_not_found: () => http400Error(res, getLang("template_not_found")),
      invalid_step: () => http400Error(res, getLang("invalid_step")),
      update_instance_failed: () => http400Error(res, getLang("update_instance_failed")),
      update_order_failed: () => http400Error(res, getLang("update_order_failed")),
      permission_denied: () => http400Error(res, getLang("permission_denied")),
      role_permission_denied: () => http400Error(res, `角色权限不足，需要${result.data?.required_role}角色，当前为${result.data?.user_role}角色`),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error"))
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "advanceProcess");
  }
};

/**
 * 取消订单
 */
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const service = new ServiceFlowService({ token: req["token"] });
    const userId = req["entity_id"];
    const orderId = req.body.order_id;
    const reason = req.body.reason;

    const result = await service.cancelOrder(orderId, userId, reason);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("cancel_order_success")),
      cancel_failed: () => http400Error(res, getLang("cancel_order_failed")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "cancelOrder");
  }
};

/**
 * 暂停/恢复订单
 */
export const pauseResumeOrder = async (req: Request, res: Response) => {
  try {
    const service = new ServiceFlowService({ token: req["token"] });
    const userId = req["entity_id"];
    const orderId = req.body.order_id;
    const action = req.body.action;
    const reason = req.body.reason;

    let result;
    if (action === 'pause') {
      result = await service.pauseOrder(orderId, userId, reason);
    } else if (action === 'resume') {
      result = await service.resumeOrder(orderId, userId);
    } else {
      return http400Error(res, getLang("invalid_action"));
    }

    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("operation_success")),
      pause_failed: () => http400Error(res, getLang("pause_order_failed")),
      resume_failed: () => http400Error(res, getLang("resume_order_failed")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error"))
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "pauseResumeOrder");
  }
};


/**
 * 获取流程模板
 */
export const getProcessTemplate = async (req: Request, res: Response) => {
  try {
    const service = new ServiceFlowService({ token: req["token"] });
    const serviceId = req.body.service_id;

    const result = await service.getProcessTemplate(serviceId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("query_success")),
      template_not_found: () => http400Error(res, getLang("template_not_found")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getProcessTemplate");
  }
};
