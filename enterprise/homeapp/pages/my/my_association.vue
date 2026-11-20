<template>
	<view class="profile-container">
		<!-- 头部用户信息 -->
		<view class="header-section">
			<view class="user-info">
				<view class="avatar-wrapper" @click="jump('./set')">
					<image class="avatar" :src="userInfo.avatar||'/static/img/avatar.png'" mode="aspectFill"></image>
				</view>
				<view class="user-details">
					<view class="username">{{userInfo.nickname||'用户'}}
					<image v-if="userInfo.review_status==2" class="tag" src="/static/icon/auth.png" mode="aspectFill"></image>
					<image v-if="userInfo.isvip" class="tag" src="/static/icon/vip.png" mode="aspectFill"></image>
					</view>
					<view class="user-id">用户名: {{userInfo.username}}</view>
					<view class="join-date">{{userInfo.entityInfo&&userInfo.entityInfo.name}}[{{$C.getRoleName(userInfo.role)}}]</view>
				</view>
				<view class="edit-icon" @click="jump('./set')">
					<image src="/static/icon/icon4.png" mode="aspectFill" class="cu-avatar sm"></image>
				</view>
			</view>
		</view>
		<!-- 统计数据 -->
		<view class="stats-section">
			<view class="stats-grid">
				<view class="stat-item">
					<view class="stat-icon">
						<image src="/static/icon/icon1.png" mode="aspectFill" class="cu-avatar sm"></image>
					</view>
					<view class="stat-number">{{ statisticsData.associated_enterprises || 0 }}</view>
					<view class="stat-label">已关联企业</view>
				</view>
				<view class="stat-item">
					<view class="stat-icon">
						<image src="/static/icon/icon2.png" mode="aspectFill" class="cu-avatar sm"></image>
					</view>
					<view class="stat-number">{{ statisticsData.associated_providers || 0 }}</view>
					<view class="stat-label">关联服务商</view>
				</view>
				<view class="stat-item">
					<view class="stat-icon">
						<image src="/static/icon/icon3.png" mode="aspectFill" class="cu-avatar sm"></image>
					</view>
					<view class="stat-number">{{ statisticsData.total_cooperation_projects || 0 }}</view>
					<view class="stat-label">累计合作项目</view>
				</view>
			</view>
		</view>
		
		<!--协会功能-->
		<association-control-panel ref="myChild1" v-if="userInfo.role==9"></association-control-panel>
		<association-company-list ref="myChild2" v-if="userInfo.role==9"></association-company-list>
		<association-provider-list ref="myChild3" v-if="userInfo.role==9"></association-provider-list>
		<!--企业功能-->
		
		<!--服务商功能-->
		
		<!-- 功能选项 -->
		<view class="function-section">
			<view class="function-item" @click="goToAuth">
				<view class="function-icon">
					<u-icon name="checkmark-circle-fill" color="#409EFF" size="30"></u-icon>
				</view>
				<view class="function-text">我的认证</view>
				<view class="function-status">{{$C.getAuthName(userInfo.review_status)}}</view>
				<u-icon class="margin-top-xs" name="arrow-right" color="#c8c9cc" size="28"></u-icon>
			</view>
			<view class="function-item" @click="goToNotification">
				<view class="function-icon">
					<u-icon name="email" color="#409EFF" size="30"></u-icon>
				</view>
				<view class="function-text">消息通知</view>
				<view class="notification-badge" v-if="notificationCount > 0">
					<text>{{ notificationCount }}</text>
				</view>
				<u-icon name="arrow-right" color="#c8c9cc" size="28"></u-icon>
			</view>
		</view>
	</view>
</template>

<script>
	import associationCompanyList from './components/association_company_list.vue';
	import associationControlPanel from './components/association_control_panel.vue';
	import associationProviderList from './components/association_provider_list.vue';
	import { getStatistics } from '@/utils/api.js';
	export default {
		components: {
			associationCompanyList,associationControlPanel,associationProviderList
		},
		data() {
			return {
				notificationCount: 2,
				userInfo:{},
				statisticsData: {
					associated_enterprises: 0,
					associated_providers: 0,
					total_cooperation_projects: 0,
					total_products: 0,
					total_orders: 0,
					total_revenue: 0,
					monthly_stats: {
						new_enterprises: 0,
						new_providers: 0,
						new_projects: 0,
						revenue: 0
					}
				}
			}
		},
		onShow() {
			this.refreshData();
		},
		methods: {
			// 获取统计数据
			async getStatisticsData() {
				try {
					const response = await getStatistics({
						user_id: this.userInfo.id
					});
					
					if (response.code === 0 && response.data) {
						this.statisticsData = {
							associated_enterprises: response.data.associated_enterprises || 0,
							associated_providers: response.data.associated_providers || 0,
							total_cooperation_projects: response.data.total_cooperation_projects || 0,
							total_products: response.data.total_products || 0,
							total_orders: response.data.total_orders || 0,
							total_revenue: response.data.total_revenue || 0,
							monthly_stats: {
								new_enterprises: response.data.monthly_stats?.new_enterprises || 0,
								new_providers: response.data.monthly_stats?.new_providers || 0,
								new_projects: response.data.monthly_stats?.new_projects || 0,
								revenue: response.data.monthly_stats?.revenue || 0
							}
						};
					}
				} catch (error) {
					console.error('获取统计数据失败:', error);
					uni.showToast({
						title: '获取统计数据失败',
						icon: 'none'
					});
				}
			},
			
			refreshData(){
				this.userInfo=uni.getStorageSync('$userinfo');
				
				// 获取统计数据
				this.getStatisticsData();
				
				//刷新组件
				this.$nextTick(() => {
				this.$refs.myChild1?.refreshData?.();
				this.$refs.myChild2?.refreshData?.();
				this.$refs.myChild3?.refreshData?.();
				});
			},
			jump(url){
				uni.navigateTo({
					url: url
				})
			},	
			viewAllCompanies() {
				uni.navigateTo({
					url: '/pages/company/list'
				})
			},
			viewAllServices() {
				uni.navigateTo({
					url: '/pages/service/list'
				})
			},
			goToAuth() {
				if(this.userInfo.review_status==2) return;
				uni.navigateTo({
					url: '/pages/entity/auth'
				})
			},
			goToNotification() {
				uni.switchTab({
					url: '/pages/msg/msg'
				})
			},			
			

		}
	}
</script>

<style lang="scss" scoped>
	.profile-container {
		padding:20rpx 0px;
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.status-bar {
		background-color: #fff;
	}

	.header-section { 
		
		flex-direction: column;
		align-items: center;
		padding: 60rpx 30rpx;
		background-color: #fff;
		margin: 0 24rpx 20rpx;
		border-radius: 16rpx;
		
	}

	.user-info {
		display: flex;
		align-items: center;
		position: relative;
	}

	.avatar-wrapper {
		margin-right: 30rpx;
	}

	.avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 60rpx;
		background-color: #f0f0f0;
	}
	.tag{width:30rpx;height:30rpx;}
	.user-details {
		flex: 1;
	}

	.username {
		font-size: 36rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 12rpx;
	}

	.user-id {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 8rpx;
	}

	.join-date {
		font-size: 28rpx;
		color: #666;
	}

	.edit-icon {
		position: absolute;
		right: 0;
		top: auto;
	}

	.stats-section {
		
		padding: 40rpx 30rpx;
		background-color: #fff;
		margin: 0 24rpx 20rpx;
		border-radius: 16rpx;
	}

	.stats-grid {
		display: flex;
		justify-content: space-around;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}

	.stat-icon {
		margin-bottom: 16rpx;
	}

	.stat-icon .cu-avatar {
		width: 48rpx;
		height: 48rpx;
		border-radius: 8rpx;
	}

	.stat-number {
		font-size: 48rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 8rpx;
	}

	.stat-label {
		font-size: 24rpx;
		color: #666;
	}

	

	

	.function-section {
		background-color: #fff;
		padding: 0 30rpx;
		
		margin: 24rpx 20rpx;
		border-radius: 16rpx;
	}

	.function-item {
		display: flex;
		align-items: center;
		height: 100rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.function-item:last-child {
		border-bottom: none;
	}

	.function-icon {
		margin-right: 24rpx;
	}

	.function-text {
		flex: 1;
		font-size: 30rpx;
		color: #333;
	}

	.function-status {
		font-size: 28rpx;
		color: #999;
		margin-right: 12rpx;
	}

	.notification-badge {
		background-color: #ff4757;
		color: #fff;
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
		margin-right: 12rpx;
		min-width: 32rpx;
		text-align: center;
	}
</style>