<template>
	<view class="container">
		<!-- 头部筛选 -->
		<view class="filter-section">
			<view class="filter-tabs">
				<view class="filter-item" 
					:class="{ active: currentStatus === item.value }" 
					v-for="(item, index) in statusTabs" 
					:key="index"
					@click="changeStatusFilter(item.value)">
					{{ item.name }}
				</view>
			</view>
		</view>

		<!-- 任务列表 -->
		<view class="task-list">
			<view v-if="loading" class="loading-container">
				<u-loading-icon mode="spinner" size="40"></u-loading-icon>
				<text class="loading-text">加载中...</text>
			</view>
			
			<view v-else-if="list.length === 0" class="empty-container">
				<image src="/static/icon/m4.png" class="empty-icon" mode="aspectFit"></image>
				<text class="empty-text">暂无待办事项</text> 
			</view>
			
			<view v-else>
				<view class="task-item" v-for="(item, index) in list" :key="item.id" @longpress="deleteTask(item)">
					<view class="task-header">
						<view class="task-check" @click.stop="toggleTaskStatus(item)">
							<u-icon 
								:name="item.status === 2 ? 'checkmark-circle-fill' : 'checkmark-circle'" 
								:color="item.status === 2 ? '#19be6b' : '#c8c9cc'" 
								size="40"
							></u-icon>
						</view>
						<view class="task-info">
							<view class="task-title" :class="{ completed: item.status === 2 }">
								{{ item.title }}
							</view>
							<view class="task-meta">
								<view class="task-type">{{ getTaskTypeName(item.task_type) }}</view>
								<view class="task-priority" :class="item.priorityClass">
									{{ getPriorityText(item.priority) }}
								</view>
							</view>
						</view>
						<view class="task-actions" @click.stop>
							<u-button 
								class="status-btn"
								@click="changeTaskStatus(item)"
								size="mini"
								type="primary"
								plain
								:custom-style="{ height: '60rpx', fontSize: '24rpx', padding: '0 16rpx' }">
								{{ getStatusButtonText(item.status) }}
							</u-button>
						</view>
					</view>
					
					<view class="task-content" v-if="item.content">
						{{ item.content }}
					</view>
					
					<view class="task-time-info">
						<view class="task-time" v-if="item.scheduled_time > 0">
							<u-icon name="clock" color="#999" size="24"></u-icon>
							<text class="time-text">预定时间：{{ formatTime(item.scheduled_time) }}</text>
						</view>
						<view class="update-time" v-if="item.update_time > 0">
							<u-icon name="reload" color="#999" size="24"></u-icon>
							<text class="time-text">更新时间：{{ formatTime(item.update_time) }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部添加按钮 -->
		<view class="fab-container">
			<view class="fab-btn" @click="addTask">
				<u-icon name="plus" color="#fff" size="40"></u-icon>
			</view>
		</view>

		<!-- 加载更多 -->
		<u-loadmore :status="loadmoreStatus" @loadmore="loadMore" v-if="list.length > 0" />
		
		<!-- 添加任务弹窗 -->
		<u-popup :show="showAddModal" mode="center" border-radius="20">
			<view class="add-modal">
				<view class="modal-title">添加任务</view>
				<view class="add-form">
					<view class="form-item">
						<view class="label">任务标题</view>
						<u-input 
							v-model="taskForm.title" 
							placeholder="请输入任务标题"
							:clearable="true"
						/>
					</view>
					<view class="form-item">
						<view class="label">任务类型</view>
						<u-radio-group v-model="taskForm.task_type">
							<view class="task-types">
								<u-radio 
									v-for="(item, index) in taskTypes" 
									:key="index"
									:name="item.value"
									:label="item.name"
									:custom-style="{ marginBottom: '16rpx', marginRight: '30rpx' }"
									:size="32"
									:icon-size="20"
									:label-size="30"
									active-color="#2979ff">
								</u-radio>
							</view>
						</u-radio-group>
					</view>
					<view class="form-item">
						<view class="label">优先级</view>
						<u-radio-group v-model="taskForm.priority">
							<view class="priorities">
								<u-radio 
									v-for="(item, index) in priorities" 
									:key="index"
									:name="item.value"
									:label="item.name"
									:custom-style="{ marginBottom: '16rpx', marginRight: '30rpx' }"
									:size="32"
									:icon-size="20"
									:label-size="30"
									active-color="#2979ff">
								</u-radio>
							</view>
						</u-radio-group>
					</view>
					<view class="form-item">
						<view class="label">任务内容</view>
						<u-textarea 
							v-model="taskForm.content" 
							placeholder="请输入任务内容（可选）"
							:count="true"
							maxlength="500"
							height="120"
						/>
					</view>
				</view>
				<view class="modal-actions">
					<u-button 
						class="cancel-btn" 
						@click="showAddModal = false"
						size="small"
						type="info"
						plain
						:custom-style="{ height: '70rpx', fontSize: '26rpx' }">
						取消
					</u-button>
					<u-button 
						class="confirm-btn" 
						@click="submitTask" 
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
import { getMarketTaskList, addMarketTask, updateMarketTask, deleteMarketTask } from '@/utils/api.js'

export default {
	data() {
		return {
			currentStatus: -1,
			loading: false,
			list: [],
			page: 1,
			pageSize: 20,
			total: 0,
			loadmoreStatus: 'loadmore',
			showAddModal: false,
			submitting: false,
			taskForm: {
				title: '',
				content: '',
				task_type: 'follow_up',
				priority: 1
			},
			statusTabs: [
				{ name: '全部', value: -1 },
				{ name: '待处理', value: 0 },
				{ name: '处理中', value: 1 },
				{ name: '已完成', value: 2 }
			],
			taskTypes: [
				{ name: '跟进', value: 'follow_up' },
				{ name: '报价', value: 'quote' },
				{ name: '会议', value: 'meeting' },
				{ name: '电话', value: 'call' },
				{ name: '其他', value: 'other' }
			],
			priorities: [
				{ name: '低', value: 1 },
				{ name: '中', value: 2 },
				{ name: '高', value: 3 },
				{ name: '紧急', value: 4 }
			],
			statusMapping: {
				0: { class: 'status-pending', text: '待处理' },
				1: { class: 'status-processing', text: '处理中' },
				2: { class: 'status-completed', text: '已完成' },
				3: { class: 'status-cancelled', text: '已取消' }
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
		// 加载任务列表
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
				
				// 状态参数处理 - 只有当状态是有效数值时才传递
				if (this.currentStatus !== '' && this.currentStatus !== null && this.currentStatus !== undefined && this.currentStatus >= 0) {
					const statusValue = typeof this.currentStatus === 'string' ? parseInt(this.currentStatus) : this.currentStatus;
					if (!isNaN(statusValue) && statusValue >= 0 && statusValue <= 3) {
						params.status = statusValue;
					}
				}
				
				const response = await getMarketTaskList(params);
				
				if (response.code === 0) {
					let newList = response.data.list || [];
					
					// 处理数据 - 添加状态样式和优先级样式
					newList = newList.map(item => {
						const statusInfo = this.statusMapping[item.status] || { class: 'status-default', text: '未知' };
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
				console.error('加载任务列表失败:', error);
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
		
		// 状态筛选
		changeStatusFilter(status) {
			this.currentStatus = status;
			this.loadList(true);
		},
		

		
		// 获取任务类型名称
		getTaskTypeName(type) {
			const typeMapping = {
				'follow_up': '跟进',
				'quote': '报价',
				'meeting': '会议',
				'call': '电话',
				'other': '其他'
			};
			return typeMapping[type] || '其他';
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
		
		// 获取状态按钮文本
		getStatusButtonText(status) {
			const mapping = {
				0: '开始',
				1: '完成',
				2: '重开'
			};
			return mapping[status] || '开始';
		},
		
		// 修改任务状态
		changeTaskStatus(task) {
			const statusOptions = [
				{ text: '待处理', value: 0 },
				{ text: '处理中', value: 1 },
				{ text: '已完成', value: 2 }
			];
			
			const itemList = statusOptions.map(item => item.text);
			
			uni.showActionSheet({
				itemList: itemList,
				success: async (res) => {
					const newStatus = statusOptions[res.tapIndex].value;
					
					if (newStatus === task.status) {
						return; // 状态相同，不需要更新
					}
					
					try {
						const response = await updateMarketTask({
							id: task.id,
							status: newStatus,
							completed_time: newStatus === 2 ? Math.floor(Date.now() / 1000) : 0,
							update_time: Math.floor(Date.now() / 1000)
						});
						
						if (response.code === 0) {
							// 更新本地状态
							task.status = newStatus;
							const statusInfo = this.statusMapping[newStatus];
							task.statusClass = statusInfo.class;
							task.statusText = statusInfo.text;
							
							uni.showToast({
								title: `任务状态已更新为${statusOptions[res.tapIndex].text}`,
								icon: 'success'
							});
						} else {
							uni.showToast({
								title: response.msg || '状态更新失败',
								icon: 'none'
							});
						}
					} catch (error) {
						console.error('更新任务状态失败:', error);
						uni.showToast({
							title: '网络错误',
							icon: 'none'
						});
					}
				}
			});
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
		
		// 切换任务状态
		async toggleTaskStatus(task) {
			const newStatus = task.status === 2 ? 0 : 2; // 切换完成状态
			
			try {
				const response = await updateMarketTask({
					id: task.id,
					status: newStatus,
					completed_time: newStatus === 2 ? Math.floor(Date.now() / 1000) : 0,
					update_time: Math.floor(Date.now() / 1000)
				});
				
				if (response.code === 0) {
					// 更新本地状态
					task.status = newStatus;
					const statusInfo = this.statusMapping[newStatus];
					task.statusClass = statusInfo.class;
					task.statusText = statusInfo.text;
					
					uni.showToast({
						title: newStatus === 2 ? '任务已完成' : '任务已重新开启',
						icon: 'success'
					});
				} else {
					uni.showToast({
						title: response.msg || '操作失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('更新任务状态失败:', error);
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				});
			}
		},
		
		// 添加任务
		addTask() {
			this.taskForm = {
				title: '',
				content: '',
				task_type: 'follow_up',
				priority: 1
			};
			this.showAddModal = true;
		},
		
		// 提交任务
		async submitTask() {
			if (!this.taskForm.title.trim()) {
				uni.showToast({
					title: '请输入任务标题',
					icon: 'none'
				});
				return;
			}
			
			this.submitting = true;
			
			try {
				const submitData = {
					title: this.taskForm.title.trim(),
					content: this.taskForm.content || '',
					task_type: this.taskForm.task_type,
					priority: parseInt(this.taskForm.priority),
					status: 0,
					related_type: '',
					related_id: 0,
					scheduled_time: 0,
					reminder_time: 0,
					estimated_duration: 0,
					remark: ''
				};
				
				const response = await addMarketTask(submitData);
				
				if (response.code === 0) {
					uni.showToast({
						title: '任务添加成功',
						icon: 'success'
					});
					
					this.showAddModal = false;
					this.loadList(true); // 刷新列表
				} else {
					uni.showToast({
						title: response.msg || '添加失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('添加任务失败:', error);
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				});
			}
			
			this.submitting = false;
		},
		

		
		// 删除任务（长按删除）
		deleteTask(task) {
			uni.showActionSheet({
				itemList: ['删除任务'],
				itemColor: '#ff4757',
				success: (res) => {
					if (res.tapIndex === 0) {
						uni.showModal({
							title: '确认删除',
							content: `确定要删除任务"${task.title}"吗？`,
							success: async (modalRes) => {
								if (modalRes.confirm) {
									try {
										const response = await deleteMarketTask({ id: task.id });
										
										if (response.code === 0) {
											uni.showToast({
												title: '删除成功',
												icon: 'success'
											});
											
											this.loadList(true); // 刷新列表
										} else {
											uni.showToast({
												title: response.msg || '删除失败',
												icon: 'none'
											});
										}
									} catch (error) {
										console.error('删除任务失败:', error);
										uni.showToast({
											title: '网络错误',
											icon: 'none'
										});
									}
								}
							}
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
	background-color: #f5f5f5;
	min-height: 100vh;
	padding-bottom: 120rpx;
}

.filter-section {
	background-color: #fff;
	padding: 20rpx;
	border-bottom: 1rpx solid #eee;
	
	.filter-tabs {
		display: flex;
		
		.filter-item {
			padding: 12rpx 24rpx;
			margin-right: 16rpx;
			background-color: #f8f9fa;
			border-radius: 40rpx;
			font-size: 28rpx;
			color: #666;
			transition: all 0.3s;
			
			&.active {
				background-color: #2979ff;
				color: #fff;
			}
		}
	}
}

.task-list {
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

.task-item {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 32rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
	
	.task-header {
		display: flex;
		align-items: flex-start;
		margin-bottom: 16rpx;
		
		.task-check {
			margin-right: 20rpx;
			margin-top: 4rpx;
		}
		
		.task-info {
			flex: 1;
			
			.task-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				margin-bottom: 12rpx;
				
				&.completed {
					text-decoration: line-through;
					color: #999;
				}
			}
			
			.task-meta {
				display: flex;
				gap: 16rpx;
				
				.task-type {
					padding: 4rpx 12rpx;
					background-color: #f0f4ff;
					color: #2979ff;
					border-radius: 16rpx;
					font-size: 22rpx;
				}
				
				.task-priority {
					padding: 4rpx 12rpx;
					border-radius: 16rpx;
					font-size: 22rpx;
					
					&.priority-low {
						background-color: #f0f0f0;
						color: #999;
					}
					
					&.priority-medium {
						background-color: #fff3cd;
						color: #856404;
					}
					
					&.priority-high {
						background-color: #ffe6e6;
						color: #ff4757;
					}
					
					&.priority-urgent {
						background-color: #ff4757;
						color: #fff;
					}
				}
			}
		}
		
		.task-actions {
			margin-left: 20rpx;
			display: flex;
			align-items: center;
			
			.status-btn {
				border-radius: 20rpx;
				min-width: 80rpx;
				
				&.u-button--plain {
					border: 1rpx solid #2979ff;
				}
			}
		}

	}
	
	.task-content {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		margin-bottom: 20rpx;
		padding: 16rpx;
		background-color: #f8f9fa;
		border-radius: 8rpx;
	}
	
	.task-time-info {
		margin-top: 16rpx;
		
		.task-time, .update-time {
			display: flex;
			align-items: center;
			margin-bottom: 8rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.time-text {
				margin-left: 8rpx;
				font-size: 24rpx;
				color: #999;
			}
		}
		
		.update-time .time-text {
			color: #666;
		}
	}
}

.fab-container {
	position: fixed;
	bottom: 120rpx;
	right: 40rpx;
	z-index: 999;
	
	.fab-btn {
		width: 120rpx;
		height: 120rpx;
		background-color: #2979ff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(41, 121, 255, 0.3);
	}
}

// 添加任务弹窗样式
.add-modal {
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
	
	.add-form {
		.form-item {
			margin-bottom: 32rpx;
			
			.label {
				font-size: 28rpx;
				color: #333;
				margin-bottom: 16rpx;
			}
			
			.task-types, .priorities {
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				
				/* 强制设置单选按钮图标大小 */
				::v-deep .u-radio__icon-wrap {
					width: 32rpx !important;
					height: 32rpx !important;
				}
				
				::v-deep .u-radio__icon {
					font-size: 32rpx !important;
				}
				
				::v-deep .u-icon {
					font-size: 20rpx !important;
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