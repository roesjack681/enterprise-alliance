<template>
	<view class="container">
		<!-- 顶部选项卡 -->
		<view class="tab-bar">
			<view 
				class="tab-item" 
				v-for="tab in tabs" 
				:key="tab.key"
				:class="{ active: currentTab === tab.key }" 
				@click="switchTab(tab.key)"
			>
				{{ tab.label }}
			</view>
		</view>
  
		<!-- 订单列表 -->
		<view class="order-list">
			<!-- 加载状态 -->
			<view v-if="loading" class="loading-wrapper">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>
			
			<!-- 空状态 -->
			<view v-else-if="orderList.length === 0" class="empty-wrapper">
				<image class="empty-icon" src="/static/icon/empty.png" mode="aspectFill"></image>
				<text class="empty-text">暂无订单</text>
			</view>
			
			<!-- 订单项 -->
			<view v-else class="order-item" v-for="order in orderList" :key="order.order_no" @click="viewOrderDetail(order)">
				<view class="order-header">
					<view class="order-info">
						<view class="order-title-row">
							<text class="order-title">{{ order.business_title || '订单' }}</text>
							<text class="order-type">{{ getBusinessTypeText(order.business_type) }}</text>
						</view>
						<view class="order-number">{{ order.order_no }}</view>
					</view>
					<view class="order-status" :class="order.statusClass">{{ order.statusText }}</view>
				</view>
				
				<view class="order-footer">
					<view class="order-left">
						<view class="order-price">¥{{ formatPrice(order.actual_price) }}</view>
						<view class="order-date">{{ formatDate(order.create_time) }}</view>
					</view>
					<view class="order-actions" @click.stop="">
						<view 
							v-if="order.status === 1" 
							class="action-btn warning-btn"
							@click="handleOrderAction(order)"
						>去支付</view>
						<view 
							v-else-if="order.status === 2 && order.business_type === 'service'" 
							class="action-btn success-btn"
							@click="advanceServiceProcess(order)"
						>推进流程</view>
						<view 
							v-else-if="order.status === 2" 
							class="action-btn primary-btn"
							@click="viewServiceTracking(order)"
						>服务跟踪</view>
						<view 
							v-else-if="order.status === 4" 
							class="action-btn danger-btn"
							@click="deleteOrder(order)"
						>删除订单</view>
						<view 
							v-else 
							class="action-btn primary-btn"
							@click="handleOrderAction(order)"
						>联系客服</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 加载更多 -->
		<view v-if="hasMore && !loading && orderList.length > 0" class="load-more" @click="loadMore">
			<text class="load-more-text">点击加载更多</text>
		</view>
		
		<!-- 没有更多数据提示 -->
		<view v-else-if="!hasMore && orderList.length > 0" class="no-more">
			<text class="no-more-text">已显示全部订单</text>
		</view>
	</view>
</template>

<script>
	import { getOrderList, advanceServiceProcess } from '@/utils/api.js';
	
	export default {
		data() {
			return {
				currentTab: 'all',
				loading: false,
				orderList: [],
				page: 1,
				pageSize: 10,
				hasMore: true,
				tabs: [
					{ key: 'all', label: '全部' },
					{ key: 'pending', label: '待付款' },
					{ key: 'processing', label: '进行中' },
					{ key: 'completed', label: '已完成' },
					{ key: 'cancelled', label: '已取消' }
				]
			}
		},
		
		onLoad() {
			this.loadOrderData();
		},
		
		onReachBottom() {
			if (this.hasMore && !this.loading) {
				this.loadMore();
			}
		},
		
		onPullDownRefresh() {
			this.refreshData();
		},
		
		methods: {
			// 切换选项卡
			switchTab(tab) {
				if (this.currentTab === tab) return;
				this.currentTab = tab;
				this.refreshData();
			},
			
			// 刷新数据
			refreshData() {
				this.page = 1;
				this.hasMore = true;
				this.orderList = [];
				this.loadOrderData();
			},
			
			// 加载订单数据
			async loadOrderData() {
				if (this.loading) return;
				
				try {
					this.loading = true;
					
					const params = {
						page: this.page,
						page_size: this.pageSize
					};
					
					// 根据选项卡添加状态筛选
					if (this.currentTab !== 'all') {
						const statusMap = {
							pending: 1,    // 待付款
							processing: 2, // 进行中
							completed: 3,  // 已完成
							cancelled: 4   // 已取消
						};
						params.status = statusMap[this.currentTab];
					}
					
					const response = await getOrderList(params);
					
					if (response && response.data && response.data.list) {
						const newOrders = response.data.list.map(order => this.formatOrderData(order));
						
						if (this.page === 1) {
							this.orderList = newOrders;
						} else {
							this.orderList = [...this.orderList, ...newOrders];
						}
						
						// 判断是否还有更多数据
						this.hasMore = newOrders.length === this.pageSize;
						
						// 停止下拉刷新
						if (this.page === 1) {
							uni.stopPullDownRefresh();
						}
					} else {
						if (this.page === 1) {
							this.orderList = [];
						}
						this.hasMore = false;
						uni.stopPullDownRefresh();
					}
				} catch (error) {
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					});
					if (this.page === 1) {
						uni.stopPullDownRefresh();
					}
				} finally {
					this.loading = false;
				}
			},
			
			// 加载更多
			loadMore() {
				if (this.hasMore && !this.loading) {
					this.page += 1;
					this.loadOrderData();
				}
			},
			
			// 格式化订单数据
			formatOrderData(order) {
				// 状态映射
				const statusMap = {
					1: { text: '待付款', class: 'status-pending' },
					2: { text: '已支付', class: 'status-processing' },
					3: { text: '已完成', class: 'status-completed' },
					4: { text: '已取消', class: 'status-cancelled' },
					5: { text: '已退款', class: 'status-refunded' }
				};
				
				const statusInfo = statusMap[order.status] || { text: '未知', class: 'status-unknown' };
				
				return {
					...order,
					statusText: statusInfo.text,
					statusClass: statusInfo.class,
					// 确保价格字段是数字类型
					actual_price: parseFloat(order.actual_price || 0),
					original_price: parseFloat(order.original_price || 0),
					discount_price: parseFloat(order.discount_price || 0)
				};
			},
			
			// 获取业务类型文本
			getBusinessTypeText(type) {
				const typeMap = {
					service: '服务订单',
					product: '产品订单',
					member: '会员订单',
					invoice: '发票订单'
				};
				return typeMap[type] || '订单';
			},
			
			// 格式化日期
			formatDate(timestamp) {
				if (!timestamp) return '';
				const date = new Date(timestamp * 1000);
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				return `${year}-${month}-${day} ${hours}:${minutes}`;
			},
			
			// 格式化价格
			formatPrice(price) {
				if (price === null || price === undefined) return '0.00';
				const numPrice = parseFloat(price);
				return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
			},
			
			// 查看订单详情
			viewOrderDetail(order) {
				uni.navigateTo({
					url: `/pages/order/detail?order_no=${order.order_no}`
				});
			},
			
			// 处理订单操作
			handleOrderAction(order) {
				if (order.status === 1) {
					// 待付款状态，跳转到支付页面
					uni.navigateTo({
						url: `/pages/order/pay?order_no=${order.order_no}&amount=${order.actual_price}&title=${encodeURIComponent(order.business_title || '订单支付')}`
					});
				} else {
					// 其他状态，联系客服
					uni.showModal({
						title: '联系客服',
						content: '是否拨打客服电话？',
						success: (res) => {
							if (res.confirm) {
								uni.makePhoneCall({
									phoneNumber: '400-123-4567'
								});
							}
						}
					});
				}
			},
			
			// 推进服务流程
			advanceServiceProcess(order) {
				uni.navigateTo({
					url: `/pages/serviceFlow/track?order_id=${order.id}&order_no=${order.order_no}&service_order_id=${order.order_no}`
				});
			},
			
			// 查看服务跟踪
			viewServiceTracking(order) {
				uni.navigateTo({
					url: `/pages/serviceFlow/track?order_id=${order.id}&order_no=${order.order_no}&service_order_id=${order.order_no}`
				});
			},
			
			// 删除订单
			deleteOrder(order) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这个订单吗？删除后无法恢复。',
					success: (res) => {
						if (res.confirm) {
							// TODO: 调用删除订单API
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
							
							// 从列表中移除
							const index = this.orderList.findIndex(item => item.order_no === order.order_no);
							if (index > -1) {
								this.orderList.splice(index, 1);
							}
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.tab-bar {
		display: flex;
		background-color: #fff;
		border-bottom: 1rpx solid #f0f0f0;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.tab-item {
		flex: 1;
		padding: 32rpx 0;
		text-align: center;
		font-size: 28rpx;
		color: #666;
		position: relative;
		
		&.active {
			color: #3D6AFF;
			font-weight: 500;
			
			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 60rpx;
				height: 4rpx;
				background: #3D6AFF;
				border-radius: 2rpx;
			}
		}
	}

	.order-list {
		padding: 24rpx;
	}

	.loading-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 80rpx 0;
	}

	.loading-spinner {
		width: 40rpx;
		height: 40rpx;
		border: 4rpx solid #f3f3f3;
		border-top: 4rpx solid #3D6AFF;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.loading-text {
		font-size: 28rpx;
		color: #666;
		margin-top: 20rpx;
	}

	.empty-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 120rpx 0;
	}

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

	.order-item {
		background: #fff;
		border-radius: 16rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.order-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}

	.order-info {
		flex: 1;
	}

	.order-title-row {
		display: flex;
		align-items: center;
		margin-bottom: 12rpx;
	}

	.order-title {
		font-size: 30rpx;
		font-weight: 500;
		color: #333;
		margin-right: 12rpx;
	}

	.order-type {
		font-size: 20rpx;
		color: #3D6AFF;
		background: #f8f9ff;
		padding: 4rpx 8rpx;
		border-radius: 4rpx;
	}

	.order-number {
		font-size: 24rpx;
		color: #999;
	}

	.order-status {
		font-size: 22rpx;
		color: #3D6AFF;
		padding: 8rpx 16rpx;
		background: #f8f9ff;
		border-radius: 8rpx;
		white-space: nowrap;
		
		&.status-pending {
			color: #FF9500;
			background: #fff7f0;
		}
		
		&.status-processing {
			color: #3D6AFF;
			background: #f8f9ff;
		}
		
		&.status-completed {
			color: #3D6AFF;
			background: #f0f4ff;
		}
		
		&.status-cancelled {
			color: #FF3B30;
			background: #fff5f5;
		}
		
		&.status-refunded {
			color: #8E8E93;
			background: #f8f8f8;
		}
	}

	.order-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.order-left {
		flex: 1;
	}

	.order-price {
		font-size: 32rpx;
		font-weight: 600;
		color: #FF6B35;
		margin-bottom: 8rpx;
	}

	.order-date {
		font-size: 24rpx;
		color: #999;
	}

	.order-actions {
		.action-btn {
			font-size: 24rpx;
			padding: 12rpx 24rpx;
			border-radius: 8rpx;
			text-align: center;
			min-width: 120rpx;
			
			&.warning-btn {
				background: #FF9500;
				color: #fff;
			}
			
			&.primary-btn {
				background: #f8f9ff;
				color: #3D6AFF;
				border: 1rpx solid #3D6AFF;
			}
			
			&.success-btn {
				background: #f8f9ff;
				color: #3D6AFF;
				border: 1rpx solid #3D6AFF;
			}
			
			&.danger-btn {
				background: #fff5f5;
				color: #FF3B30;
				border: 1rpx solid #FF3B30;
			}
		}
	}

	.load-more {
		padding: 40rpx;
		text-align: center;
	}

	.load-more-text {
		font-size: 28rpx;
		color: #3D6AFF;
	}

	.no-more {
		padding: 40rpx;
		text-align: center;
	}

	.no-more-text {
		font-size: 24rpx;
		color: #999;
	}
</style>
