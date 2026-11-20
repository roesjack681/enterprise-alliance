<template>
	<view class="container">


		<!-- 页面内容 -->
		<view class="content">
			<!-- 主图上传区域 -->
			<view class="main-upload-area">
				<view class="upload-main">
					<image v-if="mainImage" :src="mainImage" class="main-image" @tap="uploadMainImage" />
					<view v-else class="upload-placeholder" @tap="uploadMainImage">
						<u-icon name="camera" color="#ccc" size="60"></u-icon>
						<text class="upload-text">点击上传主图</text>
					</view>
				</view>

				<!-- 附图上传 -->
				<view class="sub-images">
					<view v-for="(item, index) in subImages" :key="index" class="sub-image-item"
						@tap="uploadSubImage(index)">
						<image v-if="item" :src="item" class="sub-image" />
						<view v-else class="sub-placeholder">
							<u-icon name="plus" color="#ccc" size="40"></u-icon>
						</view>
					</view>
				</view>
			</view>

			<!-- 表单区域 -->
			<view class="form-section">
				<!-- 产品名称 -->
				<view class="form-item">
					<view class="label required">产品名称</view>
					<u-input v-model="form.name" border="none" placeholder="请输入产品名称" :clearable="false"
						input-align="right" />
				</view>
				<!-- 产品特点 -->
				<view class="form-item">
					<view class="label required margin-right-sm">产品特点</view>
					<u-input v-model="form.features" border="none" placeholder="请输入产品特点（可选）" input-align="right" />
				</view>

				<!-- 所属分类 -->
				<view class="form-item">
					<view class="label required">分类<span @click="openCategoryManage"
							class="margin-left-sm text-blue">(管理)</span></view>
					<view class="select-area" @click="showCategoryPicker = true">
						<text class="select-text">{{ selectedCategoryName || '请选择分类' }}</text>
						<u-icon name="arrow-right" color="#ccc" size="28"></u-icon>
					</view>
				</view>
				<u-picker :show="showCategoryPicker" :columns="[categoryList]" keyName="name"
					@confirm="onCategoryConfirm" @cancel="showCategoryPicker = false" title="选择分类" />

				<!-- 价格输入框 -->
				<view class="form-item">
					<view class="label required">价格(¥)</view>
					<u-input v-model="form.price" placeholder="请输入产品价格" border="none" :clearable="false"
						input-align="right" type="digit" />
				</view>
			</view>



			<!-- 底部按钮 -->
			<view class="bottom-actions">
				<u-button :custom-style="{
					backgroundColor: '#fff',
					borderColor: '#3D6AFF',
					color: '#3D6AFF',
					borderRadius: '12rpx',
					height: '88rpx',
					fontSize: '32rpx'
				}" :hair-line="false" @tap="saveDraft">
					保存草稿
				</u-button>

				<u-button :custom-style="{
					backgroundColor: '#3D6AFF',
					borderColor: '#3D6AFF',
					color: '#fff',
					borderRadius: '12rpx',
					height: '88rpx',
					fontSize: '32rpx'
				}" :hair-line="false" @tap="publish">
					立即发布
				</u-button>
			</view>

		</view>
		<!-- 产品描述 -->
		<view class="desc-input">
			<jinEdit :html="form.description" placeholder="请输入产品详细描述..." height="80vh" @editOk="editOk" />
		</view>

		<!-- 分类管理弹窗 -->
		<u-popup :show="showCategoryManage" mode="bottom" border-radius="20" height="60%">
			<view class="category-manage-panel">
				<view class="category-header">
					<text class="category-title">分类管理</text>
					<u-icon name="close" @tap="showCategoryManage = false" size="32"></u-icon>
				</view>

				<view class="category-list">
					<view v-for="item in categoryList" :key="item.id" class="category-item">
						<text class="category-name">{{ item.name }}</text>
						<view class="category-actions">
							<u-icon name="edit-pen" @tap="editCategory(item)" size="38" color="#3AFF"></u-icon>
							<u-icon name="trash" @tap="deleteCategory(item)" size="38" color="#ff4757"></u-icon>
						</view>
					</view>
					<view v-if="categoryList.length === 0" class="empty-category">
						<text>暂无分类，请添加</text>
					</view>
				</view>

				<view class="add-category">
					<u-input v-model="newCategoryName" placeholder="请输入分类名称" border="none" :clearable="true" />
					<view class="add-actions">
						<u-button v-if="editingCategory" :custom-style="{
							backgroundColor: '#fff',
							borderColor: '#ccc',
							color: '#666',
							borderRadius: '8rpx',
							height: '64rpx',
							fontSize: '28rpx'
						}" @tap="cancelEdit">
							取消
						</u-button>
						<u-button type="primary" :custom-style="{
							backgroundColor: '#3D6AFF',
							borderColor: '#3D6AFF',
							color: '#fff',
							borderRadius: '8rpx',
							height: '64rpx',
							fontSize: '28rpx'
						}" @tap="editingCategory ? saveEditCategory() : addCategory()">
							{{ editingCategory ? '保存' : '添加' }}
						</u-button>
					</view>
				</view>
			</view>
		</u-popup> 

		<!-- 底部安全区域 -->
		<view class="s afe-area-bottom"></view>
	</view>
</template>

<script>
import jinEdit from '@/components/jin-edit/jin-edit.vue';
import { getHomePageCategory, createProduct, updateProduct, getProductDetail, createCategory, updateCategory, deleteCategory } from '@/utils/api.js';
import { uploadFileInChunks } from '@/utils/upload.js';
export default {
	name: 'AddProduct',
	components: {
		jinEdit
	},
	data() {
		return {
			mainImage: '',
			subImages: ['', '', ''],
			form: {
				name: '',
				features: '',
				category_id: '',
				price: '',
				description: ''
			},
			categoryList: [],
			selectedCategoryName: '',
			showCategoryPicker: false,
			showCategoryManage: false,
			newCategoryName: '',
			editingCategory: null, // 编辑中的分类对象
			isEdit: false,
			productId: null
		}
	},
	async created() {
		await this.loadCategoryList();
		// 判断是否为编辑模式
		const query = this.$route && this.$route.query ? this.$route.query : (this.$mp && this.$mp.query ? this.$mp.query : {});
		if (query.id) {
			this.isEdit = true;
			this.productId = query.id;
			this.loadProductDetail(query.id);
		}
	},

	methods: {
		goBack() {
			uni.navigateBack()
		},
		editOk(res) {
			if (res.isPublic) {
				this.form.description = res.html;
				this.publish();
			} else {
				this.form.description = res.html;
			}
		},

		uploadMainImage() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					const file = res.tempFiles ? res.tempFiles[0] : { path: res.tempFilePaths[0] };
					uploadFileInChunks(file, {
						onProgress: (percent) => {
							uni.showLoading({ title: `上传中 ${percent}%` })
						}
					}).then(res => {
						uni.hideLoading();
						this.mainImage = res.filePath;
					}).catch(err => {
						uni.hideLoading();
						uni.showToast({ title: '上传失败', icon: 'none' });
					});
				}
			})
		},

		uploadSubImage(index) {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					const file = res.tempFiles ? res.tempFiles[0] : { path: res.tempFilePaths[0] };
					uploadFileInChunks(file, {
						onProgress: (percent) => {
							uni.showLoading({ title: `上传中 ${percent}%` })
						}
					}).then(res => {
						uni.hideLoading();
						this.$set(this.subImages, index, res.filePath);
					}).catch(err => {
						uni.hideLoading();
						uni.showToast({ title: '上传失败', icon: 'none' });
					});
				}
			})
		}, 
		toggleMaterial(tag) {
			const index = this.selectedMaterials.indexOf(tag)
			if (index > -1) {
				this.selectedMaterials.splice(index, 1)
			} else {
				this.selectedMaterials.push(tag)
			}
		},

		addSpecification() {
			// 添加规格
			console.log('添加规格')
		},

		saveDraft() {
			// 保存草稿逻辑（可选实现）
			uni.$u.toast('草稿功能待实现');
		},

		async publish() {
			// 发布产品，调用createServiceProduct
			if (!this.form.name.trim()) {
				return uni.$u.toast('请输入产品名称');
			}
			if (!this.form.category_id) {
				return uni.$u.toast('请选择分类');
			}
			if (!this.form.price) {
				return uni.$u.toast('请输入产品价格');
			}
			// 组装 image_urls
			const image_urls = []; 
			image_urls.push(...this.subImages.filter(Boolean));
			const payload = {
				name: this.form.name,
				description: this.form.description,
				category_id: this.form.category_id,
				price: this.form.price,
				image_urls: JSON.stringify(image_urls),
				features: this.form.features,
				thumb: this.mainImage
			};
			try {
				let res;
				if (this.isEdit && this.productId) {
					res = await updateProduct({ id: this.productId, ...payload });
				} else {
					res = await createProduct(payload);
				}
				if (res && res.code ===0) {
					uni.$u.toast(this.isEdit ? '修改成功' : '发布成功');
					setTimeout(() => {
						this.goBack();
					}, 1000);
				} else {
					uni.$u.toast(res?.msg || (this.isEdit ? '修改失败,检查未填内容' : '发布失败，检查未填内容'));
				}
			} catch (error) {
				console.error((this.isEdit ? '修改' : '发布') + '产品失败:', error);
				uni.$u.toast(this.isEdit ? '修改失败' : '发布失败');
			}
		},

		async loadProductDetail(id) {
			try {
				const res = await getProductDetail({ id });
				if (res && res.code === 0 && res.data) {
					const data = res.data;
					this.form.name = data.name || '';
					this.form.features = data.features || '';
					this.form.category_id = data.category_id || '';
					this.form.price = data.price || '';
					this.form.description = data.description || '';
					this.mainImage = data.thumb;
					// 剩余图片为subImages
					let subImgs = JSON.parse(data.image_urls);
					 
					this.subImages = ['', '', ''];
					subImgs.forEach((img, idx) => {
						if (idx < 3) this.subImages[idx] = img;
					});
					// 分类名回显
					const cat = this.categoryList.find(c => c.id === data.category_id);
					this.selectedCategoryName = cat ? cat.name : '';
				}
			} catch (error) {
				console.error('加载产品详情失败:', error);
			}
		},

		onDescEdit(res) {
			this.form.description = res.html;
		},

		// 加载分类列表
		async loadCategoryList() {
			try {
				const res = await getHomePageCategory({});
				if (res && res.code === 0) {
					// 兼容原有结构，categoryList为一维数组
					this.categoryList = (res.data || []).map(item => ({ id: item.id, name: item.name }));
				}
			} catch (error) {
				console.error('加载分类列表失败:', error);
			}
		},

		// 分类选择确认
		onCategoryConfirm(e) {
			const category = e.value[0];
			this.form.category_id = category.id;
			this.selectedCategoryName = category.name;
			this.showCategoryPicker = false;
		},

		// 打开分类管理
		openCategoryManage() {
			this.showCategoryManage = true;
			this.newCategoryName = '';
			this.editingCategory = null;
			this.loadCategoryList();
		},

		// 添加新分类（后端联动）
		async addCategory() {
			if (!this.newCategoryName.trim()) {
				return uni.$u.toast('请输入分类名称');
			}
			try {
				const res = await createCategory({ name: this.newCategoryName.trim(), type: 'product' });
				if (res && res.code === 0) {
					uni.$u.toast('添加成功');
					this.newCategoryName = '';
					//this.showCategoryManage = false;
					await this.loadCategoryList();
				} else {
					uni.$u.toast(res?.msg || '添加失败');
				}
			} catch (error) {
				console.error('添加分类失败:', error);
				uni.$u.toast('添加失败');
			}
		},

		// 编辑分类（后端联动）
		editCategory(category) {
			this.editingCategory = { ...category };
			this.newCategoryName = category.name;
		},

		// 取消编辑
		cancelEdit() {
			this.editingCategory = null;
			this.newCategoryName = '';
		},

		// 保存编辑（后端联动）
		async saveEditCategory() {
			if (!this.editingCategory || !this.newCategoryName.trim()) {
				return uni.$u.toast('请输入分类名称');
			}
			try {
				const res = await updateCategory({ id: this.editingCategory.id, name: this.newCategoryName.trim() });
				if (res && res.code === 0) {
					uni.$u.toast('修改成功');
					this.editingCategory = null;
					this.newCategoryName = '';
					//this.showCategoryManage = false;
					await this.loadCategoryList();
				} else {
					uni.$u.toast(res?.msg || '修改失败');
				}
			} catch (error) {
				console.error('修改分类失败:', error);
				uni.$u.toast('修改失败');
			}
		},

		// 删除分类（后端联动）
		async deleteCategory(category) {
			uni.showModal({
				title: '提示',
				content: `确定删除分类${category.name}？`,
				success: async (res) => {
					if (res.confirm) {
						try {
							const r = await deleteCategory({ id: category.id });
							if (r && r.code === 0) {
								uni.$u.toast('删除成功');
								await this.loadCategoryList();
								// 如果删除的是当前选中的分类，清空选择
								if (this.form.category_id === category.id) {
									this.form.category_id = '';
									this.selectedCategoryName = '';
								}
							} else {
								uni.$u.toast(r?.msg || '删除失败');
							}
						} catch (error) {
							console.error('删除分类失败:', error);
							uni.$u.toast('删除失败');
						}
					}
				}
			});
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	background-color: #f5f5f5;
	min-height: 100vh;
}

.content {
	padding: 8rpx 32rpx;
}

/* 主图上传区域 */
.main-upload-area {
	background: #fff;
	border-radius: 16rpx;
	margin-top: 20rpx;
	padding: 40rpx;

	.upload-main {
		display: flex;
		justify-content: center;
		margin-bottom: 40rpx;

		.main-image {
			width: 200rpx;
			height: 200rpx;
			border-radius: 12rpx;
		}

		.upload-placeholder {
			width: 200rpx;
			height: 200rpx;
			border: 2rpx dashed #ddd;
			border-radius: 12rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;

			.upload-text {
				color: #999;
				font-size: 28rpx;
				margin-top: 20rpx;
			}
		}
	}

	.sub-images {
		display: flex;
		justify-content: center;
		gap: 20rpx;

		.sub-image-item {
			width: 120rpx;
			height: 120rpx;

			.sub-image {
				width: 100%;
				height: 100%;
				border-radius: 8rpx;
			}

			.sub-placeholder {
				width: 100%;
				height: 100%;
				border: 2rpx dashed #ddd;
				border-radius: 8rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background: #fafafa;
			}
		}
	}
}

/* 表单区域 */
.form-section {
	background: #fff;
	border-radius: 16rpx;
	margin-top: 20rpx;

	.form-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx;
		border-bottom: 1rpx solid #f5f5f5;

		&:last-child {
			border-bottom: none;
		}

		.label {
			font-size: 32rpx;
			color: #333;

			&.required::before {
				content: '*';
				color: #ff4757;
				margin-right: 8rpx;
			}
		}

		.select-area {
			display: flex;
			align-items: center;
			gap: 16rpx;

			.select-text {
				font-size: 32rpx;
				color: #999;
			}
		}
	}

	.material-tags {
		display: flex;
		gap: 16rpx;
		padding: 0 32rpx 32rpx;

		.material-tag {
			padding: 12rpx 24rpx;
			border-radius: 32rpx;
			background: #f5f5f5;
			font-size: 28rpx;
			color: #666;

			&.active {
				background: #3D6AFF;
				color: #fff;
			}
		}
	}
}

/* 价格输入框 */
.form-item {
	background: #fff;
	border-radius: 16rpx;
	margin-top: 20rpx;
	padding: 32rpx;
	border-bottom: 1rpx solid #f5f5f5;

	.label {
		font-size: 32rpx;
		color: #333;

		&.required::before {
			content: '*';
			color: #ff4757;
			margin-right: 8rpx;
		}
	}

	.select-area {
		display: flex;
		align-items: center;
		gap: 16rpx;

		.select-text {
			font-size: 32rpx;
			color: #999;
		}
	}
}

/* 产品描述 */
.desc-input {
	background: #fff;
	border-radius: 16rpx;

	.container {
		background: #fff;
	}

}

/* 底部按钮 */
.bottom-actions {
	display: flex;
	gap: 24rpx;
	padding: 40rpx 32rpx;
	margin-top: 40rpx;
}

.safe-area-bottom {
	height: env(safe-area-inset-bottom);
}

/* 分类管理面板 */
.category-manage-panel {
	padding: 32rpx;
	height: 100%;
	display: flex;
	flex-direction: column;

	.category-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 32rpx;
		border-bottom: 1rpx solid #f5f5f5;
		margin-bottom: 32rpx;
	}

	.category-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	.category-list {
		flex: 1;
		overflow-y: auto;
	}

	.category-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f5f5f5;
	}

	.category-name {
		font-size: 32rpx;
		color: #333;
	}

	.category-actions {
		display: flex;
		gap: 24rpx;
	}

	.empty-category {
		text-align: center;
		padding: 80rpx 0;
		color: #999;
		font-size: 28rpx;
	}

	.add-category {
		margin-top: 32rpx;
		padding-top: 32rpx;
		border-top: 1rpx solid #f5f5f5;
	}

	.add-actions {
		display: flex;
		gap: 16rpx;
		margin-top: 24rpx;
	}
}

/* 深度选择器 */
::v-deep .u-input__content {
	.u-input__content__field-wrapper {
		.u-input__content__field-wrapper__field {
			text-align: right;
		}
	}
}

::v-deep .u-button {
	flex: 1;
}
</style>