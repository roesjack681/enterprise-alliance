<template>
	<view class="private-chats-container">
		<!-- 私聊列表 -->
		<view class="section">
			<view class="section-header">
				<text class="section-title">私聊</text>
				<text class="section-count">({{ privateChatList.length }})</text>
			</view>
			
			<!-- 搜索框 -->
			<view class="search-container">
				<u-search 
					v-model="searchKeyword" 
					placeholder="搜索聊天对象" 
					:show-action="false"
					@search="onSearch"
					@clear="onClearSearch"
				></u-search>
			</view>

			<!-- 私聊列表 -->
			<view class="chat-list-container">
				<!-- 加载状态 -->
				<view class="loading-container" v-if="loading">
					<u-loading-icon mode="spinner" size="40"></u-loading-icon>
					<text class="loading-text">加载中...</text>
				</view>

				<!-- 空状态 -->
				<view class="empty-container" v-else-if="filteredChatList.length === 0">
					<u-icon name="chat" color="#ccc" size="80"></u-icon>
					<text class="empty-text">{{ searchKeyword ? '未找到相关聊天' : '暂无私聊' }}</text>
				</view>

				<!-- 私聊列表 */
				<view v-else class="chat-list">
					<view 
						class="chat-item" 
						v-for="(chat, index) in filteredChatList" 
						:key="index"
						@click="openChat(chat)"
					>
						<view class="chat-avatar">
							<image v-if="chat.other_user_avatar" :src="chat.other_user_avatar" class="avatar-img"></image>
							<view v-else class="default-avatar">
								<text class="avatar-text">{{ getUserInitial(chat.other_user_name) }}</text>
							</view>
							<!-- 在线状态 -->
							<view class="status-dot" :class="chat.other_user_status_class"></view>
						</view>
						<view class="chat-info">
							<text class="chat-name">{{ chat.other_user_name }}</text>
							<text class="last-message">{{ chat.last_message || '暂无消息' }}</text>
							<text class="last-time">{{ formatTime(chat.last_message_time) }}</text>
						</view>
						<view class="chat-status">
							<!-- 未读消息数 -->
							<view v-if="chat.unread_count > 0" class="unread-badge">
								<text class="unread-text">{{ chat.unread_count > 99 ? '99+' : chat.unread_count }}</text>
							</view>
							<!-- 静音图标 -->
							<u-icon v-if="chat.is_muted" name="volume-off" color="#999" size="24"></u-icon>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getUserPrivateChats } from '@/utils/api.js';

export default {
	data() {
		return {
			loading: false,
			searchKeyword: '',
			privateChatList: []
		}
	},
	computed: {
		// 过滤后的聊天列表
		filteredChatList() {
			if (!this.searchKeyword) {
				return this.privateChatList;
			}
			return this.privateChatList.filter(chat => 
				chat.other_user_name.toLowerCase().includes(this.searchKeyword.toLowerCase())
			);
		}
	},
	onLoad() {
		this.fetchPrivateChatList();
	},
	onShow() {
		// 页面显示时刷新数据
		this.fetchPrivateChatList();
	},
	onPullDownRefresh() {
		// 下拉刷新
		this.refreshData();
	},
	methods: {
		// 刷新数据
		refreshData() {
			this.privateChatList = [];
			this.fetchPrivateChatList().then(() => {
				uni.stopPullDownRefresh();
			});
		},
		// 获取私聊列表（不分页）
		async fetchPrivateChatList() {
			this.loading = true;
			try {
				const res = await getUserPrivateChats();
				if (res.code === 0 && res.data) {
					this.privateChatList = res.data.map(chat => ({
						...chat,
						// 添加计算属性
						other_user_status_class: chat.other_user_online_status === 'online' ? 'online' : '',
						// 格式化时间
						formatted_time: this.formatTime(chat.last_message_time)
					}));
				}
			} catch (error) {
				console.error('获取私聊列表失败:', error);
				uni.showToast({
					title: '获取私聊列表失败',
					icon: 'none'
				});
			} finally {
				this.loading = false;
			}
		},
		// 获取用户姓名首字母
		getUserInitial(name) {
			if (!name) return '?';
			return name.charAt(0).toUpperCase();
		},
		// 格式化时间
		formatTime(timestamp) {
			if (!timestamp) return '';
			
			const now = new Date();
			const msgTime = new Date(timestamp);
			const diff = now - msgTime;
			
			// 小于1分钟
			if (diff < 60000) {
				return '刚刚';
			}
			// 小于1小时
			if (diff < 3600000) {
				return Math.floor(diff / 60000) + '分钟前';
			}
			// 小于24小时
			if (diff < 86400000) {
				return Math.floor(diff / 3600000) + '小时前';
			}
			// 大于24小时
			const options = { month: '2-digit', day: '2-digit' };
			return msgTime.toLocaleDateString('zh-CN', options);
		},
		// 搜索处理
		onSearch() {
			// 搜索逻辑已在 computed 中处理
		},
		// 清除搜索
		onClearSearch() {
			this.searchKeyword = '';
		},
		// 打开聊天
		openChat(chat) {
			uni.navigateTo({
				url: `/pages/chat/chat?room_id=${chat.room_id}&type=private`
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.private-chats-container {
	min-height: 100vh;
	background-color: #f5f6fa;
}

/* 区块样式 */
.section {
	background-color: #fff;

	.section-header {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;

		.section-title {
			font-size: 32rpx;
			font-weight: 500;
			color: #333;
		}

		.section-count {
			font-size: 28rpx;
			color: #999;
			margin-left: 10rpx;
		}
	}
}

/* 搜索容器 */
.search-container {
	padding: 20rpx 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

/* 聊天列表容器 */
.chat-list-container {
	/* 加载状态 */
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;

		.loading-text {
			margin-top: 20rpx;
			font-size: 28rpx;
			color: #999;
		}
	}

	/* 空状态 */
	.empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;

		.empty-text {
			font-size: 28rpx;
			color: #999;
			margin-top: 20rpx;
		}
	}
}

/* 聊天列表 */
.chat-list {
	.chat-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		position: relative;

		&:last-child {
			border-bottom: none;
		}

		&:active {
			background-color: #f8f9fa;
		}

		.chat-avatar {
			width: 80rpx;
			height: 80rpx;
			margin-right: 20rpx;
			position: relative;

			.avatar-img {
				width: 100%;
				height: 100%;
				border-radius: 50%;
			}

			.default-avatar {
				width: 100%;
				height: 100%;
				background-color: #3D6AFF;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;

				.avatar-text {
					color: #fff;
					font-size: 32rpx;
					font-weight: 500;
				}
			}

			.status-dot {
				position: absolute;
				bottom: 0;
				right: 0;
				width: 20rpx;
				height: 20rpx;
				border-radius: 50%;
				background-color: #ccc;
				border: 2rpx solid #fff;

				&.online {
					background-color: #52c41a;
				}
			}
		}

		.chat-info {
			flex: 1;
			display: flex;
			flex-direction: column;

			.chat-name {
				font-size: 30rpx;
				color: #333;
				margin-bottom: 8rpx;
			}

			.last-message {
				font-size: 26rpx;
				color: #666;
				margin-bottom: 4rpx;
				// 最多显示一行
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}

			.last-time {
				font-size: 24rpx;
				color: #999;
			}
		}

		.chat-status {
			display: flex;
			flex-direction: column;
			align-items: flex-end;
			gap: 8rpx;

			.unread-badge {
				background-color: #ff4757;
				border-radius: 20rpx;
				min-width: 36rpx;
				height: 36rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0 8rpx;

				.unread-text {
					color: #fff;
					font-size: 20rpx;
					font-weight: 500;
				}
			}
		}
	}
}
</style>