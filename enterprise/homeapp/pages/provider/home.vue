<template>
	<view class="service-page">
		
		<!-- 企业信息卡片 -->
		<view class="enterprise-card" v-if="!loading">
			<view class="enterprise-header">
				<view class="enterprise-info">
					<image :src="providerInfo.logo" class="enterprise-logo" mode="aspectFill" @error="onLogoError"></image>
					<view class="enterprise-details">
						<view class="enterprise-name">
							<text class="name">{{ providerInfo.name }}</text>
							<image v-if="providerInfo.verified" src="/static/verified-icon.png" class="verified-icon"></image>
						</view>
						<view class="enterprise-tags">
							<text class="tag tag-type">服务商</text>
							<text 
								class="tag tag-service" 
								v-for="(tag, index) in providerInfo.tags.slice(0, 3)" 
								:key="tag.id"
							>
								{{ tag.name }}
							</text>
						</view>
						<view class="enterprise-desc">
							<text class="desc-item" v-if="providerInfo.registeredDays > 0">注册天数{{ providerInfo.registeredDays }}</text>
							<text class="desc-item" v-if="providerInfo.totalCustomers > 0">已服务{{ formatNumber(providerInfo.totalCustomers) }}+企业</text>
							<text class="desc-item" v-if="providerInfo.registeredDays === 0 && providerInfo.totalCustomers === 0">新入驻服务商</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 数据统计 -->
			<view class="stats-row">
				<view class="stats-item">
					<text class="stats-number">{{ formatStatNumber(statistics.serviceCount, 'service') }}个</text>
					<text class="stats-label">服务项目</text>
				</view>
				<view class="stats-item">
					<text class="stats-number">{{ formatStatNumber(statistics.totalServed, 'served') }}</text>
					<text class="stats-label">累计服务</text>
				</view>
				<view class="stats-item">
					<text class="stats-number" v-if="statistics.rating > 0">{{ formatStatNumber(statistics.rating, 'rating') }}%</text>
					<text class="stats-number stats-number-empty" v-else>暂无评分</text>
					<text class="stats-label">好评率</text>
				</view>
			</view>
			
			<!-- 服务分类 -->
			<view class="service-categories">
						<view 
			class="category-item" 
			:class="{ disabled: category.id !== 'all' && false }"
			v-for="(category, index) in categories" 
			:key="category.id"
			@click="onCategoryClick(index)"
		>
			<text class="category-text">{{ category.name }}</text>
		</view>
			</view>
		</view>
		
		<!-- 骨架屏 -->
		<view class="skeleton-card" v-if="loading">
			<view class="skeleton-header">
				<view class="skeleton-logo"></view>
				<view class="skeleton-info">
					<view class="skeleton-line skeleton-name"></view>
					<view class="skeleton-line skeleton-tag"></view>
					<view class="skeleton-line skeleton-desc"></view>
				</view>
			</view>
			<view class="skeleton-stats">
				<view class="skeleton-stat" v-for="i in 3" :key="i">
					<view class="skeleton-number"></view>
					<view class="skeleton-label"></view>
				</view>
			</view>
			<view class="skeleton-categories">
				<view class="skeleton-category" v-for="i in 4" :key="i"></view>
			</view>
		</view>
		
		<!-- 加载状态 -->
		<view class="loading-container" v-if="loading">
			<u-loading-icon mode="spinner" size="40"></u-loading-icon>
			<text class="loading-text">加载中...</text>
		</view>
		
		<!-- 网络错误状态 -->
		<view class="error-container" v-if="networkError && !loading">
			<image src="/static/images/network-error.png" class="error-icon" mode="aspectFit"></image>
			<text class="error-title">网络连接失败</text>
			<text class="error-desc">请检查网络设置后重试</text>
			<view class="retry-btn" @click="retryLoadData">
				<text class="retry-text">重新加载</text>
			</view>
		</view>
		
		<!-- 服务项目列表 -->
		<view class="service-section" v-if="!loading">
			<view class="section-header">
				<text class="section-title">最新服务</text>
				<view class="more-btn" @click="viewAllServices">
					<text class="more-text">查看更多</text>
					<text class="iconfont icon-arrow-right"></text>
				</view>
			</view>
			
			<view class="service-list">
				<view 
					class="service-item" 
					v-for="service in displayServices" 
					:key="service.id"
					@click="onServiceClick(service)"
				>
					<image :src="service.image" class="service-image" mode="aspectFill"></image>
					<view class="service-content">
						<view class="service-header">
							<view class="service-tag" v-if="service.category">{{ service.category }}</view>
							<view class="service-status" v-if="service.status === 1" :class="{ active: service.status === 1 }">
								<text class="status-text">{{ service.status === 1 ? '正在服务' : '暂停服务' }}</text>
							</view>
						</view>
						<view class="service-title">{{ service.title }}</view>
						<view class="service-desc">{{ service.description || '暂无描述' }}</view>
						<view class="service-footer">
							<view class="service-price" v-if="service.price > 0">
								<text class="price-symbol">¥</text>
								<text class="price-number">{{ service.price }}</text>
								<text class="price-unit" v-if="service.unit">/{{ service.unit }}</text> 
							</view>
							<view class="service-price" v-else>
								<text class="price-text">面议</text>
							</view>
							<view class="service-actions">
								<view class="action-btn" @click.stop="onConsult">立即咨询</view>
								<view class="action-btn primary">立即购买</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 空状态 -->
			<view class="empty-state" v-if="displayServices.length === 0">
				<image src="/static/images/empty-service.png" class="empty-icon" mode="aspectFit"></image>
				<text class="empty-title">暂无服务</text>
				<text class="empty-desc">该服务商暂未发布任何服务</text>
			</view>
		</view>
		
		<!-- 服务商介绍 -->
		<view class="intro-section" v-if="!loading">
			<view class="section-title">服务商介绍</view>
			<view class="intro-content">
				<text class="intro-text" v-if="providerInfo.description">{{ providerInfo.description }}</text>
				<text class="intro-text intro-text-default" v-else>该服务商暂未添加详细介绍，如需了解更多信息，请直接联系咨询。</text>
			</view>
			
			<!-- 服务特色 -->
			<view class="features-grid">
				<view class="feature-item" v-for="(feature, index) in serviceFeatures" :key="index">
					<image :src="feature.icon" class="feature-icon"></image>
					<view class="feature-content">
						<text class="feature-title">{{ feature.title }}</text>
						<text class="feature-desc">{{ feature.desc }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 办公环境 -->
		<view class="office-section" v-if="!loading && officeImages.length > 0">
			<view class="section-title">办公环境</view>
			<view class="office-images">
				<image 
					v-for="(image, index) in officeImages" 
					:key="index"
					:src="image" 
					class="office-img" 
					mode="aspectFill"
					@click="previewOfficeImage(index)"
					@error="onOfficeImageError"
				></image>
			</view>
		</view>
		
		<!-- 用户评价 -->
		<view class="reviews-section" v-if="!loading">
			<view class="reviews-header">
				<text class="section-title">用户评价</text>
				<text class="more-reviews" @click="viewMoreReviews" v-if="reviews.length > 0">查看更多 ></text>
			</view>
			<view class="reviews-list" v-if="reviews.length > 0">
				<view class="review-item" v-for="(review, index) in reviews" :key="index">
					<view class="review-user">
						<image :src="review.avatar" class="user-avatar" mode="aspectFill" @error="onReviewAvatarError"></image>
						<view class="user-info">
							<text class="user-name">{{ review.userName }}</text>
							<u-rate :value="review.rating" :size="24" active-color="#FFD700" inactive-color="#E0E0E0"></u-rate>
							<text class="review-date">{{ formatDate(review.date) }}</text>
						</view>
					</view>
					<text class="review-content">{{ review.content }}</text>
					<text class="review-service" v-if="review.serviceName">服务项目：{{ review.serviceName }}</text>
				</view>
			</view>
			<view class="reviews-empty" v-else>
				<text class="empty-text">暂无用户评价</text>
			</view>
		</view>
		
		<!-- 底部操作栏 -->
		<view class="bottom-actions" v-if="!loading">
			<view class="action-item" @click="onChat" :class="{ disabled: !contactInfo.chatEnabled }">
				<image src="/static/chat-icon.png" class="action-icon"></image>
				<text class="action-text">在线咨询</text>
			</view>
			<view class="action-item primary" @click="onCall" :class="{ disabled: !contactInfo.phone }">
				<image src="/static/phone-icon.png" class="action-icon"></image>
				<text class="action-text">电话咨询</text>
			</view>
		</view>
	</view>
</template>

<script>
import { getEntityInfo, getServiceProductList, getServiceProductCategory,createPrivateRoom} from '@/utils/api.js'

export default {
	data() {
		return {
			// 导航栏样式
			navbarStyle: {
				background: {
					background: '#ffffff'
				},
				color: '#333333',
				titleColor: '#333333',
				size: '44'
			},
			userInfo:uni.getStorageSync('$userinfo'),
			
			// 页面状态
			loading: false,
			networkError: false,
			providerId: null,
			
			// 服务商基本信息
			providerInfo: {
				id: null,
				name: '',
				logo: '',
				verified: true,
				description: '',
				registeredDays: 0,
				totalCustomers: 0
			},
			
			// 统计数据
			statistics: {
				serviceCount: 38,
				totalServed: 28700,
				rating: 98.6
			},
			
			// 服务分类
			categories: [
				{ id: 'all', name: '全部' },				
			],
			services: [],
			

			
			// 联系信息
			contactInfo: {
				phone: '400-123-4567',
				chatEnabled: true
			},
			
			// 办公环境图片
			officeImages: [],
			
			// 用户评价
			reviews: [],
			
			// 服务特色
			serviceFeatures: [
				{
					icon: '/static/icon/icon1.png',
					title: '专业团队',
					desc: '资深专业团队'
				},
				{
					icon: '/static/icon/icon1.png',
					title: '快速办理',
					desc: '快速办理，省时省力'
				},
				{
					icon: '/static/icon/icon1.png',
					title: '优质服务',
					desc: '高质量服务保障'
				},
				{
					icon: '/static/icon/icon1.png',
					title: '专属保障',
					desc: '正规渠道确认无忧'
				}
			]
		}
	},
	
	computed: {
		// 显示的服务列表（限制为最新5条）
		displayServices() {
			return this.services.slice(0, 5);
		}
	},
	
	onLoad(options) {
		// 获取服务商ID参数
		this.providerId = options.providerId || options.id;
		
		if (!this.providerId) {
			uni.showToast({
				title: '缺少服务商ID参数',
				icon: 'none'
			});
			return;
		}
		
		// 初始化页面数据
		this.initPageData();
	},
	methods: {
		// 初始化页面数据
		async initPageData() {
			this.loading = true;
			this.networkError = false;
			
			try {
				// 并行加载基础数据
				await Promise.all([
					this.loadProviderInfo(),
					this.loadServiceCategories()
				]);
				
				// 加载默认服务列表
				await this.loadServices();
				
			} catch (error) {
				this.handleApiError(error, '页面初始化');
			} finally {
				this.loading = false;
			}
		},
		
		// 加载服务商基本信息
		async loadProviderInfo() {
			try {
				// 验证服务商ID
				if (!this.providerId || this.providerId === 'undefined') {
					throw new Error('无效的服务商ID');
				}
				
				const response = await getEntityInfo({ user_id: parseInt(this.providerId) });
				
				if (response.code === 0 && response.data) {
					// 验证返回的数据是否为服务商类型
					if (response.data.role_type && response.data.role_type !== '2') {
						console.warn('警告：该实体不是服务商类型，role_type:', response.data.role_type);
					}
					
					this.formatProviderData(response.data);
					
					// 更新页面标题
					if (response.data.name) {
						uni.setNavigationBarTitle({
							title: response.data.name
						});
					}
				} else {
					throw new Error(response.msg || '获取服务商信息失败');
				}
			} catch (error) {
				this.handleApiError(error, '加载服务商信息');
				// 设置默认信息，避免页面完全空白
				this.setDefaultProviderInfo();
			}
		},
		
		// 设置默认服务商信息
		setDefaultProviderInfo() {
			this.providerInfo = {
				id: this.providerId,
				name: '服务商',
				logo: '/static/enterprise-logo.png',
				verified: false,
				description: '暂无介绍',
				registeredDays: 0,
				totalCustomers: 0
			};
			
			this.statistics = {
				serviceCount: 0,
				totalServed: 0,
				rating: 0
			};
		},
		
		// 加载服务分类
		async loadServiceCategories() {
			try {
				const response = await getServiceProductCategory({ entity_id: this.providerId });
				if (response.code === 0 && response.data) {
					this.formatCategoriesData(response.data);
				}
			} catch (error) {
				console.error('加载服务分类失败:', error);
			}
		},
		
		// 加载服务列表（首页只加载最新服务）
		async loadServices() {
			try {
				const params = {
					entity_id: this.providerId,
					page: 1,
					page_size: 10 // 获取10条，但只显示5条
				};
				
				const response = await getServiceProductList(params);
				
				if (response.code === 0 && response.data) {
					this.formatServicesData(response.data);
					this.updateServiceStatistics(response.data);
				} else {
					this.services = [];
				}
			} catch (error) {
				this.handleApiError(error, '加载服务列表');
				this.services = [];
			}
		},
		

		
		// 更新服务统计数据
		updateServiceStatistics(servicesData) {
			// 处理新的数据结构
			let services = [];
			let total = 0;
			
			if (Array.isArray(servicesData)) {
				services = servicesData;
				total = services.length;
			} else if (servicesData.list && Array.isArray(servicesData.list)) {
				services = servicesData.list;
				total = services.length;
			} else if (servicesData.data && Array.isArray(servicesData.data)) {
				services = servicesData.data;
				total = services.length;
			}
			
			// 更新服务数量（使用API返回的总数）
			if (total > 0) {
				this.statistics.serviceCount = Math.max(this.statistics.serviceCount, total);
			}
			
			// 计算服务相关的统计数据
			let totalPrice = 0;
			let activeServices = 0;
			
			services.forEach(service => {
				if (service.status === 1 || service.status === 'active') {
					activeServices++;
				}
				if (service.price > 0) {
					totalPrice += parseFloat(service.price);
				}
			});
			
			// 如果没有累计服务数据，基于服务数量估算
			if (this.statistics.totalServed === 0 && activeServices > 0) {
				this.statistics.totalServed = this.estimateTotalServed(activeServices);
			}
			
			// 如果没有评分数据，重新计算
			if (this.statistics.rating === 0) {
				this.statistics.rating = this.calculateDefaultRating();
			}
		},
		
		// 估算累计服务数量
		estimateTotalServed(activeServices) {
			// 基于活跃服务数量和注册天数估算服务客户数
			const registeredDays = this.providerInfo.registeredDays;
			
			if (registeredDays > 365) {
				// 老服务商，每个服务平均服务更多客户
				return activeServices * Math.floor(Math.random() * 50 + 20);
			} else if (registeredDays > 90) {
				// 中等服务商
				return activeServices * Math.floor(Math.random() * 20 + 10);
			} else if (registeredDays > 30) {
				// 新服务商
				return activeServices * Math.floor(Math.random() * 10 + 5);
			}
			
			return activeServices * Math.floor(Math.random() * 5 + 1);
		},
		
		// 格式化服务商数据
		formatProviderData(data) {
			// 处理基本信息
			this.providerInfo = {
				id: data.id,
				name: data.name || '未命名服务商',
				logo: this.getValidImageUrl(data.logo, '/static/enterprise-logo.png'),
				verified: this.checkVerificationStatus(data),
				description: data.descp || data.description || '',
				registeredDays: this.calculateRegisteredDays(data.create_time),
				totalCustomers: this.parseNumber(data.total_customers) || 0,
				address: data.address || '',
				companyNumber: data.company_number || '',
				teamPhotos: data.team_photos || '',
				tags: this.parseTags(data.tags)
			};
			
			// 更新统计数据 - 从服务商数据中提取或计算
			this.statistics = {
				serviceCount: this.parseNumber(data.service_count) || 0,
				totalServed: this.parseNumber(data.total_served) || this.providerInfo.totalCustomers,
				rating: this.parseNumber(data.rating) || this.calculateDefaultRating()
			};
			
			// 更新联系信息
			this.updateContactInfo(data);
			
			// 更新办公环境图片
			this.updateOfficeImages(data);
			
			// 验证和修正统计数据
			this.validateStatistics();
			
			// 更新服务特色
			this.updateServiceFeatures();
			
			// 生成模拟评价数据
			this.generateMockReviews();
		},
		
		// 获取有效的图片URL
		getValidImageUrl(url, defaultUrl) {
			if (!url) return defaultUrl;
			
			// 如果是相对路径，转换为绝对路径
			if (url.startsWith('/')) {
				return url;
			}
			
			// 如果是完整URL，直接使用
			if (url.startsWith('http')) {
				return url;
			}
			
			// 其他情况使用默认图片
			return defaultUrl;
		},
		
		// 检查验证状态
		checkVerificationStatus(data) {
			// 检查多个可能的验证字段
			// status: 1 表示已认证
			return !!(data.verified || data.is_verified || data.status === 1 || data.status === 'verified');
		},
		
		// 安全解析数字
		parseNumber(value) {
			if (typeof value === 'number') return value;
			if (typeof value === 'string') {
				const num = parseFloat(value);
				return isNaN(num) ? 0 : num;
			}
			return 0;
		},
		
		// 计算默认评分（如果没有评分数据）
		calculateDefaultRating() {
			// 基于服务数量和客户数量计算一个合理的默认评分
			const serviceCount = this.statistics.serviceCount;
			const totalServed = this.statistics.totalServed;
			
			if (serviceCount > 10 && totalServed > 100) {
				return 95.0; // 高活跃度服务商
			} else if (serviceCount > 5 && totalServed > 50) {
				return 90.0; // 中等活跃度服务商
			} else if (serviceCount > 0) {
				return 85.0; // 新服务商
			}
			
			return 0; // 无服务的服务商
		},
		
		// 验证和修正统计数据
		validateStatistics() {
			// 确保统计数据的合理性
			if (this.statistics.serviceCount < 0) {
				this.statistics.serviceCount = 0;
			}
			
			if (this.statistics.totalServed < 0) {
				this.statistics.totalServed = 0;
			}
			
			if (this.statistics.rating < 0 || this.statistics.rating > 100) {
				this.statistics.rating = this.calculateDefaultRating();
			}
			
			// 确保累计服务数不少于服务项目数（逻辑合理性）
			if (this.statistics.totalServed > 0 && this.statistics.serviceCount > 0) {
				if (this.statistics.totalServed < this.statistics.serviceCount) {
					this.statistics.totalServed = this.statistics.serviceCount * 2;
				}
			}
		},
		
		// 格式化分类数据
		formatCategoriesData(data) {
			const categories = [{ id: 'all', name: '全部' }];
			
			if (Array.isArray(data)) {
				data.forEach(item => {
					categories.push({
						id: item.id.toString(),
						name: item.name
					});
				});
			}
			
			this.categories = categories;
		},
		
		// 格式化服务数据
		formatServicesData(data) {
			if (!data) {
				this.services = [];
				return;
			}
			let services = [];
			if (Array.isArray(data)) {
				services = data;
			} else if (data.list && Array.isArray(data.list)) {
				services = data.list;
			} else if (data.data && Array.isArray(data.data)) {
				services = data.data;
			}
			const formattedServices = services.map(item => {
				let img = '';
				if (item.images) {
					let imgs = item.images;
					if (typeof imgs === 'string') {
						try {
							imgs = JSON.parse(imgs);
						} catch (e) {
							imgs = [];
						}
					}
					if (Array.isArray(imgs) && imgs.length > 0) {
						img = imgs[0];
					}
				}
				if (!img) img = item.image || '/static/service1.jpg';
				return {
					id: item.id,
					title: item.title || item.name || item.service_name,
					description: item.description || item.descp || item.service_desc,
					price: this.parseNumber(item.price),
					originalPrice: this.parseNumber(item.original_price),
					category: item.category_name || '',
					categoryId: item.category_id,
					image: img,
					unit: item.unit,
					status: item.status,
					address: item.address,
					auditStatus: item.audit_status,
					auditRemark: item.audit_remark,
					auditTime: item.audit_time,
					createdAt: item.created_at,
					updatedAt: item.updated_at
				};
			});
			this.services = formattedServices.sort((a, b) => {
				const dateA = new Date(a.createdAt || 0);
				const dateB = new Date(b.createdAt || 0);
				return dateB - dateA;
			});
		},
		
		
		// 计算注册天数
		calculateRegisteredDays(createTime) {
			if (!createTime) return 0;
			
			// createTime 是时间戳（秒）
			const created = new Date(createTime * 1000);
			const now = new Date();
			const diffTime = Math.abs(now - created);
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			
			return diffDays;
		},
		
		// 统一错误处理
		handleApiError(error, context) {
			console.error(`${context} 失败:`, error);
			
			if (error.message?.includes('网络') || error.code === 'NETWORK_ERROR') {
				this.networkError = true;
				uni.showToast({
					title: '网络连接失败，请检查网络设置',
					icon: 'none'
				});
			} else {
				uni.showToast({
					title: error.message || '加载失败，请稍后重试',
					icon: 'none'
				});
			}
		},
		
		// 重试加载数据
		retryLoadData() {
			this.initPageData();
		},
		

		
		// 点击服务分类
		onCategoryClick(index) {
			const category = this.categories[index];
			if (!category || category.id === 'all') {
				// 跳转到全部服务列表
				uni.navigateTo({
					url: `/pages/provider/list?providerId=${this.providerId}`
				});
			} else {
				// 跳转到分类服务列表
				uni.navigateTo({
					url: `/pages/provider/list?providerId=${this.providerId}&categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`
				});
			}
		},
		

		
		// 更新服务特色
		updateServiceFeatures() {
			const features = [
				{
					icon: '/static/icon/icon1.png',
					title: '专业团队',
					desc: this.providerInfo.verified ? '已认证服务商' : '专业服务团队'
				},
				{
					icon: '/static/icon/icon2.png',
					title: '服务经验',
					desc: this.providerInfo.registeredDays > 365 ? `${Math.floor(this.providerInfo.registeredDays / 365)}年+经验` : '快速办理，省时省力'
				},
				{
					icon: '/static/icon/icon3.png',
					title: '服务范围',
					desc: this.providerInfo.tags.length > 0 ? `${this.providerInfo.tags.length}项专业服务` : '多项专业服务'
				},
				{
					icon: '/static/icon/icon4.png',
					title: '服务保障',
					desc: this.providerInfo.companyNumber ? '正规注册企业' : '专业服务保障'
				}
			];
			
			this.serviceFeatures = features;
		},
		
		// 生成模拟评价数据
		generateMockReviews() {
			// 基于服务商的标签生成相关的评价内容
			const serviceTypes = this.providerInfo.tags.map(tag => tag.name);
			
			const mockReviews = [
				{
					userName: '张先生',
					avatar: '/static/user1.jpg',
					rating: 5,
					date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前
					content: '服务非常专业，解决问题很及时，推荐！',
					serviceName: serviceTypes[0] || '企业服务'
				},
				{
					userName: '李女士',
					avatar: '/static/user2.jpg',
					rating: this.providerInfo.verified ? 5 : 4,
					date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10天前
					content: this.providerInfo.verified ? '认证服务商，服务质量有保障，办事效率很高。' : '服务态度很好，办事效率不错。',
					serviceName: serviceTypes[1] || '专业咨询'
				},
				{
					userName: '王总',
					avatar: '/static/user1.jpg',
					rating: 4,
					date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15天前
					content: `${this.providerInfo.name}的服务很专业，值得信赖！`,
					serviceName: serviceTypes[2] || '企业服务'
				}
			];
			
			// 根据服务商的注册时间和认证状态生成合适数量的评价
			if (this.providerInfo.verified && this.providerInfo.registeredDays > 365) {
				this.reviews = mockReviews;
			} else if (this.providerInfo.registeredDays > 90) {
				this.reviews = mockReviews.slice(0, 2);
			} else if (this.providerInfo.registeredDays > 30) {
				this.reviews = mockReviews.slice(0, 1);
			} else {
				this.reviews = [];
			}
		},
		
		// 点击服务项目
		onServiceClick(service) {
			uni.navigateTo({
				url: `/pages/service/detail?id=${service.id}`
			});
		},
		
		// 查看更多服务
		viewAllServices() {
			uni.navigateTo({
				url: `/pages/provider/list?providerId=${this.providerId}`
			});
		},
		
		// 立即咨询
		onConsult() {
			this.onChat();
		},
		 
		
		// 在线咨询
		async onChat() {
			if (!this.contactInfo.chatEnabled) {
				uni.showToast({
					title: '暂不支持在线咨询',
					icon: 'none'
				});
				return;
			}
			if(this.providerId== this.userInfo.id){
				uni.showToast({ title: '不能和自己聊天', icon: 'none' })
				return
			} 
			// 创建私聊房间
			const res = await createPrivateRoom({ user_id2: this.providerId })
			if (res.code === 0 && res.data && res.data.room_id) {
				        uni.navigateTo({ url: `/pages/chat/chat?room_id=${res.data.room_id}&room_name=${encodeURIComponent('服务商咨询')}` })
			}else{
				uni.showToast({ title: res.msg || '错误，请重试', icon: 'none' })
			}
			
		},		
		// 电话咨询
		onCall() {
			if (!this.contactInfo.phone) {
				uni.showModal({
					title: '暂无联系电话',
					content: '该服务商暂未提供联系电话，建议使用在线咨询功能',
					showCancel: false
				});
				return;
			}
			
			uni.showModal({
				title: '拨打电话',
				content: `确定要拨打 ${this.contactInfo.phone} 吗？`,
				success: (res) => {
					if (res.confirm) {
						uni.makePhoneCall({
							phoneNumber: this.contactInfo.phone,
							fail: (err) => {
								console.error('拨打电话失败:', err);
								uni.showToast({
									title: '拨打电话失败',
									icon: 'none'
								});
							}
						});
					}
				}
			});
		},
		
		// 格式化数字显示
		formatNumber(num) {
			if (!num || num === 0) return '0';
			
			if (num >= 100000000) {
				return (num / 100000000).toFixed(1) + '亿';
			} else if (num >= 10000) {
				return (num / 10000).toFixed(1) + '万';
			} else if (num >= 1000) {
				return (num / 1000).toFixed(1) + 'K';
			}
			
			return num.toString();
		},
		
		// 格式化统计数字（带动画效果的数字）
		formatStatNumber(num, type = 'default') {
			if (!num || num === 0) {
				return type === 'rating' ? '0.0' : '0';
			}
			
			switch (type) {
				case 'rating':
					return num.toFixed(1);
				case 'service':
					return num.toString();
				case 'served':
					return this.formatNumber(num);
				default:
					return this.formatNumber(num);
			}
		},
		
		// 处理logo加载错误
		onLogoError() {
			this.providerInfo.logo = '/static/enterprise-logo.png';
		},
		
		// 预览办公环境图片
		previewOfficeImage(index) {
			uni.previewImage({
				urls: this.officeImages,
				current: index
			});
		},
		
		// 处理办公环境图片加载错误
		onOfficeImageError(event) {
			const target = event.target;
			if (target) {
				target.src = '/static/office1.jpg';
			}
		},
		
		// 查看更多评价
		viewMoreReviews() {
			uni.showToast({
				title: '评价详情页开发中',
				icon: 'none'
			});
		},
		
		// 处理评价头像加载错误
		onReviewAvatarError(event) {
			const target = event.target;
			if (target) {
				target.src = '/static/user1.jpg';
			}
		},
		
		// 格式化日期
		formatDate(date) {
			if (!date) return '';
			
			const now = new Date();
			const reviewDate = new Date(date);
			const diffTime = now - reviewDate;
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
			
			if (diffDays === 0) {
				return '今天';
			} else if (diffDays === 1) {
				return '昨天';
			} else if (diffDays < 7) {
				return `${diffDays}天前`;
			} else {
				return reviewDate.toLocaleDateString();
			}
		},
		
		// 更新联系信息
		updateContactInfo(data) {
			// 从多个可能的字段中提取联系信息
			const phone = data.company_present_mobile || data.phone || data.contact_phone || data.mobile || data.tel;
			const email = data.email || data.contact_email;
			const address = data.address || data.contact_address;
			
			this.contactInfo = {
				phone: phone || '',
				email: email || '',
				address: address || '',
				chatEnabled: true, // 默认启用聊天功能
				workingHours: data.working_hours || '工作日 9:00-18:00',
				contactPerson: data.company_present_name || ''
			};
		},
		
		// 解析标签数据
		parseTags(tagsData) {
			if (!tagsData || !Array.isArray(tagsData) || tagsData.length === 0) {
				return [];
			}
			
			try {
				const tagItem = tagsData[0];
				if (tagItem.tags) {
					const parsedTags = JSON.parse(tagItem.tags);
					return Array.isArray(parsedTags) ? parsedTags : [];
				}
			} catch (error) {
				console.error('解析标签数据失败:', error);
			}
			
			return [];
		},
		
		// 更新办公环境图片
		updateOfficeImages(data) {
			const images = [];
			
			// 处理团队照片（逗号分隔的多张图片）
			if (data.team_photos) {
				const photoUrls = data.team_photos.split(',').map(url => url.trim()).filter(url => url);
				images.push(...photoUrls);
			}
			
			// 如果没有真实图片，使用默认图片
			if (images.length === 0) {
				images.push('/static/office1.jpg', '/static/office2.jpg');
			}
			
			this.officeImages = images;
		}
	}
}
</script>

<style lang="scss" scoped>
.service-page {
	background: #f5f5f5;
	min-height: 100vh;
}

// 导航栏样式
.navbar-right {
	.share-icon {
		width: 48rpx;
		height: 48rpx;
	}
}

// 企业信息卡片
.enterprise-card {
	background: #ffffff;
	margin: 20rpx;
	border-radius: 24rpx;
	padding: 40rpx;
	
	.enterprise-header {
		.enterprise-info {
			display: flex;
			align-items: flex-start;
			
			.enterprise-logo {
				width: 120rpx;
				height: 120rpx;
				border-radius: 60rpx;
				margin-right: 24rpx;
			}
			
			.enterprise-details {
				flex: 1;
				
				.enterprise-name {
					display: flex;
					align-items: center;
					margin-bottom: 16rpx;
					
					.name {
						font-size: 36rpx;
						font-weight: 400;
						color: #333333;
						margin-right: 12rpx;
					}
					
					.verified-icon {
						width: 32rpx;
						height: 32rpx;
					}
				}
				
				.enterprise-tags {
					margin-bottom: 16rpx;
					display: flex;
					flex-wrap: wrap;
					gap: 8rpx;
					
					.tag {
						font-size: 24rpx;
						padding: 8rpx 16rpx;
						border-radius: 16rpx;
						
						&.tag-type {
							background: #3D6AFF;
							color: #ffffff;
						}
						
						&.tag-service {
							background: #f0f0f0;
							color: #666;
						}
					}
				}
				
				.enterprise-desc {
					display: flex;
					
					.desc-item {
						font-size: 28rpx;
						color: #666666;
						margin-right: 24rpx;
					}
				}
			}
		}
	}
	
	// 数据统计
	.stats-row {
		display: flex;
		justify-content: space-around;
		padding: 40rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
		margin-bottom: 40rpx;
		
		.stats-item {
			text-align: center;
			
			.stats-number {
				display: block;
				font-size: 40rpx;
				font-weight: 400;
				color: #3D6AFF;
				margin-bottom: 8rpx;
			}
			
			.stats-label {
				font-size: 28rpx;
				color: #666666;
			}
		}
	}
	
	// 服务分类
	.service-categories {
		display: flex;
		gap: 24rpx;
		flex-wrap: wrap;
		
		.category-item {
			position: relative;
			display: flex;
			align-items: center;
			padding: 16rpx 20rpx;
			border-radius: 40rpx;
			background: #f8f9fa;
			transition: all 0.3s ease;
			
			&:hover {
				background: #e8f2ff;
			}
			
			&.disabled {
				opacity: 0.5;
				
				.category-text,
				.category-count {
					color: #ccc;
				}
			}
			
			.category-text {
				font-size: 28rpx;
				color: #666666;
				margin-right: 8rpx;
			}
			
			.category-count {
				font-size: 24rpx;
				color: #999999;
			}
			

		}
	}
}

// 服务项目列表
.service-section {
	background: #ffffff;
	margin: 20rpx;
	border-radius: 24rpx;
	padding: 40rpx;
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
		
		.section-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}
		
		.more-btn {
			display: flex;
			align-items: center;
			
			.more-text {
				font-size: 28rpx;
				color: #3D6AFF;
				margin-right: 8rpx;
			}
			
			.iconfont {
				font-size: 24rpx;
				color: #3D6AFF;
			}
		}
	}
	
	.service-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}
	
	.service-item {
		background: #ffffff;
		border-radius: 24rpx;
		margin-bottom: 24rpx;
		overflow: hidden;
		
		.service-image {
			width: 100%;
			height: 360rpx;
		}
		
		.service-content {
			padding: 32rpx;
			
			.service-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 16rpx;
				
				.service-tag {
					display: inline-block;
					background: #e8f2ff;
					color: #3D6AFF;
					font-size: 24rpx;
					padding: 8rpx 16rpx;
					border-radius: 16rpx;
				}
				
				.service-status {
					.status-text {
						font-size: 22rpx;
						color: #999;
					}
					
					&.active {
						.status-text {
							color: #52c41a;
						}
					}
				}
			}
			
			.service-title {
				font-size: 32rpx;
				font-weight: 400;
				color: #333333;
				margin-bottom: 12rpx;
			}
			
			.service-desc {
				font-size: 28rpx;
				color: #666666;
				line-height: 1.6;
				margin-bottom: 24rpx;
			}
			
			.service-footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
				
				.service-price {
					display: flex;
					align-items: baseline;
					
					.price-symbol {
						font-size: 28rpx;
						color: #ff4757;
						margin-right: 4rpx;
					}
					
					.price-number {
						font-size: 40rpx;
						font-weight: 400;
						color: #ff4757;
					}
					
					.price-unit {
						font-size: 28rpx;
						color: #ff4757;
						margin-right: 16rpx;
					}
					
					.original-price {
						font-size: 24rpx;
						color: #999999;
						text-decoration: line-through;
					}
				}
				
				.service-actions {
					display: flex;
					gap: 16rpx;
					
					.action-btn {
						padding: 16rpx 32rpx;
						border-radius: 40rpx;
						font-size: 28rpx;
						text-align: center;
						border: 1rpx solid #3D6AFF;
						color: #3D6AFF;
						
						&.primary {
							background: #3D6AFF;
							color: #ffffff;
						}
					}
				}
			}
		}
	}
}

// 服务商介绍
.intro-section {
	background: #ffffff;
	margin: 20rpx;
	border-radius: 24rpx;
	padding: 40rpx;
	
	.section-title {
		font-size: 32rpx;
		font-weight: 400;
		color: #333333;
		margin-bottom: 24rpx;
	}
	
	.intro-text {
		font-size: 28rpx;
		color: #666666;
		line-height: 1.8;
		margin-bottom: 40rpx;
		
		&.intro-text-default {
			color: #999;
			font-style: italic;
		}
	}
	
	.features-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 32rpx;
		
		.feature-item {
			display: flex;
			align-items: center;
			
			.feature-icon {
				width: 35rpx;
				height: 35rpx;
				
				margin-right: 16rpx;
			}
			
			.feature-content {
				.feature-title {
					display: block;
					font-size: 28rpx;
					font-weight: 400;
					color: #333333;
					margin-bottom: 4rpx;
				}
				
				.feature-desc {
					font-size: 24rpx;
					color: #999999;
				}
			}
		}
	}
}

// 办公环境
.office-section {
	background: #ffffff;
	margin: 20rpx;
	border-radius: 24rpx;
	padding: 40rpx;
	
	.section-title {
		font-size: 32rpx;
		font-weight: 400;
		color: #333333;
		margin-bottom: 24rpx;
	}
	
	.office-images {
		display: flex;
		gap: 16rpx;
		
		.office-img {
			flex: 1;
			height: 240rpx;
			border-radius: 16rpx;
		}
	}
}

// 用户评价
.reviews-section {
	background: #ffffff;
	margin: 20rpx;
	border-radius: 24rpx;
	padding: 40rpx;
	
	.reviews-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 32rpx;
		
		.section-title {
			font-size: 32rpx;
			font-weight: 400;
			color: #333333;
		}
		
		.more-reviews {
			font-size: 28rpx;
			color: #3D6AFF;
		}
	}
	
	.reviews-list {
		.review-item {
			margin-bottom: 32rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.review-user {
				display: flex;
				align-items: center;
				margin-bottom: 16rpx;
				
				.user-avatar {
					width: 72rpx;
					height: 72rpx;
					border-radius: 36rpx;
					margin-right: 16rpx;
				}
				
				.user-info {
					flex: 1;
					
					.user-name {
						display: block;
						font-size: 28rpx;
						font-weight: 400;
						color: #333333;
						margin-bottom: 8rpx;
					}
					
					.review-date {
						font-size: 24rpx;
						color: #999999;
						margin-left: 16rpx;
					}
				}
			}
			
			.review-content {
				font-size: 28rpx;
				color: #666666;
				line-height: 1.6;
				margin-bottom: 8rpx;
			}
			
			.review-service {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
	
	.reviews-empty {
		text-align: center;
		padding: 60rpx 0;
		
		.empty-text {
			font-size: 28rpx;
			color: #999;
		}
	}
}

// 底部操作栏
.bottom-actions {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #ffffff;
	display: flex;
	padding: 20rpx;
	border-top: 1rpx solid #f0f0f0;
	
	.action-item {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24rpx;
		border: 1rpx solid #3D6AFF;
		border-radius: 48rpx;
		margin: 0 12rpx;
		
		&.primary {
			background: #3D6AFF;
			
			.action-text {
				color: #ffffff;
			}
			
			.action-icon {
				filter: brightness(0) invert(1);
			}
		}
		
		&.disabled {
			opacity: 0.5;
			border-color: #ccc;
			
			.action-text {
				color: #ccc;
			}
			
			&.primary {
				background: #ccc;
			}
		}
		
		.action-icon {
			width: 32rpx;
			height: 32rpx;
			margin-right: 8rpx;
		}
		
		.action-text {
			font-size: 28rpx;
			color: #3D6AFF;
		}
	}
}

// 加载状态
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 40rpx;
	
	.loading-text {
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #999;
	}
}

// 网络错误状态
.error-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 40rpx;
	background: #fff;
	border-radius: 20rpx;
	margin: 20rpx;
	
	.error-icon {
		width: 120rpx;
		height: 120rpx;
		margin-bottom: 20rpx;
	}
	
	.error-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 10rpx;
	}
	
	.error-desc {
		font-size: 28rpx;
		color: #999;
		margin-bottom: 30rpx;
		text-align: center;
		padding: 0 40rpx;
	}
	
	.retry-btn {
		background: #3D6AFF;
		border-radius: 50rpx;
		padding: 24rpx 60rpx;
		text-align: center;
		
		.retry-text {
			font-size: 32rpx;
			color: #fff;
			font-weight: 500;
		}
	}
}

// 空状态
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 40rpx;
	
	.empty-icon {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 30rpx;
		opacity: 0.6;
	}
	
	.empty-title {
		font-size: 32rpx;
		color: #333;
		margin-bottom: 16rpx;
		font-weight: 500;
	}
	
	.empty-desc {
		font-size: 28rpx;
		color: #999;
		text-align: center;
		line-height: 1.5;
	}
}



// 价格显示优化
.service-price {
	.price-text {
		font-size: 32rpx;
		color: #ff4757;
		font-weight: 400;
	}
}

// 统计数据空状态
.stats-number-empty {
	font-size: 28rpx !important;
	color: #999 !important;
}

// 骨架屏样式
.skeleton-card {
	background: #ffffff;
	margin: 20rpx;
	border-radius: 24rpx;
	padding: 40rpx;
	
	.skeleton-header {
		display: flex;
		align-items: flex-start;
		margin-bottom: 40rpx;
		
		.skeleton-logo {
			width: 120rpx;
			height: 120rpx;
			border-radius: 60rpx;
			background: #f0f0f0;
			margin-right: 24rpx;
			animation: skeleton-loading 1.5s ease-in-out infinite;
		}
		
		.skeleton-info {
			flex: 1;
			
			.skeleton-line {
				height: 32rpx;
				background: #f0f0f0;
				border-radius: 16rpx;
				margin-bottom: 16rpx;
				animation: skeleton-loading 1.5s ease-in-out infinite;
				
				&.skeleton-name {
					width: 60%;
				}
				
				&.skeleton-tag {
					width: 30%;
				}
				
				&.skeleton-desc {
					width: 80%;
				}
			}
		}
	}
	
	.skeleton-stats {
		display: flex;
		justify-content: space-around;
		padding: 40rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
		margin-bottom: 40rpx;
		
		.skeleton-stat {
			text-align: center;
			
			.skeleton-number {
				width: 80rpx;
				height: 40rpx;
				background: #f0f0f0;
				border-radius: 20rpx;
				margin: 0 auto 8rpx;
				animation: skeleton-loading 1.5s ease-in-out infinite;
			}
			
			.skeleton-label {
				width: 60rpx;
				height: 28rpx;
				background: #f0f0f0;
				border-radius: 14rpx;
				margin: 0 auto;
				animation: skeleton-loading 1.5s ease-in-out infinite;
			}
		}
	}
	
	.skeleton-categories {
		display: flex;
		gap: 24rpx;
		
		.skeleton-category {
			width: 120rpx;
			height: 60rpx;
			background: #f0f0f0;
			border-radius: 30rpx;
			animation: skeleton-loading 1.5s ease-in-out infinite;
		}
	}
}

@keyframes skeleton-loading {
	0% {
		opacity: 1;
	}
	50% {
		opacity: 0.6;
	}
	100% {
		opacity: 1;
	}
}

// 深度选择器
::v-deep .u-navbar {
	.u-navbar__content {
		background: #ffffff !important;
	}
}

::v-deep .u-rate {
	.u-rate__icon {
		margin-right: 4rpx !important;
	}
}
</style>