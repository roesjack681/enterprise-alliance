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
					<view class="section-title">选择服务类型</view>
					<!-- 一级分类 -->
					<view class="service-type-grid">
						<view v-for="type in serviceTypeList" :key="type.id" class="type-item"
							:class="{ active: selectedServiceType === type.id }" @click="selectServiceType(type.id)">
							<view class="type-icon">
								<image :src="type.icon" mode="aspectFill" class="type-icon-image"
									:class="{ 'icon-active': selectedServiceType === type.id }"></image>
							</view>
							<text class="type-text">{{ type.name }}</text>
						</view>
					</view>
					<!-- 二级分类 -->
					<view v-if="selectedServiceType" class="subtype-grid">
						<view v-for="sub in getSelectedSubTypes" :key="sub.id" class="subtype-item"
							:class="{ active: selectedSubType === sub.id }" @click="selectSubType(sub.id)">
							{{ sub.name }}
						</view>
					</view>
				</view>

				<!-- 服务名称 -->
				<view class="form-section">
					<view class="section-title">服务名称</view>
					<u-input v-model="formData.title" placeholder="请输入服务名称" border="none"
						:custom-style="inputStyle"></u-input>
				</view>

				<!-- 服务简介 -->
				<view class="form-section">
					<view class="section-title">服务简介</view>
					<u--textarea v-model="formData.description" height="140" maxlength="500"
						:custom-style="textareaStyle" placeholder="请输入企业简介,500字内。" type="textarea" />
				</view>

				<!-- 服务标签 -->
				<view class="form-section">
					<view class="section-title">服务标签</view>
					<view class="tags-container">
						<view v-for="(tag, index) in selectedTags" :key="index" class="tag-item selected">
							{{ tag.name || tag }}
							<u-icon name="close" size="24" color="#3D6AFF" @click="removeTag(index)"
								style="margin-left: 8rpx;"></u-icon>
						</view>
						<view class="tag-item add-tag" @click="showTagPicker = true">
							<text>+ 添加标签</text>
						</view>
					</view>
					<view class="tag-tip">选择合适的标签，让客户更直观找到您</view>
					<TagSelect v-model="showTagPicker" :selectedTagList="selectedTags" :categories="tagCategories"
						:maxSelect="maxTagCount" @confirm="handleTagConfirm" />
				</view>

				<!-- 服务区域 -->
				<view class="form-section">
					<view class="section-title">服务区域</view>
					<view class="area-row">
						<view class="picker-input" @click="showRegionPicker = true">
							<text class="picker-text">{{ selectedRegionText }}</text>
							<u-icon name="arrow-down" size="24" color="#999"></u-icon>
						</view>
					</view>
					<!-- 详细地址输入框 -->
					<view style="margin-top: 24rpx;">
						<u-input v-model="formData.address" placeholder="请输入详细地址" border="none"
							:custom-style="inputStyle"></u-input>
					</view>
				</view>

				<!-- 定价方式 -->
				<view class="form-section">
					<view class="section-title">定价方式</view>
					<view class="pricing-options">
						<view class="pricing-item" :class="{ active: selectedPricing == '1' }"
							@click="selectPricing('1')">按次计费</view>
						<view class="pricing-item" :class="{ active: selectedPricing == '2' }"
							@click="selectPricing('2')">按时计费</view>
						<view class="pricing-item" :class="{ active: selectedPricing == '3' }"
							@click="selectPricing('3')">面议</view>
					</view>
				</view>

				<!-- 服务价格 -->
				<view class="form-section">
					<view class="section-title">服务价格</view>
					<view class="price-input">
						<u-input v-model="formData.price" placeholder="请输入价格" type="number" border="none"
							:custom-style="inputStyle"></u-input>
					</view>
					<view class="unit-tag-row">
						<view v-for="unit in unitOptions" :key="unit" class="unit-tag"
							:class="{active: formData.unit === unit}" @click="formData.unit = unit">
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
							<text class="tip-text">上传服务案例图片（最多9张,900px*600px）</text>
						</view>
						<view class="image-grid">
							<view class="image-item" v-for="(item, index) in uploadedImages" :key="index"
								@click="previewImage(index)">
								<image :src="item" mode="aspectFill" class="uploaded-image"></image>
								<view class="delete-btn" @click.stop="deleteImage(index)">
									<u-icon name="close" size="24" color="#fff"></u-icon>
								</view>
							</view>
							<view class="add-image-btn" @click="chooseImage" v-if="uploadedImages.length < 9">
								<u-icon name="plus" size="48" color="#999"></u-icon>
							</view>
						</view>
						<!-- 新增：上传视频模块 -->
						<view class="upload-video-section">
							<view class="upload-tip">
								<u-icon name="play-right" size="40" color="#999"></u-icon>
								<text class="tip-text">上传服务案例视频（最多1个，支持mp4等格式）</text>
							</view>
							<view class="video-grid">
								<view v-if="uploadedVideo" class="video-item">
									<video :src="uploadedVideo" controls class="uploaded-video"></video>
									<view class="delete-btn" @click="deleteVideo()">
										<u-icon name="close" size="24" color="#fff"></u-icon>
									</view>
								</view>
								<view class="add-video-btn" v-else @click="chooseVideo">
									<u-icon name="plus" size="48" color="#999"></u-icon>
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
					<view class="document-list">
						<view class="document-item" v-for="(item, idx) in qualificationFiles" :key="idx">
							<view class="doc-icon">
								<u-icon name="file-text" size="40" color="#999"></u-icon>
							</view>
							<view class="doc-info">
								<text class="doc-name">{{ item.name }}</text>
								<text class="doc-status required" v-if="idx < 3">必填</text>
							</view>
							<view v-if="item.file" class="doc-upload-preview">
								<image :src="item.file" @click="previewQualificationFile(idx)"
									style="width: 60rpx; height: 60rpx; border-radius: 8rpx; margin-right: 12rpx;">
								</image>
								<u-icon name="close" size="24" color="#ff4757" @click="deleteQualificationFile(idx)" />
							</view>
							<view v-else class="doc-upload-btn" @click="chooseQualificationFile(idx)">
								<u-icon name="plus" size="24" color="#3D6AFF"></u-icon>
								<text style="margin-left: 8rpx; color: #3D6AFF;">上传</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="bottom-section">
			<u-button :custom-style="nextButtonStyle" @click="nextStep" :loading="loading">
				{{ activeTab === 'base' ? '下一步' : '提交' }}
			</u-button>
		</view>

		<!-- 在页面底部加上 RegionPicker 弹窗组件 -->
		<RegionPicker :show.sync="showRegionPicker" :provinceCode="regionDefaultProvinceCode"
			:selectedValues="selectedRegionCodes" @confirm="handleRegionConfirm" />
	</view>
</template>

<script>
	import {
		getCategory,
		createServiceProduct,
		getServiceProductDetail,
		updateServiceProduct
	} from '@/utils/api'
	import RegionPicker from '@/components/RegionPicker.vue';
	import TagSelect from '@/components/TagSelect.vue'
	import {
		uploadFileInChunks
	} from '@/utils/upload.js'

	export default {
		name: 'PublishServicePage',
		components: {
			RegionPicker,
			TagSelect
		},
		data() {
			return {
				activeTab: 'base',
				selectedServiceType: '',
				selectedSubType: '',
				selectedTags: [],
				selectedPricing: '1',
				showRegionPicker: false,
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
					}
				})
			},
			fetchServiceTypes() {
				getCategory().then(res => {
					this.serviceTypeList = res.data || [];
				});
			}, 
			selectServiceType(id) {
				this.selectedServiceType = id
				this.selectedSubType = ''
			},
			selectSubType(id) {
				this.selectedSubType = id;

				const list = this.getSelectedSubTypes; // computed 属性，当普通属性使用
				const type = list.find(t => t.id == id); // 修正 this.list 为 list
				if (type) {
					this.formData.title = type.name;
				}
			},
			handleTagConfirm(tags) {
				this.selectedTags = [...tags];
			},
			removeTag(index) {
				this.selectedTags.splice(index, 1)
			},
			selectPricing(type) {
				this.selectedPricing = type
				// 联动计价单位
				if (type === '1') {
					this.formData.unit = '次'
				} else if (type === '2') {
					this.formData.unit = '小时'
				} else if (type === '3') {
					this.formData.unit = '面议'
				}
			},
			handleRegionConfirm({
				selectedValues,
				selectedNames
			}) {
				this.selectedRegionCodes = selectedValues;
				this.selectedRegionText = selectedNames.join(' ');
			},
			chooseImage() {
				const that = this
				uni.chooseImage({
					count: 9 - that.uploadedImages.length,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success(res) {
						const tempFiles = res.tempFiles
						console.log(res)
						tempFiles.forEach((file, idx) => {
							
							uploadFileInChunks(file, {
								onProgress: (percent) => {
									uni.showLoading({
										title: `上传中 ${percent}%`
									})
								}
							}).then(res => {
								uni.hideLoading()
								that.uploadedImages.push(res.filePath)
							}).catch(err => {
								uni.hideLoading()
								uni.showToast({
									title: '上传失败',
									icon: 'none'
								})
							})
						})
					}
				})
			},
			deleteImage(index) {
				this.uploadedImages.splice(index, 1)
			},
			previewImage(index) {
				uni.previewImage({
					urls: this.uploadedImages,
					current: index
				})
			},
			chooseVideo() {
				const that = this
				uni.chooseVideo({
					success(res) {						 
						uploadFileInChunks(res.tempFile, {
							onProgress: (percent) => {
								uni.showLoading({
									title: `上传中 ${percent}%`
								})
							}
						}).then(res => {
							uni.hideLoading()
							that.uploadedVideo=res.filePath
						}).catch(err => {
							uni.hideLoading()
							console.log(err)
							uni.showToast({
								title: '上传失败',
								icon: 'none'
							})
						})
					}
				})
			},
			deleteVideo() {
				this.uploadedVideo = ''
			},
			previewVideo() {
				if (this.uploadedVideo) {
					// 可用 video 组件预览
					// 或 uni.previewMedia({ sources: [{url: this.uploadedVideo, type: 'video'}] })
				}
			},
			chooseQualificationFile(idx) {
			  const that = this
			  //小程序使用 chooseMessageFile,h5使用chooseFile
			  uni.chooseFile({
			    count: 1,
			    type: 'all',
			    extension: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
			    success(res) { 
			      const file = res.tempFiles[0] 
			      uploadFileInChunks(file, {
			        onProgress: (percent) => {
			          uni.showLoading({ title: `上传中 ${percent}%` })
			        }
			      }).then(res => {
			        uni.hideLoading()
					console.log(res)
			        that.qualificationFiles[idx].file = res.filePath
			      }).catch(err => {
			        uni.hideLoading()
			        console.error(err)
			        uni.showToast({
			          title: '上传失败',
			          icon: 'none'
			        })
			      })
			    },
			    fail(err) {
			      console.error('文件选择失败:', err)
			    }
			  })
			},

			deleteQualificationFile(idx) {
				this.qualificationFiles[idx].file = ''
			},
			previewQualificationFile(idx) {
				if (this.qualificationFiles[idx].file) {
					uni.previewImage({
						urls: [this.qualificationFiles[idx].file]
					})
				}
			},
			async nextStep() {
				if (this.activeTab === 'base') {
					this.activeTab = 'cert'
					return
				}
				this.loading = true
				// 组装 payload
				const userInfo = uni.getStorageSync('$userinfo') || {};
				//const entityId = userInfo.entityInfo?.id || 0;
				const region = this.selectedRegionCodes || [];
				const payload = {
					id: this.formData.id,
					title: this.formData.title,
					description: this.formData.description,
					category_id: this.selectedServiceType,
					sub_category_id: this.selectedSubType,
					tags: JSON.stringify(this.selectedTags),
					price: this.formData.price,
					price_type: this.selectedPricing, // 需与后端约定
					unit: this.formData.unit || '',
					province: region[0] || 0,
					city: region[1] || 0,
					district: region[2] || 0,
					address: this.formData.address,
					images: JSON.stringify(this.uploadedImages),
					videos: this.uploadedVideo,
					qualification: JSON.stringify(this.qualificationFiles),//.map(q => q.file)
					
					//entity_id: entityId
				}
				//添加和修改公共页面了
				const res=payload.id? await updateServiceProduct(payload):await createServiceProduct(payload)
				
				this.loading = false
				if (res.code === 0) {
					uni.showToast({
						title: '提交成功',
						icon: 'success'
					});
					setTimeout(() => uni.navigateBack(), 1200);
				} else {
					uni.showToast({
						title: res.msg || '提交失败',
						icon: 'none'
					});
				} 
			},
		}
	}
</script>

<style lang="scss" scoped>
	.publish-service-page {
		background-color: #f8f9fa;
		min-height: 100vh;
		padding-bottom: 160rpx;
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
		gap: 14rpx;

		.type-item {
			flex: 0 0 calc(25% - 12rpx);
			max-width: calc(25% - 12rpx);
			box-sizing: border-box;
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 20rpx 0;
			border: 2rpx solid #e8e8e8;
			border-radius: 16rpx;
			background-color: #fff;
			transition: all 0.3s ease;
			min-width: 120rpx;
			margin-bottom: 0;

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

				.delete-btn {
					position: absolute;
					top: 8rpx;
					right: 8rpx;
					width: 32rpx;
					height: 32rpx;
					background-color: rgba(0, 0, 0, 0.5);
					border-radius: 16rpx;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}

			.add-image-btn {
				width: 160rpx;
				height: 160rpx;
				border: 2rpx dashed #ccc;
				border-radius: 12rpx;
				display: flex;
				align-items: center;
				justify-content: center;
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

				.delete-btn {
					position: absolute;
					top: 8rpx;
					right: 8rpx;
					width: 32rpx;
					height: 32rpx;
					background-color: rgba(0, 0, 0, 0.5);
					border-radius: 16rpx;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}

			.add-video-btn {
				width: 320rpx;
				height: 180rpx;
				border: 2rpx dashed #ccc;
				border-radius: 12rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}

	.document-list {
		.document-item {
			display: flex;
			align-items: center;
			padding: 24rpx 0;
			border-bottom: 1rpx solid #f0f0f0;

			&:last-child {
				border-bottom: none;
			}

			.doc-icon {
				margin-right: 24rpx;
			}

			.doc-info {
				flex: 1;

				.doc-name {
					display: block;
					font-size: 28rpx;
					color: #333;
					margin-bottom: 8rpx;
				}

				.doc-status {
					font-size: 24rpx;

					&.required {
						color: #ff4757;
					}
				}
			}
		}
	}

	.bottom-section {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #fff;
		padding: 32rpx;
		border-top: 1rpx solid #e8e8e8;
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

	.doc-upload-btn {
		display: flex;
		align-items: center;
		gap: 0rpx;
	}
</style>