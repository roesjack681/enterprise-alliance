import { config } from "../../config/config";
import * as repository from "./repository";
import { 
  AdminServiceOrderModel, 
  AdminProcessTemplateModel, 
  AdminProcessInstanceModel, 
  WorkbenchStatistics,
  AdminOrderQueryParams,
  AdminProcessAdvanceParams,
  TaskAssignParams,
  TemplateCreateParams,
  BatchOperationParams,
  AlertModel
} from "./proto";

// 获取工作台统计数据
export const getWorkbenchStatistics = async (adminId: string): Promise<WorkbenchStatistics> => {
    return await repository.getWorkbenchStatistics(adminId);
};

// 获取流程监控概览统计数据
export const getMonitoringOverview = async (): Promise<any> => {
    return await repository.getMonitoringOverview();
};

// 查询订单列表
export const queryOrderList = async (params: AdminOrderQueryParams): Promise<any> => {
    return await repository.queryOrderList(params);
};

// 获取订单详情
export const getOrderDetail = async (orderId: string): Promise<AdminServiceOrderModel | null> => {
    return await repository.getOrderDetail(orderId);
};

// 推进流程
export const getNextStep = async (params: { order_id: string }): Promise<any> => {
    return await repository.getNextStep(params);
};

export const advanceProcess = async (params: AdminProcessAdvanceParams): Promise<any> => {
    return await repository.advanceProcess(params);
};

// 分配任务
export const assignTasks = async (params: TaskAssignParams): Promise<any> => {
    return await repository.assignTasks(params);
};

// 批量操作
export const batchOperation = async (params: BatchOperationParams): Promise<any> => {
    return await repository.batchOperation(params);
};

// 创建模板
export const createTemplate = async (params: TemplateCreateParams): Promise<any> => {
    return await repository.createTemplate(params);
};

// 更新模板
export const updateTemplate = async (templateId: string, params: Partial<TemplateCreateParams>): Promise<any> => {
    return await repository.updateTemplate(templateId, params);
};

// 删除模板（软删除）
export const deleteTemplate = async (templateId: string): Promise<any> => {
    return await repository.deleteTemplate(templateId);
};

// 查询模板列表
export const queryTemplates = async (currentPage: number, pageSize: number, serviceId?: string, keyword?: string): Promise<any> => {
    return await repository.queryTemplates(currentPage, pageSize, serviceId, keyword);
};

// 设置订单优先级
export const setOrderPriority = async (orderId: string, priority: string): Promise<any> => {
    return await repository.setOrderPriority(orderId, priority);
};

// 添加订单备注
export const addOrderRemarks = async (orderId: string, remarks: string, operatorId: string): Promise<any> => {
    return await repository.addOrderRemarks(orderId, remarks, operatorId);
};

// 查询告警
export const queryAlerts = async (currentPage: number, pageSize: number, filters?: any): Promise<any> => {
    return await repository.queryAlerts(currentPage, pageSize, filters);
};

// 解决告警
export const resolveAlert = async (alertId: string, adminId: string): Promise<any> => {
    return await repository.resolveAlert(alertId, adminId);
};

// 获取订单统计
export const getOrderStatistics = async (adminId?: string, startDate?: number, endDate?: number): Promise<any> => {
    return await repository.getOrderStatistics(adminId, startDate, endDate);
};

// 查询流程实例列表
export const queryProcessInstances = async (params: any): Promise<any> => {
    return await repository.queryProcessInstances(params);
};

// 获取流程实例详情
export const getProcessInstanceDetail = async (instanceId: string): Promise<any> => {
    return await repository.getProcessInstanceDetail(instanceId);
};

// 获取步骤历史
export const getStepHistory = async (instanceId: string): Promise<any> => {
    return await repository.getStepHistory(instanceId);
};

// 确认告警
export const acknowledgeAlert = async (alertId: string, adminId: string): Promise<any> => {
    return await repository.acknowledgeAlert(alertId, adminId);
};


// 获取服务分类列表
export const getCategoryList = async (): Promise<any> => {
    return await repository.getCategoryList();
};

// 根据服务ID获取活跃的流程模板
export const getActiveTemplateByServiceId = async (serviceId: number): Promise<any> => {
    return await repository.getActiveTemplateByServiceId(serviceId);
};

// 创建流程实例
export const createProcessInstance = async (instanceData: {
    instance_id: string;
    order_id: string;
    template_id: string;
    current_step: string;
    current_sequence: number;
    status: string;
    assigned_staff?: string;
    step_history?: string;
    create_time?: number;
    update_time?: number;
}): Promise<any> => {
    return await repository.createProcessInstance(instanceData);
};