# 发票管理模块

## 概述

发票管理模块用于管理用户的发票抬头信息，任何用户都可以使用此模块管理自己的发票信息。主要用于在服务下单时选择发票抬头。

## 功能特性

- 创建发票信息
- 更新发票信息
- 删除发票信息（软删除）
- 查询发票列表
- 获取发票详情
- 设置默认发票
- 获取默认发票

## 数据模型

### 发票信息表 (invoices)

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | int(11) | 是 | 主键ID |
| title | varchar(100) | 是 | 发票抬头 |
| tax_number | varchar(30) | 是 | 纳税人识别号 |
| invoice_type | tinyint(1) | 是 | 发票类型：1-普通发票，2-增值税专用发票 |
| company_address | varchar(255) | 否 | 公司地址 |
| company_phone | varchar(20) | 否 | 公司电话 |
| bank_name | varchar(100) | 否 | 开户银行 |
| bank_account | varchar(50) | 否 | 银行账号 |
| entity_id | int(11) | 是 | 用户ID |
| is_default | tinyint(1) | 否 | 是否默认：0-否，1-是 |
| status | tinyint(1) | 是 | 状态：1-正常，0-已删除 |
| create_time | int(11) | 是 | 创建时间 |
| update_time | int(11) | 是 | 更新时间 |

## API 接口

### 1. 创建发票信息

**接口地址：** `POST /invoice/create`

**请求参数：**
```json
{
  "title": "北京科技有限公司",
  "tax_number": "91110000000000000X",
  "invoice_type": 1,
  "company_address": "北京市朝阳区XX路XX号",
  "company_phone": "010-12345678",
  "bank_name": "中国工商银行",
  "bank_account": "1234567890123456789",
  "is_default": 1
}
```

**响应数据：**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1
  }
}
```

### 2. 更新发票信息

**接口地址：** `POST /invoice/update`

**请求参数：**
```json
{
  "id": 1,
  "title": "北京科技有限公司（更新）",
  "company_address": "北京市朝阳区XX路XX号（新地址）"
}
```

### 3. 删除发票信息

**接口地址：** `POST /invoice/delete`

**请求参数：**
```json
{
  "id": 1
}
```

### 4. 获取发票列表

**接口地址：** `POST /invoice/list`

**请求参数：**
```json
{
  "page": 1,
  "page_size": 10,
  "invoice_type": 1,
  "keyword": "公司名称",
  "status": 1
}
```

**响应数据：**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "北京科技有限公司",
        "tax_number": "91110000000000000X",
        "invoice_type": 1,
        "invoice_type_name": "普通发票",
        "company_address": "北京市朝阳区XX路XX号",
        "company_phone": "010-12345678",
        "bank_name": "中国工商银行",
        "bank_account": "1234567890123456789",
        "entity_id": 1,
        "is_default": 1,
        "status": 1,
        "create_time": "2024-01-01 10:00:00",
        "update_time": "2024-01-01 10:00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 10,
    "total_pages": 1
  }
}
```

### 5. 获取发票详情

**接口地址：** `POST /invoice/detail`

**请求参数：**
```json
{
  "id": 1
}
```

### 6. 设置默认发票

**接口地址：** `POST /invoice/set-default`

**请求参数：**
```json
{
  "id": 1
}
```

### 7. 获取默认发票

**接口地址：** `POST /invoice/get-default`

**请求参数：** 无需参数（自动使用当前用户ID）

## 业务规则

1. **用户隔离：** 每个用户只能管理自己的发票信息
2. **软删除：** 删除操作采用软删除方式，不会物理删除数据
3. **默认发票：** 每个用户只能有一个默认发票，设置新的默认发票时会自动取消其他发票的默认状态
4. **必填字段：** 发票抬头和纳税人识别号为必填字段
5. **发票类型：** 支持普通发票和增值税专用发票两种类型

## 使用场景

1. **服务下单：** 用户在购买服务时选择发票抬头
2. **发票管理：** 用户管理常用的发票信息
3. **企业财务：** 企业用户维护多个发票抬头信息

## 注意事项

1. 所有接口都需要用户认证（token）
2. entity_id 会自动从用户 token 中获取，无需在请求中传递
3. 删除操作为软删除，不会影响历史订单的发票信息
4. 创建发票时如果设置为默认，会自动将其他发票的默认状态清除