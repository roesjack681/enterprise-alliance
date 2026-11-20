import { Request, Response } from "express";
import * as service from "./service";
import { http400Error, httpSuccess } from "../../common/common";

// 获取工作台统计数据
export const getWorkbenchStatistics = async (req: Request, res: Response) => {
    try {
        const adminId = req["user_id"] || req.body.admin_id;
        const result = await service.getWorkbenchStatistics(adminId);
        return httpSuccess(res, result, "获取工作台统计数据成功");
    } catch (error) {
        return http400Error(res, error.message || "获取统计数据失败");
    }
};

// 获取流程监控概览统计数据
export const getMonitoringOverview = async (req: Request, res: Response) => {
    try {
        const result = await service.getMonitoringOverview();
        return httpSuccess(res, result, "获取监控概览数据成功");
    } catch (error) {
        return http400Error(res, error.message || "获取监控概览数据失败");
    }
};

// 查询订单列表
export const queryOrderList = async (req: Request, res: Response) => {
    try {
        const params = {
            entity_id: req.body.entity_id,
            service_id: req.body.service_id,
            service_type: req.body.service_type,
            status: req.body.status,
            priority: req.body.priority,
            assigned_admin: req.body.assigned_admin,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            current_page: req.body.current_page || 1,
            page_size: req.body.page_size || 10
        };
        
        const result = await service.queryOrderList(params);
        return httpSuccess(res, result, "查询订单列表成功");
    } catch (error) {
        return http400Error(res, error.message || "查询订单列表失败");
    }
};

// 获取订单详情
export const getOrderDetail = async (req: Request, res: Response) => {
    try {
        const orderId = req.body.order_id;
        const result = await service.getOrderDetail(orderId);
        
        if (!result) {
            return http400Error(res, "订单不存在");
        }
        
        return httpSuccess(res, result, "获取订单详情成功");
    } catch (error) {
        return http400Error(res, error.message || "获取订单详情失败");
    }
};

// 获取下一步骤信息
export const getNextStep = async (req: Request, res: Response) => {
    try {
        const params = {
            order_id: req.body.order_id
        };
        
        const result = await service.getNextStep(params);
        return httpSuccess(res, result, "获取下一步骤成功");
    } catch (error) {
        return http400Error(res, error.message || "获取下一步骤失败");
    }
};

// 推进流程
export const advanceProcess = async (req: Request, res: Response) => {
    try {
        const params = {
            order_id: req.body.order_id,
            current_step: req.body.current_step,
            next_step: req.body.next_step,
            admin_id: req["user_id"],
            remarks: req.body.remarks,
            attachments: req.body.attachments,
            auto_advance: req.body.auto_advance
        };
        
        const result = await service.advanceProcess(params);
        return httpSuccess(res, result, "流程推进成功");
    } catch (error) {
        return http400Error(res, error.message || "流程推进失败");
    }
};

// 分配任务
export const assignTasks = async (req: Request, res: Response) => {
    try {
        const params = {
            order_ids: req.body.order_ids || [],
            admin_id: req.body.admin_id,
            remarks: req.body.remarks
        };
        
        const result = await service.assignTasks(params);
        return httpSuccess(res, result, "任务分配成功");
    } catch (error) {
        return http400Error(res, error.message || "任务分配失败");
    }
};

// 批量操作
export const batchOperation = async (req: Request, res: Response) => {
    try {
        const params = {
            order_ids: req.body.order_ids || [],
            operation: req.body.operation,
            value: req.body.value,
            admin_id: req["user_id"],
            remarks: req.body.remarks
        };
        
        const result = await service.batchOperation(params);
        return httpSuccess(res, result, "批量操作成功");
    } catch (error) {
        return http400Error(res, error.message || "批量操作失败");
    }
};

// 创建流程模板
export const createTemplate = async (req: Request, res: Response) => {
    try {
        const params = {
            service_id: req.body.service_id,
            template_name: req.body.template_name,
            description: req.body.description,
            steps: req.body.steps || []
        };
        
        const result = await service.createTemplate(params);
        return httpSuccess(res, result, "创建模板成功");
    } catch (error) {
        return http400Error(res, error.message || "创建模板失败");
    }
};

// 更新流程模板
export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const templateId = req.body.template_id;
        const params = {
            template_name: req.body.template_name,
            description: req.body.description,
            steps: req.body.steps
        };
        
        const result = await service.updateTemplate(templateId, params);
        return httpSuccess(res, result, "更新模板成功");
    } catch (error) {
        return http400Error(res, error.message || "更新模板失败");
    }
};

// 删除流程模板
export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        const templateId = req.body.template_id;
        const result = await service.deleteTemplate(templateId);
        return httpSuccess(res, result, "删除模板成功");
    } catch (error) {
        return http400Error(res, error.message || "删除模板失败");
    }
};

// 查询模板列表
export const queryTemplates = async (req: Request, res: Response) => {
    try {
        const currentPage = req.body.current_page || 1;
        const pageSize = req.body.page_size || 10;
        const serviceId = req.body.service_id;
        const keyword = req.body.keyword;
        
        const result = await service.queryTemplates(currentPage, pageSize, serviceId, keyword);
        return httpSuccess(res, result, "查询模板列表成功");
    } catch (error) {
        return http400Error(res, error.message || "查询模板列表失败");
    }
};

// 设置订单优先级
export const setOrderPriority = async (req: Request, res: Response) => {
    try {
        const orderId = req.body.order_id;
        const priority = req.body.priority;
        
        const result = await service.setOrderPriority(orderId, priority);
        return httpSuccess(res, result, "设置优先级成功");
    } catch (error) {
        return http400Error(res, error.message || "设置优先级失败");
    }
};

// 添加订单备注
export const addOrderRemarks = async (req: Request, res: Response) => {
    try {
        const orderId = req.body.order_id;
        const remarks = req.body.remarks;
        const operatorId = req["user_id"];
        
        const result = await service.addOrderRemarks(orderId, remarks, operatorId);
        return httpSuccess(res, result, "添加备注成功");
    } catch (error) {
        return http400Error(res, error.message || "添加备注失败");
    }
};

// 查询告警列表
export const queryAlerts = async (req: Request, res: Response) => {
    try {
        const currentPage = req.body.current_page || 1;
        const pageSize = req.body.page_size || 10;
        const filters = {
            alert_type: req.body.alert_type,
            severity: req.body.severity
        };
        
        const result = await service.queryAlerts(currentPage, pageSize, filters);
        return httpSuccess(res, result, "查询告警列表成功");
    } catch (error) {
        return http400Error(res, error.message || "查询告警列表失败");
    }
};

// 解决告警
export const resolveAlert = async (req: Request, res: Response) => {
    try {
        const alertId = req.body.alert_id;
        const adminId = req["user_id"];
        
        const result = await service.resolveAlert(alertId, adminId);
        return httpSuccess(res, result, "解决告警成功");
    } catch (error) {
        return http400Error(res, error.message || "解决告警失败");
    }
};

// 获取订单统计
export const getOrderStatistics = async (req: Request, res: Response) => {
    try {
        const adminId = req.body.admin_id;
        const startDate = req.body.start_date;
        const endDate = req.body.end_date;
        
        const result = await service.getOrderStatistics(adminId, startDate, endDate);
        return httpSuccess(res, result, "获取订单统计成功");
    } catch (error) {
        return http400Error(res, error.message || "获取订单统计失败");
    }
};

// 查询流程实例列表
export const queryProcessInstances = async (req: Request, res: Response) => {
    try {
        const params = {
            status: req.body.status,
            alert_type: req.body.alert_type,
            severity: req.body.severity,
            assigned_staff: req.body.assigned_staff,
            current_page: req.body.current_page || 1,
            page_size: req.body.page_size || 10
        };
        
        const result = await service.queryProcessInstances(params);
        return httpSuccess(res, result, "查询流程实例列表成功");
    } catch (error) {
        return http400Error(res, error.message || "查询流程实例列表失败");
    }
};

// 获取流程实例详情
export const getProcessInstanceDetail = async (req: Request, res: Response) => {
    try {
        const instanceId = req.body.instance_id;
        const result = await service.getProcessInstanceDetail(instanceId);
        
        if (!result) {
            return http400Error(res, "流程实例不存在");
        }
        
        return httpSuccess(res, result, "获取流程实例详情成功");
    } catch (error) {
        return http400Error(res, error.message || "获取流程实例详情失败");
    }
};

// 获取步骤历史
export const getStepHistory = async (req: Request, res: Response) => {
    try {
        const instanceId = req.body.instance_id;
        const result = await service.getStepHistory(instanceId);
        return httpSuccess(res, result, "获取步骤历史成功");
    } catch (error) {
        return http400Error(res, error.message || "获取步骤历史失败");
    }
};

// 确认告警
export const acknowledgeAlert = async (req: Request, res: Response) => {
    try {
        const alertId = req.body.alert_id;
        const adminId = req["user_id"];
        
        const result = await service.acknowledgeAlert(alertId, adminId);
        return httpSuccess(res, result, "确认告警成功");
    } catch (error) {
        return http400Error(res, error.message || "确认告警失败");
    }
};


// 获取服务分类列表（用于流程模板配置）
export const getCategoryList = async (req: Request, res: Response) => {
    try {
        const result = await service.getCategoryList();
        return httpSuccess(res, result, "获取服务分类列表成功");
    } catch (error) {
        return http400Error(res, error.message || "获取服务分类列表失败");
    }
};