import { sequelize } from "../../storage/mysql";
import { QueryTypes } from "sequelize";
import { OrderModel, OrderLogModel, OrderQueryParams, ExportOrderParams } from "./proto";
 

// 根据订单号获取订单
export const getOrderByNo = async (orderNo: string): Promise<OrderModel | null> => {
    const sql = "SELECT * FROM orders WHERE order_no = :order_no";
    
    const result = await sequelize.query<OrderModel>(sql, {
        replacements: { order_no: orderNo },
        type: QueryTypes.SELECT,
        plain: true
    });
    
    return result;
};

// 查询支付订单列表 - 通用支付订单管理
export const queryOrderList = async (params: OrderQueryParams): Promise<any> => {
    let whereConditions: string[] = ["1=1"]; // 不排除任何状态，显示所有支付订单
    let joins: string[] = [];
    let replacements: any = {};

    // 基础条件
    if (params.entity_id) {
        whereConditions.push("o.entity_id = :entity_id");
        replacements.entity_id = params.entity_id;
    }
    if (params.provider_id) {
        whereConditions.push("o.provider_id = :provider_id");
        replacements.provider_id = params.provider_id;
    }
    if (params.business_type) {
        whereConditions.push("o.business_type = :business_type");
        replacements.business_type = params.business_type;
    }
    if (params.status !== undefined) {
        whereConditions.push("o.status = :status");
        replacements.status = params.status;
    }
    if (params.payment_status !== undefined) {
        whereConditions.push("o.payment_status = :payment_status");
        replacements.payment_status = params.payment_status;
    }
    if (params.start_date) {
        whereConditions.push("o.create_time >= :start_date");
        replacements.start_date = params.start_date;
    }
    if (params.end_date) {
        whereConditions.push("o.create_time <= :end_date");
        replacements.end_date = params.end_date;
    }

    // 基础搜索条件
    if (params.order_number) {
        whereConditions.push("o.order_no LIKE :order_number");
        replacements.order_number = `%${params.order_number}%`;
    }
    if (params.username) {
        // 假设用户信息存储在business_data中，或者通过entity_id搜索
        whereConditions.push("(JSON_EXTRACT(o.business_data, '$.username') LIKE :username OR o.entity_id = :entity_id)");
        replacements.username = `%${params.username}%`;
        // 尝试将username转换为数字作为entity_id搜索
        const entityId = parseInt(params.username);
        replacements.entity_id = isNaN(entityId) ? 0 : entityId;
    }

    const whereClause = whereConditions.join(" AND ");
    const joinClause = joins.join(" ");
    const offset = (params.current_page - 1) * params.page_size;
    
    // 获取总数
    const countSql = `SELECT COUNT(DISTINCT o.id) as total FROM orders o ${joinClause} WHERE ${whereClause}`;
    const countResult = await sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
        plain: true
    });
    
    // 获取支付订单列表数据 - 专注于支付管理
    const dataSql = `
        SELECT 
            o.*,
            JSON_EXTRACT(o.business_data, '$.username') as username,
            JSON_EXTRACT(o.business_data, '$.nickname') as nickname,
            CASE o.status
                WHEN 1 THEN '待支付'
                WHEN 2 THEN '已支付'
                WHEN 3 THEN '已完成'
                WHEN 4 THEN '已取消'
                WHEN 5 THEN '已退款'
                ELSE '未知状态'
            END as status_text,
            CASE o.payment_status
                WHEN 0 THEN '未支付'
                WHEN 1 THEN '已支付'
                WHEN 2 THEN '支付失败'
                ELSE '未知'
            END as pay_status_text
        FROM orders o 
        ${joinClause}
        WHERE ${whereClause} 
        ORDER BY o.create_time DESC 
        LIMIT :limit OFFSET :offset
    `;
    const dataResult = await sequelize.query<any>(dataSql, {
        replacements: {
            ...replacements,
            limit: params.page_size,
            offset: offset
        },
        type: QueryTypes.SELECT
    });

    // 格式化支付订单数据 - 专注于支付管理核心信息
    const formattedData = dataResult.map(item => ({
        _id: item.id,
        order_no: item.order_no,
        order_number: item.order_no, // 兼容前端
        entity_id: item.entity_id,
        business_type: item.business_type,
        business_title: item.business_title,
        original_price: item.original_price,
        discount_price: item.discount_price,
        actual_price: item.actual_price,
        status: item.status,
        status_text: item.status_text,
        payment_status: item.payment_status,
        pay_status: item.payment_status, // 兼容前端
        pay_status_text: item.pay_status_text,
        payment_method: item.payment_method,
        payment_order_no: item.payment_order_no,
        payment_time: item.payment_time,
        business_status: item.business_status,
        remark: item.remark,
        cancel_reason: item.cancel_reason,
        refund_reason: item.refund_reason,
        refund_amount: item.refund_amount,
        refund_time: item.refund_time,
        create_time: item.create_time,
        add_time: item.create_time, // 兼容前端
        update_time: item.update_time,
        user: {
            username: item.username || '',
            nickname: item.nickname || ''
        },
        // 简化的价格数据，专注于支付金额
        price_data: {
            original_price: item.original_price || 0,
            discount_price: item.discount_price || 0,
            actual_price: item.actual_price || 0,
            pay_price: item.actual_price || 0 // 兼容前端
        }
    }));

    return {
        list: formattedData,
        total: (countResult as any)?.total || 0,
        affectedDocs: (countResult as any)?.total || 0, // 兼容前端
        current_page: params.current_page,
        page_size: params.page_size
    };
};

// 创建订单
export const createOrder = async (orderData: OrderModel): Promise<{ id: number } | null> => {
    try {
        const sql = "INSERT INTO orders (order_no, entity_id, business_type, business_id, provider_id, business_title, business_data, original_price, discount_price, actual_price, invoice_id, remark, status, payment_status, payment_method, payment_time, payment_order_no, business_status, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const params = [
            orderData.order_no,
            orderData.entity_id,
            orderData.business_type,
            orderData.business_id,
            orderData.provider_id || orderData.entity_id,
            orderData.business_title,
            orderData.business_data ? JSON.stringify(orderData.business_data) : null,
            orderData.original_price,
            orderData.discount_price,
            orderData.actual_price,
            orderData.invoice_id || null,
            orderData.remark || '',
            orderData.status,
            orderData.payment_status,
            orderData.payment_method || null,
            orderData.payment_time || null,
            orderData.payment_order_no || null,
            orderData.business_status,
            orderData.create_time,
            orderData.update_time
        ];

        const result = await sequelize.query(sql, {
            replacements: params,
            type: QueryTypes.INSERT
        });
        if (result && result[0]) {
            return { id: result[0] as number };
        }
        return null;
    } catch (error) {
        console.error("createOrder error:", error);
        throw error;
    }
};

// 更新订单状态
export const updateOrderStatus = async (orderNo: string, status: number, updateData: any): Promise<any> => {
    let updateFields: string[] = ["status = :status"];
    let replacements: any = { status, order_no: orderNo };

    if (updateData.business_status !== undefined) {
        updateFields.push("business_status = :business_status");
        replacements.business_status = updateData.business_status;
    }
    if (updateData.business_data) {
        updateFields.push("business_data = :business_data");
        replacements.business_data = JSON.stringify(updateData.business_data);
    }
    if (updateData.cancel_reason) {
        updateFields.push("cancel_reason = :cancel_reason");
        replacements.cancel_reason = updateData.cancel_reason;
    }
    if (updateData.refund_amount !== undefined) {
        updateFields.push("refund_amount = :refund_amount");
        replacements.refund_amount = updateData.refund_amount;
    }
    if (updateData.refund_reason) {
        updateFields.push("refund_reason = :refund_reason");
        replacements.refund_reason = updateData.refund_reason;
    }
    if (updateData.refund_time) {
        updateFields.push("refund_time = :refund_time");
        replacements.refund_time = updateData.refund_time;
    }
    if (updateData.payment_time) {
        updateFields.push("payment_time = :payment_time");
        replacements.payment_time = updateData.payment_time;
    }
    if (updateData.update_time) {
        updateFields.push("update_time = :update_time");
        replacements.update_time = updateData.update_time;
    }

    const sql = `UPDATE orders SET ${updateFields.join(", ")} WHERE order_no = :order_no`;
    
    const [results] = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.UPDATE
    });
    
    return { affectedRows: results };
};

// 添加订单日志
export const addOrderLog = async (logData: Omit<OrderLogModel, 'id' | 'create_time'>): Promise<void> => {
    const currentTime = Math.floor(Date.now() / 1000);
    const sql = "INSERT INTO order_logs (order_id, order_no, old_status, new_status, action_type, message, operator_id, operator_type, extra_data, create_time) VALUES (:order_id, :order_no, :old_status, :new_status, :action_type, :message, :operator_id, :operator_type, :extra_data, :create_time)";
    
    await sequelize.query(sql, {
        replacements: {
            order_id: logData.order_id,
            order_no: logData.order_no,
            old_status: logData.old_status,
            new_status: logData.new_status,
            action_type: logData.action_type,
            message: logData.message,
            operator_id: logData.operator_id,
            operator_type: logData.operator_type,
            extra_data: logData.extra_data,
            create_time: currentTime
        },
        type: QueryTypes.INSERT
    });
};

// 获取订单统计
export const getOrderStatistics = async (entityId?: number, businessType?: string): Promise<any> => {
    let whereConditions: string[] = ["1=1"];
    let replacements: any = {};

    if (entityId) {
        whereConditions.push("entity_id = :entity_id");
        replacements.entity_id = entityId;
    }
    if (businessType) {
        whereConditions.push("business_type = :business_type");
        replacements.business_type = businessType;
    }

    const whereClause = whereConditions.join(" AND ");
    const sql = `SELECT status, COUNT(*) as count, SUM(actual_price) as total_amount FROM orders WHERE ${whereClause} GROUP BY status`;
    
    const result = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT
    });
    
    return result || [];
};

// 获取订单日志
export const getOrderLogs = async (orderNo: string, currentPage: number = 1, pageSize: number = 20): Promise<any> => {
    // 先获取订单ID
    const orderSql = "SELECT id FROM orders WHERE order_no = :order_no";
    const orderResult = await sequelize.query(orderSql, {
        replacements: { order_no: orderNo },
        type: QueryTypes.SELECT,
        plain: true
    });
    
    if (!orderResult) {
        throw new Error("订单不存在");
    }
    
    const orderId = (orderResult as any).id;
    const offset = (currentPage - 1) * pageSize;
    
    // 获取日志总数
    const countSql = "SELECT COUNT(*) as total FROM order_logs WHERE order_id = :order_id";
    const countResult = await sequelize.query(countSql, {
        replacements: { order_id: orderId },
        type: QueryTypes.SELECT,
        plain: true
    });
    
    // 获取日志列表
    const logsSql = "SELECT * FROM order_logs WHERE order_id = :order_id ORDER BY create_time DESC LIMIT :limit OFFSET :offset";
    const logsResult = await sequelize.query<OrderLogModel>(logsSql, {
        replacements: {
            order_id: orderId,
            limit: pageSize,
            offset: offset
        },
        type: QueryTypes.SELECT
    });
    
    return {
        list: logsResult || [],
        total: (countResult as any)?.total || 0,
        current_page: currentPage,
        page_size: pageSize
    };
};

// 批量操作（简化版，仅支持状态更新和取消）

// 批量操作
export const batchOperation = async (params: any): Promise<any> => {
    const currentTime = Math.floor(Date.now() / 1000);
    const results = [];
    
    for (const orderNo of params.order_numbers) {
        try {
            let sql = "";
            let replacements: any = { order_no: orderNo, update_time: currentTime };
            
            switch (params.action) {
                case 'cancel':
                    sql = "UPDATE orders SET status = 5, cancel_reason = :reason, update_time = :update_time WHERE order_no = :order_no AND status IN (0, 1)";
                    replacements.reason = params.reason || '批量取消';
                    break;
                case 'update_status':
                    sql = "UPDATE orders SET status = :status, update_time = :update_time WHERE order_no = :order_no";
                    replacements.status = params.status;
                    break;
                case 'ship':
                    // 简化为状态更新，不涉及物流信息
                    sql = "UPDATE orders SET status = 2, business_status = 1, update_time = :update_time WHERE order_no = :order_no AND status = 1";
                    break;
                default:
                    results.push({ order_no: orderNo, status: 0, message: '不支持的操作类型' });
                    continue;
            }
            
            const [result] = await sequelize.query(sql, {
                replacements,
                type: QueryTypes.UPDATE
            });
            
            if (result && result > 0) {
                results.push({ order_no: orderNo, status: 1, message: '操作成功' });
            } else {
                results.push({ order_no: orderNo, status: 0, message: '订单状态不正确或不存在' });
            }
        } catch (error) {
            results.push({ order_no: orderNo, status: 0, message: error.message });
        }
    }
    
    return {
        success_count: results.filter(r => r.status === 1).length,
        fail_count: results.filter(r => r.status === 0).length,
        details: results
    };
};

// 导出订单数据
export const exportOrderData = async (params: ExportOrderParams): Promise<any> => {
    let whereConditions: string[] = ["o.status != 6"];
    let joins: string[] = [];
    let replacements: any = {};

    // 构建查询条件
    if (params.entity_id) {
        whereConditions.push("o.entity_id = :entity_id");
        replacements.entity_id = params.entity_id;
    }
    if (params.business_type) {
        whereConditions.push("o.business_type = :business_type");
        replacements.business_type = params.business_type;
    }
    if (params.status) {
        whereConditions.push("o.status = :status");
        replacements.status = params.status;
    }
    if (params.payment_status !== undefined) {
        whereConditions.push("o.payment_status = :payment_status");
        replacements.payment_status = params.payment_status;
    }
    if (params.start_date) {
        whereConditions.push("o.create_time >= :start_date");
        replacements.start_date = params.start_date;
    }
    if (params.end_date) {
        whereConditions.push("o.create_time <= :end_date");
        replacements.end_date = params.end_date;
    }
    if (params.order_number) {
        whereConditions.push("o.order_no LIKE :order_number");
        replacements.order_number = `%${params.order_number}%`;
    }
    if (params.username) {
        whereConditions.push("(JSON_EXTRACT(o.business_data, '$.username') LIKE :username OR o.entity_id = :entity_id)");
        replacements.username = `%${params.username}%`;
        const entityId = parseInt(params.username);
        replacements.entity_id = isNaN(entityId) ? 0 : entityId;
    }

    const whereClause = whereConditions.join(" AND ");
    const joinClause = joins.join(" ");
    
    const sql = `
        SELECT 
            o.order_no as '订单号',
            o.entity_id as '用户ID',
            JSON_EXTRACT(o.business_data, '$.username') as '用户名',
            o.business_type as '业务类型',
            o.business_title as '业务标题',
            o.original_price as '原价',
            o.discount_price as '优惠金额',
            o.actual_price as '实付金额',
            CASE o.status
                WHEN 1 THEN '待支付'
                WHEN 2 THEN '已支付'
                WHEN 3 THEN '已完成'
                WHEN 4 THEN '已取消'
                WHEN 5 THEN '已退款'
                ELSE '未知状态'
            END as '订单状态',
            CASE o.payment_status
                WHEN 0 THEN '未支付'
                WHEN 1 THEN '已支付'
                WHEN 2 THEN '支付失败'
                ELSE '未知'
            END as '支付状态',
            o.payment_method as '支付方式',
            o.payment_order_no as '支付订单号',
            o.remark as '订单备注',
            o.cancel_reason as '取消原因',
            o.refund_reason as '退款原因',
            o.refund_amount as '退款金额',
            FROM_UNIXTIME(o.create_time) as '下单时间',
            FROM_UNIXTIME(o.payment_time) as '支付时间',
            FROM_UNIXTIME(o.refund_time) as '退款时间',
            FROM_UNIXTIME(o.update_time) as '更新时间'
        FROM orders o 
        WHERE ${whereClause} 
        ORDER BY o.create_time DESC
    `;
    
    const result = await sequelize.query(sql, {
        replacements,
        type: QueryTypes.SELECT
    });
    
    return result;
};