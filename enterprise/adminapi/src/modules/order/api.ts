import { Request, Response } from "express";
import * as service from "./service";
import { http400Error, httpSuccess } from "../../common/common";


// 处理支付
export const processPayment = async (req: Request, res: Response) => {
    try {
        const params = {
            order_no: req.body.order_no,
            payment_method: req.body.payment_method,
            payment_order_no: req.body.payment_order_no,
            actual_price: req.body.actual_price
        };
        
        const result = await service.processPayment(params);
        return httpSuccess(res, result, "支付处理成功");
    } catch (error) {
        console.error("processPayment error:", error);
        return http400Error(res, error.message || "支付处理失败");
    }
};

// 查询订单列表 - 通用支付订单管理
export const queryOrderList = async (req: Request, res: Response) => {
    try {
        const params: any = {
            current_page: req.body.current_page || req.body.offset ? Math.floor(req.body.offset / (req.body.limit || 10)) + 1 : 1,
            page_size: req.body.page_size || req.body.limit || 10
        };
        
        // 只添加非空参数到查询条件中
        if (req.body.entity_id) {
            params.entity_id = req.body.entity_id;
        }
        if (req.body.business_type && req.body.business_type.trim() !== '') {
            params.business_type = req.body.business_type;
        }
        if (req.body.status && req.body.status !== 0) {
            params.status = req.body.status;
        }
        if (req.body.start_date && req.body.start_date.trim() !== '') {
            params.start_date = req.body.start_date;
        }
        if (req.body.end_date && req.body.end_date.trim() !== '') {
            params.end_date = req.body.end_date;
        }
        if (req.body.order_number && req.body.order_number.trim() !== '') {
            params.order_number = req.body.order_number;
        }
        if (req.body.username && req.body.username.trim() !== '') {
            params.username = req.body.username;
        }
        if (req.body.provider_id) {
            params.provider_id = req.body.provider_id;
        }
        if (req.body.payment_status !== undefined) {
            params.payment_status = req.body.payment_status;
        }
        
        const result = await service.queryOrderList(params);
        return httpSuccess(res, result, "查询支付订单列表成功");
    } catch (error) {
        console.error("queryOrderList error:", error);
        return http400Error(res, error.message || "查询支付订单列表失败");
    }
};

// 获取订单详情
export const getOrderDetail = async (req: Request, res: Response) => {
    try {
        const orderNo = req.body.order_no;
        const result = await service.getOrderDetail(orderNo);
        return httpSuccess(res, result, "获取订单详情成功");
    } catch (error) {
        console.error("getOrderDetail error:", error);
        return http400Error(res, error.message || "获取订单详情失败");
    }
};

// 取消订单
export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const orderNo = req.body.order_no;
        const reason = req.body.reason;
        const operatorId = req["user_id"] || 1;
        
        const result = await service.cancelOrder(orderNo, reason, operatorId);
        return httpSuccess(res, result, "订单取消成功");
    } catch (error) {
        console.error("cancelOrder error:", error);
        return http400Error(res, error.message || "取消订单失败");
    }
};

// 处理退款
export const processRefund = async (req: Request, res: Response) => {
    try {
        const params = {
            order_no: req.body.order_no,
            refund_amount: req.body.refund_amount,
            refund_reason: req.body.refund_reason,
            operator_id: req["user_id"] || 1
        };
        
        const result = await service.processRefund(params);
        return httpSuccess(res, result, "退款处理成功");
    } catch (error) {
        console.error("processRefund error:", error);
        return http400Error(res, error.message || "退款处理失败");
    }
};

// 更新订单状态
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const orderNo = req.body.order_no;
        const status = req.body.status;
        const operatorId = req["user_id"] || 1;
        const message = req.body.message;
        
        const result = await service.updateOrderStatus(orderNo, status, operatorId, message);
        return httpSuccess(res, result, "订单状态更新成功");
    } catch (error) {
        console.error("updateOrderStatus error:", error);
        return http400Error(res, error.message || "更新订单状态失败");
    }
};

// 获取订单统计
export const getOrderStatistics = async (req: Request, res: Response) => {
    try {
        const entityId = req.body.entity_id;
        const businessType = req.body.business_type;
        
        const result = await service.getOrderStatistics(entityId, businessType);
        return httpSuccess(res, result, "获取订单统计成功");
    } catch (error) {
        console.error("getOrderStatistics error:", error);
        return http400Error(res, error.message || "获取订单统计失败");
    }
};

// 清理过期的缓存订单
export const cleanExpiredCachedOrders = async (req: Request, res: Response) => {
    try {
        const result = await service.cleanExpiredCachedOrders();
        return httpSuccess(res, result, "清理过期订单成功");
    } catch (error) {
        console.error("cleanExpiredCachedOrders error:", error);
        return http400Error(res, error.message || "清理过期订单失败");
    }
};

// 获取订单日志
export const getOrderLogs = async (req: Request, res: Response) => {
    try {
        const orderNo = req.body.order_no;
        const currentPage = req.body.current_page || 1;
        const pageSize = req.body.page_size || 20;
        
        const result = await service.getOrderLogs(orderNo, currentPage, pageSize);
        return httpSuccess(res, result, "获取订单日志成功");
    } catch (error) {
        console.error("getOrderLogs error:", error);
        return http400Error(res, error.message || "获取订单日志失败");
    }
};


// 导出订单
export const exportOrderExcel = async (req: Request, res: Response) => {
    try {
        const params: any = {};
        
        // 只添加非空参数到查询条件中
        if (req.body.entity_id) {
            params.entity_id = req.body.entity_id;
        }
        if (req.body.business_type && req.body.business_type.trim() !== '') {
            params.business_type = req.body.business_type;
        }
        if (req.body.status && req.body.status !== 0) {
            params.status = req.body.status;
        }
        if (req.body.start_date && req.body.start_date.trim() !== '') {
            params.start_date = req.body.start_date;
        }
        if (req.body.end_date && req.body.end_date.trim() !== '') {
            params.end_date = req.body.end_date;
        }
        if (req.body.order_number && req.body.order_number.trim() !== '') {
            params.order_number = req.body.order_number;
        }
        if (req.body.username && req.body.username.trim() !== '') {
            params.username = req.body.username;
        }
        
        const result = await service.exportOrderData(params);
        return httpSuccess(res, { data: result, url: "/download/orders.xlsx" }, "导出订单成功");
    } catch (error) {
        console.error("exportOrderExcel error:", error);
        return http400Error(res, error.message || "导出订单失败");
    }
};

// 确认订单处理
export const confirmOrderProcess = async (req: Request, res: Response) => {
    try {
        const orderNo = req.body.order_no;
        const operatorId = req.body.operator_id || 0;
        
        const result = await service.confirmPaymentOrder(orderNo, operatorId);
        return httpSuccess(res, result, "订单处理成功");
    } catch (error) {
        console.error("confirmOrderProcess error:", error);
        return http400Error(res, error.message || "订单处理失败");
    }
};