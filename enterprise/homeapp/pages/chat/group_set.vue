<template>
	<view class="group-set-container">
		<!-- 群组信息 -->
		<view class="section">
			<view class="group-info">
				<view class="group-avatar">
					<image 
						v-if="groupInfo.avatar" 
						:src="groupInfo.avatar" 
						class="avatar-img" 
						mode="aspectFill"
					></image>
					<view v-else class="default-avatar">
						<text class="avatar-text">{{ getGroupInitial() }}</text>
					</view>
				</view>
				<view class="group-details">
					<text class="group-name">{{ groupInfo.room_name || '群聊' }}</text>
					<text class="group-desc" v-if="groupInfo.desc">{{ groupInfo.desc }}</text>
					<text class="group-id">群号：{{ groupInfo.room_number || groupInfo.id }}</text>
				</view>
			</view>
		</view>

		<!-- 功能列表 -->
		<view class="section">
			<view class="function-list" >
				<view class="function-item" @click="addMembers">
					<u-icon name="plus-circle" color="#666" size="40"></u-icon>
					<text class="function-text">加入群组</text>
					<u-icon name="arrow-right" color="#ccc" size="32"></u-icon>
				</view>
			</view>
			<u-gap height="20" bgColor="#f0f0f0"></u-gap>

			<view class="function-list">
				<view class="function-item" @click="editGroupInfo">
					<u-icon name="edit-pen" color="#666" size="40"></u-icon>
					<text class="function-text">编辑群资料</text>
					<u-icon name="arrow-right" color="#ccc" size="32"></u-icon>
				</view>
				<view class="function-item" @click="manageMembers">
					<u-icon name="account" color="#666" size="40"></u-icon>
					<text class="function-text">管理群成员</text>
					<text class="function-count">({{ memberCount }})</text>
					<u-icon name="arrow-right" color="#ccc" size="32"></u-icon>
				</view>
				
				<view class="function-item" @click="copyGroupId">
					<u-icon name="file-text" color="#666" size="40"></u-icon>
					<text class="function-text">复制群号</text>
					<u-icon name="arrow-right" color="#ccc" size="32"></u-icon>
				</view>
			</view>
		</view>

		<!-- 群成员列表 -->
		<view class="section">
			<view class="section-header">
				<text class="section-title">群成员</text>
				<text class="section-count">({{ memberList.length }})</text>
			</view>
			<view class="member-grid">
				<view 
					v-for="(member, index) in displayMembers" 
					:key="member.id"
					class="member-item"
					@click="viewMemberInfo(member)"
				>
					<view class="member-avatar">
						<image 
							v-if="member.avatar" 
							:src="member.avatar" 
							class="avatar-img" 
							mode="aspectFill"
						></image>
						<view v-else class="default-avatar">
							<text class="avatar-text">{{ getUserInitial(member.nickname) }}</text>
						</view>
						<view v-if="member.role === 'owner'" class="role-badge owner">群主</view>
						<view v-else-if="member.role === 'admin'" class="role-badge admin">管理员</view>
					</view>
					<text class="member-name">{{ member.nickname || '未知用户' }}</text>
				</view>
				<!-- 显示更多按钮 -->
				<view v-if="memberList.length > 8" class="member-item show-more" @click="showAllMembers">
					<view class="member-avatar more-avatar">
						<u-icon name="more-dot-fill" color="#999" size="40"></u-icon>
					</view>
					<text class="member-name">查看全部</text>
				</view>
			</view>
		</view>

		<!-- 危险操作 -->
		<view class="section danger-section">
			<view class="function-list">
				<view class="function-item danger-item" @click="leaveGroup">
					<u-icon name="close" color="#ff4757" size="40"></u-icon>
					<text class="function-text danger-text">退出群聊</text>
					<u-icon name="arrow-right" color="#ccc" size="32"></u-icon>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getRoomDetail, kickFromRoom, inviteToRoom } from '@/utils/api.js';

export default {
	data() {
		return {
			roomId: '',
			groupInfo: {},
			memberList: [],
			currentUserId: 0,
			showAllMembersFlag: false
		}
	},
	computed: {
		memberCount() {
			return this.memberList.length;
		},
		displayMembers() {
			if (this.showAllMembersFlag || this.memberList.length <= 8) {
				return this.memberList;
			}
			return this.memberList.slice(0, 8);
		}
	},
	onLoad(options) {
		this.roomId = options.room_id || '';
		
		//this.getCurrentUser();
	},
	onShow(){
		if (this.roomId) {
			this.loadGroupInfo();
		}
	},
	methods: {
		// 获取当前用户信息
		getCurrentUser() {
			const userInfo =uni.getStorageSync('$userinfo') || {};
			this.currentUserId = Number(userInfo.id); 
		},

		// 加载群组信息
		async loadGroupInfo() {
			try {
				const res = await getRoomDetail({ room_id: this.roomId });
				if (res.code === 0 && res.data) {
					this.groupInfo = res.data;
					this.currentUserId =this.groupInfo.owner_id;
					this.memberList = res.data.members || [];
					// 设置导航栏标题
					uni.setNavigationBarTitle({
						title: '群设置'
					});
				}
			} catch (error) {
				console.error('加载群组信息失败:', error);
				uni.showToast({
					title: '加载群组信息失败',
					icon: 'none'
				});
			}
		},

		// 获取群组名称首字母
		getGroupInitial() {
			const name = this.groupInfo.room_name || '群';
			return name.charAt(0).toUpperCase();
		},

		// 获取用户名首字母
		getUserInitial(name) {
			if (!name) return '?';
			return name.charAt(0).toUpperCase();
		},

		// 编辑群资料
		editGroupInfo() {
			// 检查权限：只有群主和管理员可以编辑
			const userInfo =uni.getStorageSync('$userinfo') || {};
			 
			if (userInfo.id !== this.currentUserId ) { //|| (currentMember.role !== 'owner' && currentMember.role !== 'admin')
				uni.showToast({
					title: '只有群主和管理员可以编辑群资料',
					icon: 'none'
				});
				return;
			}
			
			// 跳转到编辑群资料页面
			uni.navigateTo({
				url: `/pages/chat/edit_group?room_id=${this.roomId}`
			});
		},

		// 管理群成员
		manageMembers() {
			// 检查权限：只有群主和管理员可以管理成员
			const userInfo =uni.getStorageSync('$userinfo') || {};
			 
			if (userInfo.id !== this.currentUserId ) { //|| (currentMember.role !== 'owner' && currentMember.role !== 'admin')
				uni.showToast({
					title: '只有群主和管理员可以管理成员',
					icon: 'none'
				});
				return;
			}

			// 跳转到成员管理页面
			uni.navigateTo({
				url: `/pages/chat/manage_members?room_id=${this.roomId}`
			});
		},

		// 添加成员
		addMembers() {
			// 检查权限：只有群主和管理员可以添加成员
			// const userInfo =uni.getStorageSync('$userinfo') || {};			 
			//if (userInfo.id !== this.currentUserId ) { //|| (currentMember.role !== 'owner' && currentMember.role !== 'admin')
			//	uni.showToast({
			// 		title: '只有群主和管理员可以添加成员',
			// 		icon: 'none'
			// 	});
			// 	return;
			// }

			// 跳转到添加成员页面（可以复用创建群组页面的成员选择逻辑）
			uni.navigateTo({
				url: `/pages/msg/join-group`
			});
		},

		// 复制群号
		copyGroupId() {
			const groupId = this.groupInfo.room_number || this.groupInfo.id || '';
			if (groupId) {
				uni.setClipboardData({
					data: String(groupId),
					success: () => {
						uni.showToast({
							title: '群号已复制',
							icon: 'success'
						});
					},
					fail: () => {
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				});
			} else {
				uni.showToast({
					title: '群号获取失败',
					icon: 'none'
				});
			}
		},

		// 查看成员信息
		viewMemberInfo(member) {
			// 可以跳转到成员详情页面或显示成员信息弹窗
			console.log('查看成员信息:', member);
		},

		// 显示所有成员
		showAllMembers() {
			this.showAllMembersFlag = true;
		},

		// 退出群聊
		leaveGroup() {
			const currentMember = this.memberList.find(m => m.id === this.currentUserId);
			
			// 群主不能直接退出，需要先转让群主
			if (currentMember && currentMember.role === 'owner') {
				uni.showModal({
					title: '提示',
					content: '您是群主，退出群聊前需要先转让群主身份或解散群聊',
					showCancel: false
				});
				return;
			}

			uni.showModal({
				title: '确认退出',
				content: '确定要退出该群聊吗？',
				success: (res) => {
					if (res.confirm) {
						this.confirmLeaveGroup();
					}
				}
			});
		},

		// 确认退出群聊
		async confirmLeaveGroup() {
			try {
				// 这里应该调用退出群聊的API
				const userInfo =uni.getStorageSync('$userinfo') || {};
			 	const currentUserId = Number(userInfo.id); 
				// 暂时使用踢出成员的API，让用户自己踢出自己
				const res = await kickFromRoom({
					room_id: this.roomId,
					kickee_id: currentUserId
				});

				if (res.code === 0) {
					uni.showToast({
						title: '已退出群聊',
						icon: 'success'
					});
					
					// 返回到聊天列表
					setTimeout(() => {
						uni.navigateBack({
							delta: 2 // 返回到聊天列表页面
						});
					}, 1500);
				} else {
					uni.showToast({
						title: res.msg || '退出失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('退出群聊失败:', error);
				uni.showToast({
					title: '退出群聊失败',
					icon: 'none'
				});
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.group-set-container {
	min-height: 100vh;
	background-color: #f5f6fa;
}

.section {
	background-color: #fff;
	margin-bottom: 20rpx;

	&:first-child {
		margin-top: 0;
	}
}

/* 群组信息 */
.group-info {
	display: flex;
	align-items: center;
	padding: 40rpx 30rpx;

	.group-avatar {
		width: 120rpx;
		height: 120rpx;
		margin-right: 30rpx;
		position: relative;

		.avatar-img {
			width: 100%;
			height: 100%;
			border-radius: 20rpx;
		}

		.default-avatar {
			width: 100%;
			height: 100%;
			background-color: #3D6AFF;
			border-radius: 20rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			.avatar-text {
				color: #fff;
				font-size: 48rpx;
				font-weight: 500;
			}
		}
	}

	.group-details {
		flex: 1;
		display: flex;
		flex-direction: column;

		.group-name {
			font-size: 36rpx;
			font-weight: 500;
			color: #333;
			margin-bottom: 12rpx;
		}

		.group-desc {
			font-size: 28rpx;
			color: #666;
			margin-bottom: 8rpx;
			line-height: 1.4;
		}

		.group-id {
			font-size: 26rpx;
			color: #999;
		}
	}
}

/* 功能列表 */
.function-list {
	.function-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;

		&:last-child {
			border-bottom: none;
		}

		.function-text {
			flex: 1;
			font-size: 30rpx;
			color: #333;
			margin-left: 20rpx;
		}

		.function-count {
			font-size: 26rpx;
			color: #999;
			margin-right: 10rpx;
		}

		&.danger-item {
			.function-text.danger-text {
				color: #ff4757;
			}
		}
	}
}

/* 区块标题 */
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

/* 成员网格 */
.member-grid {
	display: flex;
	flex-wrap: wrap;
	padding: 20rpx;

	.member-item {
		width: 25%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx 10rpx;

		&.show-more {
			.more-avatar {
				background-color: #f5f6fa;
				border: 2rpx dashed #ccc;
			}
		}

		.member-avatar {
			width: 100rpx;
			height: 100rpx;
			position: relative;
			margin-bottom: 12rpx;

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

			.role-badge {
				position: absolute;
				bottom: -5rpx;
				right: -5rpx;
				padding: 4rpx 8rpx;
				border-radius: 20rpx;
				font-size: 20rpx;
				color: #fff;
				
				&.owner {
					background-color: #ff6b35;
				}
				
				&.admin {
					background-color: #3D6AFF;
				}
			}

			&.more-avatar {
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}

		.member-name {
			font-size: 24rpx;
			color: #333;
			text-align: center;
			max-width: 100%;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
}

/* 危险操作区域 */
.danger-section {
	margin-top: 40rpx;
}
</style>