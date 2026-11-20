# 微信支付V2接口改造完成

## 改造概述

已成功将微信支付从V3接口改造为V2接口，**无需证书**，只需要API密钥即可实现完整的支付功能。

## 主要变化

### 1. 配置文件更新 (`config.ts`)

```typescript
// 微信支付V2接口配置（无需证书）
WX_PAY_APPID: "wx35d65ed9e45b1692", // 小程序AppID
WX_PAY_MCHID: "1522367201", // 微信商户号
WX_PAY_API_KEY: "你的API密钥", // 微信支付API密钥（32位字符串）
WX_PAY_NOTIFY_URL: "https://域名/api/weixin/pay-notify", // 回调通知地址
```

**移除了以下V3接口配置：**
- `WX_PAY_SERIAL_NO` (证书序列号)
- `WX_PAY_PRIVATE_KEY_PATH` (私钥路径)
- `WX_PAY_CERT_PATH` (证书路径)
- `WX_PAY_PLATFORM_CERT_PATH` (平台证书路径)
- `MIN_APP_APIV3KEY` (APIv3密钥)

### 2. 服务层改造 (`service.ts`)

**核心变化：**
- ✅ 使用MD5签名替代RSA签名
- ✅ 使用XML格式替代JSON格式
- ✅ 调用V2统一下单接口：`https://api.mch.weixin.qq.com/pay/unifiedorder`
- ✅ 调用V2查询接口：`https://api.mch.weixin.qq.com/pay/orderquery`
- ✅ 移除了所有证书相关代码

**新增工具函数：**
- `generateWxPayV2Sign()` - 生成V2签名
- `buildWxPayV2Xml()` - 构建XML请求
- `parseWxPayV2Xml()` - 解析XML响应
- `verifyWxPayV2Sign()` - 验证返回签名

### 3. 类型定义更新 (`protos.ts`)

**新增V2接口类型：**
- `WxPayV2UnifiedOrderData` - V2统一下单请求
- `WxPayV2UnifiedOrderResponse` - V2统一下单响应
- `WxPayV2QueryData` - V2查询请求
- `WxPayV2QueryResponse` - V2查询响应
- `WxPaymentCallbackData` - V2回调数据

## 配置要求

### 1. 微信商户平台配置

1. 登录微信商户平台
2. 获取API密钥（32位字符串）
3. 配置支付回调地址
4. 确保小程序AppID和商户号匹配

### 2. 环境变量配置

```bash
# 在 .env 文件中配置
WX_PAY_API_KEY=你的32位API密钥
WX_PAY_NOTIFY_URL=https://你的域名/api/weixin/pay-notify
```

## 使用方法

### 1. 统一下单

```typescript
// 调用统一下单接口
const result = await weixinUnifiedOrder({
  req: {
    body: {
      productId: 123,
      quantity: 1,
      code: "微信授权码"
    },
    headers: {
      token: "用户token"
    }
  }
});
```

### 2. 支付回调处理

```typescript
// 处理微信支付回调
const result = await weixinPayNotify({
  req: {
    body: "XML格式的回调数据"
  }
});
```

### 3. 查询支付状态

```typescript
// 查询支付状态
const result = await queryWechatPayment("商户订单号");
```

## 测试方法

运行测试脚本验证配置：

```bash
# 在项目根目录执行
npx ts-node src/modules/weixin/test-v2.ts
```

测试脚本会检查：
- ✅ 配置完整性
- ✅ API密钥格式
- ✅ 签名生成
- ✅ XML构建

## V2接口优势

1. **无需证书** - 只需要API密钥，避免证书管理复杂性
2. **实现简单** - MD5签名，XML格式，易于调试
3. **稳定可靠** - V2接口成熟稳定，兼容性好
4. **维护成本低** - 不需要处理证书过期、更新等问题

## 注意事项

1. **API密钥安全** - 确保API密钥安全存储，不要提交到代码仓库
2. **回调地址** - 确保回调地址可以正常访问，支持HTTPS
3. **签名验证** - 所有请求和响应都需要进行签名验证
4. **错误处理** - 完善的错误处理和日志记录

## 迁移完成

✅ 配置文件已更新  
✅ 服务层已重写  
✅ 类型定义已更新  
✅ 测试脚本已创建  
✅ 文档已完善  

**微信支付V2接口改造完成，可以正常使用！**
