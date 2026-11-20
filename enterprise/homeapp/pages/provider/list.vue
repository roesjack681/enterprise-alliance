<template>
	<view class="service-list-page">
		<!-- 导航栏 -->
		<u-navbar 
			:back-icon-color="navbarStyle.color" 
			:back-icon-size="navbarStyle.size" 
			:title-color="navbarStyle.titleColor" 
			:title="pageTitle" 
			:border-bottom="false" 
			:background="navbarStyle.background"
		>
			<view slot="right" class="navbar-right">
				<view class="filter-btn" @click="showFilterModal = true">
					<text class="iconfont icon-filter"></text>
				</view>
			</view>
		</u-navbar>
		
		<!-- 分类导航 -->
		<view class="category-nav" v-if="categories.length > 0">
			<scroll-view scroll-x class="category-scroll">
				<view class="category-list">
					<view 
						class="category-item" 
						:class="{ active: currentCategoryIndex === index }"
						v-for="(category, index) in categories" 
						:key="category.id"
						@click="onCategoryClick(index)"
					>
						<text class="category-text">{{ category.name }}</text>
					</view>
				</view>
			</scroll-view>
		</view>
		
		<!-- 服务列表 -->
		<scroll-view 
			class="service-list" 
			scroll-y
			@scrolltolower="loadMoreServices"
			:lower-threshold="100"
			refresher-enabled
			@refresherrefresh="refreshServices"
			:refresher-triggered="refreshing"
		>
			<view 
				class="service-item" 
				v-for="service in services" 
				:key="service.id"
				@click="onServiceClick(service)"
			>
				<image :src="service.image" class="service-image" mode="aspectFill"></image>
				<view class="service-content">
					<view class="service-header">
						<view class="service-tag" v-if="service.category">{{ service.category }}</view>
						<view class="service-status" v-if="service.status === 1" :class="{ active: service.status === 1 }">
							<text class="status-text">{{ service.status === 1 ? '正在服务' : '暂停服务' }}</text>
						</view>
					</view>
					<view class="service-title">{{ service.title }}</view>
					<view class="service-desc">{{ service.description || '暂无描述' }}</view>
					<view class="service-footer">
						<view class="service-price" v-if="service.price > 0">
							<text class="price-symbol">¥</text>
							<text class="price-number">{{ service.price}}</text>
							<text class="original-price" v-if="service.unit">/{{service.unit }}</text>
						</view>
						<view class="service-price" v-else>
							<text class="price-text">面议</text>
						</view>
						<view class="service-actions">
							<view class="action-btn" @click.stop="onConsult">立即咨询</view>
							<view class="action-btn primary" @click.stop="onBuy(service)">立即购买</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 加载更多状态 -->
			<view class="load-more-container" v-if="services.length > 0">
				<view class="load-more-loading" v-if="loadingMore">
					<u-loading-icon mode="spinner" size="32"></u-loading-icon>
					<text class="load-more-text">加载中...</text>
				</view>
				<view class="load-more-tip" v-else-if="hasMore">
					<text class="load-more-text">上拉加载更多</text>
				</view>
				<view class="load-more-end" v-else>
					<text class="load-more-text">没有更多服务了</text>
				</view>
			</view>
			
			<!-- 空状态 -->
			<view class="empty-state" v-if="services.length === 0 && !loading">
				<image src="/static/images/empty-service.png" class="empty-icon" mode="aspectFit"></image>
				<text class="empty-title">暂无服务</text>
				<text class="empty-desc">暂未发布任何服务</text>
			</view>
		</scroll-view>
		
		<!-- 筛选弹窗 -->
		<u-popup :show="showFilterModal" mode="bottom" border-radius="20" :safe-area-inset-bottom="true">
			<view class="filter-modal">
				<view class="filter-header">
					<text class="filter-title">服务筛选</text>
					<view class="filter-close" @click="showFilterModal = false">
						<text class="iconfont icon-close"></text>
					</view>
				</view>
				<view class="filter-content">
					<view class="filter-group">
						<text class="filter-group-title">服务分类</text>
						<view class="filter-options">
							<view 
								class="filter-option" 
								:class="{ active: filterCategory === item.id }"
								v-for="item in categories" 
								:key="item.id"
								@click="filterCategory = item.id"
							>
								<text class="filter-option-text">{{ item.name }}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="filter-footer">
					<view class="filter-reset" @click="resetFilter">重置</view>
					<view class="filter-confirm" @click="applyFilter">确定</view>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import { getServiceProductList, getServiceProductCategory,createPrivateRoom} from '@/utils/api.js'

export default {
	data() {
		return {
			// 导航栏样式
			navbarStyle: {
				background: {
					background: '#ffffff'
				},
				color: '#333333',
				titleColor: '#333333',
				size: '44'
			},
			userInfo:uni.getStorageSync('$userinfo'),
			// 页面状态
			loading: false,
			refreshing: false,
			loadingMore: false,
			networkError: false,
			providerId: null,
			categoryId: null,
			categoryName: '',
			
			// 分页相关
			currentPage: 1,
			pageSize: 10,
			hasMore: true,
			
			// 筛选相关
			currentCategoryIndex: 0,
			filterCategory: 'all',
			showFilterModal: false,
			
			// 数据
			categories: [
				{ id: 'all', name: '全部' }
			],
			services: []
		}
	},
	
	computed: {
		pageTitle() {
			if (this.categoryName) {
				return `${this.categoryName}服务`;
			}
			return '服务列表';
		}
	},
	
	onLoad(options) {
		// 获取参数
		this.providerId = options.providerId || options.id;
		this.categoryId = options.categoryId;
		this.categoryName = decodeURIComponent(options.categoryName || '');
		
		if (!this.providerId) {
			uni.showToast({
				title: '缺少服务商ID参数',
				icon: 'none'
			});
			return;
		}
		
		// 初始化页面数据
		this.initPageData();
	},
	
	methods: {
		// 初始化页面数据
		async initPageData() {
			this.loading = true;
			this.networkError = false;
			
			try {
				// 并行加载基础数据
				await Promise.all([
					this.loadServiceCategories(),
					this.loadServices(true)
				]);
				
			} catch (error) {
				this.handleApiError(error, '页面初始化');
			} finally {
				this.loading = false;
			}
		},
		
		// 加载服务分类
		async loadServiceCategories() {
			try {
				const response = await getServiceProductCategory({ entity_id: this.providerId });
				
				if (response.code === 0 && response.data) {
					this.formatCategoriesData(response.data);
					
					// 如果有传入的分类ID，设置当前选中的分类
					if (this.categoryId) {
						const categoryIndex = this.categories.findIndex(cat => cat.id === this.categoryId);
						if (categoryIndex !== -1) {
							this.currentCategoryIndex = categoryIndex;
							this.filterCategory = this.categoryId;
						}
					}
				}
			} catch (error) {
				console.error('加载服务分类失败:', error);
			}
		},
		
		// 加载服务列表
		async loadServices(reset = true) {
			try {
				if (reset) {
					this.currentPage = 1;
					this.hasMore = true;
				}
				
				if (!this.hasMore && !reset) return;
				
				const params = {
					entity_id: this.providerId,
					page: this.currentPage,
					page_size: this.pageSize
				};
				
				// 添加分类筛选
				const currentCategory = this.categories[this.currentCategoryIndex];
				if (currentCategory && currentCategory.id !== 'all') {
					params.sub_category_id = currentCategory.id;
				}
				
				const response = await getServiceProductList(params);
				
				if (response.code === 0 && response.data) {
					this.formatServicesData(response.data, reset);
					
					// 判断是否还有更多数据
					const services = response.data.list || [];
					this.hasMore = services.length === this.pageSize;
					if (this.hasMore) {
						this.currentPage++;
					}
				} else {
					if (reset) {
						this.services = [];
					}
					this.hasMore = false;
				}
			} catch (error) {
				this.handleApiError(error, '加载服务列表');
				if (reset) {
					this.services = [];
				}
				this.hasMore = false;
			}
		},
		
		// 加载更多服务
		async loadMoreServices() {
			if (!this.hasMore || this.loadingMore) return;
			
			this.loadingMore = true;
			try {
				await this.loadServices(false);
			} catch (error) {
				this.currentPage--;
				this.handleApiError(error, '加载更多服务');
			} finally {
				this.loadingMore = false;
			}
		},
		
		// 刷新服务列表
		async refreshServices() {
			this.refreshing = true;
			try {
				await this.loadServices(true);
			} finally {
				this.refreshing = false;
			}
		},
		
		// 格式化分类数据
		formatCategoriesData(data) {
			const categories = [{ id: 'all', name: '全部' }];
			
			if (Array.isArray(data)) {
				data.forEach(item => {
					categories.push({
						id: item.id.toString(),
						name: item.name
					});
				});
			}
			
			this.categories = categories;
		},
		
		// 格式化服务数据
		formatServicesData(data, reset = true) {
			if (!data) {
				if (reset) {
					this.services = [];
				}
				return;
			}
			let services = [];
			if (Array.isArray(data)) {
				services = data;
			} else if (data.list && Array.isArray(data.list)) {
				services = data.list;
			} else if (data.data && Array.isArray(data.data)) {
				services = data.data;
			}
			const formattedServices = services.map(item => {
				let img = '';
				if (item.images) {
					let imgs = item.images;
					if (typeof imgs === 'string') {
						try {
							imgs = JSON.parse(imgs);
						} catch (e) {
							imgs = [];
						}
					}
					if (Array.isArray(imgs) && imgs.length > 0) {
						img = imgs[0];
					}
				}
				if (!img) img = item.image || '/static/service1.jpg';
				return {
					id: item.id,
					title: item.title || item.name || item.service_name,
					description: item.description || item.descp || item.service_desc,
					price: this.parseNumber(item.price),
					originalPrice: this.parseNumber(item.original_price),
					category: item.category_name || '',
					categoryId: item.category_id,
					image: img,
					unit: item.unit,
					status: item.status,
					address: item.address,
					auditStatus: item.audit_status,
					auditRemark: item.audit_remark,
					auditTime: item.audit_time,
					createdAt: item.created_at,
					updatedAt: item.updated_at
				};
			});
			if (reset) {
				this.services = formattedServices;
			} else {
				const existingIds = new Set(this.services.map(s => s.id));
				const newServices = formattedServices.filter(s => !existingIds.has(s.id));
				this.services = [...this.services, ...newServices];
			}
			this.services.sort((a, b) => {
				const dateA = new Date(a.createdAt || 0);
				const dateB = new Date(b.createdAt || 0);
				return dateB - dateA;
			});
		},
		
		// 点击服务分类
		async onCategoryClick(index) {
			if (this.currentCategoryIndex === index) return;
			
			this.currentCategoryIndex = index;
			this.loading = true;
			
			try {
				await this.loadServices(true);
			} finally {
				this.loading = false;
			}
		},
		
		// 筛选相关方法
		resetFilter() {
			this.filterCategory = 'all';
		},
		
		async applyFilter() {
			const categoryIndex = this.categories.findIndex(cat => cat.id === this.filterCategory);
			if (categoryIndex !== -1) {
				this.currentCategoryIndex = categoryIndex;
			}
			this.showFilterModal = false;
			
			this.loading = true;
			try {
				await this.loadServices(true);
			} finally {
				this.loading = false;
			}
		},
		
		// 点击服务项目
		onServiceClick(service) {
			uni.navigateTo({
				url: `/pages/service/detail?id=${service.id}`
			});
		},
		
		// 立即咨询
		async onConsult() {
			if(this.userInfo.id == this.providerId){
				uni.showToast({ title: '不能和自己聊天', icon: 'none' })
				return
			} 
			// 创建私聊房间
			const res = await createPrivateRoom({ user_id2: this.providerId })
			if (res.code === 0 && res.data && res.data.room_id) {
				        uni.navigateTo({ url: `/pages/chat/chat?room_id=${res.data.room_id}&room_name=${encodeURIComponent('服务商咨询')}` })
			}else{
				uni.showToast({ title: res.msg || '错误，请重试', icon: 'none' })
			}
		},
		
		// 立即购买
		onBuy(service) {
			uni.navigateTo({
				url: `/pages/service/detail?id=${service.id}`
			});
		},
		
		// 统一错误处理
		handleApiError(error, context) {
			console.error(`${context} 失败:`, error);
			
			if (error.message?.includes('网络') || error.code === 'NETWORK_ERROR') {
				this.networkError = true;
				uni.showToast({
					title: '网络连接失败，请检查网络设置',
					icon: 'none'
				});
			} else {
				uni.showToast({
					title: error.message || '加载失败，请稍后重试',
					icon: 'none'
				});
			}
		},
		
		// 格式化数字显示
		formatNumber(num) {
			if (!num || num === 0) return '0';
			
			if (num >= 100000000) {
				return (num / 100000000).toFixed(1) + '亿';
			} else if (num >= 10000) {
				return (num / 10000).toFixed(1) + '万';
			} else if (num >= 1000) {
				return (num / 1000).toFixed(1) + 'K';
			}
			
			return num.toString();
		},
		
		// 安全解析数字
		parseNumber(value) {
			if (typeof value === 'number') return value;
			if (typeof value === 'string') {
				const num = parseFloat(value);
				return isNaN(num) ? 0 : num;
			}
			return 0;
		}
	}
}
</script>

<style lang="scss" scoped>
.service-list-page {
	background: #f5f5f5;
	min-height: 100vh;
}

// 导航栏样式
.navbar-right {
	.filter-btn {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		
		.iconfont {
			font-size: 32rpx;
			color: #333;
		}
	}
}

// 分类导航
.category-nav {
	background: #fff;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
	
	.category-scroll {
		white-space: nowrap;
		
		.category-list {
			display: flex;
			padding: 0 20rpx;
			gap: 24rpx;
			
			.category-item {
				flex-shrink: 0;
				display: flex;
				align-items: center;
				padding: 16rpx 20rpx;
				border-radius: 40rpx;
				background: #f8f9fa;
				transition: all 0.3s ease;
				
				&.active {
					background: #3D6AFF;
					
					.category-text {
						color: #ffffff;
					}
				}
				
				.category-text {
					font-size: 28rpx;
					color: #666666;
					margin-right: 8rpx;
				}
			}
		}
	}
}

// 服务列表
.service-list {
	padding: 20rpx;
	height: calc(100vh - 200rpx);
	
	.service-item {
		background: #ffffff;
		border-radius: 24rpx;
		margin-bottom: 24rpx;
		overflow: hidden;
		
		.service-image {
			width: 100%;
			height: 360rpx;
		}
		
		.service-content {
			padding: 32rpx;
			
			.service-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 16rpx;
				
				.service-tag {
					display: inline-block;
					background: #e8f2ff;
					color: #3D6AFF;
					font-size: 24rpx;
					padding: 8rpx 16rpx;
					border-radius: 16rpx;
				}
				
				.service-status {
					.status-text {
						font-size: 22rpx;
						color: #999;
					}
					
					&.active {
						.status-text {
							color: #52c41a;
						}
					}
				}
			}
			
			.service-title {
				font-size: 32rpx;
				font-weight: 400;
				color: #333333;
				margin-bottom: 12rpx;
			}
			
			.service-desc {
				font-size: 28rpx;
				color: #666666;
				line-height: 1.6;
				margin-bottom: 24rpx;
			}
			
			.service-footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
				
				.service-price {
					display: flex;
					align-items: baseline;
					
					.price-symbol {
						font-size: 28rpx;
						color: #ff4757;
						margin-right: 4rpx;
					}
					
					.price-number {
						font-size: 40rpx;
						font-weight: 400;
						color: #ff4757;
					}
					
					.original-price {
						font-size: 24rpx;
						color: #999999;
					
					}
					
					.price-text {
						font-size: 32rpx;
						color: #ff4757;
						font-weight: 400;
					}
				}
				
				.service-actions {
					display: flex;
					gap: 16rpx;
					
					.action-btn {
						padding: 16rpx 32rpx;
						border-radius: 40rpx;
						font-size: 28rpx;
						text-align: center;
						border: 1rpx solid #3D6AFF;
						color: #3D6AFF;
						
						&.primary {
							background: #3D6AFF;
							color: #ffffff;
						}
					}
				}
			}
		}
	}
}

// 加载更多容器
.load-more-container {
	padding: 40rpx 0;
	text-align: center;
	
	.load-more-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		
		.load-more-text {
			margin-left: 16rpx;
			font-size: 28rpx;
			color: #666;
		}
	}
	
	.load-more-tip {
		.load-more-text {
			font-size: 28rpx;
			color: #999;
		}
	}
	
	.load-more-end {
		.load-more-text {
			font-size: 26rpx;
			color: #ccc;
		}
	}
}

// 空状态
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 40rpx;
	
	.empty-icon {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 30rpx;
		opacity: 0.6;
	}
	
	.empty-title {
		font-size: 32rpx;
		color: #333;
		margin-bottom: 16rpx;
		font-weight: 500;
	}
	
	.empty-desc {
		font-size: 28rpx;
		color: #999;
		text-align: center;
		line-height: 1.5;
	}
}

// 筛选弹窗
.filter-modal {
	background: #fff;
	border-radius: 20rpx 20rpx 0 0;
	
	.filter-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 40rpx;
		border-bottom: 1rpx solid #eee;
		
		.filter-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}
		
		.filter-close {
			width: 60rpx;
			height: 60rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			
			.iconfont {
				font-size: 32rpx;
				color: #999;
			}
		}
	}
	
	.filter-content {
		padding: 40rpx;
		max-height: 60vh;
		overflow-y: auto;
		
		.filter-group {
			margin-bottom: 40rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.filter-group-title {
				font-size: 30rpx;
				font-weight: 500;
				color: #333;
				margin-bottom: 24rpx;
			}
			
			.filter-options {
				display: flex;
				flex-wrap: wrap;
				gap: 16rpx;
				
				.filter-option {
					padding: 16rpx 32rpx;
					background: #f5f5f5;
					border-radius: 40rpx;
					border: 2rpx solid transparent;
					
					.filter-option-text {
						font-size: 28rpx;
						color: #666;
					}
					
					&.active {
						background: rgba(61, 106, 255, 0.1);
						border-color: #3D6AFF;
						
						.filter-option-text {
							color: #3D6AFF;
							font-weight: 500;
						}
					}
				}
			}
		}
	}
	
	.filter-footer {
		display: flex;
		padding: 30rpx 40rpx;
		border-top: 1rpx solid #eee;
		gap: 20rpx;
		
		.filter-reset {
			flex: 1;
			height: 88rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #f5f5f5;
			border-radius: 44rpx;
			font-size: 30rpx;
			color: #666;
		}
		
		.filter-confirm {
			flex: 2;
			height: 88rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #3D6AFF;
			border-radius: 44rpx;
			font-size: 30rpx;
			color: #fff;
			font-weight: 500;
		}
	}
}

// 深度选择器
::v-deep .u-navbar {
	.u-navbar__content {
		background: #ffffff !important;
	}
}
</style>
