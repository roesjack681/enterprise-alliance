-- 服务产品表
CREATE TABLE IF NOT EXISTS `service_products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL COMMENT '服务标题',
  `description` text NOT NULL COMMENT '服务描述',
  `category_id` int(11) NOT NULL COMMENT '分类ID',
  `sub_category_id` int(11) NOT NULL COMMENT '子分类ID',
  `tags` text COMMENT '标签，JSON格式',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '价格',
  `price_type` tinyint(1) NOT NULL DEFAULT '1' COMMENT '价格类型：1-固定价格，2-议价',
  `unit` varchar(20) NOT NULL COMMENT '计价单位',
  `province` int(11) NOT NULL COMMENT '服务省份',
  `city` int(11) NOT NULL COMMENT '服务城市',
  `district` int(11) NOT NULL COMMENT '服务区县',
  `address` varchar(255) NOT NULL COMMENT '详细地址',
  `contact_name` varchar(50) NOT NULL COMMENT '联系人',
  `contact_phone` varchar(20) NOT NULL COMMENT '联系电话',
  `contact_wechat` varchar(50) DEFAULT NULL COMMENT '微信号',
  `images` text COMMENT '服务图片，JSON格式',
  `videos` text COMMENT '服务视频，JSON格式',
  `service_area` varchar(255) NOT NULL COMMENT '服务区域',
  `service_time` varchar(255) NOT NULL COMMENT '服务时间',
  `qualification` text COMMENT '资质证书，JSON格式',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态：0-草稿，1-待审核，2-已发布，3-已下架,4-删除',
  `view_count` int(11) NOT NULL DEFAULT '0' COMMENT '浏览次数',
  `favorite_count` int(11) NOT NULL DEFAULT '0' COMMENT '收藏次数',
  `entity_id` int(11) NOT NULL COMMENT  '发布企业ID',
  `create_time` int(11) NOT NULL COMMENT DEFAULT '0' '创建时间',
  `update_time` int(11) NOT NULL COMMENT DEFAULT '0' '更新时间',
  `audit_time` int(11) DEFAULT NULL COMMENT DEFAULT '0' '审核时间',
  `audit_user_id` int(11) DEFAULT NULL COMMENT '审核人ID',
  `audit_remark` varchar(500) DEFAULT NULL COMMENT '审核备注',
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_sub_category` (`sub_category_id`),
  KEY `idx_entity` (`entity_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`),
  KEY `idx_province_city` (`province`, `city`, `district`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务产品表';

-- 服务收藏表
CREATE TABLE IF NOT EXISTS `service_favorites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `service_id` int(11) NOT NULL COMMENT '服务ID',
  `entity_id` int(11) NOT NULL COMMENT '企业ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_service_entity` (`service_id`, `entity_id`),
  KEY `idx_entity` (`entity_id`),
  KEY `idx_service` (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务收藏表';

-- 服务浏览记录表
CREATE TABLE IF NOT EXISTS `service_views` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `service_id` int(11) NOT NULL COMMENT '服务ID',
  `entity_id` int(11) DEFAULT NULL COMMENT '浏览企业ID',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` text COMMENT '用户代理',
  `view_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '浏览时间',
  PRIMARY KEY (`id`),
  KEY `idx_service` (`service_id`),
  KEY `idx_entity` (`entity_id`),
  KEY `idx_view_time` (`view_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务浏览记录表';

-- 服务评价表
CREATE TABLE IF NOT EXISTS `service_reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `service_id` int(11) NOT NULL COMMENT '服务ID',
  `entity_id` int(11) NOT NULL COMMENT '评价企业ID',
  `rating` tinyint(1) NOT NULL COMMENT '评分：1-5',
  `content` text COMMENT '评价内容',
  `images` text COMMENT '评价图片，JSON格式',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：0-隐藏，1-显示',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '评价时间',
  `update_time` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_service` (`service_id`),
  KEY `idx_entity` (`entity_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务评价表';

-- 服务咨询表
CREATE TABLE IF NOT EXISTS `service_inquiries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `service_id` int(11) NOT NULL COMMENT '服务ID',
  `from_entity_id` int(11) NOT NULL COMMENT '咨询企业ID',
  `to_entity_id` int(11) NOT NULL COMMENT '服务提供企业ID',
  `content` text NOT NULL COMMENT '咨询内容',
  `images` text COMMENT '咨询图片，JSON格式',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态：0-未读，1-已读，2-已回复',
  `reply_content` text COMMENT '回复内容',
  `reply_time` datetime DEFAULT NULL COMMENT '回复时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '咨询时间',
  PRIMARY KEY (`id`),
  KEY `idx_service` (`service_id`),
  KEY `idx_from_entity` (`from_entity_id`),
  KEY `idx_to_entity` (`to_entity_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务咨询表'; 