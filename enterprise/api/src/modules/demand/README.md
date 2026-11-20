# 需求大厅模块 (Demand Module)

## 概述

需求大厅模块提供完整的需求发布、管理和查询功能，支持企业用户发布各类业务需求，包括服务需求、产品需求和合作需求。

## 功能特性

### 🎯 核心功能
- ✅ 需求发布：支持发布不同类型的业务需求
- ✅ 需求管理：创建、更新、删除、状态管理
- ✅ 需求查询：支持多条件搜索和筛选
- ✅ 需求详情：查看完整需求信息和发布者信息
- ✅ 地理位置：支持省市区县街道的精确定位
- ✅ 联系方式：支持多种联系方式（电话、邮箱等）

### 📊 需求类型
1. **服务** (type: 1) - 寻找服务提供商
2. **供需** (type: 2) - 供需匹配需求
3. **招采** (type: 3) - 招标采购需求
4. **项目** (type: 4) - 项目合作需求
5. **招聘** (type: 5) - 人才招聘需求
6. **沙龙** (type: 6) - 活动沙龙需求
7. **外贸** (type: 7) - 外贸业务需求

### 🔄 需求状态
1. **发布中** (status: 1) - 需求正在寻找匹配方
2. **已完成** (status: 2) - 需求已找到合适的提供方
3. **已取消** (status: 3) - 需求已被发布者取消

### 👁️ 可见性设置
1. **公开** (visibility: 1) - 所有用户可见
2. **仅认证经纪人可见** (visibility: 2) - 仅认证经纪人可见

## API 接口

### 需求管理

#### 创建需求
```http
POST /demand/create
```

**请求参数：**
```json
{
  "title": "需求标题",
  "content": "需求详细描述",
  "type": 1,
  "category_id": 1,
  "province": 110000,
  "city": 110100,
  "district": 110101,
  "street": 110101001,
  "address": "详细地址",
  "person": "联系人姓名",
  "mobile": "联系电话",
  "email": "联系邮箱（可选）",
  "images": "[]",
  "remark": "备注信息（可选）",
  "visibility": 1,
  "budget_price": 10000.00
}
```

**参数说明：**
- `title` (string, 必需): 需求标题，最大250字符
- `content` (string, 必需): 需求详细描述
- `type` (int, 必需): 需求类型 (1-7)
- `category_id` (int, 必需): 需求分类ID
- `province` (int, 必需): 省份代码
- `city` (int, 必需): 城市代码
- `district` (int, 必需): 区县代码
- `street` (int, 必需): 街道代码
- `address` (string, 必需): 详细地址，最大250字符
- `person` (string, 必需): 联系人姓名，最大100字符
- `mobile` (string, 必需): 联系电话，最大20字符
- `email` (string, 可选): 联系邮箱
- `images` (string, 可选): 图片JSON数组
- `remark` (string, 可选): 备注信息，最大250字符
- `visibility` (int, 可选): 可见性设置 (1:公开, 2:仅认证经纪人可见)，默认为1
- `budget_price` (float, 可选): 预算价格，必须大于等于0，默认为0

#### 更新需求
```http
POST /demand/update
```

**请求参数：**
```json
{
  "id": 1,
  "title": "更新后的标题（可选）",
  "content": "更新后的内容（可选）",
  // 其他可选字段...
}
```

#### 删除需求
```http
POST /demand/delete
```

**请求参数：**
```json
{
  "id": 1
}
```

### 需求查询

#### 获取需求列表
```http
POST /demand/list
```

**请求参数：**
```json
{
  "page": 1,
  "page_size": 10,
  "keyword": "搜索关键词（可选）",
  "status": 1,
  "type": 1,
  "category_id": 1,
  "province": 110000,
  "city": 110100,
  "district": 110101,
  "user_id": 123,
  "start_time": 1640995200,
  "end_time": 1672531200,
  "sort_by": "create_time",
  "sort_order": "desc"
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
        "title": "需求标题",
        "user_id": 123,
        "create_time": 1640995200,
        "status": 1,
        "type": 1,
        "category_id": 1,
        "province": 110000,
        "city": 110100,
        "district": 110101,
        "street": 110101001,
        "address": "详细地址",
        "content": "需求内容（截取前200字符）",
        "images": "[]",
        "person": "联系人",
        "mobile": "联系电话",
        "email": "联系邮箱",
        "remark": "备注",
        "publisher": {
          "id": 123,
          "nickname": "发布者昵称",
          "avatar": "头像URL",
          "company_name": "公司名称",
          "role": 7
        }
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 10,
    "total_pages": 10
  }
}
```

#### 获取我的需求列表
```http
POST /demand/my-list
```

**请求参数：** 同需求列表接口

#### 获取需求详情
```http
POST /demand/detail
```

**请求参数：**
```json
{
  "id": 1
}
```

**响应数据：**
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "demand": {
      "id": 1,
      "title": "需求标题",
      "user_id": 123,
      "create_time": 1640995200,
      "status": 1,
      "type": 1,
      "category_id": 1,
      "province": 110000,
      "city": 110100,
      "district": 110101,
      "street": 110101001,
      "address": "详细地址",
      "content": "完整需求内容",
      "images": "[]",
      "person": "联系人",
      "mobile": "联系电话",
      "email": "联系邮箱",
      "remark": "备注"
    },
    "publisher": {
      "id": 123,
      "nickname": "发布者昵称",
      "avatar": "头像URL",
      "company_name": "公司名称",
      "role": 7
    }
  }
}
```

### 状态管理

#### 更新需求状态
```http
POST /demand/update-status
```

**请求参数：**
```json
{
  "id": 1,
  "status": 2,
  "remark": "状态更新备注（可选）"
}
```

## 数据库表结构

```sql
CREATE TABLE IF NOT EXISTS demand (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '需求ID，主键',
    title VARCHAR(250) NOT NULL DEFAULT '' COMMENT '需求标题',
    user_id INT NOT NULL DEFAULT 0 COMMENT '发布者用户ID',
    create_time INT NOT NULL DEFAULT 0 COMMENT '发布时间（时间戳）',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '需求状态（1:发布中 2:已完成 3:已取消）',
    type TINYINT NOT NULL DEFAULT 1 COMMENT '需求类型（1:服务需求 2:产品需求 3:合作需求）',
    category_id INT NOT NULL DEFAULT 0 COMMENT '需求分类ID',
    province INT(11) NOT NULL DEFAULT 0 COMMENT '需求省份',
    city INT(11) NOT NULL DEFAULT 0 COMMENT '需求城市',
    district INT(11) NOT NULL DEFAULT 0 COMMENT '需求区县',
    street INT(11) NOT NULL DEFAULT 0 COMMENT '需求街道',
    address VARCHAR(250) NOT NULL DEFAULT '' COMMENT '需求联系地址',
    content TEXT NOT NULL COMMENT '需求内容详情',
    images TEXT NOT NULL COMMENT '需求相关图片（JSON格式存储）',
    person VARCHAR(100) NOT NULL DEFAULT '' COMMENT '需求联系人',
    mobile VARCHAR(20) NOT NULL DEFAULT '' COMMENT '需求联系电话',
    email VARCHAR(100) NOT NULL DEFAULT '' COMMENT '需求联系邮箱',
    remark VARCHAR(250) NOT NULL DEFAULT '' COMMENT '需求备注信息',
    INDEX idx_user_type_category_area (user_id, type, category_id, province) COMMENT '用户类型分类区域复合索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='需求大厅表';
```

## 权限控制

### 访问权限
- 所有已登录用户可以查看需求列表和详情
- 只有需求发布者可以更新、删除自己的需求
- 只有需求发布者可以修改需求状态

### 数据安全
- 所有数据库操作通过 RPC 接口进行，确保数据安全
- 用户ID通过 token 自动获取，防止数据篡改
- 敏感操作记录操作日志

## 使用示例

### 1. 发布服务需求
```javascript
// 发布一个寻找网站开发服务的需求
const demandData = {
  title: "寻找专业网站开发团队",
  content: "我们公司需要开发一个企业官网，要求响应式设计，支持多语言...",
  type: 1, // 服务需求
  category_id: 10, // IT服务分类
  province: 110000, // 北京市
  city: 110100, // 北京市
  district: 110101, // 东城区
  street: 110101001, // 具体街道
  address: "北京市东城区xx街道xx号",
  person: "张经理",
  mobile: "13800138000",
  email: "zhang@company.com",
  images: JSON.stringify(["image1.jpg", "image2.jpg"]),
  remark: "希望一个月内完成"
};
```

### 2. 搜索相关需求
```javascript
// 搜索IT服务相关的需求
const searchParams = {
  page: 1,
  page_size: 10,
  keyword: "网站开发",
  type: 1, // 服务需求
  category_id: 10, // IT服务分类
  province: 110000, // 北京地区
  status: 1, // 发布中的需求
  sort_by: "create_time",
  sort_order: "desc"
};
```

## 错误处理

### 常见错误码
- `insert_error`: 创建需求失败
- `update_error`: 更新需求失败  
- `delete_error`: 删除需求失败
- `not_found`: 需求不存在
- `no_permission`: 没有操作权限
- `no_fields_to_update`: 没有需要更新的字段
- `query_error`: 查询失败
- `server_error`: 服务器错误

### 错误处理示例
```javascript
try {
  const result = await demandApi.createDemand(demandData);
  if (result.code === 0) {
    console.log('需求创建成功:', result.data);
  } else {
    console.error('需求创建失败:', result.msg);
  }
} catch (error) {
  console.error('请求异常:', error);
}
```

## 最佳实践

### 1. 需求标题命名
- 使用清晰、具体的标题
- 包含关键信息（需求类型、地区等）
- 避免使用模糊或过于简单的描述

### 2. 需求内容描述
- 详细描述需求的具体要求
- 包含预算范围、时间要求等关键信息
- 提供必要的补充材料（图片、文档等）

### 3. 联系信息
- 提供准确的联系方式
- 及时响应意向方的联系
- 保护个人隐私信息

### 4. 状态管理
- 及时更新需求状态
- 需求完成后及时关闭
- 不再需要时及时取消

## 扩展功能

### 后续可扩展的功能
- 需求匹配推荐算法
- 需求响应和报价功能
- 需求评价和反馈系统
- 需求统计和分析报表
- 需求消息通知功能