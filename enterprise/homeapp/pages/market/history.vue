<template>
	<view class="container">
		<!-- 筛选选项 -->
		<view class="filter-section">
			<view class="filter-tabs">
				<view class="filter-item" 
					:class="{ active: currentType === item.value }" 
					v-for="(item, index) in typeTabs" 
					:key="index"
					@click="changeTypeFilter(item.value)">
					{{ item.name }}
				</view>
			</view>
			
			<view class="time-filter">
				<u-picker 
					:show="showTimePicker"
					:columns="timeColumns"
					@confirm="onTimeConfirm"
					@cancel="showTimePicker = false"
				/>
				<view class="filter-button" @click="showTimePicker = true">
					<text>{{ currentTimeText }}</text>
					<u-icon name="arrow-down" size="24"></u-icon>
				</view>
			</view>
		</view>

		<!-- 操作历史列表 -->
		<view class="history-list">
			<view v-if="loading" class="loading-container">
				<u-loading-icon mode="spinner" size="40"></u-loading-icon>
				<text class="loading-text">加载中...</text>
			</view>
			
			<view v-else-if="list.length === 0" class="empty-container">
				<image src="/static/icon/m4.png" class="empty-icon" mode="aspectFit"></image>
				<text class="empty-text">暂无操作记录</text>
			</view>
			
			<view v-else>
				<view class="history-item" v-for="(item, index) in list" :key="item.id" @click="onHistoryItemClick(item)">
					<view class="history-header">
						<view class="action-icon" :class="item.actionIconClass">
							<u-icon :name="item.actionIconName" color="#fff" size="32"></u-icon>
						</view>
						<view class="history-info">
							<view class="history-title">{{ item.title }}</view>
							<view class="history-meta">
								<view class="action-type">{{ item.actionTypeName }}</view>
								<view class="target-type">{{ item.targetTypeName }}</view>
							</view>
						</view>
						<view class="history-time">{{ item.formattedTime }}</view>
					</view>
					
					<view class="history-content" v-if="item.content">
						{{ item.content }}
					</view>
					
					<!-- <view class="history-result" v-if="item.result">
						<view class="result-label">结果:</view>
						<view class="result-content">{{ item.result }}</view>
					</view>
					
					<view class="history-extra" v-if="item.extra_data && item.extra_data !== '{}'">
						<view class="extra-label">额外信息:</view>
						<view class="extra-content">{{ formatExtraData(item.extra_data) }}</view>
					</view> -->
				</view>
			</view>
		</view>

		<!-- 加载更多 -->
		<u-loadmore :status="loadmoreStatus" @loadmore="loadMore" v-if="list.length > 0" />
		

	</view>
</template>

<script>
import { getMarketHistory } from '@/utils/api.js'

export default {
	data() {
		return {
			currentType: '',
			currentTimeRange: 0,
			currentTimeText: '全部时间',
			loading: false,
			list: [],
			page: 1,
			pageSize: 20,
			total: 0,
			loadmoreStatus: 'loadmore',
			showTimePicker: false,
			targetType: '',
			targetId: 0,
			typeTabs: [
				{ name: '全部', value: '' },
				{ name: '需求', value: 'view' },
				{ name: '联系', value: 'contact' },
				// { name: '跟进', value: 'follow_up' },
				// { name: '报价', value: 'quote' },
				// { name: '成交', value: 'close_deal' },
				// { name: '备注', value: 'add_remark' }
			],
			timeColumns: [
				['全部时间', '今天', '近7天', '近30天', '近3个月']
			]
		}
	},
	
	onLoad(options) {
		if (options.target_type) {
			this.targetType = options.target_type;
		}
		if (options.target_id) {
			this.targetId = parseInt(options.target_id);
		}
		
		this.loadList(true);
	},
	
	onPullDownRefresh() {
		this.loadList(true);
		setTimeout(() => {
			uni.stopPullDownRefresh();
		}, 1000);
	},
	
	methods: {
		// 加载历史列表
		async loadList(refresh = false) {
			if (this.loading) return;
			
			if (refresh) {
				this.page = 1;
				this.list = [];
			}
			
			this.loading = true;
			
			try {
				const params = {
					page: this.page,
					page_size: this.pageSize
				};
				
				// 只添加有值的参数，避免传递 undefined
				if (this.currentType) {
					params.action_type = this.currentType;
				}
				if (this.targetType) {
					params.target_type = this.targetType;
				}
				if (this.targetId) {
					params.target_id = this.targetId;
				}
				
				// 添加时间范围参数
				Object.assign(params, this.getTimeRange());
				
				const response = await getMarketHistory(params);
				
				if (response.code === 0) {
					let newList = response.data.list || [];
					
					// 处理数据，添加计算属性以避免模板中的方法调用
					newList = newList.map(item => ({
						...item,
						actionIconClass: this.getActionIconClass(item.action_type),
						actionIconName: this.getActionIcon(item.action_type),
						actionTypeName: this.getActionTypeName(item.action_type),
						targetTypeName: this.getTargetTypeName(item.target_type),
						formattedTime: this.formatTime(item.create_time)
					}));
					
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
				console.error('加载历史记录失败:', error);
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				});
			}
			
			this.loading = false;
		},
		
		// 加载更多
		loadMore() {
			if (this.loadmoreStatus === 'loadmore') {
				this.page++;
				this.loadList(false);
			}
		},
		
		// 类型筛选
		changeTypeFilter(type) {
			this.currentType = type;
			this.loadList(true);
		},
		
		// 时间筛选确认
		onTimeConfirm(value) {
			const timeText = value.value[0];
			this.currentTimeText = timeText;
			
			const timeMap = {
				'全部时间': 0,
				'今天': 1,
				'近7天': 7,
				'近30天': 30,
				'近3个月': 90
			};
			this.currentTimeRange = timeMap[timeText] || 0;
			
			this.showTimePicker = false;
			this.loadList(true);
		},
		
		// 获取时间范围
		getTimeRange() {
			if (this.currentTimeRange === 0) {
				return {};
			}
			
			const endTime = Math.floor(Date.now() / 1000);
			const startTime = endTime - (this.currentTimeRange * 24 * 60 * 60);
			
			return {
				start_time: startTime,
				end_time: endTime
			};
		},
		

		// 获取操作类型名称
		getActionTypeName(actionType) {
			const typeMapping = {
				'view': '浏览',
				'contact': '联系',
				'follow_up': '跟进',
				'quote': '报价',
				'close_deal': '成交',
				'add_remark': '备注'
			};
			return typeMapping[actionType] || '其他';
		},
		
		// 获取目标类型名称
		getTargetTypeName(targetType) {
			const typeMapping = {
				'guest': '客户',
				'need': '需求',
				'demand': '需求',
				'task': '任务'
			};
			return typeMapping[targetType] || '其他';
		},
		
		// 获取操作图标
		getActionIcon(actionType) {
			const iconMap = {
				'view': 'eye',
				'contact': 'phone',
				'follow_up': 'arrow-up-right',
				'quote': 'attach',
				'close_deal': 'checkmark-circle',
				'add_remark': 'chatbox'
			};
			return iconMap[actionType] || 'information-circle';
		},
		
		// 获取操作图标样式
		getActionIconClass(actionType) {
			const classMap = {
				'view': 'icon-view',
				'contact': 'icon-contact',
				'follow_up': 'icon-follow',
				'quote': 'icon-quote',
				'close_deal': 'icon-deal',
				'add_remark': 'icon-remark'
			};
			return classMap[actionType] || 'icon-default';
		},
		
		// 格式化时间
		formatTime(timestamp) {
			if (!timestamp) return '';
			
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
				return '昨天 ' + String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
			} else {
				return (date.getMonth() + 1) + '-' + date.getDate() + ' ' + 
					   String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
			}
		},
		
		// 格式化额外数据
		formatExtraData(extraData) {
			try {
				const data = JSON.parse(extraData);
				if (typeof data === 'object') {
					return Object.keys(data).map(key => `${key}: ${data[key]}`).join(', ');
				}
				return extraData;
			} catch (e) {
				return extraData;
			}
		},
		
		// 历史记录项点击事件
		onHistoryItemClick(item) {
			// 如果是浏览需求记录，跳转到需求详情
			if (item.action_type === 'view' && item.target_type === 'demand' && item.target_id) {
				uni.navigateTo({
					url: `/pages/demand/detail?id=${item.target_id}`
				});
			}
			// 可以根据不同的操作类型和目标类型进行不同的跳转
			// 这里可以扩展其他类型的跳转逻辑
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	background-color: #f5f5f5;
	min-height: 100vh;
	padding-bottom: 40rpx;
}

.filter-section {
	background-color: #fff;
	padding: 20rpx;
	border-bottom: 1rpx solid #eee;
	
	.filter-tabs {
		display: flex;
		margin-bottom: 20rpx;
		overflow-x: auto;
		
		.filter-item {
			padding: 12rpx 24rpx;
			margin-right: 16rpx;
			background-color: #f8f9fa;
			border-radius: 40rpx;
			font-size: 28rpx;
			color: #666;
			white-space: nowrap;
			transition: all 0.3s;
			
			&.active {
				background-color: #2979ff;
				color: #fff;
			}
		}
	}
	
	.time-filter {
		.filter-button {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 16rpx 20rpx;
			background-color: #f8f9fa;
			border-radius: 8rpx;
			font-size: 28rpx;
			color: #666;
		}
	}
}

.history-list {
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
}

.history-item {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 32rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
	transition: transform 0.2s ease, box-shadow 0.2s ease;
	
	&:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
	}
	
	.history-header {
		display: flex;
		align-items: flex-start;
		margin-bottom: 16rpx;
		
		.action-icon {
			width: 60rpx;
			height: 60rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 20rpx;
			
			&.icon-view {
				background-color: #2979ff;
			}
			
			&.icon-contact {
				background-color: #2979ff;
			}
			
			&.icon-follow {
				background-color: #ff9500;
			}
			
			&.icon-quote {
				background-color: #8a2be2;
			}
			
			&.icon-deal {
				background-color: #19be6b;
			}
			
			&.icon-remark {
				background-color: #ff6b35;
			}
			
			&.icon-default {
				background-color: #00bcd4;
			}
		}
		
		.history-info {
			flex: 1;
			
			.history-title {
				font-size: 32rpx;
				font-weight: normal;
				color: #333;
				margin-bottom: 8rpx;
			}
			
			.history-meta {
				display: flex;
				gap: 16rpx;
				
				.action-type, .target-type {
					padding: 4rpx 12rpx;
					background-color: #f0f4ff;
					color: #2979ff;
					border-radius: 16rpx;
					font-size: 22rpx;
				}
			}
		}
		
		.history-time {
			font-size: 24rpx;
			color: #999;
			margin-top: 8rpx;
		}
	}
	
	.history-content {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		margin-bottom: 16rpx;
		padding: 16rpx;
		background-color: #f8f9fa;
		border-radius: 8rpx;
	}
	
	.history-result, .history-extra {
		display: flex;
		margin-bottom: 12rpx;
		font-size: 26rpx;
		
		.result-label, .extra-label {
			color: #999;
			margin-right: 16rpx;
			min-width: 80rpx;
		}
		
		.result-content, .extra-content {
			color: #333;
			flex: 1;
		}
	}
}


</style>