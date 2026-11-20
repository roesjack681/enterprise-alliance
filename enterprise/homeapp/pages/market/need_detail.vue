<template>
	<view class="container">
		<view v-if="loading" class="loading-container">
			<u-loading-icon mode="spinner" size="40"></u-loading-icon>
			<text class="loading-text">加载中...</text>
		</view>
		
		<view v-else>
			<!-- 需求基本信息 -->
			<view class="info-card">
				<view class="card-header">
					<view class="need-info">
						<view class="need-title">{{ needData.demand_title || '未命名需求' }}</view>
						<view class="need-status" :class="needData.statusClass">{{ needData.statusText }}</view>
					</view>
				</view>
				
				<view class="info-list">
					<view class="info-item">
						<view class="info-label">需求类型</view>
						<view class="info-value">{{ getTypeName(needData.demand_type) }}</view>
					</view>
					<view class="info-item" v-if="needData.budget_price > 0">
						<view class="info-label">预算金额</view>
						<view class="info-value text-orange">¥{{ needData.budget_price }}</view>
					</view>
					<view class="info-item" v-if="needData.quoted_price > 0">
						<view class="info-label">我的报价</view>
						<view class="info-value text-blue">¥{{ needData.quoted_price }}</view>
					</view>
					<view class="info-item">
						<view class="info-label">成功概率</view>
						<view class="info-value">{{ needData.success_probability }}%</view>
					</view>
					<view class="info-item">
						<view class="info-label">竞争对手</view>
						<view class="info-value">{{ needData.competitor_count }}个</view>
					</view>
					<view class="info-item">
						<view class="info-label">联系方式</view>
						<view class="info-value">{{ needData.contact_method || '未指定' }}</view>
					</view>
				</view>
				
				<!-- 跟进备注 -->
				<view class="remark-section" v-if="needData.remark">
					<view class="section-title">跟进备注</view>
					<view class="remark-content">{{ needData.remark }}</view>
				</view>
				
				<!-- 时间信息 -->
				<view class="time-info">
					<view class="time-item">
						<text class="time-label">创建时间:</text>
						<text class="time-value">{{ formatTime(needData.create_time) }}</text>
					</view>
					<view class="time-item" v-if="needData.first_contact_time > 0">
						<text class="time-label">首次联系:</text>
						<text class="time-value">{{ formatTime(needData.first_contact_time) }}</text>
					</view>
					<view class="time-item" v-if="needData.last_follow_time > 0">
						<text class="time-label">最后跟进:</text>
						<text class="time-value">{{ formatTime(needData.last_follow_time) }}</text>
					</view>
					<view class="time-item" v-if="needData.next_follow_time > 0">
						<text class="time-label">下次跟进:</text>
						<text class="time-value">{{ formatTime(needData.next_follow_time) }}</text>
					</view>
				</view>
			</view>
			
			<!-- 快捷操作 -->
			<view class="action-card">
				<view class="section-title">快捷操作</view>
				<view class="action-grid">
					<view class="action-item" @click="updateQuote">
						<u-icon name="attach" color="#2979ff" size="40"></u-icon>
						<text>更新报价</text>
					</view>
					<view class="action-item" @click="addFollowUp">
						<u-icon name="plus" color="#ff9500" size="40"></u-icon>
						<text>添加跟进</text>
					</view>
					<view class="action-item" @click="updateStatus">
						<u-icon name="checkmark-circle" color="#19be6b" size="40"></u-icon>
						<text>更新状态</text>
					</view>
					<view class="action-item" @click="viewHistory">
						<u-icon name="list" color="#4ecdc4" size="40"></u-icon>
						<text>查看历史</text>
					</view>
				</view>
			</view>
			
			<!-- 相关客户信息 -->
			<view class="client-card" v-if="clientData">
				<view class="card-header">
					<view class="section-title">相关客户</view>
					<view class="section-more" @click="viewClientDetail">查看详情</view>
				</view>
				<view class="client-info">
					<view class="client-name">{{ clientData.enterprise_name }}</view>
					<view class="client-contact" v-if="clientData.contact_person">
						联系人: {{ clientData.contact_person }}
					</view>
					<view class="client-phone" v-if="clientData.contact_phone">
						电话: {{ clientData.contact_phone }}
					</view>
				</view>
			</view>
		</view>
		
		<!-- 报价弹窗 -->
		<u-popup v-model="showQuoteModal" mode="center" border-radius="20">
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
						<view class="label">竞争对手数量</view>
						<u-input 
							v-model="quoteForm.competitor_count" 
							placeholder="请输入竞争对手数量"
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
					<button class="cancel-btn" @click="showQuoteModal = false">取消</button>
					<button class="confirm-btn" @click="submitQuote" :loading="submitting">确定</button>
				</view>
			</view>
		</u-popup>
		
		<!-- 状态更新弹窗 -->
		<u-popup v-model="showStatusModal" mode="center" border-radius="20">
			<view class="status-modal">
				<view class="modal-title">更新状态</view>
				<view class="status-list">
					<view class="status-item" 
						v-for="status in statusOptions" 
						:key="status.value"
						:class="{ active: statusForm.status === status.value }"
						@click="selectStatus(status.value)">
						{{ status.name }}
					</view>
				</view>
				<view class="modal-actions">
					<button class="cancel-btn" @click="showStatusModal = false">取消</button>
					<button class="confirm-btn" @click="submitStatus" :loading="submitting">确定</button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
import { getMarketNeedDetail, updateMarketNeed, getMarketGuestDetail } from '@/utils/api.js'

export default {
	data() {
		return {
			loading: false,
			needId: 0,
			needData: {},
			clientData: null,
			showQuoteModal: false,
			showStatusModal: false,
			submitting: false,
			quoteForm: {
				quoted_price: '',
				success_probability: '',
				competitor_count: '',
				remark: ''
			},
			statusForm: {
				status: ''
			},
			statusOptions: [
				{ name: '关注', value: '关注' },
				{ name: '已联系', value: '已联系' },
				{ name: '报价', value: '报价' },
				{ name: '跟进中', value: '跟进中' },
				{ name: '成交', value: '成交' },
				{ name: '失败', value: '失败' }
			],
			statusMapping: {
				'关注': { class: 'status-focus', text: '关注' },
				'已联系': { class: 'status-contacted', text: '已联系' },
				'报价': { class: 'status-quoted', text: '报价' },
				'跟进中': { class: 'status-following', text: '跟进中' },
				'成交': { class: 'status-success', text: '成交' },
				'失败': { class: 'status-failed', text: '失败' }
			}
		}
	},
	
	onLoad(options) {
		if (options.id) {
			this.needId = parseInt(options.id);
			this.loadNeedDetail();
		}
	},
	
	onShow() {
		// 从编辑页面返回时刷新数据
		if (this.needRefresh) {
			this.loadNeedDetail();
			this.needRefresh = false;
		}
	},
	
	methods: {
		// 加载需求详情
		async loadNeedDetail() {
			this.loading = true;
			
			try {
				const response = await getMarketNeedDetail({ id: this.needId });
				
				if (response.code === 0 && response.data) {
					const data = response.data;
					const statusInfo = this.statusMapping[data.status] || { class: 'status-default', text: data.status };
					
					this.needData = {
						...data,
						statusClass: statusInfo.class,
						statusText: statusInfo.text
					};
					
					// 设置页面标题
					uni.setNavigationBarTitle({
						title: this.needData.demand_title || '需求详情'
					});
					
					// 加载相关客户信息
					if (this.needData.entity_id) {
						this.loadClientData(this.needData.entity_id);
					}
				} else {
					uni.showToast({
						title: response.msg || '加载失败',
						icon: 'none'
					});
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				}
			} catch (error) {
				console.error('加载需求详情失败:', error);
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				});
			}
			
			this.loading = false;
		},
		
		// 加载客户数据
		async loadClientData(entityId) {
			try {
				const response = await getMarketGuestDetail({ id: entityId });
				if (response.code === 0 && response.data) {
					this.clientData = response.data;
				}
			} catch (error) {
				console.error('加载客户数据失败:', error);
			}
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
		
		// 格式化时间
		formatTime(timestamp) {
			if (!timestamp || timestamp === 0) return '暂无';
			const date = new Date(timestamp * 1000);
			return date.getFullYear() + '-' + 
				   String(date.getMonth() + 1).padStart(2, '0') + '-' + 
				   String(date.getDate()).padStart(2, '0') + ' ' +
				   String(date.getHours()).padStart(2, '0') + ':' + 
				   String(date.getMinutes()).padStart(2, '0');
		},
		
		// 更新报价
		updateQuote() {
			this.quoteForm = {
				quoted_price: this.needData.quoted_price || '',
				success_probability: this.needData.success_probability || '',
				competitor_count: this.needData.competitor_count || '',
				remark: this.needData.remark || ''
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
					id: this.needId,
					quoted_price: parseFloat(this.quoteForm.quoted_price),
					success_probability: parseInt(this.quoteForm.success_probability) || 0,
					competitor_count: parseInt(this.quoteForm.competitor_count) || 0,
					remark: this.quoteForm.remark,
					status: '报价',
					update_time: Math.floor(Date.now() / 1000)
				};
				
				const response = await updateMarketNeed(submitData);
				
				if (response.code === 0) {
					uni.showToast({
						title: '报价更新成功',
						icon: 'success'
					});
					
					this.showQuoteModal = false;
					this.loadNeedDetail(); // 刷新数据
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
		
		// 更新状态
		updateStatus() {
			this.statusForm.status = this.needData.status;
			this.showStatusModal = true;
		},
		
		// 选择状态
		selectStatus(status) {
			this.statusForm.status = status;
		},
		
		// 提交状态
		async submitStatus() {
			this.submitting = true;
			
			try {
				const response = await updateMarketNeed({
					id: this.needId,
					status: this.statusForm.status,
					update_time: Math.floor(Date.now() / 1000)
				});
				
				if (response.code === 0) {
					uni.showToast({
						title: '状态更新成功',
						icon: 'success'
					});
					
					this.showStatusModal = false;
					this.loadNeedDetail(); // 刷新数据
				} else {
					uni.showToast({
						title: response.msg || '更新失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('更新状态失败:', error);
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				});
			}
			
			this.submitting = false;
		},
		
		// 添加跟进
		addFollowUp() {
			uni.navigateTo({
				url: `/pages/market/follow_up_add?need_id=${this.needId}&need_title=${this.needData.demand_title}`
			});
		},
		
		// 查看历史
		viewHistory() {
			uni.navigateTo({
				url: `/pages/market/history?target_type=need&target_id=${this.needId}`
			});
		},
		
		// 查看客户详情
		viewClientDetail() {
			if (this.clientData) {
				uni.navigateTo({
					url: `/pages/market/client_detail?id=${this.clientData.id}`
				});
			}
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

.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 200rpx 0;
	
	.loading-text {
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #999;
	}
}

.info-card, .action-card, .client-card {
	background-color: #fff;
	margin: 20rpx;
	border-radius: 16rpx;
	padding: 32rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 32rpx;
	
	.need-info {
		flex: 1;
		
		.need-title {
			font-size: 36rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 12rpx;
		}
	}
	
	.need-status, .section-more {
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		white-space: nowrap;
	}
	
	.section-more {
		color: #2979ff;
		background-color: #f0f4ff;
	}
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 24rpx;
}

.info-list {
	.info-item {
		display: flex;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
		
		&:last-child {
			border-bottom: none;
		}
		
		.info-label {
			width: 140rpx;
			font-size: 28rpx;
			color: #666;
			margin-right: 20rpx;
		}
		
		.info-value {
			flex: 1;
			font-size: 28rpx;
			color: #333;
			
			&.text-orange {
				color: #ff6b35;
				font-weight: 600;
			}
			
			&.text-blue {
				color: #2979ff;
				font-weight: 600;
			}
		}
	}
}

.remark-section {
	margin-top: 32rpx;
	padding-top: 32rpx;
	border-top: 1rpx solid #f0f0f0;
	
	.remark-content {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
	}
}

.time-info {
	margin-top: 32rpx;
	padding-top: 32rpx;
	border-top: 1rpx solid #f0f0f0;
	
	.time-item {
		display: flex;
		margin-bottom: 12rpx;
		font-size: 26rpx;
		
		.time-label {
			color: #999;
			margin-right: 16rpx;
			min-width: 140rpx;
		}
		
		.time-value {
			color: #666;
		}
	}
}

.action-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 24rpx;
	
	.action-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 32rpx;
		background-color: #f8f9fa;
		border-radius: 16rpx;
		gap: 16rpx;
		
		text {
			font-size: 26rpx;
			color: #666;
		}
	}
}

.client-info {
	.client-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 12rpx;
	}
	
	.client-contact, .client-phone {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 8rpx;
	}
}

// 弹窗样式
.quote-modal, .status-modal {
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
		}
	}
	
	.status-list {
		.status-item {
			padding: 20rpx;
			text-align: center;
			background-color: #f8f9fa;
			border-radius: 8rpx;
			margin-bottom: 16rpx;
			font-size: 28rpx;
			color: #666;
			
			&.active {
				background-color: #2979ff;
				color: #fff;
			}
		}
	}
	
	.modal-actions {
		display: flex;
		gap: 20rpx;
		margin-top: 40rpx;
		
		.cancel-btn {
			flex: 1;
			padding: 24rpx;
			background-color: #f8f9fa;
			color: #666;
			border: none;
			border-radius: 12rpx;
			font-size: 28rpx;
		}
		
		.confirm-btn {
			flex: 1;
			padding: 24rpx;
			background-color: #2979ff;
			color: #fff;
			border: none;
			border-radius: 12rpx;
			font-size: 28rpx;
		}
	}
}

// 状态样式
.status-focus {
	background-color: #e6f3ff;
	color: #409eff;
}

.status-contacted {
	background-color: #fff3cd;
	color: #856404;
}

.status-quoted {
	background-color: #f0f4ff;
	color: #2979ff;
}

.status-following {
	background-color: #ffe6e6;
	color: #ff4757;
}

.status-success {
	background-color: #d4edda;
	color: #155724;
}

.status-failed {
	background-color: #f8f9fa;
	color: #999;
}
</style>