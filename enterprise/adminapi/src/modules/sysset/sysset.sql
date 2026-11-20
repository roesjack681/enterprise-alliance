-- 系统配置表
CREATE TABLE `system_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `title` varchar(255) NOT NULL DEFAULT '' COMMENT '配置标题',
  `json` longtext NOT NULL COMMENT '配置内容JSON',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1-启用，0-禁用',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 插入默认配置数据
INSERT INTO `system_config` (`id`, `title`, `json`, `status`) VALUES 
(1, '微信支付配置', '{"appid":"","secret":"","mchId":"","key":""}', 1),
(2, '其他系统配置', '{"website":"","nearnum":30,"param":""}', 1),
(3, '轮播图配置', '{"image":"","title":"","subtitle":"","link":"","status":1}', 1),
(4, '首页活动配置', '{"image":"","title":"","subtitle":"","description":"","price":"","button_text":"限时抢购","link":"","status":1}', 1);