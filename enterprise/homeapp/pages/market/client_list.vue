<template>
	<view class="container">
		<!-- 头部搜索栏 -->
		<view class="search-bar">
			<u-search placeholder="搜索客户名称或企业" v-model="searchKeyword" @search="handleSearch" 
				@custom="handleSearch" bg-color="#f5f5f5" height="80" margin="20rpx" :show-action="false">
			</u-search>
		</view>



		<!-- 客户列表 -->
		<view class="client-list">
			<view v-if="loading" class="loading-container">
				<u-loading-icon mode="spinner" size="40"></u-loading-icon>
				<text class="loading-text">加载中...</text>
			</view>
			
			<view v-else-if="list.length === 0" class="empty-container">
				<image src="/static/icon/m4.png" class="empty-icon" mode="aspectFit"></image>
				<text class="empty-text">暂无客户记录</text> 
			</view>
			
			<view v-else>
				<view class="client-item" v-for="(item, index) in list" :key="item.id" @click="viewClientDetail(item)">
					<view class="client-header">
						<view class="client-info">
							<image v-if="item.logo" :src="item.logo" class="client-logo" mode="aspectFit"></image>
							<view class="client-text">
								<view class="client-name">{{ item.enterprise_name || '未命名客户' }}</view>
								<view class="client-contact" v-if="item.contact_person">{{ item.contact_person }}</view>
							</view>
						</view>
						<!-- <view class="client-status" :class="item.statusClass">{{ item.statusText }}</view> -->
					</view>
					
					<view class="client-details">
						<view class="detail-row" v-if="item.contact_phone">
							<text class="detail-label">联系电话:</text>
							<text class="detail-value">{{ item.contact_phone }}</text>
						</view>
						<view class="detail-row" v-if="item.last_contact_time > 0">
							<text class="detail-label">最后联系:</text>
							<text class="detail-value">{{ formatTime(item.last_contact_time) }}</text>
						</view>
						<view class="detail-row" v-if="item.total_amount > 0">
							<text class="detail-label">成交金额:</text>
							<text class="detail-value text-orange">¥{{ item.total_amount }}</text>
						</view>
					</view>
					
					<view class="client-tags" v-if="item.parsedTags && item.parsedTags.length > 0">
						<view class="tag" v-for="(tag, tagIndex) in item.parsedTags" :key="tagIndex"
							:style="{ backgroundColor: tag.color || '#f0f4ff', color: tag.textColor || '#666' }">
							{{ tag.name }}
						</view>
					</view>
					

				</view>
			</view>
		</view>



		<!-- 加载更多 -->
		<u-loadmore :status="loadmoreStatus" @loadmore="loadMore" v-if="list.length > 0" />
	</view>
</template>

<script>
import { getMarketGuestList } from '@/utils/api.js'

export default {
	data() {
		return {
			searchKeyword: '',
			loading: false,
			list: [],
			page: 1,
			pageSize: 20,
			total: 0,
			loadmoreStatus: 'loadmore',
			statusMapping: {
				0: { class: 'status-pending', text: '待沟通' },
				1: { class: 'status-contacted', text: '已沟通' },
				2: { class: 'status-following', text: '跟进中' },
				3: { class: 'status-success', text: '成交' },
				4: { class: 'status-invalid', text: '已失效' }
			}
		}
	},
	
	onLoad() {
		this.loadList(true);
	},
	
	onShow() {
		// 从添加/编辑页面返回时刷新列表
		if (this.needRefresh) {
			this.loadList(true);
			this.needRefresh = false;
		}
	},
	
	onPullDownRefresh() {
		this.loadList(true);
		setTimeout(() => {
			uni.stopPullDownRefresh();
		}, 1000);
	},
	
	methods: {
		// 加载客户列表
		async loadList(refresh = false) {
			if (this.loading) return;
			
			if (refresh) {
				this.page = 1;
				this.list = [];
			}
			
			this.loading = true;
			
			try {
				const params = {
					page: parseInt(this.page),
					page_size: parseInt(this.pageSize)
				};
				
				// 只有当值有效时才添加参数
				if (this.searchKeyword && this.searchKeyword !== 'undefined' && typeof this.searchKeyword === 'string' && this.searchKeyword.trim() !== '') {
					params.keyword = this.searchKeyword.trim();
				}
				
				// 可以添加状态过滤（如果需要的话）
				// if (this.currentStatus !== '' && this.currentStatus !== null && this.currentStatus !== undefined && this.currentStatus >= 0) {
				// 	const statusValue = typeof this.currentStatus === 'string' ? parseInt(this.currentStatus) : this.currentStatus;
				// 	if (!isNaN(statusValue) && statusValue >= 0 && statusValue <= 4) {
				// 		params.status = statusValue;
				// 	}
				// }
				
				const response = await getMarketGuestList(params);
				
				if (response.code === 0) {
					let newList = response.data.list || [];
					
					// 处理数据 - 解析标签和状态
					newList = newList.map(item => {
						const statusInfo = this.statusMapping[item.status] || { class: 'status-default', text: item.status };
						return {
							...item,
							statusClass: statusInfo.class,
							statusText: statusInfo.text,
							parsedTags: this.parseTags(item.tags)
						};
					});
					
					if (refresh) {
						this.list = newList;
					} else {
						this.list = this.list.concat(newList);
					}
					
					this.total = response.data.total || 0;
					
					// 更新加载状态
					if (this.list.length >= this.total) {
						this.loadmoreStatus = 'nomore';
					} else {
						this.loadmoreStatus = 'loadmore';
					}
				} else {
					uni.showToast({
						title: response.msg || '加载失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('加载客户列表失败:', error);
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				});
			}
			
			this.loading = false;
		},
		
		// 解析标签
		parseTags(tagsStr) {
			if (!tagsStr) return [];
			try {
				const tags = JSON.parse(tagsStr);
				return Array.isArray(tags) ? tags : [];
			} catch (e) {
				return [];
			}
		},
		
		// 加载更多
		loadMore() {
			if (this.loadmoreStatus === 'loadmore') {
				this.page++;
				this.loadList(false);
			}
		},
		
		// 搜索
		handleSearch() {
			this.loadList(true);
		},
		

		
		// 格式化时间
		formatTime(timestamp) {
			if (!timestamp || timestamp === 0) return '暂无';
			const date = new Date(timestamp * 1000);
			const now = new Date();
			const diff = now - date;
			
			if (diff < 86400000) { // 1天内
				const hours = Math.floor(diff / 3600000);
				if (hours < 1) {
					const minutes = Math.floor(diff / 60000);
					return minutes < 1 ? '刚刚' : `${minutes}分钟前`;
				}
				return `${hours}小时前`;
			} else if (diff < 172800000) { // 2天内
				return '昨天';
			} else {
				return (date.getMonth() + 1) + '-' + date.getDate();
			}
		},
		
		// 查看客户详情
		viewClientDetail(client) {
			uni.navigateTo({
				url: `/pages/market/client_detail?id=${client.id}`
			});
		},
				// 编辑客户
		editClient(client) {
			uni.navigateTo({
				url: `/pages/market/client_edit?id=${client.id}`
			});
		},
		

	}
}
</script>

<style lang="scss" scoped>
.container {
	background-color: #f5f5f5;
	min-height: 100vh;
	padding-bottom: 120rpx;
}

.search-bar {
	background-color: #fff;
	padding: 20rpx;
}



.client-list {
	padding: 20rpx;
}

.loading-container, .empty-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;
	
	.loading-text, .empty-text {
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #999;
	}
	
	.empty-icon {
		width: 120rpx;
		height: 120rpx;
		margin-bottom: 20rpx;
		opacity: 0.5;
	}
	
	.btn-primary {
		background-color: #2979ff;
		color: #fff;
		border: none;
		border-radius: 40rpx;
		font-size: 28rpx;
		margin-top: 30rpx;
		padding: 20rpx 40rpx;
	}
}

.client-item {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 32rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
	
	.client-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 20rpx;
		
		.client-info {
			flex: 1;
			display: flex;
			align-items: center;
			
			.client-logo {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				margin-right: 20rpx;
				background-color: #f5f5f5;
			}
			
			.client-text {
				flex: 1;
				
				.client-name {
					font-size: 32rpx;
					font-weight: 600;
					color: #333;
					margin-bottom: 8rpx;
				}
				
				.client-contact {
					font-size: 26rpx;
					color: #666;
				}
			}
		}
		
		.client-status {
			padding: 8rpx 16rpx;
			border-radius: 20rpx;
			font-size: 24rpx;
			white-space: nowrap;
			
			&.status-pending {
				background-color: #fff3cd;
				color: #856404;
			}
			
			&.status-contacted {
				background-color: #e6f3ff;
				color: #409eff;
			}
			
			&.status-following {
				background-color: #ffe6e6;
				color: #ff4757;
			}
			
			&.status-success {
				background-color: #d4edda;
				color: #155724;
			}
			
			&.status-invalid {
				background-color: #f8f9fa;
				color: #999;
			}
		}
		

	}
	
	.client-details {
		margin-bottom: 20rpx;
		
		.detail-row {
			display: flex;
			margin-bottom: 8rpx;
			font-size: 26rpx;
			
			.detail-label {
				color: #999;
				margin-right: 16rpx;
				min-width: 140rpx;
			}
			
			.detail-value {
				color: #333;
				flex: 1;
				
				&.text-orange {
					color: #ff6b35;
					font-weight: 600;
				}
			}
		}
	}
	
	.client-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-bottom: 20rpx;
		
		.tag {
			padding: 8rpx 16rpx;
			border-radius: 20rpx;
			font-size: 22rpx;
		}
	}
	

}
</style>