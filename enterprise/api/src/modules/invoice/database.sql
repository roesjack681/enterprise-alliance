-- 发票信息管理表
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '发票抬头',
  `tax_number` varchar(30) NOT NULL COMMENT '纳税人识别号',
  `invoice_type` tinyint(1) NOT NULL DEFAULT '1' COMMENT '发票类型：1-普通发票，2-增值税专用发票',
  `company_address` varchar(255) DEFAULT NULL COMMENT '公司地址',
  `company_phone` varchar(20) DEFAULT NULL COMMENT '公司电话',
  `bank_name` varchar(100) DEFAULT NULL COMMENT '开户银行',
  `bank_account` varchar(50) DEFAULT NULL COMMENT '银行账号',
  `entity_id` int(11) NOT NULL COMMENT '用户ID',
  `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否默认：0-否，1-是',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1-正常，0-已删除',
  `create_time` int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
  `update_time` int(11) NOT NULL DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_entity_id` (`entity_id`),
  KEY `idx_status` (`status`),
  KEY `idx_is_default` (`is_default`),
  KEY `idx_invoice_type` (`invoice_type`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='发票信息管理表';

-- 创建索引以提高查询性能
-- 复合索引：按用户ID和状态查询
CREATE INDEX `idx_entity_status` ON `invoices` (`entity_id`, `status`);

-- 复合索引：按用户ID、状态和是否默认查询
CREATE INDEX `idx_entity_status_default` ON `invoices` (`entity_id`, `status`, `is_default`);