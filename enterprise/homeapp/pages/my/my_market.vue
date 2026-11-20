<template>
	<view class="profile-container">
		<!-- 头部用户信息 -->
		<view class="header-section">
			<view class="user-info">
				<view class="avatar-wrapper" @click="jump('./set')">
					<image class="avatar" :src="userInfo.avatar || '/static/img/avatar.png'" mode="aspectFill"></image>
				</view>
				<view class="user-details">
					<view class="username">
						{{ userInfo.nickname || '经纪人' }}
						<image v-if="userInfo.review_status == 2" class="tag" src="/static/icon/auth.png"
							mode="aspectFill"></image>
						<image v-if="userInfo.isvip" class="tag" src="/static/icon/vip.png" mode="aspectFill"></image>
					</view>
					<view class="user-id">用户名: {{ userInfo.username }}</view>
					<view class="join-date">
						{{ userInfo.entityInfo && userInfo.entityInfo.name }}[{{ $C.getRoleName(userInfo.role) }}]
					</view>
				</view>
				<view class="edit-icon" @click="jump('./set')">
					<image src="/static/icon/icon4.png" mode="aspectFill" class="cu-avatar sm"></image>
				</view>
			</view>
		</view>

		<!-- 数据统计卡片 -->
		<view class="stats-card">
			<view class="section-title">业务统计</view>
			<view class="stats-row">
				<view class="stats-item bground">
					<view class="stats-number blue">{{ brokerStats.total_contacts || 0 }}</view>
					<view class="stats-label">联系客户</view>
				</view>
				<view class="stats-item bground">
					<view class="stats-number blue">{{ brokerStats.potential_clients || 0 }}</view>
					<view class="stats-label">潜在客户</view>
				</view>
				<view class="stats-item bground">
					<view class="stats-number blue">{{ brokerStats.success_rate || '0%' }}</view>
					<view class="stats-label">成交率</view>
				</view>
			</view>
			<view class="stats-row">
				<view class="stats-item">
					<view class="stats-number">{{ brokerStats.active_deals || 0 }}</view>
					<view class="stats-label">进行中</view>
				</view>
				<view class="stats-item">
					<view class="stats-number">{{ brokerStats.completed_deals || 0 }}</view>
					<view class="stats-label">已成交</view>
				</view>
				<view class="stats-item">
					<view class="stats-number">{{ brokerStats.pending_follow || 0 }}</view>
					<view class="stats-label">待跟进</view>
				</view>
				<view class="stats-item">
					<view class="stats-number">¥{{ brokerStats.monthly_commission || '0' }}</view>
					<view class="stats-label">本月佣金</view>
				</view>
			</view>
		</view>

		<!-- 快捷功能 -->
		<view class="quick-actions">
			<view class="section-title">快捷功能</view>
			<view class="action-grid">
				<!-- <view class="action-item" @click="goToNeedsList">
					<view class="action-icon-bg">
						<image src="/static/icon/t1.png" class="action-icon" mode="aspectFit"></image>
					</view>
					<view class="action-label">意向需求</view>
				</view> -->
				<view class="action-item" @click="goToNeedTracking">
					<view class="action-icon-bg">
						<image src="/static/icon/t7.png" class="action-icon" mode="aspectFit"></image>
					</view>
					<view class="action-label">需求跟进</view>
				</view>
				<view class="action-item" @click="goToTaskList">
					<view class="action-icon-bg">
						<image src="/static/icon/share.png" class="action-icon" mode="aspectFit"></image>
					</view>
					<view class="action-label">待办事项</view>
				</view>
				<view class="action-item" @click="goToMyClients">
					<view class="action-icon-bg">
						<image src="/static/icon/t2.png" class="action-icon" mode="aspectFit"></image>
					</view>
					<view class="action-label">我的客户</view>
				</view>
				<view class="action-item" @click="goToViewedClients">
					<view class="action-icon-bg">
						<image src="/static/icon/serv1.png" class="action-icon" mode="aspectFit"></image>
					</view>
					<view class="action-label">浏览记录</view>
				</view>
				
				<view class="action-item" @click="goToDataAnalysis">
					<view class="action-icon-bg">
						<image src="/static/icon/t7.png" class="action-icon" mode="aspectFit"></image>
					</view>
					<view class="action-label">数据分析</view>
				</view>
				<view class="action-item" @click="goToMyTeams">
					<view class="action-icon-bg">
						<image src="/static/icon/m4.png" class="action-icon" mode="aspectFit"></image>
					</view>
					<view class="action-label">我的团队</view>
				</view>
			</view>
		</view>

		<!-- 客户管理 -->
		<view class="client-management">
			<view class="section-header">
				<view class="section-title">客户管理</view>
				<view class="section-more blue" @click="goToMyClients">管理客户</view>
			</view>

			<!-- 客户列表 -->
			<view class="client-list">
				<view v-if="loading" class="loading-container">
					<u-loading-icon mode="spinner" size="40"></u-loading-icon>
					<text class="loading-text">加载中...</text>
				</view>
				
				<view v-else-if="myClients.length === 0" class="empty-container">
					<image src="/static/icon/m4.png" class="empty-icon" mode="aspectFit"></image>
					<text class="empty-text">暂无客户记录</text>
				</view>
				
				<view v-else class="client-item" v-for="client in myClients" :key="client.id" @click="viewClientDetail(client)">
					<view class="client-header">
						<view class="client-info">
							<image v-if="client.avatar" :src="client.avatar" class="client-logo" mode="aspectFit"></image>
							<view class="client-text">
								<view class="client-name">{{ client.company_name || '未命名客户' }}</view>
								<view class="client-contact" v-if="client.name">{{ client.name }}</view>
							</view>
						</view>
					</view>
					
					<view class="client-details">
						<view class="detail-row" v-if="client.contact_phone">
							<text class="detail-label">联系电话:</text>
							<text class="detail-value">{{ client.contact_phone }}</text>
						</view>
						<view class="detail-row" v-if="client.last_contact_time">
							<text class="detail-label">最后联系:</text>
							<text class="detail-value">{{ formatTime(client.last_contact_time) }}</text>
						</view>
						<view class="detail-row" v-if="client.budget && client.budget > 0">
							<text class="detail-label">成交金额:</text>
							<text class="detail-value text-orange">¥{{ client.budget }}</text>
						</view>
					</view>
					
					<view class="client-tags" v-if="client.tags && client.tags.length > 0">
						<view class="tag" v-for="(tag, index) in client.tags" :key="index"
							:style="{ backgroundColor: tag.color || '#f0f4ff', color: tag.textColor || '#666' }">
							{{ tag.name }}
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 需求跟进 -->
		<view class="recent-needs">
			<view class="section-header">
				<view class="section-title">需求跟进</view>
				<view class="section-more blue" @click="goToNeedTracking">查看更多</view>
			</view>

			<view class="needs-list">
				<view v-if="recentNeeds.length === 0" class="empty-container">
					<text class="empty-text">暂无跟进需求</text>
				</view>
				
				<view v-else class="need-item" v-for="need in recentNeeds" :key="need.id" @click="viewNeedDetail(need)">
					<view class="need-header">
						<view class="need-title">{{ need.demand_title || need.title }}</view>
						<view class="need-status" :class="need.needStatusClass">{{ getNeedStatusText(need.status) }}</view>
					</view>
					<view class="need-company">{{ need.enterprise_name || need.company_name }}</view>
					<view class="need-budget" v-if="need.quoted_price || need.budget_price">
						报价: ¥{{ formatNumber(need.quoted_price || need.budget_price) }}
					</view>
					<view class="need-time">跟进时间: {{ formatTime(need.last_follow_time || need.create_time) }}</view>
				</view>
			</view>
		</view>

		<!-- 待办事项 -->
		<view class="todo-section">
			<view class="section-header">
				<view class="section-title">待办事项</view>
				<view class="section-more blue" @click="goToTaskList">查看全部</view>
			</view>

			<view class="todo-list">
				<!-- 加载状态 -->
				<view v-if="todoLoading" class="loading-container">
					<u-loading-icon mode="spinner" size="32"></u-loading-icon>
					<text class="loading-text">加载中...</text>
				</view>
				
				<!-- 空数据状态 -->
				<view v-else-if="todoList.length === 0" class="empty-container">
					<text class="empty-text">暂无待办事项</text>
				</view>
				
				<!-- 待办事项列表 -->
				<view v-else class="todo-item" v-for="todo in todoList" :key="todo.id" @click="viewTaskDetail(todo)">
					<view class="todo-icon">
						<u-icon :name="todo.icon" :color="todo.iconColor" size="30"></u-icon>
					</view>
					<view class="todo-content">
						<view class="todo-header">
							<view class="todo-title">{{ todo.title }}</view>
							<view class="todo-status" v-if="todo.statusText">{{ todo.statusText }}</view>
						</view>
						<view class="todo-desc">{{ todo.description }}</view>
					</view>
					
				</view>
			</view>
		</view>
		
		<!--企业主页管理-->
		<view class="section">
			<view class="section-header">
				<text class="section-title">主页管理</text>				
			</view>
			
			<view class="management-grid">
				<view class="management-item" @click="goToMyHomepage">
					<view class="management-icon">
						<u-icon name="home" color="#3D6AFF" size="40"></u-icon>
					</view>
					<text class="management-title">我的主页</text>
				</view>
				
				<view class="management-item" @click="goToBanner">
					<view class="management-icon">
						<u-icon name="photo" color="#FF6B6B" size="40"></u-icon>
					</view>
					<text class="management-title">轮播图</text>
				</view>
				
				<view class="management-item" @click="goToAbout">
					<view class="management-icon">
						<u-icon name="info-circle" color="#4ECDC4" size="40"></u-icon>
					</view>
					<text class="management-title">关于我们</text>
				</view>
				
				<view class="management-item" @click="goToContact">
					<view class="management-icon">
						<u-icon name="phone" color="#45B7D1" size="40"></u-icon>
					</view>
					<text class="management-title">联系我们</text>
				</view>
				
				<view class="management-item" @click="goToProducts">
					<view class="management-icon">
						<u-icon name="grid-fill" color="#96CEB4" size="40"></u-icon>
					</view>
					<text class="management-title">产品管理</text>
				</view>
				
				<view class="management-item" @click="goToArticles">
					<view class="management-icon">
						<u-icon name="file-text" color="#FFEAA7" size="40"></u-icon>
					</view>
					<text class="management-title">文章管理</text>
				</view>
				
				<view class="management-item" @click="goToCases">
					<view class="management-icon">
						<u-icon name="star" color="#DDA0DD" size="40"></u-icon>
					</view>
					<text class="management-title">案例管理</text>
				</view>
				
				<view class="management-item" @click="goToSettings">
					<view class="management-icon">
						<u-icon name="setting" color="#A8E6CF" size="40"></u-icon>
					</view>
					<text class="management-title">设置</text>
				</view>
				<!--邀请码-->
				<view class="management-item" @click="goToInvite">
					<view class="management-icon">
						<u-icon name="share" color="#A8E6CF" size="40"></u-icon>
					</view>
					<text class="management-title">邀请码</text>
				</view>
			</view>
		</view>

		<!-- 功能选项 -->
		<view class="function-section">
			<view class="function-item" @click="goToAuth">
				<view class="function-icon">
					<u-icon name="checkmark-circle-fill" color="#409EFF" size="30"></u-icon>
				</view>
				<view class="function-text">我的认证</view>
				<view class="function-status">{{ $C.getAuthName(userInfo.review_status) }}</view>
				<u-icon class="margin-top-xs" name="arrow-right" color="#c8c9cc" size="28"></u-icon>
			</view>
			<view class="function-item" @click="goToNotification">
				<view class="function-icon">
					<u-icon name="email" color="#409EFF" size="30"></u-icon>
				</view>
				<view class="function-text">消息通知</view>
				<view class="notification-badge" v-if="notificationCount > 0">
					<text>{{ notificationCount }}</text>
				</view>
				<u-icon name="arrow-right" color="#c8c9cc" size="28"></u-icon>
			</view>
		</view>
	</view>
</template>

<script>
import { getDemandList, getBrokerStats, getMarketGuestList, getMarketNeedList, getMarketTaskList } from '@/utils/api.js'

export default {
	data() {
		return {
			notificationCount: 3,
			userInfo: {},
			myClients: [],
			recentNeeds: [],
			loading: false,
			todoLoading: false,
			brokerStats: {
				total_contacts: 0,
				potential_clients: 0,
				success_rate: '0%',
				active_deals: 0,
				completed_deals: 0,
				pending_follow: 0,
				monthly_commission: '0'
			},
			todoList: []
		}
	}, 
	
	onShow() {
		this.refreshData();
	},
	
	methods: {
		refreshData() {
			this.userInfo = uni.getStorageSync('$userinfo');
			this.loadRecentNeeds();
			this.loadMyClients();
			this.updateBrokerStats();
			this.loadTodoList();
		},
		
		// 获取需求跟进列表
		async loadRecentNeeds() {
			try {
				const response = await getMarketNeedList({
					page: 1,
					page_size: 3,
					sort_by: 'next_follow_time', // 使用后端支持的排序字段
					sort_order: 'desc'
				});
				
				if (response.code === 0 && response.data) {
					// 预计算样式类，避免模板中的方法调用
					const needs = response.data.list || [];
					this.recentNeeds = needs.map(need => ({
						...need,
						needStatusClass: this.getNeedStatusClass(need.status)
					}));
				} else {
					console.warn('获取需求跟进列表失败:', response.msg);
					this.recentNeeds = [];
				}
			} catch (error) {
				console.error('获取需求跟进列表失败:', error);
				this.recentNeeds = [];
			}
		},
		
		// 加载我的客户列表
		async loadMyClients() {
			this.loading = true;
			try {
				const response = await getMarketGuestList({
					page: 1,
					page_size: 5, // 首页只显示前5个客户
					sort_by: 'last_contact_time', // 使用后端支持的排序字段
					sort_order: 'desc'
				});
				
				if (response.code === 0 && response.data) {
					// 处理客户数据，添加显示所需的字段
					this.myClients = (response.data.list || []).map(client => {
						// 解析标签
						let tags = [];
						try {
							tags = client.tags ? JSON.parse(client.tags) : [];
						} catch (e) {
							tags = [];
						}
						
						// 映射状态
						const statusMap = {
							0: 'potential',    // 待沟通 -> 潜在客户
							1: 'contacted',    // 已沟通 -> 已联系
							2: 'negotiating',  // 跟进中 -> 洽谈中
							3: 'completed',    // 成交 -> 已成交
							4: 'potential'     // 已失效 -> 潜在客户
						};
						
						return {
							id: client.id,
							name: client.contact_person,
							company_name: client.enterprise_name,
							contact_phone: client.contact_phone,
							budget: client.total_amount || 0,
							last_contact_time: client.last_contact_time,
							avatar: client.logo,
							tags: tags
						};
					});
				} else {
					console.warn('获取客户列表失败:', response.msg);
					this.myClients = [];
				}
			} catch (error) {
				console.error('加载客户列表失败:', error);
				this.myClients = [];
			} finally {
				this.loading = false;
			}
		},
		
		// 更新经纪人统计数据
		async updateBrokerStats() {
			try {
				const response = await getBrokerStats({});
				
				if (response.code === 0 && response.data) {
					// 映射API返回的数据到页面显示格式
					this.brokerStats = {
						total_contacts: response.data.total_guests || 0,
						potential_clients: response.data.active_guests || 0,
						success_rate: `${response.data.success_rate || 0}%`,
						active_deals: response.data.in_progress || 0,
						completed_deals: response.data.completed || 0,
						pending_follow: response.data.pending || 0,
						monthly_commission: this.formatNumber(response.data.monthly_income || 0)
					};
				} else {
					console.warn('获取统计数据失败:', response.msg);
					// 保持默认值或显示错误提示
				}
			} catch (error) {
				console.error('加载统计数据失败:', error);
				// 使用默认值
				this.brokerStats = {
					total_contacts: 0,
					potential_clients: 0,
					success_rate: '0%',
					active_deals: 0,
					completed_deals: 0,
					pending_follow: 0,
					monthly_commission: '0'
				};
			}
		},
		
		// 加载待办事项列表
		async loadTodoList() {
			this.todoLoading = true;
			try {
				const response = await getMarketTaskList({
					page: 1,
					page_size: 3,
					sort_by: 'scheduled_time',
					sort_order: 'asc'
				});
				
				if (response.code === 0 && response.data) {
					// 处理待办事项数据，转换为页面显示格式
					this.todoList = (response.data.list || []).map(task => {
						const iconMap = {
							'follow_up': 'phone',
							'quote': 'attach',
							'meeting': 'calendar',
							'call': 'phone',
							'other': 'bookmark'
						};
						
						// 根据任务状态设置颜色
						const getStatusColor = (status) => {
							switch(status) {
								case 0: return '#999';     // 待处理 - 灰色
								case 1: return '#2979ff';  // 处理中 - 蓝色
								case 2: return '#19be6b';  // 已完成 - 绿色
								default: return '#999';
							}
						};
						
						return {
							id: task.id,
							title: task.title,
							description: task.content,
							time: this.formatTaskTime(task.scheduled_time),
							icon: iconMap[task.task_type] || 'bookmark',
							iconColor: getStatusColor(task.status),
							status: task.status,
							statusText: this.getTaskStatusText(task.status)
						};
					});
				} else {
					console.warn('获取待办事项失败:', response.msg);
					// 使用模拟数据作为后备
					 
				}
			} catch (error) {
				console.error('加载待办事项失败:', error);
				// 使用模拟数据作为后备
				 
			} finally {
				this.todoLoading = false;
			}
		},
		
	 
		
		// 格式化任务时间
		formatTaskTime(timestamp) {
			if (!timestamp) return '未设置';
			
			// 处理10位时间戳，需要 *1000 转换为毫秒
			const milliseconds = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp;
			const date = new Date(milliseconds);
			const today = new Date();
			const tomorrow = new Date(today);
			tomorrow.setDate(today.getDate() + 1);
			
			// 判断是今天、明天还是其他日期
			if (date.toDateString() === today.toDateString()) {
				return '今天';
			} else if (date.toDateString() === tomorrow.toDateString()) {
				return '明天';
			} else {
				const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
				return weekDays[date.getDay()];
			}
		},
		
		// 格式化数字
		formatNumber(num) {
			if (!num) return '0';
			
			if (num >= 10000) {
				return (num / 10000).toFixed(1) + '万';
			}
			
			return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
			if (!timestamp) return '';
			
			// 处理10位时间戳，需要 *1000 转换为毫秒
			const milliseconds = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp;
			const date = new Date(milliseconds);
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
		
		// 获取客户状态文本
		getClientStatusText(status) {
			const statusMap = {
				'potential': '潜在客户',
				'contacted': '已联系',
				'negotiating': '洽谈中',
				'completed': '已成交'
			};
			return statusMap[status] || '未知';
		},
		
		// 获取需求状态文本
		getNeedStatusText(status) {
			const statusMap = {
				0: '关注',
				1: '已联系',
				2: '报价',
				3: '跟进中',
				4: '成交',
				5: '失败',
				// 兼容字符串格式（旧数据）
				'关注': '关注',
				'已联系': '已联系',
				'报价': '报价',
				'跟进中': '跟进中',
				'成交': '成交',
				'失败': '失败'
			};
			return statusMap[status] || '未知';
		},
		
		// 获取需求状态样式类
		getNeedStatusClass(status) {
			const classMap = {
				0: 'status-focus',
				1: 'status-contacted',
				2: 'status-quoted',
				3: 'status-following',
				4: 'status-success',
				5: 'status-failed',
				// 兼容字符串格式（旧数据）
				'关注': 'status-focus',
				'已联系': 'status-contacted',
				'报价': 'status-quoted',
				'跟进中': 'status-following',
				'成交': 'status-success',
				'失败': 'status-failed'
			};
			return classMap[status] || 'status-default';
		},
		
		// 获取任务状态文本
		getTaskStatusText(status) {
			const statusMap = {
				0: '待处理',
				1: '处理中', 
				2: '已完成',
				3: '已取消'
			};
			return statusMap[status] || '未知';
		},
		
		// 查看客户详情
		viewClientDetail(client) {
			uni.navigateTo({
				url: `/pages/broker/client_detail?id=${client.id}`
			});
		},
		
		// 查看需求详情
		viewNeedDetail(need) {
			uni.navigateTo({
				url: `/pages/demand/detail?id=${need.demand_id || need.id}`
			});
		},
		
		// 查看任务详情
		viewTaskDetail(task) {
			uni.navigateTo({
				url: `/pages/market/task_detail?id=${task.id}`
			});
		},
		
		jump(url) {
			uni.navigateTo({
				url: url
			})
		},
		
		// 导航方法
		goToNeedsList() {
			uni.switchTab({
				url: '/pages/demand/list'
			});
		},
		
		goToMyClients() {
			uni.navigateTo({
				url: '/pages/market/client_list'
			});
		},
		
		goToViewedClients() {
			uni.navigateTo({
				url: '/pages/market/history'
			});
		},
		
		goToDataAnalysis() {
			uni.navigateTo({
				url: '/pages/market/data_analysis'
			});
		},
		
		goToSettings() {
			uni.navigateTo({
				url: '/pages/enterprise/settings_manage'
			});
		},
		
		goToAuth() {
			if (this.userInfo.review_status == 2) return;
			uni.navigateTo({
				url: '/pages/entity/auth'
			})
		},
		
		goToNotification() {
			uni.switchTab({
				url: '/pages/msg/msg'
			})
		},
		
		goToInvite() {
			uni.navigateTo({
				url: '/pages/entity/invite'
			})
		},
		
		// 需求跟进
		goToNeedTracking() {
			uni.navigateTo({
				url: '/pages/market/need_list'
			});
		},
		
		// 待办事项
		goToTaskList() {
			uni.navigateTo({
				url: '/pages/market/task_list'
			});
		},

		// 企业主页管理相关方法
		goToMyHomepage() {
			uni.navigateTo({
				url: '/pages/company/home?enterpriseId='+this.userInfo.id
			})
		},
		goToBanner() {
			uni.navigateTo({
				url: '/pages/enterprise/banner_manage'
			})
		},
		goToAbout() {
			uni.navigateTo({
				url: '/pages/enterprise/about_manage'
			})
		},
		goToContact() {
			uni.navigateTo({
				url: '/pages/enterprise/contact_manage'
			})
		},
		goToProducts() {
			uni.navigateTo({
				url: '/pages/enterprise/product_manage'
			})
		},
		goToArticles() {
			uni.navigateTo({
				url: '/pages/enterprise/article_manage'
			})
		},
		goToCases() {
			uni.navigateTo({
				url: '/pages/enterprise/case_manage'
			})
		},
		goToInvite() {
			uni.navigateTo({
				url: '/pages/entity/invite'
			})
		},
		
		// 我的团队
		goToMyTeams() {
			uni.navigateTo({
				url: '/pages/market/myteams'
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.profile-container {
	padding: 20rpx 0px;
	min-height: 100vh;
	background-color: #f5f5f5;
}

.header-section {
	flex-direction: column;
	align-items: center;
	padding: 60rpx 30rpx;
	background-color: #fff;
	margin: 0 24rpx 20rpx;
	border-radius: 16rpx;
}

.user-info {
	display: flex;
	align-items: center;
	position: relative;
}

.avatar-wrapper {
	margin-right: 30rpx;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	background-color: #f0f0f0;
}

.tag {
	width: 30rpx;
	height: 30rpx;
}

.user-details {
	flex: 1;
}

.username {
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 12rpx;
}

.user-id {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 8rpx;
}

.join-date {
	font-size: 28rpx;
	color: #666;
}

.edit-icon {
	position: absolute;
	right: 0;
	top: auto;
}

/* 数据统计卡片 */
.stats-card {
	margin: 24rpx;
	padding: 20rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		padding: 24rpx
	}

	.stats-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 30rpx;
	}

	.bground {
		background-color: #e8f0fe;
		padding: 20rpx;
		margin: 0 20rpx;
		border-radius: 20rpx;
	}

	.stats-item {
		text-align: center;
		flex: 1;

		.stats-number {
			font-size: 38rpx;
			color: #333;
			margin-bottom: 8rpx;

			&.blue {
				font-weight: 600;
				color: #3D6AFF;
			}
		}

		.stats-label {
			font-size: 24rpx;
			color: #666;
		}
	}
}

/* 快捷功能 */
.quick-actions {
	margin: 0 24rpx 24rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		padding: 24rpx
	}

	.action-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
		padding: 20rpx 20rpx 40rpx;
	}

	.action-item {
		text-align: center;

		.action-icon-bg {
			width: 80rpx;
			height: 80rpx;
			background-color: #f0f4ff;
			border-radius: 50%;
			margin: 0 auto 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.action-icon {
			width: 80rpx;
			height: 80rpx;
		}

		.action-label {
			font-size: 24rpx;
			color: #666;
			margin-top: 12rpx;
		}
	}
}

/* 客户管理 */
.client-management {
	margin: 0 24rpx 24rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}

		.section-more {
			color: #3D6AFF;
			font-size: 28rpx;
		}
	}

	.client-list {
		padding: 0 24rpx 24rpx;
	}

	.loading-container, .empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 80rpx 0;
		
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
			background-color: #3D6AFF;
			color: #fff;
			border: none; 
			border-radius: 40rpx;
			font-size: 28rpx;
			margin-top: 30rpx;
		}
	}

	.client-item {
		padding: 32rpx;
		border-bottom: 1rpx solid #f0f0f0;
		cursor: pointer;

		&:last-child {
			border-bottom: none;
		}
		
		&:active {
			background-color: #f8f9fa;
		}
		
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
			
			.tag {
				padding: 8rpx 16rpx;
				border-radius: 20rpx;
				font-size: 22rpx;
			}
		}
	}
}

/* 最新需求 */
.recent-needs {
	margin: 0 24rpx 24rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}

		.section-more {
			font-size: 28rpx;
			color: #3D6AFF;
		}
	}

	.needs-list {
		padding: 0 24rpx 24rpx;
	}

	.need-item {
		padding: 24rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
		margin-bottom: 16rpx;
		cursor: pointer;

		&:last-child {
			margin-bottom: 0;
		}
		
		&:active {
			background-color: #e9ecef;
		}

		.need-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 8rpx;

			.need-title {
				font-size: 30rpx;
				color: #333;
				flex: 1;
				margin-right: 16rpx;
			}

			.need-type, .need-status {
				font-size: 24rpx;
				color: #3D6AFF;
				background-color: #f0f4ff;
				padding: 4rpx 12rpx;
				border-radius: 16rpx;
			}
			
			.need-status {
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
				
				&.status-default {
					background-color: #f8f9fa;
					color: #6c757d;
				}
			}
		}

		.need-company {
			font-size: 26rpx;
			color: #666;
			margin-bottom: 8rpx;
		}

		.need-budget {
			font-size: 28rpx;
			color: #ff6b35;
			margin-bottom: 8rpx;
		}

		.need-time {
			font-size: 24rpx;
			color: #999;
		}
	}
	
	.empty-container {
		text-align: center;
		padding: 60rpx 0;
		
		.empty-text {
			font-size: 28rpx;
			color: #999;
		}
	}
}

/* 待办事项 */
.todo-section {
	margin: 0 24rpx 24rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}

		.section-more {
			color: #3D6AFF;
			font-size: 28rpx;
		}
	}

	.todo-list {
		padding: 0 24rpx 24rpx;
	}

	.todo-item {
		display: flex;
		align-items: center;
		padding: 24rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
		margin-bottom: 16rpx;
		cursor: pointer;

		&:last-child {
			margin-bottom: 0;
		}
		
		&:active {
			background-color: #e9ecef;
		}

		.todo-icon {
			width: 60rpx;
			height: 60rpx;
			background-color: #fff;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 24rpx;
		}

		.todo-content {
			flex: 1;
			
			.todo-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 8rpx;
				
				.todo-title {
					font-size: 30rpx;
					color: #333;
					flex: 1;
					margin-right: 16rpx;
				}
				
				.todo-status {
					font-size: 22rpx;
					padding: 4rpx 12rpx;
					border-radius: 16rpx;
					white-space: nowrap;
					background-color: #f0f4ff;
					color: #2979ff;
				}
			}

			.todo-desc {
				font-size: 26rpx;
				color: #666;
			}
		}

		.todo-time {
			font-size: 24rpx;
			color: #999;
		}
	}
}

/* 企业主页管理 */
.section {
	background: #fff;
	margin: 0 24rpx 24rpx;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx;
	
}

.section-title {
	font-size: 32rpx;
	font-weight: 400;
	color: #333;
}

.management-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(150rpx, 1fr));
	gap: 20rpx;
	padding: 0rpx 32rpx 32rpx 32rpx;

}

.management-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx;
	background-color: #f9f9f9;
	border-radius: 12rpx;
	text-align: center;
}

.management-icon {
	margin-bottom: 10rpx;
}

.management-title {
	font-size: 24rpx;
	color: #333;
	white-space: nowrap;
}

/*底部认证*/
.function-section {
	background-color: #fff;
	padding: 0 30rpx;
	margin: 24rpx 20rpx;
	border-radius: 16rpx;
}

.function-item {
	display: flex;
	align-items: center;
	height: 100rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.function-item:last-child {
	border-bottom: none;
}

.function-icon {
	margin-right: 24rpx;
}

.function-text {
	flex: 1;
	font-size: 30rpx;
	color: #333;
}

.function-status {
	font-size: 28rpx;
	color: #999;
	margin-right: 12rpx;
}

.notification-badge {
	background-color: #ff4757;
	color: #fff;
	font-size: 20rpx;
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
	margin-right:12rpx;
	min-width: 32rpx;
	text-align: center;
}
</style>

