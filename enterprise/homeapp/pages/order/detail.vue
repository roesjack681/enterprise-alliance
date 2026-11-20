<template>
	<view class="container">
		<!-- 加载状态 -->
		<view v-if="loading" class="loading-wrapper">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>
		
		<!-- 订单详情 -->
		<view v-else class="order-detail">
			<!-- 订单基本信息 -->
			<view class="info-section">
				<view class="section-header">
					<view class="section-title">订单信息</view>
					<view class="order-status" :class="orderInfo.statusClass">{{ orderInfo.statusText }}</view>
				</view>
				
				<view class="info-item">
					<text class="label">订单编号</text>
					<text class="value">{{ orderInfo.order_no }}</text>
				</view>
				
				<view class="info-item">
					<text class="label">订单类型</text>
					<text class="value">{{ getBusinessTypeText(orderInfo.business_type) }}</text>
				</view>
				
				<view class="info-item">
					<text class="label">创建时间</text>
					<text class="value">{{ formatDateTime(orderInfo.create_time) }}</text>
				</view>
				
				<view class="info-item" v-if="orderInfo.payment_time">
					<text class="label">支付时间</text>
					<text class="value">{{ formatDateTime(orderInfo.payment_time) }}</text>
				</view>
				
				<view class="info-item">
					<text class="label">订单金额</text>
					<view class="price-info">
						<text class="original-price" v-if="orderInfo.original_price > orderInfo.actual_price">¥{{ formatPrice(orderInfo.original_price) }}</text>
						<text class="actual-price">¥{{ formatPrice(orderInfo.actual_price) }}</text>
					</view>
				</view>
				
				<view class="info-item" v-if="orderInfo.remark">
					<text class="label">订单备注</text>
					<text class="value">{{ orderInfo.remark }}</text>
				</view>
			</view>

			<!-- 产品信息 -->
			<view class="info-section" v-if="shouldShowProductSection()">
				<view class="section-header">
					<view class="section-title">{{ getProductSectionTitle() }}</view>
				</view>
				
				<!-- 产品基本信息 -->
				<view class="product-card" v-if="productInfo">
					<view class="product-header">
						<image v-if="productInfo.images && productInfo.images.length > 0" 
							class="product-image" 
							:src="productInfo.images[0]" 
							mode="aspectFill">
						</image>
						<view class="product-info">
							<text class="product-title">{{ productInfo.title || '产品名称' }}</text>
							<text class="product-description">{{ productInfo.description || '暂无描述' }}</text>
						</view>
					</view>
					
					<!-- 产品视频 -->
					<view class="product-video" v-if="productInfo.videos">
						<video 
							class="video-player"
							:src="productInfo.videos"
							controls
							show-center-play-btn
							object-fit="contain"
						></video>
					</view>
					
					<!-- 产品详细信息 -->
					<view class="product-details">
						<view class="detail-item" v-if="productInfo.price">
							<text class="detail-label">价格</text>
							<text class="detail-value price-text">¥{{ formatPrice(productInfo.price) }} / {{ productInfo.unit || '单位' }}</text>
						</view>
						
						<view class="detail-item" v-if="productInfo.address">
							<text class="detail-label">服务地址</text>
							<text class="detail-value">{{ productInfo.address }}</text>
						</view>
						
						<view class="detail-item" v-if="productInfo.service_area">
							<text class="detail-label">服务范围</text>
							<text class="detail-value">{{ productInfo.service_area }}</text>
						</view>
						
						<view class="detail-item" v-if="productInfo.service_time">
							<text class="detail-label">服务时间</text>
							<text class="detail-value">{{ productInfo.service_time }}</text>
						</view>
						
						<view class="detail-item" v-if="productInfo.contact_name || productInfo.contact_phone">
							<text class="detail-label">联系方式</text>
							<text class="detail-value">
								<text v-if="productInfo.contact_name">{{ productInfo.contact_name }}</text>
								<text v-if="productInfo.contact_name && productInfo.contact_phone"> - </text>
								<text v-if="productInfo.contact_phone">{{ productInfo.contact_phone }}</text>
								<text v-if="!productInfo.contact_name && !productInfo.contact_phone">暂无联系方式</text>
							</text>
						</view>
						
						<view class="detail-item" v-if="productInfo.view_count !== undefined">
							<text class="detail-label">浏览次数</text>
							<text class="detail-value">{{ productInfo.view_count || 0 }} 次</text>
						</view>
						
						<view class="detail-item" v-if="productInfo.favorite_count !== undefined">
							<text class="detail-label">收藏次数</text>
							<text class="detail-value">{{ productInfo.favorite_count || 0 }} 次</text>
						</view>
						
						<view class="detail-item" v-if="productInfo.status !== undefined">
							<text class="detail-label">状态</text>
							<text class="detail-value">{{ getProductStatusText(productInfo.status) }}</text>
						</view>
						
						<view class="detail-item" v-if="productInfo.tags && productInfo.tags.length > 0">
							<text class="detail-label">服务标签</text>
							<view class="tags-container">
								<text class="tag" v-for="tag in productInfo.tags" :key="tag">{{ tag }}</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 无产品信息提示 -->
				<view class="no-product-info" v-else>
					<text class="no-info-text">{{ getNoProductInfoText() }}</text>
				</view>
			</view>

			<!-- 操作按钮 -->
			<view class="action-section">
				<view class="action-buttons">
					<view v-if="orderInfo.status === 1" class="btn primary-btn" @click="goPay">去支付</view>
					<view v-else-if="orderInfo.status === 4" class="btn danger-btn" @click="deleteOrder">删除订单</view>
					<view class="btn secondary-btn" @click="contactService">联系客服</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getOrderByNo, getServiceProductDetail } from '@/utils/api.js';
	
	export default {
		data() {
			return {
				loading: true,
				orderNo: '',
				orderInfo: {},
				productInfo: null
			}
		},
		
		onLoad(options) {
			if (options.order_no) {
				this.orderNo = options.order_no;
				this.loadOrderDetail();
			} else {
				uni.showToast({
					title: '订单号不能为空',
					icon: 'none'
				});
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}
		},
		
		methods: {
			// 加载订单详情
			async loadOrderDetail() {
				try {
					this.loading = true;
					
					// 检查是否已登录
					const token = uni.getStorageSync('token');
					if (!token) {
						uni.showToast({
							title: '请先登录',
							icon: 'none'
						});
						setTimeout(() => {
							uni.navigateTo({
								url: '/pages/user/login'
							});
						}, 1500);
						return;
					}
					
					const response = await getOrderByNo({
						order_no: this.orderNo
					});
					
					if (response && response.code === 0 && response.data) {
						this.orderInfo = this.formatOrderData(response.data);
						
						// 如果有业务ID，加载产品信息
						if (this.orderInfo.business_id && this.orderInfo.business_type) {
							await this.loadProductInfo();
						}
					} else {
						// 错误信息已经在拦截器中显示了，这里只需要返回上级页面
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					}
				} catch (error) {
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					});
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} finally {
					this.loading = false;
				}
			},
			
			// 加载产品信息
			async loadProductInfo() {
				try {
					// 确保business_id是有效的数字
					const businessId = parseInt(this.orderInfo.business_id);
					if (isNaN(businessId)) {
						return;
					}
					
					if (this.orderInfo.business_type === 'service' || this.orderInfo.business_type === 'product') {
						const response = await getServiceProductDetail({
							id: businessId
						});
						
						if (response && response.code === 0 && response.data) {
							// 处理返回的数据格式：如果是数组则取第一个元素，否则直接使用
							let productData = Array.isArray(response.data) ? response.data[0] : response.data;
							
							// 解析JSON字符串字段
							this.productInfo = this.parseProductData(productData);
						}
					}
					// 会员订单暂不支持显示产品信息
				} catch (error) {
					console.error('加载产品信息失败:', error);
				}
			},
			
			// 解析产品数据中的JSON字符串字段
			parseProductData(productData) {
				try {
					// 解析images字段
					if (productData.images && typeof productData.images === 'string') {
						productData.images = JSON.parse(productData.images);
					}
					
					// 解析tags字段
					if (productData.tags && typeof productData.tags === 'string') {
						const parsedTags = JSON.parse(productData.tags);
						// 提取标签名称
						productData.tags = parsedTags.map(tag => tag.name || tag);
					}
					
					// 解析qualification字段（虽然模板中暂未使用，但为了完整性）
					if (productData.qualification && typeof productData.qualification === 'string') {
						productData.qualification = JSON.parse(productData.qualification);
					}
					
					return productData;
				} catch (error) {
					console.error('解析产品数据失败:', error);
					return productData;
				}
			},
			
			// 格式化订单数据
			formatOrderData(order) {
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
			
			// 获取产品板块标题
			getProductSectionTitle() {
				if (this.orderInfo.business_type === 'service') {
					return '服务信息';
				} else if (this.orderInfo.business_type === 'product') {
					return '产品信息';
				} else if (this.orderInfo.business_type === 'member') {
					return '会员信息';
				}
				return '商品信息';
			},
			
			// 是否显示产品信息板块
			shouldShowProductSection() {
				// 只有当存在business_id和business_type时才显示
				return this.orderInfo.business_id && this.orderInfo.business_type && 
					   ['service', 'product', 'member'].includes(this.orderInfo.business_type);
			},
			
			// 获取无产品信息时的提示文本
			getNoProductInfoText() {
				if (this.orderInfo.business_type === 'member') {
					return '会员订单信息暂不支持显示';
				} else if (this.orderInfo.business_type === 'service') {
					return '服务信息加载失败或不存在';
				} else if (this.orderInfo.business_type === 'product') {
					return '产品信息加载失败或不存在';
				}
				return '相关信息暂不可用';
			},
			
			// 获取服务类型文本
			getServiceTypeText(type) {
				const typeMap = {
					1: '线上服务',
					2: '线下服务',
					3: '混合服务'
				};
				return typeMap[type] || type;
			},
			
			// 获取交付方式文本
			getDeliveryMethodText(method) {
				const methodMap = {
					1: '文档交付',
					2: '实物交付',
					3: '服务交付',
					4: '数字交付'
				};
				return methodMap[method] || method;
			},
			
			// 获取产品状态文本
			getProductStatusText(status) {
				const statusMap = {
					0: '待审核',
					1: '审核中',
					2: '已通过',
					3: '已拒绝',
					4: '已下架'
				};
				return statusMap[status] || '未知状态';
			},
			
			// 格式化日期时间
			formatDateTime(timestamp) {
				if (!timestamp) return '';
				const date = new Date(timestamp * 1000);
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
			},
			
			// 格式化价格
			formatPrice(price) {
				if (price === null || price === undefined) return '0.00';
				const numPrice = parseFloat(price);
				return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
			},
			
			// 去支付
			goPay() {
				uni.navigateTo({
					url: `/pages/order/pay?order_no=${this.orderNo}`
				});
			},
			
			// 删除订单
			deleteOrder() {
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
							
							setTimeout(() => {
								uni.navigateBack();
							}, 1500);
						}
					}
				});
			},
			
			// 联系客服
			contactService() {
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
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.loading-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
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

	.order-detail {
		padding: 24rpx;
	}

	.info-section {
		background: #fff;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
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
		font-weight: 600;
		color: #333;
	}

	.order-status {
		font-size: 24rpx;
		padding: 8rpx 16rpx;
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
			color: #34C759;
			background: #f0fff4;
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

	.info-item {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 24rpx 32rpx;
		border-bottom: 1rpx solid #f8f8f8;
		
		&:last-child {
			border-bottom: none;
		}
	}

	.label {
		font-size: 28rpx;
		color: #666;
		width: 160rpx;
		flex-shrink: 0;
	}

	.value {
		font-size: 28rpx;
		color: #333;
		flex: 1;
		text-align: right;
		word-break: break-all;
	}

	.price-info {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.original-price {
		font-size: 24rpx;
		color: #999;
		text-decoration: line-through;
		margin-bottom: 4rpx;
	}

	.actual-price {
		font-size: 32rpx;
		font-weight: 600;
		color: #FF6B35;
	}

	.product-card {
		padding: 32rpx;
	}

	.product-header {
		display: flex;
		margin-bottom: 32rpx;
	}

	.product-image {
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		margin-right: 24rpx;
		background-color: #f0f0f0;
	}

	.product-info {
		flex: 1;
	}

	.product-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 12rpx;
		display: block;
	}

	.product-description {
		font-size: 24rpx;
		color: #666;
		line-height: 1.5;
		display: block;
	}

	.product-video {
		margin: 32rpx 0;
	}

	.video-player {
		width: 100%;
		height: 400rpx;
		border-radius: 12rpx;
		background-color: #000;
	}

	.product-details {
		border-top: 1rpx solid #f0f0f0;
		padding-top: 24rpx;
	}

	.detail-item {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
		
		&:last-child {
			margin-bottom: 0;
		}
	}

	.detail-label {
		font-size: 26rpx;
		color: #666;
		width: 140rpx;
		flex-shrink: 0;
	}

	.detail-value {
		font-size: 26rpx;
		color: #333;
		flex: 1;
		
		&.price-text {
			color: #FF6B35;
			font-weight: 600;
		}
	}

	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}

	.tag {
		font-size: 20rpx;
		color: #3D6AFF;
		background: #f8f9ff;
		padding: 6rpx 12rpx;
		border-radius: 6rpx;
	}

	.no-product-info {
		padding: 60rpx 32rpx;
		text-align: center;
	}

	.no-info-text {
		font-size: 28rpx;
		color: #999;
	}

	.action-section {
		background: #fff;
		border-radius: 16rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.action-buttons {
		display: flex;
		gap: 24rpx;
	}

	.btn {
		flex: 1;
		height: 88rpx;
		border-radius: 12rpx;
		font-size: 28rpx;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		
		&.primary-btn {
			background: #3D6AFF;
			color: #fff;
		}
		
		&.secondary-btn {
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
</style>