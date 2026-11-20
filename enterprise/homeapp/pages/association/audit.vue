<template>
	<view class="publish-service-page"> 
		<!-- 进度条和Tab -->
		<view class="progress-section">
			<view class="progress-tabs">
				<view class="tab-item" :class="{ active: activeTab === 'base' }" @click="activeTab = 'base'">基本信息</view>
				<view class="tab-item" :class="{ active: activeTab === 'cert' }" @click="activeTab = 'cert'">资质文件</view>
			</view>
			<view class="progress-bar">
				<view class="progress-fill" :style="{ width: progressWidth }"></view>
			</view>
		</view>

		<view class="form-container">
			<!-- 基本信息表单 -->
			<view v-if="activeTab === 'base'">
				<!-- 选择服务类型（大类+细类） -->
				<view class="form-section">
					<view class="section-title">服务类型</view>
					<view class="service-type-grid">
						<view v-for="type in serviceTypeList" :key="type.id" class="type-item"
							:class="{ active: selectedServiceType === type.id }">
							<view class="type-icon">
								<image :src="type.icon" mode="aspectFill" class="type-icon-image"
									:class="{ 'icon-active': selectedServiceType === type.id }"></image>
							</view>
							<text class="type-text">{{ type.name }}</text>
						</view>
					</view>
					<view v-if="selectedServiceType" class="subtype-grid">
						<view v-for="sub in getSelectedSubTypes" :key="sub.id" class="subtype-item"
							:class="{ active: selectedSubType === sub.id }">
							{{ sub.name }}
						</view>
					</view>
				</view>

				<!-- 服务名称 -->
				<view class="form-section">
					<view class="section-title">服务名称</view>
					<u-input v-model="formData.title" border="none" :custom-style="inputStyle" disabled></u-input>
				</view>

				<!-- 服务简介 -->
				<view class="form-section">
					<view class="section-title">服务简介</view>
					<u--textarea v-model="formData.description" height="140" maxlength="500"
						:custom-style="textareaStyle" placeholder="" type="textarea" disabled />
				</view>

				<!-- 服务标签 -->
				<view class="form-section">
					<view class="section-title">服务标签</view>
					<view class="tags-container">
						<view v-for="(tag, index) in selectedTags" :key="index" class="tag-item selected">
							{{ tag.name || tag }}
						</view>
					</view>
					<view class="tag-tip">选择合适的标签，让客户更直观找到您</view>
				</view>

				<!-- 服务区域 -->
				<view class="form-section">
					<view class="section-title">服务区域</view>
					<view class="area-row">
						<view class="picker-input">
							<text class="picker-text">{{ selectedRegionText }}</text>
						</view>
					</view>
					<!-- 详细地址输入框 -->
					<view style="margin-top: 24rpx;">
						<u-input v-model="formData.address" border="none" :custom-style="inputStyle" disabled></u-input>
					</view>
				</view>

				<!-- 定价方式 -->
				<view class="form-section">
					<view class="section-title">定价方式</view>
					<view class="pricing-options">
						<view class="pricing-item" :class="{ active: selectedPricing == '1' }">
							按次计费
						</view>
						<view class="pricing-item" :class="{ active: selectedPricing == '2' }">
							按时计费
						</view>
						<view class="pricing-item" :class="{ active: selectedPricing == '3' }">
							面议
						</view>
					</view>
				</view>

				<!-- 服务价格 -->
				<view class="form-section">
					<view class="section-title">服务价格</view>
					<view class="price-input">
						<u-input v-model="formData.price" type="number" border="none" :custom-style="inputStyle" disabled></u-input>
					</view>
					<view class="unit-tag-row">
						<view v-for="unit in unitOptions" :key="unit" class="unit-tag"
							:class="{active: formData.unit === unit}">
							{{ unit }}
						</view>
					</view>
				</view>

				<!-- 服务详情 -->
				<view class="form-section">
					<view class="section-title">服务详情</view>
					<view class="upload-section">
						<view class="upload-tip">
							<u-icon name="photo" size="40" color="#999"></u-icon>
							<text class="tip-text">服务案例图片</text>
						</view>
						<view class="image-grid">
							<view class="image-item" v-for="(item, index) in uploadedImages" :key="index">
								<image :src="item" mode="aspectFill" class="uploaded-image" @click="previewImage(index)"></image>
							</view>
						</view>
						<!-- 视频模块 -->
						<view class="upload-video-section">
							<view class="upload-tip">
								<u-icon name="play-right" size="40" color="#999"></u-icon>
								<text class="tip-text">服务案例视频</text>
							</view>
							<view class="video-grid">
								<view v-if="uploadedVideo" class="video-item">
									<video :src="uploadedVideo" controls class="uploaded-video"></video>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 资质文件表单 -->
			<view v-else>
				<view class="form-section">
					<view class="section-title">资质文件</view>
					<view class="qualification-tabs">
						<view
							v-for="(item, idx) in qualificationFiles"
							:key="idx"
							class="qualification-tab"
							:class="{active: currentQualificationIdx === idx}"
							@click="currentQualificationIdx = idx"
						>
							{{ item.name }}
						</view>
					</view>
					<view class="qualification-preview" v-if="qualificationFiles[currentQualificationIdx] && qualificationFiles[currentQualificationIdx].file">
						<image
							:src="qualificationFiles[currentQualificationIdx].file"
							@click="previewQualificationFile(currentQualificationIdx)"
							style="width: 200rpx; height: 200rpx; border-radius: 8rpx; margin: 24rpx auto; display: block;"
						/>
					</view>
					<view v-else style="text-align:center;color:#bbb;margin:32rpx 0;">暂无文件</view>
				</view>
			</view>
		</view>

		<!-- 审核意见和按钮 -->
		<view class="bottom-section">
			<view class="audit-remark-section" style="margin-bottom: 24rpx;">
				<u--textarea v-model="remark" placeholder="请输入审核意见" :maxlength="200" />
			</view>
			<view class="audit-btns" style="display: flex; gap: 24rpx;">
				<u-button type="primary" @click="submitAudit(2)" :loading="loading">审核通过</u-button>
				<u-button type="error" @click="submitAudit(0)" :loading="loading">审核拒绝</u-button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getCategory,		
		getServiceProductDetail,
		auditServiceProduct
	} from '@/utils/api'
	import {getRegionByIndex} from '@/utils/province.js' 
	export default {
		name: 'PublishServicePage', 
		data() {
			return {
				activeTab: 'base',
				selectedServiceType: '',
				selectedSubType: '',
				selectedTags: [],
				selectedPricing: '1', 
				loading: false,
				formData: {
					title: '',
					description: '',
					price: '',
					address: '',
					unit: '次'
				},
				uploadedImages: [],
				uploadedVideo:'',
				selectedRegionCodes: [5, 58, 698, 8031],
				selectedRegionText: '请选择服务区域',
				regionDefaultProvinceCode: '15',
				inputStyle: {
					backgroundColor: '#f8f9fa',
					borderRadius: '12rpx',
					padding: '24rpx',
					fontSize: '28rpx'
				},
				textareaStyle: {
					backgroundColor: '#f8f9fa',
					borderRadius: '12rpx',
					padding: '24rpx',
					fontSize: '28rpx',
					minHeight: '200rpx'
				},
				nextButtonStyle: {
					backgroundColor: '#3D6AFF',
					borderRadius: '12rpx',
					height: '88rpx',
					fontSize: '32rpx',
					color: '#fff'
				},
				serviceTypeList: [], // 由接口获取
				showTagPicker: false,
				maxTagCount: 10,
				tagCategories: [],
				qualificationFiles: [{
						name: '营业执照',
						file: ''
					},
					{
						name: '相关资质证书',
						file: ''
					},
					{
						name: '服务合同模板',
						file: ''
					},
					{
						name: '其他证明材料',
						file: ''
					}
				],
				unitOptions: ['次', '小时', '月', '年', '面议'],
				remark: '',
				currentQualificationIdx: 0,
			}
		},
		computed: {
			getSelectedSubTypes() {
				const type = this.serviceTypeList.find(t => t.id === this.selectedServiceType)
				return type && type.children ? type.children : []
			},
			progressWidth() {
				return this.activeTab === 'base' ? '50%' : '100%'
			}
		},
		onLoad(options) {
			if(options.id){
				//加载服务详情
				this.loadServiceDetail(options.id);
			}
			this.fetchServiceTypes();
		},
		methods: {
			loadServiceDetail(id){
				getServiceProductDetail({id}).then(res=>{
					if(res.code == 0){
						this.formData = res.data[0];
						this.selectedServiceType = this.formData.category_id;
						this.selectedSubType = this.formData.sub_category_id;
						this.selectedTags = JSON.parse(this.formData.tags);
						this.selectedPricing = this.formData.price_type; 
						this.selectedRegionCodes = [this.formData.province, this.formData.city, this.formData.district];
						this.uploadedImages = JSON.parse(this.formData.images);
						this.uploadedVideo = this.formData.videos;
						this.qualificationFiles = JSON.parse(this.formData.qualification); 
						
						this.selectedRegionText=`${getRegionByIndex(this.formData.province).n} ${getRegionByIndex(this.formData.city).n} ${getRegionByIndex(this.formData.district).n}`
					}
				})
			},
			fetchServiceTypes() {
				getCategory().then(res => {
					this.serviceTypeList = res.data || [];
				});
			}, 
			previewImage(index) {
				uni.previewImage({
					urls: this.uploadedImages,
					current: index
				})
			},
			previewQualificationFile(idx) {
				if (this.qualificationFiles[idx].file) {
					uni.previewImage({
						urls: [this.qualificationFiles[idx].file]
					})
				}
			},
			async submitAudit(status) {
				if (!this.remark) {
					uni.showToast({ title: '请填写审核意见', icon: 'none' });
					return;
				}
				this.loading = true;
				try {
					const res = await auditServiceProduct({
						service_id: this.formData.id,
						status,
						remark: this.remark
					});
					if (res.code === 0) {
						uni.showToast({ title: '审核成功', icon: 'success' });
						setTimeout(() => uni.navigateBack(), 1200);
					} else {
						uni.showToast({ title: res.msg || '审核失败', icon: 'none' });
					}
				} catch (e) {
					uni.showToast({ title: '网络错误', icon: 'none' });
				}
				this.loading = false;
			},
		}
	}
</script>

<style lang="scss" scoped>
	.publish-service-page {
		background-color: #f8f9fa;
		min-height: 100vh;
		padding-bottom: 240rpx;
	}

	.navbar-right {
		padding-right: 32rpx;
	}

	.progress-section {
		background-color: #fff;
		padding: 32rpx;
		margin-bottom: 20rpx;

		.progress-tabs {
			display: flex;
			justify-content: center;
			margin-bottom: 24rpx;

			.tab-item {
				font-size: 28rpx;
				color: #999;
				margin: 0 48rpx;

				&.active {
					color: #3D6AFF;
					font-weight: 500;
				}
			}
		}

		.progress-bar {
			height: 8rpx;
			background-color: #f0f0f0;
			border-radius: 4rpx;
			overflow: hidden;

			.progress-fill {
				height: 100%;
				background-color: #3D6AFF;
				border-radius: 4rpx;
				transition: width 0.3s ease;
			}
		}
	}

	.form-container {
		padding: 0 32rpx;
	}

	.form-section {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 32rpx;
		margin-bottom: 20rpx;

		.section-title {
			font-size: 32rpx;
			font-weight: 500;
			color: #333;
			margin-bottom: 24rpx;
		}
	}

	.service-type-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 24rpx;

		.type-item {
			flex: 0 0 calc(25% - 18rpx);
			max-width: calc(25% - 18rpx);
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 20rpx 12rpx;
			border: 2rpx solid #e8e8e8;
			border-radius: 16rpx;
			background-color: #fff;
			transition: all 0.3s ease;
			min-width: 120rpx;
			margin-bottom: 16rpx;

			&.active {
				border-color: #3D6AFF;
				background-color: #3D6AFF;

				.type-icon {
					color: #fff;
				}

				.type-text {
					color: #fff;
				}
			}

			.type-icon {
				margin-bottom: 16rpx;

				.type-icon-image {
					width: 40rpx;
					height: 40rpx;
				}
			}

			.type-text {
				font-size: 28rpx;
				color: #666;
				text-align: center;
				word-break: break-all;
			}
		}
	}

	.subtype-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-top: 24rpx;

		.subtype-item {
			padding: 16rpx 24rpx;
			background-color: #f0f0f0;
			border-radius: 24rpx;
			font-size: 26rpx;
			color: #666;
			margin-bottom: 8rpx;

			&.active {
				background-color: #3D6AFF;
				color: #fff;
			}
		}
	}

	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-bottom: 16rpx;
	}

	.tag-item {
		padding: 12rpx 24rpx;
		border-radius: 40rpx;
		font-size: 24rpx;
		display: flex;
		align-items: center;

		&.selected {
			background-color: rgba(61, 106, 255, 0.1);
			color: #3D6AFF;
			border: 2rpx solid #3D6AFF;
		}

		&.add-tag {
			background-color: #fff;
			color: #3D6AFF;
			border: 2rpx dashed #3D6AFF;
		}
	}

	.tag-tip {
		font-size: 24rpx;
		color: #999;
	}

	.area-row {
		display: flex;
		gap: 24rpx;

		.picker-input {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 24rpx;
			background-color: #f8f9fa;
			border-radius: 12rpx;

			.picker-text {
				font-size: 28rpx;
				color: #333;
			}
		}
	}

	.pricing-options {
		display: flex;
		gap: 16rpx;

		.pricing-item {
			flex: 1;
			text-align: center;
			padding: 20rpx;
			background-color: #f0f0f0;
			border-radius: 12rpx;
			font-size: 28rpx;
			color: #666;

			&.active {
				background-color: #3D6AFF;
				color: #fff;
			}
		}
	}

	.price-input {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.unit-tag-row {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		margin-top: 16rpx;
	}

	.unit-tag {
		padding: 12rpx 32rpx;
		background-color: #f0f0f0;
		border-radius: 24rpx;
		font-size: 26rpx;
		color: #666;
		cursor: pointer;

		&.active {
			background-color: #3D6AFF;
			color: #fff;
		}
	}

	.upload-section {
		.upload-tip {
			display: flex;
			align-items: center;
			gap: 16rpx;
			margin-bottom: 24rpx;

			.tip-text {
				font-size: 26rpx;
				color: #999;
			}
		}

		.image-grid {
			display: flex;
			flex-wrap: wrap;
			gap: 16rpx;

			.image-item {
				position: relative;
				width: 160rpx;
				height: 160rpx;
				border-radius: 12rpx;
				overflow: hidden;

				.uploaded-image {
					width: 100%;
					height: 100%;
				}
			}
		}
	}

	.upload-video-section {
		margin-top: 32rpx;

		.upload-tip {
			display: flex;
			align-items: center;
			gap: 16rpx;
			margin-bottom: 24rpx;

			.tip-text {
				font-size: 26rpx;
				color: #999;
			}
		}

		.video-grid {
			display: flex;
			flex-wrap: wrap;
			gap: 16rpx;

			.video-item {
				position: relative;
				width: 320rpx;
				height: 180rpx;
				border-radius: 12rpx;
				overflow: hidden;

				.uploaded-video {
					width: 100%;
					height: 100%;
					background: #000;
				}
			}
		}
	}

	.qualification-tabs {
		display: flex;
		gap: 16rpx;
		margin-bottom: 24rpx;
		.qualification-tab {
			padding: 12rpx 32rpx;
			border-radius: 24rpx;
			background: #f0f0f0;
			color: #666;
			font-size: 26rpx;
			cursor: pointer;
			&.active {
				background: #3D6AFF;
				color: #fff;
				font-weight: 500;
			}
		}
	}
	.qualification-preview {
		text-align: center;
	}

	.bottom-section {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #fff;
		padding: 32rpx;
		border-top: 1rpx solid #e8e8e8;
		z-index: 99;
		box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.06);
	}

	::v-deep .u-input__textarea {
		min-height: 200rpx !important;
	}

	.type-icon-image {
		width: 40rpx;
		height: 40rpx;
	}

	.icon-active {
		filter: brightness(0) invert(1);
	}
</style>