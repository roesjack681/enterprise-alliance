<template>
	<view class="container">
		<!-- 头部搜索栏 -->
		<view class="search-bar">
			<u-search placeholder="搜索团队成员名称或标签" v-model="searchKeyword" @search="handleSearch" 
				@custom="handleSearch" bg-color="#f5f5f5" height="80" margin="20rpx" :show-action="false"
				search-icon-size="36">
			</u-search>
		</view>

		<!-- 团队列表 -->
		<view class="team-list">
			<view v-if="loading" class="loading-container">
				<u-loading-icon mode="spinner" size="40"></u-loading-icon>
				<text class="loading-text">加载中...</text>
			</view>
			
			<view v-else-if="filteredList.length === 0" class="empty-container">
				<image src="/static/icon/m4.png" class="empty-icon" mode="aspectFit"></image>
				<text class="empty-text">{{ searchKeyword ? '暂无搜索结果' : '暂无团队成员' }}</text>
				<text class="empty-tip" v-if="!searchKeyword">您还没有团队成员，快去邀请同事加入吧~</text>
			</view>
			
			<view v-else>
				<view class="team-item" v-for="(item, index) in filteredList" :key="item.id" >
					<view class="team-header">
						<view class="team-info">
							<image v-if="item.avatar" :src="item.avatar" class="team-avatar" mode="aspectFit"></image>
							<image v-else src="/static/img/avatar.png" class="team-avatar" mode="aspectFit"></image>
							<view class="team-text">
								<view class="team-name">{{ item.name || '未命名成员' }}</view>
								<!-- <view class="team-enterprise" v-if="item.enterprise_name">{{ item.enterprise_name }}</view> -->
							</view>
						</view>
						<view class="team-role" :class="item.roleClass">{{ item.roleText }}</view>
					</view>
					
					<view class="team-details">
						<view class="detail-row" v-if="item.phone">
							<text class="detail-label">联系电话:</text>
							<text class="detail-value">{{ formatPhone(item.phone) }}</text>
						</view>
						<view class="detail-row" v-if="item.email">
							<text class="detail-label">邮箱:</text>
							<text class="detail-value">{{ item.email }}</text>
						</view>
						<view class="detail-row" v-if="item.join_time">
							<text class="detail-label">加入时间:</text>
							<text class="detail-value">{{ formatTime(item.join_time) }}</text>
						</view>
					</view>
					
					<!-- 标签区域 -->
					<view class="team-tags">
						<view class="tag" v-for="(tag, tagIndex) in item.tags" :key="tagIndex"
							:style="tag.styleString">
							{{ tag.name }}
						</view>
						<view class="add-tag-btn" @click="showAddTagModal(item, index)">
							<u-icon name="plus" size="20" color="#999"></u-icon>
							<text class="add-tag-text">添加标签</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 添加标签底部弹窗 -->
		<u-popup :show="showTagModal" mode="bottom" border-radius="30" :safe-area-inset-bottom="true">
			<view class="tag-bottom-modal">
				<!-- 弹窗头部 -->
				<view class="modal-header">
					<view class="header-title">添加成员标签</view>
					<view class="close-btn" @click="hideTagModal">
						<u-icon name="close" size="24" color="#999"></u-icon>
					</view>
				</view>
				
				<!-- 备注说明 -->
				<view class="modal-tips">
					<view class="tips-title">
						<u-icon name="info-circle" size="24" color="#2196f3"></u-icon>
						<text class="tips-text">标签建议</text>
					</view>
					<view class="tips-content">
						建议标记相关：<text class="highlight">基础信息</text>、<text class="highlight">关系深度</text>、<text class="highlight">合作表现</text>、<text class="highlight">未来潜力</text>等几方面
					</view>
				</view>
				
				<!-- 快速标签选择 -->
				<view class="quick-tags-section">
					<view class="section-title">常用标签</view>
					<view class="quick-tags">
						<view 
							class="quick-tag" 
							v-for="(tag, index) in quickTags" 
							:key="index"
							:class="{ active: selectedQuickTag === tag }"
							:style="tag.styleString"
							@click="selectQuickTag(tag)"
						>
							{{ tag.name }}
						</view>
					</view>
				</view>
				
				<!-- 自定义标签输入 -->
				<view class="custom-tag-section">
					<view class="section-title">自定义标签</view>
					<view class="input-wrapper">
						<u-input 
							v-model="newTagName" 
							placeholder="请输入标签名称（最多10个字符）" 
							maxlength="10" 
							border="surround"
							height="80"
						/>
					</view>
				</view>
				
				<!-- 颜色选择 -->
				<view class="color-picker-section">
					<view class="section-title">选择颜色</view>
					<view class="color-options">
						<view 
							class="color-item" 
							v-for="(color, index) in tagColors" 
							:key="index"
							:style="color.styleString"
							:class="{ active: selectedColor === color }"
							@click="selectColor(color)"
						>
							<u-icon v-if="selectedColor === color" name="checkmark" size="24" :color="color.text"></u-icon>
						</view>
					</view>
				</view>
				
				<!-- 当前成员已有标签 -->
				<view class="existing-tags-section" v-if="selectedMember && selectedMember.tags && selectedMember.tags.length > 0">
					<view class="section-title">当前标签</view>
					<view class="existing-tags">
						<view 
							class="existing-tag" 
							v-for="(tag, index) in selectedMember.tags" 
							:key="index"
							:style="tag.styleString"
						>
							{{ tag.name }}
							<view class="remove-tag" @click.stop="removeTag(index)">
								<u-icon name="close" size="16" color="#fff"></u-icon>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 底部按钮 -->
				<view class="modal-footer">
					<view class="btn-cancel" @click="hideTagModal">取消</view>
					<view class="btn-confirm" @click="addTag" :class="{ disabled: !canAddTag }">
						{{ selectedQuickTag || newTagName.trim() ? '添加标签' : '请输入标签' }}
					</view>
				</view>
			</view>
		</u-popup>

		<!-- 加载更多 -->
		<u-loadmore :status="loadmoreStatus" @loadmore="loadMore" v-if="filteredList.length > 0 && !searchKeyword" />
	</view>
</template>

<script>
import { getMyTeamList, updateTeamMemberTags } from '@/utils/api.js'

export default {
	data() {
		return {
			searchKeyword: '',
			loading: false,
			list: [],
			filteredList: [],
			page: 1,
			pageSize: 20,
			total: 0,
			loadmoreStatus: 'loadmore',
			
			// 标签相关
			showTagModal: false,
			newTagName: '',
			selectedMember: null,
			selectedMemberIndex: -1,
			selectedColor: { bg: '#2196f3', text: '#fff' },
			selectedQuickTag: null,
			
			// 预定义标签颜色
			tagColors: [
				{ bg: '#2196f3', text: '#fff', styleString: 'background-color: #2196f3;' },
				{ bg: '#4caf50', text: '#fff', styleString: 'background-color: #4caf50;' },
				{ bg: '#ff9800', text: '#fff', styleString: 'background-color: #ff9800;' },
				{ bg: '#f44336', text: '#fff', styleString: 'background-color: #f44336;' },
				{ bg: '#9c27b0', text: '#fff', styleString: 'background-color: #9c27b0;' },
				{ bg: '#607d8b', text: '#fff', styleString: 'background-color: #607d8b;' },
				{ bg: '#009688', text: '#fff', styleString: 'background-color: #009688;' },
				{ bg: '#ff5722', text: '#fff', styleString: 'background-color: #ff5722;' }
			],
			
			// 快速标签选项
			quickTags: [
				{ name: '重要客户', bg: '#ff5722', text: '#fff', styleString: '' },
				{ name: '潜在合作', bg: '#2196f3', text: '#fff', styleString: '' },
				{ name: '关系密切', bg: '#4caf50', text: '#fff', styleString: '' },
				{ name: '业务熟练', bg: '#ff9800', text: '#fff', styleString: '' },
				{ name: '新手', bg: '#9c27b0', text: '#fff', styleString: '' },
				{ name: '资深', bg: '#607d8b', text: '#fff', styleString: '' },
				{ name: '高潜力', bg: '#e91e63', text: '#fff', styleString: '' },
				{ name: '稳定合作', bg: '#009688', text: '#fff', styleString: '' }
			],
			
			// 角色映射
			roleMapping: {
				1: { class: 'role-admin', text: '超级管理员' },
				2: { class: 'role-admin', text: '管理员' },
				3: { class: 'role-leader', text: '团队长' },
				4: { class: 'role-member', text: '成员' },
				5: { class: 'role-intern', text: '实习生' },
				6: { class: 'role-member', text: '普通用户' },
				7: { class: 'role-leader', text: '服务商' },
				8: { class: 'role-member', text: '企业' },
				9: { class: 'role-member', text: '协会' },
				10: { class: 'role-member', text: '经纪人' }
			}
		}
	},
	
	computed: {
		// 是否可以添加标签
		canAddTag() {
			return this.selectedQuickTag || this.newTagName.trim();
		}
	},
	
	onLoad() {
		this.loadList(true);
	},
	
	methods: {
		// 加载团队列表
		async loadList(refresh = false) {
			if (refresh) {
				this.page = 1;
				this.list = [];
				this.filteredList = [];
			}
			
			if (this.loading) return;
			this.loading = true;
			
			try {
				const response = await getMyTeamList({
					page: this.page,
					page_size: this.pageSize
				});
				
				if (response.code === 0 && response.data) {
					const newList = response.data.list || [];
					
					// 处理数据，添加显示所需的字段
					const processedList = newList.map(item => {
						// 解析标签
						let tags = [];
						try {
							const rawTags = item.tags ? JSON.parse(item.tags) : [];
							tags = rawTags.map(tag => {
								const bgColor = tag.c || tag.color || '#2196f3';
								const textColor = '#fff';
								return {
									name: tag.n || tag.name || '',
									color: bgColor,
									textColor: textColor,
									styleString: `background-color: ${bgColor}; color: ${textColor};`
								};
							});
						} catch (e) {
							tags = [];
						}
						
						// 角色和关系信息
						const roleInfo = this.roleMapping[item.role] || { class: 'role-member', text: '成员' };
						const relationText = item.relation_type === 'superior' ? '上级' : 
											item.relation_type === 'subordinate' ? '下级' : '';
						
						return {
							id: item.entity_id,
							name: item.contact_person || item.enterprise_name || '未命名成员',
							enterprise_name: item.enterprise_name || '未知企业',
							avatar: item.logo || '',
							phone: item.contact_phone || '',
							email: item.contact_email || '',
							join_time: item.create_time,
							role: item.role,
							roleClass: roleInfo.class,
							roleText: roleInfo.text + (relationText ? `(${relationText})` : ''),
							tags: tags,
							relation_type: item.relation_type,
							target_entity_id: item.entity_id
						};
					});
					
					if (refresh) {
						this.list = processedList;
					} else {
						this.list = [...this.list, ...processedList];
					}
					
					this.total = response.data.total || 0;
					this.page++;
					
					// 更新加载状态
					if (this.list.length >= this.total) {
						this.loadmoreStatus = 'nomore';
					} else {
						this.loadmoreStatus = 'loadmore';
					}
					
					// 执行搜索过滤
					this.performSearch();
				} else {
					uni.showToast({
						title: response.msg || '获取团队列表失败',
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
			}
		},
		
		// 加载更多
		loadMore() {
			if (this.loadmoreStatus === 'loadmore') {
				this.loadmoreStatus = 'loading';
				this.loadList(false);
			}
		},
		
		// 搜索处理
		handleSearch() {
			this.performSearch();
		},
		
		// 执行搜索过滤
		performSearch() {
			if (!this.searchKeyword.trim()) {
				this.filteredList = [...this.list];
				return;
			}
			
			const keyword = this.searchKeyword.toLowerCase();
			this.filteredList = this.list.filter(item => {
				const searchFields = [item.name, item.enterprise_name, item.phone, item.email, item.roleText];
				const matchBasic = searchFields.some(field => field && field.toLowerCase().includes(keyword));
				const matchTags = item.tags && item.tags.some(tag => tag.name && tag.name.toLowerCase().includes(keyword));
				
				return matchBasic || matchTags;
			});
		},
		
		// 显示添加标签弹窗
		showAddTagModal(member, index) {
			this.selectedMember = member;
			this.selectedMemberIndex = index;
			this.newTagName = '';
			this.selectedColor = this.tagColors[0];
			this.selectedQuickTag = null;
			this.showTagModal = true;
		},
		
		// 隐藏标签弹窗
		hideTagModal() {
			this.showTagModal = false;
			this.selectedMember = null;
			this.selectedMemberIndex = -1;
			this.newTagName = '';
			this.selectedQuickTag = null;
		},
		
		// 选择标签颜色
		selectColor(color) {
			this.selectedColor = color;
		},
		
		// 选择快速标签
		selectQuickTag(tag) {
			if (this.selectedQuickTag === tag) {
				this.selectedQuickTag = null;
				// 清除所有快速标签的样式
				this.quickTags.forEach(t => {
					t.styleString = '';
				});
			} else {
				// 清除之前选中的样式
				this.quickTags.forEach(t => {
					t.styleString = '';
				});
				// 设置当前选中的样式
				tag.styleString = `background-color: ${tag.bg}; color: ${tag.text};`;
				this.selectedQuickTag = tag;
				this.newTagName = ''; // 清空自定义输入
			}
		},
		
		// 移除标签
		removeTag(index) {
			this.selectedMember.tags.splice(index, 1);
			
			// 更新列表中的数据
			if (this.selectedMemberIndex >= 0) {
				this.list[this.selectedMemberIndex] = { ...this.selectedMember };
				this.performSearch();
			}
			
			// 保存到服务器
			this.saveTagsToServer(this.selectedMember);
			
			// uni.showToast({
			// 	title: '标签删除成功',
			// 	icon: 'success'
			// });
		},
		
		// 添加标签
		addTag() {
			// 确定标签数据
			const newTag = this.selectedQuickTag ? {
				name: this.selectedQuickTag.name,
				color: this.selectedQuickTag.bg,
				textColor: this.selectedQuickTag.text,
				styleString: `background-color: ${this.selectedQuickTag.bg}; color: ${this.selectedQuickTag.text};`
			} : this.newTagName.trim() ? {
				name: this.newTagName.trim(),
				color: this.selectedColor.bg,
				textColor: this.selectedColor.text,
				styleString: `background-color: ${this.selectedColor.bg}; color: ${this.selectedColor.text};`
			} : null;
			
			if (!newTag) {
				uni.showToast({
					title: '请选择或输入标签名称',
					icon: 'none'
				});
				return;
			}
			
			// 检查是否已存在相同标签
			const existingTag = this.selectedMember.tags.find(tag => tag.name === newTag.name);
			if (existingTag) {
				uni.showToast({
					title: '标签已存在',
					icon: 'none'
				});
				return;
			}
			
			// 检查标签数量限制
			if (this.selectedMember.tags.length >= 5) {
				uni.showToast({
					title: '最多只能添加5个标签',
					icon: 'none'
				});
				return;
			}
			
			// 添加标签到成员
			this.selectedMember.tags.push(newTag);
			
			// 更新列表中的数据
			if (this.selectedMemberIndex >= 0) {
				this.list[this.selectedMemberIndex] = { ...this.selectedMember };
				this.performSearch();
			}
			
			// 调用API保存标签到后端
			this.saveTagsToServer(this.selectedMember);
			
			// uni.showToast({
			// 	title: '标签添加成功',
			// 	icon: 'success'
			// });
			
			this.hideTagModal();
		},
		
		// 保存标签到服务器
		async saveTagsToServer(member) {
			try {
				const simplifiedTags = (member.tags || []).map(tag => ({
					name: tag.name,
					color: tag.color
				}));
				
				const response = await updateTeamMemberTags({
					target_entity_id: member.target_entity_id || member.id,
					tags: JSON.stringify(simplifiedTags)
				});
				
				if (response.code !== 0) {
					uni.showToast({
						title: '保存标签失败',
						icon: 'none'
					});
				}
			} catch (error) {
				uni.showToast({
					title: '网络错误，保存失败',
					icon: 'none'
				});
			}
		},
		
		// 查看成员详情
		viewMemberDetail(member) {
			// TODO: 跳转到成员详情页面
		},
		
		// 格式化时间
		formatTime(timestamp) {
			if (!timestamp) return '';
			
			const milliseconds = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp;
			const date = new Date(milliseconds);
			
			// 格式化为中文日期格式
			const year = date.getFullYear();
			const month = date.getMonth() + 1;
			const day = date.getDate();
			
			return `${year}年${month}月${day}日`;
		},
		
		// 格式化电话号码（中间用*号隐藏）
		formatPhone(phone) {
			if (!phone) return '';
			
			const phoneStr = phone.toString();
			
			// 手机号码格式化（11位）
			if (phoneStr.length === 11) {
				return phoneStr.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
			}
			
			// 固定电话格式化（7-8位）
			if (phoneStr.length >= 7 && phoneStr.length <= 8) {
				const start = phoneStr.substring(0, 3);
				const end = phoneStr.substring(phoneStr.length - 2);
				return start + '****' + end;
			}
			
			// 其他长度的电话号码
			if (phoneStr.length > 6) {
				const start = phoneStr.substring(0, 3);
				const end = phoneStr.substring(phoneStr.length - 3);
				return start + '****' + end;
			}
			
			// 太短的号码直接返回
			return phoneStr;
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	background-color: #f5f5f5;
	min-height: 100vh;
	padding-bottom: 20rpx;
}

.search-bar {
	background-color: #fff;
	padding-bottom: 1rpx;
	margin-bottom: 20rpx;
}

.team-list {
	padding: 0 24rpx;
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
	
	.empty-tip {
		margin-top: 12rpx;
		font-size: 24rpx;
		color: #ccc;
	}
	
	.empty-icon {
		width: 120rpx;
		height: 120rpx;
		margin-bottom: 20rpx;
		opacity: 0.5;
	}
}

.team-item {
	background-color: #fff;
	margin-bottom: 20rpx;
	border-radius: 16rpx;
	padding: 32rpx;
	cursor: pointer;
	
	&:active {
		background-color: #f8f9fa;
	}
	
	.team-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 24rpx;
		
		.team-info {
			flex: 1;
			display: flex;
			align-items: center;
			
			.team-avatar {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				margin-right: 20rpx;
				background-color: #f5f5f5;
			}
			
			.team-text {
				flex: 1;
				
				.team-name {
					font-size: 32rpx;
					font-weight: 600;
					color: #333;
					margin-bottom: 8rpx;
				}
				
				.team-enterprise {
					font-size: 26rpx;
					color: #666;
				}
			}
		}
		
		.team-role {
			font-size: 24rpx;
			padding: 6rpx 16rpx;
			border-radius: 20rpx;
			white-space: nowrap;
			
			&.role-admin {
				background-color: #ff5722;
				color: #fff;
			}
			
			&.role-leader {
				background-color: #2196f3;
				color: #fff;
			}
			
			&.role-member {
				background-color: #4caf50;
				color: #fff;
			}
			
			&.role-intern {
				background-color: #ff9800;
				color: #fff;
			}
		}
	}
	
	.team-relation {
		font-size: 22rpx;
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
		margin-left: 12rpx;
		
		&.superior {
			background-color: #e3f2fd;
			color: #1976d2;
		}
		
		&.subordinate {
			background-color: #e8f5e8;
			color: #388e3c;
		}
	}
	
	.team-details {
		margin-bottom: 24rpx;
		
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
			}
		}
	}
	
	.team-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8rpx;
		align-items: center;
		
		.tag {
			padding: 10rpx 12rpx;
			border-radius: 16rpx;
			font-size: 22rpx;
			flex: 0 0 auto;
			max-width: 20%;
			text-align: center;
			overflow: hidden;
			
			white-space: nowrap;
		}
		
		.add-tag-btn {
			display: flex;
			align-items: center;
			padding:8rpx 12rpx;
			border: 1rpx dashed #ddd;
			border-radius: 16rpx;
			background-color: #fafafa;
			cursor: pointer;
			flex: 0 0 auto;
			max-width: 24%;
			justify-content: center;
			
			&:active {
				background-color: #e0e0e0;
			}
			
			.add-tag-text {
				font-size: 22rpx;
				color: #999;
				margin-left: 6rpx;
				overflow: hidden;
				
				white-space: nowrap;
			}
		}
	}
}

/* 底部标签弹窗样式 */
.tag-bottom-modal {
	padding: 0 32rpx 40rpx;
	max-height: 80vh;
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 32rpx 0 24rpx;
		border-bottom: 1rpx solid #f0f0f0;
		margin-bottom: 32rpx;
		
		.header-title {
			font-size: 36rpx;
			font-weight: 600;
			color: #333;
		}
		
		.close-btn {
			padding: 8rpx;
		}
	}
	
	.modal-tips {
		background-color: #fff7e6;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 32rpx;
		
		.tips-title {
			display: flex;
			align-items: center;
			margin-bottom: 12rpx;
			
			.tips-text {
				font-size: 28rpx;
				font-weight: 600;
				color: #2196f3;
				margin-left: 8rpx;
			}
		}
		
		.tips-content {
			font-size: 26rpx;
			color: #666;
			line-height: 1.5;
			
			.highlight {
				color: #2196f3;
				font-weight: 500;
			}
		}
	}
	
	.section-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 20rpx;
	}
	
	.quick-tags-section {
		margin-bottom: 32rpx;
		
		.quick-tags {
			display: flex;
			flex-wrap: wrap;
			gap: 16rpx;
			
			.quick-tag {
				padding: 12rpx 24rpx;
				background-color: #f5f5f5;
				color: #666;
				border-radius: 24rpx;
				font-size: 24rpx;
				transition: all 0.3s ease;
			}
		}
	}
	
	.custom-tag-section {
		margin-bottom: 32rpx;
		
		.input-wrapper {
			margin-top: 16rpx;
		}
	}
	
	.color-picker-section {
		margin-bottom: 32rpx;
		
		.color-options {
			display: flex;
			flex-wrap: wrap;
			gap: 20rpx;
			margin-top: 16rpx;
			
			.color-item {
				width: 64rpx;
				height: 64rpx;
				border-radius: 50%;
			
				display: flex;
				align-items: center;
				justify-content: center;
				
				&.active {
					border-color: #333;
				}
			}
		}
	}
	
	.existing-tags-section {
		margin-bottom: 32rpx;
		
		.existing-tags {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;
			margin-top: 16rpx;
			
			.existing-tag {
				padding: 12rpx 20rpx;
				border-radius: 24rpx;
				font-size: 24rpx;
				display: flex;
				align-items: center;
				gap: 8rpx;
				
				.remove-tag {
					padding: 4rpx;
					border-radius: 50%;
					background-color: rgba(255, 255, 255, 0.3);
				}
			}
		}
	}
	
	.modal-footer {
		display: flex;
		gap: 20rpx;
		padding-top: 32rpx;
		border-top: 1rpx solid #f0f0f0;
		
		.btn-cancel, .btn-confirm {
			flex: 1;
			height: 88rpx;
			line-height: 88rpx;
			text-align: center;
			border-radius: 44rpx;
			font-size: 28rpx;
		}
		
		.btn-cancel {
			background-color: #f5f5f5;
			color: #666;
		}
		
		.btn-confirm {
			background-color: #2979ff;
			color: #fff;
			
			&.disabled {
				background-color: #ccc;
				color: #999;
			}
		}
	}
}
</style>