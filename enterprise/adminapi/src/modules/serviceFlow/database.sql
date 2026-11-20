-- ========================================
-- 服务流程管理模块数据库表结构
-- ========================================

-- 1. 服务订单表
CREATE TABLE IF NOT EXISTS `service_order` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(64) NOT NULL UNIQUE COMMENT '订单ID',
  `user_id` VARCHAR(64) NOT NULL COMMENT '用户ID',
  `service_id` INT NOT NULL COMMENT '服务产品ID（关联service_products.id，通过service_products.category_id查询流程模板）',
  `provider_id` INT NULL COMMENT '服务商ID（提供服务的企业ID）',
  `title` VARCHAR(200) NOT NULL COMMENT '服务名称',
  `service_type` ENUM('one_time', 'recurring') NOT NULL COMMENT '服务类型：一次性/周期性',
  `status` ENUM('Pending', 'Active', 'Paused', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending' COMMENT '订单状态',
  `current_step` VARCHAR(100) NOT NULL DEFAULT '订单确认' COMMENT '当前流程步骤',
  `start_date` BIGINT NOT NULL COMMENT '服务开始时间戳',
  `end_date` BIGINT NULL COMMENT '服务结束时间戳',
  `cycle_months` INT NULL COMMENT '周期服务月数',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '服务价格',
  `remarks` TEXT NULL COMMENT '订单备注',
  `create_time` BIGINT NOT NULL COMMENT '创建时间戳',
  `update_time` BIGINT NOT NULL COMMENT '更新时间戳',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_service_id` (`service_id`),
  INDEX `idx_provider_id` (`provider_id`),
  INDEX `idx_provider_status` (`provider_id`, `status`),
  INDEX `idx_provider_type` (`provider_id`, `service_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_service_type` (`service_type`),
  INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务订单表';

-- 2. 流程模板表
CREATE TABLE IF NOT EXISTS `process_template` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `template_id` VARCHAR(64) NOT NULL UNIQUE COMMENT '模板ID',
  `service_id` INT NOT NULL COMMENT '关联服务分类ID',
  `template_name` VARCHAR(100) NOT NULL COMMENT '模板名称',
  `steps_json` JSON NOT NULL COMMENT '流程步骤JSON数组',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否激活',
  `version` VARCHAR(20) NOT NULL DEFAULT '1.0' COMMENT '版本号',
  `description` TEXT NULL COMMENT '模板描述',
  `created_by` VARCHAR(64) NULL COMMENT '创建者',
  `create_time` BIGINT NOT NULL COMMENT '创建时间戳',
  `update_time` BIGINT NOT NULL COMMENT '更新时间戳',
  INDEX `idx_service_id` (`service_id`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程模板表';

-- 3. 流程实例表
CREATE TABLE IF NOT EXISTS `process_instance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `instance_id` VARCHAR(64) NOT NULL UNIQUE COMMENT '实例ID',
  `order_id` VARCHAR(64) NOT NULL COMMENT '关联订单ID',
  `template_id` VARCHAR(64) NOT NULL COMMENT '流程模板ID',
  `current_step` VARCHAR(100) NOT NULL COMMENT '当前步骤名称',
  `current_sequence` INT NOT NULL DEFAULT 1 COMMENT '当前步骤序号',
  `status` ENUM('NotStarted', 'InProgress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'NotStarted' COMMENT '实例状态',
  `assigned_staff` VARCHAR(64) NULL COMMENT '分配的工作人员',
  `create_time` BIGINT NOT NULL COMMENT '创建时间戳',
  `update_time` BIGINT NOT NULL COMMENT '更新时间戳',
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_template_id` (`template_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_assigned_staff` (`assigned_staff`),
  INDEX `idx_current_step` (`current_step`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程实例表';

-- 4. 流程步骤历史表
CREATE TABLE IF NOT EXISTS `process_step_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `history_id` VARCHAR(64) NOT NULL UNIQUE COMMENT '历史记录ID',
  `order_id` VARCHAR(64) NOT NULL COMMENT '关联订单ID',
  `instance_id` VARCHAR(64) NOT NULL COMMENT '关联流程实例ID',
  `step` VARCHAR(100) NOT NULL COMMENT '步骤名称',
  `sequence` INT NOT NULL COMMENT '步骤序号',
  `role` VARCHAR(50) NOT NULL COMMENT '步骤角色',
  `description` TEXT NOT NULL COMMENT '步骤描述',
  `estimated_days` INT NOT NULL DEFAULT 1 COMMENT '预计天数',
  `required_files` JSON NULL COMMENT '需要的文件',
  `approval_required` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否需要审批',
  `auto_advance` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否自动推进',
  `status` ENUM('NotStarted', 'InProgress', 'Completed', 'Cancelled', 'Overdue') NOT NULL DEFAULT 'NotStarted' COMMENT '步骤状态',
  `start_time` BIGINT NULL COMMENT '步骤开始时间戳',
  `end_time` BIGINT NULL COMMENT '步骤结束时间戳',
  `operator_id` VARCHAR(64) NULL COMMENT '操作人ID',
  `operator_name` VARCHAR(100) NULL COMMENT '操作人姓名',
  `operator_type` ENUM('admin', 'enterprise', 'service_provider', 'system') NULL COMMENT '操作人类型',
  `remarks` TEXT NULL COMMENT '操作备注',
  `create_time` BIGINT NOT NULL COMMENT '创建时间戳',
  `update_time` BIGINT NOT NULL COMMENT '更新时间戳',
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_instance_id` (`instance_id`),
  INDEX `idx_step` (`step`),
  INDEX `idx_sequence` (`sequence`),
  INDEX `idx_status` (`status`),
  INDEX `idx_start_time` (`start_time`),
  INDEX `idx_end_time` (`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程步骤历史表';

-- 5. 告警表
CREATE TABLE IF NOT EXISTS `process_alert` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `alert_id` VARCHAR(64) NOT NULL UNIQUE COMMENT '告警ID',
  `order_id` VARCHAR(64) NOT NULL COMMENT '关联订单ID',
  `instance_id` VARCHAR(64) NULL COMMENT '关联流程实例ID',
  `alert_type` ENUM('Overdue', 'StepDelay', 'ClientFeedback', 'SystemError') NOT NULL COMMENT '告警类型',
  `severity` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium' COMMENT '严重程度',
  `message` TEXT NOT NULL COMMENT '告警消息',
  `is_resolved` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已解决',
  `resolved_by` VARCHAR(64) NULL COMMENT '解决人',
  `solution` TEXT NULL COMMENT '解决方案',
  `create_time` BIGINT NOT NULL COMMENT '创建时间戳',
  `resolve_time` BIGINT NULL COMMENT '解决时间戳',
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_instance_id` (`instance_id`),
  INDEX `idx_alert_type` (`alert_type`),
  INDEX `idx_severity` (`severity`),
  INDEX `idx_is_resolved` (`is_resolved`),
  INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程告警表';

-- 6. 操作日志表
CREATE TABLE IF NOT EXISTS `service_operation_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `log_id` VARCHAR(64) NOT NULL UNIQUE COMMENT '日志ID',
  `order_id` VARCHAR(64) NOT NULL COMMENT '关联订单ID',
  `operation_type` VARCHAR(50) NOT NULL COMMENT '操作类型',
  `operator_id` VARCHAR(64) NOT NULL COMMENT '操作人ID',
  `operator_name` VARCHAR(100) NULL COMMENT '操作人姓名',
  `operation_details` JSON NULL COMMENT '操作详情JSON',
  `old_value` TEXT NULL COMMENT '变更前值',
  `new_value` TEXT NULL COMMENT '变更后值',
  `ip_address` VARCHAR(45) NULL COMMENT '操作IP地址',
  `user_agent` TEXT NULL COMMENT '用户代理',
  `create_time` BIGINT NOT NULL COMMENT '创建时间戳',
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_operation_type` (`operation_type`),
  INDEX `idx_operator_id` (`operator_id`),
  INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务操作日志表';

-- 7. 附件文件表
CREATE TABLE IF NOT EXISTS `service_attachment` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `attachment_id` VARCHAR(64) NOT NULL UNIQUE COMMENT '附件ID',
  `order_id` VARCHAR(64) NOT NULL COMMENT '关联订单ID',
  `step_name` VARCHAR(100) NOT NULL COMMENT '关联步骤名称',
  `file_name` VARCHAR(255) NOT NULL COMMENT '文件名',
  `file_path` VARCHAR(500) NOT NULL COMMENT '文件路径',
  `file_size` BIGINT NOT NULL DEFAULT 0 COMMENT '文件大小(字节)',
  `file_type` VARCHAR(100) NULL COMMENT '文件类型',
  `upload_by` VARCHAR(64) NOT NULL COMMENT '上传人ID',
  `upload_time` BIGINT NOT NULL COMMENT '上传时间戳',
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_step_name` (`step_name`),
  INDEX `idx_upload_by` (`upload_by`),
  INDEX `idx_upload_time` (`upload_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务附件表';

-- 8. 服务分类表 (如果不存在则创建)
CREATE TABLE IF NOT EXISTS `category` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `pid` INT NOT NULL DEFAULT 0 COMMENT '父级分类ID',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态 1-启用 0-禁用',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '排序号',
  `create_time` BIGINT NOT NULL COMMENT '创建时间戳',
  `update_time` BIGINT NOT NULL COMMENT '更新时间戳',
  INDEX `idx_pid` (`pid`),
  INDEX `idx_status` (`status`),
  INDEX `idx_sort` (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务分类表';

-- ========================================
-- 外键约束
-- ========================================

-- 流程实例表外键
ALTER TABLE `process_instance` 
ADD CONSTRAINT `fk_process_instance_order` 
FOREIGN KEY (`order_id`) REFERENCES `service_order`(`order_id`) ON DELETE CASCADE;

ALTER TABLE `process_instance` 
ADD CONSTRAINT `fk_process_instance_template` 
FOREIGN KEY (`template_id`) REFERENCES `process_template`(`template_id`) ON DELETE RESTRICT;

-- 流程步骤历史表外键
ALTER TABLE `process_step_history` 
ADD CONSTRAINT `fk_step_history_order` 
FOREIGN KEY (`order_id`) REFERENCES `service_order`(`order_id`) ON DELETE CASCADE;

ALTER TABLE `process_step_history` 
ADD CONSTRAINT `fk_step_history_instance` 
FOREIGN KEY (`instance_id`) REFERENCES `process_instance`(`instance_id`) ON DELETE CASCADE;

-- 告警表外键
ALTER TABLE `process_alert` 
ADD CONSTRAINT `fk_alert_order` 
FOREIGN KEY (`order_id`) REFERENCES `service_order`(`order_id`) ON DELETE CASCADE;

ALTER TABLE `process_alert` 
ADD CONSTRAINT `fk_alert_instance` 
FOREIGN KEY (`instance_id`) REFERENCES `process_instance`(`instance_id`) ON DELETE SET NULL;

-- 操作日志表外键
ALTER TABLE `service_operation_log` 
ADD CONSTRAINT `fk_operation_log_order` 
FOREIGN KEY (`order_id`) REFERENCES `service_order`(`order_id`) ON DELETE CASCADE;

-- 附件表外键
ALTER TABLE `service_attachment` 
ADD CONSTRAINT `fk_attachment_order` 
FOREIGN KEY (`order_id`) REFERENCES `service_order`(`order_id`) ON DELETE CASCADE;

-- ========================================
-- 初始化数据
-- ========================================

-- 插入服务分类数据 (对应流程模板中的service_id)
INSERT INTO `category` (`id`, `name`, `pid`, `status`, `sort`, `create_time`, `update_time`) VALUES
(1, '财税服务', 0, 1, 1, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
(2, '人力资源', 0, 1, 2, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
(3, '工商注册', 0, 1, 3, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
(4, '知识产权', 0, 1, 4, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
(5, '科创申报', 0, 1, 5, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
(6, '数字化', 0, 1, 6, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
(7, '创业运营', 0, 1, 7, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
(8, '法律服务', 0, 1, 8, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
(9, '资质认证', 0, 1, 9, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
(10, '融资服务', 0, 1, 10, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
(11, '品牌推广', 0, 1, 11, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
(12, '办公设施', 0, 1, 12, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000)
ON DUPLICATE KEY UPDATE 
name = VALUES(name), 
status = VALUES(status), 
sort = VALUES(sort), 
update_time = VALUES(update_time);

-- 插入默认流程模板示例 (基于设计文档中的所有服务分类)
INSERT INTO `process_template` (`template_id`, `service_id`, `template_name`, `steps_json`, `description`, `created_by`, `create_time`, `update_time`) VALUES

-- 1. 财税服务 (周期性/一次性)
('TPL_ACCOUNTING_001', 1, '会计月度记账流程', 
'[
  {"step": "订单确认", "sequence": 1, "role": "service_provider", "description": "确认订单信息和服务内容", "estimated_days": 1, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "资料收集", "sequence": 2, "role": "enterprise", "description": "客户提供相关财务资料", "estimated_days": 2, "required_files": ["发票", "银行流水", "费用单据"], "approval_required": 1, "auto_advance": 0},
  {"step": "申报处理", "sequence": 3, "role": "service_provider", "description": "处理账务和税务申报", "estimated_days": 3, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "结果交付", "sequence": 4, "role": "service_provider", "description": "交付财务报表和申报结果", "estimated_days": 1, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "审核确认", "sequence": 5, "role": "enterprise", "description": "客户确认交付成果", "estimated_days": 1, "required_files": [], "approval_required": 1, "auto_advance": 0},
  {"step": "完成", "sequence": 6, "role": "system", "description": "服务流程完成", "estimated_days": 0, "required_files": [], "approval_required": 0, "auto_advance": 1}
]', 
'财税服务 - 月度记账标准流程', 'system', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),

-- 2. 人力资源 (周期性)
('TPL_HR_001', 2, '人力资源服务流程', 
'[
  {"step": "订单确认", "sequence": 1, "role": "service_provider", "description": "确认订单信息和服务内容", "estimated_days": 1, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "需求确认", "sequence": 2, "role": "enterprise", "description": "明确人力资源需求和要求", "estimated_days": 2, "required_files": ["岗位说明书", "招聘要求"], "approval_required": 1, "auto_advance": 0},
  {"step": "招聘/派遣", "sequence": 3, "role": "service_provider", "description": "进行人员招聘或派遣", "estimated_days": 15, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "入职手续办理", "sequence": 4, "role": "service_provider", "description": "办理入职相关手续", "estimated_days": 3, "required_files": ["身份证", "学历证书", "劳动合同"], "approval_required": 0, "auto_advance": 0},
  {"step": "过程管理", "sequence": 5, "role": "service_provider", "description": "进行人员管理和跟踪", "estimated_days": 30, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "报告反馈", "sequence": 6, "role": "service_provider", "description": "提供服务报告和反馈", "estimated_days": 2, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "完成", "sequence": 7, "role": "system", "description": "周期服务完成", "estimated_days": 0, "required_files": [], "approval_required": 0, "auto_advance": 1}
]', 
'人力资源 - 周期性服务流程', 'system', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),

-- 3. 工商注册 (一次性)
('TPL_BUSINESS_REG_001', 3, '工商注册申请流程', 
'[
  {"step": "订单确认", "sequence": 1, "role": "service_provider", "description": "确认订单信息和服务内容", "estimated_days": 1, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "资料收集", "sequence": 2, "role": "enterprise", "description": "收集工商注册所需资料", "estimated_days": 2, "required_files": ["身份证", "注册地址证明", "公司章程"], "approval_required": 1, "auto_advance": 0},
  {"step": "材料提交", "sequence": 3, "role": "service_provider", "description": "向工商部门提交申请材料", "estimated_days": 1, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "审核跟进", "sequence": 4, "role": "service_provider", "description": "跟进审核进度和处理反馈", "estimated_days": 10, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "证照领取", "sequence": 5, "role": "service_provider", "description": "领取营业执照等证照", "estimated_days": 2, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "完成", "sequence": 6, "role": "system", "description": "工商注册完成", "estimated_days": 0, "required_files": [], "approval_required": 0, "auto_advance": 1}
]', 
'工商注册 - 一次性服务流程', 'system', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),

-- 4. 知识产权 (一次性)
('TPL_IP_001', 4, '知识产权申请流程', 
'[
  {"step": "需求评估", "sequence": 1, "role": "service_provider", "description": "评估知识产权申请需求和可行性", "estimated_days": 2, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "申请准备", "sequence": 2, "role": "service_provider", "description": "准备知识产权申请材料", "estimated_days": 5, "required_files": ["技术资料", "商标图样", "专利说明书"], "approval_required": 0, "auto_advance": 0},
  {"step": "递交申请", "sequence": 3, "role": "service_provider", "description": "向相关部门递交申请", "estimated_days": 1, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "审查反馈", "sequence": 4, "role": "service_provider", "description": "跟进审查进度和处理反馈", "estimated_days": 180, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "授权/异议处理", "sequence": 5, "role": "service_provider", "description": "处理授权手续或异议", "estimated_days": 30, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "完成", "sequence": 6, "role": "system", "description": "知识产权申请完成", "estimated_days": 0, "required_files": [], "approval_required": 0, "auto_advance": 1}
]', 
'知识产权 - 申请服务流程', 'system', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),

-- 5. 科创申报 (一次性)
('TPL_TECH_REPORT_001', 5, '科创申报服务流程', 
'[
  {"step": "需求确认", "sequence": 1, "role": "service_provider", "description": "确认科创申报需求和项目情况", "estimated_days": 2, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "方案制定", "sequence": 2, "role": "service_provider", "description": "制定申报方案和策略", "estimated_days": 5, "required_files": ["项目资料", "财务报表", "技术文档"], "approval_required": 0, "auto_advance": 0},
  {"step": "申报提交", "sequence": 3, "role": "service_provider", "description": "向政府部门提交申报材料", "estimated_days": 3, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "过程跟踪", "sequence": 4, "role": "service_provider", "description": "跟踪申报进度和处理反馈", "estimated_days": 60, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "审批结果", "sequence": 5, "role": "service_provider", "description": "获取审批结果并通知客户", "estimated_days": 5, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "项目结项", "sequence": 6, "role": "service_provider", "description": "协助完成项目结项工作", "estimated_days": 10, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "完成", "sequence": 7, "role": "system", "description": "科创申报服务完成", "estimated_days": 0, "required_files": [], "approval_required": 0, "auto_advance": 1}
]', 
'科创申报 - 一次性服务流程', 'system', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),

-- 6. 数字化 (周期性)
('TPL_DIGITAL_001', 6, '数字化服务流程', 
'[
  {"step": "需求沟通", "sequence": 1, "role": "service_provider", "description": "深入了解数字化需求", "estimated_days": 3, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "方案设计", "sequence": 2, "role": "service_provider", "description": "设计数字化解决方案", "estimated_days": 10, "required_files": ["需求文档", "系统架构"], "approval_required": 1, "auto_advance": 0},
  {"step": "实施开发", "sequence": 3, "role": "service_provider", "description": "进行系统开发和实施", "estimated_days": 45, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "测试验收", "sequence": 4, "role": "enterprise", "description": "系统测试和用户验收", "estimated_days": 10, "required_files": [], "approval_required": 1, "auto_advance": 0},
  {"step": "交付培训", "sequence": 5, "role": "service_provider", "description": "系统交付和用户培训", "estimated_days": 5, "required_files": ["用户手册", "培训资料"], "approval_required": 0, "auto_advance": 0},
  {"step": "维护支持", "sequence": 6, "role": "service_provider", "description": "提供系统维护和技术支持", "estimated_days": 30, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "完成", "sequence": 7, "role": "system", "description": "数字化服务周期完成", "estimated_days": 0, "required_files": [], "approval_required": 0, "auto_advance": 1}
]', 
'数字化 - 周期性服务流程', 'system', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),

-- 7. 创业运营 (一次性/周期性)
('TPL_STARTUP_001', 7, '创业运营服务流程', 
'[
  {"step": "策划方案", "sequence": 1, "role": "service_provider", "description": "制定创业运营策划方案", "estimated_days": 5, "required_files": ["商业计划书"], "approval_required": 0, "auto_advance": 0},
  {"step": "执行跟进", "sequence": 2, "role": "service_provider", "description": "执行运营方案并跟进", "estimated_days": 20, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "反馈调整", "sequence": 3, "role": "service_provider", "description": "根据反馈调整策略", "estimated_days": 5, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "完成总结", "sequence": 4, "role": "service_provider", "description": "总结服务成果", "estimated_days": 2, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "完成", "sequence": 5, "role": "system", "description": "创业运营服务完成", "estimated_days": 0, "required_files": [], "approval_required": 0, "auto_advance": 1}
]', 
'创业运营 - 项目型服务流程', 'system', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),

-- 8. 法律服务 (一次性)
('TPL_LEGAL_001', 8, '法律服务流程', 
'[
  {"step": "咨询确认", "sequence": 1, "role": "service_provider", "description": "确认法律服务需求", "estimated_days": 1, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "方案制定", "sequence": 2, "role": "service_provider", "description": "制定法律服务方案", "estimated_days": 3, "required_files": ["相关证据", "案件资料"], "approval_required": 0, "auto_advance": 0},
  {"step": "文件起草", "sequence": 3, "role": "service_provider", "description": "起草相关法律文件", "estimated_days": 5, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "审核签署", "sequence": 4, "role": "enterprise", "description": "审核并签署法律文件", "estimated_days": 2, "required_files": [], "approval_required": 1, "auto_advance": 0},
  {"step": "案件/事务跟进", "sequence": 5, "role": "service_provider", "description": "跟进案件或事务处理", "estimated_days": 30, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "结案", "sequence": 6, "role": "service_provider", "description": "案件结案或事务完成", "estimated_days": 2, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "完成", "sequence": 7, "role": "system", "description": "法律服务完成", "estimated_days": 0, "required_files": [], "approval_required": 0, "auto_advance": 1}
]', 
'法律服务 - 一次性服务流程', 'system', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),

-- 9. 资质认证 (一次性)
('TPL_CERTIFICATION_001', 9, '资质认证服务流程', 
'[
  {"step": "需求确认", "sequence": 1, "role": "service_provider", "description": "确认资质认证需求", "estimated_days": 1, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "材料准备", "sequence": 2, "role": "enterprise", "description": "准备认证所需材料", "estimated_days": 7, "required_files": ["企业资料", "技术文档", "管理体系文件"], "approval_required": 1, "auto_advance": 0},
  {"step": "申请提交", "sequence": 3, "role": "service_provider", "description": "向认证机构提交申请", "estimated_days": 2, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "审核答复", "sequence": 4, "role": "service_provider", "description": "跟进审核进度和处理反馈", "estimated_days": 15, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "现场验收", "sequence": 5, "role": "service_provider", "description": "配合现场审核验收", "estimated_days": 3, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "证书颁发", "sequence": 6, "role": "service_provider", "description": "获取并交付认证证书", "estimated_days": 5, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "完成", "sequence": 7, "role": "system", "description": "资质认证服务完成", "estimated_days": 0, "required_files": [], "approval_required": 0, "auto_advance": 1}
]', 
'资质认证 - 一次性服务流程', 'system', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),

-- 10. 融资服务 (一次性)
('TPL_FINANCING_001', 10, '融资服务流程', 
'[
  {"step": "需求评估", "sequence": 1, "role": "service_provider", "description": "评估融资需求和条件", "estimated_days": 3, "required_files": ["财务报表", "商业计划书"], "approval_required": 0, "auto_advance": 0},
  {"step": "方案设计", "sequence": 2, "role": "service_provider", "description": "设计融资方案", "estimated_days": 5, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "材料准备", "sequence": 3, "role": "enterprise", "description": "准备融资申请材料", "estimated_days": 10, "required_files": ["审计报告", "法律文件", "担保材料"], "approval_required": 1, "auto_advance": 0},
  {"step": "融资申请", "sequence": 4, "role": "service_provider", "description": "向金融机构提交申请", "estimated_days": 3, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "审核反馈", "sequence": 5, "role": "service_provider", "description": "跟进审核并处理反馈", "estimated_days": 30, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "融资到账", "sequence": 6, "role": "service_provider", "description": "协助完成放款手续", "estimated_days": 5, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "完成", "sequence": 7, "role": "system", "description": "融资服务完成", "estimated_days": 0, "required_files": [], "approval_required": 0, "auto_advance": 1}
]', 
'融资服务 - 一次性服务流程', 'system', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),

-- 11. 品牌推广 (周期性)
('TPL_BRANDING_001', 11, '品牌推广服务流程', 
'[
  {"step": "策划方案", "sequence": 1, "role": "service_provider", "description": "制定品牌推广策划方案", "estimated_days": 7, "required_files": ["品牌资料", "推广需求"], "approval_required": 0, "auto_advance": 0},
  {"step": "设计制作", "sequence": 2, "role": "service_provider", "description": "设计制作推广素材", "estimated_days": 10, "required_files": [], "approval_required": 1, "auto_advance": 0},
  {"step": "投放执行", "sequence": 3, "role": "service_provider", "description": "执行推广投放计划", "estimated_days": 20, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "监测优化", "sequence": 4, "role": "service_provider", "description": "监测效果并优化策略", "estimated_days": 5, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "项目总结", "sequence": 5, "role": "service_provider", "description": "总结推广效果和经验", "estimated_days": 3, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "完成", "sequence": 6, "role": "system", "description": "品牌推广周期完成", "estimated_days": 0, "required_files": [], "approval_required": 0, "auto_advance": 1}
]', 
'品牌推广 - 周期性服务流程', 'system', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),

-- 12. 办公设施 (一次性)
('TPL_OFFICE_001', 12, '办公设施服务流程', 
'[
  {"step": "需求确认", "sequence": 1, "role": "service_provider", "description": "确认办公设施需求", "estimated_days": 2, "required_files": ["需求清单"], "approval_required": 0, "auto_advance": 0},
  {"step": "方案制定", "sequence": 2, "role": "service_provider", "description": "制定采购和配置方案", "estimated_days": 3, "required_files": [], "approval_required": 1, "auto_advance": 0},
  {"step": "采购执行", "sequence": 3, "role": "service_provider", "description": "执行设备采购", "estimated_days": 10, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "安装验收", "sequence": 4, "role": "enterprise", "description": "设备安装和验收", "estimated_days": 3, "required_files": [], "approval_required": 1, "auto_advance": 0},
  {"step": "售后服务", "sequence": 5, "role": "service_provider", "description": "提供售后服务和维护", "estimated_days": 7, "required_files": [], "approval_required": 0, "auto_advance": 0},
  {"step": "完成", "sequence": 6, "role": "system", "description": "办公设施服务完成", "estimated_days": 0, "required_files": [], "approval_required": 0, "auto_advance": 1}
]', 
'办公设施 - 一次性服务流程', 'system', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000);

-- ========================================
-- 视图定义
-- ========================================

-- 订单概览视图
CREATE OR REPLACE VIEW `v_service_order_overview` AS
SELECT 
    so.order_id,
    so.user_id,
    so.service_id,
    so.service_type,
    so.status,
    so.current_step,
    so.start_date,
    so.end_date,
    so.price,
    pi.instance_id,
    pi.current_sequence,
    pt.template_name,
    COUNT(pa.alert_id) as active_alerts,
    so.create_time,
    so.update_time
FROM service_order so
LEFT JOIN process_instance pi ON so.order_id = pi.order_id
LEFT JOIN process_template pt ON pi.template_id = pt.template_id
LEFT JOIN process_alert pa ON so.order_id = pa.order_id AND pa.is_resolved = 0
GROUP BY so.order_id;

-- 工作台统计视图
CREATE OR REPLACE VIEW `v_workbench_statistics` AS
SELECT 
    (SELECT COUNT(*) FROM service_order WHERE status = 'Pending') as pending_orders,
    (SELECT COUNT(*) FROM service_order WHERE status = 'Active') as active_orders,
    0 as overdue_tasks,
    (SELECT COUNT(*) FROM service_order WHERE status = 'Completed' AND DATE(FROM_UNIXTIME(update_time/1000)) = CURDATE()) as completed_today,
    (SELECT COUNT(*) FROM process_alert WHERE is_resolved = 0) as unresolved_alerts,
    (SELECT COUNT(*) FROM service_order WHERE status = 'Completed' AND YEARWEEK(FROM_UNIXTIME(update_time/1000)) = YEARWEEK(NOW())) as weekly_completed,
    (SELECT COUNT(*) FROM service_order WHERE YEARWEEK(FROM_UNIXTIME(create_time/1000)) = YEARWEEK(NOW())) as weekly_new_orders;

-- ========================================
-- 测试数据
-- ========================================

-- 插入测试订单数据
INSERT INTO `service_order` (`order_id`, `user_id`, `service_id`, `title`, `service_type`, `status`, `current_step`, `start_date`, `end_date`, `cycle_months`, `price`, `remarks`, `create_time`, `update_time`) VALUES
('ORD202501010001', 'USER001', 1, '财税服务', 'one_time', 'Active', '资料收集', UNIX_TIMESTAMP() * 1000, (UNIX_TIMESTAMP() + 86400 * 30) * 1000, NULL, 3000.00, '财税服务测试订单', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('ORD202501010002', 'USER002', 2, '人力资源', 'recurring', 'Pending', '订单确认', UNIX_TIMESTAMP() * 1000, (UNIX_TIMESTAMP() + 86400 * 365) * 1000, 12, 15000.00, '人力资源服务测试订单', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('ORD202501010003', 'USER003', 3, '工商注册', 'one_time', 'Completed', '完成', (UNIX_TIMESTAMP() - 86400 * 10) * 1000, (UNIX_TIMESTAMP() - 86400 * 5) * 1000, NULL, 5000.00, '工商注册服务测试订单', (UNIX_TIMESTAMP() - 86400 * 10) * 1000, (UNIX_TIMESTAMP() - 86400 * 5) * 1000),
('ORD202501010004', 'USER004', 4, '知识产权', 'one_time', 'Active', '申请准备', UNIX_TIMESTAMP() * 1000, (UNIX_TIMESTAMP() + 86400 * 60) * 1000, NULL, 8000.00, '知识产权服务测试订单', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('ORD202501010005', 'USER005', 5, '科创申报', 'one_time', 'Paused', '过程跟踪', (UNIX_TIMESTAMP() - 86400 * 5) * 1000, (UNIX_TIMESTAMP() + 86400 * 90) * 1000, NULL, 20000.00, '科创申报服务测试订单', (UNIX_TIMESTAMP() - 86400 * 5) * 1000, UNIX_TIMESTAMP() * 1000)
ON DUPLICATE KEY UPDATE 
status = VALUES(status), 
current_step = VALUES(current_step), 
update_time = VALUES(update_time);

-- 插入对应的流程实例
INSERT INTO `process_instance` (`instance_id`, `order_id`, `template_id`, `current_step`, `current_sequence`, `status`, `assigned_staff`, `create_time`, `update_time`) VALUES
('INST202501010001', 'ORD202501010001', 'TPL_ACCOUNTING_001', '资料收集', 2, 'InProgress', 'ADMIN001', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('INST202501010002', 'ORD202501010002', 'TPL_HR_001', '订单确认', 1, 'NotStarted', NULL, UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('INST202501010003', 'ORD202501010003', 'TPL_BUSINESS_REG_001', '完成', 6, 'Completed', 'ADMIN002', (UNIX_TIMESTAMP() - 86400 * 10) * 1000, (UNIX_TIMESTAMP() - 86400 * 5) * 1000),
('INST202501010004', 'ORD202501010004', 'TPL_IP_001', '申请准备', 2, 'InProgress', 'ADMIN001', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('INST202501010005', 'ORD202501010005', 'TPL_TECH_REPORT_001', '过程跟踪', 4, 'InProgress', 'ADMIN003', (UNIX_TIMESTAMP() - 86400 * 5) * 1000, UNIX_TIMESTAMP() * 1000)
ON DUPLICATE KEY UPDATE 
current_step = VALUES(current_step), 
current_sequence = VALUES(current_sequence), 
status = VALUES(status), 
update_time = VALUES(update_time);