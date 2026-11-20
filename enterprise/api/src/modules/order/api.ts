import { Request, Response } from "express";
import { httpSuccess, http400Error, handleException } from "../../common/common";
import { getLang } from "../../lang";
import { OrderService } from "./service";

// ======================== 订单相关接口 ========================

/**
 * 创建订单 - 只缓存到Redis，返回订单信息供选择支付方式
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const role_id= req["role_id"];
    if(role_id!==8){
        return http400Error(res, "您没有权限创建订单")
    }
    const service = new OrderService({ token: req["token"],entity_id:req["entity_id"] });
const data =req.body;
    const result = await service.createOrder(data);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, "订单创建成功，请选择支付方式"),
      business_not_found: () => http400Error(res, "业务信息不存在"),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "createOrder");
  }
};

/**
 * 确认订单 - 支付成功后调用，将Redis缓存数据写入数据库
 */
export const confirmOrder = async (req: Request, res: Response) => {
  try {
    const service = new OrderService({token:req["token"],entity_id:req["entity_id"]});
    const { order_no, payment_data } = req.body;
    const result = await service.confirmOrder(order_no, payment_data);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, "订单确认成功"),
      order_not_found: () => http400Error(res, "订单不存在"),
      order_expired: () => http400Error(res, "订单已过期"),
      confirm_failed: () => http400Error(res, "订单确认失败"),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "confirmOrder");
  }
};

/**
 * 根据订单号获取订单信息
 */
export const getOrderByNo = async (req: Request, res: Response) => {
  try {
    const service = new OrderService({token:req["token"],entity_id:req["entity_id"]});
    const { order_no } = req.body;
    const result = await service.getOrderByNo(order_no);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      order_not_found: () => http400Error(res, "订单不存在"),
      order_expired: () => http400Error(res, "订单已过期"),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "getOrderByNo");
  }
};

/**
 * 获取订单详情
 */
export const getOrderDetail = async (req: Request, res: Response) => {
  try {
    const service = new OrderService({token:req["token"],entity_id:req["entity_id"]});
    const { id } = req.body;
    const entityId = req["token"].entity_id;
    
    const result = await service.getOrderDetail(id, entityId);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      not_found: () => http400Error(res, "订单不存在"),
      query_failed: () => http400Error(res, "查询失败"),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "getOrderDetail");
  }
};

/**
 * 获取订单列表
 */
export const getOrderList = async (req: Request, res: Response) => {
  try {
    const service = new OrderService({token:req["token"],entity_id:req["entity_id"]});
    const query = req.body;
    const result = await service.getOrderList(query);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      query_failed: () => http400Error(res, "查询失败"),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "getOrderList");
  }
};

/**
 * 更新订单状态
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const service = new OrderService({token:req["token"],entity_id:req["entity_id"]});
    const data = req.body;
    const result = await service.updateOrderStatus(data);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      order_not_found: () => http400Error(res, "订单不存在"),
      update_failed: () => http400Error(res, "更新失败"),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "updateOrderStatus");
  }
};

/**
 * 取消订单
 */
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const service = new OrderService({token:req["token"],entity_id:req["entity_id"]});
    const { id, reason } = req.body;
    const entityId = req["token"].entity_id;
    
    const result = await service.cancelOrder(id, reason, entityId);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      order_not_found: () => http400Error(res, "订单不存在"),
      update_failed: () => http400Error(res, "取消失败"),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "cancelOrder");
  }
};

/**
 * 获取订单状态（通过userOrderId）
 */
export const getOrderStatus = async (req: Request, res: Response) => {
  try {
    const service = new OrderService({token:req["token"],entity_id:req["entity_id"]});
    const { userOrderId } = req.params;
    
    // 需要通过userOrderId查询订单状态
    // 这里需要在service中添加相应的方法或使用现有方法
    // 暂时返回一个简单的响应
    const result = { msg: "ok", data: { status: "pending", userOrderId } };
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      not_found: () => http400Error(res, "订单不存在"),
      query_failed: () => http400Error(res, "查询失败"),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "getOrderStatus");
  }
};

/**
 * 更新订单支付方式
 */
export const updatePaymentMethod = async (req: Request, res: Response) => {
  try {
    const service = new OrderService({token:req["token"],entity_id:req["entity_id"]});
    const { order_no, payment_method } = req.body;
    
    const result = await service.updateOrderPaymentMethod(order_no, payment_method);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      order_not_found: () => http400Error(res, "订单不存在"),
      order_expired: () => http400Error(res, "订单已过期"),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "updatePaymentMethod");
  }
};

/**
 * 处理支付成功回调
 */
export const processPaymentSuccess = async (req: Request, res: Response) => {
  try {
    const service = new OrderService({token:req["token"],entity_id:req["entity_id"]});
    const { order_no, payment_data } = req.body;
    const result = await service.processPaymentSuccess(order_no, payment_data);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, "支付处理成功"),
      order_not_found: () => http400Error(res, "订单不存在"),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "processPaymentSuccess");
  }
};

/**
 * 创建业务订单
 */
export const createBusinessOrder = async (req: Request, res: Response) => {
  try {
    const service = new OrderService({token:req["token"],entity_id:req["entity_id"]});
    const { order_id } = req.body;
    const result = await service.createBusinessOrder(order_id);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, "业务订单创建成功"),
      order_not_found: () => http400Error(res, "订单不存在"),
      business_order_already_created: () => http400Error(res, "业务订单已创建"),
      unsupported_business_type: () => http400Error(res, "不支持的业务类型"),
      business_order_create_failed: () => http400Error(res, "业务订单创建失败"),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "createBusinessOrder");
  }
};

/**
 * 获取订单日志
 */
export const getOrderLogs = async (req: Request, res: Response) => {
  try {
    const service = new OrderService({token:req["token"],entity_id:req["entity_id"]});
    const { order_id } = req.body;
    
    const result = await service.getOrderLogs(order_id);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      query_failed: () => http400Error(res, "查询失败"),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "getOrderLogs");
  }
};

/**
 * 获取服务商订单统计
 */
export const getProviderOrderStats = async (req: Request, res: Response) => {
  try {
    const service = new OrderService({ token: req["token"], entity_id: req["entity_id"] });
    const result = await service.getProviderOrderStats(req["entity_id"]);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, "获取统计数据成功"),
      db_error: () => http400Error(res, "数据库查询失败"),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "getProviderOrderStats");
  }
};

/**
 * 获取服务商订单列表
 */
export const getProviderOrderList = async (req: Request, res: Response) => {
  try {
    const service = new OrderService({ token: req["token"], entity_id: req["entity_id"] });
    
    const query = {
      page: req.body.page || 1,
      page_size: req.body.page_size || 10,
      status: req.body.status,
      business_type: req.body.business_type,
      start_date: req.body.start_date,
      end_date: req.body.end_date
    };
    
    const result = await service.getProviderOrderList(query);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, "获取订单列表成功"),
      db_error: () => http400Error(res, "数据库查询失败"),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "getProviderOrderList");
  }
}; 