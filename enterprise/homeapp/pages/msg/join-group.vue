<template>
	<view class="join-group-container">
		<!-- 群组搜索 -->
		<view class="section">
			<view class="section-header">
				<text class="section-title">搜索群组</text>
			</view>
			<view class="form-content">
				<view class="form-item">
					<text class="form-label">群组ID或邀请码</text>
					<u-input 
						v-model="joinForm.code" 
						placeholder="请输入群组ID或邀请码"
						border="none"
						class="form-input"
					></u-input>
				</view>
				<view class="form-item">
					<u-button 
						type="primary" 
						:disabled="!canJoin"
						@click="joinGroupByCode"
						class="join-btn"
					>
						加入群组
					</u-button>
				</view>
			</view>
		</view>

		<!-- 群组列表 -->
		<view v-if="0" class="section">
			<view class="section-header">
				<text class="section-title">可加入的群组</text>
			</view>
			
			<!-- 搜索框 -->
			<view class="search-container">
				<u-search 
					v-model="groupSearchKeyword" 
					placeholder="搜索群组名称" 
					:show-action="false"
					@search="onGroupSearch"
					@clear="onClearGroupSearch"
				></u-search>
			</view>

			<!-- 群组列表 -->
			<view class="group-list-container">
				<!-- 加载状态 -->
				<view class="loading-container" v-if="groupLoading">
					<u-loading-icon mode="spinner" size="40"></u-loading-icon>
					<text class="loading-text">加载中...</text>
				</view>

				<!-- 空状态 -->
				<view class="empty-container" v-else-if="filteredGroupList.length === 0">
					<u-icon name="account-group" color="#ccc" size="80"></u-icon>
					<text class="empty-text">{{ groupSearchKeyword ? '未找到相关群组' : '暂无可加入的群组' }}</text>
				</view>

				<!-- 群组列表 -->
				<view v-else class="group-list">
					<view 
						class="group-item" 
						v-for="(group, index) in filteredGroupList" 
						:key="index"
						@click="joinGroup(group)"
					>
						<view class="group-avatar">
							<image v-if="group.avatar" :src="group.avatar" class="avatar-img"></image>
							<view v-else class="default-group-avatar">
								<u-icon name="account-group" color="#3D6AFF" size="40"></u-icon>
							</view>
						</view>
						<view class="group-info">
							<text class="group-name">{{ group.name }}</text>
							<text class="group-desc">{{ group.description || '暂无描述' }}</text>
							<text class="group-count">{{ group.member_count || 0 }}人</text>
						</view>
						<view class="group-action">
							<u-button 
								type="primary" 
								size="mini"
								@click.stop="joinGroup(group)"
							>
								加入
							</u-button>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getUserGroupChats, inviteToRoom } from '@/utils/api.js';

export default {
	data() {
		return {
			groupLoading: false,
			groupSearchKeyword: '',
			groupList: [],
			joinForm: {
				code: ''
			}
		}
	},
	computed: {
		// 过滤后的群组列表
		filteredGroupList() {
			if (!this.groupSearchKeyword) {
				return this.groupList;
			}
			return this.groupList.filter(group => 
				group.name.toLowerCase().includes(this.groupSearchKeyword.toLowerCase()) ||
				(group.description && group.description.toLowerCase().includes(this.groupSearchKeyword.toLowerCase()))
			);
		},
		// 是否可以加入群组
		canJoin() {
			return this.joinForm.code.trim();
		}
	},
	onLoad() {
		//this.fetchGroupList();
	},
	methods: {
		// 获取群组列表（不分页）
		async fetchGroupList() {
			this.groupLoading = true;
			try {
				const res = await getUserGroupChats();
				if (res.code === 0 && res.data) {
					// 过滤出用户还未加入的群组或公开群组
					this.groupList = res.data.map(group => ({
						...group,
						// 统一字段名
						id: group.room_id,
						name: group.room_name || group.name,
						avatar: group.room_avatar || group.avatar,
						member_count: group.member_count || 0,
						description: group.description || group.room_description
					}));
				}
			} catch (error) {
				console.error('获取群组列表失败:', error);
				uni.showToast({
					title: '获取群组列表失败',
					icon: 'none'
				});
			} finally {
				this.groupLoading = false;
			}
		},
		// 群组搜索处理
		onGroupSearch() {
			// 搜索逻辑已在 computed 中处理
		},
		// 清除群组搜索
		onClearGroupSearch() {
			this.groupSearchKeyword = '';
		},
		// 加入群组
		async joinGroup(group) {
			try {
				const userInfo = uni.getStorageSync('$userinfo') || {};
				const res = await inviteToRoom({
					room_id: group.id,
					invitee_ids: [userInfo.id]
				});

				if (res.code === 0) {
					uni.showToast({
						title: '加入群组成功',
						icon: 'success'
					});
					
					// 返回上一页并刷新
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} else {
					uni.showToast({
						title: res.msg || '加入失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('加入群组失败:', error);
				uni.showToast({
					title: '加入群组失败',
					icon: 'none'
				});
			}
		},
		// 通过邀请码加入群组
		async joinGroupByCode() {
			if (!this.canJoin) {
				uni.showToast({
					title: '请输入群组ID或邀请码',
					icon: 'none'
				});
				return;
			}

			try {
				const userInfo =  uni.getStorageSync('$userinfo') || {};
				const res = await inviteToRoom({
					invite_code: this.joinForm.code,
					invitee_ids: [userInfo.id]
				});

				if (res.code === 0) {
					uni.showToast({
						title: '加入群组成功',
						icon: 'success'
					});
					
					// 清空输入框
					this.joinForm.code = '';
					
					// 返回上一页并刷新
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} else {
					uni.showToast({
						title: res.msg || '加入失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('加入群组失败:', error);
				uni.showToast({
					title: '加入群组失败',
					icon: 'none'
				});
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.join-group-container {
	min-height: 100vh;
	background-color: #f5f6fa;
	padding-bottom: 120rpx;
}

/* 区块样式 */
.section {
	background-color: #fff;
	margin-bottom: 20rpx;

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;

		.section-title {
			font-size: 32rpx;
			font-weight: 500;
			color: #333;
		}
	}
}

/* 表单内容 */
.form-content {
	padding: 30rpx;

	.form-item {
		margin-bottom: 30rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.form-label {
			display: block;
			font-size: 28rpx;
			color: #333;
			margin-bottom: 16rpx;
		}

		.form-input {
			background-color: #f8f9fa;
			border-radius: 8rpx;
			padding: 20rpx;
		}

		.join-btn {
			width: 100%;
			height: 80rpx;
			border-radius: 40rpx;
			font-size: 30rpx;
			font-weight: 500;
		}
	}
}

/* 搜索容器 */
.search-container {
	padding: 20rpx 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

/* 群组列表容器 */
.group-list-container {
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

		.group-action {
			width: 120rpx;
		}
	}
}
</style>
