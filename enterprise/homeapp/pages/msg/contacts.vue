<template>
	<view class="contacts-container">
		<!-- 顶部操作栏 -->
		<view class="top-actions">
			<view class="action-item" @click="createGroup">
				<view class="action-icon-bg bg-blue">
					<u-icon name="plus" color="#3D6AFF" size="32"></u-icon>
				</view>
				<text class="action-text">创建群组</text>
			</view>
			<view class="action-item" @click="joinGroup">
				<view class="action-icon-bg bg-green">
					<u-icon name="plus-people-fill" color="#52c41a" size="32"></u-icon>
				</view>
				<text class="action-text">加入群组</text>
			</view>
		</view>

		<!-- 群组列表 -->
		<view class="section">
			<view class="section-header">
				<text class="section-title">群组</text>
				<text class="section-count">({{ groupList.length }})</text>
			</view>
			<view class="group-list">
				<view class="group-item" v-for="(group, index) in groupList" :key="index" @click="openGroupChat(group)">
					<view class="group-avatar">
						<image v-if="group.avatar" :src="group.avatar" class="avatar-img"></image>
						<view v-else class="default-group-avatar">
							<text style="color:#3D6AFF;font-size: 32rpx;font-weight: 500;">{{ group.name.slice(0, 1) }}</text>
						</view>
					</view>
					<view class="group-info">
						<text class="group-name">{{ group.name }}({{ group.member_count || 0 }})</text>
						<text class="group-desc">{{ group.description || '暂无描述' }}</text> 
					</view>
					<u-icon name="arrow-right" color="#999" size="28"></u-icon>
				</view>
			</view>
		</view>

		<!-- 用户列表 -->
		<view class="section">
			<view class="section-header">
				<text class="section-title">企业成员</text>
				<text class="section-count">({{ totalUserCount }})</text>
			</view>
			
			<!-- 搜索框 -->
			<view class="search-container">
				<u-search 
					v-model="searchKeyword" 
					placeholder="搜索成员姓名" 
					:show-action="false"
					@clear="onClearSearch"
				></u-search>
			</view>

			<!-- 加载状态和空状态 -->
			<view class="status-container">
				<!-- 加载状态 -->
				<view class="loading-container" v-if="loading">
					<u-loading-icon mode="spinner" size="40"></u-loading-icon>
					<text class="loading-text">加载中...</text>
				</view>

				<!-- 空状态 -->
				<view class="empty-container" v-else-if="filteredUserList.length === 0">
					<u-icon name="account" color="#ccc" size="80"></u-icon>
					<text class="empty-text">{{ searchKeyword ? '未找到相关成员' : '暂无成员' }}</text>
				</view>
			</view>

			<!-- 搜索结果列表 -->
			<view v-if="!loading && searchKeyword && filteredUserList.length > 0" class="search-result-list">
				<view 
					class="user-item" 
					v-for="(user, index) in filteredUserList" 
					:key="index"
					@click="openUserChat(user)"
				>
					<view class="user-avatar">
						<image v-if="user.avatar" :src="user.avatar" class="avatar-img"></image>
						<view v-else class="default-user-avatar">
							<text class="avatar-text">{{ getUserInitial(user.name) }}</text>
						</view>
					</view>
					<view class="user-info">
						<text class="user-name">{{ user.name }}</text>
					</view>
					<view class="user-status">
						<view class="status-dot" :class="user.statusClass"></view>
					</view>
				</view>
			</view>
		</view>

		<!-- 字母索引列表 -->
		<view v-if="!loading && !searchKeyword && userList.length > 0" class="index-container">
			<!-- 右侧字母导航 -->
			<view class="index-bar">
				<view 
					v-for="(item, index) in indexList" 
					:key="index"
					class="index-bar-item"
					@click="scrollToIndex(item)"
				>
					{{ item }}
				</view>
			</view>
			
			<!-- 用户列表按字母分组 -->
			<view class="indexed-user-list">
				<view v-for="(item, index) in indexList" :key="index" :id="`index-${item}`">
					<!-- 字母分组标题 -->
					<view class="index-anchor">{{ item }}</view>
					<!-- 该字母下的用户列表 -->
					<view class="index-user-list">
						<view 
							class="user-item" 
							v-for="(user, userIndex) in getUserListByIndex(item)" 
							:key="userIndex"
							@click="openUserChat(user)"
						>
							<view class="user-avatar">
								<image v-if="user.avatar" :src="user.avatar" class="avatar-img"></image>
								<view v-else class="default-user-avatar">
									<text class="avatar-text">{{ getUserInitial(user.name) }}</text>
								</view>
							</view>
							<view class="user-info">
								<text class="user-name">{{ user.name }}</text>
							</view>
							<view class="user-status">
								<view class="status-dot" :class="user.statusClass"></view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { 
	getUserPrivateChats, 
	getUserGroupChats,
	createPrivateRoom 
} from '@/utils/api.js';
import { pinyin } from 'pinyin-pro';

export default {
	data() {
		return {
			loading: false,
			searchKeyword: '',
			userList: [],
			groupList: [],
			indexList: [],
			userMapByIndex: {}
		}
	},
	computed: {
		// 过滤后的用户列表
		filteredUserList() {
			if (!this.searchKeyword) {
				return this.userList;
			}
			return this.userList.filter(user => 
				user.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
				(user.position && user.position.toLowerCase().includes(this.searchKeyword.toLowerCase())) ||
				(user.department && user.department.toLowerCase().includes(this.searchKeyword.toLowerCase()))
			);
		},
		// 总用户数
		totalUserCount() {
			return this.userList.length;
		}
	},
	onLoad() {
		// 页面加载时不立即获取数据，等待 onShow 触发
	},
	onShow() {
		// 页面显示时刷新数据
		this.fetchData();
	},
	onPullDownRefresh() {
		// 下拉刷新
		this.refreshData();
	},
	methods: {
		// 刷新数据
		refreshData() {
			this.userList = [];
			this.groupList = [];
			this.indexList = [];
			this.userMapByIndex = {};
			this.fetchData().then(() => {
				uni.stopPullDownRefresh();
			});
		},
		// 获取数据
		async fetchData() {
			this.loading = true;
			try {
				await Promise.all([
					this.fetchUserList(),
					this.fetchGroupList()
				]);
			} catch (error) {
				console.error('获取数据失败:', error);
				uni.showToast({
					title: '获取数据失败',
					icon: 'none'
				});
			} finally {
				this.loading = false;
			}
		},
		// 获取用户列表
		async fetchUserList() {
			try {
				const res = await getUserPrivateChats({
					current_page: 1,
					page_size: 1000 // 获取大量数据，实现不分页效果
				});
				if (res.code === 0 && res.data && res.data.private_chats) {
					// 从聊天房间的members中提取用户信息
					const userMap = new Map();
					const currentUserId = this.$store.state.userInfo?.id || uni.getStorageSync('$userinfo')?.id;
					
					res.data.private_chats.forEach(chat => {
						if (chat.members && Array.isArray(chat.members)) {
							chat.members.forEach(member => {
								// 排除当前用户自己
								if (member.id != currentUserId && !userMap.has(member.id)) {
									const userName = member.nickname || member.username || '未知用户';
									const indexKey = this.getIndexKey(userName);
									userMap.set(member.id, {
										id: member.id,
										name: userName,
										avatar: member.avatar || '',
										position: member.position || '',
										department: member.department || '',
										// 添加计算属性
										nameInitial: this.getUserInitial(userName),
										indexKey: indexKey,
										statusClass: ''
									});
								}
							});
						}
					});
					
					this.userList = Array.from(userMap.values());
					this.generateIndexList();
				}
			} catch (error) {
				console.error('获取用户列表失败:', error);
			}
		},
		// 获取群组列表（不分页）
		async fetchGroupList() {
			try {
				const res = await getUserGroupChats();
				if (res.code === 0 && res.data) {
					this.groupList = res.data.group_chats.map(group => ({
						...group,
						// 统一字段名
						id: group.id,
						name: group.room_name||'无' ,
						avatar: group.avatar,
						member_count: group.members.length || 0,
						description: group.descp
					}));
				}
			} catch (error) {
				console.error('获取群组列表失败:', error);
			}
		},
		// 生成索引列表
		generateIndexList() {
			const indexMap = {};
			
			// 按姓名首字母分组
			this.userList.forEach(user => {
				const indexKey = user.indexKey || this.getIndexKey(user.name);
				if (!indexMap[indexKey]) {
					indexMap[indexKey] = [];
				}
				indexMap[indexKey].push(user);
			});
			
			// 生成索引列表并排序
			this.indexList = Object.keys(indexMap).sort((a, b) => {
				// # 排在最后
				if (a === '#' && b !== '#') return 1;
				if (b === '#' && a !== '#') return -1;
				return a.localeCompare(b);
			});
			this.userMapByIndex = indexMap;
		},
		// 获取用户姓名首字母
		getUserInitial(name) {
			if (!name) return '?';
			return name.charAt(0);
		},
		// 获取索引键 - 支持中文拼音转换
		getIndexKey(name) {
			if (!name) return '#';
			const firstChar = name.charAt(0);
			
			// 英文字母直接返回大写
			if (/[a-zA-Z]/.test(firstChar)) {
				return firstChar.toUpperCase();
			}
			
			// 中文字符拼音转换
			if (/[\u4e00-\u9fa5]/.test(firstChar)) {
				return this.getChinesePinyin(firstChar);
			}
			
			// 数字和其他字符
			return '#';
		},
		// 中文拼音转换 - 使用pinyin-pro库
		getChinesePinyin(char) {
			try {
				// 使用pinyin-pro库获取拼音首字母
				const pinyinResult = pinyin(char, {
					toneType: 'none', // 不要声调
					type: 'first' // 只取首字母
				});
				
				if (pinyinResult && pinyinResult.length > 0) {
					return pinyinResult.charAt(0).toUpperCase();
				}
			} catch (error) {
				console.warn('拼音转换失败:', error);
			}
			
			// 降级处理：简单的Unicode码范围映射
			const code = char.charCodeAt(0);
			if (code >= 0x4e00 && code <= 0x9fa5) {
				// 根据Unicode码范围粗略映射到字母
				const index = Math.floor((code - 0x4e00) / ((0x9fa5 - 0x4e00) / 26));
				return String.fromCharCode(65 + Math.min(25, index));
			}
			
			return '#';
		},
		// 根据索引获取用户列表
		getUserListByIndex(index) {
			return this.userMapByIndex[index] || [];
		},
		// 清除搜索
		onClearSearch() {
			this.searchKeyword = '';
		},
		// 滚动到指定索引
		scrollToIndex(index) {
			uni.pageScrollTo({
				selector: `#index-${index}`,
				duration: 300
			});
		},
		// 创建群组
		createGroup() {
			uni.navigateTo({
				url: '/pages/msg/create-group'
			});
		},
		// 加入群组
		joinGroup() {
			uni.navigateTo({
				url: '/pages/msg/join-group'
			});
		},
		// 打开群聊
		openGroupChat(group) {
			uni.navigateTo({
				url: `/pages/chat/chat?room_id=${group.id}`
			});
		},
		// 打开用户聊天
		openUserChat(user) {
			// 创建或获取私聊房间
			this.createPrivateChat(user);
		},
		// 创建私聊
		async createPrivateChat(user) {
			try {
				const userInfo = this.$store.state.userInfo || uni.getStorageSync('$userinfo') || {};
				const res = await createPrivateRoom({
					user_id2: user.id
				});
				
				if (res.code === 0 && res.data) {
					uni.navigateTo({
						url: `/pages/chat/chat?room_id=${res.data.room_id}&type=private`
					});
				} else {
					uni.showToast({
						title: res.msg || '创建聊天失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('创建私聊失败:', error);
				uni.showToast({
					title: '创建聊天失败',
					icon: 'none'
				});
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.contacts-container {
	min-height: 100vh;
	background-color: #f5f6fa;
	padding-bottom: 120rpx;
}

/* 顶部操作栏 */
.top-actions {
	display: flex;
	justify-content: space-around;
	padding: 30rpx;
	background-color: #fff;
	margin-bottom: 20rpx;

	.action-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 45%;

		.action-icon-bg {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 16rpx;

			&.bg-blue {
				background-color: #e6f0ff;
			}
			
			&.bg-green {
				background-color: #f6ffed;
			}
		}

		.action-text {
			font-size: 28rpx;
			color: #333;
		}
	}
}

/* 区块样式 */
.section {
	background-color: #fff;
	margin-bottom: 20rpx;

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

/* 群组列表 */
.group-list {
	.group-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;

		&:last-child {
			border-bottom: none;
		}

		.group-avatar {
			width: 80rpx;
			height: 80rpx;
			margin-right: 20rpx;

			.avatar-img {
				width: 100%;
				height: 100%;
				border-radius: 50%;
			}

			.default-group-avatar {
				width: 100%;
				height: 100%;
				background-color: #e6f0ff;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}

		.group-info {
			flex: 1;
			display: flex;
			flex-direction: column;

			.group-name {
				font-size: 30rpx;
				color: #333;
				margin-bottom: 8rpx;
			}

			.group-desc {
				font-size: 26rpx;
				color: #666;
				margin-bottom: 8rpx;
			}

			.group-count {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
}

/* 搜索容器 */
.search-container {
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
	background-color: #fff;
}

/* 自定义搜索框样式 */
.search-container ::v-deep .u-search {
	.u-search__content {
		height: 80rpx !important;
		border-radius: 40rpx !important;
		
		border: none !important;
		
		.u-search__input {
			font-size: 30rpx !important;
			color: #333 !important;
		}
		
		.u-search__input-placeholder {
			font-size: 30rpx !important;
			color: #999 !important;
		}
	}
	
	.u-icon {
		font-size: 32rpx !important;
		color: #999 !important;
	}
}

/* 状态容器 */
.status-container {
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

/* 用户列表 */
.user-list,
.index-user-list,
.search-result-list {
	.user-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;

		&:last-child {
			border-bottom: none;
		}

		.user-avatar {
			width: 80rpx;
			height: 80rpx;
			margin-right: 20rpx;

			.avatar-img {
				width: 100%;
				height: 100%;
				border-radius: 50%;
			}

			.default-user-avatar {
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
		}

		.user-info {
			flex: 1;
			display: flex;
			flex-direction: column;

			.user-name {
				font-size: 30rpx;
				color: #333;
				margin-bottom: 8rpx;
			}

			.user-position {
				font-size: 26rpx;
				color: #666;
				margin-bottom: 4rpx;
			}

			.user-department {
				font-size: 24rpx;
				color: #999;
			}
		}

		.user-status {
			.status-dot {
				width: 16rpx;
				height: 16rpx;
				border-radius: 50%;
				background-color: #ccc;

				&.online {
					background-color: #52c41a;
				}
			}
		}
	}
}

/* 索引容器 */
.index-container {
	position: relative;
	background-color: #fff;
}

/* 右侧字母导航条 */
.index-bar {
	position: fixed;
	right: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	z-index: 999;
	display: flex;
	flex-direction: column;
	align-items: center;
	background-color: rgba(255, 255, 255, 0.9);
	border-radius: 40rpx;
	padding: 20rpx 10rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);

	.index-bar-item {
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 22rpx;
		color: #3D6AFF;
		font-weight: 500;
		margin: 2rpx 0;
		border-radius: 50%;
		transition: all 0.2s ease;

		&:active {
			background-color: #3D6AFF;
			color: #fff;
			transform: scale(1.2);
		}
	}
}

/* 字母分组标题 */
.index-anchor {
	background-color: #f5f6fa;
	padding: 20rpx 30rpx;
	font-size: 28rpx;
	color: #666;
	font-weight: 500;
	border-bottom: 1rpx solid #ebeef5;
	position: sticky;
	top: 0;
	z-index: 10;
}

/* 用户列表容器 */
.indexed-user-list {
	background-color: #fff;
}
</style>
