-- 通用订单表 - 支持多种业务类型的统一订单管理
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_no` VARCHAR(64) NOT NULL UNIQUE COMMENT '订单编号',
  `entity_id` INT NOT NULL COMMENT '用户ID（企业ID）',
  
  -- 业务信息
  `business_type` VARCHAR(50) NOT NULL DEFAULT 'service' COMMENT '业务类型：service,product,invoice,member等',
  `business_id` VARCHAR(64) NOT NULL COMMENT '业务ID',
  `provider_id` INT NULL COMMENT '服务商ID（提供服务的企业ID）',
  `business_title` VARCHAR(255) NOT NULL COMMENT '业务标题',
  `business_data` JSON DEFAULT NULL COMMENT '业务扩展数据',
  
  -- 价格信息
  `original_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '原价',
  `discount_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '优惠金额',
  `actual_price` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  
  -- 订单状态
  `status` TINYINT DEFAULT 1 COMMENT '订单状态：1-待支付，2-已支付，3-已完成，4-已取消，5-已退款',
  `payment_status` TINYINT DEFAULT 0 COMMENT '支付状态：0-未支付，1-已支付，2-支付失败',
  
  -- 支付信息
  `payment_method` VARCHAR(50) DEFAULT NULL COMMENT '支付方式',
  `payment_time` INT DEFAULT 0 COMMENT '支付时间（时间戳）',
  `payment_order_no` VARCHAR(128) DEFAULT NULL COMMENT '支付平台订单号',
  
  -- 业务处理状态
  `business_status` TINYINT DEFAULT 0 COMMENT '业务处理状态：0-未处理，1-已处理',
  `business_order_id` VARCHAR(64) DEFAULT NULL COMMENT '关联的业务订单ID',
  
  -- 其他信息
  `invoice_id` INT DEFAULT NULL COMMENT '发票ID',
  `remark` TEXT COMMENT '订单备注',
  `cancel_reason` VARCHAR(500) DEFAULT NULL COMMENT '取消原因',
  `refund_reason` VARCHAR(500) DEFAULT NULL COMMENT '退款原因',
  `refund_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '退款金额',
  `refund_time` INT DEFAULT 0 COMMENT '退款时间（时间戳）',
  
  -- 时间信息
  `create_time` INT DEFAULT 0 COMMENT '创建时间（时间戳）',
  `update_time` INT DEFAULT 0 COMMENT '更新时间（时间戳）',
  
  INDEX `idx_entity_id` (`entity_id`),
  INDEX `idx_business_type` (`business_type`),
  INDEX `idx_business_id` (`business_id`),
  INDEX `idx_provider_id` (`provider_id`),
  INDEX `idx_provider_status` (`provider_id`, `status`),
  INDEX `idx_provider_payment` (`provider_id`, `payment_status`),
  INDEX `idx_provider_business` (`provider_id`, `business_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_payment_status` (`payment_status`),
  INDEX `idx_business_status` (`business_status`),
  INDEX `idx_create_time` (`create_time`)
);

-- 订单日志表
CREATE TABLE IF NOT EXISTS `order_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL COMMENT '订单ID',
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单编号',
  `old_status` TINYINT DEFAULT NULL COMMENT '原状态',
  `new_status` TINYINT NOT NULL COMMENT '新状态',
  `action_type` VARCHAR(50) NOT NULL COMMENT '操作类型：create,pay,complete,cancel,refund',
  `message` VARCHAR(500) DEFAULT NULL COMMENT '操作说明',
  `operator_id` INT DEFAULT NULL COMMENT '操作人ID',
  `operator_type` TINYINT DEFAULT 1 COMMENT '操作人类型：1-用户，2-管理员，3-系统',
  `extra_data` JSON DEFAULT NULL COMMENT '额外数据',
  `create_time` INT DEFAULT 0 COMMENT '创建时间（时间戳）',
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_order_no` (`order_no`),
  INDEX `idx_create_time` (`create_time`)
); 