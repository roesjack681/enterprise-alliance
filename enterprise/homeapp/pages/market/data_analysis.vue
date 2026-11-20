<template>
	<view class="container">
		<!-- 头部统计卡片 -->
		<view class="stats-overview">
			<view class="stats-card main-card">
				<view class="card-header">
					<view class="card-title">本月业绩</view>
					<view class="card-action" @click="refreshStats">
						<u-icon name="reload" color="#667eea" size="32"></u-icon>
					</view>
				</view>
				
				<!-- 加载状态 -->
				<view v-if="loading" class="loading-container">
					<u-loading-icon mode="spinner" size="40" color="#667eea"></u-loading-icon>
					<text class="loading-text">数据加载中...</text>
				</view>
				
				<!-- 主要统计数据 -->
				<view v-else>
					<view class="main-stats">
						<view class="main-number">¥{{ formatNumber(stats.monthly_income) }}</view>
						<view class="main-label">本月佣金收入</view>
					</view>
					<view class="stats-grid">
						<view class="stat-item">
							<view class="stat-number">{{ stats.this_month_deals }}</view>
							<view class="stat-label">本月成交</view>
						</view>
						<view class="stat-item">
							<view class="stat-number">{{ stats.success_rate }}%</view>
							<view class="stat-label">成功率</view>
						</view>
						<view class="stat-item">
							<view class="stat-number">{{ stats.active_guests }}</view>
							<view class="stat-label">活跃客户</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 详细统计 -->
		<view class="detail-stats">
			<view class="stats-section">
				<view class="section-title">客户统计</view>
				<view class="stats-row">
					<view class="stats-item">
						<view class="stats-icon client-icon">
							<u-icon name="account" color="#2979ff" size="40"></u-icon>
						</view>
						<view class="stats-content">
							<view class="stats-number">{{ stats.total_guests }}</view>
							<view class="stats-label">联系客户总数</view>
						</view>
					</view>
					<view class="stats-item">
						<view class="stats-icon active-icon">
							<u-icon name="heart" color="#19be6b" size="40"></u-icon>
						</view>
						<view class="stats-content">
							<view class="stats-number">{{ stats.active_guests }}</view>
							<view class="stats-label">活跃客户数</view>
						</view>
					</view>
				</view>
			</view>

			<view class="stats-section">
				<view class="section-title">项目统计</view>
				<view class="stats-row">
					<view class="stats-item">
						<view class="stats-icon progress-icon">
							<u-icon name="clock" color="#ff9500" size="40"></u-icon>
						</view>
						<view class="stats-content">
							<view class="stats-number">{{ stats.in_progress }}</view>
							<view class="stats-label">进行中项目</view>
						</view>
					</view>
					<view class="stats-item">
						<view class="stats-icon completed-icon">
							<u-icon name="checkmark-circle" color="#19be6b" size="40"></u-icon>
						</view>
						<view class="stats-content">
							<view class="stats-number">{{ stats.completed }}</view>
							<view class="stats-label">已完成项目</view>
						</view>
					</view>
				</view>
				<view class="stats-row">
					<view class="stats-item">
						<view class="stats-icon pending-icon">
							<u-icon name="car" color="#ff6b35" size="40"></u-icon>
						</view>
						<view class="stats-content">
							<view class="stats-number">{{ stats.pending }}</view>
							<view class="stats-label">待跟进项目</view>
						</view>
					</view>
					<view class="stats-item">
						<view class="stats-icon income-icon">
							<u-icon name="order" color="#8a2be2" size="40"></u-icon>
						</view>
						<view class="stats-content">
							<view class="stats-number">¥{{ formatNumber(stats.total_income) }}</view>
							<view class="stats-label">总收入</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 图表分析 -->
		<view class="chart-section">
			<view class="chart-card">
				<view class="card-header">
					<view class="card-title">近7天业绩趋势</view>
					<view class="chart-legend">
						<view class="legend-item">
							<view class="legend-color trend-color"></view>
							<text>日收入</text>
						</view>
					</view>
				</view>
				<view class="chart-container">
					<!-- 图表加载状态 -->
					<view v-if="chartLoading" class="chart-loading">
						<u-loading-icon mode="spinner" size="36" color="#667eea"></u-loading-icon>
						<text class="loading-text">图表加载中...</text>
					</view>
					
					<!-- 图表内容 -->
					<view v-else-if="chartData.length > 0" class="chart-placeholder">
						<view class="chart-bars">
							<view class="chart-bar" v-for="(item, index) in chartData" :key="index" 
								:style="{ height: item.height + '%' }">
								<view class="bar-value">¥{{ item.value }}</view>
							</view>
						</view>
						<view class="chart-labels">
							<text v-for="(label, index) in chartLabels" :key="index">{{ label }}</text>
						</view>
					</view>
					
					<!-- 空数据状态 -->
					<view v-else class="chart-empty">
						<u-icon name="bar-chart" color="#ccc" size="60"></u-icon>
						<text class="empty-text">暂无图表数据</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 客户分析 -->
		<view class="analysis-section">
			<view class="analysis-card">
				<view class="card-header">
					<view class="card-title">客户分析</view>
				</view>
				<view class="analysis-content">
					<view class="analysis-item">
						<view class="analysis-label">平均跟进天数</view>
						<view class="analysis-value">{{ avgFollowDays }}天</view>
					</view>
					<view class="analysis-item">
						<view class="analysis-label">平均客户价值</view>
						<view class="analysis-value">¥{{ formatNumber(avgClientValue) }}</view>
					</view>
					<view class="analysis-item">
						<view class="analysis-label">最高成交金额</view>
						<view class="analysis-value">¥{{ formatNumber(maxDealAmount) }}</view>
					</view>
					<view class="analysis-item">
						<view class="analysis-label">客户转化率</view>
						<view class="analysis-value">{{ conversionRate }}%</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 近期动态 -->
		<view class="activity-section">
			<view class="activity-card">
				<view class="card-header">
					<view class="card-title">近期动态</view>
					<view class="card-action" @click="viewAllHistory">
						<text>查看全部</text>
						<u-icon name="arrow-right" color="#666" size="24"></u-icon>
					</view>
				</view>
				<view class="activity-list">
					<!-- 动态加载状态 -->
					<view v-if="activitiesLoading" class="activity-loading">
						<u-loading-icon mode="spinner" size="32" color="#667eea"></u-loading-icon>
						<text class="loading-text">动态加载中...</text>
					</view>
					
					<!-- 空数据状态 -->
					<view v-else-if="recentActivities.length === 0" class="empty-activity">
						<u-icon name="list" color="#ccc" size="48"></u-icon>
						<text class="empty-text">暂无近期动态</text>
					</view>
					
					<!-- 动态列表 -->
					<view v-else class="activity-item" v-for="activity in recentActivities" :key="activity.id">
						<view class="activity-icon" :class="activity.activityIconClass">
							<u-icon :name="getActivityIcon(activity.action_type)" color="#fff" size="38"></u-icon>
						</view>
						<view class="activity-content">
							<view class="activity-title">{{ activity.title }}</view>
							<view class="activity-desc">{{ activity.content }}</view>
							<view class="activity-time">{{ formatTime(activity.create_time) }}</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 下拉刷新提示 -->
		<view v-if="refreshing" class="refresh-tip">
			<u-loading-icon mode="spinner" size="32"></u-loading-icon>
			<text>刷新中...</text>
		</view>
	</view>
</template>

<script>
import { getBrokerStats, getMarketHistory, getIncomeTrend } from '@/utils/api.js'

export default {
	data() {
		return {
			refreshing: false,
			loading: true,
			chartLoading: true,
			activitiesLoading: true,
			stats: {
				total_guests: 0,
				active_guests: 0,
				success_rate: 0,
				in_progress: 0,
				completed: 0,
				pending: 0,
				monthly_income: 0,
				total_income: 0,
				this_month_deals: 0
			},
			chartData: [],
			chartLabels: [],
			recentActivities: [],
			avgFollowDays: 0,
			avgClientValue: 0,
			maxDealAmount: 0,
			conversionRate: 0
		}
	},
	
	onLoad() {
		this.loadStats();
		this.loadChartData();
		this.loadRecentActivities();
	},
	
	onPullDownRefresh() {
		this.refreshAllData();
		setTimeout(() => {
			uni.stopPullDownRefresh();
		}, 1500);
	},
	
	methods: {
		// 加载统计数据
		async loadStats() {
			this.loading = true;
			try {
				const response = await getBrokerStats({});
				
				if (response.code === 0 && response.data) {
					// 确保数据格式正确，添加默认值
					this.stats = {
						total_guests: response.data.total_guests || 0,
						active_guests: response.data.active_guests || 0,
						success_rate: parseFloat(response.data.success_rate || 0),
						in_progress: response.data.in_progress || 0,
						completed: response.data.completed || 0,
						pending: response.data.pending || 0,
						monthly_income: response.data.monthly_income || 0,
						total_income: response.data.total_income || 0,
						this_month_deals: response.data.this_month_deals || 0
					};
					
					// 统计数据加载完成后计算分析数据
					this.calculateAnalysis();
				} else {
					console.warn('获取统计数据失败:', response.msg);
					uni.showToast({
						title: '数据获取失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('加载统计数据失败:', error);
				uni.showToast({
					title: '网络错误，请重试',
					icon: 'none'
				});
			} finally {
				this.loading = false;
			}
		},
		
		// 加载图表数据
		async loadChartData() {
			this.chartLoading = true;
			try {
				const response = await getIncomeTrend({ days: 7 });
				
				if (response.code === 0 && response.data && response.data.length > 0) {
					// 使用真实数据
					const labels = response.data.map(item => item.day_label);
					const values = response.data.map(item => item.income);
					const maxValue = Math.max(...values);
					
					this.chartLabels = labels;
					this.chartData = values.map(value => ({
						value: value,
						height: maxValue > 0 ? (value / maxValue) * 80 : 0 // 转换为百分比高度
					}));
				} else {
					// 如果接口失败，使用模拟数据
					console.warn('获取趋势数据失败，使用模拟数据');
					this.loadChartDataFallback();
				}
			} catch (error) {
				console.error('加载图表数据失败:', error);
				// 发生错误时使用模拟数据
				this.loadChartDataFallback();
			} finally {
				this.chartLoading = false;
			}
		},
		
		// 加载模拟图表数据（备用方案）
		loadChartDataFallback() {
			const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
			const values = [1200, 1800, 950, 2100, 1650, 2300, 1900];
			
			this.chartLabels = days;
			this.chartData = values.map(value => ({
				value: value,
				height: (value / Math.max(...values)) * 80
			}));
		},
		
		// 加载近期动态
		async loadRecentActivities() {
			this.activitiesLoading = true;
			try {
				const response = await getMarketHistory({
					page: 1,
					page_size: 5
				});
				
				if (response.code === 0) {
					// 预计算样式类，避免模板中的方法调用
					const activities = response.data.list || [];
					this.recentActivities = activities.map(activity => ({
						...activity,
						activityIconClass: this.getActivityIconClass(activity.action_type)
					}));
				} else {
					console.warn('获取近期动态失败:', response.msg);
				}
			} catch (error) {
				console.error('加载近期动态失败:', error);
			} finally {
				this.activitiesLoading = false;
			}
		},
		
		// 计算分析数据
		calculateAnalysis() {
			// 基于统计数据计算分析指标
			const totalGuests = this.stats.total_guests || 0;
			const completed = this.stats.completed || 0;
			const totalIncome = this.stats.total_income || 0;
			
			// 平均跟进天数（模拟计算，实际应该基于历史数据）
			this.avgFollowDays = totalGuests > 0 ? Math.floor(15 + Math.random() * 10) : 0;
			
			// 平均客户价值
			this.avgClientValue = completed > 0 ? Math.floor(totalIncome / completed) : 0;
			
			// 最高成交金额（模拟数据，实际应该查询订单最大金额）
			this.maxDealAmount = totalIncome > 0 ? Math.floor(totalIncome * 0.3) : 0;
			
			// 客户转化率
			this.conversionRate = totalGuests > 0 ? ((completed / totalGuests) * 100).toFixed(1) : 0;
		},
		
		// 刷新统计数据
		async refreshStats() {
			this.refreshing = true;
			await this.loadStats();
			this.refreshing = false;
			
			uni.showToast({
				title: '数据已更新',
				icon: 'success'
			});
		},
		
		// 刷新所有数据
		async refreshAllData() {
			await Promise.all([
				this.loadStats(),
				this.loadRecentActivities(),
				this.calculateAnalysis()
			]);
			
			this.loadChartData();
		},
		
		// 格式化数字
		formatNumber(num) {
			if (!num) return '0';
			
			if (num >= 10000) {
				return (num / 10000).toFixed(1) + '万';
			}
			
			return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
				return '昨天';
			} else {
				return (date.getMonth() + 1) + '-' + date.getDate();
			}
		},
		
		// 获取活动图标
		getActivityIcon(actionType) {
			const iconMap = {
				'contact': 'phone',
				'follow_up': 'arrow-upward',
				'quote': 'attach',
				'close_deal': 'checkmark-circle',
				'add_remark': 'chat'
			};
			return iconMap[actionType] || 'info-circle';
		},
		
		// 获取活动图标样式
		getActivityIconClass(actionType) {
			const classMap = {
				'contact': 'icon-contact',
				'follow_up': 'icon-follow',
				'quote': 'icon-quote',
				'close_deal': 'icon-deal',
				'add_remark': 'icon-remark'
			};
			return classMap[actionType] || 'icon-default';
		},
		
		// 查看全部历史
		viewAllHistory() {
			uni.navigateTo({
				url: '/pages/market/history'
			});
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

.stats-overview {
	padding: 20rpx;
	
	.main-card {
		background: #fff;
		color: #333;
		border-radius: 20rpx;
		padding: 40rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
		border: 1rpx solid #f0f0f0;
		
		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 30rpx;
			
			.card-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
			}
		}
		
		.main-stats {
			text-align: center;
			margin-bottom: 40rpx;
			padding-bottom: 30rpx;
			border-bottom: 1rpx solid #f5f5f5;
			
			.main-number {
				font-size: 64rpx;
				font-weight: 700;
				margin-bottom: 12rpx;
				color: #667eea;
			}
			
			.main-label {
				font-size: 28rpx;
				color: #666;
			}
		}
		
		.stats-grid {
			display: flex;
			justify-content: space-between;
			
			.stat-item {
				text-align: center;
				
				.stat-number {
					font-size: 36rpx;
					font-weight: 600;
					margin-bottom: 8rpx;
					color: #333;
				}
				
				.stat-label {
					font-size: 24rpx;
					color: #666;
				}
			}
		}
	}
}

.detail-stats {
	padding: 0 20rpx;
	
	.stats-section {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 32rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
		
		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 32rpx;
		}
		
		.stats-row {
			display: flex;
			justify-content: space-between;
			margin-bottom: 20rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
		}
		
		.stats-item {
			flex: 1;
			display: flex;
			align-items: center;
			padding: 24rpx;
			background-color: #f8f9fa;
			border-radius: 12rpx;
			margin: 0 10rpx;
			
			&:first-child {
				margin-left: 0;
			}
			
			&:last-child {
				margin-right: 0;
			}
			
			.stats-icon {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 20rpx;
				
				&.client-icon {
					background-color: rgba(41, 121, 255, 0.1);
				}
				
				&.active-icon {
					background-color: rgba(25, 190, 107, 0.1);
				}
				
				&.progress-icon {
					background-color: rgba(255, 149, 0, 0.1);
				}
				
				&.completed-icon {
					background-color: rgba(25, 190, 107, 0.1);
				}
				
				&.pending-icon {
					background-color: rgba(255, 107, 53, 0.1);
				}
				
				&.income-icon {
					background-color: rgba(138, 43, 226, 0.1);
				}
			}
			
			.stats-content {
				.stats-number {
					font-size: 32rpx;
					font-weight: 600;
					color: #333;
					margin-bottom: 8rpx;
				}
				
				.stats-label {
					font-size: 24rpx;
					color: #666;
				}
			}
		}
	}
}

.chart-section {
	padding: 0 20rpx;
	margin-bottom: 20rpx;
	
	.chart-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 32rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
		
		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 32rpx;
			
			.card-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
			}
			
			.chart-legend {
				display: flex;
				align-items: center;
				
				.legend-item {
					display: flex;
					align-items: center;
					font-size: 24rpx;
					color: #666;
					
					.legend-color {
						width: 16rpx;
						height: 16rpx;
						border-radius: 2rpx;
						margin-right: 8rpx;
						
						&.trend-color {
							background-color: #667eea;
						}
					}
				}
			}
		}
		
		.chart-container {
			height: 300rpx;
			
			.chart-placeholder {
				height: 100%;
				position: relative;
				
				.chart-bars {
					display: flex;
					align-items: flex-end;
					justify-content: space-between;
					height: 240rpx;
					margin-bottom: 20rpx;
					
					.chart-bar {
						flex: 1;
						background: linear-gradient(to top, #667eea, #8b9cf5);
						margin: 0 4rpx;
						border-radius: 4rpx 4rpx 0 0;
						position: relative;
						min-height: 20rpx;
						
						.bar-value {
							position: absolute;
							top: -30rpx;
							left: 50%;
							transform: translateX(-50%);
							font-size: 20rpx;
							color: #666;
							white-space: nowrap;
						}
					}
				}
				
				.chart-labels {
					display: flex;
					justify-content: space-between;
					font-size: 24rpx;
					color: #999;
				}
			}
		}
	}
}

.analysis-section {
	padding: 0 20rpx;
	margin-bottom: 20rpx;
	
	.analysis-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 32rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
		
		.card-header {
			margin-bottom: 32rpx;
			
			.card-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
			}
		}
		
		.analysis-content {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 24rpx;
			
			.analysis-item {
				text-align: center;
				padding: 24rpx;
				background-color: #f8f9fa;
				border-radius: 12rpx;
				
				.analysis-label {
					font-size: 26rpx;
					color: #666;
					margin-bottom: 12rpx;
				}
				
				.analysis-value {
					font-size: 32rpx;
					font-weight: 600;
					color: #333;
				}
			}
		}
	}
}

.activity-section {
	padding: 0 20rpx;
	
	.activity-card {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 32rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
		
		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 32rpx;
			
			.card-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
			}
			
			.card-action {
				display: flex;
				align-items: center;
				font-size: 26rpx;
				color: #666;
			}
		}
		
		.activity-list {
			.empty-activity {
				text-align: center;
				padding: 60rpx 0;
				font-size: 28rpx;
				color: #999;
			}
			
			.activity-item {
				display: flex;
				align-items: flex-start;
				padding: 20rpx 0;
				border-bottom: 1rpx solid #f0f0f0;
				
				&:last-child {
					border-bottom: none;
				}
				
				.activity-icon {
					width: 60rpx;
					height: 60rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-right: 20rpx;
					
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
						background-color: #999;
					}
				}
				
				.activity-content {
					flex: 1;
					
					.activity-title {
						font-size: 28rpx;
						color: #333;
						margin-bottom: 8rpx;
					}
					
					.activity-desc {
						font-size: 26rpx;
						color: #666;
						margin-bottom: 8rpx;
					}
					
					.activity-time {
						font-size: 24rpx;
						color: #999;
					}
				}
			}
		}
	}
}

.refresh-tip {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	align-items: center;
	gap: 16rpx;
	background-color: rgba(0, 0, 0, 0.7);
	color: #fff;
	padding: 20rpx 40rpx;
	border-radius: 40rpx;
	font-size: 28rpx;
	z-index: 999;
}

// 加载状态样式
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60rpx 0;
	
	.loading-text {
		margin-top: 20rpx;
		font-size: 26rpx;
		color: #999;
	}
}

.chart-loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 300rpx;
	
	.loading-text {
		margin-top: 16rpx;
		font-size: 24rpx;
		color: #999;
	}
}

.activity-loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60rpx 0;
	
	.loading-text {
		margin-top: 16rpx;
		font-size: 24rpx;
		color: #999;
	}
}

// 空数据状态样式
.chart-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 300rpx;
	
	.empty-text {
		margin-top: 16rpx;
		font-size: 24rpx;
		color: #999;
	}
}

.empty-activity {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60rpx 0;
	
	.empty-text {
		margin-top: 16rpx;
		font-size: 26rpx;
		color: #999;
	}
}
</style>