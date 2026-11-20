<template>
	<view class="container">
		<view class="scroll-content">
			<view v-if="userInfo.remark" class="alert-title"><u-alert type="error" :showIcon="true" fontSize="28"
					:description="userInfo.remark"></u-alert></view>
			
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
					<u-input v-model="form.name" disabled placeholder="请输入企业名称" :custom-style="inputStyle" />
				</view>

				<view class="form-item">
					<view class="form-label">
						<text>统一社会信用代码</text>
						<text class="required">*</text>
					</view>
					<u-input v-model="form.company_number" disabled placeholder="请输入统一社会信用代码"
						:custom-style="inputStyle" />
				</view>

				<view class="form-item">
					<view class="form-label">
						<text>所在地区</text>
						<text class="required">*</text>
					</view>
					<u-input v-model="selectedText" placeholder="请选择所在地区" :custom-style="inputStyle" disabled />
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
					<u-input v-model="form.company_present_name" placeholder="请输入法定代表人姓名" :custom-style="inputStyle"
						disabled />
				</view>

				<view class="form-item">
					<view class="form-label">
						<text>身份证号码</text>
						<text class="required">*</text>
					</view>
					<u-input v-model="form.company_present_id_number" placeholder="请输入身份证号码" :custom-style="inputStyle"
						disabled />
				</view>

				<view class="form-item">
					<view class="form-label">
						<text>联系电话</text>
						<text class="required">*</text>
					</view>
					<u-input v-model="form.company_present_mobile" placeholder="请输入联系电话" :custom-style="inputStyle"
						disabled />
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
					<view class="upload-item">
						<image v-if="form.company_id_pic" class="upload-img" :src="form.company_id_pic"
							mode="aspectFit"></image>
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
					<view class="upload-item">
						<image v-if="form.company_present_id_up_pic" class="upload-img"
							:src="form.company_present_id_up_pic" mode="aspectFit"></image>
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
					<view class="upload-item">
						<image v-if="form.company_present_id_down_pic" class="upload-img"
							:src="form.company_present_id_down_pic" mode="aspectFit"></image>
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
					<view class="upload-item">
						<image v-if="form.company_other_files" class="upload-img" :src="form.company_other_files"
							mode="aspectFit"></image>
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
					<u--textarea v-model="form.descp" height="140" maxlength="500" disabled
						:custom-style="textareaStyle" placeholder="请输入企业简介,500字内。" type="textarea"></u--textarea>
				</view>
			</view>
			<view class="audit-card">
				<!-- 标题栏 -->
				<view class="title-bar">
					<image class="icon-file" src="/static/icon/h33.png" mode="aspectFit"></image>
					<text class="title">审核操作</text>
				</view>

				<!-- 审核状态选择 -->
				<view class="audit-status-section">
					<text class="section-title">审核状态</text>
					<view class="radio-group">
						<view class="radio-item" v-for="(item, index) in statusOptions" :key="index"
							@click="selectStatus(index)">
							<view class="radio-wrapper">
								<view class="radio-btn" :class="{ 'radio-checked': selectedStatus === index }"></view>
								<text class="radio-text" :class="{ 'text-checked': selectedStatus === index }">
									{{ item.label }}
								</text>
							</view>
						</view>
						</div>
					</view>

					<!-- 审核意见 -->
					<view class="audit-opinion-section">
						<text class="section-title">审核意见</text> 
							<u--textarea v-model="auditOpinion" height="140" maxlength="500" 
							 placeholder="请输入审核意见,500字内。" type="textarea"></u--textarea> 
					</view>

					<!-- 提交按钮 -->
					<view class="submit-section">
						<u-button type="primary" :custom-style="buttonStyle" @click="submitAudit" :loading="isLoading">
							提交审核结果
						</u-button>
						<view v-if="0" class=" margin alert-title"><u--text type="primary" text="查看审核记录" size="30"></u--text></view>
						
					</view>
				</view>
				 
			</view>
		</view>
		<!-- 地区选择弹窗 -->
		<RegionPicker :show.sync="showPicker" :provinceCode="'15'" :selectedValues="selectedCodes"
			@confirm="handleConfirm" />
	</view>
</template>

<script>
	import {reviewEntity,getReview} from "@/utils/api.js"
	import RegionPicker from '@/components/RegionPicker.vue';
	export default {
		components: {
			RegionPicker
		},
		data() {
			return {
				id:'',
				description: '请填写企业真实资料。',
				showPicker: false,
				userInfo: {},
				selectedCodes: [5, 58, 698, 8031],
				selectedText: '请选择地区',
				form: {
					province: 0,
					city: 0,
					town: 0,
					street: 0,
					name: '',
					descp: '',
					company_number: '',
					company_present_name: '',
					company_present_id_number: '',
					company_present_mobile: '',
					company_id_pic: '',
					company_present_id_up_pic: '',
					company_present_id_down_pic: '',
					company_other_files: '',
				},

				selectedStatus: 0, // 默认选中"通过"
				auditOpinion: '',
				isLoading: false,
				statusOptions: [{
						label: '通过',
						value:2
					},
					{
						label: '不通过',
						value: 3
					},
					{
						label: '已驳回',
						value: 4
					}
				],
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
				},
				buttonStyle: {
					background: '#3D6AFF',
					borderRadius: '50rpx',
					height: '88rpx',
					fontSize: '32rpx',
					fontWeight: '500'
				}
			}
		},
		computed: {
			placeholder() {
				return '请输入审核意见(必填)'
			}
		},
		onLoad(options) {
			if(options.id){
				this.id=options.id
				this.getReviewInfo()
				this.getUserInfo()
			}else{
				uni.navigateBack()
			}
		
			
		},
		methods: {
			handleConfirm({
				selectedValues,
				selectedNames
			}) {
				console.log('选中 ID:', selectedValues);
				// console.log('选中名称:', selectedNames);
				this.selectedCodes = selectedValues;
				this.selectedText = selectedNames.join(' ')
			},
			// 获取用户信息
			getUserInfo() {
				this.userInfo = uni.getStorageSync('$userinfo');
				 
			},
			getReviewInfo(){
				const data={entity_id:this.id}
				getReview(data).then(res=>{
					if(res.code==0 && res.data.length>0)
					this.form=res.data[0]
				})
			},
			onCompanyTypeConfirm(value) {
				this.form.companyType = this.companyTypeList[value[0]]
				this.showCompanyTypePicker = false
			},			
			selectStatus(index) {
				this.selectedStatus = index
			},

			async submitAudit() {
				// 验证必填项
				if (!this.auditOpinion.trim()) {
					this.$u.toast('请输入审核意见')
					return
				}

				this.isLoading = true

				try {
					const params = {
						entity_id:this.form.entity_id,
						review_status: this.statusOptions[this.selectedStatus].value,
						remark: this.auditOpinion.trim()
					} 
					// 调用审核提交接口
					const result = await reviewEntity(params)
					console.log(params,result)
					// 模拟提交
					await this.delay(1000)

					this.$u.toast('提交成功')

					// 延迟返回上一页
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)

				} catch (error) {
					console.error('提交失败:', error)
					this.$u.toast('提交失败，请重试')
				} finally {
					this.isLoading = false
				}
			},

			delay(ms) {
				return new Promise(resolve => setTimeout(resolve, ms))
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
			width: 100%;
			height: 300rpx;
			border-radius: 16rpx;
			margin: 10rpx;
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


	.audit-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 48rpx 32rpx;
		
	}

	.title-bar {
		display: flex;
		align-items: center;
		margin-bottom: 48rpx;

		.icon-file {
			width: 32rpx;
			height: 32rpx;
			margin-right: 16rpx;
		}

		.title {
			font-size: 36rpx;
			font-weight: 600;
			color: #333333;
		}
	}

	.audit-status-section {
		margin-bottom: 10rpx;

		.section-title {
			display: block;
			font-size: 24rpx;
			font-weight: 500;
			color: #999;
			margin-top: 32rpx;
			margin-bottom: 20rpx;
		}

		.radio-group {
			display: flex;
			align-items: center;
			gap: 48rpx;
		}

		.radio-item {
			.radio-wrapper {
				display: flex;
				align-items: center;
				cursor: pointer;
			}

			.radio-btn {
				width: 32rpx;
				height: 32rpx;
				border: 2rpx solid #d9d9d9;
				border-radius: 50%;
				margin-right: 16rpx;
				position: relative;
				transition: all 0.3s ease;

				&.radio-checked {
					border-color: #3D6AFF;
					background-color: #3D6AFF;

					&::after {
						content: '';
						position: absolute;
						top: 50%;
						left: 50%;
						transform: translate(-50%, -50%);
						width: 12rpx;
						height: 12rpx;
						background-color: #ffffff;
						border-radius: 50%;
					}
				}
			}

			.radio-text {
				font-size: 28rpx;
				color: #666666;
				transition: color 0.3s ease;

				&.text-checked {
					color: #3D6AFF;
					font-weight: 500;
				}
			}
		}
	}

	.audit-opinion-section {
		margin-bottom: 80rpx;

		.section-title {
			display: block;
			font-size: 24rpx;
			font-weight: 500;
			color: #999;
			margin-bottom: 10rpx;
		}

		.textarea-wrapper {
			background-color: #f8f9fa;
			border-radius: 12rpx;
			padding: 24rpx;
			min-height: 200rpx;
			border: 1rpx solid #e5e5e5;
		}
	}

	.submit-section {
		margin-top: 48rpx;
	}

	::v-deep .custom-textarea {
		.u-input__textarea {
			font-size: 28rpx;
			color: #333333;
			line-height: 1.6;

			&::placeholder {
				color: #999999;
				font-size: 28rpx;
			}
		}
	}

	::v-deep .u-button {
		width: 100% !important;
	}
</style>