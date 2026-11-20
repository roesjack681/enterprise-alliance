import axios from 'axios';
import { redisPool } from '../storage/redisPool';
import { config } from '../config/config';
import crypto from 'crypto';

// 腾讯云短信API配置
interface SmsConfig {
  secretId: string;
  secretKey: string;
  sdkAppId: string;
  signName: string;
  templateId: string;
}

// 从环境变量或配置文件获取短信配置
const getSmsConfig = (): SmsConfig => {
  return {
    secretId: process.env.TENCENT_SECRET_ID || 'your_secret_id',
    secretKey: process.env.TENCENT_SECRET_KEY || 'your_secret_key',
    sdkAppId: process.env.TENCENT_SMS_SDK_APP_ID || 'your_sdk_app_id',
    signName: process.env.TENCENT_SMS_SIGN_NAME || 'your_sign_name',
    templateId: process.env.TENCENT_SMS_TEMPLATE_ID || 'your_template_id'
  };
};

// 生成腾讯云API签名
const generateSignature = (config: SmsConfig, timestamp: number, nonce: string, payload: string): string => {
  const date = new Date(timestamp * 1000).toISOString().split('T')[0];
  const credential = `${date}/${config.secretId}/sms/tc3_request`;
  
  const httpRequestMethod = 'POST';
  const canonicalUri = '/';
  const canonicalQueryString = '';
  const canonicalHeaders = 'content-type:application/json; charset=utf-8\nhost:sms.tencentcloudapi.com\n';
  const signedHeaders = 'content-type;host';
  
  const hashedRequestPayload = crypto.createHash('sha256').update(payload).digest('hex');
  const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;
  
  const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
  const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${credential}\n${hashedCanonicalRequest}`;
  
  const secretDate = crypto.createHmac('sha256', `TC3${config.secretKey}`).update(date).digest();
  const secretService = crypto.createHmac('sha256', secretDate).update('sms').digest();
  const secretSigning = crypto.createHmac('sha256', secretService).update('tc3_request').digest();
  
  return crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex');
};

// 生成随机验证码
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 验证手机号格式
const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 发送短信验证码
export const sendVerificationCode = async (phone: string): Promise<{ success: boolean; message: string }> => {
  try {
    // 验证手机号格式
    if (!validatePhoneNumber(phone)) {
      return { success: false, message: '手机号格式不正确' };
    }

    // 检查发送频率限制
    const redis = await redisPool.acquire();
    try {
      const rateLimitKey = `sms_rate_limit:${phone}`;
      const rateLimit = await redis.get(rateLimitKey);
      
      if (rateLimit) {
        return { success: false, message: '发送过于频繁，请稍后再试' };
      }

      // 生成验证码
      const code = generateVerificationCode();
      
      // ==================== 模拟模式 ====================
      // 在微信申请下来之前，使用模拟模式
      
      // 将验证码存储到Redis，有效期5分钟
      const codeKey = `sms_code:${phone}`;
      await redis.setex(codeKey, 300, code);
      
      // 设置发送频率限制，1分钟内不能重复发送
      await redis.setex(rateLimitKey, 60, '1');
      
      return { success: true, message: `验证码发送成功，验证码: ${code}` };
      
      // ==================== 正式模式（已注释） ====================
      /*
      // 获取短信配置
      const smsConfig = getSmsConfig();
      
      // 准备请求参数
      const timestamp = Math.floor(Date.now() / 1000);
      const nonce = Math.random().toString(36).substring(2, 15);
      
      const requestPayload = {
        PhoneNumberSet: [`+86${phone}`],
        SmsSdkAppId: smsConfig.sdkAppId,
        SignName: smsConfig.signName,
        TemplateId: smsConfig.templateId,
        TemplateParamSet: [code],
        SessionContext: '',
        ExtendCode: '',
        SenderId: ''
      };

      const payload = JSON.stringify(requestPayload);
      
      // 生成签名
      const signature = generateSignature(smsConfig, timestamp, nonce, payload);
      
      // 发送请求
      const response = await axios.post('https://sms.tencentcloudapi.com', payload, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Host': 'sms.tencentcloudapi.com',
          'X-TC-Action': 'SendSms',
          'X-TC-Version': '2021-01-11',
          'X-TC-Timestamp': timestamp.toString(),
          'X-TC-Region': 'ap-guangzhou',
          'Authorization': `TC3-HMAC-SHA256 Credential=${smsConfig.secretId}/${new Date(timestamp * 1000).toISOString().split('T')[0]}/sms/tc3_request, SignedHeaders=content-type;host, Signature=${signature}`
        },
        timeout: 10000
      });

      if (response.data && response.data.Response && response.data.Response.SendStatusSet) {
        const sendStatus = response.data.Response.SendStatusSet[0];
        
        if (sendStatus.Code === 'Ok') {
          // 将验证码存储到Redis，有效期5分钟
          const codeKey = `sms_code:${phone}`;
          await redis.setex(codeKey, 300, code);
          
          // 设置发送频率限制，1分钟内不能重复发送
          await redis.setex(rateLimitKey, 60, '1');
          
          return { success: true, message: '验证码发送成功' };
        } else {
          console.error('短信发送失败:', sendStatus.Message);
          return { success: false, message: `发送失败: ${sendStatus.Message}` };
        }
      } else {
        console.error('短信API响应异常:', response.data);
        return { success: false, message: '发送失败，请稍后重试' };
      }
      */
    } finally {
      await redisPool.release(redis);
    }
  } catch (error: any) {
    console.error('短信发送异常:', error);
    
    // 如果是网络错误或配置错误，返回通用错误信息
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return { success: false, message: '网络连接失败，请检查网络设置' };
    }
    
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      if (errorData.Response && errorData.Response.Error) {
        return { success: false, message: `发送失败: ${errorData.Response.Error.Message}` };
      }
    }
    
    return { success: false, message: '发送失败，请稍后重试' };
  }
};

// 验证短信验证码
export const verifyCode = async (phone: string, code: string): Promise<{ success: boolean; message: string }> => {
  try {
    // 验证手机号格式
    if (!validatePhoneNumber(phone)) {
      return { success: false, message: '手机号格式不正确' };
    }

    // 验证验证码格式
    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      return { success: false, message: '验证码格式不正确' };
    }

    const redis = await redisPool.acquire();
    try {
      const codeKey = `sms_code:${phone}`;
      const storedCode = await redis.get(codeKey);
      
      if (!storedCode) {
        return { success: false, message: '验证码已过期或不存在' };
      }
      
      if (storedCode !== code) {
        return { success: false, message: '验证码错误' };
      }
      
      // 验证成功后删除验证码
      await redis.del(codeKey);
      
      return { success: true, message: '验证成功' };
    } finally {
      await redisPool.release(redis);
    }
  } catch (error: any) {
    console.error('验证码验证异常:', error);
    return { success: false, message: '验证失败，请稍后重试' };
  }
};

// 短信服务对象
export const smsService = {
  sendVerificationCode,
  verifyCode
};