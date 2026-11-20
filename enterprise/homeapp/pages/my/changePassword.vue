<template>
	<view class="change-password-page">
		<!-- <u-navbar :title="$t('changePassword.title')" /> -->
		<view class="form-section">
			<u-form :model="form" ref="formRef" :rules="rules" label-width="150rpx">
				<u-form-item label="旧密码" prop="oldPassword">
					<u-input v-model="form.oldPassword" placeholder="请输入旧密码" password />
				</u-form-item>

				<u-form-item label="新密码" prop="newPassword">
					<u-input v-model="form.newPassword" placeholder="请输入新密码" password />
				</u-form-item>

				<u-form-item label="重复密码" prop="confirmPassword">
					<u-input v-model="form.confirmPassword" placeholder="请再次输入新密码"
						password />
				</u-form-item>
			</u-form>
		</view>
		<view class="submit-btn">
			<u-button  shape="circle" @click="submit" style="font-weight: 600;">
				修改密码
			</u-button>
		</view>
	</view>
</template>

<script>
	import {changePassword} from '@/utils/api';
	import {checkStr,msg} from '@/utils/util'
	export default {
		data() {
			return {
				form: {
					oldPassword: '',
					newPassword: '',
					confirmPassword: ''
				},
				rules: {
					oldPassword: {
						required: true,
						message: '请输入旧密码',
						trigger: ['blur', 'change']
					},
					newPassword: {
						required: true,
						message: '请输入新密码',
						trigger: ['blur', 'change']
					},
					confirmPassword: {
						required: true,
						message: '请再次输入新密码',
						trigger: ['blur', 'change'],
						validator: (rule, value, callback) => {
							if (value !== this.form.newPassword) {
								callback(new Error('重复密码不对'));
							} else {
								callback();
							}
						}
					}
				}
			};
		},
		onLoad() {
			
		},
		methods: {
			submit() {
				this.$refs.formRef.validate().then(() => {
					const data={
						oldPwd:this.form.oldPassword,
						newPwd:this.form.newPassword,						
					}
					changePassword(data).then(res => {
						if (res) {							
							uni.showToast({
								title:'密码修改成功',
								icon: 'success'
							}); 
							let goBack = setTimeout(() => {
								this.$store.commit('logout')
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
	.change-password-page {
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
</style>