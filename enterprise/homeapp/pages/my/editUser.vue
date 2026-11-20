<template>
	<view class="page">


		<!-- 页面内容 -->
		<view class="content">
			<!-- 头像区域 -->
			<view class="avatar-section">
				<view class="avatar-container" @click="chooseAvatar">
					<image class="avatar-image" :src="userInfo.avatar||'/static/img/avatar.png'" mode="aspectFill">
					</image>
					<view class="camera-icon">
						<u-icon name="camera-fill" color="#fff" size="24"></u-icon>
					</view>
				</view>
				<view class="avatar-text">更换头像</view>
			</view>

			<!-- 表单区域 -->
			<view class="form-section">
				<!-- 昵称 -->
				<view class="form-item" @click="editNickname">
					<view class="form-label">昵称</view>
					<view class="form-value">{{ userInfo.nickname||'用户' }}</view>
					<u-icon name="arrow-right" color="#c0c4cc" size="24"></u-icon>
				</view>



				<!-- 手机号码 -->
				<view class="form-item" @click="editPhone">
					<view class="form-label">手机号码</view>
					<view class="form-value">{{ userInfo.mobile||'手机号' }}</view>
					<u-icon name="arrow-right" color="#c0c4cc" size="24"></u-icon>
				</view>

				<!-- 邮箱 -->
				<view class="form-item" @click="editEmail">
					<view class="form-label">邮箱</view>
					<view class="form-value">{{ userInfo.email||'邮箱' }}</view>
					<u-icon name="arrow-right" color="#c0c4cc" size="24"></u-icon>
				</view>

				<!-- 所在地区 -->
				<view class="form-item" @click="showPicker = true">
					<view class="form-label">所在地区</view>
					<view class="form-value">{{ userInfo.region||selectedText }}</view>
					<u-icon name="arrow-right" color="#c0c4cc" size="24"></u-icon>
				</view>
			</view>

			<!-- 保存按钮 -->
			<view class="save-button-container">
				<u-button type="primary" :custom-style="buttonStyle" @click="saveProfile" :loading="loading">
					保存修改
				</u-button>
			</view>
		</view>
		<!-- 地区选择弹窗 -->
		<RegionPicker
		      :show.sync="showPicker"
		      :provinceCode="'15'"
		      :selectedValues="selectedCodes"
		      @confirm="handleConfirm"
		    />
	</view>
</template>

<script>
	import {changeUserInfo} from '@/utils/api';
	import {uploadFileInChunks } from '@/utils/upload.js'
	import RegionPicker from '@/components/RegionPicker.vue';
	export default {
		components: {
			RegionPicker
		},
		data() {
			return {
				loading: false,
				showPicker: false,
				userInfo: {},
				selectedCodes: [5, 58, 698, 8031],
				selectedText: '请选择地区',
				buttonStyle: {
					background: '#3D6AFF',
					border: 'none',
					borderRadius: '12px',
					height: '50px',
					fontSize: '16px',
					fontWeight: '500'
				}
			}
		},
		onLoad() {
			this.getUserInfo();			
		},
		methods: {
			handleConfirm({selectedValues,selectedNames}) { 
				 console.log('选中 ID:', selectedValues);
				// console.log('选中名称:', selectedNames);
				this.selectedCodes = selectedValues;
				this.selectedText=selectedNames.join(' ') 
			},
			// 返回上一页 (如果需要可以在其他地方调用)
			goBack() {
				uni.navigateBack()
			},

			// 获取用户信息
			getUserInfo() {
				this.userInfo = uni.getStorageSync('$userinfo'); 
			},

			// 选择头像
			chooseAvatar() {
				const that = this
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: function(res) {
						const tempFilePaths = res.tempFilePaths
						that.userInfo.avatar = tempFilePaths[0]
						const file = res.tempFiles[0] 
						uploadFileInChunks(file, {
						  onProgress: (percent) => {
						   // console.log(`上传进度：${percent}%`);
						   uni.showLoading({ title: `上传中 ${percent}%` })
						  }
						}).then(res => {
							console.log('上传完成:', res);
							uni.hideLoading()
							that.userInfo.avatar=res.filePath
						}).catch(err => {
						  console.error('上传失败:', err);
						});
					}
				})
			},

			// 上传头像
			uploadAvatar(filePath) {
				uni.showLoading({
					title: '上传中...'
				})

				// 这里调用上传API
				setTimeout(() => {
					uni.hideLoading()
					uni.showToast({
						title: '头像更新成功',
						icon: 'success'
					})
				}, 1500)
			},
			// 编辑昵称
			editNickname() {
				const that = this
				uni.showModal({
					title: '修改昵称',
					editable: true,
					placeholderText: '输入昵称',
					content: this.userInfo.nickname,
					success: function(res) {
						if (res.confirm && res.content.trim()) {
							that.userInfo.nickname = res.content.trim()
						}
					}
				})
			},
			// 编辑手机号
			editPhone() {
				uni.navigateTo({
					url: '/pages/profile/edit-phone'
				})
			},
			// 编辑邮箱
			editEmail() {
				const that = this
				uni.showModal({
					title: '修改邮箱',
					editable: true,
					placeholderText: '输入邮箱账号',
					content: this.userInfo.email,
					success: function(res) {
						if (res.confirm && res.content.trim()) {
							// 验证邮箱格式
							const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
							if (emailReg.test(res.content.trim())) {
								that.userInfo.email = res.content.trim()
							} else {
								uni.showToast({
									title: '邮箱格式不正确',
									icon: 'none'
								})
							}
						}
					}
				})
			},

			
			// 保存资料
			saveProfile() {
				this.loading = true
				this.userInfo.province=this.selectedCodes[0]
				this.userInfo.city=this.selectedCodes[1] 
				this.userInfo.town=this.selectedCodes[2] 
				this.userInfo.street=this.selectedCodes[3] 
				const data={...this.userInfo}
				changeUserInfo(data).then(res => {
					if (res) {
						this.$store.dispatch('getuserinfo');
						uni.showToast({
							title: "保存成功",
							icon: 'success'
						}); 
						let goBack = setTimeout(() => {
							uni.navigateBack()
							clearInterval(goBack);
						}, 1000)
					}
				}); 
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.content {
		padding-top: 20rpx;
	}

	// 头像区域
	.avatar-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 60rpx 0;
		background-color: #fff;
		margin: 0 24rpx 20rpx;
		border-radius: 16rpx;

		.avatar-container {
			position: relative;
			width: 160rpx;
			height: 160rpx;
			margin-bottom: 20rpx;

			.avatar-image {
				width: 100%;
				height: 100%;
				border-radius: 50%;
				border: 4rpx solid #fff;
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
			}

			.camera-icon {
				position: absolute;
				right: 0;
				bottom: 0;
				width: 48rpx;
				height: 48rpx;
				background-color: #3D6AFF;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				border: 4rpx solid #fff;
			}
		}

		.avatar-text {
			font-size: 28rpx;
			color: #666;
		}
	}

	// 表单区域
	.form-section {
		background-color: #fff;
		margin: 0 24rpx;
		border-radius: 16rpx;
		overflow: hidden;

		.form-item {
			display: flex;
			align-items: center;
			padding: 32rpx 24rpx;
			border-bottom: 1rpx solid #f0f0f0;

			&:last-child {

				border-bottom: none;
			}

			.form-label {
				font-size: 32rpx;
				color: #333;
				width: 140rpx;
			}

			.form-value {
				flex: 1;
				font-size: 24rpx;
				color: #666;
				text-align: right;
				margin-right: 16rpx;
			}
		}
	}

	// 保存按钮
	.save-button-container {
		padding: 60rpx 24rpx 40rpx;

		::v-deep .u-btn {
			box-shadow: 0 8rpx 20rpx #3D6AFF;
		}
	}
</style>