<template>
	<view class="service-list-container">
		<!-- 顶部搜索和筛选 -->
		<view class="header-section">
			<view class="search-bar">
				<u-search 
					:height="60"
					v-model="searchKeyword" 
					placeholder="搜索服务名称" 
					@search="handleSearch" 
					@clear="handleClear"
					:show-action="false"
					:clearabled="true"
					:animation="true">
				</u-search>
			</view>
			
			<!-- 状态筛选 -->
			<view class="filter-tabs">
				<view class="filter-tab" :class="{ active: selectedStatus === null }" @click="selectStatus(null)">
					全部
				</view>
				<view class="filter-tab" :class="{ active: selectedStatus === 0 }" @click="selectStatus(0)">
					草稿
				</view>
				<view class="filter-tab" :class="{ active: selectedStatus === 1 }" @click="selectStatus(1)">
					待审核
				</view>
				<view class="filter-tab" :class="{ active: selectedStatus === 2 }" @click="selectStatus(2)">
					已发布
				</view>
				<view class="filter-tab" :class="{ active: selectedStatus === 3 }" @click="selectStatus(3)">
					已下架
				</view>
			</view>
		</view>

		<!-- 服务列表 -->
		<view class="service-list">
			<view v-if="loading" class="loading-container">
				<u-loading-icon mode="spinner" size="40" color="#3D6AFF"></u-loading-icon>
				<text class="loading-text">加载中...</text>
			</view>
			
			<view v-else-if="serviceList.length === 0" class="empty-container">
				<image src="/static/icon/t1.png" class="empty-icon" mode="aspectFit"></image>
				<text class="empty-text">暂无服务</text>
				<u-button type="primary" @click="goToAddService" :custom-style="emptyButtonStyle">发布服务</u-button>
			</view>
			
			<view v-else class="service-item" v-for="service in serviceList" :key="service.id">
				<view class="service-main" @click="viewServiceDetail(service)">
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
						<view v-if="service.status === 0 && service.audit_remark" class="service-footer margin-top-sm"> 
							<u-alert :title="service.audit_remark" type = "error" fontSize="20" :closable="true"></u-alert>
						</view>
					</view>
				</view>
				
				<!-- 操作按钮 -->
				<view class="service-actions">
					<view class="action-stats">
						<text class="stat-item">浏览 {{ service.view_count || 0 }}</text>
						<text class="stat-item">收藏 {{ service.favorite_count || 0 }}</text>
					</view>
					<view class="action-buttons">
						<u-button v-if="service.status === 2" 
							type="info" 
							size="mini" 
							@click="toggleServiceStatus(service.id, 3)"
							:custom-style="outlineButtonStyle">
							下架
						</u-button>
						<u-button v-else-if="service.status === 3" 
							type="primary" 
							size="mini" 
							@click="toggleServiceStatus(service.id, 2)"
							:custom-style="primaryButtonStyle">
							上架
						</u-button>
						<u-button v-if="service.status === 0" 
							type="primary" 
							size="mini" 
							@click="toggleServiceStatus(service.id, 1)"
							:custom-style="submitButtonStyle">
							提交审核
						</u-button>
						<u-button type="primary" 
							size="mini" 
							@click="editService(service)"
							:custom-style="editButtonStyle">
							编辑
						</u-button>
						<u-button type="info" 
							size="mini" v-if="service.status === 3" 
							@click="deleteService(service)"
							:custom-style="deleteButtonStyle">
							删除
						</u-button>
					</view>
				</view>
			</view>
		</view>

		<!-- 分页 -->
		<view v-if="totalPages > 1" class="pagination">
			<view class="pagination-container">
				<u-button 
					type="info" 
					size="mini" 
					:disabled="currentPage === 1"
					@click="handlePageChange(currentPage - 1)"
					:custom-style="paginationButtonStyle">
					上一页
				</u-button>
				<text class="page-info">{{ currentPage }} / {{ totalPages }}</text>
				<u-button 
					type="primary" 
					size="mini" 
					:disabled="currentPage === totalPages"
					@click="handlePageChange(currentPage + 1)"
					:custom-style="paginationButtonStyle">
					下一页
				</u-button>
			</view>
		</view>

		<!-- 悬浮添加按钮 -->
		<view class="fab-button" @click="goToAddService">
			<u-icon name="plus" color="#ffffff" size="32"></u-icon>
		</view>

	</view>
</template>

<script>
import { getMyServiceProducts, deleteServiceProduct, toggleServiceStatus } from '@/utils/api.js'

export default {
	// 启用下拉刷新
	onPullDownRefresh() {
		this.loadServiceList().then(() => {
			uni.stopPullDownRefresh();
		});
	},
	
	data() {
		return {
			loading: false,
			serviceList: [],
			searchKeyword: '',
			selectedStatus: null,
			currentPage: 1,
			pageSize: 10,
			total: 0,
			totalPages: 0,
			// 按钮样式配置
			primaryButtonStyle: {
				backgroundColor: '#3D6AFF',
				borderRadius: '24rpx',
				fontSize: '24rpx',
				padding: '12rpx 24rpx'
			},
			outlineButtonStyle: {
				backgroundColor: 'transparent',
				border: '2rpx solid #3D6AFF',
				color: '#3D6AFF',
				borderRadius: '24rpx',
				fontSize: '24rpx',
				padding: '12rpx 24rpx'
			},
			editButtonStyle: {
				backgroundColor: '#3D6AFF',
				borderRadius: '24rpx',
				fontSize: '24rpx',
				padding: '12rpx 24rpx'
			},
			deleteButtonStyle: {
			
				borderRadius: '24rpx',
				fontSize: '24rpx',
				padding: '12rpx 24rpx'
			},
			emptyButtonStyle: {
				backgroundColor: '#3D6AFF',
				borderRadius: '40rpx',
				fontSize: '28rpx',
				padding: '20rpx 40rpx'
			},
			paginationButtonStyle: {
				backgroundColor: '#3D6AFF',
				borderRadius: '24rpx',
				fontSize: '24rpx',
				padding: '12rpx 24rpx',
				margin: '0 16rpx'
			},
			submitButtonStyle: {
				backgroundColor: '#3D6AFF',
				borderRadius: '24rpx',
				fontSize: '24rpx',
				padding: '20rpx 10rpx',
				minWidth: '120rpx',
				boxSizing: 'border-box'
			}
		}
	},

	computed: {
	},

	onLoad() {
		this.loadServiceList();
	},

	onShow() {
		this.loadServiceList();
	},

	onReachBottom() {
		if (this.currentPage < this.totalPages) {
			this.currentPage++;
			this.loadServiceList(true);
		}
	},

	methods: {
		// 加载服务列表
		async loadServiceList(append = false) {
			try {
				this.loading = true;
				const params = {
					page: this.currentPage,
					page_size: this.pageSize,
					keyword: this.searchKeyword
				};
				
				// 只有当选择了具体状态时才传递status参数
				if (this.selectedStatus !== null) {
					params.status = this.selectedStatus;
				}
				
				const response = await getMyServiceProducts(params);
				
				if (response.code === 0) {
					const { list, total, total_pages } = response.data;
					
					if (append) {
						this.serviceList = [...this.serviceList, ...list];
					} else {
						this.serviceList = list||[];
					}
					
					this.total = total;
					this.totalPages = total_pages;
				} else {
					uni.showToast({
						title: response.message || '获取服务列表失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('获取服务列表失败:', error);
				uni.showToast({
					title: '网络错误，请稍后重试',
					icon: 'none'
				});
			} finally {
				this.loading = false;
			}
		},

		// 搜索
		handleSearch() {
			this.currentPage = 1;
			this.loadServiceList();
		},

		// 清除搜索
		handleClear() {
			this.searchKeyword = '';
			this.currentPage = 1;
			this.loadServiceList();
		},

		// 选择状态筛选
		selectStatus(status) {
			this.selectedStatus = status;
			this.currentPage = 1;
			this.loadServiceList();
		},

		// 分页变化
		handlePageChange(page) {
			if (page < 1 || page > this.totalPages) return;
			this.currentPage = page;
			this.loadServiceList();
		},

		// 获取服务图标
		getServiceIcon(categoryName) {
			if (!categoryName) return ''; 
			return  categoryName.charAt(0) || '';
		},

		// 格式化价格
		formatPrice(price) {
			if (!price) return '0';
			return price.toLocaleString();
		},

		// 解析标签
		parseTags(tags) {
			if (!tags) return [];
			try {
				if (typeof tags === 'string') {
					const parsed = JSON.parse(tags);
					return Array.isArray(parsed) ? parsed : [];
				}
				return Array.isArray(tags) ? tags : [];
			} catch (error) {
				console.error('解析标签失败:', error);
				if (typeof tags === 'string') {
					return tags.split(',').filter(tag => tag.trim()).map(tag => ({ id: tag, name: tag }));
				}
				return [];
			}
		},

		// 获取状态样式类
		getStatusClass(status) {
			const statusMap = {
				0: 'status-draft',
				1: 'status-pending',
				2: 'status-active',
				3: 'status-offline'
			};
			return statusMap[status] || 'status-draft';
		},

		// 获取状态文本
		getStatusText(status) {
			const statusMap = {
				0: '草稿',
				1: '待审核',
				2: '已发布',
				3: '已下架',
				4: '已删除'
			};
			return statusMap[status] || '未知';
		},

		// 查看服务详情
		viewServiceDetail(service) {
			uni.navigateTo({
				url: `/pages/service/detail?id=${service.id}`
			});
		},

		// 编辑服务
		editService(service) {
			uni.navigateTo({
				url: `/pages/provider/addService?id=${service.id}`
			});
		},

		// 删除服务
		deleteService(service) {
			uni.showModal({
				title: '确认删除',
				content: `确定要删除服务"${service.title}"吗？`,
				success: async (res) => {
					if (res.confirm) {
						try {
							const response = await deleteServiceProduct({ id: service.id });
							if (response.code === 0) {
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
								this.loadServiceList();
							} else {
								uni.showToast({
									title: response.message || '删除失败',
									icon: 'none'
								});
							}
						} catch (error) {
							console.error('删除服务失败:', error);
							uni.showToast({
								title: '删除失败，请稍后重试',
								icon: 'none'
							});
						}
					}
				}
			});
		},

		// 切换服务状态
		async toggleServiceStatus(serviceId, status) {
			try {
				const response = await toggleServiceStatus({id:serviceId, status});
				
				if (response.code === 0) {
					uni.showToast({
						title: '操作成功',
						icon: 'success'
					});
					this.loadServiceList();
				} else {
					uni.showToast({
						title: response.message || '操作失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('切换服务状态失败:', error);
				uni.showToast({
					title: '操作失败，请稍后重试',
					icon: 'none'
				});
			}
		},
		// 跳转到添加服务页面
		goToAddService() {
			uni.navigateTo({
				url: '/pages/provider/addService'
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.service-list-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding-bottom: 120rpx;
}

/* 顶部搜索和筛选 */
.header-section {
	background-color: #fff;
	padding: 20rpx 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	
	.search-bar {
		margin-bottom: 20rpx;
	}
	
	.filter-tabs {
		display: flex;
		gap: 16rpx;
		overflow-x: auto;
		
		.filter-tab {
			flex-shrink: 0;
			padding: 12rpx 24rpx;
			background-color: #f8f9fa;
			border-radius: 24rpx;
			font-size: 26rpx;
			color: #666;
			cursor: pointer;
			transition: all 0.3s ease;
			
			&.active {
				background-color: #3D6AFF;
				color: #fff;
				box-shadow: 0 4rpx 12rpx rgba(61, 106, 255, 0.3);
			}
		}
	}
}

/* 服务列表 */
.service-list {
	padding: 0 24rpx;
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
}

.service-item {
	background-color: #fff;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.service-main {
	display: flex;
	padding: 32rpx;
	border-bottom: 1rpx solid #f0f0f0;
	cursor: pointer;
	
	&:active {
		background-color: #f8f9fa;
	}
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
	flex-shrink: 0;
	
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
		line-height: 1.4;
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
		color: #3D6AFF;
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

.service-actions {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 32rpx;
	
	.action-stats {
		display: flex;
		gap: 24rpx;
		
		.stat-item {
			font-size: 24rpx;
			color: #999;
		}
	}
	
	.action-buttons {
		display: flex;
		gap: 16rpx;
		align-items: center;
	}
}

/* 分页 */
.pagination {
	background-color: #fff;
	padding: 32rpx;
	margin-top: 20rpx;
	
	.pagination-container {
		display: flex;
		justify-content: center;
		align-items: center;
		
		.page-info {
			font-size: 28rpx;
			color: #666;
			margin: 0 32rpx;
		}
	}
}

/* 悬浮添加按钮 */
.fab-button {
	position: fixed;
	bottom: 40rpx;
	right: 40rpx;
	width: 100rpx;
	height: 100rpx;
	background: linear-gradient(135deg, #3D6AFF 0%, #5B8CFF 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 32rpx rgba(61, 106, 255, 0.3);
	z-index: 999;
	transition: all 0.3s ease;
	
	&:active {
		transform: scale(0.95);
		box-shadow: 0 4rpx 16rpx rgba(61, 106, 255, 0.4);
	}
}

</style>
