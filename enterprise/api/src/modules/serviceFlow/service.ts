import { 
  ServiceOrderModel, 
  ProcessTemplateModel, 
  ProcessInstanceModel, 
  OrderQueryParams,
  ProcessAdvanceParams,
  StepHistoryModel
} from "./proto";
import { ResponseData, TokenData } from "../app/proto";
import { rpcPost } from "../../common/common";

export interface IServiceFlowService<TokenData> {
  createOrder(orderData: Partial<ServiceOrderModel>, userId: string): Promise<ResponseData>;
  queryOrderList(params: OrderQueryParams, userId: string): Promise<ResponseData>;
  getOrderDetail(orderId: string, userId: string): Promise<ResponseData>;
  advanceProcess(params: ProcessAdvanceParams, userId: string): Promise<ResponseData>;
  cancelOrder(orderId: string, userId: string, reason?: string): Promise<ResponseData>;
  pauseOrder(orderId: string, userId: string, reason?: string): Promise<ResponseData>;
  resumeOrder(orderId: string, userId: string): Promise<ResponseData>;
  getProcessTemplate(serviceId: string): Promise<ResponseData>;
}

export class ServiceFlowService implements IServiceFlowService<TokenData> {
  protected token: string;

  constructor(tokenData: TokenData) {
    this.token = tokenData.token;
  }

  /**
   * 检查用户是否是管理员
   */
  private isAdmin(userId: string): boolean {
    // 这里可以根据实际需求实现管理员验证逻辑
    // 例如：查询用户角色表、检查特殊权限等
    const adminUserIds = ["94"]; // 管理员用户ID列表
    return adminUserIds.includes(userId);
  }

  /**
   * 创建服务订单
   */
  async createOrder(orderData: Partial<ServiceOrderModel>, userId: string): Promise<ResponseData> {
    try {
      // 生成订单ID
      const orderId = `ORD${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // 获取流程模板
      const templateResult = await this.getProcessTemplate(String(orderData.service_id!));
      if (templateResult.msg !== "ok") {
        return { msg: "template_not_found", data: null };
      }

      const template = templateResult.data;
      const currentTime = Date.now();

      // 插入服务订单
      const insertOrderSql = "INSERT INTO service_order (order_id, user_id, service_id, provider_id, title, service_type, status, current_step, start_date, end_date, cycle_months, price, remarks, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const orderParams = [
        orderId,
        userId,
        orderData.service_id,
        orderData.provider_id || null,
        orderData.title || template.template_name || '服务订单',
        orderData.service_type,
        'Pending',
        template.steps[0]?.step || '订单确认',
        orderData.start_date,
        orderData.end_date || null,
        orderData.cycle_months || null,
        orderData.price,
        orderData.remarks || null,
        currentTime,
        currentTime
      ];

      const orderResult = await rpcPost("/insert", { sql: insertOrderSql, params: orderParams }, this.token);
      if (!orderResult || orderResult.code !== 0) {
        return { msg: "create_order_failed", data: null };
      }

      // 创建流程实例
      const instanceId = `INS${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const stepHistory = [{
          step: template.steps[0]?.step || '订单确认',
          sequence: 1,
          status: 'Pending',
          start_time: currentTime
      }];

      const insertInstanceSql = "INSERT INTO process_instance (instance_id, order_id, template_id, current_step, current_sequence, status, step_history, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const instanceParams = [
        instanceId,
        orderId,
        template.template_id,
        template.steps[0]?.step || '订单确认',
        1,
        'NotStarted',
        JSON.stringify(stepHistory),
        currentTime,
        currentTime
      ];

      const instanceResult = await rpcPost("/insert", { sql: insertInstanceSql, params: instanceParams }, this.token);
      if (!instanceResult || instanceResult.code !== 0) {
        return { msg: "create_instance_failed", data: null };
      }

      return { msg: "ok", data: { order_id: orderId } };
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 查询订单列表
   */
  async queryOrderList(params: OrderQueryParams, userId: string): Promise<ResponseData> {
    try {
      // 构建查询条件
      const conditions: string[] = [];
      const queryParams: any[] = [];

      // 根据查询类型添加不同的过滤条件
      if (params.provider_id) {
        // 查询服务商的订单
        conditions.push("provider_id = ?");
        queryParams.push(params.provider_id);
      } else {
        // 查询用户自己的订单
        conditions.push("user_id = ?");
        queryParams.push(userId);
      }

      // 添加可选过滤条件
      if (params.service_type) {
        conditions.push("service_type = ?");
        queryParams.push(params.service_type);
      }
      if (params.status) {
        conditions.push("status = ?");
        queryParams.push(params.status);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      
      // 计算分页
      const pageSize = params.page_size || 10;
      const currentPage = params.current_page || 1;
      const offset = (currentPage - 1) * pageSize;

      // 查询总数 - 使用 COUNT(id) 而不是 COUNT(*)
      const countSql = `SELECT COUNT(id) as total FROM service_order ${whereClause}`;
      const countResult = await rpcPost("/select", { sql: countSql, params: queryParams }, this.token);
      
      let total = 0;
      if (countResult && countResult.code === 0 && countResult.data?.result) {
        try {
          const countData = JSON.parse(countResult.data.result);
          total = countData && countData[0] ? parseInt(countData[0].total) || 0 : 0;
        } catch (error) {
          total = 0;
        }
      }

      // 查询列表数据 - 使用直接拼接的 LIMIT 而不是占位符
      const listSql = offset > 0
        ? `SELECT id, order_id, user_id, (select nickname from entities where id = user_id) as user_name, service_id, provider_id, title, service_type, status, current_step, start_date, end_date, cycle_months, price, remarks, create_time, update_time FROM service_order ${whereClause} ORDER BY create_time DESC LIMIT ${offset}, ${pageSize}`
        : `SELECT id, order_id, user_id, (select nickname from entities where id = user_id) as user_name, service_id, provider_id, title, service_type, status, current_step, start_date, end_date, cycle_months, price, remarks, create_time, update_time FROM service_order ${whereClause} ORDER BY create_time DESC LIMIT ${pageSize}`;
      
      const listResult = await rpcPost("/select", { sql: listSql, params: queryParams }, this.token);
      
      if (listResult && listResult.code === 0 && listResult.data?.result) {
        try {
          const list = JSON.parse(listResult.data.result) || [];
          return { 
            msg: "ok", 
            data: {
              list,
              total,
              current_page: currentPage,
              page_size: pageSize
            }
          };
        } catch (error) {
          return { msg: "server_error", data: null };
        }
      }
      
      return { msg: "query_failed", data: null };
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取订单详情
   * 支持客户和服务商双向查询
   */
  async getOrderDetail(orderId: string, userId: string): Promise<ResponseData> {
    try {
      // 先尝试作为客户查询
      let orderSql = "SELECT id, order_id, user_id, service_id, provider_id, title, service_type, status, current_step, start_date, end_date, cycle_months, price, remarks, create_time, update_time FROM service_order WHERE order_id = ? AND user_id = ?";
      let orderParams = [orderId, userId];
      
      let orderResult = await rpcPost("/select", { sql: orderSql, params: orderParams }, this.token);
      
      let orderData = null;
      if (orderResult && orderResult.code === 0 && orderResult.data?.result) {
        try {
          const data = JSON.parse(orderResult.data.result);
          if (data && data.length > 0) {
            orderData = data[0];
          }
        } catch (error) {
          // 解析失败，使用默认值
        }
      }
      
      // 如果作为客户查询失败，尝试作为服务商查询
      if (!orderData) {
        orderSql = "SELECT id, order_id, user_id, service_id, provider_id, title, service_type, status, current_step, start_date, end_date, cycle_months, price, remarks, create_time, update_time FROM service_order WHERE order_id = ? AND provider_id = ?";
        orderParams = [orderId, userId];
        
        orderResult = await rpcPost("/select", { sql: orderSql, params: orderParams }, this.token);
        
        if (orderResult && orderResult.code === 0 && orderResult.data?.result) {
          try {
            const data = JSON.parse(orderResult.data.result);
            if (data && data.length > 0) {
              orderData = data[0];
            }
          } catch (error) {
            // 解析失败，使用默认值
          }
        }
      }
      
      // 如果还是找不到，尝试只按订单ID查询（管理员或特殊权限）
      if (!orderData) {
        orderSql = "SELECT id, order_id, user_id, service_id, provider_id, title, service_type, status, current_step, start_date, end_date, cycle_months, price, remarks, create_time, update_time FROM service_order WHERE order_id = ?";
        orderParams = [orderId];
        
        orderResult = await rpcPost("/select", { sql: orderSql, params: orderParams }, this.token);
        
        if (orderResult && orderResult.code === 0 && orderResult.data?.result) {
          try {
            const data = JSON.parse(orderResult.data.result);
            if (data && data.length > 0) {
              orderData = data[0];
              // 检查权限：如果不是订单的创建者或服务商，需要特殊权限
              if (orderData.user_id !== userId && orderData.provider_id !== userId) {
                // 这里可以添加管理员权限检查
                // 暂时允许访问，但可以后续添加权限控制
              }
            }
          } catch (error) {
            // 解析失败，使用默认值
          }
        }
      }
      
      if (!orderData) {
        return { msg: "order_not_found", data: null };
      }

      // 获取流程实例信息（不包含 step_history，因为使用独立表）
      const instanceSql = "SELECT id, instance_id, order_id, template_id, current_step, current_sequence, status, assigned_staff, create_time, update_time FROM process_instance WHERE order_id = ?";
      const instanceParams = [orderId];
      
      const instanceResult = await rpcPost("/select", { sql: instanceSql, params: instanceParams }, this.token);
      
      let instanceData = null;
      if (instanceResult && instanceResult.code === 0 && instanceResult.data?.result) {
        try {
          const data = JSON.parse(instanceResult.data.result);
          if (data && data.length > 0) {
            instanceData = data[0];
            
            // 从 process_step_history 表查询步骤历史
            const historySql = "SELECT history_id, order_id, instance_id, step, sequence, role, description, estimated_days, required_files, approval_required, auto_advance, status, start_time, end_time, operator_id, operator_name, operator_type, remarks, create_time, update_time FROM process_step_history WHERE instance_id = ? ORDER BY sequence ASC";
            const historyResult = await rpcPost("/select", { sql: historySql, params: [instanceData.instance_id] }, this.token);
            
            if (historyResult && historyResult.code === 0 && historyResult.data?.result) {
              try {
                const historyData = JSON.parse(historyResult.data.result);
                instanceData.step_history = historyData || [];
                
                // 解析 required_files JSON 字段
                instanceData.step_history.forEach((step: any) => {
                  if (step.required_files && typeof step.required_files === 'string') {
                    try {
                      step.required_files = JSON.parse(step.required_files);
                    } catch (e) {
                      step.required_files = [];
                    }
                  }
                });
              } catch (error) {
                // 解析失败，使用默认值
                instanceData.step_history = [];
              }
            } else {
              instanceData.step_history = [];
            }
          }
        } catch (error) {
          // 解析失败，使用默认值
        }
      }
      
      // 如果没有流程实例，尝试自动创建一个
      if (!instanceData && orderData.service_id) {
        try {
          const templateResult = await this.getProcessTemplate(String(orderData.service_id));
          
          if (templateResult.msg === "ok" && templateResult.data) {
            const template = templateResult.data;
            const currentTime = Date.now();
            const instanceId = `INS${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            
            // 创建流程实例
            const insertInstanceSql = "INSERT INTO process_instance (instance_id, order_id, template_id, current_step, current_sequence, status, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            const insertInstanceParams = [
              instanceId,
              orderId,
              template.template_id,
              template.steps[0]?.step || '订单确认',
              1,
              'InProgress',
              currentTime,
              currentTime
            ];
            
            const createResult = await rpcPost("/insert", { sql: insertInstanceSql, params: insertInstanceParams }, this.token);
            
            if (createResult && createResult.code === 0) {
              // 批量插入步骤历史到 process_step_history 表
              for (let index = 0; index < template.steps.length; index++) {
                const step = template.steps[index];
                const historyId = `HIST${Date.now()}${index}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
                
                const insertHistorySql = "INSERT INTO process_step_history (history_id, order_id, instance_id, step, sequence, role, description, estimated_days, required_files, approval_required, auto_advance, status, start_time, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                const insertHistoryParams = [
                  historyId,
                  orderId,
                  instanceId,
                  step.step,
                  step.sequence || (index + 1),
                  step.role || '',
                  step.description || '',
                  step.estimated_days || 1,
                  JSON.stringify(step.required_files || []),
                  step.approval_required || 0,
                  step.auto_advance || 0,
                  index === 0 ? 'InProgress' : 'NotStarted',
                  index === 0 ? currentTime : null,
                  currentTime,
                  currentTime
                ];
                
                await rpcPost("/insert", { sql: insertHistorySql, params: insertHistoryParams }, this.token);
              }
              
              // 重新查询流程实例
              const instanceSql = "SELECT id, instance_id, order_id, template_id, current_step, current_sequence, status, assigned_staff, create_time, update_time FROM process_instance WHERE order_id = ?";
              const instanceResult = await rpcPost("/select", { sql: instanceSql, params: [orderId] }, this.token);
              
              if (instanceResult && instanceResult.code === 0 && instanceResult.data?.result) {
                const instanceArr = JSON.parse(instanceResult.data.result);
                instanceData = instanceArr[0];
              }
              
              // 更新订单状态为 Active
              const updateOrderSql = "UPDATE service_order SET status = ?, update_time = ? WHERE order_id = ?";
              await rpcPost("/update", { sql: updateOrderSql, params: ['Active', currentTime, orderId] }, this.token);
            } else {
              // 创建失败，继续执行
            }
          }
        } catch (error) {
          // 自动创建流程实例异常
        }
      }
      
      return { msg: "ok", data: { order: orderData, process_instance: instanceData } };
    } catch (error) {
      // 获取订单详情异常
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 推进流程
   */
  async advanceProcess(params: ProcessAdvanceParams, userId: string): Promise<ResponseData> {
    try {
      // 查询订单基本信息
      const orderCheckSql = "SELECT id, order_id, user_id, provider_id, service_id FROM service_order WHERE order_id = ?";
      const orderCheckResult = await rpcPost("/select", { sql: orderCheckSql, params: [params.order_id] }, this.token);
      
      if (!orderCheckResult || orderCheckResult.code !== 0 || !orderCheckResult.data?.result) {
        return { msg: "order_not_found", data: null };
      }
      
      let orderData;
      try {
        orderData = JSON.parse(orderCheckResult.data.result);
        if (!orderData || orderData.length === 0) {
          return { msg: "order_not_found", data: null };
        }
      } catch (error) {
        // 解析失败，使用默认值
        return { msg: "server_error", data: null };
      }
      
      const order = orderData[0];
      
      // 验证权限：必须是订单的客户或服务商
      const userIdNum = parseInt(userId);
      const providerIdNum = parseInt(order.provider_id);
      const orderUserIdNum = parseInt(order.user_id);
      
      const hasPermission = 
        order.user_id === userId || 
        orderUserIdNum === userIdNum || 
        order.provider_id === userId || 
        providerIdNum === userIdNum ||
        order.provider_id === userIdNum ||
        order.user_id === userIdNum;
      
      if (!hasPermission) {
        // 检查是否是管理员权限
        if (this.isAdmin(userId)) {
          // 管理员权限，允许操作
        } else {
          return { msg: "permission_denied", data: null };
        }
      }

      // 获取流程实例
      const instanceSql = "SELECT id, instance_id, order_id, template_id, current_step, current_sequence, status FROM process_instance WHERE order_id = ?";
      const instanceResult = await rpcPost("/select", { sql: instanceSql, params: [params.order_id] }, this.token);
      
      if (!instanceResult || instanceResult.code !== 0 || !instanceResult.data?.result) {
        return { msg: "instance_not_found", data: null };
      }

      let instanceData;
      try {
        instanceData = JSON.parse(instanceResult.data.result);
        if (!instanceData || instanceData.length === 0) {
          return { msg: "instance_not_found", data: null };
        }
      } catch (error) {
        // 解析失败，使用默认值
        return { msg: "server_error", data: null };
      }

      const instance = instanceData[0];
      
      // 从 process_step_history 表查询步骤历史
      const historySql = "SELECT history_id, step, sequence, status FROM process_step_history WHERE instance_id = ? ORDER BY sequence ASC";
      const historyResult = await rpcPost("/select", { sql: historySql, params: [instance.instance_id] }, this.token);
      
      let stepHistory = [];
      if (historyResult && historyResult.code === 0 && historyResult.data?.result) {
        try {
          stepHistory = JSON.parse(historyResult.data.result);
        } catch (e) {
          // 解析失败，使用默认值
        }
      }
      
      // 验证当前步骤
      if (instance.current_step !== params.current_step) {
        return { msg: "step_mismatch", data: null };
      }

      // 获取流程模板
      const templateResult = await this.getProcessTemplate(String(order.service_id));
      if (templateResult.msg !== "ok") {
        return { msg: "template_not_found", data: null };
      }

      const template = templateResult.data;
      const currentStepIndex = template.steps.findIndex((step: any) => step.step === params.current_step);
      
      if (currentStepIndex === -1) {
        return { msg: "invalid_step", data: null };
      }

      // 验证角色权限
      const currentStep = template.steps[currentStepIndex];
      const currentStepRole = currentStep.role;
      
      // 确定当前用户的角色类型
      let userRole = '';
      if (order.user_id === userId || orderUserIdNum === userIdNum) {
        userRole = 'enterprise'; // 企业用户
      } else if (order.provider_id === userId || providerIdNum === userIdNum) {
        userRole = 'service_provider'; // 服务商
      } else {
        // 检查是否是管理员
        userRole = 'admin'; // 管理员（需要额外验证）
      }
      
      // 验证角色权限
      if (currentStepRole === 'enterprise' && userRole !== 'enterprise') {
        return { msg: "role_permission_denied", data: { required_role: currentStepRole, user_role: userRole } };
      } else if (currentStepRole === 'service_provider' && userRole !== 'service_provider') {
        return { msg: "role_permission_denied", data: { required_role: currentStepRole, user_role: userRole } };
      } else if (currentStepRole === 'system' && userRole !== 'admin') {
        return { msg: "role_permission_denied", data: { required_role: currentStepRole, user_role: userRole } };
      }

      // 确定下一步
      const nextStepIndex = currentStepIndex + 1;
      const nextStep = nextStepIndex < template.steps.length ? template.steps[nextStepIndex] : null;
      const currentTime = Date.now();

      // 更新当前步骤状态为 Completed
      const currentHistory = stepHistory.find((h: any) => h.step === params.current_step);
      if (currentHistory) {
        const updateCurrentStepSql = "UPDATE process_step_history SET status = ?, end_time = ?, remarks = ?, update_time = ? WHERE history_id = ?";
        const updateCurrentStepParams = ['Completed', currentTime, params.remarks || '', currentTime, currentHistory.history_id];
        await rpcPost("/update", { sql: updateCurrentStepSql, params: updateCurrentStepParams }, this.token);
      }

      // 如果有下一步，更新下一步状态为 InProgress
      if (nextStep) {
        const nextHistory = stepHistory.find((h: any) => h.step === nextStep.step);
        if (nextHistory) {
          const updateNextStepSql = "UPDATE process_step_history SET status = ?, start_time = ?, update_time = ? WHERE history_id = ?";
          const updateNextStepParams = ['InProgress', currentTime, currentTime, nextHistory.history_id];
          await rpcPost("/update", { sql: updateNextStepSql, params: updateNextStepParams }, this.token);
        }
      }

      // 更新流程实例
      const updateInstanceSql = "UPDATE process_instance SET current_step = ?, current_sequence = ?, status = ?, update_time = ? WHERE instance_id = ?";
      const updateInstanceParams = [
        nextStep?.step || 'Completed',
        nextStep?.sequence || template.steps.length + 1,
        nextStep ? 'InProgress' : 'Completed',
        currentTime,
        instance.instance_id
      ];
      
      const updateInstanceResult = await rpcPost("/update", { sql: updateInstanceSql, params: updateInstanceParams }, this.token);
      if (!updateInstanceResult || updateInstanceResult.code !== 0) {
        return { msg: "update_instance_failed", data: null };
      }

      // 更新订单状态
      const updateOrderSql = "UPDATE service_order SET current_step = ?, status = ?, update_time = ? WHERE order_id = ?";
      const updateOrderParams = [
        nextStep?.step || 'Completed',
        nextStep ? 'Active' : 'Completed',
        currentTime,
        params.order_id
      ];

      const updateOrderResult = await rpcPost("/update", { sql: updateOrderSql, params: updateOrderParams }, this.token);
      if (!updateOrderResult || updateOrderResult.code !== 0) {
        return { msg: "update_order_failed", data: null };
      }

      return { msg: "ok", data: { next_step: nextStep?.step || 'Completed' } };
    } catch (error) {
      // 推进流程异常
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 取消订单
   */
  async cancelOrder(orderId: string, userId: string, reason?: string): Promise<ResponseData> {
    try {
      const currentTime = Date.now();
      
      // 更新订单状态
      const updateOrderSql = "UPDATE service_order SET status = ?, remarks = ?, update_time = ? WHERE order_id = ? AND user_id = ?";
      const updateOrderParams = ['Cancelled', reason || '', currentTime, orderId, userId];
      
      const result = await rpcPost("/update", { sql: updateOrderSql, params: updateOrderParams }, this.token);
      if (result && result.code === 0) {
        // 同时取消流程实例
        const updateInstanceSql = "UPDATE process_instance SET status = ?, update_time = ? WHERE order_id = ?";
        await rpcPost("/update", { sql: updateInstanceSql, params: ['Cancelled', currentTime, orderId] }, this.token);
        
        return { msg: "ok", data: null };
      }
      return { msg: "cancel_failed", data: null };
    } catch (error) {
      // 取消订单异常
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 暂停订单
   */
  async pauseOrder(orderId: string, userId: string, reason?: string): Promise<ResponseData> {
    try {
      const currentTime = Date.now();
      
      // 查询订单并验证权限
      const checkSql = "SELECT id, order_id, user_id, provider_id, status FROM service_order WHERE order_id = ?";
      const checkResult = await rpcPost("/select", { sql: checkSql, params: [orderId] }, this.token);
      
      if (!checkResult || checkResult.code !== 0 || !checkResult.data?.result) {
        return { msg: "pause_failed", data: null };
      }
      
      let orderData;
      try {
        orderData = JSON.parse(checkResult.data.result);
        if (!orderData || orderData.length === 0) {
          return { msg: "pause_failed", data: null };
        }
      } catch (error) {
        // 解析失败，使用默认值
        return { msg: "pause_failed", data: null };
      }
      
      const order = orderData[0];
      
      // 验证权限和状态
      if (order.user_id !== userId && order.provider_id !== userId) {
        return { msg: "pause_failed", data: null };
      }
      
      if (order.status === 'Cancelled' || order.status === 'Completed') {
        return { msg: "pause_failed", data: null };
      }
      
      // 更新订单状态
      const updateSql = "UPDATE service_order SET status = ?, remarks = ?, update_time = ? WHERE order_id = ?";
      const updateParams = ['Paused', reason || '', currentTime, orderId];
      
      const result = await rpcPost("/update", { sql: updateSql, params: updateParams }, this.token);
      if (result && result.code === 0) {
        return { msg: "ok", data: null };
      }
      return { msg: "pause_failed", data: null };
    } catch (error) {
      // 暂停订单异常
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 恢复订单
   */
  async resumeOrder(orderId: string, userId: string): Promise<ResponseData> {
    try {
      const currentTime = Date.now();
      
      // 查询订单并验证权限
      const checkSql = "SELECT id, order_id, user_id, provider_id, status FROM service_order WHERE order_id = ?";
      const checkResult = await rpcPost("/select", { sql: checkSql, params: [orderId] }, this.token);
      
      if (!checkResult || checkResult.code !== 0 || !checkResult.data?.result) {
        return { msg: "resume_failed", data: null };
      }
      
      let orderData;
      try {
        orderData = JSON.parse(checkResult.data.result);
        if (!orderData || orderData.length === 0) {
          return { msg: "resume_failed", data: null };
        }
      } catch (error) {
        // 解析失败，使用默认值
        return { msg: "resume_failed", data: null };
      }
      
      const order = orderData[0];
      
      // 验证权限和状态
      if (order.user_id !== userId && order.provider_id !== userId) {
        return { msg: "resume_failed", data: null };
      }
      
      if (order.status !== 'Paused') {
        return { msg: "resume_failed", data: null };
      }
      
      // 更新订单状态
      const updateSql = "UPDATE service_order SET status = ?, update_time = ? WHERE order_id = ?";
      const updateParams = ['Active', currentTime, orderId];
      
      const result = await rpcPost("/update", { sql: updateSql, params: updateParams }, this.token);
      if (result && result.code === 0) {
        return { msg: "ok", data: null };
      }
      return { msg: "resume_failed", data: null };
    } catch (error) {
      // 恢复订单异常
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取流程模板
   * @param serviceProductId 服务产品ID
   */
  async getProcessTemplate(serviceProductId: string): Promise<ResponseData> {
    try {
      const serviceProductIdNum = parseInt(serviceProductId);
      
      // 第一步：从服务产品表获取 category_id
      const productSql = "SELECT id, category_id FROM service_products WHERE id = ?";
      const productResult = await rpcPost("/select", { sql: productSql, params: [serviceProductIdNum] }, this.token);
      
      if (!productResult || productResult.code !== 0 || !productResult.data?.result) {
        return { msg: "service_product_not_found", data: null };
      }
      
      let productData;
      try {
        productData = JSON.parse(productResult.data.result);
        if (!productData || productData.length === 0) {
          return { msg: "service_product_not_found", data: null };
        }
      } catch (error) {
        // 解析失败，使用默认值
        return { msg: "server_error", data: null };
      }
      
      const categoryId = productData[0].category_id;
      
      // 第二步：使用 category_id 查询流程模板
      const templateSql = "SELECT id, template_id, service_id, template_name, steps_json, is_active, `version`, `description`, created_by, create_time, update_time FROM process_template WHERE service_id = ? AND is_active = 1 ORDER BY create_time DESC LIMIT 1";
      const result = await rpcPost("/select", { sql: templateSql, params: [categoryId] }, this.token);
      
      if (result && result.code === 0 && result.data?.result) {
        try {
          const data = JSON.parse(result.data.result);
          
          if (data && data.length > 0) {
            const template = data[0];
            
            // 解析 steps_json
            if (template.steps_json && typeof template.steps_json === 'string') {
              try {
                template.steps = JSON.parse(template.steps_json);
              } catch (e) {
                // 解析失败，使用默认值
                template.steps = [];
              }
            } else if (template.steps_json) {
              template.steps = template.steps_json;
            }
            
            return { msg: "ok", data: template };
          }
        } catch (error) {
          // 解析失败，使用默认值
          return { msg: "server_error", data: null };
        }
      }
      
      return { msg: "template_not_found", data: null };
    } catch (error) {
      // 获取流程模板异常
      return { msg: "server_error", data: null };
    }
  }
}