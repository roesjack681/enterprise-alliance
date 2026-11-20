-- ----------------------------
-- Table structure for chat_room
-- ----------------------------
DROP TABLE IF EXISTS `chat_room`;
CREATE TABLE `chat_room` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '房间ID',
  `room_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '房间名称',
  `avatar` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '头像',
  `desc` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '房间描述',
  `room_type` tinyint(4) NOT NULL DEFAULT '1' COMMENT '房间类型: 1-私聊, 2-群聊',
  `owner_id` bigint(20) unsigned DEFAULT NULL COMMENT '群主ID (群聊时)',
  `room_number` varchar(50) NOT NULL COMMENT '房间号',
  `last_message_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '最后一条消息的ID (MongoDB ObjectID)',
  `last_message_content` text COLLATE utf8mb4_unicode_ci,
  `last_message_time` int(11) NOT NULL DEFAULT '0' COMMENT '最后一条消息的时间',
  `is_dissolved` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已解散 (群聊时)',
  `is_muted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否全部禁言,管理员创建者可以禁言',
  `created_at` int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
  `updated_at` int(11) NOT NULL DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_room_type` (`room_type`),
  KEY `idx_owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天房间表';

-- ----------------------------
-- Table structure for chat_room_user_0-9多表
-- ----------------------------
DROP TABLE IF EXISTS `chat_room_user`;
CREATE TABLE `chat_room_user` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `room_id` bigint(20) unsigned NOT NULL COMMENT '房间ID',
  `user_id` bigint(20) unsigned NOT NULL COMMENT '用户ID', 
  `role` enum('owner','admin','member') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'member' COMMENT '角色: owner, admin, member',
  `is_friend` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否为好友 (私聊时)',
  `is_blocked` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已拉黑 (私-聊时)',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除对话 (私聊时)',
  `is_muted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否被禁言 (群聊时)',
  `is_kicked` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否被踢出 (群聊时)',
  `joined_at` int(11) NOT NULL DEFAULT '0' COMMENT '加入时间',
  `updated_at` int(11) NOT NULL DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_room_user` (`room_id`,`user_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天房间用户关系表';

-- ----------------------------
-- Table structure for chat_user_room_0-9多表
-- ----------------------------
DROP TABLE IF EXISTS `chat_user_room`;
CREATE TABLE `chat_user_room` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户房间关联ID',
  `user_id` bigint(20) unsigned NOT NULL COMMENT '用户ID',
  `room_id` bigint(20) unsigned NOT NULL COMMENT '房间ID',
  `room_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '房间显示名称 (用户自定义)',
  `room_avatar` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '房间头像 (用户自定义)',
  `is_pinned` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否置顶',
  `is_muted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否免打扰',
  `unread_count` int(11) NOT NULL DEFAULT '0' COMMENT '未读消息数',
  `last_read_message_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '最后读取的消息ID',
  `last_read_time` int(11) NOT NULL DEFAULT '0' COMMENT '最后读取时间',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除 (用户主动删除)',
  `deleted_at` int(11) NOT NULL DEFAULT '0' COMMENT '删除时间',
  `created_at` int(11) NOT NULL DEFAULT '0' COMMENT '创建时间',
  `updated_at` int(11) NOT NULL DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_room` (`user_id`,`room_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_room_id` (`room_id`),
  KEY `idx_is_pinned` (`is_pinned`),
  KEY `idx_is_deleted` (`is_deleted`),
  KEY `idx_unread_count` (`unread_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户房间关联表'; 