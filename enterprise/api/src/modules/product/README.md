# 服务产品模块 API 文档

## 概述
服务产品模块提供企业发布、管理、查询服务产品的完整功能，包括服务发布、服务列表、服务详情、收藏管理等功能。

## 数据库表结构
- `service_products`: 服务产品主表
- `service_favorites`: 服务收藏表
- `service_views`: 服务浏览记录表
- `service_reviews`: 服务评价表
- `service_inquiries`: 服务咨询表

## API 接口列表

### 1. 创建服务产品
**接口地址**: `POST /product/create`

**请求参数**:
```json
{
  "title": "服务标题",
  "description": "服务描述",
  "category_id": 1,
  "sub_category_id": 2,
  "tags": "[\"标签1\",\"标签2\"]",
  "price": 100.00,
  "price_type": 1,
  "unit": "次",
  "province": 1,
  "city": 2,
  "district": 3,
  "address": "详细地址",
  "contact_name": "联系人",
  "contact_phone": "联系电话",
  "contact_wechat": "微信号",
  "images": "[\"图片1\",\"图片2\"]",
  "videos": "[\"视频1\"]",
  "service_area": "服务区域",
  "service_time": "服务时间",
  "qualification": "[\"证书1\",\"证书2\"]",
  "status": 0
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1
  }
}
```

### 2. 更新服务产品
**接口地址**: `POST /product/update`

**请求参数**:
```json
{
  "id": 1,
  "title": "更新后的标题",
  "description": "更新后的描述",
  "price": 150.00
}
```

### 3. 删除服务产品
**接口地址**: `POST /product/delete`

**请求参数**:
```json
{
  "id": 1
}
```

### 4. 获取服务产品详情
**接口地址**: `POST /product/detail`

**请求参数**:
```json
{
  "id": 1
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "服务标题",
    "description": "服务描述",
    "category_id": 1,
    "sub_category_id": 2,
    "category_name": "主分类",
    "sub_category_name": "子分类",
    "tags": "[\"标签1\",\"标签2\"]",
    "price": 100.00,
    "price_type": 1,
    "unit": "次",
    "province": 1,
    "city": 2,
    "district": 3,
    "province_name": "省份",
    "city_name": "城市",
    "district_name": "区县",
    "address": "详细地址",
    "contact_name": "联系人",
    "contact_phone": "联系电话",
    "contact_wechat": "微信号",
    "images": "[\"图片1\",\"图片2\"]",
    "videos": "[\"视频1\"]",
    "service_area": "服务区域",
    "service_time": "服务时间",
    "qualification": "[\"证书1\",\"证书2\"]",
    "status": 2,
    "view_count": 10,
    "favorite_count": 5,
    "entity_id": 1,
    "entity_name": "企业名称",
    "entity_avatar": "企业头像",
    "entity_rating": 4.5,
    "create_time": "2024-01-01 10:00:00",
    "update_time": "2024-01-01 10:00:00",
    "is_favorite": false
  }
}
```

### 5. 获取服务产品列表
**接口地址**: `POST /product/list`

**请求参数**:
```json
{
  "page": 1,
  "page_size": 10,
  "category_id": 1,
  "sub_category_id": 2,
  "province": 1,
  "city": 2,
  "district": 3,
  "keyword": "搜索关键词",
  "price_min": 50,
  "price_max": 200,
  "price_type": 1,
  "sort_by": "create_time",
  "sort_order": "desc"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "服务标题",
        "price": 100.00,
        "category_name": "主分类",
        "sub_category_name": "子分类",
        "entity_name": "企业名称",
        "view_count": 10,
        "favorite_count": 5,
        "create_time": "2024-01-01 10:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 10,
    "total_pages": 10
  }
}
```

### 6. 获取我的服务产品
**接口地址**: `POST /product/my-list`

**请求参数**:
```json
{
  "page": 1,
  "page_size": 10,
  "status": 2,
  "keyword": "搜索关键词"
}
```

### 7. 审核服务产品
**接口地址**: `POST /product/audit`

**请求参数**:
```json
{
  "service_id": 1,
  "status": 1,
  "remark": "审核备注"
}
```

### 8. 切换服务状态
**接口地址**: `POST /product/toggle-status`

**请求参数**:
```json
{
  "id": 1,
  "status": 2
}
```

### 9. 收藏/取消收藏服务
**接口地址**: `POST /product/favorite`

**请求参数**:
```json
{
  "service_id": 1,
  "action": "add"
}
```

### 10. 获取收藏的服务列表
**接口地址**: `POST /product/favorite-list`

**请求参数**:
```json
{
  "page": 1,
  "page_size": 10
}
```

## 状态说明

### 服务状态 (status)
- `0`: 草稿
- `1`: 待审核
- `2`: 已发布
- `3`: 已下架

### 价格类型 (price_type)
- `1`: 固定价格
- `2`: 议价

### 审核状态 (audit status)
- `1`: 通过
- `2`: 拒绝

### 收藏操作 (action)
- `add`: 收藏
- `remove`: 取消收藏

## 注意事项

1. 所有接口都需要在请求头中携带有效的 `token`
2. 创建和更新服务产品时，会自动设置 `entity_id` 为当前登录企业ID
3. 获取服务产品详情时会自动增加浏览次数
4. 收藏操作会同时更新服务的收藏数量
5. 列表查询支持多种筛选条件和排序方式
6. 分页参数 `page` 从 1 开始，`page_size` 最大为 100 