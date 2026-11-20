-- 创建需求大厅表
-- 包含需求标题、需求内容、图片组、发布者、发布时间、
-- 需求状态、需求类型、需求分类、需求区域、需求联系人、
-- 需求联系电话、需求联系邮箱、需求联系地址、需求备注

CREATE TABLE IF NOT EXISTS demand (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '需求ID，主键',
    title VARCHAR(250) NOT NULL DEFAULT '' COMMENT '需求标题',
    user_id INT NOT NULL DEFAULT 0 COMMENT '发布者用户ID',
    create_time INT NOT NULL DEFAULT 0 COMMENT '发布时间（时间戳）',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '需求状态（1:发布中 2:已完成 3:已取消）',
    type TINYINT NOT NULL DEFAULT 1 COMMENT '需求类型（1:服务，2:供需，3:招采，4:项目，5:招聘，6:沙龙，7:外贸）',
    category_id INT NOT NULL DEFAULT 0 COMMENT '需求分类ID',
    province int(11) NOT NULL DEFAULT 0 COMMENT '需求省份',
    city int(11) NOT NULL DEFAULT 0 COMMENT '需求城市',
    district int(11) NOT NULL DEFAULT 0 COMMENT '需求区县',
    street int(11) NOT NULL DEFAULT 0 COMMENT '需求街道',
    address VARCHAR(250) NOT NULL DEFAULT '' COMMENT '需求联系地址',
    content TEXT NOT NULL COMMENT '需求内容详情',
    images TEXT NOT NULL COMMENT '需求相关图片（JSON格式存储）',
    person VARCHAR(100) NOT NULL DEFAULT '' COMMENT '需求联系人',
    mobile VARCHAR(20) NOT NULL DEFAULT '' COMMENT '需求联系电话',
    company_name VARCHAR(100) NOT NULL DEFAULT '' COMMENT '需求company_name',
    remark VARCHAR(250) NOT NULL DEFAULT '' COMMENT '需求备注信息',
    visibility TINYINT NOT NULL DEFAULT 1 COMMENT '可见性（1:公开 2:仅认证经纪人可见）',
    budget_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '预算价格',
    INDEX idx_user_type_category_area (user_id, type, category_id, province) COMMENT '用户类型分类区域复合索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='需求大厅表';
