import { getRedis } from "../../storage/redis";
import { sequelize } from "../../storage/mysql";
import { QueryTypes } from "sequelize";
import * as repository from "./repository";
import { OrderModel, OrderQueryParams, PaymentParams, RefundParams, CachedOrderModel, ExportOrderParams } from "./proto";
import * as serviceFlowService from "../serviceFlow/service";

const redis = getRedis();
const redisPrefix = "pending_order:"; 


// 处理支付（将订单从Redis移动到MySQL）
export const processPayment = async (params: PaymentParams): Promise<any> => {
    try {
        const currentTime = Math.floor(Date.now() / 1000);
        const redisKey = `${redisPrefix}${params.order_no}`;
        
        const cachedOrderStr = await redis.get(redisKey);
        if (!cachedOrderStr) {
            throw new Error("订单不存在或已过期");
        }

        const cachedOrder: CachedOrderModel = JSON.parse(cachedOrderStr);
        
        if (currentTime > cachedOrder.expire_time) {
            await redis.del(redisKey);
            throw new Error("订单已过期");
        }

        // 创建正式订单记录
        const orderData: OrderModel = {
            order_no: params.order_no,
            entity_id: cachedOrder.entity_id,
            business_type: cachedOrder.business_type as 'service' | 'product' | 'invoice' | 'member',
            business_id: cachedOrder.business_id,
            provider_id: cachedOrder.provider_id || cachedOrder.entity_id,
            business_title: cachedOrder.business_title,
            business_data: cachedOrder.business_data,
            original_price: cachedOrder.original_price,
            discount_price: cachedOrder.discount_price,
            actual_price: params.actual_price || cachedOrder.actual_price,
            status: 2, // 已支付
            payment_status: 1, // 已支付
            payment_method: params.payment_method,
            payment_time: currentTime,
            payment_order_no: params.payment_order_no,
            business_status: 0, // 未处理
            remark: cachedOrder.remark,
            create_time: cachedOrder.create_time,
            update_time: currentTime
        };

        // 检查订单是否已经存在于数据库中，避免重复处理
        const existingOrder = await repository.getOrderByNo(params.order_no);
        if (existingOrder) {
            // 订单已存在，删除Redis缓存并返回现有订单信息
            await redis.del(redisKey);
            await redis.lrem("pending_orders", 0, params.order_no);
            
            return { 
                order_id: existingOrder.id, 
                order_no: params.order_no,
                message: "订单已存在，支付处理完成",
                business_order_created: existingOrder.business_status === 1,
                business_order_id: existingOrder.business_order_id
            };
        }

        // 立即删除Redis缓存，防止重复处理
        await redis.del(redisKey);
        await redis.lrem("pending_orders", 0, params.order_no);

        // 写入数据库
        const result = await repository.createOrder(orderData);
        
        if (result && result.id) {
            // 记录订单支付日志
            await repository.addOrderLog({
                order_id: result.id,
                order_no: params.order_no,
                old_status: 1,
                new_status: 2,
                action_type: 'pay',
                message: `支付成功，支付方式：${params.payment_method}`,
                operator_id: params.operator_id || 1,
                operator_type: 2, // 管理员操作
                extra_data: JSON.stringify(params)
            });
            
            // 创建业务订单
            const businessResult = await createBusinessOrder(result.id, orderData);
            
            return { 
                order_id: result.id, 
                order_no: params.order_no,
                message: "支付处理成功，订单已入库",
                business_order_created: businessResult.success,
                business_order_id: businessResult.business_order_id
            };
        } else {
            throw new Error("订单入库失败");
        }
    } catch (error) {
        console.error("processPayment error:", error);
        throw error;
    }
};

// 查询订单列表
export const queryOrderList = async (params: OrderQueryParams): Promise<any> => {
    try {
        // 如果查询状态为1（未支付），需要从Redis获取数据
        if (params.status === 1) {
            return await getUnpaidOrdersFromRedis(params);
        }
        
        // 其他状态从MySQL查询
        return await repository.queryOrderList(params);
    } catch (error) {
        console.error('queryOrderList error:', error);
        throw error;
    }
};

// 从Redis获取未支付订单列表
const getUnpaidOrdersFromRedis = async (params: OrderQueryParams): Promise<any> => {
    try {
        const pattern = `${redisPrefix}*`;
        const keys = await redis.keys(pattern);
        
        if (!keys || keys.length === 0) {
            return {
                list: [],
                total: 0,
                affectedDocs: 0
            };
        }
        
        // 批量获取Redis中的订单数据
        const cachedOrders = [];
        for (const key of keys) {
            try {
                const orderStr = await redis.get(key);
                if (orderStr) {
                    const order = JSON.parse(orderStr);
                    // 检查订单是否过期
                    const currentTime = Math.floor(Date.now() / 1000);
                    if (currentTime <= order.expire_time) {
                        // 转换为标准订单格式
                        const formattedOrder = {
                            _id: order.order_no,
                            order_no: order.order_no,
                            order_number: order.order_no,
                            entity_id: order.entity_id,
                            business_type: order.business_type,
                            business_id: order.business_id,
                            business_title: order.business_title,
                            business_data: order.business_data,
                            original_price: order.original_price,
                            discount_price: order.discount_price,
                            actual_price: order.actual_price,
                            status: 1, // 未支付
                            status_text: '待支付',
                            pay_status: 0, // 未支付
                            payment_status: 0, // 未支付
                            business_status: 0,
                            remark: order.remark,
                            add_time: order.create_time,
                            create_time: order.create_time,
                            update_time: order.create_time,
                            user: {
                                username: order.entity_id || 'unknown'
                            }
                        };
                        cachedOrders.push(formattedOrder);
                    } else {
                        // 删除过期订单
                        await redis.del(key);
                    }
                }
            } catch (err) {
                console.error('处理Redis订单数据失败:', err);
            }
        }
        
        // 根据查询条件过滤
        let filteredOrders = cachedOrders;
        
        if (params.entity_id) {
            filteredOrders = filteredOrders.filter(order => order.entity_id == params.entity_id);
        }
        
        if (params.business_type) {
            filteredOrders = filteredOrders.filter(order => order.business_type === params.business_type);
        }
        
        if (params.order_number) {
            filteredOrders = filteredOrders.filter(order => 
                order.order_number && order.order_number.includes(params.order_number)
            );
        }
        
        if (params.username) {
            filteredOrders = filteredOrders.filter(order => 
                order.user.username && order.user.username.includes(params.username)
            );
        }
        
        // 排序：按创建时间倒序
        filteredOrders.sort((a, b) => b.create_time - a.create_time);
        
        // 分页处理
        const total = filteredOrders.length;
        const pageSize = params.page_size || 10;
        const currentPage = params.current_page || 1;
        const offset = (currentPage - 1) * pageSize;
        
        const paginatedOrders = filteredOrders.slice(offset, offset + pageSize);
        
        return {
            list: paginatedOrders,
            total: total,
            affectedDocs: total
        };
        
    } catch (error) {
        console.error('从Redis获取未支付订单失败:', error);
        return {
            list: [],
            total: 0,
            affectedDocs: 0
        };
    }
};

// 创建业务订单
const createBusinessOrder = async (orderId: number, orderData: OrderModel): Promise<{ success: boolean; business_order_id?: string; message?: string }> => {
    try {
        // 检查是否已创建业务订单
        if (orderData.business_status === 1) {
            return { 
                success: true, 
                business_order_id: orderData.business_order_id,
                message: "业务订单已存在"
            };
        }
        
        let businessOrderId: string | null = null;
        
        // 根据业务类型创建相应的业务订单
        switch (orderData.business_type) {
            case 'service':
                businessOrderId = await createServiceOrder(orderData);
                break;
            case 'product':
                businessOrderId = await createProductOrder(orderData);
                break;
            case 'member':
                businessOrderId = await createMemberOrder(orderData);
                break;
            case 'invoice':
                businessOrderId = await createInvoiceOrder(orderData);
                break;
            default:
                return { 
                    success: false, 
                    message: `不支持的业务类型: ${orderData.business_type}` 
                };
        }
        
        if (!businessOrderId) {
            return { 
                success: false, 
                message: "业务订单创建失败" 
            };
        }
        
        // 更新订单的业务处理状态
        await repository.updateOrderStatus(orderData.order_no, orderData.status, {
            business_status: 1,
            business_order_id: businessOrderId
        });
        
        return { 
            success: true, 
            business_order_id: businessOrderId,
            message: "业务订单创建成功"
        };
    } catch (error) {
        console.error('创建业务订单失败:', error);
        return { 
            success: false, 
            message: `创建业务订单失败: ${error.message}` 
        };
    }
};

// 创建服务订单
const createServiceOrder = async (order: OrderModel): Promise<string | null> => {
    try {
        const serviceOrderId = order.order_no;  // 使用订单号作为服务订单ID，具有关联性
        const businessData = order.business_data || {};
        const currentTime = Math.floor(Date.now() / 1000);
        
        // 从服务产品表查询服务信息（包含 category_id 用于查询流程模板）
        const serviceInfoSql = "SELECT id, category_id, title, description, price, unit, contact_name, contact_phone, service_area, service_time FROM service_products WHERE id = ? AND status = 2";
        const serviceResult = await sequelize.query(serviceInfoSql, {
            replacements: [order.business_id],
            type: QueryTypes.SELECT
        });
        
        if (!serviceResult || serviceResult.length === 0) {
            console.error('服务产品不存在或已下架:', order.business_id);
            return null;
        }
        
        const serviceInfo = serviceResult[0] as any;
        
        // 构建服务订单数据
        const sql = "INSERT INTO service_order (order_id, user_id, service_id, provider_id, title, service_type, status, current_step, start_date, end_date, cycle_months, price, remarks, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const params = [
            serviceOrderId,
            order.entity_id.toString(),
            order.business_id,
            order.provider_id, // 添加 provider_id 字段
            serviceInfo.title, // 服务名称
            businessData.service_type || 'one_time', // 从业务数据获取服务类型，默认一次性
            'Pending',
            businessData.current_step || '订单确认', // 从业务数据获取当前步骤，默认订单确认
            businessData.start_date || currentTime, // 服务开始时间，默认当前时间
            businessData.end_date || null, // 服务结束时间，可为空
            businessData.cycle_months || null, // 周期月数，仅周期性服务需要
            order.actual_price, // 使用订单实际支付价格
            buildServiceRemarks(order, serviceInfo, businessData), // 构建服务备注
            currentTime,
            currentTime
        ];
        
        const result = await sequelize.query(sql, {
            replacements: params,
            type: QueryTypes.INSERT
        });
        
        if (result && result[0]) {
            // 创建流程实例（使用 category_id 而不是 service_product_id）
            try {
                await createProcessInstanceForService(serviceOrderId, parseInt(serviceInfo.category_id), businessData);
            } catch (processError) {
                console.error('创建服务流程实例失败:', processError);
                // 不影响服务订单创建的成功，只记录错误日志
            }
            
            return serviceOrderId;
        }
        
        return null;
    } catch (error) {
        console.error('创建服务订单失败:', error);
        return null;
    }
};

// 构建服务订单备注信息
const buildServiceRemarks = (order: OrderModel, serviceInfo: any, businessData: any): string => {
    const remarks = [];
    
    // 添加服务基本信息
    remarks.push(`服务名称: ${serviceInfo.title}`);
    if (serviceInfo.description) {
        remarks.push(`服务描述: ${serviceInfo.description}`);
    }
    
    // 添加服务区域和时间
    if (serviceInfo.service_area) {
        remarks.push(`服务区域: ${serviceInfo.service_area}`);
    }
    if (serviceInfo.service_time) {
        remarks.push(`服务时间: ${serviceInfo.service_time}`);
    }
    
    // 添加联系信息
    if (serviceInfo.contact_name) {
        remarks.push(`联系人: ${serviceInfo.contact_name}`);
    }
    if (serviceInfo.contact_phone) {
        remarks.push(`联系电话: ${serviceInfo.contact_phone}`);
    }
    
    // 添加价格信息
    remarks.push(`标准价格: ${serviceInfo.price}${serviceInfo.unit || '元'}`);
    remarks.push(`实际支付: ${order.actual_price}元`);
    
    // 添加订单备注
    if (order.remark) {
        remarks.push(`订单备注: ${order.remark}`);
    }
    
    // 添加业务数据中的特殊要求
    if (businessData.special_requirements) {
        remarks.push(`特殊要求: ${businessData.special_requirements}`);
    }
    
    // 添加服务类型说明
    const serviceTypeText = businessData.service_type === 'recurring' ? '周期性服务' : '一次性服务';
    remarks.push(`服务类型: ${serviceTypeText}`);
    
    if (businessData.service_type === 'recurring' && businessData.cycle_months) {
        remarks.push(`服务周期: ${businessData.cycle_months}个月`);
    }
    
    return remarks.join('; ');
};

// 创建产品订单 - 占位方法，可根据实际需求实现
const createProductOrder = async (order: OrderModel): Promise<string | null> => {
    try {
        const productOrderId = `PROD_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        return productOrderId;
    } catch (error) {
        console.error('创建产品订单失败:', error);
        return null;
    }
};

// 创建会员订单 - 占位方法，可根据实际需求实现
const createMemberOrder = async (order: OrderModel): Promise<string | null> => {
    try {
        const memberOrderId = `MEM_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        return memberOrderId;
    } catch (error) {
        console.error('创建会员订单失败:', error);
        return null;
    }
};

// 创建发票订单 - 占位方法，可根据实际需求实现
const createInvoiceOrder = async (order: OrderModel): Promise<string | null> => {
    try {
        const invoiceOrderId = `INV_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        return invoiceOrderId;
    } catch (error) {
        console.error('创建发票订单失败:', error);
        return null;
    }
};

// 获取订单详情
export const getOrderDetail = async (orderNo: string): Promise<any> => {
    try {
        // 先从Redis查找未支付订单
        const redisKey = `${redisPrefix}${orderNo}`;
        const cachedOrderStr = await redis.get(redisKey);
        
        if (cachedOrderStr) {
            const cachedOrder = JSON.parse(cachedOrderStr);
            const currentTime = Date.now(); // 使用毫秒时间戳
            
            if (currentTime > cachedOrder.expire_time) {
                await redis.del(redisKey);
                // 同时从pending_orders列表中移除
                await redis.lrem("pending_orders", 0, orderNo);
                throw new Error("订单已过期");
            }
            
            return {
                ...cachedOrder,
                status: 1,
                payment_status: 0,
                source: 'redis'
            };
        }

        // 从MySQL查找已支付订单
        const order = await repository.getOrderByNo(orderNo);
        if (order) {
            return { ...order, source: 'mysql' };
        }
        
        throw new Error("订单不存在");
    } catch (error) {
        console.error("getOrderDetail error:", error);
        throw error;
    }
};

// 取消订单
export const cancelOrder = async (orderNo: string, reason: string, operatorId: number): Promise<any> => {
    try {
        const currentTime = Math.floor(Date.now() / 1000);
        const redisKey = `${redisPrefix}${orderNo}`;
        
        // 检查Redis中的未支付订单
        const cachedOrderStr = await redis.get(redisKey);
        if (cachedOrderStr) {
            await redis.del(redisKey);
            // 同时从pending_orders列表中移除
            await redis.lrem("pending_orders", 0, orderNo);
            return { message: "未支付订单已取消" };
        }

        // 取消MySQL中的已支付订单
        const result = await repository.updateOrderStatus(orderNo, 4, { cancel_reason: reason, update_time: currentTime });
        
        if (result.affectedRows > 0) {
            const order = await repository.getOrderByNo(orderNo);
            await repository.addOrderLog({
                order_id: order.id,
                order_no: orderNo,
                old_status: 2,
                new_status: 4,
                action_type: 'cancel',
                message: reason,
                operator_id: operatorId,
                operator_type: 2
            });
            
            return { message: "订单已取消" };
        }
        
        throw new Error("订单不存在或无法取消");
    } catch (error) {
        console.error("cancelOrder error:", error);
        throw error;
    }
};

// 处理退款
export const processRefund = async (params: RefundParams): Promise<any> => {
    try {
        const currentTime = Math.floor(Date.now() / 1000);
        
        const result = await repository.updateOrderStatus(params.order_no, 5, {
            refund_amount: params.refund_amount,
            refund_reason: params.refund_reason,
            refund_time: currentTime,
            update_time: currentTime
        });

        if (result.affectedRows > 0) {
            const order = await repository.getOrderByNo(params.order_no);
            await repository.addOrderLog({
                order_id: order.id,
                order_no: params.order_no,
                old_status: 2,
                new_status: 5,
                action_type: 'refund',
                message: `退款金额：${params.refund_amount}，退款原因：${params.refund_reason}`,
                operator_id: params.operator_id,
                operator_type: 2,
                extra_data: JSON.stringify(params)
            });
            
            return { message: "退款处理成功" };
        }
        
        throw new Error("订单不存在或无法退款");
    } catch (error) {
        console.error("processRefund error:", error);
        throw error;
    }
};

// 更新订单状态
export const updateOrderStatus = async (orderNo: string, status: number, operatorId: number, message?: string): Promise<any> => {
    try {
        const currentTime = Math.floor(Date.now() / 1000);
        const order = await repository.getOrderByNo(orderNo);
        
        if (!order) {
            throw new Error("订单不存在");
        }

        const oldStatus = order.status;
        const result = await repository.updateOrderStatus(orderNo, status, { update_time: currentTime });

        if (result.affectedRows > 0) {
            let actionType: 'create' | 'pay' | 'complete' | 'cancel' | 'refund' = 'complete';
            if (status === 3) actionType = 'complete';
            else if (status === 4) actionType = 'cancel';
            else if (status === 5) actionType = 'refund';

            await repository.addOrderLog({
                order_id: order.id,
                order_no: orderNo,
                old_status: oldStatus,
                new_status: status,
                action_type: actionType,
                message: message || `订单状态更新为：${status}`,
                operator_id: operatorId,
                operator_type: 2
            });
            
            return { message: "订单状态更新成功" };
        }
        
        throw new Error("更新失败");
    } catch (error) {
        console.error("updateOrderStatus error:", error);
        throw error;
    }
};

// 获取订单统计
export const getOrderStatistics = async (entityId?: number, businessType?: string): Promise<any> => {
    return await repository.getOrderStatistics(entityId, businessType);
};

// 清理过期的缓存订单
export const cleanExpiredCachedOrders = async (): Promise<any> => {
    try {
        const keys = await redis.keys(`${redisPrefix}*`);
        let cleanedCount = 0;
        const currentTime = Date.now(); // 使用毫秒时间戳，与api项目保持一致
        
        for (const key of keys) {
            const cachedOrderStr = await redis.get(key);
            if (cachedOrderStr) {
                const cachedOrder = JSON.parse(cachedOrderStr);
                if (currentTime > cachedOrder.expire_time) {
                    await redis.del(key);
                    // 同时从pending_orders列表中移除
                    const orderNo = key.replace(redisPrefix, '');
                    await redis.lrem("pending_orders", 0, orderNo);
                    cleanedCount++;
                }
            }
        }
        
        return { cleaned_count: cleanedCount };
    } catch (error) {
        console.error("cleanExpiredCachedOrders error:", error);
        throw error;
    }
};

// 获取订单日志
export const getOrderLogs = async (orderNo: string, currentPage: number = 1, pageSize: number = 20): Promise<any> => {
    return await repository.getOrderLogs(orderNo, currentPage, pageSize);
};


// 导出订单
export const exportOrderData = async (params: ExportOrderParams): Promise<any> => {
    try {
        return await repository.exportOrderData(params);
    } catch (error) {
        console.error("exportOrderData error:", error);
        throw error;
    }
};

// 确认支付订单（业务处理）
export const confirmPaymentOrder = async (orderNo: string, operatorId: number): Promise<any> => {
    try {
        const currentTime = Math.floor(Date.now() / 1000);
        
        const result = await repository.updateOrderStatus(orderNo, 2, {
            business_status: 1,
            update_time: currentTime
        });

        if (result.affectedRows > 0) {
            const order = await repository.getOrderByNo(orderNo);
            if (order) {
                await repository.addOrderLog({
                    order_id: order.id,
                    order_no: orderNo,
                    old_status: 1,
                    new_status: 2,
                    action_type: 'pay',
                    message: `确认支付并处理订单`,
                    operator_id: operatorId,
                    operator_type: 2
                });
            }
            
            return { message: "订单处理成功" };
        }
        
        throw new Error("订单状态不正确或不存在");
    } catch (error) {
        console.error("confirmPaymentOrder error:", error);
        throw error;
    }
};

// 为服务订单创建流程实例
const createProcessInstanceForService = async (serviceOrderId: string, categoryId: number, businessData: any): Promise<void> => {
    try {
        // 1. 根据服务分类ID获取活跃的流程模板
        const template = await serviceFlowService.getActiveTemplateByServiceId(categoryId);
        if (!template) {
            return;
        }

        // 2. 解析模板的步骤信息
        let steps: any[] = [];
        try {
            // 检查steps_json是否已经是对象
            if (typeof template.steps_json === 'string') {
                steps = JSON.parse(template.steps_json);
            } else if (Array.isArray(template.steps_json)) {
                steps = template.steps_json;
            } else if (template.steps_json && typeof template.steps_json === 'object') {
                // 如果是对象但不是数组，可能需要进一步处理
                steps = template.steps_json.steps || [template.steps_json];
            } else {
                return;
            }
        } catch (parseError) {
            console.error('解析流程模板步骤失败:', parseError);
            return;
        }

        if (!steps || steps.length === 0) {
            return;
        }

        // 3. 获取第一个步骤信息
        const firstStep = steps.find(step => step.sequence === 1) || steps[0];
        
        // 4. 生成流程实例ID
        const instanceId = `INST${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // 5. 创建流程实例数据
        const currentTime = +Date.now();
        const instanceData = {
            instance_id: instanceId,
            order_id: serviceOrderId,
            template_id: template.template_id,
            current_step: firstStep.step,
            current_sequence: firstStep.sequence,
            status: 'NotStarted', // 初始状态为未开始
            assigned_staff: businessData.assigned_staff || undefined,
            step_history: JSON.stringify([{
                step: firstStep.step,
                sequence: firstStep.sequence,
                status: 'Pending',
                start_time: currentTime
            }]),
            create_time: currentTime,
            update_time: currentTime
        };

        // 6. 调用服务流程模块创建流程实例
        await serviceFlowService.createProcessInstance(instanceData);
    } catch (error) {
        console.error('创建服务流程实例失败:', error);
        throw error;
    }
};
