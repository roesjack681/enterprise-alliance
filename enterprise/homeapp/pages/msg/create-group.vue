<template>
	<view class="create-group-container">
		<!-- 创建群组表单 -->
		<view>
					<!-- 群组信息 -->
		<view class="section">
			<view class="section-header">
				<text class="section-title">群组信息</text>
			</view>
		<view class="form-content">
			<!-- 群头像 -->
			<view class="form-item">
				<text class="form-label">群头像</text>
				<view class="avatar-upload" @click="chooseAvatar">
					<image 
						v-if="currentAvatar" 
						:src="currentAvatar" 
						class="avatar-img" 
						mode="aspectFill"
					></image>
					<view v-else class="default-avatar">
						<text class="avatar-text">{{ getGroupInitial() }}</text>
					</view>
					<view class="avatar-edit">
						<u-icon name="camera" color="#fff" size="24"></u-icon>
					</view>
				</view>
			</view>
			
			<view class="form-item">
				<text class="form-label">群组名称</text>
				<u-input 
					v-model="groupForm.name" 
					placeholder="请输入群组名称"
					border="false"
					class="form-input"
				></u-input>
			</view>
			<view class="form-item">
				<text class="form-label">群组描述</text>
				<u-textarea 
					v-model="groupForm.description" 
					placeholder="请输入群组描述（可选）"
					
					class="form-textarea"
					:maxlength="200"
				></u-textarea>
			</view>
		</view>
	</view>

		<!-- 选择成员 -->
		<view class="section">
			<view class="section-header">
				<text class="section-title">选择成员</text>
				<text class="section-count">({{ selectedMembers.length }})</text>
			</view>
			
			<!-- 搜索框 -->
			<view class="search-container">
				<u-search 
					v-model="searchKeyword" 
					placeholder="搜索成员姓名" 
					:show-action="false"
					@clear="onClearSearch"
				></u-search>
			</view>

			<!-- 已选成员 -->
			<view class="selected-members" v-if="selectedMembers.length > 0">
				<view class="selected-header">
					<text class="selected-title">已选择</text>
					<text class="clear-btn" @click="clearSelected">清空</text>
				</view>
				<view class="selected-list">
					<view 
						class="selected-item" 
						v-for="(member, index) in selectedMembers" 
						:key="index"
					>
						<view class="member-avatar">
							<image v-if="member.avatar" :src="member.avatar" class="avatar-img"></image>
							<view v-else class="default-avatar">
								<text class="avatar-text">{{ getUserInitial(member.name) }}</text>
							</view>
						</view>
						<text class="member-name">{{ member.name }}</text>
						<u-icon 
							name="close" 
							color="#999" 
							size="24" 
							@click="removeMember(index)"
						></u-icon>
					</view>
				</view>
			</view>

			<!-- 成员列表 -->
			<view class="member-list-container">
				<!-- 加载状态 -->
				<view class="loading-container" v-if="loading">
					<u-loading-icon mode="spinner" size="40"></u-loading-icon>
					<text class="loading-text">加载中...</text>
				</view>

				<!-- 空状态 -->
				<view class="empty-container" v-else-if="(searchKeyword ? filteredMemberList : memberList).length === 0">
					<u-icon name="account" color="#ccc" size="80"></u-icon>
					<text class="empty-text">{{ searchKeyword ? '未找到相关成员' : '暂无成员' }}</text>
				</view>

				<!-- 搜索结果列表 -->
				<view v-else-if="searchKeyword" class="member-list">
					<view 
						class="member-item" 
						v-for="(member, index) in filteredMemberList" 
						:key="index"
						@click="toggleMember(member)"
					>
						<view class="member-avatar">
							<image v-if="member.avatar" :src="member.avatar" class="avatar-img"></image>
							<view v-else class="default-avatar">
								<text class="avatar-text">{{ getUserInitial(member.name) }}</text>
							</view>
						</view>
						<view class="member-info">
							<text class="member-name">{{ member.name }}</text>
							<text class="member-position">{{ member.position || '未设置职位' }}</text>
							<text class="member-department">{{ member.department || '未设置部门' }}</text>
						</view>
						<view class="member-status">
							<u-icon 
								:name="isMemberSelected(member) ? 'checkmark-circle' : 'circle'" 
								:color="isMemberSelected(member) ? '#3D6AFF' : '#ccc'" 
								size="40"
							></u-icon>
						</view>
					</view>
				</view>

				<!-- 按索引分组的成员列表 -->
				<view v-else class="indexed-member-container">
					<!-- 右侧字母导航 -->
					<view v-if="indexList.length > 0" class="index-bar">
						<view 
							v-for="(item, index) in indexList" 
							:key="index"
							class="index-bar-item"
							@click="scrollToIndex(item)"
						>
							{{ item }}
						</view>
					</view>
					
					<!-- 成员列表按字母分组 -->
					<view class="indexed-member-list">
						<view v-for="(item, index) in indexList" :key="index" :id="`index-${item}`">
							<!-- 字母分组标题 -->
							<view class="index-anchor">{{ item }}</view>
							<!-- 该字母下的成员列表 -->
							<view class="member-list">
								<view 
									class="member-item" 
									v-for="(member, memberIndex) in getMemberListByIndex(item)" 
									:key="memberIndex"
									@click="toggleMember(member)"
								>
									<view class="member-avatar">
										<image v-if="member.avatar" :src="member.avatar" class="avatar-img"></image>
										<view v-else class="default-avatar">
											<text class="avatar-text">{{ getUserInitial(member.name) }}</text>
										</view>
									</view>
									<view class="member-info">
										<text class="member-name">{{ member.name }}</text>
										<text v-if="member.position" class="member-position">{{ member.position }}</text>
										<text v-if="member.department" class="member-department">{{ member.department }}</text>
									</view>
									<view class="member-status">
										<u-icon 
											:name="isMemberSelected(member) ? 'checkmark-circle-fill' : 'checkmark-circle'" 
											:color="isMemberSelected(member) ? '#3D6AFF' : '#ccc'" 
											size="40"
										></u-icon>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部操作栏 -->
		<view class="bottom-actions">
			<u-button 
				type="primary" 
				:disabled="!canCreate"
				@click="createGroup"
				class="create-btn"
			>
				创建群组 ({{ selectedMembers.length }}人)
			</u-button>
		</view>
		</view>
	</view>
</template>

<script>
import { getUserPrivateChats, createGroupRoom } from '@/utils/api.js';
import { uploadFileInChunks } from '@/utils/upload.js';
import { pinyin } from 'pinyin-pro';

export default {
	data() {
		return {
			loading: false,
			searchKeyword: '',
			memberList: [],
			selectedMembers: [],
			defaultAvatar: '', // 默认头像（当前用户头像）
			indexList: [], // 索引列表
			memberMapByIndex: {}, // 按索引分组的成员映射
			groupForm: {
				name: '',
				description: '',
				avatar: '' // 群头像
			}
		}
	},
	computed: {
		// 过滤后的成员列表
		filteredMemberList() {
			if (!this.searchKeyword) {
				return this.memberList;
			}
			return this.memberList.filter(member => 
				member.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
				(member.position && member.position.toLowerCase().includes(this.searchKeyword.toLowerCase())) ||
				(member.department && member.department.toLowerCase().includes(this.searchKeyword.toLowerCase()))
			);
		},
		// 是否可以创建群组
		canCreate() {
			return this.groupForm.name.trim() && this.selectedMembers.length > 0;
		},
		// 当前显示的头像
		currentAvatar() {
			return this.groupForm.avatar || this.defaultAvatar;
		}
	},
	onLoad() {
		this.fetchMemberList();
		this.initDefaultAvatar();
	},
	methods: {
		// 获取成员列表
		async fetchMemberList() {
			this.loading = true;
			try {
				const res = await getUserPrivateChats({
					current_page: 1,
					page_size: 1000 // 获取大量数据，实现不分页效果
				});
				if (res.code === 0 && res.data && res.data.private_chats) {
					// 从聊天房间的members中提取用户信息
					const userMap = new Map();
					// 获取当前用户ID，确保一致性
					let currentUserInfo = this.$store.state.userInfo;
					if (!currentUserInfo || !currentUserInfo.id) {
						currentUserInfo = uni.getStorageSync('$userinfo');
					}
					const currentUserId = Number(currentUserInfo?.id);
					
					res.data.private_chats.forEach(chat => {
						if (chat.members && Array.isArray(chat.members)) {
							chat.members.forEach(member => {
								// 确保member.id是有效的数字
								const memberId = Number(member.id);
								if (isNaN(memberId) || memberId <= 0) {
									console.warn('跳过无效成员ID:', member.id, member.nickname || member.username);
									return;
								}
								if (memberId != currentUserId && !userMap.has(memberId)) {
									const userName = member.nickname || member.username || '未知用户';
									const indexKey = this.getIndexKey(userName);
									userMap.set(memberId, {
										id: memberId,
										name: userName,
										avatar: member.avatar || '',
										position: member.position || '',
										department: member.department || '',
										// 添加计算属性
										nameInitial: this.getUserInitial(userName),
										indexKey: indexKey
									});
								}
							});
						}
					});
					
					this.memberList = Array.from(userMap.values());
					this.generateIndexList();
				}
			} catch (error) {
				console.error('获取成员列表失败:', error);
				uni.showToast({
					title: '获取成员列表失败',
					icon: 'none'
				});
			} finally {
				this.loading = false;
			}
		},

		// 获取用户姓名首字母
		getUserInitial(name) {
			if (!name) return '?';
			return name.charAt(0).toUpperCase();
		},
		
		// 获取索引键 - 支持中文拼音转换
		getIndexKey(name) {
			if (!name) return '#';
			const firstChar = name.charAt(0);
			
			// 英文字母直接返回大写
			if (/[a-zA-Z]/.test(firstChar)) {
				return firstChar.toUpperCase();
			}
			
			// 中文字符拼音转换
			if (/[\u4e00-\u9fa5]/.test(firstChar)) {
				return this.getChinesePinyin(firstChar);
			}
			
			// 数字和其他字符
			return '#';
		},
		
		// 中文拼音转换 - 使用pinyin-pro库
		getChinesePinyin(char) {
			try {
				// 使用pinyin-pro库获取拼音首字母
				const pinyinResult = pinyin(char, {
					toneType: 'none', // 不要声调
					type: 'first' // 只取首字母
				});
				
				if (pinyinResult && pinyinResult.length > 0) {
					return pinyinResult.charAt(0).toUpperCase();
				}
			} catch (error) {
				console.warn('拼音转换失败:', error);
			}
			
			// 降级处理：简单的Unicode码范围映射
			const code = char.charCodeAt(0);
			if (code >= 0x4e00 && code <= 0x9fa5) {
				// 根据Unicode码范围粗略映射到字母
				const index = Math.floor((code - 0x4e00) / ((0x9fa5 - 0x4e00) / 26));
				return String.fromCharCode(65 + Math.min(25, index));
			}
			
			return '#';
		},
		
		// 生成索引列表
		generateIndexList() {
			const indexMap = {};
			
			// 按姓名首字母分组
			this.memberList.forEach(member => {
				const indexKey = member.indexKey || this.getIndexKey(member.name);
				if (!indexMap[indexKey]) {
					indexMap[indexKey] = [];
				}
				indexMap[indexKey].push(member);
			});
			
			// 生成索引列表并排序
			this.indexList = Object.keys(indexMap).sort((a, b) => {
				// # 排在最后
				if (a === '#' && b !== '#') return 1;
				if (b === '#' && a !== '#') return -1;
				return a.localeCompare(b);
			});
			this.memberMapByIndex = indexMap;
		},
		
		// 根据索引获取成员列表
		getMemberListByIndex(index) {
			return this.memberMapByIndex[index] || [];
		},
		
		// 滚动到指定索引
		scrollToIndex(index) {
			uni.pageScrollTo({
				selector: `#index-${index}`,
				duration: 300
			});
		},
		
		// 获取群组名称首字母
		getGroupInitial() {
			if (!this.groupForm.name) return '群';
			return this.groupForm.name.charAt(0).toUpperCase();
		},
		
		// 初始化默认头像
		initDefaultAvatar() {
			const userInfo = this.$store.state.userInfo || uni.getStorageSync('$userinfo') || {};
			this.defaultAvatar = userInfo.avatar || '';
		},
		
		// 选择头像
		chooseAvatar() {
			const that = this;
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: function(res) {
					const tempFilePaths = res.tempFilePaths;
					const file = res.tempFiles[0];
					
					uni.showLoading({ title: '上传中...' });
					
					uploadFileInChunks(file, {
						onProgress: (percent) => {
							uni.showLoading({ title: `上传中 ${percent}%` });
						}
					}).then(res => {
						uni.hideLoading();
						that.groupForm.avatar = res.filePath;
						uni.showToast({
							title: '头像上传成功',
							icon: 'success'
						});
					}).catch(err => {
						console.error('头像上传失败:', err);
						uni.hideLoading();
						uni.showToast({
							title: '头像上传失败',
							icon: 'none'
						});
					});
				}
			});
		},
		// 清除搜索
		onClearSearch() {
			this.searchKeyword = '';
		},

		// 切换成员选择状态
		toggleMember(member) {
			const index = this.selectedMembers.findIndex(item => item.id === member.id);
			if (index > -1) {
				this.selectedMembers.splice(index, 1);
			} else {
				this.selectedMembers.push(member);
			}
		},
		// 检查成员是否已选择
		isMemberSelected(member) {
			return this.selectedMembers.some(item => item.id === member.id);
		},
		// 移除已选成员
		removeMember(index) {
			this.selectedMembers.splice(index, 1);
		},
		// 清空已选成员
		clearSelected() {
			this.selectedMembers = [];
		},
		// 创建群组
		async createGroup() {
			if (!this.canCreate) {
				uni.showToast({
					title: '请填写群组名称并选择成员',
					icon: 'none'
				});
				return;
			}

			try {
				// 获取当前用户信息，优先从store，然后从storage
				let userInfo = this.$store.state.userInfo;
				if (!userInfo || !userInfo.id) {
					userInfo = uni.getStorageSync('$userinfo');
				}
				console.log('用户信息来源:', userInfo);
				
				// 过滤并转换成员ID，确保都是有效的数字
				console.log('选中的成员:', this.selectedMembers.map(m => ({ id: m.id, name: m.name })));
				const memberIds = this.selectedMembers
					.map(member => {
						const id = Number(member.id);
						if (isNaN(id) || id <= 0) {
							console.warn('无效的成员ID:', member.id, member.name);
						}
						return id;
					})
					.filter(id => !isNaN(id) && id > 0); // 过滤掉NaN和无效ID
				console.log('处理后的成员IDs:', memberIds);
				
				// 添加当前用户到群组
				const currentUserId = Number(userInfo?.id);
				console.log('当前用户ID:', userInfo?.id, '转换后:', currentUserId);
				if (!isNaN(currentUserId) && currentUserId > 0 && !memberIds.includes(currentUserId)) {
					memberIds.push(currentUserId);
					console.log('添加当前用户后的成员IDs:', memberIds);
				}

				const requestData = {
					room_name: this.groupForm.name,
					member_ids: memberIds,
					avatar: this.groupForm.avatar || '',
					desc: this.groupForm.description || ''
				};
				console.log('发送到后端的数据:', JSON.stringify(requestData));
				console.log('member_ids类型:', typeof requestData.member_ids, 'isArray:', Array.isArray(requestData.member_ids));
				
				const res = await createGroupRoom(requestData);

				if (res.code === 0 && res.data) {
					uni.showToast({
						title: '群组创建成功',
						icon: 'success'
					});
					
					// 返回上一页并刷新
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} else {
					uni.showToast({
						title: res.msg || '创建失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('创建群组失败:', error);
				uni.showToast({
					title: '创建群组失败',
					icon: 'none'
				});
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.create-group-container {
	min-height: 100vh;
	background-color: #f5f6fa;
	padding-bottom: 120rpx;
}



/* 区块样式 */
.section {
	background-color: #fff;
	margin-bottom: 20rpx;

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;

		.section-title {
			font-size: 32rpx;
			font-weight: 500;
			color: #333;
		}

		.section-count {
			font-size: 28rpx;
			color: #999;
		}
	}
}

/* 表单内容 */
.form-content {
	padding: 30rpx;

	.form-item {
		margin-bottom: 30rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.form-label {
			display: block;
			font-size: 28rpx;
			color: #333;
			margin-bottom: 16rpx;
		}

		.form-input {
			background-color: #f8f9fa;
			border-radius: 8rpx;
			padding: 20rpx;
		}

		.form-textarea {
			background-color: #f8f9fa;
			border-radius: 8rpx;
			padding: 20rpx;
			min-height: 120rpx;
		}
	}
}

/* 头像上传样式 */
.avatar-upload {
	position: relative;
	display: inline-block;
	cursor: pointer;
	
	.avatar-img {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		border: 4rpx solid #f0f0f0;
		transition: all 0.3s ease;
		
		&:hover {
			border-color: #3D6AFF;
		}
	}
	
	.default-avatar {
		width: 120rpx;
		height: 120rpx;
		background-color: #3D6AFF;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 4rpx solid #f0f0f0;
		
		.avatar-text {
			color: #fff;
			font-size: 48rpx;
			font-weight: 500;
		}
	}
	
	.avatar-edit {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 40rpx;
		height: 40rpx;
		background-color: #3D6AFF;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2rpx solid #fff;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
		transition: all 0.3s ease;
		
		&:hover {
			background-color: #2d5aef;
			transform: scale(1.1);
		}
	}
}
/* 搜索容器 */
.search-container {
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
	background-color: #fff;
}

/* 自定义搜索框样式 */
.search-container ::v-deep .u-search {
	.u-search__content {
		height: 80rpx !important;
		border-radius: 40rpx !important;
		
		border: none !important;
		
		.u-search__input {
			font-size: 30rpx !important;
			color: #333 !important;
		}
		
		.u-search__input-placeholder {
			font-size: 30rpx !important;
			color: #999 !important;
		}
	}
	
	.u-icon {
		font-size: 32rpx !important;
		color: #999 !important;
	}
}


/* 已选成员 */
.selected-members {
	padding: 20rpx 30rpx;
	border-bottom: 1rpx solid #f0f0f0;

	.selected-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;

		.selected-title {
			font-size: 28rpx;
			color: #333;
			font-weight: 500;
		}

		.clear-btn {
			font-size: 26rpx;
			color: #3D6AFF;
		}
	}

	.selected-list {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;

		.selected-item {
			display: flex;
			align-items: center;
			background-color: #f0f7ff;
			border-radius: 20rpx;
			padding: 12rpx 16rpx;

			.member-avatar {
				width: 40rpx;
				height: 40rpx;
				margin-right: 12rpx;

				.avatar-img {
					width: 100%;
					height: 100%;
					border-radius: 50%;
				}

				.default-avatar {
					width: 100%;
					height: 100%;
					background-color: #3D6AFF;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;

					.avatar-text {
						color: #fff;
						font-size: 20rpx;
						font-weight: 500;
					}
				}
			}

			.member-name {
				font-size: 24rpx;
				color: #333;
				margin-right: 12rpx;
			}
		}
	}
}

/* 成员列表容器 */
.member-list-container {
	min-height: 60vh; /* 确保容器有足够的高度 */
	padding-bottom: 140rpx; /* 为底部固定按钮留出空间 */
	
	/* 加载状态 */
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;

		.loading-text {
			margin-top: 20rpx;
			font-size: 28rpx;
			color: #999;
		}
	}

	/* 空状态 */
	.empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;

		.empty-text {
			font-size: 28rpx;
			color: #999;
			margin-top: 20rpx;
		}
	}
}

/* 索引成员容器 */
.indexed-member-container {
	position: relative;
	min-height: 60vh; /* 确保容器有足够的高度 */
	padding-bottom: 140rpx; /* 为底部固定按钮留出空间 */
}

/* 右侧字母导航条 */
.index-bar {
	position: fixed;
	right: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	z-index: 999;
	display: flex;
	flex-direction: column;
	align-items: center;
	background-color: rgba(255, 255, 255, 0.9);
	border-radius: 40rpx;
	padding: 20rpx 10rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);

	.index-bar-item {
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 22rpx;
		color: #3D6AFF;
		font-weight: 500;
		margin: 2rpx 0;
		border-radius: 50%;
		transition: all 0.2s ease;

		&:active {
			background-color: #3D6AFF;
			color: #fff;
			transform: scale(1.2);
		}
	}
}

/* 字母分组标题 */
.index-anchor {
	background-color: #f5f6fa;
	padding: 20rpx 30rpx;
	font-size: 28rpx;
	color: #666;
	font-weight: 500;
	border-bottom: 1rpx solid #ebeef5;
	position: sticky;
	top: 0;
	z-index: 10;
}

/* 索引成员列表容器 */
.indexed-member-list {
	background-color: #fff;
}

/* 成员列表 - 参考 contacts 页面样式 */
.member-list {
	.member-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;

		&:last-child {
			border-bottom: none;
		}

		.member-avatar {
			width: 80rpx;
			height: 80rpx;
			margin-right: 20rpx;

			.avatar-img {
				width: 100%;
				height: 100%;
				border-radius: 50%;
			}

			.default-avatar {
				width: 100%;
				height: 100%;
				background-color: #3D6AFF;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;

				.avatar-text {
					color: #fff;
					font-size: 32rpx;
					font-weight: 500;
				}
			}
		}

		.member-info {
			flex: 1;
			display: flex;
			flex-direction: column;

			.member-name {
				font-size: 30rpx;
				color: #333;
				margin-bottom: 8rpx;
			}

			.member-position {
				font-size: 26rpx;
				color: #666;
				margin-bottom: 4rpx;
			}

			.member-department {
				font-size: 24rpx;
				color: #999;
			}
		}

		.member-status {
			width: 40rpx;
			height: 40rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}
}



/* 底部操作栏 */
.bottom-actions {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #fff;
	padding: 20rpx 30rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); /* 适配安全区域 */
	border-top: 1rpx solid #f0f0f0;
	z-index: 100;
	box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.1); /* 添加阴影效果 */

	.create-btn {
		width: 100%;
		height: 80rpx;
		border-radius: 40rpx;
		font-size: 30rpx;
		font-weight: 500;
	}
}
</style>
