<template>
	<view class="container">
		<view class="content">
			<!-- 提示信息 -->
			<view class="tip-box">
				<text class="tip-text">填写企业基本信息，或保存后分享给企业自行完善</text>
			</view>

			<!-- 企业基本信息 -->
			<view class="section">
				<view class="section-title">企业基本信息</view>

				<!-- 企业名称 -->
				<view class="form-item">
					<view class="label">
						<text>企业名称</text>
						<text class="required">*</text>
					</view>
					<u-input v-model="form.companyName" placeholder="请输入企业名称" 
						:custom-style="inputStyle"></u-input>
					<view class="form-note">企业名称认证后将不可修改</view>
				</view>

				<!-- 所在地区 -->
				<view class="form-item" @click="showPicker = true">
					<view class="label">所在地区</view>
					<u-input class="pickinput" v-model="selectedText" placeholder="请选择所在地区"  :custom-style="inputStyle"
						:disabled="true" suffix-icon="arrow-right" ></u-input>
				</view>

				<!-- 联系人手机号 -->
				<view class="form-item">
					<view class="label">联系人手机号</view>
					<u-input v-model="form.phone" placeholder="请输入联系人手机号"  :custom-style="inputStyle"
						type="number"></u-input>
				</view>
			</view>

			<!-- 登录信息设置 -->
			<view class="section">
				<view class="section-title">
					<u-icon name="key" color="#409EFF" size="24"></u-icon>
					<text class="section-title-text">登录信息设置</text>
				</view>

				<!-- 登录账号 -->
				<view class="form-item">
					<view class="label">登录账号</view>
					<u-input v-model="form.account" placeholder="登录账号" :custom-style="inputStyle"></u-input>
					<view class="form-note">登录账号，<text class="text-blue" @click="mobileToAccount">将手机号设置为登录账号</text></view>
				</view>

				<!-- 设置密码 -->
				<view class="form-item">
					<view class="label">设置密码</view>
					<u-input v-model="form.password" placeholder="请设置6-20位密码" :custom-style="inputStyle"
						type="password"></u-input>
				</view>

				<!-- 确认密码 -->
				<view class="form-item">
					<view class="label">确认密码</view>
					<u-input v-model="form.confirmPassword" placeholder="请再次输入密码" 
						:custom-style="inputStyle" type="password"></u-input>
					<view class="form-note">密码需包含字母、数字，长度6-20位</view>
				</view>
			</view>

			<!-- 警告提示 -->
			<view class="warning-box">
				<u-icon name="warning" color="#FF9500" size="30"></u-icon>
				<text class="warning-text">企业账号可查看和管理相关信息，请谨慎设置并妥善保管账号密码</text>
			</view>

			<!-- 保存按钮 -->
			<view class="submit-section">
				<u-button type="primary" :custom-style="buttonStyle" @click="handleSubmit">
					保存并生成企业邀请链接
					<u-icon name="share" color="#ffffff" size="24" style="margin-left: 8px;"></u-icon>
				</u-button>
			</view>
		</view>
		<!-- 地区选择弹窗 -->
		<RegionPicker :show.sync="showPicker" :provinceCode="'15'" :selectedValues="selectedCodes"
			@confirm="handleConfirm" />
	</view>
</template>

<script>
	import {addEntity} from '@/utils/api';
	import RegionPicker from '@/components/RegionPicker.vue';
	export default {
		components: {
			RegionPicker
		},
		data() {
			return {
				showPicker: false,
				userInfo: {}, 
				selectedCodes: [5, 58, 698, 8031],
				selectedText: '请选择地区',
				form: {
					type:8,
					companyName: '',
					phone: '',
					account: '',
					password: '',
					confirmPassword: ''
				},
				inputStyle: {
					backgroundColor: '#ffffff',
					borderRadius: '16rpx',
					padding: '24rpx 32rpx',
					fontSize: '32rpx',
					color: '#333333',
					border: '1px solid #e4e7ed',
					height: '96rpx'
				},
				buttonStyle: {
					backgroundColor: '#3D6AFF',
					borderRadius: '48rpx',
					height: '96rpx',
					fontSize: '32rpx',
					fontWeight: '500'
				}
			}
		},
		onLoad(options){
			if(options.role) this.form.type=options.role
			this.userInfo = uni.getStorageSync('$userinfo');
			if(this.userInfo.id) this.getdata();
		},
		methods: {
			async getdata(){
				const data={
					pid:this.userInfo.id
				}				
				getLink(data).then(res=>{
					this.userInfo.miniLink=res.data
				})
			},
			mobileToAccount(){
				this.form.account=this.form.phone
			},
			handleConfirm({selectedValues,selectedNames}) {
				 console.log('选中 ID:', selectedValues);
				// console.log('选中名称:', selectedNames);
				this.selectedCodes = selectedValues;
				this.selectedText=selectedNames.join(' ') 
			},
			handleRightClick() {
				// 跳转到企业管理页面
				uni.navigateTo({
					url: '/pages/company/management'
				})
			},
			
			handleSubmit() {
				// 表单验证
				if (!this.form.companyName) {
					uni.showToast({
						title: '请输入企业名称',
						icon: 'none'
					})
					return
				}

				if (!this.form.password) {
					uni.showToast({
						title: '请设置密码',
						icon: 'none'
					})
					return
				}

				if (this.form.password !== this.form.confirmPassword) {
					uni.showToast({
						title: '两次密码输入不一致',
						icon: 'none'
					})
					return
				}

				if (this.form.password.length < 6 || this.form.password.length > 20) {
					uni.showToast({
						title: '密码长度应为6-20位',
						icon: 'none'
					})
					return
				}

				// 提交表单 
				const data={
					name: this.form.companyName,         // 公司名称
					role_type: this.form.type,    // 角色类型
					province:this.selectedCodes[0],     // 省份
					city: this.selectedCodes[1],         // 城市
					district: this.selectedCodes[2],     // 区县
					town: this.selectedCodes[3] ,         // 乡镇
					username: this.form.account,     // 用户名
					password: this.form.password,     // 密码
					mobile: this.form.phone,       // 手机号
					salt: this.$C.randString(9) // 加密盐值
				}
				addEntity(data).then(res => {
					if (res) {
						this.$store.dispatch('getuserinfo');
						uni.showToast({
							title: "保存成功",
							icon: 'success'
						}); 
						let goBack = setTimeout(() => {
							uni.showModal({
								title: '企业邀请链接已生成',
								content: '是否立即分享给企业？',
								confirmText: '分享',
								cancelText: '稍后',
								success: (res) => {
									if (res.confirm) {
										// 分享逻辑
										this.shareInviteLink()
									}
								}
							})
							clearInterval(goBack);
						}, 1000)
					}
				}); 
				 
			},
			shareInviteLink() {
				// 分享邀请链接
				uni.share({
					provider: 'weixin',
					scene: 'WXSceneSession',
					type: 0,
					href: this.userInfo.miniLink,
					title: '企业注册邀请',
					summary: '邀请您完善企业信息',
					success: (res) => {
						console.log('分享成功')
					},
					fail: (err) => {
						console.log('分享失败', err)
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f6fa;
	}

	.content {
		padding: 0 32rpx 64rpx;
	}

	.tip-box {
		display: flex;
		align-items: flex-start;
		padding: 32rpx;

		border-radius: 16rpx;
		position: relative;



		.tip-text {
			flex: 1;
			font-size: 28rpx;
			color: #666666;
			line-height: 40rpx;
			margin-left: 20rpx;

			&::before {
				height: 40rpx;
				content: '';
				position: absolute;
				left: 0;

				width: 6rpx;
				background-color: #409EFF;
				border-radius: 0 4rpx 4rpx 0;
			}
		}
	}

	.section {
		background-color: #ffffff;
		border-radius: 24rpx;
		padding: 40rpx 32rpx;
		margin-bottom: 32rpx;

		.section-title {
			display: flex;
			align-items: center;
			font-size: 32rpx;
			font-weight: 500;
			color: #333333;
			margin-bottom: 40rpx;

			.section-title-text {
				margin-left: 16rpx;
			}
		}
	}

	.form-item {
		margin-bottom: 40rpx;

		&:last-child {
			margin-bottom: 0;
		}

		.label {
			font-size: 28rpx;
			color: #333333;
			margin-bottom: 16rpx;
			display: flex;
			align-items: center;

			.required {
				color: #ff4757;
				margin-left: 8rpx;
			}
		}

		.form-note {
			font-size: 24rpx;
			color: #999999;
			margin-top: 16rpx;
			line-height: 32rpx;
		}
	}

	.warning-box {
		display: flex;
		align-items: flex-start;
		padding: 24rpx 32rpx;
		background-color: #fff7e6;
		border-radius: 16rpx;
		border: 1px solid #ffe0b3;
		margin-bottom: 64rpx;

		.warning-text {
			flex: 1;
			font-size: 24rpx;
			color: #d48806;
			line-height: 36rpx;
			margin-left: 16rpx;
		}
	}

	.submit-section {
		padding: 0 32rpx;

		::v-deep .u-button {
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	
</style>