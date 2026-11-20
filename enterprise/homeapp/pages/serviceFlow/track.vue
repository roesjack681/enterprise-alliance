<template>
	<view class="track-container">
		<!-- 订单信息卡片 -->
		<view class="order-card">
			<view class="card-header">
				<text class="header-title">订单信息</text>
				<view class="order-status" :class="orderDetail.statusClass">
					{{ orderDetail.statusText }}
				</view>
			</view>
			<view class="card-body">
				<view class="info-row">
					<text class="label">订单编号</text>
					<text class="value">{{ orderDetail.order_no || '-' }}</text>
				</view>
				<view class="info-row">
					<text class="label">服务名称</text>
					<text class="value">{{ orderDetail.title || '-' }}</text>
				</view>
				<view class="info-row">
					<text class="label">服务类型</text>
					<text class="value">{{ orderDetail.serviceTypeText }}</text>
				</view>
				<view class="info-row">
					<text class="label">订单金额</text>
					<text class="value price">¥{{ orderDetail.price || '0' }}</text>
				</view>
				<view class="info-row">
					<text class="label">创建时间</text>
					<text class="value">{{ formatTime(orderDetail.create_time) }}</text>
				</view>
			</view>
		</view>

		<!-- 流程进度 -->
		<view class="progress-card">
			<view class="card-header">
				<text class="header-title">服务进度</text>
				<text class="progress-text">{{ getProgressText() }}</text>
			</view>
			<view class="card-body">
				<!-- 进度条 -->
				<view class="progress-bar-wrapper">
					<u-line-progress 
						:percentage="progressPercentage" 
						:height="20"
						activeColor="#3D6AFF"
						inactiveColor="#f0f2f5">
					</u-line-progress>
				</view>
				
				<!-- 当前步骤信息 -->
				<view class="current-step-info" v-if="currentStep">
					<view class="step-header">
						<text class="step-title">当前步骤: {{ currentStep.step }}</text>
						<view class="step-status" :class="currentStep.statusClass">
							{{ currentStep.statusText }}
						</view>
					</view>
					<view class="step-details">
						<text class="step-desc">{{ currentStep.description || '暂无描述' }}</text>
						<text class="step-time" v-if="currentStep.start_time">
							开始时间: {{ formatTime(currentStep.start_time) }}
						</text>
						<text class="step-estimate" v-if="currentStep.estimated_days">
							预计用时: {{ currentStep.estimated_days }}天
						</text>
					</view>
				</view>
				
				<!-- 无当前步骤时的提示 -->
				<view class="current-step-info empty" v-else>
					<view class="empty-tip">
						<u-icon name="info-circle" size="40" color="#999"></u-icon>
						<text class="empty-text">暂无当前步骤信息</text>
						<text class="empty-desc">订单可能还未关联流程实例</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 流程时间线 -->
		<view class="timeline-card">
			<view class="card-header">
				<text class="header-title">流程详情</text>
			</view>
			<view class="card-body">
				<view class="timeline-wrapper">
					<view 
						class="timeline-item" 
						v-for="(step, index) in stepHistory" 
						:key="index"
						:class="{ 'active': step.status === 'InProgress', 'completed': step.status === 'Completed' }">
						
					<!-- 时间线节点 -->
					<view class="timeline-node">
						<view class="node-dot" :class="step.nodeClass">
							<u-icon 
								v-if="step.status === 'Completed'" 
								name="checkmark" 
								color="#fff" 
								size="16">
							</u-icon>
							<text v-else-if="step.status === 'InProgress'" class="node-number">{{ step.sequence }}</text>
							<text v-else class="node-number">{{ step.sequence }}</text>
						</view>
						<view class="node-line" v-if="index < stepHistory.length - 1"></view>
					</view>
					
					<!-- 步骤内容 -->
					<view class="timeline-content">
						<view class="step-header">
							<text class="step-name">{{ step.step }}</text>
							<view class="step-badge" :class="step.statusClass">
								{{ step.statusText }}
							</view>
						</view>
							
							<text class="step-description" v-if="step.description">
								{{ step.description }}
							</text>
							
							<view class="step-meta">
								<text class="meta-item" v-if="step.start_time">
									<u-icon name="clock" size="24" color="#999"></u-icon>
									开始: {{ formatTime(step.start_time) }}
								</text>
								<text class="meta-item" v-if="step.end_time">
									<u-icon name="checkmark-circle" size="24" color="#3D6AFF"></u-icon>
									完成: {{ formatTime(step.end_time) }}
								</text>
								<text class="meta-item" v-if="step.operator_name">
									<u-icon name="account" size="24" color="#999"></u-icon>
									操作人: {{ step.operator_name }}
								</text>
							</view>
							
							<view class="step-remarks" v-if="step.remarks">
								<text class="remarks-label">备注:</text>
								<text class="remarks-text">{{ step.remarks }}</text>
							</view>
							
							<view class="step-attachments" v-if="step.attachments && step.attachments.length > 0">
								<text class="attachments-label">附件:</text>
								<view class="attachment-list">
									<view 
										class="attachment-item" 
										v-for="(file, fileIndex) in step.attachments" 
										:key="fileIndex">
										<u-icon name="file-text" size="16" color="#3D6AFF"></u-icon>
										<text class="attachment-name">{{ file }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部操作按钮 -->
		<view class="action-bar" v-if="orderDetail.status === 'Active' || orderDetail.status === 'Pending'">
			<button 
				v-if="canPauseResume" 
				class="action-btn outline" 
				@click="pauseOrder"
			>暂停服务</button>
			<button 
				v-if="canAdvanceProcess" 
				class="action-btn primary" 
				@click="advanceProcess"
			>推进流程</button>
		</view>
		
		<view class="action-bar" v-else-if="orderDetail.status === 'Paused'">
			<button 
				v-if="canPauseResume" 
				class="action-btn primary" 
				@click="resumeOrder"
			>恢复服务</button>
		</view>
	</view>
</template>

<script>
import { getServiceOrderDetail, advanceServiceProcess, pauseResumeServiceOrder } from '@/utils/api.js'

export default {
	data() {
		return {
			orderId: '',           // 普通订单ID (从orders表)
			orderNo: '',           // 订单编号
			serviceOrderId: '',    // 服务订单ID (从service_order表)
			loading: false,
			orderDetail: {},
			processInstance: null,
			stepHistory: [],
			currentStep: null,
			progressPercentage: 0
		}
	},
	computed: {
		// 判断是否可以暂停/恢复服务（只有服务商可以操作）
		canPauseResume() {
			if (!this.processInstance || !this.processInstance.step_history) return false;
			
			// 检查当前步骤的角色权限
			const currentStepRole = this.processInstance.step_history.role;
			return currentStepRole === 'service_provider';
		},
		
		// 判断是否可以推进流程
		canAdvanceProcess() {
			if (!this.processInstance || !this.processInstance.step_history) return false;
			
			// 检查当前步骤的角色权限
			const currentStepRole = this.processInstance.step_history.role;
			return currentStepRole === 'service_provider';
		}
	},
	onLoad(options) {
		if (options.order_id) {
			this.orderId = options.order_id;
		}
		if (options.order_no) {
			this.orderNo = options.order_no;
		}
		if (options.service_order_id) {
			this.serviceOrderId = options.service_order_id;
		}
		
		this.loadOrderDetail();
	},
	onPullDownRefresh() {
		this.loadOrderDetail();
	},
	methods: {
		// 加载订单详情
		async loadOrderDetail() {
			const queryOrderId = this.serviceOrderId || this.orderId;
			
			if (!queryOrderId) {
				uni.showToast({
					title: '订单ID不能为空',
					icon: 'none'
				});
				return;
			}
			
			try {
				this.loading = true;
				uni.showLoading({ title: '加载中...' });
				
				const response = await getServiceOrderDetail({
					order_id: queryOrderId
				});
				
				if (response.code === 0) {
					this.orderDetail = response.data.order || {};
					
					// 添加订单状态样式类名和文本
					if (this.orderDetail.status) {
						this.orderDetail.statusClass = this.getOrderStatusClass(this.orderDetail.status);
						this.orderDetail.statusText = this.getOrderStatusText(this.orderDetail.status);
					}
					
					// 添加服务类型文本
					if (this.orderDetail.service_type) {
						this.orderDetail.serviceTypeText = this.getServiceTypeText(this.orderDetail.service_type);
					}
					
					this.processInstance = response.data.process_instance || null;
					
					// 保存service_order_id用于后续操作
					if (this.orderDetail.order_id) {
						this.serviceOrderId = this.orderDetail.order_id;
					}
					
					// 处理步骤历史
					if (this.processInstance && this.processInstance.step_history) {
						// 如果 step_history 是字符串，需要解析
						if (typeof this.processInstance.step_history === 'string') {
							try {
								this.stepHistory = JSON.parse(this.processInstance.step_history);
							} catch (e) {
								this.stepHistory = [];
							}
						} else {
							this.stepHistory = this.processInstance.step_history;
						}
						
						// 为每个步骤添加样式类名和文本
						this.stepHistory = this.stepHistory.map(step => ({
							...step,
							statusClass: this.getStepStatusClass(step.status),
							statusText: this.getStepStatusText(step.status),
							nodeClass: this.getNodeClass(step.status)
						}));
						
						// 找到当前步骤：优先查找 InProgress，然后 Pending，最后取最后一个
						this.currentStep = this.stepHistory.find(step => step.status === 'InProgress') 
							|| this.stepHistory.find(step => step.status === 'Pending')
							|| this.stepHistory[this.stepHistory.length - 1];
						
						// 为当前步骤添加样式类名和文本
						if (this.currentStep && this.currentStep.status) {
							this.currentStep.statusClass = this.getStepStatusClass(this.currentStep.status);
							this.currentStep.statusText = this.getStepStatusText(this.currentStep.status);
						}
						
						// 计算进度
						this.calculateProgress();
					}
				} else {
					uni.showToast({
						title: response.message || '获取订单详情失败',
						icon: 'none'
					});
				}
			} catch (error) {
				uni.showToast({
					title: '网络错误，请稍后重试',
					icon: 'none'
				});
			} finally {
				this.loading = false;
				uni.hideLoading();
				uni.stopPullDownRefresh();
			}
		},
		
		// 计算进度百分比
		calculateProgress() {
			if (!this.stepHistory || this.stepHistory.length === 0) {
				this.progressPercentage = 0;
				return;
			}
			
			const completedSteps = this.stepHistory.filter(step => step.status === 'Completed').length;
			const totalSteps = this.stepHistory.length;
			this.progressPercentage = Math.round((completedSteps / totalSteps) * 100);
		},
		
		// 获取进度文本
		getProgressText() {
			if (!this.stepHistory || this.stepHistory.length === 0) {
				return '0/0';
			}
			const completedSteps = this.stepHistory.filter(step => step.status === 'Completed').length;
			return `${completedSteps}/${this.stepHistory.length}`;
		},
		
		// 推进流程
		advanceProcess() {
			if (!this.currentStep) {
				uni.showModal({
					title: '提示',
					content: '当前步骤信息不可用，可能是:\n1. 订单没有关联流程实例\n2. 流程步骤历史为空\n\n是否重新加载订单详情？',
					success: (res) => {
						if (res.confirm) {
							this.loadOrderDetail();
						}
					}
				});
				return;
			}
			
			uni.showModal({
				title: '确认推进',
				content: `确认完成当前步骤"${this.currentStep.step}"并推进到下一步吗？`,
				success: async (res) => {
					if (res.confirm) {
						try {
							uni.showLoading({ title: '推进中...' });
							
							const requestData = {
								order_id: this.serviceOrderId || this.orderId,
								current_step: this.currentStep.step,
								remarks: '移动端推进'
							};
							
							const response = await advanceServiceProcess(requestData);
							
							if (response.code === 0) {
								uni.showToast({
									title: '推进成功',
									icon: 'success'
								});
								setTimeout(() => {
									this.loadOrderDetail();
								}, 1000);
							} else {
								uni.showToast({
									title: response.message || response.msg || '推进失败',
									icon: 'none',
									duration: 3000
								});
							}
						} catch (error) {
							uni.showToast({
								title: error.data?.msg || '操作失败，请稍后重试',
								icon: 'none'
							});
						} finally {
							uni.hideLoading();
						}
					}
				}
			});
		},
		
		// 暂停订单
		pauseOrder() {
			uni.showModal({
				title: '暂停服务',
				content: '确认暂停此服务订单吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							uni.showLoading({ title: '处理中...' });
							
							const response = await pauseResumeServiceOrder({
								order_id: this.serviceOrderId || this.orderId,
								action: 'pause',
								reason: '移动端操作暂停'
							});
							
							if (response.code === 0) {
								uni.showToast({
									title: '已暂停',
									icon: 'success'
								});
								setTimeout(() => {
									this.loadOrderDetail();
								}, 1000);
							} else {
								uni.showToast({
									title: response.message || '暂停失败',
									icon: 'none'
								});
							}
						} catch (error) {
							uni.showToast({
								title: '操作失败，请稍后重试',
								icon: 'none'
							});
						} finally {
							uni.hideLoading();
						}
					}
				}
			});
		},
		
		// 恢复订单
		resumeOrder() {
			uni.showModal({
				title: '恢复服务',
				content: '确认恢复此服务订单吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							uni.showLoading({ title: '处理中...' });
							
							const response = await pauseResumeServiceOrder({
								order_id: this.serviceOrderId || this.orderId,
								action: 'resume'
							});
							
							if (response.code === 0) {
								uni.showToast({
									title: '已恢复',
									icon: 'success'
								});
								setTimeout(() => {
									this.loadOrderDetail();
								}, 1000);
							} else {
								uni.showToast({
									title: response.message || '恢复失败',
									icon: 'none'
								});
							}
						} catch (error) {
							uni.showToast({
								title: '操作失败，请稍后重试',
								icon: 'none'
							});
						} finally {
							uni.hideLoading();
						}
					}
				}
			});
		},
		
		// 格式化时间
		formatTime(timestamp) {
			if (!timestamp) return '-';
			const date = new Date(timestamp);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const hour = String(date.getHours()).padStart(2, '0');
			const minute = String(date.getMinutes()).padStart(2, '0');
			return `${year}-${month}-${day} ${hour}:${minute}`;
		},
		
		// 获取订单状态样式
		getOrderStatusClass(status) {
			const statusMap = {
				'Pending': 'status-pending',
				'Active': 'status-active',
				'Paused': 'status-paused',
				'Completed': 'status-completed',
				'Cancelled': 'status-cancelled'
			};
			return statusMap[status] || '';
		},
		
		// 获取订单状态文本
		getOrderStatusText(status) {
			const statusMap = {
				'Pending': '待处理',
				'Active': '进行中',
				'Paused': '已暂停',
				'Completed': '已完成',
				'Cancelled': '已取消'
			};
			return statusMap[status] || '未知';
		},
		
		// 获取服务类型文本
		getServiceTypeText(type) {
			const typeMap = {
				'one_time': '一次性服务',
				'recurring': '周期性服务'
			};
			return typeMap[type] || '-';
		},
		
		// 获取步骤状态样式
		getStepStatusClass(status) {
			const statusMap = {
				'Pending': 'step-pending',
				'InProgress': 'step-inprogress',
				'Completed': 'step-completed',
				'Skipped': 'step-skipped'
			};
			return statusMap[status] || '';
		},
		
		// 获取步骤状态文本
		getStepStatusText(status) {
			const statusMap = {
				'Pending': '待处理',
				'InProgress': '进行中',
				'Completed': '已完成',
				'Skipped': '已跳过'
			};
			return statusMap[status] || '未知';
		},
		
		// 获取时间线节点样式
		getNodeClass(status) {
			if (status === 'Completed') return 'node-completed';
			if (status === 'InProgress') return 'node-inprogress';
			return 'node-pending';
		}
	}
}
</script>

<style lang="scss" scoped>
.track-container {
	background-color: #f5f5f5;
	min-height: 100vh;
	padding: 20rpx 24rpx 120rpx;
}

/* 卡片通用样式 */
.order-card,
.progress-card,
.timeline-card {
	background-color: #fff;
	border-radius: 16rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
	overflow: hidden;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 32rpx;
	border-bottom: 1rpx solid #f0f0f0;
	
	.header-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}
}

.card-body {
	padding: 32rpx;
}

/* 订单信息卡片 */
.order-card {
	.order-status {
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		
		&.status-pending {
			background-color: #fff3cd;
			color: #856404;
		}
		
		&.status-active {
			background-color: #cce5ff;
			color: #0066cc;
		}
		
		&.status-paused {
			background-color: #fff4e5;
			color: #d97706;
		}
		
		&.status-completed {
			background-color: #e8f0fe;
			color: #3D6AFF;
		}
		
		&.status-cancelled {
			background-color: #f8d7da;
			color: #721c24;
		}
	}
	
	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f8f8f8;
		
		&:last-child {
			border-bottom: none;
		}
		
		.label {
			font-size: 28rpx;
			color: #666;
		}
		
		.value {
			font-size: 28rpx;
			color: #333;
			font-weight: 500;
			
			&.price {
				color: #3D6AFF;
				font-size: 32rpx;
				font-weight: 600;
			}
		}
	}
}

/* 流程进度卡片 */
.progress-card {
	.progress-text {
		font-size: 28rpx;
		color: #3D6AFF;
		font-weight: 600;
	}
	
	.progress-bar-wrapper {
		margin-bottom: 32rpx;
	}
	
	.current-step-info {
		padding: 24rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
		
		&.empty {
			text-align: center;
			padding: 40rpx 24rpx;
			
			.empty-tip {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 12rpx;
				
				.empty-text {
					font-size: 28rpx;
					color: #666;
					font-weight: 500;
				}
				
				.empty-desc {
					font-size: 24rpx;
					color: #999;
				}
			}
		}
		
		.step-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 16rpx;
			
			.step-title {
				font-size: 30rpx;
				color: #333;
				font-weight: 600;
			}
			
			.step-status {
				padding: 4rpx 12rpx;
				border-radius: 16rpx;
				font-size: 22rpx;
				
				&.step-pending {
					background-color: #e5e7eb;
					color: #6b7280;
				}
				
				&.step-inprogress {
					background-color: #dbeafe;
					color: #1e40af;
				}
				
				&.step-completed {
					background-color: #e8f0fe;
					color: #3D6AFF;
				}
			}
		}
		
		.step-details {
			display: flex;
			flex-direction: column;
			gap: 8rpx;
			
			.step-desc {
				font-size: 26rpx;
				color: #666;
				line-height: 1.5;
			}
			
			.step-time,
			.step-estimate {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
}

/* 流程时间线卡片 */
.timeline-card {
	.timeline-wrapper {
		padding: 0;
	}
	
	.timeline-item {
		display: flex;
		position: relative;
		padding-bottom: 40rpx;
		
		&:last-child {
			padding-bottom: 0;
			
			.node-line {
				display: none;
			}
		}
		
		.timeline-node {
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-right: 24rpx;
			
			.node-dot {
				width: 48rpx;
				height: 48rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				
				&.node-completed {
					background-color: #3D6AFF;
				}
				
				&.node-inprogress {
					background-color: #3D6AFF;
				}
				
				&.node-pending {
					background-color: #d9d9d9;
				}
				
				.node-number {
					font-size: 24rpx;
					color: #fff;
					font-weight: 600;
				}
			}
			
			.node-line {
				position: absolute;
				top: 48rpx;
				left: 50%;
				transform: translateX(-50%);
				width: 2rpx;
				height: calc(100% + 40rpx);
				background-color: #e5e7eb;
			}
		}
		
		.timeline-content {
			flex: 1;
			padding-bottom: 8rpx;
			
			.step-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 12rpx;
				
				.step-name {
					font-size: 30rpx;
					color: #333;
					font-weight: 600;
				}
				
				.step-badge {
					padding: 4rpx 12rpx;
					border-radius: 16rpx;
					font-size: 22rpx;
					white-space: nowrap;
					
					&.step-pending {
						background-color: #f3f4f6;
						color: #6b7280;
					}
					
					&.step-inprogress {
						background-color: #dbeafe;
						color: #1e40af;
					}
					
					&.step-completed {
						background-color: #e8f0fe;
						color: #3D6AFF;
					}
					
					&.step-skipped {
						background-color: #fef3c7;
						color: #92400e;
					}
				}
			}
			
			.step-description {
				font-size: 26rpx;
				color: #666;
				line-height: 1.6;
				margin-bottom: 12rpx;
			}
			
			.step-meta {
				display: flex;
				flex-direction: column;
				gap: 8rpx;
				margin-bottom: 12rpx;
				
				.meta-item {
					display: flex;
					align-items: center;
					gap: 8rpx;
					font-size: 24rpx;
					color: #999;
				}
			}
			
			.step-remarks {
				padding: 16rpx;
				background-color: #fef3c7;
				border-radius: 8rpx;
				margin-bottom: 12rpx;
				
				.remarks-label {
					font-size: 24rpx;
					color: #92400e;
					font-weight: 600;
					margin-right: 8rpx;
				}
				
				.remarks-text {
					font-size: 24rpx;
					color: #78350f;
					line-height: 1.5;
				}
			}
			
			.step-attachments {
				.attachments-label {
					font-size: 24rpx;
					color: #666;
					font-weight: 600;
					margin-bottom: 8rpx;
					display: block;
				}
				
				.attachment-list {
					display: flex;
					flex-direction: column;
					gap: 8rpx;
					
					.attachment-item {
						display: flex;
						align-items: center;
						gap: 8rpx;
						padding: 12rpx;
						background-color: #f8f9fa;
						border-radius: 8rpx;
						
						.attachment-name {
							font-size: 24rpx;
							color: #666;
						}
					}
				}
			}
		}
	}
}

/* 底部操作栏 */
.action-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	gap: 24rpx;
	padding: 24rpx;
	background-color: #fff;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
	
	.action-btn {
		flex: 1;
		height: 80rpx;
		border-radius: 40rpx;
		font-size: 30rpx;
		border: none;
		
		&.primary {
			background-color: #3D6AFF;
			color: #fff;
		}
		
		&.outline {
			background-color: transparent;
			color: #3D6AFF;
			border: 2rpx solid #3D6AFF;
		}
	}
}
</style>