<template>
	<view class="order-container">
		<!-- 状态筛选 -->
		<view class="filter-tabs">
			<view 
				class="filter-tab" 
				:class="{ active: currentStatus === null }" 
				@click="switchStatus(null)">
				<text class="filter-text">全部<text class="filter-count" v-if="pagination.total > 0">({{ pagination.total }})</text></text>
			</view>
			<view 
				class="filter-tab" 
				:class="{ active: currentStatus === 1 }" 
				@click="switchStatus(1)">
				<text class="filter-text">待付款</text>
			</view>
			<view 
				class="filter-tab" 
				:class="{ active: currentStatus === 2 }" 
				@click="switchStatus(2)">
				<text class="filter-text">已付款</text>
			</view>
			<view 
				class="filter-tab" 
				:class="{ active: currentStatus === 3 }" 
				@click="switchStatus(3)">
				<text class="filter-text">已完成</text>
			</view>
			<view 
				class="filter-tab" 
				:class="{ active: currentStatus === 4 }" 
				@click="switchStatus(4)">
				<text class="filter-text">已取消</text>
			</view>
		</view>

		<!-- 订单列表 -->
		<view class="order-list">
			<view v-if="loading && orderList.length === 0" class="loading-container">
				<u-loading-icon mode="spinner" size="40"></u-loading-icon>
				<text class="loading-text">加载中...</text>
			</view>
			
			<view v-else-if="orderList.length === 0" class="empty-container">
				<image src="/static/icon/order.png" class="empty-icon" mode="aspectFit"></image>
				<text class="empty-text">暂无订单</text>
			</view>
			
			<view v-else>
				<view 
					class="order-item" 
					v-for="order in orderList" 
					:key="order.id"
					@click="viewOrderDetail(order)">
					
					<!-- 订单头部 -->
					<view class="order-header">
						<view class="order-info">
							<text class="order-no">订单号：{{ order.order_no }}</text>
							<text class="order-time">{{ order.create_time_text }}</text>
						</view>
						<view class="order-status" :class="order.statusClass">
							{{ order.status_text }}
						</view>
					</view>

					<!-- 客户和服务信息 -->
					<view class="order-content">
						<view class="customer-section">
							<image 
								:src="order.customer_avatar || '/static/img/avatar.png'" 
								class="customer-avatar" 
								mode="aspectFill">
							</image>
							<view class="customer-details">
								<text class="customer-name">{{ order.customer_name || '企业A' }}</text>
								<text class="customer-phone" v-if="order.customer_mobile_masked">{{ order.customer_mobile_masked }}</text>
								<text class="customer-phone" v-else>138****5566</text>
							</view>
						</view>
						
						<view class="service-section">
							<text class="service-label">{{ order.service_title || 'IT服务' }}</text>
							<text class="service-amount">¥{{ order.amount }}</text>
						</view>
					</view>

					<!-- 订单操作 -->
					<view class="order-actions" v-if="order.status === 1">
						<button class="action-btn outline" @click.stop="handleOrderAction(order, 'contact')">
							联系客户
						</button>
						<button class="action-btn primary" @click.stop="handleOrderAction(order, 'remind')">
							提醒付款
						</button>
					</view>
					
					<view class="order-actions" v-else-if="order.status === 2">
						<button class="action-btn outline" @click.stop="handleOrderAction(order, 'contact')">
							联系客户
						</button>
						<button class="action-btn primary" @click.stop="handleOrderAction(order, 'track')">
							服务进度
						</button>
					</view>
				</view>
			</view>
		</view>

		<!-- 加载更多 -->
		<u-loadmore 
			v-if="orderList.length > 0"
			:status="loadStatus" 
			@loadmore="loadMore"
			margin-top="20"
			margin-bottom="20">
		</u-loadmore>
	</view>
</template>

<script>
import { getProviderOrderList } from '@/utils/api.js'

	export default {
		data() {
			return {
			currentStatus: null, // 当前筛选状态
			orderList: [], // 订单列表
			loading: false, // 加载状态
			loadStatus: 'loadmore', // 加载更多状态
			pagination: {
				page: 1,
				page_size: 10,
				total: 0,
				total_pages: 0
			}
		}
	},
	onLoad(options) {
		// 如果传入了状态参数，设置当前状态
		if (options.status) {
			this.currentStatus = parseInt(options.status);
		}
		this.loadOrderList();
	},
	onPullDownRefresh() {
		this.refreshOrderList();
	},
	onReachBottom() {
		this.loadMore();
	},
	methods: {
		// 加载订单列表
		async loadOrderList(isRefresh = false) {
			if (this.loading) return;
			
			try {
				this.loading = true;
				
				if (isRefresh) {
					this.pagination.page = 1;
					this.orderList = [];
				}
				
				const params = {
					page: this.pagination.page,
					page_size: this.pagination.page_size
				};
				
				// 只有当状态不为null时才添加status参数
				if (this.currentStatus !== null) {
					params.status = this.currentStatus;
				}
				
				const response = await getProviderOrderList(params);
				
				if (response.code === 0) {
					const { list, total, total_pages } = response.data;
					
					// 为每个订单添加状态样式类名
					const processedList = list.map(order => ({
						...order,
						statusClass: this.getStatusClass(order.status)
					}));
					
					if (isRefresh || this.pagination.page === 1) {
						this.orderList = processedList;
					} else {
						this.orderList = [...this.orderList, ...processedList];
					}
					
					this.pagination.total = total;
					this.pagination.total_pages = total_pages;
					
					// 更新加载更多状态
					if (this.pagination.page >= total_pages) {
						this.loadStatus = 'nomore';
					} else {
						this.loadStatus = 'loadmore';
					}
				} else {
					const errorMsg = response.message || response.msg || '获取订单列表失败';
					uni.showToast({
						title: errorMsg,
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('获取订单列表失败:', error);
				let errorMsg = '网络错误，请稍后重试';
				if (error.msg) {
					errorMsg = error.msg;
				} else if (error.message) {
					errorMsg = error.message;
				}
				uni.showToast({
					title: errorMsg,
					icon: 'none'
				});
			} finally {
				this.loading = false;
				uni.stopPullDownRefresh();
			}
		},
		
		// 刷新订单列表
		refreshOrderList() {
			this.loadOrderList(true);
		},
		
		// 加载更多
		loadMore() {
			if (this.loadStatus === 'loadmore' && this.pagination.page < this.pagination.total_pages) {
				this.pagination.page++;
				this.loadOrderList();
			}
		},
		
		// 切换状态筛选
		switchStatus(status) {
			if (this.currentStatus === status) return;
			
			this.currentStatus = status;
			this.pagination.page = 1;
			this.loadStatus = 'loadmore';
			this.loadOrderList(true);
		},
		
		// 查看订单详情
		viewOrderDetail(order) {
			uni.navigateTo({
				url: `/pages/order/detail?id=${order.id}&order_no=${order.order_no}`
			});
		},
		
		// 处理订单操作
		handleOrderAction(order, action) {
			switch (action) {
				case 'track':
					this.trackService(order);
					break;
				case 'contact':
					this.contactCustomer(order);
					break;
				case 'remind':
					this.remindPayment(order);
					break;
			}
		},
		
		// 服务跟踪
		trackService(order) {
			// 如果有service_order_id，优先使用，否则使用普通order_id
			const serviceOrderId = order.service_order_id || order.id;
			const params = `order_id=${order.id}&order_no=${order.order_no}&service_order_id=${serviceOrderId}`;
			uni.navigateTo({
				url: `/pages/serviceFlow/track?${params}`
			});
		},
		
		// 联系客户
		contactCustomer(order) {
			if (order.customer_mobile) {
				uni.showModal({
					title: '联系客户',
					content: `是否拨打客户电话：${order.customer_mobile_masked || order.customer_mobile}？`,
					success: (res) => {
						if (res.confirm) {
							uni.makePhoneCall({
								phoneNumber: order.customer_mobile,
								fail: (err) => {
									console.error('拨打电话失败:', err);
									uni.showToast({
										title: '拨打电话失败',
										icon: 'none'
									});
								}
							});
						}
					}
				});
			} else {
				uni.showToast({
					title: '客户联系方式不可用',
					icon: 'none'
				});
			}
		},
		
		// 提醒付款
		remindPayment(order) {
			uni.showModal({
				title: '提醒付款',
				content: `是否向客户 ${order.customer_name || '客户'} 发送付款提醒？`,
				success: (res) => {
					if (res.confirm) {
						// TODO: 调用提醒付款接口
						uni.showLoading({ title: '发送中...' });
						
						// 模拟发送提醒
						setTimeout(() => {
							uni.hideLoading();
							uni.showToast({
								title: '付款提醒已发送',
								icon: 'success'
							});
						}, 1000);
					}
				}
			});
		},
		
		// 获取状态样式类
		getStatusClass(status) {
			const statusMap = {
				1: 'status-pending',    // 待付款
				2: 'status-active',     // 已付款
				3: 'status-completed',  // 已完成
				4: 'status-cancelled',  // 已取消
				5: 'status-refunded'    // 已退款
			};
			return statusMap[status] || '';
		}
		}
	}
</script>

<style lang="scss" scoped>
.order-container {
	background-color: #f5f5f5;
	min-height: 100vh;
}

/* 筛选标签 */
.filter-tabs {
	display: flex;
	background-color: #fff;
	padding: 20rpx 0;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

	.filter-tab {
		flex: 1;
		text-align: center;
		padding: 20rpx 0;
		color: #666;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;

		.filter-text {
			font-size: 28rpx;
			white-space: nowrap;
			
			.filter-count {
				font-size: 22rpx;
				color: #999;
				margin-left: 4rpx;
			}
		}

		&.active {
			color: #3D6AFF;
			font-weight: 600;
			
			.filter-text .filter-count {
				color: #3D6AFF;
			}

			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 40rpx;
				height: 4rpx;
				background-color: #3D6AFF;
				border-radius: 2rpx;
			}
		}
	}
}

/* 订单列表 */
.order-list {
	padding: 0 24rpx;

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
		padding: 120rpx 0;
		
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

	.order-item {
		background-color: #fff;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
		padding: 32rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

		&:active {
			background-color: #f8f9fa;
		}

		.order-header {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			margin-bottom: 24rpx;

			.order-info {
				flex: 1;

				.order-no {
					display: block;
					font-size: 28rpx;
					color: #333;
					margin-bottom: 8rpx;
				}

				.order-time {
					font-size: 24rpx;
					color: #999;
				}
			}

			.order-status {
				padding: 8rpx 16rpx;
				border-radius: 20rpx;
				font-size: 24rpx;
				white-space: nowrap;

				&.status-pending {
					background-color: #fff3cd;
					color: #856404;
				}

				&.status-active {
					background-color: #cce5ff;
					color: #0066cc;
				}

				&.status-completed {
					background-color: #d4edda;
					color: #155724;
				}

				&.status-cancelled {
					background-color: #f8d7da;
					color: #721c24;
				}

				&.status-refunded {
					background-color: #e2e3e5;
					color: #6c757d;
				}
			}
		}

		.order-content {
			margin-bottom: 24rpx;
		}

		.customer-section {
			display: flex;
			align-items: center;
			margin-bottom: 24rpx;

			.customer-avatar {
				width: 80rpx;
				height: 80rpx;
				border-radius: 40rpx;
				margin-right: 20rpx;
				background-color: #f0f0f0;
			}

			.customer-details {
				flex: 1;

				.customer-name {
					display: block;
					font-size: 32rpx;
					color: #333;
					font-weight: 600;
					margin-bottom: 8rpx;
				}

				.customer-phone {
					font-size: 28rpx;
					color: #666;
				}
			}
		}

		.service-section {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx 0;
			border-top: 1rpx solid #f0f0f0;

			.service-label {
				font-size: 30rpx;
				color: #333;
			}

			.service-amount {
				font-size: 36rpx;
				color: #3D6AFF;
				font-weight: 600;
			}
		}

		.order-actions {
			display: flex;
			gap: 24rpx;
			justify-content: flex-end;
			margin-top: 20rpx;

			.action-btn {
				min-width: 120rpx;
				height: 64rpx;
				padding: 0 24rpx;
				border-radius: 32rpx;
				font-size: 28rpx;
				border: none;
				display: flex;
				align-items: center;
				justify-content: center;

				&.primary {
					background-color: #3D6AFF;
					color: #fff;
				}

				&.outline {
					background-color: transparent;
					color: #3D6AFF;
					border: 2rpx solid #3D6AFF;
				}
			}
		}
	}
}
</style>
