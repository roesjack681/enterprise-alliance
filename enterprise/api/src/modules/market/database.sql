-- 经纪人功能模块数据库表结构

-- 经纪人统计表
CREATE TABLE `market_stats` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `broker_id` int(11) NOT NULL COMMENT '经纪人ID',
  `total_guests` int(11) DEFAULT '0' COMMENT '联系客户总数',
  `active_guests` int(11) DEFAULT '0' COMMENT '活跃客户数',
  `success_rate` decimal(5,2) DEFAULT '0.00' COMMENT '成功率(%)',
  `in_progress` int(11) DEFAULT '0' COMMENT '进行中项目数',
  `completed` int(11) DEFAULT '0' COMMENT '已完成项目数',
  `pending` int(11) DEFAULT '0' COMMENT '待跟进项目数',
  `monthly_income` decimal(10,2) DEFAULT '0.00' COMMENT '本月佣金',
  `total_income` decimal(10,2) DEFAULT '0.00' COMMENT '总收入',
  `this_month_deals` int(11) DEFAULT '0' COMMENT '本月成交数',
  `last_update_time` int(11) DEFAULT '0' COMMENT '最后更新时间',
  `create_time` int(11) DEFAULT '0' COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_broker` (`broker_id`),
  KEY `idx_broker_id` (`broker_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='经纪人统计表';

-- 经纪人客户关系表
CREATE TABLE `market_guest` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `broker_id` int(11) NOT NULL COMMENT '经纪人ID',
  `entity_id` int(11) NOT NULL COMMENT '企业ID',
  `enterprise_name` varchar(200) DEFAULT '' COMMENT '企业名称',
  `logo` varchar(200) DEFAULT '' COMMENT '企业logo',
  `contact_person` varchar(100) DEFAULT '' COMMENT '联系人',
  `contact_phone` varchar(20) DEFAULT '' COMMENT '联系电话',
  `contact_email` varchar(100) DEFAULT '' COMMENT '联系邮箱',
  `status` int(11) NOT NULL DEFAULT '0' COMMENT '联系状态: 0-待沟通 1-已沟通 2-跟进中 3-成交 4-已失效',
  `tags` text DEFAULT NULL COMMENT '客户标签(JSON格式)',
  `remark` text DEFAULT NULL COMMENT '备注信息',
  `success_rate` tinyint(1) DEFAULT '0' COMMENT '成功率评估: 0-5',
  `follow_up_count` int(11) DEFAULT '0' COMMENT '跟进次数',
  `last_contact_time` int(11) DEFAULT '0' COMMENT '最后联系时间',
  `next_contact_time` int(11) DEFAULT '0' COMMENT '下次联系时间',
  `total_orders` int(11) DEFAULT '0' COMMENT '总订单数',
  `total_amount` decimal(10,2) DEFAULT '0.00' COMMENT '总成交金额',
  `province` int(11) DEFAULT '0' COMMENT '省份',
  `city` int(11) DEFAULT '0' COMMENT '城市',
  `create_time` int(11) DEFAULT '0' COMMENT '创建时间',
  `update_time` int(11) DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`id`),
  
  UNIQUE KEY `unique_broker_entity` (`broker_id`, `entity_id`),
  KEY `idx_broker_id` (`broker_id`),
  KEY `idx_entity_id` (`entity_id`),
  KEY `idx_status` (`status`),
  KEY `idx_last_contact_time` (`last_contact_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='经纪人客户关系表';

-- 经纪人需求跟进表
CREATE TABLE `market_need` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `broker_id` int(11) NOT NULL COMMENT '经纪人ID',
  `demand_id` int(11) NOT NULL COMMENT '需求ID',
  `entity_id` int(11) NOT NULL COMMENT '企业ID',
  `demand_title` varchar(200) DEFAULT '' COMMENT '需求标题',
  `demand_type` tinyint(1) DEFAULT '1' COMMENT '需求类型: 1-需求 2-求购 3-货物 4-服务 5-易货',
  `budget_price` decimal(10,2) DEFAULT '0.00' COMMENT '预算价格',
  `status` int(11) NOT NULL DEFAULT '0' COMMENT '跟进状态: 0-关注 1-已联系 2-报价 3-跟进中 4-成交 5-失败',
  `contact_method` varchar(50) DEFAULT '' COMMENT '联系方式: 电话/微信/邮件/面谈',
  `quoted_price` decimal(10,2) DEFAULT '0.00' COMMENT '报价金额',
  `success_probability` tinyint(1) DEFAULT '0' COMMENT '成功概率: 0-100',
  `competitor_count` int(11) DEFAULT '0' COMMENT '竞争对手数量',
  `remark` text DEFAULT NULL COMMENT '跟进备注',
  `next_follow_time` int(11) DEFAULT '0' COMMENT '下次跟进时间',
  `first_contact_time` int(11) DEFAULT '0' COMMENT '首次联系时间',
  `last_follow_time` int(11) DEFAULT '0' COMMENT '最后跟进时间',
  `priority` tinyint(1) DEFAULT '1' COMMENT '优先级: 1-低 2-中 3-高 4-紧急',
  `create_time` int(11) DEFAULT '0' COMMENT '创建时间',
  `update_time` int(11) DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_broker_demand` (`broker_id`, `demand_id`),
  KEY `idx_broker_id` (`broker_id`),
  KEY `idx_demand_id` (`demand_id`),
  KEY `idx_entity_id` (`entity_id`),
  KEY `idx_status` (`status`),
  KEY `idx_next_follow_time` (`next_follow_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='经纪人需求跟进表';

-- 经纪人操作历史表
CREATE TABLE `market_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `broker_id` int(11) NOT NULL COMMENT '经纪人ID',
  `action_type` varchar(50) NOT NULL COMMENT '操作类型: contact/follow_up/quote/close_deal/add_remark',
  `target_type` varchar(20) NOT NULL COMMENT '目标类型: guest/need/task',
  `target_id` int(11) NOT NULL COMMENT '目标ID',
  `title` varchar(200) NOT NULL COMMENT '操作标题',
  `content` text DEFAULT NULL COMMENT '操作内容',
  `result` varchar(100) DEFAULT '' COMMENT '操作结果',
  `extra_data` text DEFAULT NULL COMMENT '额外数据(JSON格式)',
  `ip_address` varchar(45) DEFAULT '' COMMENT 'IP地址',
  `user_agent` varchar(500) DEFAULT '' COMMENT '用户代理',
  `create_time` int(11) DEFAULT '0' COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_broker_id` (`broker_id`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_target` (`target_type`, `target_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='经纪人操作历史表';

-- 经纪人待办事项表
CREATE TABLE `market_task` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `broker_id` int(11) NOT NULL COMMENT '经纪人ID',
  `title` varchar(200) NOT NULL COMMENT '任务标题',
  `content` text DEFAULT NULL COMMENT '任务内容',
  `task_type` varchar(50) NOT NULL COMMENT '任务类型: follow_up/quote/meeting/call/other',
  `priority` tinyint(1) DEFAULT '1' COMMENT '优先级: 1-低 2-中 3-高 4-紧急',
  `status` tinyint(1) DEFAULT '0' COMMENT '状态: 0-待处理 1-处理中 2-已完成 3-已取消',
  `related_type` varchar(20) DEFAULT '' COMMENT '关联类型: guest/need',
  `related_id` int(11) DEFAULT '0' COMMENT '关联ID',
  `scheduled_time` int(11) DEFAULT '0' COMMENT '计划执行时间',
  `completed_time` int(11) DEFAULT '0' COMMENT '完成时间',
  `reminder_time` int(11) DEFAULT '0' COMMENT '提醒时间',
  `is_reminded` tinyint(1) DEFAULT '0' COMMENT '是否已提醒: 0-未提醒 1-已提醒',
  `estimated_duration` int(11) DEFAULT '0' COMMENT '预计耗时(分钟)',
  `actual_duration` int(11) DEFAULT '0' COMMENT '实际耗时(分钟)',
  `remark` text DEFAULT NULL COMMENT '备注',
  `create_time` int(11) DEFAULT '0' COMMENT '创建时间',
  `update_time` int(11) DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_broker_id` (`broker_id`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_task_type` (`task_type`),
  KEY `idx_related` (`related_type`, `related_id`),
  KEY `idx_scheduled_time` (`scheduled_time`),
  KEY `idx_reminder_time` (`reminder_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='经纪人待办事项表';

-- 经纪人用户说明：
-- 经纪人使用现有的entities表，role字段设为10
-- 可以考虑为entities表添加经纪人相关字段：
-- ALTER TABLE `entities` ADD COLUMN `broker_level` tinyint(1) DEFAULT '1' COMMENT '经纪人等级: 1-初级 2-中级 3-高级 4-专家';
-- ALTER TABLE `entities` ADD COLUMN `certification_status` tinyint(1) DEFAULT '0' COMMENT '认证状态: 0-未认证 1-已认证 2-认证失败';
-- ALTER TABLE `entities` ADD COLUMN `specialty_areas` text DEFAULT NULL COMMENT '专业领域(JSON格式)';
-- ALTER TABLE `entities` ADD COLUMN `service_regions` text DEFAULT NULL COMMENT '服务区域(JSON格式)';

-- 创建复合索引以优化查询性能
CREATE INDEX `idx_market_guest_broker_status` ON `market_guest` (`broker_id`, `status`, `last_contact_time`);
CREATE INDEX `idx_market_need_broker_status` ON `market_need` (`broker_id`, `status`, `next_follow_time`);
CREATE INDEX `idx_market_task_broker_status` ON `market_task` (`broker_id`, `status`, `scheduled_time`);