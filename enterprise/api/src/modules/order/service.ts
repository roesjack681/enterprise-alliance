import { rpcPost } from "../../common/common";
import { redisPool } from "../../storage/redisPool";
import {
  OrderCreateModel,
  OrderModel,
  OrderQueryModel,
  OrderStatusUpdateModel,
  OrderLogModel
} from "./proto";

// 响应数据接口
interface ResponseData {
  msg: string;
  data: any;
}

// Token数据接口
interface TokenData {
  token: string;
  entity_id: number; // 用户ID（企业ID）
}

// 订单服务接口
export interface IOrderService<TokenData> {
  createOrder(data: OrderCreateModel): Promise<ResponseData>;
  confirmOrder(orderNo: string, paymentData: any): Promise<ResponseData>;
  getOrderDetail(id: number, entityId: number): Promise<ResponseData>;
  getOrderByNo(orderNo: string): Promise<ResponseData>;
  getOrderList(query: OrderQueryModel): Promise<ResponseData>;
  updateOrderStatus(data: OrderStatusUpdateModel): Promise<ResponseData>;
  cancelOrder(id: number, reason: string, entityId: number): Promise<ResponseData>;
  processPaymentSuccess(orderNo: string, paymentData: any): Promise<ResponseData>;
  createBusinessOrder(orderId: number): Promise<ResponseData>;
  getOrderLogs(orderId: number): Promise<ResponseData>;
  addOrderLog(log: OrderLogModel): Promise<ResponseData>;
  updateOrderPaymentMethod(orderNo: string, paymentMethod: string): Promise<ResponseData>;
  getProviderOrderStats(providerId: number): Promise<ResponseData>;
  getProviderOrderList(query: OrderQueryModel): Promise<ResponseData>;
}

// 订单服务实现
export class OrderService implements IOrderService<TokenData> {
  private tokenData: TokenData;

  constructor(tokenData: TokenData) {
    this.tokenData = tokenData;
  }

  /**
   * 创建订单 - 只缓存到Redis，不入库
   */
  async createOrder(data: OrderCreateModel): Promise<ResponseData> {
    const redis = await redisPool.acquire();

    try {
      // 生成唯一订单编号
      const orderNo = 'ORD' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();

      // 业务信息处理
      const businessId = data.business_id;
      const businessType = data.business_type || 'service';
      let businessTitle = data.business_title;
      let originalPrice = data.original_price;

      // 根据业务类型获取业务信息
      if (!businessTitle || !originalPrice) {
        const businessInfo = await this.getBusinessInfo(businessType, businessId);

        if (!businessInfo) {
          return { msg: "business_not_found", data: null };
        }
        businessTitle = businessTitle || businessInfo.title;
        originalPrice = originalPrice || businessInfo.price;
      }

      // 构建订单数据
      const currentTime = Date.now();
      const orderData = {
        order_no: orderNo,
        entity_id: this.tokenData.entity_id,
        business_type: businessType,
        business_id: businessId,
        business_title: businessTitle,
        business_data: data.business_data || null,
        provider_id: data.provider_id || null,
        original_price: originalPrice,
        discount_price: data.discount_price || 0,
        actual_price: data.actual_price,
        invoice_id: data.invoice_id || null,
        remark: data.remark || '',
        payment_method: null,
        status: 1,
        payment_status: 0,
        business_status: 0,
        create_time: Math.floor(currentTime / 1000),
        update_time: Math.floor(currentTime / 1000),
        expire_time: currentTime + (24 * 60 * 60 * 1000)
      };

      // 缓存订单数据到Redis
      const redisKey = `pending_order:${orderNo}`;
      await redis.setex(redisKey, 24 * 60 * 60, JSON.stringify(orderData));

      // 添加到待支付订单列表
      await redis.lpush("pending_orders", orderNo);

      return {
        msg: "ok",
        data: {
          order_no: orderNo,
          business_title: businessTitle,
          original_price: originalPrice,
          discount_price: data.discount_price || 0,
          actual_price: data.actual_price,
          expire_time: orderData.expire_time
        }
      };
    } catch (error: any) {
      return { msg: "server_error", data: null };
    } finally {
      await redisPool.release(redis);
    }
  }

  /**
   * 将订单数据存储到数据库（用于银行转账等长期订单）
   */
  private async storeOrderToDB(orderData: any): Promise<boolean> {
    try {
      const sql = "INSERT INTO orders (order_no, entity_id, business_type, business_id, business_title, business_data, original_price, discount_price, actual_price, invoice_id, remark, payment_method, status, payment_status, business_status, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const params = [
        orderData.order_no,
        orderData.entity_id,
        orderData.business_type,
        orderData.business_id,
        orderData.business_title,
        orderData.business_data ? JSON.stringify(orderData.business_data) : null,
        orderData.original_price,
        orderData.discount_price,
        orderData.actual_price,
        orderData.invoice_id,
        orderData.remark,
        orderData.payment_method,
        orderData.status,
        orderData.payment_status,
        orderData.business_status,
        orderData.create_time,
        orderData.update_time
      ];

      const result = await rpcPost("/insert", { sql, params }, this.tokenData.token);

      if (result && result.code === 0) {
        // 记录订单创建日志
        await this.addOrderLog({
          order_id: result.data.insertId,
          order_no: orderData.order_no,
          old_status: 0,
          new_status: 1,
          action_type: 'create',
          message: '订单创建成功（银行转账）',
          operator_id: orderData.entity_id,
          operator_type: 1,
          extra_data: { payment_method: orderData.payment_method }
        });

        return true;
      }

      return false;
    } catch (error: any) {
      console.error('存储订单到数据库失败:', error);
      return false;
    }
  }

  /**
   * 根据业务类型获取业务信息
   */
  private async getBusinessInfo(businessType: string, businessId: string): Promise<{ title: string; price: number } | null> {
    try {
      let sql = "";
      let titleField = "title";
      let priceField = "price";

      switch (businessType) {
        case 'service':
          sql = "SELECT title, price FROM service_products WHERE id = ? AND status = 2";
          break;
        case 'product':
          sql = "SELECT name as title, price FROM products WHERE id = ? AND status = 1";
          titleField = "name";
          break;
        case 'member':
          sql = "SELECT package_name as title, price FROM member_packages WHERE id = ? AND status = 1";
          titleField = "package_name";
          break;
        default:
          // 默认按服务处理
          sql = "SELECT title, price FROM service_products WHERE id = ? AND status = 1";
          break;
      }

      const result = await rpcPost("/select", { sql, params: [businessId] }, this.tokenData.token);
      if (result && result.code == 0) {
        const data = JSON.parse(result.data.result);
        if (data && data.length > 0) {
          return {
            title: data[0][titleField] || data[0].title,
            price: data[0][priceField] || data[0].price
          };
        }
      }

      return null;
    } catch (error: any) {
      console.error('获取业务信息失败:', error);
      return null;
    }
  }

  /**
   * 确认订单 - 支付成功后将Redis缓存数据写入数据库
   */
  async confirmOrder(orderNo: string, paymentData: any): Promise<ResponseData> {
    const redis = await redisPool.acquire();
    try {
      // 从Redis获取订单数据
      const redisKey = `pending_order:${orderNo}`;
      const orderDataStr = await redis.get(redisKey);

      if (!orderDataStr) {
        return { msg: "order_not_found", data: null };
      }

      const orderData = JSON.parse(orderDataStr);

      // 检查订单是否已过期
      if (Date.now() > orderData.expire_time) {
        await redis.del(redisKey);
        return { msg: "order_expired", data: null };
      }

      // 更新订单数据
      orderData.status = 2; // 已支付
      orderData.payment_status = 1; // 已支付
      orderData.payment_method = paymentData.payment_method || null;
      orderData.payment_order_no = paymentData.payment_order_no || null;
      orderData.payment_time = Math.floor(Date.now() / 1000);
      orderData.update_time = Math.floor(Date.now() / 1000);

      // 写入数据库
      const sql = "INSERT INTO orders (order_no, entity_id, business_type, business_id, business_title, business_data, original_price, discount_price, actual_price, invoice_id, remark, status, payment_status, payment_method, payment_time, payment_order_no, business_status, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const params = [
        orderData.order_no,
        orderData.entity_id,
        orderData.business_type,
        orderData.business_id,
        orderData.business_title,
        orderData.business_data ? JSON.stringify(orderData.business_data) : null,
        orderData.original_price,
        orderData.discount_price,
        orderData.actual_price,
        orderData.invoice_id,
        orderData.remark,
        orderData.status,
        orderData.payment_status,
        orderData.payment_method,
        orderData.payment_time,
        orderData.payment_order_no,
        orderData.business_status,
        orderData.create_time,
        orderData.update_time
      ];

      const result = await rpcPost("/insert", { sql, params }, this.tokenData.token);

      if (result && result.code === 0) {
        const orderId = result.data.insertId;

        // 记录订单日志
        await this.addOrderLog({
          order_id: orderId,
          order_no: orderNo,
          old_status: 1,
          new_status: 2,
          action_type: 'pay',
          message: '订单支付成功',
          operator_id: orderData.entity_id,
          operator_type: 1,
          extra_data: paymentData
        });

        // 删除Redis缓存
        await redis.del(redisKey);
        await redis.lrem("pending_orders", 0, orderNo);

        // 创建业务订单
        const businessResult = await this.createBusinessOrder(orderId);

        return {
          msg: "ok",
          data: {
            order_id: orderId,
            order_no: orderNo,
            business_order_created: businessResult.msg === 'ok',
            business_order_id: businessResult.data?.business_order_id
          }
        };
      } else {
        return { msg: "confirm_failed", data: null };
      }
    } catch (error: any) {
      console.error('确认订单失败:', error);
      return { msg: "server_error", data: null };
    } finally {
      await redisPool.release(redis);
    }
  }

  /**
   * 根据订单号获取订单信息（先从Redis查找，再从数据库查找）
   */
  async getOrderByNo(orderNo: string): Promise<ResponseData> {
    const redis = await redisPool.acquire();
    try {
      // 先从Redis查找待支付订单
      const redisKey = `pending_order:${orderNo}`;
      const orderDataStr = await redis.get(redisKey);

      if (orderDataStr) {
        const orderData = JSON.parse(orderDataStr);

        // 检查是否过期
        if (Date.now() > orderData.expire_time) {
          await redis.del(redisKey);
          // 从对应的列表中移除
          await redis.lrem("pending_orders", 0, orderNo);
          await redis.lrem("pending_transfer_orders", 0, orderNo);
          return { msg: "order_expired", data: null };
        }

        return { msg: "ok", data: orderData };
      }

      // 如果Redis中没有，再从数据库查找已确认订单
      const sql = "SELECT id, order_no, entity_id, business_type, business_id, business_title, business_data, original_price, discount_price, actual_price, invoice_id, remark, status, payment_status, payment_method, payment_time, payment_order_no, business_status, business_order_id, cancel_reason, refund_reason, refund_amount, refund_time, create_time, update_time FROM orders WHERE order_no = ?";
      const result = await rpcPost("/select", { sql, params: [orderNo] }, this.tokenData.token);

      if (result && result.code === 0) {
        const data = JSON.parse(result.data.result);
        if (data && data.length > 0) {
          const order = data[0];
          if (order.business_data) {
            try {
              order.business_data = JSON.parse(order.business_data);
            } catch (e) {
              // 忽略JSON解析错误
            }
          }
          return { msg: "ok", data: order };
        }
      }

      return { msg: "order_not_found", data: null };
    } catch (error: any) {
      console.error('获取订单失败:', error);
      return { msg: "server_error", data: null };
    } finally {
      await redisPool.release(redis);
    }
  }

  /**
   * 获取订单详情
   */
  async getOrderDetail(id: number, entityId: number): Promise<ResponseData> {
    try {
      const sql = "SELECT id, order_no, entity_id, business_type, business_id, business_title, business_data, original_price, discount_price, actual_price, invoice_id, remark, status, payment_status, payment_method, payment_time, payment_order_no, business_status, business_order_id, cancel_reason, refund_reason, refund_amount, refund_time, create_time, update_time FROM orders WHERE id = ? AND entity_id = ?";
      const params = [id, entityId];
      const result = await rpcPost("/select", { sql, params }, this.tokenData.token);

      if (result && result.code === 0) {
        const data = JSON.parse(result.data.result);
        if (data && data.length > 0) {
          return { msg: "ok", data: data[0] };
        } else {
          return { msg: "not_found", data: null };
        }
      } else {
        return { msg: "query_failed", data: null };
      }
    } catch (error: any) {
      console.error('获取订单详情失败:', error);
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 从Redis获取待付款订单列表
   */
  private async getPendingOrdersFromRedis(entityId: number): Promise<any[]> {
    const redis = await redisPool.acquire();
    try {
      const pendingOrders: any[] = [];
      const validOrderNos: string[] = []; // 用于重建列表的有效订单号

      // 获取所有待支付订单号
      const orderNos = await redis.lrange("pending_orders", 0, -1);
      const transferOrderNos = await redis.lrange("pending_transfer_orders", 0, -1);
      const allPendingOrderNos = [...orderNos, ...transferOrderNos];

      // 获取每个订单的详细信息
      for (const orderNo of allPendingOrderNos) {
        const redisKey = `pending_order:${orderNo}`;
        const orderDataStr = await redis.get(redisKey);

        if (orderDataStr) {
          const orderData = JSON.parse(orderDataStr);

          // 检查是否过期 - 延长过期时间到48小时，给用户更多时间
          const extendedExpireTime = orderData.expire_time + (24 * 60 * 60 * 1000); // 延长24小时
          if (Date.now() > extendedExpireTime) {
            // 清理过期订单
            await redis.del(redisKey);
            continue; // 不添加到有效订单列表
          }

          // 添加到有效订单列表
          validOrderNos.push(orderNo);

          // 只返回属于当前用户的订单
          if (orderData.entity_id === entityId) {
            // 转换为与数据库一致的格式
            pendingOrders.push({
              id: null, // Redis中的订单还没有数据库ID
              order_no: orderData.order_no,
              entity_id: orderData.entity_id,
              business_type: orderData.business_type,
              business_id: orderData.business_id,
              business_title: orderData.business_title,
              business_data: orderData.business_data,
              original_price: orderData.original_price,
              discount_price: orderData.discount_price,
              actual_price: orderData.actual_price,
              invoice_id: orderData.invoice_id,
              remark: orderData.remark,
              status: orderData.status,
              payment_status: orderData.payment_status,
              payment_method: orderData.payment_method,
              payment_time: null,
              payment_order_no: null,
              business_status: orderData.business_status,
              business_order_id: null,
              cancel_reason: null,
              refund_reason: null,
              refund_amount: null,
              refund_time: null,
              create_time: orderData.create_time,
              update_time: orderData.update_time,
              expire_time: orderData.expire_time // Redis特有字段
            });
          }
        } else {
          // 订单数据不存在，说明已过期被清理，跳过
          continue;
        }
      }

      // 清理过期订单，但不重建列表（避免重复数据）
      for (const orderNo of allPendingOrderNos) {
        if (!validOrderNos.includes(orderNo)) {
          // 从列表中移除过期订单
          await redis.lrem("pending_orders", 0, orderNo);
          await redis.lrem("pending_transfer_orders", 0, orderNo);
        }
      }

      return pendingOrders;
    } catch (error: any) {
      console.error('从Redis获取待付款订单失败:', error);
      return [];
    } finally {
      await redisPool.release(redis);
    }
  }

  /**
   * 获取订单列表
   */
  async getOrderList(query: OrderQueryModel): Promise<ResponseData> {
    try {
      const page = query.page || 1;
      const pageSize = query.page_size || 10;
      const offset = (page - 1) * pageSize;

      let allOrders: any[] = [];

      // 判断是否需要从Redis获取待付款订单
      const needPendingOrders = query.status === undefined || query.status === 1;

      if (needPendingOrders) {
        // 从Redis获取待付款订单
        const pendingOrders = await this.getPendingOrdersFromRedis(this.tokenData.entity_id);

        // 过滤待付款订单
        const filteredPendingOrders = pendingOrders.filter(order => {
          // 应用查询条件过滤
          if (query.business_type && order.business_type !== query.business_type) return false;
          if (query.business_id && order.business_id !== query.business_id) return false;
          if (query.payment_status !== undefined && order.payment_status !== query.payment_status) return false;
          if (query.business_status !== undefined && order.business_status !== query.business_status) return false;
          if (query.start_date && order.create_time < query.start_date) return false;
          if (query.end_date && order.create_time > query.end_date) return false;

          return true;
        });

        allOrders = [...filteredPendingOrders];
      }

      // 从数据库获取其他状态的订单
      let whereConditions = ["entity_id = ?"];
      let queryParams: any[] = [this.tokenData.entity_id];

      // 如果查询特定状态且不是待付款，或者没有指定状态时排除待付款
      if (query.status !== undefined && query.status !== 1) {
        whereConditions.push("status = ?");
        queryParams.push(query.status);
      } else if (query.status === undefined) {
        // 没有指定状态时，排除待付款状态（因为已从Redis获取）
        whereConditions.push("status != ?");
        queryParams.push(1);
      }

      if (query.business_type) {
        whereConditions.push("business_type = ?");
        queryParams.push(query.business_type);
      }

      if (query.business_id) {
        whereConditions.push("business_id = ?");
        queryParams.push(query.business_id);
      }

      if (query.payment_status !== undefined) {
        whereConditions.push("payment_status = ?");
        queryParams.push(query.payment_status);
      }

      if (query.business_status !== undefined) {
        whereConditions.push("business_status = ?");
        queryParams.push(query.business_status);
      }

      if (query.start_date) {
        whereConditions.push("create_time >= ?");
        queryParams.push(query.start_date);
      }

      if (query.end_date) {
        whereConditions.push("create_time <= ?");
        queryParams.push(query.end_date);
      }

      // 只有在需要查询数据库时才执行查询
      if (query.status === undefined || query.status !== 1) {
        const whereClause = whereConditions.join(" AND ");

        // 获取数据库中的订单数据
        const listSql = `SELECT id, order_no, entity_id, business_type, business_id, business_title, business_data, original_price, discount_price, actual_price, invoice_id, remark, status, payment_status, payment_method, payment_time, payment_order_no, business_status, business_order_id, cancel_reason, refund_reason, refund_amount, refund_time, create_time, update_time FROM orders WHERE ${whereClause} ORDER BY create_time DESC`;
        const listResult = await rpcPost("/select", { sql: listSql, params: queryParams }, this.tokenData.token);

        if (listResult && listResult.code === 0) {
          const dbOrders = JSON.parse(listResult.data.result);
          // 处理business_data JSON字段
          if (dbOrders && dbOrders.length > 0) {
            dbOrders.forEach((order: any) => {
              if (order.business_data) {
                try {
                  order.business_data = JSON.parse(order.business_data);
                } catch (e) {
                  // 忽略JSON解析错误
                }
              }
            });
          }

          // 合并Redis和数据库的订单
          allOrders = [...allOrders, ...(dbOrders || [])];
        }
      }

      // 按创建时间降序排序
      allOrders.sort((a, b) => b.create_time - a.create_time);

      // 计算总数
      const total = allOrders.length;

      // 分页处理
      const paginatedOrders = allOrders.slice(offset, offset + pageSize);

      return {
        msg: "ok",
        data: {
          list: paginatedOrders,
          total,
          page,
          page_size: pageSize
        }
      };
    } catch (error: any) {
      console.error('获取订单列表失败:', error);
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新订单状态
   */
  async updateOrderStatus(data: OrderStatusUpdateModel): Promise<ResponseData> {
    try {
      // 获取当前订单状态
      const getCurrentSql = "SELECT status, order_no FROM orders WHERE id = ? AND entity_id = ?";
      const currentResult = await rpcPost("/select", {
        sql: getCurrentSql,
        params: [data.id, this.tokenData.entity_id]
      }, this.tokenData.token);

      if (!currentResult || currentResult.code !== 0) {
        return { msg: "order_not_found", data: null };
      }

      const currentData = JSON.parse(currentResult.data.result);
      if (!currentData || currentData.length === 0) {
        return { msg: "order_not_found", data: null };
      }

      const currentOrder = currentData[0];
      const oldStatus = currentOrder.status;

      // 构建更新字段
      const currentTime = Math.floor(Date.now() / 1000);
      let updateFields = ["status = ?", "update_time = ?"];
      let updateValues: any[] = [data.status, currentTime];

      if (data.payment_status !== undefined) {
        updateFields.push("payment_status = ?");
        updateValues.push(data.payment_status);
      }

      if (data.payment_method) {
        updateFields.push("payment_method = ?");
        updateValues.push(data.payment_method);
      }

      if (data.payment_order_no) {
        updateFields.push("payment_order_no = ?");
        updateValues.push(data.payment_order_no);
      }

      if (data.status === 2 && data.payment_status === 1) { // 已支付
        updateFields.push("payment_time = ?");
        updateValues.push(currentTime);
      }

      if (data.cancel_reason) {
        updateFields.push("cancel_reason = ?");
        updateValues.push(data.cancel_reason);
      }

      if (data.refund_reason) {
        updateFields.push("refund_reason = ?");
        updateValues.push(data.refund_reason);
      }

      if (data.refund_amount !== undefined) {
        updateFields.push("refund_amount = ?");
        updateValues.push(data.refund_amount);
        if (data.status === 5) { // 已退款
          updateFields.push("refund_time = ?");
          updateValues.push(currentTime);
        }
      }

      updateValues.push(data.id, this.tokenData.entity_id);

      const sql = `UPDATE orders SET ${updateFields.join(", ")} WHERE id = ? AND entity_id = ?`;
      const result = await rpcPost("/update", { sql, params: updateValues }, this.tokenData.token);

      if (result && result.code === 0) {
        // 记录状态变更日志
        let actionType = 'update';
        let message = '订单状态更新';

        if (data.status === 2) {
          actionType = 'pay';
          message = '订单支付成功';
        } else if (data.status === 3) {
          actionType = 'complete';
          message = '订单完成';
        } else if (data.status === 4) {
          actionType = 'cancel';
          message = '订单取消';
        } else if (data.status === 5) {
          actionType = 'refund';
          message = '订单退款';
        }

        await this.addOrderLog({
          order_id: data.id,
          order_no: currentOrder.order_no,
          old_status: oldStatus,
          new_status: data.status,
          action_type: actionType,
          message: message,
          operator_id: this.tokenData.entity_id,
          operator_type: 1,
          extra_data: data
        });

        return { msg: "ok", data: { updated: true } };
      } else {
        return { msg: "update_failed", data: null };
      }
    } catch (error: any) {
      console.error('更新订单状态失败:', error);
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 取消订单
   */
  async cancelOrder(id: number, reason: string, entityId: number): Promise<ResponseData> {
    try {
      return await this.updateOrderStatus({
        id,
        status: 4, // 已取消
        cancel_reason: reason
      });
    } catch (error: any) {
      console.error('取消订单失败:', error);
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 处理支付成功
   */
  async processPaymentSuccess(orderNo: string, paymentData: any): Promise<ResponseData> {
    try {
      // 根据订单号获取订单信息
      const sql = "SELECT id, order_no, entity_id, business_type, business_id, business_title, business_data, original_price, discount_price, actual_price, invoice_id, remark, status, payment_status, payment_method, payment_time, payment_order_no, business_status, business_order_id, cancel_reason, refund_reason, refund_amount, refund_time, create_time, update_time FROM orders WHERE order_no = ?";
      const result = await rpcPost("/select", { sql, params: [orderNo] }, this.tokenData.token);

      if (!result || result.code !== 0) {
        return { msg: "order_not_found", data: null };
      }

      const orderData = JSON.parse(result.data.result);
      if (!orderData || orderData.length === 0) {
        return { msg: "order_not_found", data: null };
      }

      const order = orderData[0];

      // 更新支付状态
      const updateResult = await this.updateOrderStatus({
        id: order.id,
        status: 2, // 已支付
        payment_status: 1, // 已支付
        payment_method: paymentData.payment_method,
        payment_order_no: paymentData.payment_order_no
      });

      if (updateResult.msg !== 'ok') {
        return updateResult;
      }

      // 创建业务订单
      const businessResult = await this.createBusinessOrder(order.id);

      return {
        msg: "ok",
        data: {
          order_id: order.id,
          business_order_created: businessResult.msg === 'ok',
          business_order_id: businessResult.data?.business_order_id
        }
      };
    } catch (error: any) {
      console.error('处理支付成功失败:', error);
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 创建业务订单 - 简化版本，根据业务类型创建对应订单
   */
  async createBusinessOrder(orderId: number): Promise<ResponseData> {
    try {
      // 获取订单信息
      const orderResult = await this.getOrderDetail(orderId, this.tokenData.entity_id);
      if (orderResult.msg !== 'ok') {
        return { msg: "order_not_found", data: null };
      }

      const order = orderResult.data;

      // 检查是否已创建业务订单
      if (order.business_status === 1) {
        return { msg: "business_order_already_created", data: { business_order_id: order.business_order_id } };
      }

      let businessOrderId = null;

      // 根据业务类型创建相应的业务订单
      switch (order.business_type) {
        case 'service':
          businessOrderId = await this.createServiceOrder(order);
          break;
        case 'product':
          businessOrderId = await this.createProductOrder(order);
          break;
        case 'member':
          businessOrderId = await this.createMemberOrder(order);
          break;
        default:
          return { msg: "unsupported_business_type", data: null };
      }

      if (!businessOrderId) {
        return { msg: "business_order_create_failed", data: null };
      }

      // 更新订单的业务处理状态
      await this.updateOrderStatus({
        id: orderId,
        business_status: 1,
        business_order_id: businessOrderId
      });

      return { msg: "ok", data: { business_order_id: businessOrderId } };
    } catch (error: any) {
      console.error('创建业务订单失败:', error);
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 创建服务订单
   */
  private async createServiceOrder(order: any): Promise<string | null> {
    try {
      const serviceOrderId = `SF_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const businessData = order.business_data || {};
      const currentTime = Date.now();

      // 从服务产品表查询服务信息
      const serviceInfoSql = "SELECT title FROM service_products WHERE id = ? AND status = 2";
      const serviceResult = await rpcPost("mysql", {
        method: "select",
        sql: serviceInfoSql,
        values: [order.business_id]
      });

      let serviceTitle = '未知服务';
      if (serviceResult && serviceResult.data && serviceResult.data.length > 0) {
        serviceTitle = serviceResult.data[0].title;
      }

      // 获取服务的流程模板
      const templateResult = await this.getProcessTemplate(String(order.business_id));
      let template = null;
      let currentStep = '订单确认';

      if (templateResult.msg === "OK" && templateResult.data) {
        template = templateResult.data;
        currentStep = template.steps && template.steps.length > 0 ? template.steps[0].step : '订单确认';
      }

      const sql = "INSERT INTO service_order (order_id, user_id, service_id, title, service_type, status, current_step, start_date, end_date, cycle_months, price, remarks, create_time, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const params = [
        serviceOrderId,
        order.entity_id.toString(),
        order.business_id,
        serviceTitle, // 服务名称
        businessData.service_type || 'one_time',
        'Pending',
        currentStep,
        businessData.start_date || currentTime,
        businessData.end_date || null,
        businessData.cycle_months || null,
        order.actual_price,
        order.remark || '',
        currentTime,
        currentTime
      ];

      const result = await rpcPost("/insert", { sql, params }, this.tokenData.token);

      if (result && result.code === 0) {
        // 如果有流程模板，创建流程实例
        if (template) {
          await this.createProcessInstance(serviceOrderId, template, currentTime);
        }

        return serviceOrderId;
      }

      return null;
    } catch (error: any) {
      console.error('创建服务订单失败:', error);
      return null;
    }
  }

  /**
   * 获取流程模板
   */
  private async getProcessTemplate(serviceId: string): Promise<ResponseData> {
    try {
      const result = await rpcPost("process_template_query", [{ service_id: serviceId }]);
      if (result.success && result.data.length > 0) {
        return { msg: "ok", data: result.data[0] };
      }
      return { msg: "template_not_found", data: null };
    } catch (error) {
      console.error("获取流程模板异常:", error);
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 创建流程实例
   */
  private async createProcessInstance(orderId: string, template: any, currentTime: number): Promise<boolean> {
    try {
      const instanceId = `INS${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // 解析模板步骤
      let steps: any[] = [];
      try {
        if (typeof template.steps_json === 'string') {
          steps = JSON.parse(template.steps_json);
        } else if (Array.isArray(template.steps_json)) {
          steps = template.steps_json;
        } else if (template.steps && Array.isArray(template.steps)) {
          steps = template.steps;
        } else if (template.steps_json && typeof template.steps_json === 'object') {
          steps = template.steps_json.steps || [template.steps_json];
        } else {
          steps = [{ step: '订单确认', sequence: 1 }];
        }
      } catch (parseError) {
        steps = [{ step: '订单确认', sequence: 1 }];
      }

      const firstStep = steps && steps.length > 0 ? steps[0] : { step: '订单确认', sequence: 1 };

      const processInstance = {
        instance_id: instanceId,
        order_id: orderId,
        template_id: template.template_id,
        current_step: firstStep.step,
        current_sequence: firstStep.sequence || 1,
        status: 'NotStarted',
        step_history: JSON.stringify([{
          step: firstStep.step,
          sequence: firstStep.sequence || 1,
          status: 'Pending',
          start_time: currentTime
        }]),
        create_time: currentTime,
        update_time: currentTime
      };

      const instanceResult = await rpcPost("process_instance_add", [processInstance]);
      if (instanceResult.success) {
        return true;
      } else {
        console.error('流程实例创建失败:', instanceResult);
        return false;
      }
    } catch (error) {
      console.error("创建流程实例异常:", error);
      return false;
    }
  }

  /**
   * 创建产品订单 - 占位方法，可根据实际需求实现
   */
  private async createProductOrder(order: any): Promise<string | null> {
    // 这里可以实现产品订单创建逻辑
    return `PROD_${Date.now()}`;
  }

  /**
   * 创建会员订单 - 占位方法，可根据实际需求实现
   */
  private async createMemberOrder(order: any): Promise<string | null> {
    // 这里可以实现会员订单创建逻辑
    return `MEM_${Date.now()}`;
  }

  /**
   * 获取订单日志
   */
  async getOrderLogs(orderId: number): Promise<ResponseData> {
    try {
      const sql = "SELECT id, order_id, order_no, old_status, new_status, action_type, message, operator_id, operator_type, extra_data, create_time FROM order_logs WHERE order_id = ? ORDER BY create_time ASC";
      const params = [orderId];
      const result = await rpcPost("/select", { sql, params }, this.tokenData.token);

      if (result && result.code === 0) {
        const data = JSON.parse(result.data.result);
        return { msg: "ok", data: data || [] };
      } else {
        return { msg: "query_failed", data: null };
      }
    } catch (error: any) {
      console.error('获取订单日志失败:', error);
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 添加订单日志
   */
  async addOrderLog(log: OrderLogModel): Promise<ResponseData> {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const sql = "INSERT INTO order_logs (order_id, order_no, old_status, new_status, action_type, message, operator_id, operator_type, extra_data, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const params = [
        log.order_id,
        log.order_no,
        log.old_status || null,
        log.new_status,
        log.action_type,
        log.message || '',
        log.operator_id || null,
        log.operator_type || 1,
        log.extra_data ? JSON.stringify(log.extra_data) : null,
        currentTime
      ];

      const result = await rpcPost("/insert", { sql, params }, this.tokenData.token);

      if (result && result.code === 0) {
        return { msg: "ok", data: { log_id: result.data.insertId } };
      } else {
        return { msg: "insert_failed", data: null };
      }
    } catch (error: any) {
      console.error('添加订单日志失败:', error);
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新订单支付方式（调整Redis缓存过期时间，银行转账不存数据库）
   */
  async updateOrderPaymentMethod(orderNo: string, paymentMethod: string): Promise<ResponseData> {
    const redis = await redisPool.acquire();
    try {
      // 先从Redis获取订单数据
      const redisKey = `pending_order:${orderNo}`;
      const orderDataStr = await redis.get(redisKey);

      if (!orderDataStr) {
        return { msg: "order_not_found", data: null };
      }

      const orderData = JSON.parse(orderDataStr);

      // 检查是否过期
      if (Date.now() > orderData.expire_time) {
        await redis.del(redisKey);
        await redis.lrem("pending_orders", 0, orderNo);
        return { msg: "order_expired", data: null };
      }

      // 根据新的支付方式调整缓存过期时间
      let expireMinutes: number;

      switch (paymentMethod) {
        case 'wechat':
        case 'alipay':
          expireMinutes = 24 * 60; // 在线支付24小时过期
          break;
        case 'bank_transfer':
          expireMinutes = 24 * 60 * 3; // 银行转账3天过期
          break;
        default:
          expireMinutes = 24 * 60; // 默认24小时过期
          break;
      }

      // 更新订单数据
      orderData.payment_method = paymentMethod;
      orderData.expire_time = Date.now() + (expireMinutes * 60 * 1000);
      orderData.update_time = Math.floor(Date.now() / 1000);

      // 更新Redis缓存过期时间
      await redis.setex(redisKey, expireMinutes * 60, JSON.stringify(orderData));

      // 移动到对应的订单列表
      await redis.lrem("pending_orders", 0, orderNo);
      await redis.lrem("pending_transfer_orders", 0, orderNo);

      const listKey = paymentMethod === 'bank_transfer' ? "pending_transfer_orders" : "pending_orders";
      await redis.lpush(listKey, orderNo);

      return {
        msg: "ok",
        data: {
          order_no: orderNo,
          payment_method: paymentMethod,
          expire_time: orderData.expire_time
        }
      };
    } catch (error: any) {
      console.error('更新订单支付方式失败:', error);
      return { msg: "server_error", data: null };
    } finally {
      await redisPool.release(redis);
    }
  }

  /**
   * 获取服务商订单统计数据
   */
  async getProviderOrderStats(providerId: number): Promise<ResponseData> {
    try {
      // 首先获取服务商的所有服务产品ID
      const productSql = "SELECT id FROM service_products WHERE entity_id = ?";
      const productResult = await rpcPost('/select', {
        sql: productSql,
        params: [providerId]
      });

      if (productResult.code !== 0) {
        return { msg: "db_error", data: null };
      }

      const products = productResult.data?.result ? JSON.parse(productResult.data.result) : [];
      const productIds = products.map((p: any) => p.id.toString()); // 转换为字符串类型

      // 如果没有服务产品，返回空统计
      if (productIds.length === 0) {
        return {
          msg: "ok",
          data: {
            total_orders: 0,
            active_services: 0,
            pending_payment: 0,
            completed_orders: 0,
            total_products: 0,
            pending_renewal: 0,
            monthly_income: '0.00',
            rating: '98%'
          }
        };
      }

      // 构建IN查询的占位符
      const placeholders = productIds.map(() => '?').join(',');

      // 统计订单数据 - 使用简化的SQL语法
      const statsSql = `SELECT COUNT(id) as total_orders FROM orders WHERE business_type = 'service' AND business_id IN (${placeholders})`;

      // 执行总订单数查询
      const totalResult = await rpcPost('/select', {
        sql: statsSql,
        params: productIds
      });

      if (totalResult.msg !== "OK" || !totalResult.data?.result) {
        return { msg: "db_error", data: null };
      }
      const totalStats = JSON.parse(totalResult.data.result)[0] || {};
      const totalOrders = parseInt(totalStats.total_orders) || 0;

      // 分别查询各种状态的订单数量
      let pendingOrders = 0, paidOrders = 0, completedOrders = 0, monthlyIncome = 0;

      if (totalOrders > 0) {
        // 查询待付款订单
        const pendingSql = `SELECT COUNT(id) as count FROM orders WHERE business_type = 'service' AND business_id IN (${placeholders}) AND status = 1`;
        const pendingResult = await rpcPost('/select', {
          sql: pendingSql,
          params: productIds
        });
        if (pendingResult.msg === "OK" && pendingResult.data?.result) {
          pendingOrders = parseInt(JSON.parse(pendingResult.data.result)[0]?.count) || 0;
        }

        // 查询已付款订单
        const paidSql = `SELECT COUNT(id) as count FROM orders WHERE business_type = 'service' AND business_id IN (${placeholders}) AND status = 2`;
        const paidResult = await rpcPost('/select', {
          sql: paidSql,
          params: productIds
        });
        if (paidResult.msg === "OK" && paidResult.data?.result) {
          paidOrders = parseInt(JSON.parse(paidResult.data.result)[0]?.count) || 0;
        }

        // 查询已完成订单
        const completedSql = `SELECT COUNT(id) as count FROM orders WHERE business_type = 'service' AND business_id IN (${placeholders}) AND status = 3`;
        const completedResult = await rpcPost('/select', {
          sql: completedSql,
          params: productIds
        });
        if (completedResult.msg === "OK" && completedResult.data?.result) {
          completedOrders = parseInt(JSON.parse(completedResult.data.result)[0]?.count) || 0;
        }

        // 查询本月收入（只计算已完成的订单）
        const incomeSql = `SELECT SUM(actual_price) as income FROM orders WHERE business_type = 'service' AND business_id IN (${placeholders}) AND status = 3 AND update_time >= ? AND update_time <= ?`;
        const currentDate = new Date();
        const firstDayOfMonth = Math.floor(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime() / 1000);
        const lastDayOfMonth = Math.floor(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).getTime() / 1000);

        const incomeResult = await rpcPost('/select', {
          sql: incomeSql,
          params: [...productIds, firstDayOfMonth, lastDayOfMonth]
        });
        if (incomeResult.msg === "OK" && incomeResult.data?.result) {
          monthlyIncome = parseFloat(JSON.parse(incomeResult.data.result)[0]?.income) || 0;
        }
      }

      // 直接使用已获取的产品数量
      const totalProducts = productIds.length;


      return {
        msg: "ok",
        data: {
          total_orders: totalOrders,
          active_services: paidOrders, // 服务中订单（已付款但未完成）
          pending_payment: pendingOrders,
          completed_orders: completedOrders,
          total_products: totalProducts,
          pending_renewal: 0, // 暂时设为0，后续可根据业务需求计算
          monthly_income: monthlyIncome.toFixed(2),
          rating: '98%' // 默认好评率，后续可根据实际评价计算
        }
      };
    } catch (error: any) {
      console.error('获取服务商订单统计失败:', error);
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取服务商订单列表（优化版：直接使用 provider_id 查询）
   */
  async getProviderOrderList(query: OrderQueryModel): Promise<ResponseData> {
    try {
      const page = query.page || 1;
      const pageSize = query.page_size || 10;
      const offset = (page - 1) * pageSize;

      const providerId = query.provider_id || this.tokenData.entity_id;

      // 构建查询条件 - 优先使用 provider_id 直接查询
      let whereConditions = ['provider_id = ?'];
      let queryParams: any[] = [providerId];

      if (query.status !== undefined && query.status !== null && query.status.toString() !== 'null') {
        whereConditions.push("status = ?");
        queryParams.push(parseInt(query.status.toString()));
      }

      if (query.start_date) {
        whereConditions.push("create_time >= ?");
        queryParams.push(parseInt(query.start_date.toString()));
      }

      if (query.end_date) {
        whereConditions.push("create_time <= ?");
        queryParams.push(parseInt(query.end_date.toString()));
      }

      const whereClause = whereConditions.join(" AND ");

      // 查询总数
      const countSql = `SELECT COUNT(id) as total FROM orders WHERE ${whereClause}`;

      const countResult = await rpcPost('/select', {
        sql: countSql,
        params: queryParams
      });

      if (countResult.msg !== "OK" || !countResult.data?.result) {
        return { msg: "db_error", data: null };
      }

      let totalCount = 0;
      try {
        const countData = JSON.parse(countResult.data.result);
        totalCount = countData && countData[0] ? parseInt(countData[0].total) || 0 : 0;
      } catch (error) {
        console.error('解析订单总数失败:', error);
        totalCount = 0;
      }

      // 查询订单列表 - 包含 provider_id 字段
      const listSql = offset > 0
        ? `SELECT id, order_no, entity_id, business_id, business_type, provider_id, status, actual_price, create_time, update_time FROM orders WHERE ${whereClause} ORDER BY create_time DESC LIMIT ${offset}, ${pageSize}`
        : `SELECT id, order_no, entity_id, business_id, business_type, provider_id, status, actual_price, create_time, update_time FROM orders WHERE ${whereClause} ORDER BY create_time DESC LIMIT ${pageSize}`;

      const listResult = await rpcPost('/select', {
        sql: listSql,
        params: queryParams
      });

      if (listResult.msg !== "OK" || !listResult.data?.result) {
        return { msg: "db_error", data: null };
      }

      let orders = [];
      try {
        orders = JSON.parse(listResult.data.result) || [];
      } catch (error) {
        console.error('解析订单数据失败:', error);
        return { msg: "server_error", data: null };
      }

      // 如果没有订单数据，直接返回空列表
      if (!orders || orders.length === 0) {
        return {
          msg: "ok",
          data: {
            list: [],
            total: totalCount,
            page: page,
            page_size: pageSize,
            total_pages: Math.ceil(totalCount / pageSize)
          }
        };
      }

      // 分别获取客户信息和服务信息
      const processedOrders = await Promise.all(orders.map(async (order: any, index: number) => {
        // 获取客户信息
        let customerInfo = { nickname: '客户', avatar: '', mobile: '' };
        if (order.entity_id) {
          try {
            const customerSql = `SELECT nickname, avatar, mobile FROM entities WHERE id = ?`;
            const customerResult = await rpcPost('/select', {
              sql: customerSql,
              params: [order.entity_id]
            });

            if (customerResult.msg === "OK" && customerResult.data?.result) {
              try {
                const customerData = JSON.parse(customerResult.data.result);
                if (customerData && customerData.length > 0) {
                  customerInfo = customerData[0];
                }
              } catch (parseError) {
                console.error('解析客户数据失败:', parseError);
              }
            }
          } catch (error) {
            console.error('获取客户信息失败:', error);
          }
        }

        // 获取服务信息
        let serviceInfo = { title: order.business_type || '服务', price: '0' };
        if (order.business_id && order.business_type === 'service') {
          try {
            const serviceSql = `SELECT title, price FROM service_products WHERE id = ?`;
            const serviceResult = await rpcPost('/select', {
              sql: serviceSql,
              params: [order.business_id]
            });

            if (serviceResult.msg === "OK" && serviceResult.data?.result) {
              try {
                const serviceData = JSON.parse(serviceResult.data.result);
                if (serviceData && serviceData.length > 0) {
                  serviceInfo = serviceData[0];
                }
              } catch (parseError) {
                console.error('解析服务数据失败:', parseError);
              }
            }
          } catch (error) {
            console.error('获取服务信息失败:', error);
          }
        }

        // 查询关联的service_order (如果存在)
        let serviceOrderId = null;
        try {
          console.log(`🔍 [订单${order.id}] 开始查询关联的 service_order`);
          console.log(`  - entity_id: ${order.entity_id}`);
          console.log(`  - service_title: ${serviceInfo.title}`);

          const serviceOrderSql = `SELECT order_id FROM service_order WHERE user_id = ? AND title = ? ORDER BY create_time DESC LIMIT 1`;
          const serviceOrderResult = await rpcPost('/select', {
            sql: serviceOrderSql,
            params: [order.entity_id, serviceInfo.title]
          });

          console.log(`  - RPC返回结果:`, serviceOrderResult);

          if (serviceOrderResult.msg === "OK" && serviceOrderResult.data?.result) {
            try {
              const serviceOrderData = JSON.parse(serviceOrderResult.data.result);
              console.log(`  - 解析后的数据:`, serviceOrderData);

              if (serviceOrderData && serviceOrderData.length > 0) {
                serviceOrderId = serviceOrderData[0].order_id;
                console.log(`  ✅ 找到关联的 service_order_id: ${serviceOrderId}`);
              } else {
                console.log(`  ⚠️ 未找到匹配的 service_order`);
              }
            } catch (parseError) {
              console.error('  ❌ 解析服务订单数据失败:', parseError);
            }
          } else {
            console.log(`  ⚠️ service_order 查询返回空结果`);
          }
        } catch (error) {
          console.error('  ❌ 查询服务订单失败:', error);
        }

        return {
          ...order,
          amount: order.actual_price ? parseFloat(order.actual_price.toString()).toFixed(2) : '0.00',
          status_text: this.getOrderStatusText(order.status),
          create_time_text: new Date(order.create_time * 1000).toLocaleString('zh-CN'),
          update_time_text: order.update_time ? new Date(order.update_time * 1000).toLocaleString('zh-CN') : '',
          customer_name: customerInfo.nickname || '客户',
          customer_avatar: customerInfo.avatar || '',
          customer_mobile: customerInfo.mobile || '',
          customer_mobile_masked: customerInfo.mobile ? this.maskPhoneNumber(customerInfo.mobile) : '',
          service_title: serviceInfo.title || order.business_type || '服务',
          service_price: serviceInfo.price || '0',
          service_order_id: serviceOrderId // 添加服务订单ID用于服务跟踪
        };
      }));

      return {
        msg: "ok",
        data: {
          list: processedOrders,
          total: totalCount,
          page: page,
          page_size: pageSize,
          total_pages: Math.ceil(totalCount / pageSize)
        }
      };
    } catch (error: any) {
      console.error('获取服务商订单列表失败 - 详细错误:', error);
      console.error('错误堆栈:', error.stack);
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取订单状态文本
   */
  private getOrderStatusText(status: number): string {
    const statusMap: { [key: number]: string } = {
      1: '待付款',
      2: '已付款',
      3: '已完成',
      4: '已取消',
      5: '已退款'
    };
    return statusMap[status] || '未知状态';
  }

  /**
   * 掩码手机号
   */
  private maskPhoneNumber(phone: string): string {
    if (!phone || phone.length < 7) return phone;
    return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
  }
} 