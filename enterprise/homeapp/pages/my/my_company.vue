<template>
	<view class="profile-container">
		
		<!-- 头部用户信息 -->
		<view class="header-section">
			<view class="user-info">
				<view class="avatar-wrapper" @click="jump('./set')">
					<image class="avatar" :src="userInfo.avatar||'/static/img/user.png'" mode="aspectFill"></image>
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
			<view class="stat-item">
				<view class="stat-number">12</view>
				<view class="stat-label">合作项目</view>
			</view>
			<view class="stat-item">
				<view class="stat-number">5</view>
				<view class="stat-label">进行中</view>
			</view>
			<view class="stat-item">
				<view class="stat-number">7</view>
				<view class="stat-label">已完成</view>
			</view>
			<view class="stat-item">
				<view class="stat-number">8</view>
				<view class="stat-label">评价数</view>
			</view>
		</view>

		<!-- 我的订单 -->
		<view  class="section">
			<view class="section-header">
				<text class="section-title">我的订单</text>
				<view class="view-all" @click="viewAllOrders">
					<text>查看全部</text>
					<u-icon name="arrow-right" size="24" color="#999"></u-icon>
				</view>
			</view>
			
			<view class="order-tabs">
				<view class="tab-item" :class="{ active: currentTab === 'all' }" @click="switchTab('all')">全部</view>
				<view class="tab-item" :class="{ active: currentTab === 'pending' }" @click="switchTab('pending')">待付款</view>
				<view class="tab-item" :class="{ active: currentTab === 'processing' }" @click="switchTab('processing')">进行中</view>
				<view class="tab-item" :class="{ active: currentTab === 'completed' }" @click="switchTab('completed')">已完成</view>
			</view>

			<view class="order-list">
				<view v-if="loading" class="loading-wrapper">
					<view class="loading-spinner"></view>
					<text class="loading-text">加载中...</text>
				</view>
				<view v-else-if="orderList.length === 0" class="empty-wrapper">
					<image class="empty-icon" src="/static/icon/empty.png" mode="aspectFill"></image>
					<text class="empty-text">暂无订单</text>
				</view>
				<view v-else class="order-item" v-for="order in filteredOrderList" :key="order.order_no" @click="viewOrderDetail(order)">
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
								v-else 
								class="action-btn primary-btn"
								@click="handleOrderAction(order)"
							>联系客服</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 最新消息回复 -->
		<!-- <view class="section">
			<view class="section-header">
				<text class="section-title">最新消息回复</text>
				<u-icon name="arrow-right" size="24" color="#999"></u-icon>
			</view>
			
			<view class="message-list">
				<view class="message-item" v-for="message in messageList" :key="message.id">
					<view class="message-header">
						<text class="message-title">{{ message.title }}</text>
						<view class="message-badge" v-if="message.isNew"></view>
						<text class="message-time">{{ message.time }}</text>
					</view>
					<view class="message-content">{{ message.content }}</view>
				</view>
			</view>
		</view> -->

		<!-- 进行中的合作 -->
		<view class="section">
			<view class="section-header">
				<text class="section-title">进行中的合作</text>
				<view class="view-all" @click="viewAllServiceTracking">
					<text>查看全部</text>
					<u-icon name="arrow-right" size="24" color="#999"></u-icon>
				</view>
			</view>
			
			<view class="cooperation-list">
				<view v-if="trackingLoading" class="loading-wrapper">
					<view class="loading-spinner"></view>
					<text class="loading-text">加载中...</text>
				</view>
				
				<view v-else-if="serviceTrackingData.length === 0" class="empty-wrapper">
					<image class="empty-icon" src="/static/icon/empty.png" mode="aspectFill"></image>
					<text class="empty-text">暂无进行中的合作</text>
				</view>
				
				<view v-else class="cooperation-item" v-for="tracking in serviceTrackingData" :key="tracking.id" @click="viewServiceTrackingDetail(tracking)">
					<view class="cooperation-header">
						<view class="cooperation-title-row">
							<text class="cooperation-title">{{ tracking.title || '服务订单' }}</text>
							<view class="cooperation-status" :class="tracking.statusClass">{{ tracking.statusText }}</view>
						</view>
						<text class="cooperation-deadline">{{ getServiceTypeText(tracking.service_type) }}</text>
					</view>
					<view class="cooperation-company">{{ tracking.provider_name || '服务商' }}</view>
					<view class="cooperation-progress">
						<view class="progress-info">
							<text class="progress-text">当前步骤: {{ tracking.current_step || '待开始' }}</text>
							<text class="progress-time">{{ formatTime(tracking.create_time) }}</text>
						</view>
						<view class="progress-bar">
							<view class="progress-fill" :style="{ width: getServiceProgress(tracking.status) + '%' }"></view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!--企业主页管理-->
		<view class="section">
			<view class="section-header">
				<text class="section-title">企业主页管理</text>
				
			</view>
			
			<view class="management-grid">
				<view class="management-item" @click="goToMyHomepage">
					<view class="management-icon">
						<u-icon name="home" color="#3D6AFF" size="40"></u-icon>
					</view>
					<text class="management-title">我的主页</text>
				</view>
				
				<view class="management-item" @click="goToBanner">
					<view class="management-icon">
						<u-icon name="photo" color="#FF6B6B" size="40"></u-icon>
					</view>
					<text class="management-title">轮播图</text>
				</view>
				
				<view class="management-item" @click="goToAbout">
					<view class="management-icon">
						<u-icon name="info-circle" color="#4ECDC4" size="40"></u-icon>
					</view>
					<text class="management-title">关于我们</text>
				</view>
				
				<view class="management-item" @click="goToContact">
					<view class="management-icon">
						<u-icon name="phone" color="#45B7D1" size="40"></u-icon>
					</view>
					<text class="management-title">联系我们</text>
				</view>
				
				<view class="management-item" @click="goToProducts">
					<view class="management-icon">
						<u-icon name="grid-fill" color="#96CEB4" size="40"></u-icon>
					</view>
					<text class="management-title">产品管理</text>
				</view>
				
				<view class="management-item" @click="goToArticles">
					<view class="management-icon">
						<u-icon name="file-text" color="#FFEAA7" size="40"></u-icon>
					</view>
					<text class="management-title">文章管理</text>
				</view>
				
				<view class="management-item" @click="goToCases">
					<view class="management-icon">
						<u-icon name="star" color="#DDA0DD" size="40"></u-icon>
					</view>
					<text class="management-title">案例管理</text>
				</view>
				
				<view class="management-item" @click="goToSettings">
					<view class="management-icon">
						<u-icon name="setting" color="#A8E6CF" size="40"></u-icon>
					</view>
					<text class="management-title">设置</text>
				</view>
				<!--邀请码-->
				<view class="management-item" @click="goToInvite">
					<view class="management-icon">
						<u-icon name="share" color="#A8E6CF" size="40"></u-icon>
					</view>
					<text class="management-title">邀请码</text>
				</view>
			</view>
		</view>
		<!--发布管理-->
		<view class="section">
			<view class="section-header">
				<text class="section-title">需求管理</text>
				
			</view>
			
			<view class="management-grid">
				<view class="management-item" @click="checkAuthAndNavigate('/pages/demand/add')">
					<view class="management-icon">
						<u-icon name="shopping-cart" color="#3D6AFF" size="40"></u-icon>
					</view>
					<text class="management-title">需求发布</text>
				</view>
				
				<!-- <view class="management-item" @click="checkAuthAndNavigate('/pages/demand/addserve')">
					<view class="management-icon">
						<u-icon name="server-fill" color="#FF6B6B" size="40"></u-icon>
					</view>
					<text class="management-title">服务发布</text>
				</view>
				
				<view class="management-item" @click="checkAuthAndNavigate('/pages/demand/addpost')">
					<view class="management-icon">
						<u-icon name="plus" color="#4ECDC4" size="40"></u-icon>
					</view>
					<text class="management-title">招采发布</text>
				</view>
				
				<view class="management-item" @click="checkAuthAndNavigate('/pages/demand/addpro')">
					<view class="management-icon">
						<u-icon name="grid" color="#45B7D1" size="40"></u-icon>
					</view>
					<text class="management-title">项目发布</text>
				</view>
				
				<view class="management-item" @click="checkAuthAndNavigate('/pages/demand/addjob')">
					<view class="management-icon">
						<u-icon name="account" color="#96CEB4" size="40"></u-icon>
					</view>
					<text class="management-title">招聘发布</text>
				</view>
				
				<view class="management-item" @click="checkAuthAndNavigate('/pages/demand/addmeet')">
					<view class="management-icon">
						<u-icon name="calendar" color="#FFEAA7" size="40"></u-icon>
					</view>
					<text class="management-title">沙龙发布</text>
				</view>
				
				<view class="management-item" @click="checkAuthAndNavigate('/pages/demand/addamz')">
					<view class="management-icon">
						<u-icon name="share-square" color="#DDA0DD" size="40"></u-icon>
					</view>
					<text class="management-title">外贸发布</text>
				</view>
				 -->
				<view class="management-item" @click="checkAuthAndNavigate('/pages/demand/mydemand')">
					<view class="management-icon">
						<u-icon name="list" color="#A8E6CF" size="40"></u-icon>
					</view>
					<text class="management-title">我的发布</text>
				</view>
			</view>
		</view>
		<!-- 功能选项 -->
		<view class="function-section">
			<view class="function-item" @click="goTouth">
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
	import { getOrderList, getServiceTrackingData } from '@/utils/api.js';
	
	export default {
		data() {
			return {
				notificationCount: 2,
				userInfo:{},
				currentTab: 'all',
				orderList: [],
				loading: false,
				serviceTrackingData: [], // 服务跟踪数据
				trackingLoading: false, // 服务跟踪加载状态
				messageList: [
					{
						id: 1,
						title: '项目合作意向确认',
						content: '关于智能硬件开发项目合作的详细方案已发送，请查收...',
						time: '10分钟前',
						isNew: true
					},
					{
						id: 2,
						title: '技术方案评审会议',
						content: '定于明天下午2点进行技术方案评审会议，请准时参加...',
						time: '2小时前',
						isNew: false
					},
					{
						id: 3,
						title: '合同签订通知',
						content: '双方已完成合同初稿审核，等待最终确认...',
						time: '昨天',
						isNew: false
					}
				],
				cooperationList: [
					{
						id: 1,
						title: '技术开发',
						company: '智能科技有限公司',
						deadline: '15天',
						progress: 65
					},
					{
						id: 2,
						title: '市场推广',
						company: '营销顾问集团',
						deadline: '30天',
						progress: 30
					}
				]
			}
		},
		
		computed: {
			// 根据当前标签页过滤订单列表
			filteredOrderList() {
				if (this.currentTab === 'all') {
					return this.orderList;
				} else if (this.currentTab === 'pending') {
					return this.orderList.filter(order => order.status === 1);
				} else if (this.currentTab === 'processing') {
					return this.orderList.filter(order => order.status === 2);
				} else if (this.currentTab === 'completed') {
					return this.orderList.filter(order => order.status === 3);
				}
				return this.orderList;
			}
		},
		
		onShow() {
			this.refreshData(); 
		},
		
		methods: {
			refreshData(){
				this.userInfo=uni.getStorageSync('$userinfo');
				this.loadOrderData();
				this.getServiceTrackingData();
			},
			
			// 加载订单数据
			async loadOrderData() {
				try {
					this.loading = true;
					
					// 获取订单列表，限制显示最近5条
					const response = await getOrderList({
						page: 1,
						page_size:3
					});
					
				if (response && response.data && response.data.list) {
					this.orderList = response.data.list.map(order => this.formatOrderData(order));
				} else {
					this.orderList = [];
				}
				} catch (error) {
					uni.showToast({
						title: '加载订单失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
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
			
			// 获取服务跟踪数据
			async getServiceTrackingData() {
				try {
					this.trackingLoading = true;
					const params = {
						user_id: this.userInfo.id,
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
							title: order.title || '服务',
							provider_name: order.provider_name || '服务商',
							status: order.status,
							statusText: this.getServiceFlowStatusText(order.status),
							statusClass: this.getServiceFlowStatusClass(order.status),
							current_step: order.current_step,
							price: order.price,
							service_type: order.service_type,
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
			
			// 查看服务跟踪详情
			viewServiceTrackingDetail(tracking) {
				uni.navigateTo({
					url: `/pages/serviceFlow/track?order_id=${tracking.id}&order_no=${tracking.order_no}&service_order_id=${tracking.order_no}`
				});
			},
			
			// 查看全部服务跟踪
			viewAllServiceTracking() {
				uni.navigateTo({
					url: '/pages/order/list'
				});
			},
			
			// 获取服务类型文本
			getServiceTypeText(type) {
				const typeMap = {
					'one_time': '一次性服务',
					'monthly': '月度服务',
					'quarterly': '季度服务',
					'yearly': '年度服务',
					'custom': '定制服务'
				};
				return typeMap[type] || '服务';
			},
			
			// 获取服务进度百分比
			getServiceProgress(status) {
				const progressMap = {
					'Pending': 10,
					'Active': 50,
					'Paused': 30,
					'Completed': 100,
					'Cancelled': 0
				};
				return progressMap[status] || 0;
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
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
			},
			
			// 格式化价格
			formatPrice(price) {
				if (price === null || price === undefined) return '0.00';
				const numPrice = parseFloat(price);
				return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
			},
			jump(url){
				uni.navigateTo({
					url: url
				})
			},	
			switchTab(tab) {
				this.currentTab = tab;
			},
			viewAllOrders() {
				uni.navigateTo({
					url: '/pages/order/list'
				});
			},
			viewOrderDetail(order) {
				uni.navigateTo({
					url: `/pages/order/detail?order_no=${order.order_no}`
				});
			},
			handleOrderAction(order) {
				if (order.status === 1) {
					// 待付款状态，跳转到支付页面
					uni.navigateTo({
						url: `/pages/order/pay?order_no=${order.order_no}`
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
			goTouth() {
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
			goToMyHomepage() {
				uni.navigateTo({
					url: '/pages/company/home?enterpriseId='+this.userInfo.id
				})
			},
			goToBanner() {
				uni.navigateTo({
					url: '/pages/enterprise/banner_manage'
				})
			},
			goToAbout() {
				uni.navigateTo({
					url: '/pages/enterprise/about_manage'
				})
			},
			goToContact() {
				uni.navigateTo({
					url: '/pages/enterprise/contact_manage'
				})
			},
			goToProducts() {
				uni.navigateTo({
					url: '/pages/enterprise/product_manage'
				})
			},
			goToArticles() {
				uni.navigateTo({
					url: '/pages/enterprise/article_manage'
				})
			},
			goToCases() {
				uni.navigateTo({
					url: '/pages/enterprise/case_manage'
				})
			},
			goToSettings() {
				uni.navigateTo({
					url: '/pages/enterprise/settings_manage'
				})
			},
			goToInvite() {
				uni.navigateTo({
					url: '/pages/entity/invite'
				})
			},
			// 检查认证状态并导航的通用方法
			checkAuthAndNavigate(url) {
				// 判断企业未认证，先去认证
				if (this.userInfo.review_status!==2) {
					uni.showModal({
						title: '提示',
						content: '请通过企业认证后操作',
						cancelText: '取消',
						confirmText: '去认证',
						success: async function (res) {
							if (res.confirm) { 
								uni.redirectTo({
									url: '/pages/entity/auth'
								})
							}
						}
					})
					return
				}
				uni.navigateTo({
					url: url
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.profile-container {
		padding:20rpx 0px;
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
	.tag{width:30rpx;height:30rpx;}
	.user-details {
		flex: 1;
	}

	.username {
		font-size: 36rpx;
		font-weight: 400;
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
		display: flex;
		justify-content: space-around;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}

	.stat-number {
		font-size: 48rpx;
		font-weight: 400;
		color: #333;
		margin-bottom: 8rpx;
	}

	.stat-label {
		font-size: 24rpx;
		color: #666;
	}

	.section {
		background: #fff;
		margin: 0 24rpx 24rpx;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 400;
		color: #333;
	}

	.view-all {
		display: flex;
		align-items: center;
		
		text {
			font-size: 24rpx;
			color: #999;
			margin-right: 8rpx;
		}
		
	}

	.order-tabs {
		display: flex;
		padding: 0 32rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.tab-item {
		padding: 24rpx 0;
		margin-right: 48rpx;
		font-size: 28rpx;
		color: #666;
		position: relative;
		
		&.active {
			color: #3D6AFF;
			
			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				height: 4rpx;
				background: #3D6AFF;
				border-radius: 2rpx;
			}
		}
	}

	.order-list {
		padding: 0 32rpx;
	}

	.loading-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60rpx 0;
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
		padding: 60rpx 0;
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
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
		
		&:last-child {
			border-bottom: none;
		}
	}

	.order-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 16rpx;
	}

	.order-info {
		flex: 1;
	}

	.order-title-row {
		display: flex;
		align-items: center;
		margin-bottom: 8rpx;
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
		padding: 6rpx 12rpx;
		background: #f8f9ff;
		border-radius: 8rpx;
		
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
		font-size: 28rpx;
		font-weight: 500;
		color: #FF6B35;
		margin-bottom: 4rpx;
	}

	.order-date {
		font-size: 22rpx;
		color: #999;
	}

	.order-actions {
		.action-btn {
			font-size: 22rpx;
			padding: 10rpx 20rpx;
			border-radius: 4rpx;
			text-align: center;
			min-width: 100rpx;
			
			&.warning-btn {
				background: #FF9500;
				color: #fff;
			}
			
			&.primary-btn {
				background: #f8f9ff;
				color: #3D6AFF;
			}
		}
	}

	.message-list {
		padding: 0 32rpx;
	}

	.message-item {
		padding: 32rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
		
		&:last-child {
			border-bottom: none;
		}
	}

	.message-header {
		display: flex;
		align-items: center;
		margin-bottom: 12rpx;
	}

	.message-title {
		font-size: 28rpx;
		font-weight: 400;
		color: #333;
		margin-right: 12rpx;
	}

	.message-badge {
		width: 12rpx;
		height: 12rpx;
		background: #FF3B30;
		border-radius: 50%;
		margin-right: 12rpx;
	}

	.message-time {
		font-size: 24rpx;
		color: #999;
		margin-left: auto;
	}

	.message-content {
		font-size: 24rpx;
		color: #666;
		line-height: 1.5;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cooperation-list {
		padding: 0 32rpx;
	}

	.cooperation-item {
		padding: 32rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
		
		&:last-child {
			border-bottom: none;
		}
	}

	.cooperation-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12rpx;
	}

	.cooperation-title {
		font-size: 28rpx;
		font-weight: 400;
		color: #333;
	}

	.cooperation-deadline {
		font-size: 24rpx;
		color: #3D6AFF;
	}

	.cooperation-company {
		font-size: 24rpx;
		color: #666;
		margin-bottom: 16rpx;
	}

	.progress-bar {
		width: 100%;
		height: 8rpx;
		background: #f0f0f0;
		border-radius: 4rpx;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: #3D6AFF;
		border-radius: 4rpx;
		transition: width 0.3s ease;
	}

	.cooperation-list {
		padding: 0 32rpx;
	}

	.cooperation-item {
		padding: 32rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
		cursor: pointer;
		transition: background-color 0.2s;
		
		&:last-child {
			border-bottom: none;
		}
		
		&:active {
			background-color: #f8f9fa;
		}
	}

	.cooperation-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 16rpx;
	}

	.cooperation-title-row {
		display: flex;
		align-items: center;
		flex: 1;
		margin-right: 16rpx;
	}

	.cooperation-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-right: 12rpx;
		flex: 1;
		line-height: 1.4;
	}

	.cooperation-status {
		padding: 6rpx 12rpx;
		border-radius: 16rpx;
		font-size: 22rpx;
		font-weight: 500;
		white-space: nowrap;
		
		&.status-pending {
			background-color: #fff3cd;
			color: #856404;
		}
		
		&.status-active {
			background-color: #e8f0fe;
			color: #3D6AFF;
		}
		
		&.status-paused {
			background-color: #f8d7da;
			color: #721c24;
		}
		
		&.status-completed {
			background-color: #e8f0fe;
			color: #3D6AFF;
		}
		
		&.status-cancelled {
			background-color: #f5c6cb;
			color: #721c24;
		}
	}

	.cooperation-deadline {
		font-size: 24rpx;
		color: #3D6AFF;
		white-space: nowrap;
		font-weight: 500;
	}

	.cooperation-company {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 16rpx;
		display: flex;
		align-items: center;
		
		&::before {
			content: '👤';
			margin-right: 8rpx;
			font-size: 20rpx;
		}
	}

	.cooperation-progress {
		margin-bottom: 20rpx;
		background-color: #f8f9fa;
		padding: 16rpx;
		border-radius: 12rpx;
	}

	.progress-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12rpx;
	}

	.progress-text {
		font-size: 24rpx;
		color: #333;
		font-weight: 500;
		flex: 1;
	}

	.progress-time {
		font-size: 22rpx;
		color: #999;
		white-space: nowrap;
	}

	.progress-bar {
		width: 100%;
		height: 8rpx;
		background: #e9ecef;
		border-radius: 4rpx;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #3D6AFF 0%, #3D6AFF 100%);
		border-radius: 4rpx;
		transition: width 0.3s ease;
	}

	.management-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150rpx, 1fr));
		gap: 20rpx;
		padding: 20rpx 32rpx;
	}

	.management-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx;
		background-color: #f9f9f9;
		border-radius: 12rpx;
		text-align: center;
	}

	.management-icon {
		margin-bottom: 10rpx;
	}

	.management-title {
		font-size: 24rpx;
		color: #333;
		white-space: nowrap;
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

	::v-deep .u-button {
		border-radius: 16rpx !important;
		
		&.u-button--primary {
			background: #3D6AFF !important;
			border-color: #3D6AFF !important;
		}
	}
</style>