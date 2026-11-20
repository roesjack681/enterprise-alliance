import axios from "axios";
import { httpGet, httpPost } from "../../common/common";
import { redisPool } from '../../storage/redisPool';
import { config } from "../../config/config";
import { OrderService } from "../order/service";
import { v4 as uuidv4 } from "uuid";
import { decodeJWT } from "../../common/common";
import crypto from "crypto";
import {
  ResponseData,
  WxPayTokenData,
  UnifiedOrderResponse,
  WxPaymentCallbackData,
  PaymentQueryResult,
  ManualCheckPaymentParams,
  ManualCheckPaymentResponse,
  FailedPaymentCallbackData,
  WxAccessTokenResponse,
  WxSessionResponse,
  WxPayV2UnifiedOrderData,
  WxPayV2UnifiedOrderResponse,
  WxPayV2QueryData,
  WxPayV2QueryResponse
} from "./protos";

// ======================== 微信服务相关 ========================

// Helper function to create order service instance
const createOrderService = async (token: string) => {
  const userInfo = await decodeJWT(token);
  return new OrderService({ 
    entity_id: userInfo?.id || 0,
    token: token
  });
};

// ======================== 微信支付V2工具函数 ========================

/**
 * 生成微信支付V2签名
 */
const generateWxPayV2Sign = (data: Record<string, any>): string => {
  // 1. 过滤掉空值和sign字段
  const filteredData: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null && key !== 'sign') {
      filteredData[key] = String(value);
    }
  });
  
  // 2. 按照ASCII码从小到大排序
  const sortedKeys = Object.keys(filteredData).sort();
  
  // 3. 构造待签名字符串
  const pairs: string[] = [];
  sortedKeys.forEach(key => {
    const value = filteredData[key];
    pairs.push(key + '=' + value);
  });
  
  const stringA = pairs.join('&');
  const stringSignTemp = stringA + '&key=' + config.WX_PAY_API_KEY;
  
  // 4. MD5加密并转为大写
  const md5Hash = crypto.createHash('md5');
  md5Hash.update(stringSignTemp, 'utf8');
  return md5Hash.digest('hex').toUpperCase();
};

/**
 * 构建微信支付V2 XML请求
 */
const buildWxPayV2Xml = (data: Record<string, any>): string => {
  let xml = '<xml>';
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      xml += `<${key}><![CDATA[${value}]]></${key}>`;
    }
  }
  xml += '</xml>';
  return xml;
};

/**
 * 解析微信支付V2 XML响应
 */
const parseWxPayV2Xml = (xmlStr: string): any => {
  const result: any = {};
  const regex = /<([^>]+)><!\[CDATA\[([^\]]*)\]\]><\/[^>]+>/g;
  let match;
  
  while ((match = regex.exec(xmlStr)) !== null) {
    result[match[1]] = match[2];
  }
  
  // 处理没有CDATA的标签
  const simpleRegex = /<([^>]+)>([^<]*)<\/[^>]+>/g;
  while ((match = simpleRegex.exec(xmlStr)) !== null) {
    if (!result[match[1]] && match[2].trim()) {
      result[match[1]] = match[2];
    }
  }
  
  return result;
};

/**
 * 验证微信支付V2返回签名
 */
const verifyWxPayV2Sign = (data: any): boolean => {
  const sign = data.sign;
  delete data.sign;
  const calculatedSign = generateWxPayV2Sign(data);
  data.sign = sign; // 恢复sign字段
  return sign === calculatedSign;
};

// ======================== 微信服务接口 ========================

/**
 * 获取微信 access_token
 */
export const getAccessToken = async (): Promise<ResponseData<string>> => {
    let redis = await redisPool.acquire();
    try {
        let key = "weixin_access_token:";
        if ((await redis.exists(key)) == 0) {
            const url = "https://api.weixin.qq.com/cgi-bin/token";
            const result: WxAccessTokenResponse = await httpGet(url, {
                params: {
                    grant_type: "client_credential",
                    appid: config.MINI_APP_ID,
                    secret: config.MINI_APP_SECRET,
                },
            });
            if (result.access_token) {
                await redis.setex(key, 3600, result.access_token);
                return { code: 0, msg: "ok", data: result.access_token };
            } else {
                return { code: 500, msg: "not_found", data: null };
            }
        } else {
            let access_token = await redis.get(key);
            return { code: 0, msg: "ok", data: access_token };
        }
    } catch (error: any) {
        return { code: 500, msg: "server_error", data: null };
    } finally {
        await redisPool.release(redis);
    }
};

/**
 * 获取微信短链
 */
export const getUrlLink = async (query: string): Promise<ResponseData<string>> => {
    try {
        const access_token = await getAccessToken();
        if (access_token.code !== 0) return { code: 500, msg: "not_found", data: null };
        const url = `https://api.weixin.qq.com/wxa/generate_urllink?access_token=${access_token.data}`;
        const postData = {
            path: "pages/home/home",
            query: query,
        };
        const response = await httpPost(url, postData);
        if (response.url_link) {
            return { code: 0, msg: "ok", data: response.url_link };
        } else {
            return { code: 500, msg: "not_found", data: null };
        }
    } catch (error: any) {
        return { code: 500, msg: error.message, data: null };
    }
};

export const getMiniQrcode = async (scene: string): Promise<ResponseData<string>> => {
  try {
    const access_token = await getAccessToken();
    if (access_token.code !== 0) return { code: 500, msg: "not_found", data: null };
    const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${access_token.data}`;
    const data = {
      path: "pages/home/home",
      scene: scene,
    };
    const response = await httpPost(url, data, { responseType: "arraybuffer" });
    const base64Image = Buffer.from(response).toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;
    return { code: 0, msg: "ok", data: dataUrl };
  } catch (error: any) {
    return { code: 500, msg: error.message, data: null };
  }
};

async function getOpenIdByCode(code: string): Promise<string> {
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.MINI_APP_ID}&secret=${config.MINI_APP_SECRET}&js_code=${code}&grant_type=authorization_code`;
  const resp = await axios.get<WxSessionResponse>(url);
  if (resp.data && resp.data.openid) {
    return resp.data.openid;
  }
  throw new Error("获取openid失败:" + (resp.data && resp.data.errmsg));
}

/**
 * 生成微信支付V2支付参数
 */
export const getPayToken = async (prepay_id: string): Promise<ResponseData<WxPayTokenData>> => {
  try {
    if (!prepay_id) return { code: 400, msg: "missing_prepay_id" };
    
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = uuidv4().replace(/-/g, "");
    const pkg = `prepay_id=${prepay_id}`;
    const signType = "MD5";
    
    // V2接口使用MD5签名
    const signParams = {
      appId: config.WX_PAY_APPID,
      timeStamp: timeStamp,
      nonceStr: nonceStr,
      package: pkg,
      signType: signType
    };
    
    const paySign = generateWxPayV2Sign(signParams);
    
    return {
      code: 0,
      msg: "ok",
      data: {
        timeStamp,
        nonceStr,
        package: pkg,
        signType,
        paySign,
      },
    };
  } catch (error: any) {
    return { code: 500, msg: error.message };
  }
};

/**
 * 微信支付V2统一下单
 * 支持两种方式：
 * 1. 传入 orderNo - 使用已创建的订单 
 */
export const weixinUnifiedOrder = async (params: { req: any }): Promise<ResponseData<UnifiedOrderResponse>> => {
  try {
    const { req } = params;
    const { orderNo,  code } = req.body;
    
    if (!code) {
      return { code: 400, msg: "invalid_params" };
    }
    
    const token = req.headers["token"] as string;
    if (!token) return { code: 401, msg: "unauthorized" };
    
    const orderService = await createOrderService(token);
    let order: any;
    let finalOrderNo: string;
    
    // 方式1：使用已创建的订单
    if (orderNo) {
      const orderResult = await orderService.getOrderByNo(orderNo);
      
      if (orderResult.msg !== 'ok' || !orderResult.data) {
        return { code: 400, msg: "order_not_found" };
      }
      
      order = orderResult.data;
      finalOrderNo = orderNo;
      
      // 检查订单状态
      if (order.status !== 1) {
        return { code: 400, msg: "order_status_invalid" };
      }
      
      // 检查订单是否过期
      if (order.expire_time && Date.now() > order.expire_time) {
        return { code: 400, msg: "order_expired" };
      }
    }
    else {
      return { code: 400, msg: "invalid_params" };
    }
    
    // 获取用户openid
    let openid: string;
    try {
      openid = await getOpenIdByCode(code);
    } catch (err) {
      return { code: 400, msg: "openid_not_found" };
    }
    
    // 构建V2统一下单请求
    const unifiedOrderData: WxPayV2UnifiedOrderData = {
      appid: config.WX_PAY_APPID,
      mch_id: config.WX_PAY_MCHID,
      nonce_str: uuidv4().replace(/-/g, ""),
      body: order.business_title || '商品订单',
      out_trade_no: finalOrderNo,
      total_fee: Math.round(order.actual_price * 100),
      spbill_create_ip: "127.0.0.1",
      notify_url: config.WX_PAY_NOTIFY_URL,
      trade_type: "JSAPI",
      openid: openid
    };
    
    // 生成签名
    unifiedOrderData.sign = generateWxPayV2Sign(unifiedOrderData);
    
    // 构建XML请求
    const xmlData = buildWxPayV2Xml(unifiedOrderData);
    
    // 调用微信统一下单接口
    const response = await axios.post('https://api.mch.weixin.qq.com/pay/unifiedorder', xmlData, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'User-Agent': 'Enterprise-Payment/1.0'
      }
    });
    
    const result: WxPayV2UnifiedOrderResponse = parseWxPayV2Xml(response.data);
    
    if (result.return_code !== 'SUCCESS') {
      return { code: 500, msg: `微信支付接口调用失败: ${result.return_msg}` };
    }
    
    if (result.result_code !== 'SUCCESS') {
      return { code: 500, msg: `微信支付下单失败: ${result.err_code} - ${result.err_code_des}` };
    }
    
    // 验证返回签名
    if (!verifyWxPayV2Sign(result)) {
      return { code: 500, msg: "微信支付返回签名验证失败" };
    }
    
    if (!result.prepay_id) {
      return { code: 500, msg: "weixin_order_failed" };
    }
    
    const payTokenResult = await getPayToken(result.prepay_id);
    if (payTokenResult.code !== 0) {
      return { code: 500, msg: "pay_sign_failed" };
    }
    
    return {
      code: 0,
      msg: "ok",
      data: {
        ...payTokenResult.data,
        orderNo: finalOrderNo,
      },
    };
  } catch (err: any) {
    return { code: 500, msg: err.message };
  }
};

/**
 * 微信支付V2回调处理
 */
export const weixinPayNotify = async (params: { req: any }): Promise<ResponseData<void>> => {
  let redis = await redisPool.acquire();
  try {
    const { req } = params;
    
    // V2接口回调数据是XML格式
    const xmlData = req.body;
    const paymentData: WxPaymentCallbackData = parseWxPayV2Xml(xmlData);
    
    if (paymentData.return_code !== 'SUCCESS') {
      return { code: 400, msg: `微信回调return_code失败: ${paymentData.return_msg}` };
    }
    
    if (paymentData.result_code !== 'SUCCESS') {
      return { code: 400, msg: `微信回调result_code失败: ${paymentData.err_code} - ${paymentData.err_code_des}` };
    }
    
    // 验证签名
    if (!verifyWxPayV2Sign(paymentData)) {
      return { code: 400, msg: "微信回调签名验证失败" };
    }
    
    const { out_trade_no, transaction_id } = paymentData;
    if (!out_trade_no) return { code: 400, msg: "missing_out_trade_no" };
    
    // 支付成功，确认订单
    try {
      const orderService = new OrderService({ 
        token: '',
        entity_id: 0
      });
      
      const confirmResult = await orderService.confirmOrder(out_trade_no, {
        payment_method: 'wechat',
        payment_order_no: transaction_id || out_trade_no,
        payment_platform: 'wechat_pay',
        payment_callback_data: paymentData
      });
      
      if (confirmResult.msg !== 'ok') {
        // 确认失败，加入失败队列等待补单
        const failedCallback: FailedPaymentCallbackData = {
          out_trade_no,
          transaction_id,
          trade_state: "SUCCESS",
          callback_time: new Date().toISOString(),
          error: confirmResult.msg
        };
        await redis.lpush("failed_payment_callbacks", JSON.stringify(failedCallback));
      }
    } catch (error: any) {
      // 加入失败队列
      const failedCallback: FailedPaymentCallbackData = {
        out_trade_no,
        transaction_id,
        trade_state: "SUCCESS",
        callback_time: new Date().toISOString(),
        error: String(error)
      };
      await redis.lpush("failed_payment_callbacks", JSON.stringify(failedCallback));
    }
    
    return { code: 0, msg: "ok" };
  } catch (err: any) {
    return { code: 500, msg: err.message };
  } finally {
    await redisPool.release(redis);
  }
};

/**
 * 查询微信支付V2状态
 */
export const queryWechatPayment = async (out_trade_no: string): Promise<PaymentQueryResult> => {
  try {
    // 构建V2查询请求
    const queryData: WxPayV2QueryData = {
      appid: config.WX_PAY_APPID,
      mch_id: config.WX_PAY_MCHID,
      out_trade_no: out_trade_no,
      nonce_str: uuidv4().replace(/-/g, "")
    };
    
    // 生成签名
    queryData.sign = generateWxPayV2Sign(queryData);
    
    // 构建XML请求
    const xmlData = buildWxPayV2Xml(queryData);
    
    // 调用微信查询接口
    const response = await axios.post('https://api.mch.weixin.qq.com/pay/orderquery', xmlData, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'User-Agent': 'Enterprise-Payment/1.0'
      }
    });
    
    const result: WxPayV2QueryResponse = parseWxPayV2Xml(response.data);
    
    if (result.return_code !== 'SUCCESS') {
      return { success: false, error: `微信查询接口调用失败: ${result.return_msg}` };
    }
    
    if (result.result_code !== 'SUCCESS') {
      return { success: false, error: `微信查询失败: ${result.err_code} - ${result.err_code_des}` };
    }
    
    // 验证返回签名
    if (!verifyWxPayV2Sign(result)) {
      return { success: false, error: "微信查询返回签名验证失败" };
    }
    
    return {
      success: result.trade_state === 'SUCCESS',
      trade_state: result.trade_state,
      transaction_id: result.transaction_id,
      amount: result.total_fee ? parseInt(result.total_fee) / 100 : 0
    };
  } catch (error: any) {
    console.error('查询微信支付状态失败:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 手动查询支付状态（供用户调用）
 */
export const manualCheckPayment = async (params: ManualCheckPaymentParams): Promise<ResponseData<ManualCheckPaymentResponse>> => {
  try {
    const { userId, out_trade_no } = params;
    
    // 查询微信支付状态
    const paymentResult = await queryWechatPayment(out_trade_no);
    
    if (paymentResult.success) {
      // 支付成功，确认订单
      const orderService = new OrderService({ 
        token: '', 
        entity_id: userId 
      });
      
      const confirmResult = await orderService.confirmOrder(out_trade_no, {
        payment_method: 'wechat',
        payment_order_no: paymentResult.transaction_id,
        payment_platform: 'wechat_pay'
      });
      
      if (confirmResult.msg === 'ok') {
        return { code: 0, msg: 'ok', data: { status: 'paid', transaction_id: paymentResult.transaction_id } };
      } else {
        return { code: 400, msg: confirmResult.msg, data: { status: 'error' } };
      }
    } else {
      return { 
        code: 0, 
        msg: 'ok', 
        data: { 
          status: 'pending',
          trade_state: paymentResult.trade_state 
        } 
      };
    }
  } catch (error: any) {
    return { code: 500, msg: error.message };
  }
};

export const weixinService = { getAccessToken, getUrlLink, getMiniQrcode, queryWechatPayment, manualCheckPayment };