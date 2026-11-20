import { sequelize } from "../../storage/mysql";
import { QueryTypes } from "sequelize";
import { 
  AdminServiceOrderModel, 
  AdminProcessTemplateModel, 
  AdminProcessStepHistoryModel,
  AdminOrderQueryParams,
  AdminProcessAdvanceParams,
  TaskAssignParams,
  TemplateCreateParams,
  BatchOperationParams,
  WorkbenchStatistics
} from "./proto";

// 获取工作台统计数据
export const getWorkbenchStatistics = async (adminId: string): Promise<WorkbenchStatistics> => {
    const sql = "SELECT (SELECT COUNT(*) FROM service_order WHERE status != 'Cancelled') as total_orders, (SELECT COUNT(*) FROM service_order WHERE status = 'Pending') as pending_orders, (SELECT COUNT(*) FROM service_order WHERE status = 'Active') as active_orders, (SELECT COUNT(*) FROM service_order WHERE status = 'Completed') as completed_orders, 0 as overdue_tasks, (SELECT COUNT(*) FROM process_instance WHERE status = 'InProgress' AND current_step LIKE '%approval%') as pending_approvals, (SELECT COUNT(*) FROM service_order WHERE status = 'Completed' AND DATE(FROM_UNIXTIME(update_time)) = CURDATE()) as today_completed, (SELECT COUNT(*) FROM service_order WHERE status = 'Completed' AND MONTH(FROM_UNIXTIME(update_time)) = MONTH(CURDATE()) AND YEAR(FROM_UNIXTIME(update_time)) = YEAR(CURDATE())) as month_completed";
    
    const result = await sequelize.query<WorkbenchStatistics>(sql, {
        type: QueryTypes.SELECT,
        plain: true
    });
    
    return result || {
        total_orders: 0,
        pending_orders: 0,
        active_orders: 0,
        completed_orders: 0,
        overdue_tasks: 0,
        pending_approvals: 0,
        today_completed: 0,
        month_completed: 0
    };
};

// 获取流程监控概览统计数据
export const getMonitoringOverview = async (): Promise<any> => {
    const sql = "SELECT (SELECT COUNT(*) FROM process_instance WHERE status = 'InProgress') as active_processes, (SELECT COUNT(*) FROM process_instance WHERE status = 'InProgress' AND UNIX_TIMESTAMP() * 1000 > estimated_completion_time) as overdue_tasks, (SELECT COUNT(*) FROM process_instance WHERE status = 'InProgress' AND current_step LIKE '%approval%') as pending_approval, (SELECT COUNT(*) FROM process_alert WHERE status = 'Active') as exception_alerts";
    
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT,
        plain: true
    });
    
    return result || {
        active_processes: 0,
        overdue_tasks: 0,
        pending_approval: 0,
        exception_alerts: 0
    };
};

// 查询订单列表
export const queryOrderList = async (params: AdminOrderQueryParams): Promise<any> => {
    let whereConditions: string[] = ["so.status != 'Cancelled'"];
    let replacements: any = {};

    if (params.entity_id) {
        whereConditions.push("so.user_id = :entity_id");
        replacements.entity_id = params.entity_id;
    }
    if (params.service_id) {
        whereConditions.push("so.service_id = :service_id");
        replacements.service_id = params.service_id;
    }
    if (params.provider_id) {
        whereConditions.push("so.provider_id = :provider_id");
        replacements.provider_id = params.provider_id;
    }
    if (params.service_type) {
        whereConditions.push("so.service_type = :service_type");
        replacements.service_type = params.service_type;
    }
    if (params.status) {
        whereConditions.push("so.status = :status");
        replacements.status = params.status;
    }
    if (params.priority) {
        whereConditions.push("so.priority = :priority");
        replacements.priority = params.priority;
    }
    if (params.assigned_admin) {
        whereConditions.push("so.assigned_admin = :assigned_admin");
        replacements.assigned_admin = params.assigned_admin;
    }
    if (params.start_date) {
        whereConditions.push("so.create_time >= :start_date");
        replacements.start_date = params.start_date;
    }
    if (params.end_date) {
        whereConditions.push("so.create_time <= :end_date");
        replacements.end_date = params.end_date;
    }

    const whereClause = whereConditions.join(" AND ");
    const offset = (params.current_page - 1) * params.page_size;
    
    const countSql = `SELECT COUNT(*) as total FROM service_order so WHERE ${whereClause}`;
    const countResult = await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
        plain: true
    });
    
    const dataSql = `
        SELECT 
            so.*,
            pi.current_step,
            pi.current_sequence,
            pi.status as process_status,
            pi.instance_id
        FROM service_order so 
        LEFT JOIN process_instance pi ON so.order_id = pi.order_id
        WHERE ${whereClause} 
        ORDER BY so.create_time DESC 
        LIMIT :limit OFFSET :offset`;
    const dataResult = await sequelize.query(dataSql, {
        replacements: {
            ...replacements,
            limit: params.page_size,
            offset: offset
        },
        type: QueryTypes.SELECT
    });

    // 处理进度信息
    const processedList = await Promise.all((dataResult || []).map(async (order: any) => {
        let progressInfo = {
            current_sequence: order.current_sequence || 0,
            total_steps: 0,
            progress_percentage: 0,
            estimated_remaining_days: 0,
            current_step_remaining_days: 0,
            is_overdue: false
        };

        // 从process_step_history表获取步骤信息
        if (order.instance_id) {
            try {
                const stepHistorySql = "SELECT * FROM process_step_history WHERE instance_id = ? ORDER BY sequence ASC";
                const stepHistory = await sequelize.query<AdminProcessStepHistoryModel>(stepHistorySql, {
                    replacements: [order.instance_id],
                    type: QueryTypes.SELECT
                });

                if (stepHistory && stepHistory.length > 0) {
                    progressInfo.total_steps = stepHistory.length;
                    
                    // 计算进度百分比
                    const completedSteps = stepHistory.filter(step => step.status === 'Completed').length;
                    progressInfo.progress_percentage = Math.round((completedSteps / stepHistory.length) * 100);
                    
                    // 找到当前步骤
                    const currentStep = stepHistory.find(step => step.step === order.current_step);
                    if (currentStep) {
                    // 计算剩余预计天数
                        const remainingSteps = stepHistory.filter(step => step.sequence >= currentStep.sequence && step.status !== 'Completed');
                        progressInfo.estimated_remaining_days = remainingSteps.reduce((total, step) => total + step.estimated_days, 0);
                        
                        // 计算当前步骤剩余天数
                        if (currentStep.start_time && currentStep.status === 'InProgress') {
                            const now = Date.now();
                            const startTime = currentStep.start_time > 1000000000000 ? currentStep.start_time : currentStep.start_time * 1000;
                            const elapsedMs = now - startTime;
                            const elapsedDays = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
                            const currentStepRemainingDays = Math.max(0, currentStep.estimated_days - elapsedDays);
                            progressInfo.current_step_remaining_days = currentStepRemainingDays;
                            
                            const expectedEndTime = startTime + (currentStep.estimated_days * 24 * 60 * 60 * 1000);
                            const hasPassedMinimumTime = elapsedMs > (60 * 60 * 1000);
                            progressInfo.is_overdue = now > expectedEndTime && elapsedDays >= currentStep.estimated_days && hasPassedMinimumTime;
                        } else {
                            progressInfo.current_step_remaining_days = currentStep.estimated_days;
                            progressInfo.is_overdue = false;
                        }
                    }
                }
            } catch (error) {
                // 获取步骤历史失败
            }
        }

        return {
            ...order,
            progress_info: progressInfo
        };
    }));

    return {
        list: processedList,
        total: (countResult as any)?.total || 0,
        current_page: params.current_page,
        page_size: params.page_size
    };
};

// 获取订单详情
export const getOrderDetail = async (orderId: string): Promise<AdminServiceOrderModel | null> => {
    const sql = "SELECT so.*, pi.current_step, pi.current_sequence, pi.status as process_status FROM service_order so LEFT JOIN process_instance pi ON so.order_id = pi.order_id WHERE so.order_id = :order_id";
    
    const result = await sequelize.query<AdminServiceOrderModel>(sql, {
        replacements: { order_id: orderId },
        type: QueryTypes.SELECT,
        plain: true
    });
    
    return result;
};

// 获取下一步骤信息
export const getNextStep = async (params: { order_id: string }): Promise<any> => {
    try {
        // 首先获取订单的流程实例信息
        const instanceSql = "SELECT pi.template_id, pi.current_step, pi.current_sequence FROM process_instance pi WHERE pi.order_id = ?";
        const instanceResult = await sequelize.query(instanceSql, {
            replacements: [params.order_id],
            type: QueryTypes.SELECT,
            plain: true
        }) as any;
        
        if (!instanceResult) {
            throw new Error("流程实例不存在");
        }
        
        // 获取流程模板信息
        const templateSql = "SELECT steps_json FROM process_template WHERE template_id = ?";
        const templateResult = await sequelize.query(templateSql, {
            replacements: [instanceResult.template_id],
            type: QueryTypes.SELECT,
            plain: true
        }) as any;
        
        if (!templateResult) {
            throw new Error("流程模板不存在");
        }
        
        // 解析步骤配置
        let steps = [];
        try {
            if (typeof templateResult.steps_json === 'string') {
                steps = JSON.parse(templateResult.steps_json);
            } else {
                steps = templateResult.steps_json || [];
            }
        } catch (error) {
            // 解析模板步骤失败
            steps = [];
        }
        
        // 找到当前步骤在模板中的位置
        const currentStepIndex = steps.findIndex((step: any) => step.step === instanceResult.current_step);
        
        if (currentStepIndex === -1) {
            throw new Error("当前步骤在模板中未找到");
        }
        
        // 获取下一步骤
        const nextStepIndex = currentStepIndex + 1;
        const nextStep = nextStepIndex < steps.length ? steps[nextStepIndex] : null;
        
        return {
            current_step: instanceResult.current_step,
            current_sequence: instanceResult.current_sequence,
            next_step: nextStep ? {
                step: nextStep.step,
                sequence: nextStep.sequence,
                description: nextStep.description,
                estimated_days: nextStep.estimated_days,
                auto_advance: nextStep.auto_advance || 0,
                approval_required: nextStep.approval_required || 0
            } : null,
            is_last_step: nextStepIndex >= steps.length,
            total_steps: steps.length
        };
    } catch (error) {
        // 获取下一步骤失败
        throw error;
    }
};

// 推进流程
export const advanceProcess = async (params: AdminProcessAdvanceParams): Promise<any> => {
    try {
        const currentTime = Date.now();
        
        // 获取流程实例信息
        const instanceSql = "SELECT pi.instance_id, pi.template_id, pi.current_step, pi.current_sequence FROM process_instance pi WHERE pi.order_id = ?";
        const instanceResult = await sequelize.query(instanceSql, {
            replacements: [params.order_id],
            type: QueryTypes.SELECT,
            plain: true
        }) as any;
        
        if (!instanceResult) {
            throw new Error("流程实例不存在");
        }
        
        // 获取当前步骤历史记录
        const currentStepHistorySql = "SELECT * FROM process_step_history WHERE instance_id = ? AND step = ? AND status = 'InProgress'";
        const currentStepHistory = await sequelize.query<AdminProcessStepHistoryModel>(currentStepHistorySql, {
            replacements: [instanceResult.instance_id, params.current_step],
            type: QueryTypes.SELECT,
            plain: true
        });
        
        if (!currentStepHistory) {
            throw new Error("当前步骤历史记录不存在");
        }
        
        // 完成当前步骤
        const completeCurrentStepSql = "UPDATE process_step_history SET status = 'Completed', end_time = ?, operator_id = ?, operator_name = ?, operator_type = 'admin', remarks = ?, update_time = ? WHERE history_id = ?";
        await sequelize.query(completeCurrentStepSql, {
            replacements: [
                currentTime,
                params.admin_id || 'system',
                params.operator_name || '管理员',
                params.remarks || '',
                currentTime,
                currentStepHistory.history_id
            ],
            type: QueryTypes.UPDATE
        });
        
        // 获取下一步骤
        const nextStepSql = "SELECT * FROM process_step_history WHERE instance_id = ? AND sequence > ? AND status = 'NotStarted' ORDER BY sequence ASC LIMIT 1";
        const nextStep = await sequelize.query<AdminProcessStepHistoryModel>(nextStepSql, {
            replacements: [instanceResult.instance_id, currentStepHistory.sequence],
            type: QueryTypes.SELECT,
            plain: true
        });
        
        let finalStep = 'Completed';
        let finalSequence = currentStepHistory.sequence;
        let finalStatus = 'Completed';
        
        if (nextStep) {
            // 启动下一步骤
            const startNextStepSql = "UPDATE process_step_history SET status = 'InProgress', start_time = ?, update_time = ? WHERE history_id = ?";
            await sequelize.query(startNextStepSql, {
                replacements: [currentTime, currentTime, nextStep.history_id],
                type: QueryTypes.UPDATE
            });
            
            finalStep = nextStep.step;
            finalSequence = nextStep.sequence;
            finalStatus = 'InProgress';
        }
        
        // 更新流程实例
        const updateInstanceSql = "UPDATE process_instance SET current_step = ?, current_sequence = ?, status = ?, update_time = ? WHERE order_id = ?";
        await sequelize.query(updateInstanceSql, {
            replacements: [finalStep, finalSequence, finalStatus, currentTime, params.order_id],
            type: QueryTypes.UPDATE
        });
            
            // 如果流程完成，更新订单状态
            if (finalStatus === 'Completed') {
                const updateOrderSql = "UPDATE service_order SET status = 'Completed', update_time = ? WHERE order_id = ?";
                await sequelize.query(updateOrderSql, {
                    replacements: [currentTime, params.order_id],
                    type: QueryTypes.UPDATE
                });
            }
            
            return { 
                message: "Process advanced successfully",
                current_step: finalStep,
                current_sequence: finalSequence,
                status: finalStatus
            };
    } catch (error) {
        // 推进流程失败
        throw error;
    }
};

// 分配任务
export const assignTasks = async (params: TaskAssignParams): Promise<any> => {
    const currentTime = Math.floor(Date.now() / 1000);
    const orderIdsPlaceholders = params.order_ids.map((_, index) => `:order_id_${index}`).join(',');
    
        const sql = `UPDATE service_order SET assigned_admin = :assigned_admin, admin_remarks = :admin_remarks, update_time = :update_time WHERE order_id IN (${orderIdsPlaceholders})`;
    
    const replacements: any = {
        assigned_admin: params.admin_id,
        admin_remarks: params.remarks || '',
        update_time: currentTime
    };
    
    // 添加order_ids到replacements中
    params.order_ids.forEach((id, index) => {
        replacements[`order_id_${index}`] = id;
    });
    
    const [updateResult] = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.UPDATE
    });
    
    return { message: "Tasks assigned successfully", affected_rows: updateResult || 0 };
};

// 批量操作
export const batchOperation = async (params: BatchOperationParams): Promise<any> => {
    const currentTime = Math.floor(Date.now() / 1000);
    const orderIdsPlaceholders = params.order_ids.map((_, index) => `:order_id_${index}`).join(',');
    let sql = "";
    let replacements: any = { 
        update_time: currentTime,
        value: params.value
    };

    // 添加order_ids到replacements中
    params.order_ids.forEach((id, index) => {
        replacements[`order_id_${index}`] = id;
    });

    switch (params.operation) {
        case 'assign':
            sql = `UPDATE service_order SET assigned_admin = :value, update_time = :update_time WHERE order_id IN (${orderIdsPlaceholders})`;
            break;
        case 'priority':
            sql = `UPDATE service_order SET priority = :value, update_time = :update_time WHERE order_id IN (${orderIdsPlaceholders})`;
            break;
        case 'status':
            sql = `UPDATE service_order SET status = :value, update_time = :update_time WHERE order_id IN (${orderIdsPlaceholders})`;
            break;
        case 'remarks':
            sql = `UPDATE service_order SET admin_remarks = :value, update_time = :update_time WHERE order_id IN (${orderIdsPlaceholders})`;
            break;
        default:
            throw new Error("Invalid operation");
    }

    const [updateResult] = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.UPDATE
    });
    
    return { message: "Batch operation completed successfully", affected_rows: updateResult || 0 };
};

// 创建模板
export const createTemplate = async (params: TemplateCreateParams): Promise<any> => {
    const currentTime = Math.floor(Date.now() / 1000);
    const templateId = `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sql = "INSERT INTO process_template (template_id, service_id, template_name, description, steps_json, is_active, create_time, update_time) VALUES (:template_id, :service_id, :template_name, :description, :steps, 1, :create_time, :update_time)";
    await sequelize.query(sql, {
        replacements: {
            template_id: templateId,
            service_id: params.service_id,
            template_name: params.template_name,
            description: params.description || '',
            steps: JSON.stringify(params.steps),
            create_time: currentTime,
            update_time: currentTime
        },
        type: QueryTypes.INSERT
    });
    
    return { template_id: templateId, message: "Template created successfully" };
};

// 更新模板
export const updateTemplate = async (templateId: string, params: Partial<TemplateCreateParams>): Promise<any> => {
    const currentTime = Math.floor(Date.now() / 1000);
    let updateFields: string[] = [];
    let replacements: any = { template_id: templateId, update_time: currentTime };

    if (params.template_name) {
        updateFields.push("template_name = :template_name");
        replacements.template_name = params.template_name;
    }
    if (params.description !== undefined) {
        updateFields.push("description = :description");
        replacements.description = params.description;
    }
        if (params.steps) {
            updateFields.push("steps_json = :steps");
            replacements.steps = JSON.stringify(params.steps);
        }
    
    updateFields.push("update_time = :update_time");

        const sql = `UPDATE process_template SET ${updateFields.join(", ")} WHERE template_id = :template_id`;
    const [updateResult] = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.UPDATE
    });
    
    return { message: "Template updated successfully" };
};

// 删除模板（软删除）
export const deleteTemplate = async (templateId: string): Promise<any> => {
    const sql = "UPDATE process_template SET is_active = 0 WHERE template_id = :template_id";
    const [updateResult] = await sequelize.query(sql, {
        replacements: { template_id: templateId },
        type: QueryTypes.UPDATE
    });
    
    return { message: "Template deleted successfully" };
};

// 查询模板列表
export const queryTemplates = async (currentPage: number, pageSize: number, serviceId?: string, keyword?: string): Promise<any> => {
    let whereClause = "WHERE pt.is_active = 1";
    let replacements: any = {};

    if (serviceId) {
        whereClause += " AND pt.service_id = :service_id";
        replacements.service_id = serviceId;
    }

    if (keyword) {
        whereClause += " AND (pt.template_name LIKE :keyword OR pt.description LIKE :keyword)";
        replacements.keyword = `%${keyword}%`;
    }

    const offset = (currentPage - 1) * pageSize;
    
    const countSql = `SELECT COUNT(pt.id) as total FROM process_template pt ${whereClause}`;
    const countResult = await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
        plain: true
    });
    
    const dataSql = `SELECT pt.*, c.name as service_name FROM process_template pt LEFT JOIN category c ON pt.service_id = c.id ${whereClause} ORDER BY pt.create_time DESC LIMIT :limit OFFSET :offset`;
    const dataResult = await sequelize.query<AdminProcessTemplateModel>(dataSql, {
        replacements: {
            ...replacements,
            limit: pageSize,
            offset: offset
        },
        type: QueryTypes.SELECT
    });

    return {
        list: dataResult || [],
        total: (countResult as any)?.total || 0,
        current_page: currentPage,
        page_size: pageSize
    };
};

// 设置订单优先级
export const setOrderPriority = async (orderId: string, priority: string): Promise<any> => {
    const currentTime = Math.floor(Date.now() / 1000);
    const sql = "UPDATE service_order SET priority = :priority, update_time = :update_time WHERE order_id = :order_id";
    const [updateResult] = await sequelize.query(sql, {
        replacements: {
            priority: priority,
            update_time: currentTime,
            order_id: orderId
        },
        type: QueryTypes.UPDATE
    });
    
    return { message: "Priority updated successfully" };
};

// 添加订单备注
export const addOrderRemarks = async (orderId: string, remarks: string, operatorId: string): Promise<any> => {
    const currentTime = Math.floor(Date.now() / 1000);
    const sql = "UPDATE service_order SET admin_remarks = :admin_remarks, update_time = :update_time WHERE order_id = :order_id";
    const [updateResult] = await sequelize.query(sql, {
        replacements: {
            admin_remarks: remarks,
            update_time: currentTime,
            order_id: orderId
        },
        type: QueryTypes.UPDATE
    });
    
    return { message: "Remarks added successfully" };
};

// 查询告警
export const queryAlerts = async (currentPage: number, pageSize: number, filters?: any): Promise<any> => {
    let whereClause = "WHERE a.is_resolved = 0";
    let replacements: any = {};

    if (filters?.alert_type) {
        whereClause += " AND a.alert_type = :alert_type";
        replacements.alert_type = filters.alert_type;
    }
    if (filters?.severity) {
        whereClause += " AND a.severity = :severity";
        replacements.severity = filters.severity;
    }

    const offset = (currentPage - 1) * pageSize;
    
    const countSql = `SELECT COUNT(*) as total FROM process_alert a ${whereClause}`;
    const countResult = await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
        plain: true
    });
    
    const dataSql = `SELECT a.*, so.service_id, so.title as service_name FROM process_alert a LEFT JOIN service_order so ON a.order_id = so.order_id ${whereClause} ORDER BY a.create_time DESC LIMIT :limit OFFSET :offset`;
    const dataResult = await sequelize.query(dataSql, {
        replacements: {
            ...replacements,
            limit: pageSize,
            offset: offset
        },
        type: QueryTypes.SELECT
    });

    return {
        list: dataResult || [],
        total: (countResult as any)?.total || 0,
        current_page: currentPage,
        page_size: pageSize
    };
};

// 解决告警
export const resolveAlert = async (alertId: string, adminId: string): Promise<any> => {
    const currentTime = Math.floor(Date.now() / 1000);
    const sql = "UPDATE alerts SET status = 'Resolved', assigned_admin = :assigned_admin, resolve_time = :resolve_time WHERE alert_id = :alert_id";
    const [updateResult] = await sequelize.query(sql, {
        replacements: {
            assigned_admin: adminId,
            resolve_time: currentTime,
            alert_id: alertId
        },
        type: QueryTypes.UPDATE
    });
    
    return { message: "Alert resolved successfully" };
};

// 获取订单统计
export const getOrderStatistics = async (adminId?: string, startDate?: number, endDate?: number): Promise<any> => {
    let whereClause = "WHERE status != 'Cancelled'";
    let replacements: any = {};

    if (adminId) {
        whereClause += " AND assigned_admin = :assigned_admin";
        replacements.assigned_admin = adminId;
    }
    if (startDate) {
        whereClause += " AND create_time >= :start_date";
        replacements.start_date = startDate;
    }
    if (endDate) {
        whereClause += " AND create_time <= :end_date";
        replacements.end_date = endDate;
    }

    const sql = `SELECT status, COUNT(*) as count, AVG(CASE WHEN status = 'Completed' THEN (update_time - create_time) END) as avg_completion_time FROM service_order ${whereClause} GROUP BY status`;
    const result = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT
    });
    
    return result || [];
};

// 查询流程实例列表
export const queryProcessInstances = async (params: any): Promise<any> => {
    let whereConditions: string[] = ["pi.status != 'Cancelled'"];
    let replacements: any = {};

    if (params.status) {
        whereConditions.push("pi.status = :status");
        replacements.status = params.status;
    }
    if (params.assigned_staff) {
        whereConditions.push("pi.assigned_staff = :assigned_staff");
        replacements.assigned_staff = params.assigned_staff;
    }

    const whereClause = whereConditions.join(" AND ");
    const offset = (params.current_page - 1) * params.page_size;
    
    const countSql = `SELECT COUNT(*) as total FROM process_instance pi WHERE ${whereClause}`;
    const countResult = await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
        plain: true
    });
    
    const dataSql = `SELECT pi.*, so.title as service_name FROM process_instance pi LEFT JOIN service_order so ON pi.order_id = so.order_id WHERE ${whereClause} ORDER BY pi.create_time DESC LIMIT :limit OFFSET :offset`;
    const dataResult = await sequelize.query(dataSql, {
        replacements: {
            ...replacements,
            limit: params.page_size,
            offset: offset
        },
        type: QueryTypes.SELECT
    });

    return {
        list: dataResult || [],
        total: (countResult as any)?.total || 0,
        current_page: params.current_page,
        page_size: params.page_size
    };
};

// 获取流程实例详情
export const getProcessInstanceDetail = async (instanceId: string): Promise<any> => {
    const sql = "SELECT pi.*, so.title as service_name, so.user_id FROM process_instance pi LEFT JOIN service_order so ON pi.order_id = so.order_id WHERE pi.instance_id = :instance_id";
    
    const result = await sequelize.query(sql, {
        replacements: { instance_id: instanceId },
        type: QueryTypes.SELECT,
        plain: true
    });
    
    return result;
};

// 获取步骤历史
export const getStepHistory = async (instanceId: string): Promise<AdminProcessStepHistoryModel[]> => {
    const sql = "SELECT * FROM process_step_history WHERE instance_id = ? ORDER BY sequence ASC";
    
    const result = await sequelize.query<AdminProcessStepHistoryModel>(sql, {
        replacements: [instanceId],
        type: QueryTypes.SELECT
    });
    
    return result || [];
};

// 确认告警
export const acknowledgeAlert = async (alertId: string, adminId: string): Promise<any> => {
    const sql = "UPDATE process_alert SET is_resolved = 1, resolved_by = :admin_id, resolve_time = UNIX_TIMESTAMP() WHERE alert_id = :alert_id";
    
    await sequelize.query(sql, {
        replacements: { alert_id: alertId, admin_id: adminId },
        type: QueryTypes.UPDATE
    });
    
    return { msg: "ok", data: null };
};


// 获取服务分类列表
export const getCategoryList = async (): Promise<any> => {
    const sql = "SELECT id, name, pid, status FROM category WHERE status = 1 ORDER BY sort ASC, id ASC";
    
    const result = await sequelize.query(sql, {
        type: QueryTypes.SELECT
    });
    
    return result || [];
};

// 根据服务ID获取活跃的流程模板
export const getActiveTemplateByServiceId = async (serviceId: number): Promise<AdminProcessTemplateModel | null> => {
    const sql = "SELECT pt.*, c.name as service_name FROM process_template pt LEFT JOIN category c ON pt.service_id = c.id WHERE pt.service_id = :service_id AND pt.is_active = 1 LIMIT 1";
    const result = await sequelize.query<AdminProcessTemplateModel>(sql, {
        replacements: { service_id: serviceId },
        type: QueryTypes.SELECT,
        plain: true
    });
    
    return result || null;
};

// 创建流程实例和步骤历史
export const createProcessInstance = async (instanceData: {
    instance_id: string;
    order_id: string;
    template_id: string;
    current_step: string;
    current_sequence: number;
    status: string;
    assigned_staff?: string;
    create_time?: number;
    update_time?: number;
}): Promise<any> => {
    const currentTime = instanceData.create_time || Date.now();
    const updateTime = instanceData.update_time || currentTime;
    
    try {
        // 创建流程实例
        const instanceSql = "INSERT INTO process_instance (instance_id, order_id, template_id, current_step, current_sequence, status, assigned_staff, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        await sequelize.query(instanceSql, {
            replacements: [
        instanceData.instance_id,
        instanceData.order_id,
        instanceData.template_id,
        instanceData.current_step,
        instanceData.current_sequence,
        instanceData.status,
        instanceData.assigned_staff || null,
        currentTime,
        updateTime
            ],
        type: QueryTypes.INSERT
    });
    
        // 获取流程模板信息
        const templateSql = "SELECT steps_json FROM process_template WHERE template_id = ?";
        const templateResult = await sequelize.query(templateSql, {
            replacements: [instanceData.template_id],
            type: QueryTypes.SELECT,
            plain: true
        }) as any;
        
        if (!templateResult) {
            throw new Error("流程模板不存在");
        }
        
        // 解析步骤配置
        let steps = [];
        try {
            if (typeof templateResult.steps_json === 'string') {
                steps = JSON.parse(templateResult.steps_json);
            } else {
                steps = templateResult.steps_json || [];
            }
        } catch (error) {
            // 解析模板步骤失败
            steps = [];
        }
        
        // 创建步骤历史记录
        if (steps.length > 0) {
            const stepHistoryInserts = steps.map((step: any, index: number) => {
                const historyId = `HIST_${instanceData.instance_id}_${step.sequence}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const stepStatus = index === 0 ? 'InProgress' : 'NotStarted'; // 第一个步骤设为进行中
                const stepStartTime = index === 0 ? currentTime : null; // 第一个步骤设置开始时间
                
                return [
                    historyId,
                    instanceData.order_id,
                    instanceData.instance_id,
                    step.step,
                    step.sequence,
                    step.role || 'service_provider',
                    step.description || '',
                    step.estimated_days || 1,
                    JSON.stringify(step.required_files || []),
                    step.approval_required || 0,
                    step.auto_advance || 0,
                    stepStatus,
                    stepStartTime,
                    null, // end_time
                    null, // operator_id
                    null, // operator_name
                    null, // operator_type
                    null, // remarks
                    currentTime,
                    currentTime
                ];
            });
            
            const stepHistorySql = "INSERT INTO process_step_history (history_id, order_id, instance_id, step, sequence, role, description, estimated_days, required_files, approval_required, auto_advance, status, start_time, end_time, operator_id, operator_name, operator_type, remarks, create_time, update_time) VALUES ?";
            await sequelize.query(stepHistorySql, {
                replacements: [stepHistoryInserts],
                type: QueryTypes.INSERT
            });
        }
        
        return { message: "Process instance and step history created successfully" };
    } catch (error) {
        // 创建流程实例失败
        throw error;
    }
};