<template>
  <view class="container">
    <!-- 卡片化内容区 -->
    <view class="content">
      <!-- 封面上传区域 -->
      <view class="main-upload-area">
        <view class="upload-main">
          <image v-if="form.cover_image" :src="form.cover_image" class="main-image" @tap="chooseImage" />
          <view v-else class="upload-placeholder" @tap="chooseImage">
            <u-icon name="camera" color="#ccc" size="60"></u-icon>
            <text class="upload-text">点击上传封面图</text>
          </view>
        </view>
      </view>
      <!-- 表单区域 -->
      <view class="form-section">
        <view class="form-item">
          <view class="label required">案例标题</view>
          <u-input v-model="form.title" border="none" placeholder="请输入案例标题" :clearable="false" input-align="right" />
        </view>
        <view class="form-item">
          <view class="label required">分类<span @click="openCategoryManage" class="margin-left-sm text-blue">(管理)</span></view>
          <view class="select-area" @click="showCategoryPicker = true">
            <text class="select-text">{{ selectedCategoryName || '请选择分类' }}</text>
            <u-icon name="arrow-right" color="#ccc" size="28"></u-icon>
          </view>
        </view>
        <u-picker :show="showCategoryPicker" :columns="[categoryList]" keyName="name" @confirm="onCategoryConfirm" @cancel="showCategoryPicker = false" title="选择分类" />
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
        <!-- <view class="form-item">
          <view class="label">视频链接</view>
          <u-input v-model="form.video_url" border="none" placeholder="请输入视频链接（可选）" input-align="right" />
        </view>
        <view class="form-item">
          <view class="label">图片链接</view>
          <u-input v-model="form.image_urls" border="none" placeholder="请输入图片链接，多个用逗号分隔" input-align="right" />
        </view> -->
        <view class="form-item">
          <view class="label">简述</view>
          <u-input v-model="form.description" border="none" placeholder="请输入案例简述" input-align="right" />
        </view>
        <view class="form-item">
          <view class="label">是否推荐</view>
          <switch class="blue" :checked="form.is_featured" @change="e => form.is_featured = e.detail.value"></switch>
        </view>
        <view class="form-item">
          <view class="label">是否发布</view>
          <switch class="blue" :checked="form.is_published" @change="e => form.is_published = e.detail.value"></switch>
        </view>
      </view>
      <!-- 底部按钮 -->
      <view class="bottom-actions">
        <u-button :custom-style="{
          backgroundColor: '#3D6AFF',
          borderColor: '#3D6AFF',
          color: '#fff',
          borderRadius: '12rpx',
          height: '88rpx',
          fontSize: '32rpx'
        }" :hair-line="false" @tap="submitForm">
          {{id ? '保存内容' : '立即添加'}}
        </u-button>
      </view>
     
    </view>
	
	<view class="desc-input">
		<jinEdit :html="form.content" placeholder="请输入案例详细内容..." height="80vh" @editOk="editOk" />
	</view>
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script>
import jinEdit from '@/components/jin-edit/jin-edit.vue';
import { uploadFileInChunks } from '@/utils/upload.js';
import { createCase, updateCase, getCase, getHomePageCategory, createCategory, updateCategory, deleteCategory } from '@/utils/api.js';
export default {
  data() {
    return {
      userInfo: {},
      company: {},
      id: '',
      categoryList: [],
      selectedCategoryName: '',
      showCategoryPicker: false,
      showCategoryManage: false,
      newCategoryName: '',
      editingCategory: null,
      form: {
        title: '',
        category_id: '',
        cover_image: '',
        description: '',
        content: '',
        image_urls: '',
        video_url: '',
        is_featured: false,
        is_published: false
      }
    }
  },
  components: { jinEdit },
  async onLoad(options) {
    this.userInfo = uni.getStorageSync('userInfo')
    this.company = uni.getStorageSync('currCompany')
	await this.loadCategoryList();
    if (options.id) {
      this.id = options.id;
      await this.getDetail();
    }
   
  },
  methods: {
    async loadCategoryList() {
      const res = await getHomePageCategory({ type: 'case' });
      if (res && res.code === 0) {
        this.categoryList = (res.data || []).map(item => ({ id: item.id, name: item.name }));
      }
    },
    onCategoryConfirm(e) {
      const category = e.value[0];
      this.form.category_id = category.id;
      this.selectedCategoryName = category.name;
      this.showCategoryPicker = false;
    },
    openCategoryManage() {
      this.showCategoryManage = true;
      this.newCategoryName = '';
      this.editingCategory = null;
      this.loadCategoryList();
    },
    async addCategory() {
      if (!this.newCategoryName.trim()) {
        return uni.$u.toast('请输入分类名称');
      }
      try {
        const res = await createCategory({ name: this.newCategoryName.trim(), type: 'case' });
        if (res && res.code === 0) {
          uni.$u.toast('添加成功');
          this.newCategoryName = '';
          await this.loadCategoryList();
        } else {
          uni.$u.toast(res?.msg || '添加失败');
        }
      } catch (error) {
        console.error('添加分类失败:', error);
        uni.$u.toast('添加失败');
      }
    },
    editCategory(category) {
      this.editingCategory = { ...category };
      this.newCategoryName = category.name;
    },
    cancelEdit() {
      this.editingCategory = null;
      this.newCategoryName = '';
    },
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
          await this.loadCategoryList();
        } else {
          uni.$u.toast(res?.msg || '修改失败');
        }
      } catch (error) {
        console.error('修改分类失败:', error);
        uni.$u.toast('修改失败');
      }
    },
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
    },
   
	async uploadCoverImage() {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const file = res.tempFiles ? res.tempFiles[0] : { path: res.tempFilePaths[0] };
        try {
          uni.showLoading({ title: '上传中' });
          const uploadRes = await uploadFileInChunks(file, {
            onProgress: (percent) => {
              uni.showLoading({ title: `上传中 ${percent}%` })
            }
          });
          uni.hideLoading();
          if (uploadRes && uploadRes.filePath) {
            this.form.cover_image = uploadRes.filePath;
          } else {
            uni.showToast({ title: '上传失败', icon: 'none' });
          }
        } catch (err) {
          uni.hideLoading();
          uni.showToast({ title: '上传失败', icon: 'none' });
        }
      }
    })
  },
  chooseImage() {
    this.uploadCoverImage();
  },
    editOk(res) {
      this.form.content = res.html;
    },
    async submitForm() {
      if (!this.form.title) return this.$util.msg('请输入标题');
      if (!this.form.category_id) return this.$util.msg('请选择分类');
      if (!this.form.cover_image) return this.$util.msg('请上传封面图');
      if (!this.form.description) return this.$util.msg('请输入案例简述');
      if (!this.form.content) return this.$util.msg('请输入案例详细内容');
      const data = { ...this.form };
      if (this.id) data.id = +this.id;
      let res;
      if (this.id) res = await updateCase(data);
      else res = await createCase(data);
	  if (res && res.code ===0) {
			uni.$u.toast('保存成功');
			setTimeout(() => {
				uni.navigateBack();
			}, 1000);
	  } else {
			uni.$u.toast(res?.msg || '保存失败，检查未填内容');
		}
    },
    async getDetail() {
      const res = await getCase({ id: +this.id });
      if (res && res.code === 0 && res.data) {
        const data = res.data;
        this.form = {
          title: data.title,
          category_id: data.category_id,
          cover_image: data.cover_image,
          description: data.description,
          content: data.content,
          image_urls: data.image_urls,
          video_url: data.video_url,
          is_featured: data.is_featured == 1 ? true : false,
          is_published: data.is_published == 1 ? true : false
        };
		// 分类名回显
		const cat = this.categoryList.find(c => c.id === data.category_id);
		this.selectedCategoryName = cat ? cat.name : '';
        
      }
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
      width:100%;
      height: 400rpx;
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
}
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
}
/* 产品描述 */
.desc-input {
	background: #fff;
	border-radius: 16rpx;

	.container {
		background: #fff;
	}

}
/* 移除 .desc-input 卡片化样式 */
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
</style>