# 企业主页模块

## 功能概述

企业主页模块是一个完整的企业展示和管理系统，包含以下主要功能：

### 核心功能
1. **轮播图管理** - 企业主页轮播图的增删改查
2. **关于我们** - 企业基本信息的展示和管理
3. **联系我们** - 企业联系信息的展示和管理
4. **产品管理** - 企业产品/服务的展示和管理
5. **文章管理** - 企业文章的发布和管理
6. **案例管理** - 企业成功案例的展示和管理
7. **设置管理** - 企业主页的个性化设置

## 数据库表结构

### 1. enterprise_banners (轮播图表)
- `id` - 主键
- `enterprise_id` - 企业ID
- `title` - 轮播图标题
- `image_url` - 图片URL
- `link_url` - 链接URL
- `sort_order` - 排序
- `is_active` - 是否激活
- `created_at` - 创建时间
- `updated_at` - 更新时间

### 2. enterprise_about (关于我们表)
- `id` - 主键
- `enterprise_id` - 企业ID
- `company_name` - 公司名称
- `description` - 公司描述
- `vision` - 企业愿景
- `mission` - 企业使命
- `values` - 企业价值观
- `history` - 发展历程
- `team_intro` - 团队介绍
- `logo_url` - Logo URL
- `cover_image` - 封面图片URL
- `contact_info` - 联系信息JSON
- `created_at` - 创建时间
- `updated_at` - 更新时间

### 3. enterprise_contact (联系信息表)
- `id` - 主键
- `enterprise_id` - 企业ID
- `contact_person` - 联系人
- `phone` - 联系电话
- `email` - 邮箱
- `address` - 地址
- `website` - 网站
- `wechat` - 微信号
- `qq` - QQ号
- `work_time` - 工作时间
- `latitude` - 纬度
- `longitude` - 经度
- `created_at` - 创建时间
- `updated_at` - 更新时间

### 4. enterprise_products (产品表)
- `id` - 主键
- `enterprise_id` - 企业ID
- `name` - 产品名称
- `description` - 产品描述
- `features` - 产品特点
- `price_range` - 价格范围
- `image_urls` - 产品图片URL数组
- `category` - 产品分类
- `tags` - 产品标签数组
- `is_featured` - 是否推荐
- `sort_order` - 排序
- `status` - 状态
- `created_at` - 创建时间
- `updated_at` - 更新时间

### 5. enterprise_articles (文章表)
- `id` - 主键
- `enterprise_id` - 企业ID
- `title` - 文章标题
- `content` - 文章内容
- `summary` - 文章摘要
- `cover_image` - 封面图片URL
- `category` - 文章分类
- `tags` - 文章标签数组
- `author` - 作者
- `view_count` - 浏览量
- `is_published` - 是否发布
- `published_at` - 发布时间
- `created_at` - 创建时间
- `updated_at` - 更新时间

### 6. enterprise_cases (案例表)
- `id` - 主键
- `enterprise_id` - 企业ID
- `title` - 案例标题
- `description` - 案例描述
- `client_name` - 客户名称
- `industry` - 所属行业
- `challenge` - 面临的挑战
- `solution` - 解决方案
- `results` - 实施结果
- `image_urls` - 案例图片URL数组
- `video_url` - 视频URL
- `is_featured` - 是否推荐
- `sort_order` - 排序
- `status` - 状态
- `created_at` - 创建时间
- `updated_at` - 更新时间

### 7. enterprise_homepage_settings (主页设置表)
- `id` - 主键
- `enterprise_id` - 企业ID
- `theme_color` - 主题色
- `primary_color` - 主色调
- `secondary_color` - 辅助色
- `font_family` - 字体
- `logo_position` - Logo位置
- `show_banner` - 是否显示轮播图
- `show_about` - 是否显示关于我们
- `show_products` - 是否显示产品
- `show_articles` - 是否显示文章
- `show_cases` - 是否显示案例
- `show_contact` - 是否显示联系信息
- `custom_css` - 自定义CSS
- `custom_js` - 自定义JS
- `seo_title` - SEO标题
- `seo_description` - SEO描述
- `seo_keywords` - SEO关键词
- `created_at` - 创建时间
- `updated_at` - 更新时间

## API接口

### 轮播图管理
- `POST /enterprise-homepage/banners` - 创建轮播图
- `PUT /enterprise-homepage/banners/:id` - 更新轮播图
- `DELETE /enterprise-homepage/banners/:id` - 删除轮播图
- `GET /enterprise-homepage/banners` - 获取轮播图列表

### 关于我们管理
- `POST /enterprise-homepage/about` - 创建或更新关于我们
- `GET /enterprise-homepage/about/:enterpriseId` - 获取关于我们

### 联系信息管理
- `POST /enterprise-homepage/contact` - 创建或更新联系信息
- `GET /enterprise-homepage/contact/:enterpriseId` - 获取联系信息

### 产品管理
- `POST /enterprise-homepage/products` - 创建产品
- `PUT /enterprise-homepage/products/:id` - 更新产品
- `DELETE /enterprise-homepage/products/:id` - 删除产品
- `GET /enterprise-homepage/products` - 获取产品列表
- `GET /enterprise-homepage/products/:id` - 获取产品详情

### 文章管理
- `POST /enterprise-homepage/articles` - 创建文章
- `PUT /enterprise-homepage/articles/:id` - 更新文章
- `DELETE /enterprise-homepage/articles/:id` - 删除文章
- `GET /enterprise-homepage/articles` - 获取文章列表
- `GET /enterprise-homepage/articles/:id` - 获取文章详情

### 案例管理
- `POST /enterprise-homepage/cases` - 创建案例
- `PUT /enterprise-homepage/cases/:id` - 更新案例
- `DELETE /enterprise-homepage/cases/:id` - 删除案例
- `GET /enterprise-homepage/cases` - 获取案例列表
- `GET /enterprise-homepage/cases/:id` - 获取案例详情

### 主页设置管理
- `POST /enterprise-homepage/settings` - 创建或更新主页设置
- `GET /enterprise-homepage/settings/:enterpriseId` - 获取主页设置

### 完整数据获取
- `GET /enterprise-homepage/homepage/:enterpriseId` - 获取企业主页完整数据

## 前端页面

### 管理页面
- `/pages/enterprise/homepage` - 企业主页管理页面

### 展示页面
- `/pages/enterprise/detail` - 企业主页展示页面

## 使用说明

### 1. 数据库初始化
执行 `schema.sql` 文件中的SQL语句创建数据库表结构和示例数据。

### 2. 后端启动
确保后端服务正常运行，企业主页模块的路由已注册。

### 3. 前端配置
在 `pages.json` 中已添加相关页面路由配置。

### 4. 功能使用
- 企业用户可以通过管理页面配置自己的主页内容
- 访客可以通过展示页面查看企业的完整主页信息
- 支持轮播图、产品、文章、案例等内容的展示
- 提供联系信息和地图定位功能

## 技术特点

1. **模块化设计** - 清晰的数据结构和API接口
2. **响应式布局** - 适配不同设备屏幕
3. **个性化设置** - 支持主题色、布局等自定义
4. **SEO优化** - 支持SEO标题、描述、关键词设置
5. **数据安全** - 完善的权限验证和数据验证
6. **扩展性强** - 易于添加新功能和模块
7. **统一验证** - 使用express-validator进行参数验证
8. **错误处理** - 统一的错误处理和响应格式
9. **Token验证** - 集成项目的token中间件验证机制
10. **数据库操作** - 使用rpcPost方法进行统一的数据库操作

## 注意事项

1. 图片上传需要配置相应的存储服务
2. 地图功能需要配置地图API密钥
3. 企业ID需要与用户系统关联
4. 建议添加数据缓存机制提升性能
5. 生产环境需要配置HTTPS和域名 