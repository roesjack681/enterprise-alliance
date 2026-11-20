# 通用订单模块 - 精简版

## 设计理念

这是一个精简但实用的通用订单模块，支持多种业务类型的统一订单管理。设计原则：
- **简单实用**：避免过度设计，专注核心功能
- **通用性**：一个订单表支持多种业务类型
- **可扩展**：支持新业务类型的快速接入

## 核心功能

### 1. 统一订单管理
- 支持服务、产品、会员等多种业务类型
- 统一的支付流程和状态管理
- 自动创建对应的业务订单

### 2. 支付处理
- 支付成功后自动更新订单状态
- 支持多种支付方式
- 完整的支付回调处理

### 3. 业务订单创建
- 支付成功后根据业务类型自动创建业务订单
- 支持服务订单（serviceFlow模块）
- 预留产品、会员等其他业务类型接口

## 数据库表结构

### orders 表
```sql
-- 通用订单表，支持多业务类型
- order_no: 订单编号
- entity_id: 用户ID（企业ID）
- business_type: 业务类型（service, product, member等）
- business_id: 业务ID
- business_title: 业务标题
- business_data: JSON格式的业务扩展数据
- business_status: 业务处理状态（0-未处理，1-已处理）
- business_order_id: 关联的业务订单ID
```

## API 接口

### 基础订单操作
- `POST /order/create` - 创建订单（缓存到Redis）
- `POST /order/confirm` - 确认订单（支付成功后写入数据库）
- `POST /order/detail` - 获取订单详情
- `POST /order/by_no` - 根据订单号获取订单信息
- `POST /order/list` - 获取订单列表
- `POST /order/update_status` - 更新订单状态
- `POST /order/cancel` - 取消订单

### 支付处理
- `POST /order/payment/success` - 处理支付成功回调
- `POST /order/business/create` - 手动创建业务订单

## 新的订单流程

### 1. 创建订单（缓存阶段）
```javascript
// 第一步：创建订单，数据缓存到Redis
// 支持多种参数格式：

// 统一使用business_id字段
const serviceOrderData = {
  business_type: 'service',
  business_id: '123', // 服务ID
  actual_price: 1000.00,
  remark: '企业记账服务订单',
  invoice_id: 456
};

// 产品订单
const productOrderData = {
  business_type: 'product',
  business_id: '789', // 产品ID
  actual_price: 500.00,
  remark: '产品订单'
};

// 完整参数示例
const fullOrderData = {
  business_type: 'service',
  business_id: '123',
  business_title: '企业记账服务', // 可选，会自动获取
  business_data: {
    service_type: 'recurring',
    cycle_months: 12,
    start_date: Date.now()
  },
  actual_price: 1000.00,
  original_price: 1200.00, // 可选，会自动获取
  discount_price: 200.00,
  remark: '年度服务套餐',
  invoice_id: 456
};

const createResult = await orderService.createOrder(orderData);
// 返回: { order_no, business_title, actual_price, expire_time }
```

### 2. 用户选择支付方式
```javascript
// 根据createOrder返回的信息，用户可以选择：
// - 微信支付
// - 支付宝支付  
// - 银行转账
// - 余额支付
// 等多种支付方式

// 调用对应的支付接口，传入order_no和金额
const paymentParams = {
  order_no: createResult.data.order_no,
  amount: createResult.data.actual_price,
  payment_method: 'wechat'
};
```

### 3. 支付成功后确认订单
```javascript
// 第二步：支付成功后，将Redis数据写入数据库
const confirmData = {
  order_no: 'ORD1234567890',
  payment_data: {
    payment_method: 'wechat',
    payment_order_no: 'WX123456789',
    payment_platform: 'wechat_pay'
  }
};

const confirmResult = await orderService.confirmOrder(
  confirmData.order_no,
  confirmData.payment_data
);
// 同时自动创建业务订单
```

### 4. 查询订单状态
```javascript
// 可以随时查询订单状态（会同时查询Redis和数据库）
const orderInfo = await orderService.getOrderByNo('ORD1234567890');
```

## 参数说明

### 创建订单参数说明

#### 必填参数
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `actual_price` | number | 实付金额（必须 > 0.01） |

#### 业务ID参数（必填）
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `business_id` | string | 业务ID（必填，统一字段） |

#### 可选参数
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `business_type` | string | 业务类型，默认根据ID类型自动推断 |
| `business_title` | string | 业务标题，为空时自动获取 |
| `business_data` | object | 业务扩展数据 |
| `original_price` | number | 原价，为空时自动获取 |
| `discount_price` | number | 优惠金额，默认0 |
| `remark` | string | 订单备注（最大500字符） |
| `invoice_id` | number | 发票ID |

### 业务类型说明
- `business_type: 'service'` → 服务订单
- `business_type: 'product'` → 产品订单  
- `business_type: 'member'` → 会员订单
- `business_type: 'invoice'` → 发票订单
- 默认值: `'service'`

### 参数验证规则

#### ✅ 正确的参数示例
```javascript
// 最简参数（前端当前使用方式）
{
  business_type: "service",
  business_id: "123",
  actual_price: 1000.00
}

// 完整参数
{
  business_type: "service",
  business_id: "123",
  business_title: "企业记账服务",
  actual_price: 1000.00,
  original_price: 1200.00,
  discount_price: 200.00,
  remark: "企业记账服务订单",
  invoice_id: 456,
  business_data: {
    service_type: "recurring",
    cycle_months: 12
  }
}
```

#### ❌ 错误的参数示例
```javascript
// 错误：缺少业务ID
{
  business_type: "service",
  actual_price: 1000.00,
  remark: "订单备注"
}

// 错误：实付金额太小
{
  business_id: "123",
  actual_price: 0.001
}

// 错误：备注超长
{
  business_id: "123", 
  actual_price: 1000.00,
  remark: "超过500字符的备注内容..."
}
```

## 业务类型支持

### 当前支持的业务类型

1. **service** - 服务订单
   - 自动创建 serviceFlow 模块的服务订单
   - 支持一次性和周期性服务
   - 自动启动流程管理

2. **product** - 产品订单（预留）
   - 可扩展支持产品销售

3. **member** - 会员订单（预留）
   - 可扩展支持会员套餐

### 扩展新业务类型

1. 在 `OrderService.createBusinessOrder()` 方法中添加新的 case
2. 实现对应的 `createXxxOrder()` 私有方法
3. 根据需要创建相应的业务表和逻辑

```typescript
// 在 switch 中添加新类型
case 'newtype':
  businessOrderId = await this.createNewTypeOrder(order);
  break;

// 实现创建方法
private async createNewTypeOrder(order: any): Promise<string | null> {
  // 实现具体的业务订单创建逻辑
  return businessOrderId;
}
```

## 订单状态流转

```
1. 待支付 → 2. 已支付 → 3. 已完成
    ↓           ↓
4. 已取消    5. 已退款
```

## 业务处理状态

```
0. 未处理 → 1. 已处理
```

支付成功后，系统会：
1. 更新订单状态为"已支付"
2. 根据业务类型创建相应的业务订单
3. 更新业务处理状态为"已处理"

## 优势

1. **简单易用**：一个订单表解决多业务需求
2. **易于维护**：避免了复杂的工厂模式和配置表
3. **性能良好**：减少了表关联和复杂查询
4. **扩展性强**：新增业务类型只需添加简单的处理方法
5. **向后兼容**：保持了原有API接口的兼容性

## 注意事项

1. **business_data字段**：存储JSON格式数据，用于业务扩展
2. **软删除**：建议所有删除操作使用状态标记而非物理删除
3. **事务处理**：支付成功处理建议使用数据库事务
4. **错误处理**：业务订单创建失败不应影响支付订单状态