<template>
	<view class="container">
		<view class="scroll-content">
			<view class="alert-title"><u-alert type="primary" :showIcon="true" fontSize="28"
					:description="description"></u-alert></view>

			<!-- 企业基本信息 -->
			<view class="section">
				<view class="section-header">
					<image class="section-icon" src="/static/icon/h33.png" mode="aspectFit"></image>
					<text class="section-title">企业基本信息</text>
				</view>

				<view class="form-item">
					<view class="form-label">
						<text>企业名称</text>
						<text class="required">*</text>
					</view>
					<u-input v-model="form.name" placeholder="请输入企业名称" :custom-style="inputStyle" />
				</view>

				<view class="form-item">
					<view class="form-label">
						<text>统一社会信用代码</text>
						<text class="required">*</text>
					</view>
					<u-input v-model="form.company_number" placeholder="请输入统一社会信用代码" :custom-style="inputStyle" />
				</view>

				<view class="form-item" @click="showPicker = true">
					<view class="form-label">
						<text>所在地区</text>
						<text class="required">*</text>
					</view>
					<u-input v-model="selectedText" placeholder="请选择所在地区" :custom-style="inputStyle" readonly />
				</view>
			</view>

			<!-- 法定代表人信息 -->
			<view class="section">
				<view class="section-header">
					<image class="section-icon" src="/static/icon/h23.png" mode="aspectFit"></image>
					<text class="section-title">法定代表人信息</text>
				</view>

				<view class="form-item">
					<view class="form-label">
						<text>姓名</text>
						<text class="required">*</text>
					</view>
					<u-input v-model="form.company_present_name" placeholder="请输入法定代表人姓名" :custom-style="inputStyle" />
				</view>

				<view class="form-item">
					<view class="form-label">
						<text>身份证号码</text>
						<text class="required">*</text>
					</view>
					<u-input v-model="form.company_present_id_number" placeholder="请输入身份证号码" :custom-style="inputStyle" />
				</view>

				<view class="form-item">
					<view class="form-label">
						<text>联系电话</text>
						<text class="required">*</text>
					</view>
					<u-input v-model="form.company_present_mobile" placeholder="请输入联系电话" :custom-style="inputStyle" />
				</view>
			</view>

			<!-- 资质证明 -->
			<view class="section">
				<view class="section-header">
					<image class="section-icon" src="/static/icon/h71.png" mode="aspectFit"></image>
					<text class="section-title">资质证明</text>
				</view>

				<view class="form-item">
					<view class="form-label">
						<text>营业执照</text>
						<text class="required">*</text>
					</view>
					<view class="upload-item" @click="chooseImage('businessLicense')">
						<image  v-if="form.company_id_pic" class="upload-img" :src="form.company_id_pic" mode="aspectFit"></image>
						<template v-else>
							<image class="upload-icon" src="/static/icon/upload.png" mode="aspectFit"></image>
							<text class="upload-text">点击上传营业执照</text>
							<text class="upload-tip">支持 jpg、png 格式</text>
						</template>
					</view>
				</view>

				<view class="form-item">
					<view class="form-label">
						<text>法人身份证正面</text>
						<text class="required">*</text>
					</view>
					<view class="upload-item" @click="chooseImage('idCardFront')">
						<image  v-if="form.company_present_id_up_pic" class="upload-img" :src="form.company_present_id_up_pic" mode="aspectFit"></image>
						<template v-else>
							<image class="upload-icon" src="/static/icon/upload.png" mode="aspectFit"></image>
							<text class="upload-text">点击上传身份证正面</text>
							<text class="upload-tip">支持 jpg、png 格式</text>
						</template>
					</view>
				</view>

				<view class="form-item">
					<view class="form-label">
						<text>法人身份证反面</text>
						<text class="required">*</text>
					</view>
					<view class="upload-item" @click="chooseImage('idCardBack')">
						<image  v-if="form.company_present_id_down_pic" class="upload-img" :src="form.company_present_id_down_pic" mode="aspectFit"></image>
						<template v-else>
							<image class="upload-icon" src="/static/icon/upload.png" mode="aspectFit"></image>
							<text class="upload-text">点击上传身份证反面</text>
							<text class="upload-tip">支持 jpg、png 格式</text>
						</template>
					</view>
				</view>
			</view>

			<!-- 补充材料 -->
			<view class="section">
				<view class="section-header add-material">
					<text class="add-icon">+</text>
					<text class="section-title add-title">补充材料</text>
				</view>

				<view class="form-item">
					<view class="form-label">
						<text>行业资质证书</text>
					</view>
					<view class="upload-item" @click="chooseImage('qualification')">
						<image  v-if="form.company_other_files" class="upload-img" :src="form.company_other_files" mode="aspectFit"></image>
						<template v-else>
							<image class="upload-icon" src="/static/icon/upload.png" mode="aspectFit"></image>
							<text class="upload-text">点击上传资质证书</text>
							<text class="upload-tip">支持 jpg、png、pdf 格式</text>
						</template>
					</view>
				</view>

				<view class="form-item">
					<view class="form-label">
						<text>企业简介</text>
					</view>
					<u--textarea v-model="form.descp" height="140" maxlength="500" :custom-style="textareaStyle" placeholder="请输入企业简介,500字内。" type="textarea"></u--textarea>
				</view>
			</view>

			<!-- 提交按钮 -->
			<view class="submit-section">
				<u-button type="primary" :custom-style="submitBtnStyle" @click="submitForm">
					保存提交
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
	import {authEntity} from "@/utils/api.js"
	import {uploadFileInChunks } from '@/utils/upload.js'
	import RegionPicker from '@/components/RegionPicker.vue';
	export default {
		components: {
			RegionPicker
		},
		data() {
			return {
				description: '请填写企业真实资料。',
				showPicker: false,
				userInfo: {},
				selectedCodes: [5, 58, 698, 8031],
				selectedText: '请选择地区',
				form: {
					province:0,
					city:0,
					town:0,
					street:0,
					name:'',
					descp: '',
					company_number:'',
					company_present_name:'',
					company_present_id_number: '',
					company_present_mobile:'',
					company_id_pic:'',
					company_present_id_up_pic:'',
					company_present_id_down_pic:'',
					company_other_files: '',
								
				},
				
				inputStyle: {
					backgroundColor: '#F8F9FA',
					border: 'none',
					borderRadius: '16rpx',
					height: '88rpx',
					fontSize: '28rpx',
					color: '#333333'
				},
				textareaStyle: {
					backgroundColor: '#F8F9FA',
					border: 'none',
					borderRadius: '16rpx',
					height: '160rpx',
					fontSize: '28rpx',
					color: '#333333'
				},
				submitBtnStyle: {
					backgroundColor: '#3D6AFF',
					borderRadius: '48rpx',
					height: '96rpx',
					fontSize: '32rpx',
					fontWeight: '500'
				}
			}
		},
		onLoad() {
			this.getUserInfo()
		},
		methods: {
			handleConfirm({selectedValues,selectedNames}) {
				 console.log('选中 ID:', selectedValues);
				// console.log('选中名称:', selectedNames);
				this.selectedCodes = selectedValues;
				this.selectedText=selectedNames.join(' ') 
			},
			// 获取用户信息
			getUserInfo() {				
				this.userInfo = uni.getStorageSync('$userinfo'); 
				this.form={...this.userInfo.entityInfo}
			},
			onCompanyTypeConfirm(value) {
				this.form.companyType = this.companyTypeList[value[0]]
				this.showCompanyTypePicker = false
			},			
			chooseImage(type) {
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
							if(type=='businessLicense')
								that.form.company_id_pic=res.filePath
							else if(type=='idCardFront')
								that.form.company_present_id_up_pic=res.filePath
							else if(type=='idCardBack')
								that.form.company_present_id_down_pic=res.filePath
							else if(type=='qualification')
								that.form.company_other_files=res.filePath
							console.log(`上传${type}:`, res.tempFilePaths[0])
						}).catch(err => {
						  console.error('上传失败:', err);
						});
					}
				}) 
			},
			 
			submitForm() {
				// 表单验证
				if (!this.validateForm()) {
					return
				}
				this.form.province=this.selectedCodes[0]
				this.form.city=this.selectedCodes[1] 
				this.form.town=this.selectedCodes[2] 
				this.form.street=this.selectedCodes[3] 
				const data={...this.form}
				authEntity(data).then(res => {
					if (res) {
						this.$store.dispatch('getuserinfo');
						uni.showToast({
							title: "保存成功,等待审核",
							icon: 'success'
						}); 
						let goBack = setTimeout(() => {
							uni.navigateBack()
							clearInterval(goBack);
						}, 1000)
					}
				});
				// 提交表单
				console.log('提交表单:', this.form)
				uni.showToast({
					title: '提交成功',
					icon: 'success'
				})
			},
			validateForm() {
				const {
					province,
					city,
					town,
					street,
					name,
					descp,
					company_number,
					company_present_name,
					company_present_id_number,
					company_present_mobile,
					company_id_pic,
					company_present_id_up_pic,
					company_present_id_down_pic,
					company_other_files,
				} = this.form

				if (!name) {
					uni.showToast({
						title: '请输入企业名称',
						icon: 'none'
					})
					return false
				}
				if (!company_number) {
					uni.showToast({
						title: '请输入统一社会信用代码',
						icon: 'none'
					})
					return false
				}
				// if (!province) {
				// 	uni.showToast({
				// 		title: '请选择所在地区',
				// 		icon: 'none'
				// 	})
				// 	return false
				// }
				if (!company_present_name) {
					uni.showToast({
						title: '请输入法定代表人姓名',
						icon: 'none'
					})
					return false
				}
				if (!company_present_id_number) {
					uni.showToast({
						title: '请输入身份证号码',
						icon: 'none'
					})
					return false
				}
				if (!company_present_mobile) {
					uni.showToast({
						title: '请输入联系电话',
						icon: 'none'
					})
					return false
				}
				if (!company_id_pic) {
					uni.showToast({
						title: '请上传营业执照图片',
						icon: 'none'
					})
					return false
				}
				if (!company_present_id_up_pic) {
					uni.showToast({
						title: '请上传身份证正面',
						icon: 'none'
					})
					return false
				}
				if (!company_present_id_down_pic) {
					uni.showToast({
						title: '请上传身份证背面',
						icon: 'none'
					})
					return false
				}
				if (!company_other_files) {
					uni.showToast({
						title: '请上传资质资质证书',
						icon: 'none'
					})
					return false
				}
				return true
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		height: 100%;
		background-color: #F5F6FA;
	}

	.alert-title {
		padding-bottom: 30rpx;
	}

	.scroll-content {
		height: 100%;
		padding: 32rpx;
	}

	.section {
		margin-bottom: 40rpx;
		background-color: #fff;
		border-radius: 24rpx;
		padding: 32rpx;

		.section-header {
			display: flex;
			align-items: center;
			margin-bottom: 32rpx;

			.section-icon {
				width: 40rpx;
				height: 40rpx;
				margin-right: 16rpx;
			}

			.section-title {
				font-size: 32rpx;
				font-weight: 500;
				color: #333333;
			}

			&.add-material {
				.add-icon {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 40rpx;
					height: 40rpx;
					margin-right: 16rpx;
					background-color: #3D6AFF;
					color: #fff;
					font-size: 24rpx;
					border-radius: 50%;
				}

				.add-title {
					color: #3D6AFF;
				}
			}
		}
	}

	.form-item {
		margin-bottom: 32rpx;

		.form-label {
			display: flex;
			align-items: center;
			margin-bottom: 16rpx;
			font-size: 28rpx;
			color: #333333;

			.required {
				color: #FF4D4F;
				margin-left: 8rpx;
			}
		}
	}

	.upload-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 300rpx;
		background-color: #F8F9FA;
		border: 2rpx dashed #D9D9D9;
		border-radius: 16rpx;

		.upload-icon {
			width: 48rpx;
			height: 48rpx;
			margin-bottom: 16rpx;
		}
		.upload-img {
			width:100%;
			height: 300rpx; 
			border-radius: 16rpx;
			margin:10rpx;
		}
		.upload-text {
			font-size: 28rpx;
			color: #666666;
			margin-bottom: 8rpx;
		}

		.upload-tip {
			font-size: 24rpx;
			color: #999999;
		}
	}

	.submit-section {
		padding: 60rpx 0 40rpx;
	}

	::v-deep .u-input__content {
		background-color: #F8F9FA !important;
		border: none !important;
	}

	::v-deep .u-input__content__field-wrapper__field {
		background-color: transparent !important;
	}
</style>