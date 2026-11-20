-- 企业主页轮播图表
CREATE TABLE IF NOT EXISTS `enterprise_banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enterprise_id` int(11) NOT NULL COMMENT '企业ID',
  `title` varchar(255) NOT NULL COMMENT '轮播图标题',
  `image_url` varchar(500) NOT NULL COMMENT '图片URL',
  `link_url` varchar(500) DEFAULT NULL COMMENT '链接URL',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '是否激活',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1正常，0删除',
  PRIMARY KEY (`id`),
  KEY `idx_enterprise_id` (`enterprise_id`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业主页轮播图表';

-- 企业关于我们表
CREATE TABLE IF NOT EXISTS `enterprise_about` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enterprise_id` int(11) NOT NULL COMMENT '企业ID',
  `company_name` varchar(255) NOT NULL COMMENT '公司名称',
  `description` text COMMENT '公司描述',
  `vision` text COMMENT '企业愿景',
  `mission` text COMMENT '企业使命',
  `values` text COMMENT '企业价值观',
  `history` text COMMENT '发展历程',
  `team_intro` text COMMENT '团队介绍',
  `logo_url` varchar(500) DEFAULT NULL COMMENT 'Logo URL',
  `cover_image` varchar(500) DEFAULT NULL COMMENT '封面图片URL',
  `contact_info` json DEFAULT NULL COMMENT '联系信息JSON',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1正常，0删除',
  `created_at` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  `updated_at` int(11) NOT NULL DEFAULT 0  COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_enterprise_id` (`enterprise_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业关于我们表';

-- 企业联系信息表
CREATE TABLE IF NOT EXISTS `enterprise_contact` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enterprise_id` int(11) NOT NULL COMMENT '企业ID',
  `contact_person` varchar(100) DEFAULT NULL COMMENT '联系人',
  `phone` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `email` varchar(100) DEFAULT NULL COMMENT '邮箱',
  `address` varchar(500) DEFAULT NULL COMMENT '地址',
  `website` varchar(200) DEFAULT NULL COMMENT '网站',
  `wechat` varchar(100) DEFAULT NULL COMMENT '微信号',
  `qq` varchar(20) DEFAULT NULL COMMENT 'QQ号',
  `work_time` varchar(100) DEFAULT NULL COMMENT '工作时间',
  `latitude` decimal(10,8) DEFAULT NULL COMMENT '纬度',
  `longitude` decimal(11,8) DEFAULT NULL COMMENT '经度',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1正常，0删除',
  `created_at` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  `updated_at` int(11) NOT NULL DEFAULT 0  COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_enterprise_id` (`enterprise_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业联系信息表';

-- 企业产品表
CREATE TABLE IF NOT EXISTS `enterprise_products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enterprise_id` int(11) NOT NULL COMMENT '企业ID',
  `name` varchar(255) NOT NULL COMMENT '产品名称',
  `description` text COMMENT '产品描述',
  `features` text COMMENT '产品特点',
  `price` DECIMAL(8,2) DEFAULT NULL COMMENT '价格范围',
  `thumb` varchar(300) DEFAULT NULL COMMENT '产品缩略图',
  `image_urls` json DEFAULT NULL COMMENT '产品图片URL数组',
  `category_id` int(11) DEFAULT NULL COMMENT '分类ID，关联enterprise_category',
  `tags` json DEFAULT NULL COMMENT '产品标签数组',
  `is_featured` tinyint(1) DEFAULT 0 COMMENT '是否推荐',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态',
  `created_at` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  `updated_at` int(11) NOT NULL DEFAULT 0  COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_enterprise_id` (`enterprise_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_is_featured` (`is_featured`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业产品表';

-- 企业文章表
CREATE TABLE IF NOT EXISTS `enterprise_articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enterprise_id` int(11) NOT NULL COMMENT '企业ID',
  `title` varchar(255) NOT NULL COMMENT '文章标题',
  `content` longtext COMMENT '文章内容',
  `summary` text COMMENT '文章摘要',
  `cover_image` varchar(300) DEFAULT NULL COMMENT '封面图片URL',
  `category_id` int(11) DEFAULT NULL COMMENT '分类ID，关联enterprise_category',
  `tags` json DEFAULT NULL COMMENT '文章标签数组',
  `author` varchar(100) DEFAULT NULL COMMENT '作者',
  `view_count` int(11) DEFAULT 0 COMMENT '浏览量',
  `is_published` tinyint(1) DEFAULT 0 COMMENT '是否发布',
  `published_at` varchar(50) NULL DEFAULT NULL COMMENT '发布时间',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1正常，0删除',
  `created_at` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  `updated_at` int(11) NOT NULL DEFAULT 0  COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_enterprise_id` (`enterprise_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_is_published` (`is_published`),
  KEY `idx_published_at` (`published_at`),
  KEY `idx_view_count` (`view_count`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业文章表';

-- 企业案例表
CREATE TABLE IF NOT EXISTS `enterprise_cases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enterprise_id` int(11) NOT NULL COMMENT '企业ID',
  `title` varchar(255) NOT NULL COMMENT '案例标题',
  `description` text COMMENT '案例简述',
  `content` longtext COMMENT '案例详细内容',
  `cover_image` varchar(300) DEFAULT NULL COMMENT '封面图片URL',
  `image_urls` json DEFAULT NULL COMMENT '案例图片URL数组',
  `video_url` varchar(300) DEFAULT NULL COMMENT '视频URL',
  `category_id` int(11) DEFAULT NULL COMMENT '分类ID，关联enterprise_category',
  `is_featured` tinyint(1) DEFAULT 0 COMMENT '是否推荐',
  `is_published` tinyint(1) DEFAULT 0 COMMENT '是否发布',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1正常，0删除',
  `created_at` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  `updated_at` int(11) NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_enterprise_id` (`enterprise_id`), 
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_is_featured` (`is_featured`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业案例表';

-- 企业主页设置表
CREATE TABLE IF NOT EXISTS `enterprise_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enterprise_id` int(11) NOT NULL COMMENT '企业ID', 
  `show_banner` tinyint(1) DEFAULT 1 COMMENT '是否显示轮播图',
  `show_about` tinyint(1) DEFAULT 1 COMMENT '是否显示关于我们',
  `show_products` tinyint(1) DEFAULT 1 COMMENT '是否显示产品',
  `show_articles` tinyint(1) DEFAULT 1 COMMENT '是否显示文章',
  `show_cases` tinyint(1) DEFAULT 1 COMMENT '是否显示案例',
  `show_contact` tinyint(1) DEFAULT 1 COMMENT '是否显示联系信息', 
  `seo_title` varchar(255) DEFAULT NULL COMMENT 'SEO标题',
  `seo_description` varchar(500) DEFAULT NULL COMMENT 'SEO描述',
  `seo_keywords` varchar(500) DEFAULT NULL COMMENT 'SEO关键词',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1正常，0删除',
  `created_at` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  `updated_at` int(11) NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_enterprise_id` (`enterprise_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业主页设置表';

-- 企业分类表
CREATE TABLE IF NOT EXISTS `enterprise_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `enterprise_id` int(11) NOT NULL COMMENT '企业ID',
  `name` varchar(100) NOT NULL COMMENT '分类名称',
  `type` enum('product','article','case') NOT NULL COMMENT '分类类型',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：1正常，0删除',
  `created_at` int(11) NOT NULL DEFAULT 0 COMMENT '创建时间',
  `updated_at` int(11) NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_enterprise_id` (`enterprise_id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业分类表';

-- 插入示例数据
INSERT INTO `enterprise_banners` (`enterprise_id`, `title`, `image_url`, `link_url`, `sort_order`, `is_active`) VALUES
(1, '企业服务轮播图1', '/static/img/banner1.jpg', '/pages/service/list', 1, 1),
(1, '企业服务轮播图2', '/static/img/banner2.jpg', '/pages/about', 2, 1),
(1, '企业服务轮播图3', '/static/img/banner3.jpg', '/pages/contact', 3, 1);

INSERT INTO `enterprise_about` (`enterprise_id`, `company_name`, `description`, `vision`, `mission`, `values`, `history`, `team_intro`, `logo_url`, `cover_image`, `contact_info`) VALUES
(1, '未来科技有限公司', '专注于为企业提供数字化转型解决方案', '成为企业数字化转型的引领者', '用科技赋能企业，推动产业升级', '创新、专业、诚信、共赢', '公司成立于2020年，专注于企业服务领域...', '我们拥有一支经验丰富的专业团队...', '/static/img/logo.png', '/static/img/about-cover.jpg', '{"phone":"400-123-4567","email":"contact@futuretech.com","address":"北京市朝阳区科技园区","website":"www.futuretech.com"}');

INSERT INTO `enterprise_contact` (`enterprise_id`, `contact_person`, `phone`, `email`, `address`, `website`, `wechat`, `qq`, `work_time`, `latitude`, `longitude`) VALUES
(1, '张经理', '400-123-4567', 'contact@futuretech.com', '北京市朝阳区科技园区未来大厦A座1001室', 'www.futuretech.com', 'futuretech_service', '123456789', '周一至周五 9:00-18:00', 39.9042, 116.4074);

INSERT INTO `enterprise_products` (`enterprise_id`, `name`, `description`, `features`, `price`, `thumb`, `image_urls`, `category_id`, `tags`, `is_featured`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
(1, '智能客服系统', '基于AI的智能客服解决方案', '24小时在线服务、智能问答、多语言支持', 0, '/static/img/product1.jpg', '["/static/img/product1.jpg","/static/img/product1-2.jpg"]', 1, '["AI","客服","自动化"]', 1, 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(1, '数据分析平台', '企业级数据分析与可视化平台', '实时数据监控、智能报表、预测分析', 0, '/static/img/product2.jpg', '["/static/img/product2.jpg"]', 2, '["数据分析","可视化","BI"]', 1, 2, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(1, '云存储解决方案', '安全可靠的企业云存储服务', '高可用性、数据加密、自动备份', 0, '/static/img/product3.jpg', '["/static/img/product3.jpg"]', 3, '["云存储","安全","备份"]', 0, 3, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

INSERT INTO `enterprise_articles` (`enterprise_id`, `title`, `content`, `summary`, `cover_image`, `category_id`, `tags`, `author`, `view_count`, `is_published`, `published_at`, `status`, `created_at`, `updated_at`) VALUES
(1, '数字化转型：企业发展的必由之路', '在当今数字化时代，企业数字化转型已成为企业发展的必由之路。随着技术的不断进步和市场竞争的加剧，企业必须通过数字化转型来提升效率、降低成本、增强竞争力。本文将从多个角度探讨企业数字化转型的重要性和实施策略。', '探讨企业数字化转型的重要性和实施策略', '/static/img/article1.jpg', 1, '["数字化转型","企业发展","技术趋势"]', '张专家', 1250, 1, UNIX_TIMESTAMP(), 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(1, 'AI技术在企业服务中的应用前景', '人工智能技术的快速发展为企业服务带来了前所未有的机遇。从智能客服到数据分析，从自动化流程到预测性维护，AI技术正在重塑企业服务的方方面面。本文将深入分析AI技术在企业服务领域的应用前景和发展趋势。', '分析AI技术在企业服务领域的应用前景', '/static/img/article2.jpg', 2, '["AI","企业服务","技术应用"]', '李博士', 890, 1, UNIX_TIMESTAMP(), 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(1, '如何构建高效的企业数据平台', '企业数据平台是企业数字化转型的核心基础设施。一个高效的数据平台能够帮助企业实现数据的统一管理、实时分析和智能决策。本文将详细介绍企业数据平台的构建方法和最佳实践。', '详细介绍企业数据平台的构建方法和最佳实践', '/static/img/article3.jpg', 3, '["数据平台","架构设计","最佳实践"]', '王工程师', 756, 1, UNIX_TIMESTAMP(), 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

INSERT INTO `enterprise_cases` (`enterprise_id`, `title`, `description`, `content`, `cover_image`, `image_urls`, `video_url`, `category_id`, `is_featured`, `is_published`, `sort_order`, `status`, `created_at`, `updated_at`) VALUES
(1, '某大型制造企业数字化转型项目', '为某大型制造企业提供全面的数字化转型解决方案', '为某大型制造企业提供全面的数字化转型解决方案，包括构建统一的数据平台，实施智能生产管理系统，建立数据分析体系。项目成果：生产效率提升35%，运营成本降低20%，决策效率提升50%。', '/static/img/case1.jpg', '["/static/img/case1.jpg","/static/img/case1-2.jpg"]', '/static/video/case1.mp4', 1, 1, 1, 1, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(1, '金融科技公司智能客服系统', '为金融科技公司定制智能客服系统', '为金融科技公司定制智能客服系统，部署AI智能客服系统，集成知识库，实现7*24小时服务。项目成果：客服成本降低60%，客户满意度提升40%，响应时间缩短80%。', '/static/img/case2.jpg', '["/static/img/case2.jpg"]', NULL, 2, 1, 1, 2, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
(1, '电商平台数据分析平台', '为电商平台构建数据分析平台', '为电商平台构建数据分析平台，构建统一数据分析平台，实现实时监控和智能分析。项目成果：数据分析效率提升70%，业务洞察能力显著增强。', '/static/img/case3.jpg', '["/static/img/case3.jpg"]', NULL, 3, 0, 1, 3, 1, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

INSERT INTO `enterprise_settings` (`enterprise_id`, `show_banner`, `show_about`, `show_products`, `show_articles`, `show_cases`, `show_contact`, `seo_title`, `seo_description`, `seo_keywords`) VALUES
(1, 1, 1, 1, 1, 1, 1, '未来科技 - 企业数字化转型专家', '未来科技专注于为企业提供数字化转型解决方案，包括智能客服、数据分析、云存储等服务', '企业服务,数字化转型,AI客服,数据分析,云存储'); 