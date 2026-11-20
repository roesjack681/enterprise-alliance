<template>
	<view class="change-email-page">
	
		<view class="form-section">
			<u-form :model="form" ref="formRef" :rules="rules" label-width="150rpx">
				<u-form-item label="邮箱账号" >
					{{userInfo.email}}
				</u-form-item>
				<u-form-item label="新邮箱账号" prop="newEmail">
					<u-input v-model="form.newEmail" placeholder="请输入新邮箱账号" />
				</u-form-item>
				<u-form-item label="邮箱验证码" prop="code">
					<view class="code-row">
						<u-input v-model="form.code" placeholder="请输入邮箱验证码" />						
						<view @click="sendEmailCode"  style="color: #0091ff; margin-left: 20rpx;">
							{{ codeTime == 60 ? "发送验证码" : `${codeTime}s` }}</view>
					</view>
				</u-form-item>
			</u-form>
		</view>
		<view class="submit-btn">
			<u-button shape="circle" @click="submit" style="font-weight: 600;">
				提交修改
			</u-button>
		</view>
	</view>
</template>

<script>
	import {changeEmail,sendEmailCode} from '@/utils/api';
	import {checkStr,msg} from '@/utils/util'
	export default {
		data() {
			return {
				userInfo:{},
				codeTime: 60,
				form: {					
					newEmail: '',
					code: ''
				},
				rules: {
					newEmail: {
						required: true,
						message: "请输入新邮箱账号",
						trigger: ['blur', 'change']
					},
					code: {
						required: true,
						message:"请输入邮箱验证码",
						trigger: ['blur', 'change']
					}
				}
			};
		},
		onLoad() {
			uni.setNavigationBarTitle({
				title: "修改邮箱"
			});
			this.userInfo=uni.getStorageSync('$userinfo')
			 
		},
		methods: {
			// 发送验证码
			sendEmailCode () {
				this.$refs.formRef.validateField(['newEmail'], (valid) => {
					if (valid.length === 0) {						
						sendEmailCode({email: this.form.newEmail, type: '0'}).then((res) => {
							if (res) {
								uni.showToast({title: "发送成功", icon: 'none'});
								let emailCodeTimer = setInterval(() => {
									this.codeTime--;
									if (this.codeTime == -1) {
										this.codeTime = 60;
										clearInterval(emailCodeTimer);
									}
								}, 1000);
							}
						});
					}
				})
			},			
			submit() {
				this.$refs.formRef.validate().then(() => {
					 
					if(!checkStr(this.form.newEmail, 'email')){
						msg("新邮箱账号输入格式不正确"); 
						return;
					}  
					
					if (this.form.code.length!==6) {
					   msg("请输入邮箱验证码"); 
					   return;
					} 
					
					const data={
						email:this.form.newEmail,
						email_code:this.form.code,						
					}
					
					changeEmail(data).then(res => {
						if (res) {
							this.$store.dispatch('getuserinfo');
							uni.showToast({
								title: "修改成功",
								icon: 'success'
							}); 
							let goBack = setTimeout(() => {
								uni.navigateBack()
								clearInterval(goBack);
							}, 1000)
						}
					});
					
				}).catch(err => {
					console.log('校验失败', err);
				});
			}
		}
	};
</script>

<style scoped>
	.change-email-page {
		padding-top: 20rpx;
		background-color: #f8f8f8;
		min-height:100vh;
	}

	.form-section {
		background-color: #fff;
		margin: 24rpx;
		padding: 20rpx;
		border-radius: 16rpx;
	}

	.submit-btn {
		margin-top: 60rpx;
		padding: 0 30rpx;
	}

	.code-row {
		display: flex;
		gap: 20rpx;
		align-items: center;
	}
</style>