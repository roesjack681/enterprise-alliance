<template>
	<view class="profile-container">
		<!-- 头部用户信息 -->
		<view class="header-section">
			<view class="user-info">
				<view class="avatar-wrapper" @click="jump('./set')">
					<image class="avatar" :src="userInfo.avatar || '/static/img/avatar.png'" mode="aspectFill"></image>
				</view>
				<view class="user-details">
					<view class="username">
						{{ userInfo.nickname || '用户' }}
						<image v-if="userInfo.review_status == 2" class="tag" src="/static/icon/auth.png"
							mode="aspectFill"></image>
						<image v-if="userInfo.isvip" class="tag" src="/static/icon/vip.png" mode="aspectFill"></image>
					</view>
					<view class="user-id">用户名: {{ userInfo.username }}</view>
					<view class="join-date">
						{{ userInfo.entityInfo && userInfo.entityInfo.name }}[{{ $C.getRoleName(userInfo.role) }}]
					</view>
				</view>
				<view class="edit-icon" @click="jump('./set')">
					<image src="/static/icon/icon4.png" mode="aspectFill" class="cu-avatar sm"></image>
				</view>
			</view>
		</view>

		<!-- 数据统计卡片 -->
		<view class="stats-card">
			<view class="section-title">服务订单</view>
			<view class="stats-row">
				<view class="stats-item bground" @click="$C.jump('/pages/provider/mylist')">
					<view class="stats-number blue">{{ serviceStats.total_products || 0 }}</view>
					<view class="stats-label">已发布服务</view>
				</view>
				<view class="stats-item bground" @click="goToOrderList()">
					<view class="stats-number blue">{{ serviceStats.total_orders || 0 }}</view>
					<view class="stats-label">累计订单</view>
				</view>
				<view class="stats-item bground">
					<view class="stats-number blue">{{ serviceStats.rating || '98%' }}</view>
					<view class="stats-label">好评率</view>
				</view>
			</view>
			<view class="stats-row">
				<view class="stats-item" @click="goToOrderList(2)">
					<view class="stats-number">{{ serviceStats.active_services || 0 }}</view>
					<view class="stats-label">服务中</view>
				</view>
				<view class="stats-item" @click="goToOrderList(1)">
					<view class="stats-number">{{ serviceStats.pending_payment || 0 }}</view>
					<view class="stats-label">待付款</view>
				</view>
				<view class="stats-item">
					<view class="stats-number">{{ serviceStats.pending_renewal || 0 }}</view>
					<view class="stats-label">待续费</view>
				</view>
				<view class="stats-item">
					<view class="stats-number">¥{{ serviceStats.monthly_income || '0' }}</view>
					<view class="stats-label">本月收入</view>
				</view>
			</view>
		</view>

		<!-- 快捷功能 -->
		<view class="quick-actions">
			<view class="section-title">快捷功能</view>
			<view class="action-grid">
				<view class="action-item" @click="$C.jump('/pages/provider/addService')">
					<view class="action-icon-bg">
						<image src="/static/icon/t1.png" class="action-icon" mode="aspectFit"></image>
					</view>
					<view class="action-label">发布服务</view>
				</view>
				<view class="action-item" @click="$C.jump('/pages/provider/mylist')">
					<view class="action-icon-bg">
						<image src="/static/icon/t2.png" class="action-icon" mode="aspectFit"></image>
					</view>
					<view class="action-label">服务管理</view>
				</view>
				<view class="action-item" @click="goToMyHomepage">
					<view class="action-icon-bg">
						<image src="/static/icon/home.png" class="action-icon" mode="aspectFit"></image>
					</view>
					<view class="action-label">我的主页</view>
				</view>
				<view class="action-item" @click="goToInvite">
					<view class="action-icon-bg">
						<image src="/static/icon/share.png" class="action-icon" mode="aspectFit"></image>
					</view>
					<view class="action-label">邀请码</view>
				</view>
				<view class="action-item">
					<view class="action-icon-bg">
						<image src="/static/icon/m4.png" class="action-icon" mode="aspectFit"></image>
					</view>
					<view class="action-label">客户管理</view>
				</view>
				<view class="action-item" @click="goToOrderList()">
					<view class="action-icon-bg">
						<image src="/static/icon/order.png" class="action-icon" mode="aspectFit"></image>
					</view>
					<view class="action-label">订单管理</view>
				</view>
				<view class="action-item">
					<view class="action-icon-bg">
						<image src="/static/icon/t7.png" class="action-icon" mode="aspectFit"></image>
					</view>
					<view class="action-label">数据分析</view>
				</view>

			</view>
		</view> 

		<!-- 客户消息 -->
		<view v-if="0" class="customer-messages">
			<view class="section-header">
				<view class="section-title">客户消息</view>
				<view class="section-more blue">查看全部</view>
			</view>

			<view class="message-list">
				<view class="message-item">
					<image src="/static/img/user.png" class="message-avatar" mode="aspectFit"></image>
					<view class="message-content">
						<view class="message-info">
							<view class="message-name">项目合作洽谈</view>
							<view class="message-time">10分钟前</view>
						</view>
						<view class="message-text">关于智能设备研发项目合作事宜</view>
					</view>
					<view class="message-status active"></view>
				</view>

				<view class="message-item">
					<image src="/static/img/user.png" class="message-avatar" mode="aspectFit"></image>
					<view class="message-content">
						<view class="message-info">
							<view class="message-name">订单确认</view>
							<view class="message-time">30分钟前</view>
						</view>
						<view class="message-text">请确认订单编号：2024020101</view>
					</view>
				</view>

				<view class="message-item">
					<image src="/static/icon/t2.png" class="message-avatar" mode="aspectFit"></image>
					<view class="message-content">
						<view class="message-info">
							<view class="message-name">续费提醒</view>
							<view class="message-time">2小时前</view>
						</view>
						<view class="message-text">您的客户记账服务即将到期</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 服务跟踪 -->
		<view class="service-tracking-section">
			<view class="section-header">
				<view class="section-title">服务跟踪</view>
				<view class="section-more blue" @click="goToOrderList()">查看全部</view>
			</view>

			<view class="tracking-list">
				<view v-if="trackingLoading" class="loading-container">
					<u-loading-icon mode="spinner" size="40"></u-loading-icon>
					<text class="loading-text">加载中...</text>
				</view>
				
				<view v-else-if="serviceTrackingData.length === 0" class="empty-container">
					<image src="/static/icon/t1.png" class="empty-icon" mode="aspectFit"></image>
					<text class="empty-text">暂无服务跟踪数据</text>
				</view>
				
					<view v-else>
						<view class="tracking-item" v-for="tracking in serviceTrackingData" :key="tracking.id" @click="viewOrderDetail(tracking)">
							<view class="tracking-icon">
								<text class="icon-text">{{ tracking.client_name.charAt(0) }}</text>
							</view>
							<view class="tracking-content">
								<view class="tracking-header">
									<view class="tracking-title">{{ tracking.client_name }}</view>
									<view class="tracking-status" :class="tracking.statusClass">{{ tracking.statusText }}</view>
								</view>
								<view class="tracking-service">{{ tracking.service_name }}</view>
								<view class="tracking-details">
									<view class="detail-item">
										<text class="detail-label">当前步骤</text>
										<text class="detail-value">{{ tracking.current_step }}</text>
									</view>
									<view class="detail-item" v-if="tracking.price">
										<text class="detail-label">服务费用</text>
										<text class="detail-value price">¥{{ tracking.price }}</text>
									</view>
									<view class="detail-item">
										<text class="detail-label">创建时间</text>
										<text class="detail-value">{{ formatTime(tracking.create_time) }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
			</view>
		</view>
		<!-- 服务管理 -->
		<view class="service-management">
			<view class="section-header">
				<view class="section-title">服务管理</view>
				<view class="section-more blue" @click="$C.jump('/pages/provider/mylist')">管理服务</view>
			</view>

			<!-- 服务类型选项 -->
			<!-- <view class="service-tabs">
				<view class="service-tab active">代理记账</view>
				<view class="service-tab">项目申报</view>
				<view class="service-tab">税务咨询</view>
				<view class="service-tab">财税</view>
			</view> -->

			<!-- 服务列表 -->
			<view class="service-list">
				<view v-if="loading" class="loading-container">
					<u-loading-icon mode="spinner" size="40"></u-loading-icon>
					<text class="loading-text">加载中...</text>
				</view>
				
				<view v-else-if="myServices.length === 0" class="empty-container">
					<image src="/static/icon/t1.png" class="empty-icon" mode="aspectFit"></image>
					<text class="empty-text">暂无服务，快去发布吧！</text>
					<button class="btn-primary" @click="$C.jump('/pages/provider/addService')">发布服务</button>
				</view>
				
				<view v-else class="service-item" v-for="service in myServices" :key="service.id" @click="viewServiceDetail(service)">
					<view class="service-icon">
						<text class="service-icon-text">{{ getServiceIcon(service.category_name) }}</text>
					</view>
					<view class="service-content">
						<view class="service-header">
							<view class="service-title">{{ service.title }}</view>
							<view class="service-status" :class="{
								'status-draft': service.status === 0,
								'status-pending': service.status === 1,
								'status-active': service.status === 2,
								'status-rejected': service.status === 3,
								'status-offline': service.status === 4
							}">
								{{ getStatusText(service.status) }}
							</view>
						</view>
						<view class="service-desc">{{ service.description }}</view>
						<view class="service-price blue">¥{{ formatPrice(service.price) }}{{ service.unit ? '/' + service.unit : '' }}</view>
						<view class="service-tags">
							<view v-if="service.price_type === 3" class="service-tag price-tag">
								议价
							</view>
							<view v-if="service.view_count > 100" class="service-tag hot-tag">
								热门
							</view>
							<view v-if="service.favorite_count > 10" class="service-tag favorite-tag">
								推荐
							</view>
							<view v-if="service.tags" class="service-tag" v-for="(tag, index) in parseTags(service.tags)" :key="index">
								{{ tag.name || tag }}
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 功能选项 -->
		<view class="function-section">
			<view class="function-item" @click="goToAuth">
				<view class="function-icon">
					<u-icon name="checkmark-circle-fill" color="#409EFF" size="30"></u-icon>
				</view>
				<view class="function-text">我的认证</view>
				<view class="function-status">{{ $C.getAuthName(userInfo.review_status) }}</view>
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
import { getMyServiceProducts, getProviderOrderStats, getServiceTrackingData } from '@/utils/api.js'

export default {
	data() {
		return {
			notificationCount: 2,
			userInfo: {},
			myServices: [],
			loading: false,
			serviceTrackingData: [], // 服务跟踪数据
			trackingLoading: false, // 服务跟踪加载状态
			serviceStats: {
				total_products: 0,
				total_orders: 0,
				rating: '98%',
				active_services: 0,
				pending_payment: 0,
				pending_renewal: 0,
				monthly_income: '0'
			}
		}
	},
	onLoad() {
		this.refreshData();
	},
	methods: {
	refreshData() {
		this.userInfo = uni.getStorageSync('$userinfo');
		this.getMyServiceProducts();
		this.getProviderOrderStats();
		this.getServiceTrackingData();
	},
		
		// 获取我的服务产品列表
		async getMyServiceProducts() {
			try {
				this.loading = true;
				const params = { page: 1, page_size: 3 };
				const response = await getMyServiceProducts(params);
				
				if (response.code === 0) {
					this.myServices = response.data.list || [];
					this.updateServiceStats();
				} else {
					uni.showToast({ title: response.message || '获取服务列表失败', icon: 'none' });
				}
			} catch (error) {
				uni.showToast({ title: error.msg || '网络错误，请稍后重试', icon: 'none' });
			} finally {
				this.loading = false;
			}
		},
		
		// 获取服务商订单统计数据
		async getProviderOrderStats() {
			try {
				const response = await getProviderOrderStats({});
				if (response.code === 0) {
					this.serviceStats = { ...this.serviceStats, ...response.data };
				}
			} catch (error) {
				// 静默处理错误
			}
		},
		
		// 获取服务跟踪数据
		async getServiceTrackingData() {
			try {
				this.trackingLoading = true;
				const params = {
					provider_id: this.userInfo.id,
					current_page: 1,
					page_size: 3,
					status: 'Active'
				};
				
				const response = await getServiceTrackingData(params);
				
				if (response.code === 0) {
					const orders = response.data.list || [];
					this.serviceTrackingData = orders.map(order => ({
						id: order.id,
						order_no: order.order_id,
						client_name: order.user_name || '客户',
						service_name: order.title || '服务',
						status: order.status,
						statusText: this.getServiceFlowStatusText(order.status),
						statusClass: this.getServiceFlowStatusClass(order.status),
						current_step: order.current_step,
						price: order.price,
						service_type: order.service_type,
						remarks: order.remarks,
						create_time: order.create_time
					}));
				} else {
					this.serviceTrackingData = [];
				}
			} catch (error) {
				this.serviceTrackingData = [];
			} finally {
				this.trackingLoading = false;
			}
		},
		
		
		// 获取服务流程状态文本
		getServiceFlowStatusText(status) {
			const statusMap = {
				'Pending': '待处理',
				'Active': '进行中',
				'Paused': '已暂停',
				'Completed': '已完成',
				'Cancelled': '已取消'
			};
			return statusMap[status] || '未知';
		},
		
		// 获取服务流程状态样式类
		getServiceFlowStatusClass(status) {
			const statusMap = {
				'Pending': 'status-pending',
				'Active': 'status-active',
				'Paused': 'status-paused',
				'Completed': 'status-completed',
				'Cancelled': 'status-cancelled'
			};
			return statusMap[status] || 'status-unknown';
		},
		
		// 格式化时间
		formatTime(timestamp) {
			if (!timestamp) return '';
			const date = new Date(timestamp * 1000);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
		},
		
		// 更新服务统计数据
		updateServiceStats() {
			const stats = {
				...this.serviceStats,
				total_products: this.myServices.length,
				active_services: this.myServices.filter(service => service.status === 2).length
			};
			this.serviceStats = stats;
		},
		
		// 获取服务图标
		getServiceIcon(categoryName) {
			if (!categoryName) return '';
			return  categoryName.charAt(0) || '';
		},
		
		// 格式化价格
		formatPrice(price) {
			if (!price) return '0';
			return (price).toLocaleString(); // 假设价格以分为单位存储
		},
		
		// 获取状态样式类
		getStatusClass(status) {
			const statusMap = {
				0: 'status-draft',      // 草稿
				1: 'status-pending',    // 待审核
				2: 'status-active',     // 已上架
				3: 'status-rejected',   // 已下架
				4: 'status-offline'     // 已删除
			};
			return statusMap[status] || 'status-draft';
		},
		
		// 获取状态文本
		getStatusText(status) {
			const statusMap = {
				0: '草稿',
				1: '待审核',
				2: '已上架',
				3: '已下架',
				4: '已删除'
			};
			return statusMap[status] || '未知';
		},
		
		// 解析标签
		parseTags(tags) {
			if (!tags) return [];
			try {
				// 如果是JSON字符串，解析为数组
				if (typeof tags === 'string') {
					const parsed = JSON.parse(tags);
					return Array.isArray(parsed) ? parsed : [];
				}
				// 如果已经是数组，直接返回
				return Array.isArray(tags) ? tags : [];
			} catch (error) {
				console.error('解析标签失败:', error);
				// 如果解析失败，尝试按逗号分割
				if (typeof tags === 'string') {
					return tags.split(',').filter(tag => tag.trim()).map(tag => ({ id: tag, name: tag }));
				}
				return [];
			}
		},
		
		// 查看服务详情
		viewServiceDetail(service) {
			uni.navigateTo({
				url: `/pages/service/detail?id=${service.id}`
			});
		},
		
		jump(url) {
			uni.navigateTo({
				url: url
			})
		},
		viewAllCompanies() {
			uni.navigateTo({
				url: '/pages/company/list'
			})
		},
		 
		goToAuth() {
			if (this.userInfo.review_status == 2) return;
			uni.navigateTo({
				url: '/pages/entity/auth'
			})
		},
		goToNotification() {
			uni.switchTab({
				url: '/pages/msg/msg'
			})
		},
		goToMyHomepage() {
			uni.navigateTo({
				url: '/pages/provider/home?id='+this.userInfo.id
			})
		},
		goToInvite() {
			uni.navigateTo({
				url: '/pages/entity/invite'
			})
		},
		
		// 跳转到订单列表页面
		goToOrderList(status = null) {
			const url = status ? `/pages/provider/order?status=${status}` : '/pages/provider/order';
			uni.navigateTo({
				url: url
			});
		},
		
		// 查看订单详情
		viewOrderDetail(tracking) {
			uni.navigateTo({
				url: `/pages/serviceFlow/track?order_id=${tracking.id}&order_no=${tracking.order_no}&service_order_id=${tracking.order_no}`
			});
		},
	}
}
</script>

<style lang="scss" scoped>
.profile-container {
	padding: 20rpx 0px;
	min-height: 100vh;
	background-color: #f5f5f5;
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

.tag {
	width: 30rpx;
	height: 30rpx;
}

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

/* 数据统计卡片 */
.stats-card {
	margin: 24rpx;
	padding: 20rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		padding: 24rpx
	}

	.stats-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 30rpx;
	}

	.bground {
		background-color: #e8f0fe;
		padding: 20rpx;
		margin: 0 20rpx;
		border-radius: 20rpx;
		cursor: pointer;
		transition: opacity 0.2s;

		&:active {
			opacity: 0.7;
		}
	}

	.stats-item {
		text-align: center;
		flex: 1;
		cursor: pointer;
		transition: opacity 0.2s;

		&:active {
			opacity: 0.7;
		}

		.stats-number {
			font-size: 38rpx;
			color: #333;
			margin-bottom: 8rpx;

			&.blue {
				font-weight: 600;
				color: #3D6AFF;
			}
		}

		.stats-label {
			font-size: 24rpx;
			color: #666;
		}
	}
}

/* 快捷功能 */
.quick-actions {
	margin: 0 24rpx 24rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		padding: 24rpx
	}

	.action-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20rpx;
		padding: 20rpx 20rpx 40rpx;
	}

	.action-item {
		text-align: center;

		.action-icon-bg {
			width: 80rpx;
			height: 80rpx;
			background-color: #f0f4ff;
			border-radius: 50%;
			margin: 0 auto 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.action-icon {
			width: 80rpx;
			height: 80rpx;
		}

		.action-label {
			font-size: 24rpx;
			color: #666;
			margin-top: 12rpx;
		}
	}
}

/* 服务管理 */
.service-management {
	margin: 0 24rpx 24rpx;
	background-color: #fff;
	border-radius: 16rpx 16rpx 0 0;

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}

		.section-more {
			color: #3D6AFF;
			font-size: 28rpx;
		}
	}

	.service-tabs {
		display: flex;
		padding: 0rpx 32rpx 0;

		.service-tab {
			padding: 16rpx;
			font-size: 28rpx;
			color: #666;
			margin-right: 24rpx;
			border-radius: 40rpx;

			&.active {
				background-color: #3D6AFF;
				color: #fff;
			}
		}
	}

	.service-list {
		background-color: #fff;
		border-radius: 0 0 16rpx 16rpx;
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 0;
		
		.loading-text {
			margin-top: 20rpx;
			font-size: 28rpx;
			color: #999;
		}
	}
	
	.empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 0;
		
		.empty-icon {
			width: 120rpx;
			height: 120rpx;
			margin-bottom: 20rpx;
			opacity: 0.5;
		}
		
		.empty-text {
			font-size: 28rpx;
			color: #999;
			margin-bottom: 30rpx;
		}
		
		.btn-primary {
			background-color: #3D6AFF;
			color: #fff;
			border: none; 
			border-radius: 40rpx;
			font-size: 28rpx;
		}
	}

	.service-item {
		display: flex;
		padding: 32rpx;
		border-bottom: 1rpx solid #f0f0f0;
		cursor: pointer;

		&:last-child {
			border-bottom: none;
		}
		
		&:active {
			background-color: #f8f9fa;
		}

		.service-icon {
			width: 80rpx;
			height: 80rpx;
			background-color: #f0f4ff;
			border-radius: 16rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 24rpx;

			.service-icon-text {
				font-size: 32rpx;
				color: #3D6AFF;
			}
		}

		.service-content {
			flex: 1;

			.service-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 8rpx;
				
				.service-title {
					font-size: 32rpx;
					color: #333;
					flex: 1;
					margin-right: 16rpx;
					line-height: 1.4;
				}
			}

			.service-desc {
				font-size: 26rpx;
				color: #666;
				margin-bottom: 12rpx;
			}

			.service-price {
				font-size: 32rpx;
				color: #3D6AFF;
				margin-bottom: 12rpx;
			}
			
			.service-tags {
				display: flex;
				flex-wrap: wrap;
				gap: 8rpx;
				align-items: center;
				margin-top: 4rpx;
			}
			
			.service-status {
				display: inline-block;
				padding: 4rpx 12rpx;
				border-radius: 20rpx;
				font-size: 22rpx;
				white-space: nowrap;
				flex-shrink: 0;
				
				&.status-draft {
					background-color: #f0f0f0;
					color: #999;
				}
				
				&.status-pending {
					background-color: #fff3cd;
					color: #856404;
				}
				
				&.status-active {
					background-color: #d4edda;
					color: #155724;
				}
				
				&.status-rejected {
					background-color: #f8d7da;
					color: #721c24;
				}
				
				&.status-offline {
					background-color: #e2e3e5;
					color: #6c757d;
				}
			}

			.service-tag {
				display: inline-block;
				padding: 4rpx 10rpx;
				border-radius: 16rpx;
				font-size: 22rpx;
				background-color: #f0f4ff;
				color: #666;
				white-space: nowrap;
				
				&.price-tag {
					background-color: #fff3cd;
					color: #856404;
				}
				
				&.hot-tag {
					background-color: #ffe6e6;
					color: #ff4757;
				}
				
				&.favorite-tag {
					background-color: #fff2e6;
					color: #ff6b35;
				}
			}
		}
	}
}

/* 客户消息 */
.customer-messages {
	margin: 0 24rpx 24rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}

		.section-more {
			font-size: 28rpx;
			color: #3D6AFF;
		}
	}

	.message-item {
		display: flex;
		align-items: center;
		padding: 32rpx;
		border-bottom: 1rpx solid #f0f0f0;
		position: relative;

		&:last-child {
			border-bottom: none;
		}

		.message-avatar {
			width: 96rpx;
			height: 96rpx;
			border-radius: 50%;
			margin-right: 24rpx;
		}

		.message-content {
			flex: 1;

			.message-info {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 8rpx;

				.message-name {
					font-size: 30rpx;
					color: #333;
				}

				.message-time {
					font-size: 24rpx;
					color: #999;
				}
			}

			.message-text {
				font-size: 26rpx;
				color: #666;
			}
		}

		.message-status {
			width: 16rpx;
			height: 16rpx;
			border-radius: 50%;
			position: absolute;
			top: 20rpx;
			left: 120rpx;

			&.active {
				background-color: #3D6AFF;
			}
		}
	}
}

/* 服务跟踪 */
.service-tracking-section {
	margin: 0 24rpx 24rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}

		.section-more {
			color: #3D6AFF;
			font-size: 28rpx;
		}
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 0;
		
		.loading-text {
			margin-top: 20rpx;
			font-size: 28rpx;
			color: #999;
		}
	}
	
	.empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 0;
		
		.empty-icon {
			width: 120rpx;
			height: 120rpx;
			margin-bottom: 20rpx;
			opacity: 0.5;
		}
		
		.empty-text {
			font-size: 28rpx;
			color: #999;
		}
	}

	.tracking-item {
		display: flex;
		align-items: flex-start;
		padding: 24rpx 32rpx;
		border-bottom: 1rpx solid #f0f0f0;
		cursor: pointer;
		transition: background-color 0.2s;
		
		&:last-child {
			border-bottom: none;
		}
		
		&:active {
			background-color: #f8f9fa;
		}

		.tracking-icon {
			width: 80rpx;
			height: 80rpx;
			background-color: #3D6AFF;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 24rpx;
			flex-shrink: 0;

			.icon-text {
				color: #fff;
				font-size: 32rpx;
				font-weight: 600;
			}
		}

		.tracking-content {
			flex: 1;
			min-width: 0;

			.tracking-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 8rpx;
				
				.tracking-title {
					font-size: 30rpx;
					color: #333;
					font-weight: 600;
					flex: 1;
					margin-right: 16rpx;
				}
				
				.tracking-status {
					padding: 4rpx 12rpx;
					border-radius: 16rpx;
					font-size: 22rpx;
					font-weight: 500;
					white-space: nowrap;
					
					&.status-pending {
						background-color: #fff3cd;
						color: #856404;
					}
					
					&.status-active {
						background-color: #d4edda;
						color: #155724;
					}
					
					&.status-paused {
						background-color: #f8d7da;
						color: #721c24;
					}
					
					&.status-completed {
						background-color: #d1ecf1;
						color: #0c5460;
					}
					
					&.status-cancelled {
						background-color: #f5c6cb;
						color: #721c24;
					}
				}
			}
			
			.tracking-service {
				font-size: 26rpx;
				color: #666;
				margin-bottom: 16rpx;
			}
			
			.tracking-details {
				.detail-item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 6rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					.detail-label {
						font-size: 24rpx;
						color: #999;
						flex-shrink: 0;
						margin-right: 16rpx;
					}
					
					.detail-value {
						font-size: 24rpx;
						color: #333;
						text-align: right;
						flex: 1;
						
						&.price {
							color: #ff6b35;
							font-weight: 600;
						}
					}
				}
			}
		}
	}
}

/*底部认证*/

/*底部认证*/
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
	margin-right:12rpx;
	min-width: 32rpx;
	text-align: center;
}
</style>