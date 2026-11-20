<template>
	<view class="container">
		<!-- 头部搜索栏 -->
		<view class="search-bar">
			<u-search 
				placeholder="搜索需求标题或企业" 
				v-model="searchKeyword" 
				@search="handleSearch" 
				@custom="handleSearch" 
				bg-color="#f5f5f5" 
				height="80" 
				margin="20rpx" 
				:show-action="false"
			/>
		</view>

		<!-- 筛选标签 -->
		<view class="filter-tabs">
			<scroll-view class="filter-scroll" scroll-x>
				<view class="filter-container">
					<view class="filter-item" 
						:class="{ active: currentStatus === item.value }" 
						v-for="(item, index) in statusTabs" 
						:key="index"
						@click="changeStatusFilter(item.value)">
						{{ item.name }}
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 需求列表 -->
		<view class="need-list">
			<view v-if="loading" class="loading-container">
				<u-loading-icon mode="spinner" size="40"></u-loading-icon>
				<text class="loading-text">加载中...</text>
			</view>			
			<view v-else-if="list.length === 0" class="empty-container">
				<image src="/static/icon/m4.png" class="empty-icon" mode="aspectFit"></image>
				<text class="empty-text">暂无跟进需求</text>			
			</view>
			
			<view v-else>
				<view class="need-item" v-for="(item, index) in list" :key="item.id" ><!---@click="viewNeedDetail(item)"-->
					<view class="need-header">
						<view class="need-info">
							<view class="need-title">{{ item.demand_title || '未命名需求' }}</view>
							<view class="need-type">{{ getTypeName(item.demand_type) }}</view>
						</view>
						<view class="need-status" :class="item.statusClass">{{ item.statusText }}</view>
					</view>
					
					<view class="need-details">
						<view class="detail-row">
							<text class="detail-label">企业:</text>
							<text class="detail-value">{{ getClientName(item.entity_id) }}</text>
						</view>
						<view class="detail-row" v-if="item.budget_price > 0">
							<text class="detail-label">预算:</text>
							<text class="detail-value text-orange">¥{{ item.budget_price }}</text>
						</view>
						<view class="detail-row" v-if="item.quoted_price > 0">
							<text class="detail-label">我的报价:</text>
							<text class="detail-value text-blue">¥{{ item.quoted_price }}</text>
						</view>
						<view class="detail-row">
							<text class="detail-label">成功概率:</text>
							<text class="detail-value">{{ item.success_probability }}%</text>
						</view>
						<view class="detail-row" v-if="item.next_follow_time > 0">
							<text class="detail-label">下次跟进:</text>
							<text class="detail-value">{{ formatTime(item.next_follow_time) }}</text>
						</view>
					</view>
					
					<view class="need-remark" v-if="item.remark">
						<text class="remark-label">跟进备注:</text>
						<text class="remark-content">{{ item.remark }}</text>
					</view>
					
					<view class="need-actions">
						<view class="priority-tag" :class="item.priorityClass">
							{{ getPriorityText(item.priority) }}
						</view>
						<view class="action-buttons">
							<u-button 
								size="small" 
								type="primary" 
								plain 
								@click="updateQuote(item)"
								:custom-style="{ marginRight: '16rpx' }">
								报价
							</u-button>
							<u-button 
								size="small" 
								type="primary" 
								@click="addFollowUp(item)">
								跟进
							</u-button>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 加载更多 -->
		<u-loadmore :status="loadmoreStatus" @loadmore="loadMore" v-if="list.length > 0" />
		
		<!-- 报价弹窗 -->
		<u-popup :show="showQuoteModal" mode="center" border-radius="20">
			<view class="quote-modal">
				<view class="modal-title">更新报价</view>
				<view class="quote-form">
					<view class="form-item">
						<view class="label">报价金额</view>
						<u-input 
							v-model="quoteForm.quoted_price" 
							placeholder="请输入报价金额"
							type="number"
							:clearable="true"
						/>
					</view>
					<view class="form-item">
						<view class="label">成功概率 (%)</view>
						<u-input 
							v-model="quoteForm.success_probability" 
							placeholder="请输入成功概率"
							type="number"
							:clearable="true"
						/>
					</view>
					<view class="form-item">
						<view class="label">备注说明</view>
						<u-textarea 
							v-model="quoteForm.remark" 
							placeholder="请输入备注说明"
							:count="true"
							maxlength="500"
							height="120"
						/>
					</view>
				</view>
				<view class="modal-actions">
					<u-button 
						class="cancel-btn" 
						@click="showQuoteModal = false"
						size="small"
						type="info"
						plain
						:custom-style="{ height: '70rpx', fontSize: '26rpx' }">
						取消
					</u-button>
					<u-button 
						class="confirm-btn" 
						@click="submitQuote" 
						:loading="submitting"
						size="small"
						type="primary"
						:custom-style="{ height: '70rpx', fontSize: '26rpx' }">
						确定
					</u-button>
				</view>
			</view>
		</u-popup>
		
		<!-- 跟进弹窗 -->
		<u-popup :show="showFollowUpModal" mode="center" border-radius="20">
			<view class="quote-modal">
				<view class="modal-title">更新跟进</view>
				<view class="quote-form">
					<view class="form-item">
						<view class="label">跟进状态</view>
						<u-radio-group v-model="followUpForm.status">
							<view class="status-options">
								<u-radio 
									v-for="(item, index) in statusTabs.slice(1)" 
									:key="index"
									:name="item.value"
									:label="item.name"
									:custom-style="{ marginBottom: '20rpx', marginRight: '30rpx' }"
									:size="28"
									:icon-size="20"
									:label-size="30"
									active-color="#2979ff">
								</u-radio>
							</view>
						</u-radio-group>
					</view>
					<view class="form-item">
						<view class="label">跟进备注</view>
						<u-textarea 
							v-model="followUpForm.remark" 
							placeholder="请输入跟进备注"
							:count="true"
							maxlength="500"
							height="120"
						/>
					</view>
				</view>
				<view class="modal-actions">
					<u-button 
						class="cancel-btn" 
						@click="showFollowUpModal = false"
						size="small"
						type="info"
						plain
						:custom-style="{ height: '70rpx', fontSize: '26rpx' }">
						取消
					</u-button>
					<u-button 
						class="confirm-btn" 
						@click="submitFollowUp" 
						:loading="submitting"
						size="small"
						type="primary"
						:custom-style="{ height: '70rpx', fontSize: '26rpx' }">
						确定
					</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import { getMarketNeedList, updateMarketNeed, getMarketGuestList } from '@/utils/api.js'

export default {
	data() {
		return {
			searchKeyword: '',
			currentStatus: '',
			loading: false,
			list: [],
			page: 1,
			pageSize: 20,
			total: 0,
			loadmoreStatus: 'loadmore',
			clientMap: {}, // 客户ID映射
			showQuoteModal: false,
			showFollowUpModal: false,
			submitting: false,
			currentNeed: null,
			quoteForm: {
				quoted_price: '',
				success_probability: '',
				remark: ''
			},
			followUpForm: {
				status: '',
				remark: ''
			},
			statusTabs: [
				{ name: '全部', value: '' },
				{ name: '关注', value: 0 },
				{ name: '已联系', value: 1 },
				{ name: '报价', value: 2 },
				{ name: '跟进中', value: 3 },
				{ name: '成交', value: 4 },
				{ name: '失败', value: 5 }
			],
			statusMapping: {
				0: { class: 'status-focus', text: '关注' },
				1: { class: 'status-contacted', text: '已联系' },
				2: { class: 'status-quoted', text: '报价' },
				3: { class: 'status-following', text: '跟进中' },
				4: { class: 'status-success', text: '成交' },
				5: { class: 'status-failed', text: '失败' },
				// 兼容字符串格式（旧数据）
				'关注': { class: 'status-focus', text: '关注' },
				'已联系': { class: 'status-contacted', text: '已联系' },
				'报价': { class: 'status-quoted', text: '报价' },
				'跟进中': { class: 'status-following', text: '跟进中' },
				'成交': { class: 'status-success', text: '成交' },
				'失败': { class: 'status-failed', text: '失败' }
			}
		}
	},
	
	onLoad() {
		this.loadClientMap();
		this.loadList(true);
	},
	
	onShow() {
		// 从详情页面返回时刷新列表
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
		// 加载客户映射
		async loadClientMap() {
			try {
				const response = await getMarketGuestList({ page: 1, page_size: 1000 });
				if (response.code === 0) {
					const clients = response.data.list || [];
					this.clientMap = {};
					clients.forEach(client => {
						this.clientMap[client.entity_id] = client.enterprise_name;
					});
				}
			} catch (error) {
				console.error('加载客户映射失败:', error);
			}
		},
		
		// 加载需求列表
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
				
				// 状态参数处理 - 只有当状态是有效数值时才传递
				if (this.currentStatus !== '' && this.currentStatus !== null && this.currentStatus !== undefined && this.currentStatus >= 0) {
					const statusValue = typeof this.currentStatus === 'string' ? parseInt(this.currentStatus) : this.currentStatus;
					if (!isNaN(statusValue) && statusValue >= 0 && statusValue <= 5) {
						params.status = statusValue;
					}
				}
				
				const response = await getMarketNeedList(params);
				
				if (response.code === 0) {
					let newList = response.data.list || [];
					
					// 处理数据 - 添加状态样式和优先级样式
					newList = newList.map(item => {
						const statusInfo = this.statusMapping[item.status] || { class: 'status-default', text: item.status };
						return {
							...item,
							statusClass: statusInfo.class,
							statusText: statusInfo.text,
							// 预计算优先级样式类，避免模板中的方法调用
							priorityClass: this.getPriorityClass(item.priority)
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
				console.error('加载需求列表失败:', error);
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
		
		// 搜索
		handleSearch() {
			this.loadList(true);
		},
		
		// 状态筛选
		changeStatusFilter(status) {
			this.currentStatus = status;
			this.loadList(true);
		},
		
		// 获取需求类型名称
		getTypeName(type) {
			const typeMapping = {
				1: "需求",
				2: "求购", 
				3: "货物",
				4: "服务",
				5: "易货"
			};
			return typeMapping[type] || "未知类型";
		},
		
		// 获取客户名称
		getClientName(entityId) {
			return this.clientMap[entityId] || '未知企业';
		},
		
		// 获取优先级样式
		getPriorityClass(priority) {
			const mapping = {
				1: 'priority-low',
				2: 'priority-medium',
				3: 'priority-high',
				4: 'priority-urgent'
			};
			return mapping[priority] || 'priority-low';
		},
		
		// 获取优先级文本
		getPriorityText(priority) {
			const mapping = {
				1: '低',
				2: '中',
				3: '高',
				4: '紧急'
			};
			return mapping[priority] || '低';
		},
		
		// 格式化时间
		formatTime(timestamp) {
			if (!timestamp || timestamp === 0) return '暂无';
			const date = new Date(timestamp * 1000);
			return (date.getMonth() + 1) + '-' + date.getDate() + ' ' +
				   String(date.getHours()).padStart(2, '0') + ':' + 
				   String(date.getMinutes()).padStart(2, '0');
		},
		
		// 查看需求详情
		viewNeedDetail(need) {
			console.log('点击需求项，跳转到详情页');
			uni.navigateTo({
				url: `/pages/market/need_detail?id=${need.id}`
			});
		},
		

		// 更新报价
		updateQuote(need) {
			console.log('打开报价弹窗');
			this.currentNeed = need;
			this.quoteForm = {
				quoted_price: need.quoted_price || '',
				success_probability: need.success_probability || '',
				remark: need.remark || ''
			};
			this.showQuoteModal = true;
		},
		
		// 提交报价
		async submitQuote() {
			if (!this.quoteForm.quoted_price) {
				uni.showToast({
					title: '请输入报价金额',
					icon: 'none'
				});
				return;
			}
			
			this.submitting = true;
			
			try {
				const submitData = {
					id: this.currentNeed.id,
					quoted_price: parseFloat(this.quoteForm.quoted_price),
					success_probability: parseInt(this.quoteForm.success_probability) || 0,
					remark: this.quoteForm.remark,
					status: 2, // 2 表示"报价"状态
					update_time: Math.floor(Date.now() / 1000)
				};
				
				const response = await updateMarketNeed(submitData);
				
				if (response.code === 0) {
					uni.showToast({
						title: '报价更新成功',
						icon: 'success'
					});
					
					this.showQuoteModal = false;
					this.loadList(true); // 刷新列表
				} else {
					uni.showToast({
						title: response.msg || '更新失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('更新报价失败:', error);
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				});
			}
			
			this.submitting = false;
		},
		
		// 添加跟进记录
		addFollowUp(need) {
			console.log('打开跟进弹窗');
			this.currentNeed = need;
			this.followUpForm = {
				status: need.status || 0,
				remark: need.remark || ''
			};
			this.showFollowUpModal = true;
		},
		
		// 提交跟进
		async submitFollowUp() {
			if (!this.followUpForm.remark.trim()) {
				uni.showToast({
					title: '请输入跟进备注',
					icon: 'none'
				});
				return;
			}
			
			this.submitting = true;
			
			try {
				const submitData = {
					id: this.currentNeed.id,
					status: parseInt(this.followUpForm.status),
					remark: this.followUpForm.remark.trim(),
					update_time: Math.floor(Date.now() / 1000)
				};
				
				const response = await updateMarketNeed(submitData);
				
				if (response.code === 0) {
					uni.showToast({
						title: '跟进更新成功',
						icon: 'success'
					});
					
					this.showFollowUpModal = false;
					this.loadList(true); // 刷新列表
				} else {
					uni.showToast({
						title: response.msg || '更新失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('更新跟进失败:', error);
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				});
			}
			
			this.submitting = false;
		},
		
		// 浏览需求
		goToBrowseNeeds() {
			uni.navigateTo({
				url: '/pages/demand/list'
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

.search-bar {
	background-color: #fff;
	padding: 20rpx;
}

.filter-tabs {
	background-color: #fff;
	padding: 0 20rpx 20rpx;
	border-bottom: 1rpx solid #eee;
	
	.filter-scroll {
		white-space: nowrap;
		
		.filter-container {
			display: inline-flex;
			
			.filter-item {
				display: inline-block;
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
	}
}

.need-list {
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

.need-item {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 32rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	border: 1rpx solid #f0f0f0;
	
			.need-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 20rpx;
		
		.need-info {
			flex: 1;
			
			.need-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 8rpx;
			}
			
			.need-type {
				display: inline-block;
				padding: 4rpx 12rpx;
				background-color: #2979ff;
				color: #fff;
				border-radius: 16rpx;
				font-size: 22rpx;
			}
		}
		
		.need-status {
			padding: 8rpx 16rpx;
			border-radius: 20rpx;
			font-size: 24rpx;
			white-space: nowrap;
			
			&.status-focus {
				background-color: #2979ff;
				color: #fff;
			}
			
			&.status-contacted {
				background-color: #666;
				color: #fff;
			}
			
			&.status-quoted {
				background-color: #2979ff;
				color: #fff;
			}
			
			&.status-following {
				background-color: #2979ff;
				color: #fff;
			}
			
			&.status-success {
				background-color: #2979ff;
				color: #fff;
			}
			
			&.status-failed {
				background-color: #999;
				color: #fff;
			}
		}
	}
	
	.need-details {
		margin-bottom: 20rpx;
		
		.detail-row {
			display: flex;
			margin-bottom: 8rpx;
			font-size: 26rpx;
			
			.detail-label {
				color: #999;
				margin-right: 16rpx;
				min-width: 120rpx;
			}
			
			.detail-value {
				color: #333;
				flex: 1;
				
				&.text-orange {
					color: #2979ff;
					font-weight: 600;
				}
				
				&.text-blue {
					color: #2979ff;
					font-weight: 600;
				}
			}
		}
	}
	
	.need-remark {
		background-color: #f8f9fa;
		padding: 16rpx;
		border-radius: 8rpx;
		margin-bottom: 20rpx;
		font-size: 24rpx;
		
		.remark-label {
			color: #999;
			margin-right: 12rpx;
		}
		
		.remark-content {
			color: #666;
		}
	}
	
	.need-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.priority-tag {
			padding: 6rpx 12rpx;
			border-radius: 16rpx;
			font-size: 22rpx;
			
			&.priority-low {
				background-color: #f0f0f0;
				color: #999;
			}
			
			&.priority-medium {
				background-color: #f0f0f0;
				color: #666;
			}
			
			&.priority-high {
				background-color: #2979ff;
				color: #fff;
			}
			
			&.priority-urgent {
				background-color: #2979ff;
				color: #fff;
			}
		}
		
		.action-buttons {
			display: flex;
			align-items: center;
		}
	}
}



// 报价弹窗样式
.quote-modal {
	width: 600rpx;
	background-color: #fff;
	border-radius: 20rpx;
	padding: 40rpx;
	
	.modal-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		text-align: center;
		margin-bottom: 40rpx;
	}
	
	.quote-form {
		.form-item {
			margin-bottom: 32rpx;
			
			.label {
				font-size: 28rpx;
				color: #333;
				margin-bottom: 16rpx;
			}
			
			.status-options {
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				
				/* 圆圈保持小尺寸，内部图标变大 */
				::v-deep .u-radio__icon-wrap {
					width: 28rpx !important;
					height: 28rpx !important;
				}
				
				::v-deep .u-radio__icon {
					font-size: 20rpx !important;
				}
				
				/* 选中状态的勾选图标变大 */
				::v-deep .u-icon {
					font-size: 18rpx !important;
					font-weight: bold !important;
				}
			}
		}
	}
	
	.modal-actions {
		display: flex;
		gap: 20rpx;
		margin-top: 20rpx;
	}
}
</style>