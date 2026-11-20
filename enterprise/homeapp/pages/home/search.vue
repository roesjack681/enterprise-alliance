<template>
	<view class="search-page"> 
		<view class="search-header">
		<view class="search">
				<u-search 
					v-model="searchVal" 
					placeholder="搜索企业名称、行业、服务等" 
					@search="search" 
					@custom="search" 
					@clear="searchVal = ''" 
					height="60" 
					searchIconSize="36" 
					actionText="搜索" 
					focus
				></u-search>
			</view>
		</view>
		
		<!-- 搜索历史 -->
		<view class="history" v-if="!isSearchResult && searchHistory.length > 0">
			<view class="title">
				<text>搜索历史</text>
				<u-icon name="trash" size="36" @click="searchHistoryClear"></u-icon>
			</view>
			<view class="content">
				<view v-for="item in searchHistory" :key="item" @click="searchVal = item; search()">{{ item }}</view>
			</view>
		</view>
		
		<!-- 热门搜索 -->
		<view class="hot-search" v-if="!isSearchResult">
			<view class="title">热门搜索</view>
			<view class="content">
				<view v-for="item in hotSearchList" :key="item" @click="searchVal = item; search()">{{ item }}</view>
			</view>
		</view>
		
		<!-- 搜索结果 -->
		<view class="result" v-if="isSearchResult">
			<!-- 分类选项卡 -->
			<view class="category-tabs">
				<scroll-view class="tabs-scroll" scroll-x>
					<view class="tabs-container">
						<view 
							class="tab-item" 
							v-for="(item, index) in resultTabs" 
							:key="index"
							:class="{ active: currentResultTab === index }"
							@click="switchResultTab(index)"
						>
							<text class="tab-text">{{ item.name }} {{ item.count>0?`(${item.count})`:`` }}</text>
						</view>
					</view>
				</scroll-view>
			</view>

			<!-- 结果列表 -->
			<view class="company-list" v-if="currentDisplayResults.length > 0">
				<view 
					class="company-item" 
					v-for="(item, index) in currentDisplayResults" 
					:key="item.id"
					@click="goToResultDetail(item)"
				>
					<image class="company-logo" :src="item.logo || '/static/images/default-logo.png'" mode="aspectFill"></image>
					<view class="company-info">
						<view class="company-header">
							<text class="company-name">{{ item.name }}</text>
							<view class="company-tag" :class="item.tagClass">{{ item.typeName }}</view>
						</view>
						<text class="company-desc">{{ item.description || '暂无简介' }}</text>
					</view>
				</view>
			</view>
			
			<u-empty v-if="currentDisplayResults.length === 0" mode="search" text="暂无搜索结果"></u-empty>
		</view>
	</view>
</template>

<script>
	import { search as searchApi } from '@/utils/api.js'
	
	export default {
		data() {
			return {
				searchVal: '',
				searchHistory: uni.getStorageSync('searchHistory') || [],
				isSearchResult: false,
				searchResultServices: [],
				searchResultEnterprises: [],
				searchResultDemands: [], // 需求结果
				searchResultProducts: [], // 产品结果
				searchResultNews: [], // 新闻结果
				searchResultOthers: [], // 其他结果
				hotSearchList: ['工商注册', '财税服务', '法律服务', '知识产权', '人力资源', '企业培训', '市场推广', '数字化转型'],
				
				// Tab 相关数据
				currentResultTab: 0,
				resultTabs: [
					{ name: '全部', type: 'all', count: 0 },
					{ name: '企业', type: 'enterprise', count: 0 },
					{ name: '服务', type: 'service', count: 0 },
					{ name: '需求', type: 'demand', count: 0 },
					{ name: '产品', type: 'product', count: 0 },
					{ name: '新闻', type: 'news', count: 0 },
					{ name: '其他', type: 'other', count: 0 }
				]
			};
		},
		computed: {
			// 当前显示的搜索结果
			currentDisplayResults() {
				const currentTab = this.resultTabs[this.currentResultTab];
				switch (currentTab.type) {
					case 'all':
						return [
							...this.searchResultEnterprises,
							...this.searchResultServices,
							...this.searchResultDemands,
							...this.searchResultProducts,
							...this.searchResultNews,
							...this.searchResultOthers
						];
					case 'enterprise':
						return this.searchResultEnterprises;
					case 'service':
						return this.searchResultServices;
					case 'demand':
						return this.searchResultDemands;
					case 'product':
						return this.searchResultProducts;
					case 'news':
						return this.searchResultNews;
					case 'other':
						return this.searchResultOthers;
					default:
						return [];
				}
			}
		},
		watch: {
			searchVal (newVal) {
				if (!newVal) {
					this.isSearchResult = false;
				}
			}
		},
		methods: {
			// 搜索
			search () {
				if (this.searchVal.trim()) {
					this.performSearch();
					
					// 保存搜索历史
					this.searchHistory.unshift(this.searchVal);
					this.searchHistory = Array.from(new Set(this.searchHistory)).slice(0, 10); // 最多保存10条
					uni.setStorageSync('searchHistory', this.searchHistory);
					
					this.isSearchResult = true;
				}
			},
			
			// 执行搜索
			performSearch() {
				const params = {
					words: this.searchVal,
					current_page: 1,
					page_size: 20
				};
				
				searchApi(params).then(res => {
					if (res && res.data && res.data.results) {
						// 初始化结果数组
						this.searchResultServices = [];
						this.searchResultEnterprises = [];
						this.searchResultDemands = [];
						this.searchResultProducts = [];
						this.searchResultNews = [];
						this.searchResultOthers = [];
						// 遍历搜索结果
						res.data.results.forEach(item => {
							this.categorizeSearchResult(item);
						});
						
						// 更新tab计数
						this.updateTabCounts();
					} else {
						this.clearAllResults();
					}
				}).catch(err => {
					//console.error('搜索失败:', err);
					this.clearAllResults();
					uni.showToast({
						title: (err.data && err.data.msg) || '搜索失败，请重试',
						icon: 'none'
					});
				});
			},
			
			// 分类处理搜索结果
			categorizeSearchResult(item) {
				// 根据 words_type 和其他字段判断类型
				if (item.words_type == 1) {
					// 实体类型 - 企业、服务商、协会
					const role = String(item.detail.role);
					const enterprise = {
						id: item.obj_id,
						name: item.detail.company_name || item.detail.nickname,
						description: item.detail.description || '',
						logo: item.detail.avatar || '/static/logo.png',
						tags: [this.$C.getRoleName(item.detail.role), item.source_name].filter(Boolean),
						city: item.detail.city,
						province: item.detail.province,
						role: item.detail.role,
						username: item.detail.username,
						tagClass: this.getTagClass(role),
						typeName: this.getTypeName(role),
						resultType: 'enterprise'
					};
					this.searchResultEnterprises.push(enterprise);
				} else if (item.words_type == 2) {
					// 服务类型
					const service = {
						id: item.obj_id,
						name: item.detail.title || item.detail.name || '',
						description: item.detail.description || item.type_name || '',
						logo: item.detail.images ? (JSON.parse(item.detail.images)[0] || '/static/logo.png') : '/static/logo.png',
						category: item.type_name || '',
						price: item.detail.price || 0,
						rating: item.detail.rating || 5,
						ratingScore: item.detail.ratingScore || '5.0',
						tags: item.detail.tags ? JSON.parse(item.detail.tags) : [],
						tagClass: 'tag-service',
						typeName: '服务',
						resultType: 'service'
					};
					this.searchResultServices.push(service);
				} else if (item.words_type == 3) {
					// 需求类型
					const demand = {
						id: item.obj_id,
						name: item.detail.title || item.detail.name || '需求',
						description: item.detail.description || item.detail.content || '',
						logo: '/static/images/default-demand.png',
						category: item.type_name || '需求',
						tagClass: 'tag-demand',
						typeName: '需求',
						resultType: 'demand'
					};
					this.searchResultDemands.push(demand);
				} else if (item.words_type == 4) {
					// 产品类型
					const product = {
						id: item.obj_id,
						name: item.detail.title || item.detail.name || '产品',
						description: item.detail.description || '',
						logo: item.detail.images ? (JSON.parse(item.detail.images)[0] || '/static/logo.png') : '/static/logo.png',
						category: item.type_name || '产品',
						tagClass: 'tag-product',
						typeName: '产品',
						resultType: 'product'
					};
					this.searchResultProducts.push(product);
				} else if (item.words_type == 5) {
					// 新闻类型
					const news = {
						id: item.obj_id,
						name: item.detail.title || item.detail.name || '新闻',
						description: item.detail.description || '',
						logo: item.detail.images ? (JSON.parse(item.detail.images)[0] || '/static/logo.png') : '/static/logo.png',
						category: item.type_name || '新闻',
						tagClass: 'tag-news',
						typeName: '新闻',
						resultType: 'news'
					};
					this.searchResultNews.push(news);
				} else {
					// 其他类型
					const other = {
						id: item.obj_id,
						name: item.detail.title || item.detail.name || item.detail.company_name || '其他',
						description: item.detail.description || '',
						logo: item.detail.avatar || item.detail.images ? (JSON.parse(item.detail.images)[0] || '/static/logo.png') : '/static/logo.png',
						category: item.type_name || '其他',
						tagClass: 'tag-other',
						typeName: '其他',
						resultType: 'other'
					};
					this.searchResultOthers.push(other);
				}
			},
			
			// 更新tab计数
			updateTabCounts() {
				this.resultTabs[0].count = this.searchResultEnterprises.length + this.searchResultServices.length + this.searchResultDemands.length + this.searchResultProducts.length + this.searchResultNews.length + this.searchResultOthers.length;
				this.resultTabs[1].count = this.searchResultEnterprises.length;
				this.resultTabs[2].count = this.searchResultServices.length;
				this.resultTabs[3].count = this.searchResultDemands.length;
				this.resultTabs[4].count = this.searchResultProducts.length;
				this.resultTabs[5].count = this.searchResultNews.length;
				this.resultTabs[6].count = this.searchResultOthers.length;
			},
			
			// 清空所有结果
			clearAllResults() {
				this.searchResultServices = [];
				this.searchResultEnterprises = [];
				this.searchResultDemands = [];
				this.searchResultProducts = [];
				this.searchResultNews = [];
				this.searchResultOthers = [];
				this.updateTabCounts();
			},
			
			// 切换结果tab
			switchResultTab(index) {
				if (this.currentResultTab === index) return;
				this.currentResultTab = index;
			},
			
			// 跳转到结果详情（统一入口）
			goToResultDetail(item) {
				switch (item.resultType) {
					case 'service':
						this.goToServiceDetail(item);
						break;
					case 'enterprise':
						this.goToEnterpriseDetail(item);
						break;
					case 'demand':
						this.goToDemandDetail(item);
						break;
					case 'product':
						this.goToProductDetail(item);
						break;
					default:
						this.goToOtherDetail(item);
				}
			},
			
			// 清空历史记录
			searchHistoryClear () {
				uni.setStorageSync('searchHistory', []);
				this.searchHistory = [];
			},
			
			// 跳转服务详情
			goToServiceDetail (item) {
				uni.navigateTo({
					url: `/pages/service/detail?id=${item.id}`
				});
			},
			
			// 跳转企业详情
			goToEnterpriseDetail (item) {
				if(item.role == 7){
					uni.navigateTo({
						url: `/pages/provider/home?id=${item.id}`
					});
				}else if(item.role == 8 || item.role == 10){
					uni.navigateTo({
						url: `/pages/company/home?enterpriseId=${item.id}`
					});
				}else{
					//没有主页，提示下
					uni.showToast({
						title: '该企业没有主页',
						icon: 'none'
					});
				}
			},
			
			// 跳转需求详情
			goToDemandDetail(item) {
				uni.navigateTo({
					url: `/pages/demand/detail?id=${item.id}`
				});
			},
			
			// 跳转产品详情
			goToProductDetail(item) {
				uni.navigateTo({
					url: `/pages/product/detail?id=${item.id}`
				});
			},
			
			// 跳转其他详情
			goToOtherDetail(item) {
				uni.showToast({
					title: '该类型暂不支持查看详情',
					icon: 'none'
				});
			},
			
			// 获取企业类型名称
			getTypeName(type) {
				return this.$C.getRoleName(type)
			},
			
			// 获取标签样式类
			getTagClass(type) {
				switch (type) {
					case '7':
						return 'tag-enterprise'
					case '8':
						return 'tag-provider'
					case '9':
						return 'tag-association'
					default:
						return ''
				}
			}
		}
	}
</script>

<style lang="scss">
.search-page {
	background-color: #fff;
	min-height: 100vh;
}

.search-header {
	background-color: #fff;
	padding: 20rpx 32rpx;
	border-bottom: 1rpx solid #f0f0f0;
	position: sticky;
	top: 0;
	z-index: 100;
}

.search {
	display: flex; 
	padding: 20rpx 0;
	
	::v-deep .u-search__action--active { 
		width: auto; 
		padding: 0 20rpx 0 15rpx;
	}
}

.title { 
	font-size: 28rpx; 
	font-weight: 400; 
	display: flex; 
	align-items: center; 
	justify-content: space-between;
	margin-bottom: 20rpx;
	color: #333;
}

.history, .hot-search {
	padding: 32rpx;
	margin-bottom: 0;
	background-color: #fff;
	border-bottom: 1rpx solid #f0f0f0;
	
	.content {
		display: flex; 
		flex-wrap: wrap; 
		margin-top: 20rpx;
		
		view { 
			font-size: 28rpx; 
			line-height: 50rpx; 
			color: #666; 
			background: #f5f5f5; 
			padding: 0 20rpx; 
			margin-right: 20rpx; 
			margin-bottom: 20rpx;
			border-radius: 25rpx;
			transition: all 0.3s ease;
			cursor: pointer;
			
			&:active {
				background: #e0e0e0;
				transform: scale(0.95);
			}
	}
}
}

.result {
	background-color: #f5f5f5;
	flex: 1; 
	min-height: 100vh;
	/* 分类标签样式 - 支持横向滚动 */
	.category-tabs {
		background-color: #fff;
		border-bottom: 1rpx solid #f0f0f0;
	 
		.tabs-scroll {
			width: 100%;
			white-space: nowrap;
			
			.tabs-container {
				display: flex;
				padding: 0 30rpx;
				
				.tab-item {
					position: relative;
					padding: 24rpx 0;
					margin-right: 20rpx;
					flex-shrink: 0;
					white-space: nowrap;
					
					&:last-child {
						margin-right: 30rpx;
					}
					
					.tab-text {
						font-size: 30rpx;
						color: #666;
						white-space: nowrap;
					}
					
					&.active {
						.tab-text {
							color: #3D6AFF;
							font-weight: 500;
						}
						
						&::after {
							content: '';
							position: absolute;
							bottom: 0;
							left: 50%;
							transform: translateX(-50%);
							width: 40rpx;
							height: 6rpx;
							background-color: #3D6AFF;
							border-radius: 3rpx;
						}
					}
				}
			}
		}
	}
	
	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		padding: 20rpx 30rpx 10rpx;
		background-color: #f5f5f5;
	}
	
	/* 企业列表样式 - 复用qylist的样式 */
	.company-list {
		padding: 20rpx 30rpx;
		
		.company-item {
			display: flex;
			background-color: #fff;
			border-radius: 16rpx;
			padding: 30rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
			
			.company-logo {
				width: 120rpx;
				height: 120rpx;
				border-radius: 12rpx;
				margin-right: 24rpx;
				flex-shrink: 0;
			}
			
			.company-info {
				flex: 1;
				
				.company-header {
					display: flex;
					align-items: center;
					margin-bottom: 16rpx;
					
					.company-name {
						font-size: 30rpx;
						font-weight: 600;
						color: #333;
						margin-right: 16rpx;
					}
					
					.company-tag {
						font-size: 22rpx;
						padding: 4rpx 12rpx;
						border-radius: 6rpx;
						width: 100rpx;
						text-align: center;
						
						&.tag-enterprise {
							background-color: rgba(61, 106, 255, 0.1);
							color: #3D6AFF;
						}
						
						&.tag-provider {
							background-color: rgba(255, 87, 51, 0.1);
							color: #FF5733;
						}
						
						&.tag-association {
							background-color: rgba(76, 175, 80, 0.1);
							color: #4CAF50;
						}
						
						&.tag-service {
							background-color: rgba(255, 193, 7, 0.1);
							color: #FFC107;
						}
						
						&.tag-demand {
							background-color: rgba(233, 30, 99, 0.1);
							color: #E91E63;
						}
						
						&.tag-product {
							background-color: rgba(156, 39, 176, 0.1);
							color: #9C27B0;
						}
						
						&.tag-other {
							background-color: rgba(96, 125, 139, 0.1);
							color: #607D8B;
						}
					}
				}
				
				.company-desc {
					font-size: 28rpx;
					color: #666;
					line-height: 1.5;
					margin-bottom: 16rpx;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					line-clamp: 2;
					-webkit-box-orient: vertical;
					overflow: hidden;
				}
			}
		}
	}
	
	.u-empty { 
		margin: 40rpx 30rpx !important;
	}
}

/* 深度选择器样式优化 */
::v-deep .u-search {
	background-color: #f5f5f5 !important;
	border-radius: 40rpx !important;
	border: none !important;
}

::v-deep .u-search__content {
	background-color: #f5f5f5 !important;
	border-radius: 40rpx !important;
}

::v-deep .u-search__content__input {
	background-color: #f5f5f5 !important;
	font-size: 28rpx !important;
}

::v-deep .u-search__content__input__placeholder {
	color: #999 !important;
}

::v-deep .u-search__action {
	color: #3D6AFF !important;
	font-weight: 400 !important;
} 
</style>