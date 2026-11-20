-- 审核记录表
CREATE TABLE IF NOT EXISTS `audit_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '审核记录ID',
  `audit_type` tinyint(1) NOT NULL COMMENT '审核类型：1-企业认证，2-服务产品，3-需求发布',
  `related_id` int(11) NOT NULL COMMENT '关联业务ID',
  `entity_id` int(11) NOT NULL COMMENT '被审核企业ID',
  `entity_name` varchar(100) DEFAULT NULL COMMENT '被审核企业名称',
  `title` varchar(200) NOT NULL COMMENT '审核标题',
  `content` text COMMENT '审核内容描述',
  `auditor_id` int(11) DEFAULT NULL COMMENT '审核人ID',
  `auditor_name` varchar(100) DEFAULT NULL COMMENT '审核人名称',
  `auditor_role` tinyint(1) DEFAULT NULL COMMENT '审核人角色',
  `status` tinyint(1) NOT NULL DEFAULT 1 COMMENT '审核状态：1-待审核，2-通过，3-拒绝',
  `remark` varchar(500) DEFAULT NULL COMMENT '审核意见',
  `audit_time` int(11) DEFAULT NULL COMMENT '审核时间',
  `create_time` int(11) NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_type_related` (`audit_type`, `related_id`),
  KEY `idx_entity` (`entity_id`),
  KEY `idx_auditor` (`auditor_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审核记录表';

-- 审核类型说明：
-- 1: 企业认证审核
-- 2: 服务产品审核
-- 3: 需求发布审核

-- 审核状态说明：
-- 1: 待审核
-- 2: 审核通过
-- 3: 审核拒绝

