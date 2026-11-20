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
  `service_id` INT NOT NULL COMMENT '关联服务分类ID（对应category.id）',
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

-- 插入默认流程模板示例
INSERT INTO `process_template` (`template_id`, `service_id`, `template_name`, `steps_json`, `description`, `created_by`, `create_time`, `update_time`) VALUES
('TPL_ACCOUNTING_001', 'accounting', '会计月度记账流程', 
'[
  {"step": "订单确认", "sequence": 1, "role": "service_manager", "description": "确认订单信息和服务内容", "estimated_days": 1, "required_files": [], "sla_hours": 24},
  {"step": "资料收集", "sequence": 2, "role": "client", "description": "客户提供相关财务资料", "estimated_days": 2, "required_files": ["发票", "银行流水", "费用单据"], "sla_hours": 48},
  {"step": "申报处理", "sequence": 3, "role": "accountant", "description": "处理账务和税务申报", "estimated_days": 3, "required_files": [], "sla_hours": 72},
  {"step": "结果交付", "sequence": 4, "role": "service_manager", "description": "交付财务报表和申报结果", "estimated_days": 1, "required_files": [], "sla_hours": 24},
  {"step": "审核确认", "sequence": 5, "role": "client", "description": "客户确认交付成果", "estimated_days": 1, "required_files": [], "sla_hours": 24},
  {"step": "完成", "sequence": 6, "role": "", "description": "服务流程完成", "estimated_days": 0, "required_files": [], "sla_hours": 0}
]', 
'财税服务 - 月度记账标准流程', 'system', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),

('TPL_TRADEMARK_001', 'trademark', '商标注册申请流程', 
'[
  {"step": "需求评估", "sequence": 1, "role": "ip_consultant", "description": "评估商标注册需求和可行性", "estimated_days": 1, "required_files": [], "sla_hours": 24},
  {"step": "申请准备", "sequence": 2, "role": "ip_consultant", "description": "准备商标申请材料", "estimated_days": 3, "required_files": ["商标图样", "营业执照", "身份证明"], "sla_hours": 72},
  {"step": "递交申请", "sequence": 3, "role": "ip_consultant", "description": "向商标局递交申请", "estimated_days": 1, "required_files": [], "sla_hours": 24},
  {"step": "审查跟进", "sequence": 4, "role": "ip_consultant", "description": "跟进审查进度和处理异议", "estimated_days": 180, "required_files": [], "sla_hours": 720},
  {"step": "授权处理", "sequence": 5, "role": "ip_consultant", "description": "处理商标授权手续", "estimated_days": 7, "required_files": [], "sla_hours": 168},
  {"step": "完成", "sequence": 6, "role": "", "description": "商标注册完成", "estimated_days": 0, "required_files": [], "sla_hours": 0}
]', 
'知识产权 - 商标注册标准流程', 'system', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),

('TPL_IT_SERVICE_001', '5', 'IT服务标准流程', 
'[
  {"step": "订单确认", "sequence": 1, "role": "service_manager", "description": "确认IT服务需求和技术方案", "estimated_days": 1, "required_files": [], "sla_hours": 24},
  {"step": "需求分析", "sequence": 2, "role": "it_consultant", "description": "分析具体技术需求，制定实施方案", "estimated_days": 2, "required_files": ["需求文档", "系统架构图"], "sla_hours": 48},
  {"step": "方案确认", "sequence": 3, "role": "client", "description": "客户确认实施方案", "estimated_days": 1, "required_files": [], "sla_hours": 24},
  {"step": "服务实施", "sequence": 4, "role": "it_engineer", "description": "执行IT服务，包括系统部署、配置、优化等", "estimated_days": 5, "required_files": [], "sla_hours": 120},
  {"step": "测试验收", "sequence": 5, "role": "it_engineer", "description": "系统测试和功能验收", "estimated_days": 2, "required_files": ["测试报告", "验收文档"], "sla_hours": 48},
  {"step": "交付培训", "sequence": 6, "role": "it_consultant", "description": "交付文档和用户培训", "estimated_days": 1, "required_files": ["操作手册", "培训资料"], "sla_hours": 24},
  {"step": "客户确认", "sequence": 7, "role": "client", "description": "客户确认服务完成", "estimated_days": 1, "required_files": [], "sla_hours": 24},
  {"step": "完成", "sequence": 8, "role": "", "description": "IT服务流程完成", "estimated_days": 0, "required_files": [], "sla_hours": 0}
]', 
'IT服务 - 标准实施流程', 'system', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000);

-- ========================================
-- 视图定义
-- ========================================

-- 订单概览视图
CREATE OR REPLACE VIEW `v_service_order_overview` AS
SELECT 
    so.order_id,
    so.user_id,
    so.service_id,
    so.provider_id,
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
('INST202501010003', 'ORD202501010003', 'TPL_BUSINESS_001', '完成', 6, 'Completed', 'ADMIN002', (UNIX_TIMESTAMP() - 86400 * 10) * 1000, (UNIX_TIMESTAMP() - 86400 * 5) * 1000),
('INST202501010004', 'ORD202501010004', 'TPL_IP_001', '申请准备', 2, 'InProgress', 'ADMIN001', UNIX_TIMESTAMP() * 1000, UNIX_TIMESTAMP() * 1000),
('INST202501010005', 'ORD202501010005', 'TPL_INNOVATION_001', '过程跟踪', 4, 'InProgress', 'ADMIN003', (UNIX_TIMESTAMP() - 86400 * 5) * 1000, UNIX_TIMESTAMP() * 1000)
ON DUPLICATE KEY UPDATE 
current_step = VALUES(current_step), 
current_sequence = VALUES(current_sequence), 
status = VALUES(status), 
update_time = VALUES(update_time);