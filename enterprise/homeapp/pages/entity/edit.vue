<template>
  <view class="page">
    
    <scroll-view scroll-y class="scroll-content">
      <!-- 企业Logo卡片 -->
      <view class="card-container">
        <view class="card-title">企业Logo</view>
        <view class="card-content">
          <view class="logo-upload" @click="uploadLogo">
            <view class="logo-container">
              <image v-if="form.logo" :src="form.logo" class="logo-image"></image>
              <view v-else class="upload-placeholder">
                <image src="/static/icon/upload.png" class="upload-icon"></image>
                <view class="upload-text">点击上传</view>
              </view>
            </view>
          </view>
          <view class="upload-tip">支持JPG、PNG格式，建议尺寸200*200px</view>
        </view>
      </view>

      <!-- 基本信息卡片 -->
      <view class="card-container">
        <view class="card-title">*基本信息</view>
        <view class="card-content">
          <!-- 企业名称 -->
          <view class="form-item">
            <view class="form-label">企业名称</view>
            <u-input 
              v-model="form.name" 
              placeholder="请输入企业名称"
              readonly 
              :clearable="true"
              height="88"
              :customStyle="{ backgroundColor: '#f8f9fa', borderRadius: '12rpx' }"
            ></u-input>
          </view>

          <!-- 企业标签 -->
          <view class="form-item">
            <view class="form-label">*企业标签</view>
            <view class="tags-container">
              <view 
                v-for="(tag, index) in selectedTags" 
                :key="index" 
                class="tag-item selected"
                @click="removeTag(index)"
              >
                {{ tag.name }}
                <u-icon name="close" size="24" color="#3D6AFF" style="margin-left: 8rpx;"></u-icon>
              </view>
              <view class="tag-item add-tag" @click="showTagPicker = true">
                <text>+ 添加标签</text>
              </view>
            </view>
            <view class="tag-tip">选择合适的标签，让客户更直观找到您</view>
          </view>
        </view>
      </view>

      <!-- 联系信息卡片 -->
      <view class="card-container">
        <view class="card-title">*联系信息</view>
        <view class="card-content">
          <!-- 地址 -->
          <view class="form-item">
            <view class="form-label">地址</view>
            <u-input 
              v-model="form.address" 
              placeholder="请输入详细地址"
             
              :clearable="true"
              height="88"
              :customStyle="{ backgroundColor: '#f8f9fa', borderRadius: '12rpx' }"
            ></u-input>
          </view>
          
          <!-- 联系电话 -->
          <view class="form-item">
            <view class="form-label">联系电话</view>
            <u-input 
              v-model="form.company_present_mobile" 
              placeholder="请输入联系电话"             
              :clearable="true"
              height="88"
              type="number"
              :customStyle="{ backgroundColor: '#f8f9fa', borderRadius: '12rpx' }"
            ></u-input>
          </view>
        </view>
      </view>

      <!-- 企业相册卡片 -->
      <view class="card-container">
        <view class="card-title">*企业相册</view>
        <view class="card-content">
          <view class="photo-grid">
            <view 
              v-for="(photo, index) in photos" 
              :key="index"
              class="photo-item"
              @click="previewPhoto(index)"
            >
              <image :src="photo" class="photo-image"></image>
              <view class="photo-delete" @click.stop="deletePhoto(index)">
                <u-icon name="close" size="24" color="#fff"></u-icon>
              </view>
            </view>
            <view v-if="photos.length < 6" class="photo-item add-photo" @click="addPhoto">
              <image src="/static/icon/upload.png" class="add-photo-icon"></image>
              <view class="add-photo-text">添加照片</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 企业介绍卡片 -->
      <view class="card-container">
        <view class="card-title">*企业介绍</view>
        <view class="card-content">
          <view class="form-item"> 
            <u--textarea 
              v-model="form.descp" 
              height="280" 
              maxlength="500" 
              :custom-style="textareaStyle" 
              placeholder="请输入企业简介,500字内。" 
              type="textarea"
            ></u--textarea>
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="bottom-buttons">
        <u-button 
          class="cancel-btn" 
          :hairline="true"
          :plain="true"
          @click="handleCancel"
        >
          取消
        </u-button>
        <u-button 
          class="save-btn" 
          type="primary"
          @click="handleSave"
        >
          保存
        </u-button>
      </view>

       <!-- 标签选择组件 -->
	  <TagSelect 
		v-model="showTagPicker"
		:selectedTagList="selectedTags"
		:categories="tagCategories"
		:maxSelect="maxTagCount"
		@confirm="handleTagConfirm"
	  />
    </scroll-view> 
  </view>
</template>

<script>
import {updateEntity} from "@/utils/api.js"
import TagSelect from '@/components/TagSelect.vue'
import {uploadFileInChunks } from '@/utils/upload.js'	
export default {
 components: {
	TagSelect
  },
  name: 'CompanyProfileEdit',
  data() {
    return {      
      form: {
		logo: '', 
		name: '',
		tags: [],
		address: '',
		company_present_mobile: '',
		team_photos: [],
        descp: ''
      },
	  photos:[],
	  uploadedPhotoPaths:[],
	  selectedTags:[],
      textareaStyle: {
        backgroundColor: '#f8f9fa',
        borderRadius: '12rpx',
        padding: '24rpx',
        fontSize: '28rpx',
        lineHeight: '1.6'
      },
      showTagPicker: false,
      maxTagCount:10,
	  tagCategories: []
    }
  },
  onLoad() {
  	const userInfo = uni.getStorageSync('$userinfo')
    if(userInfo && userInfo.entityInfo){
      const data= userInfo.entityInfo     
      this.form.logo=data.logo
      this.form.name=data.name
      this.form.address=data.address
      this.form.company_present_mobile=data.company_present_mobile	
      this.form.descp=data.descp
      this.form.tags=userInfo.tags
      this.form.team_photos=data.team_photos||'' 
      this.selectedTags=this.form.tags		
      this.photos=this.form.team_photos.split(',') 
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
	 // 处理标签选择确认
	handleTagConfirm(tags) {
	  this.selectedTags = [...tags];
	  //console.log('选择的标签：', this.selectedTags);
	  
	  // 这里可以调用API保存标签到后台
	  // this.saveTagsToServer(this.selectedTags);
	},
    uploadLogo() { 
	  const that = this
	  uni.chooseImage({
	  	count: 1,
	  	sizeType: ['compressed'],
	  	sourceType: ['album', 'camera'],
	  	success: function(res) {
	  		const tempFilePaths = res.tempFilePaths
	  		that.form.logo = tempFilePaths[0]
	  		const file = res.tempFiles[0] 
	  		uploadFileInChunks(file, {
	  		  onProgress: (percent) => {
	  		   // console.log(`上传进度：${percent}%`);
	  		  // uni.showLoading({ title: `上传中 ${percent}%` })
	  		  }
	  		}).then(res => {
	  			console.log('上传完成:', res);
	  			uni.hideLoading()
	  			that.form.logo=res.filePath 
	  		}).catch(err => {
	  		  console.error('上传失败:', err);
	  		});
	  	}
	  }) 
    },
	 
    removeTag(index) {
      this.selectedTags.splice(index, 1)
    },
    
    addPhoto() {
     const that = this
	  uni.chooseImage({
	    count:6 - this.photos.length, // 可选最多选择数量
	    sizeType: ['compressed'],
	    sourceType: ['album', 'camera'],
	    success: function (res) {
	      const tempFilePaths = res.tempFilePaths
	      const tempFiles = res.tempFiles
	      that.photos.push(...tempFilePaths) // 将路径加入数组
	  
	      tempFiles.forEach((file, index) => {
	        uploadFileInChunks(file, {
	          onProgress: (percent) => {
	            // console.log(`图片${index + 1} 上传进度：${percent}%`);
	            // uni.showLoading({ title: `上传中 ${percent}%` });
	          }
	        }).then(res => {
	          console.log(`图片${index + 1} 上传完成:`, res)
	          // 你可以将 res.filePath 保存到其它字段中，比如上传完成后的远程路径数组
	           that.uploadedPhotoPaths.push(res.filePath)
	          uni.hideLoading()
	        }).catch(err => {
	          console.error(`图片${index + 1} 上传失败:`, err)
	        })
	      })
	    }
	  })

    },
    previewPhoto(index) {
      uni.previewImage({
        urls: this.photos,
        current: index
      })
    },
    deletePhoto(index) {
      this.photos.splice(index, 1)
    },
    handleCancel() {
      uni.showModal({
        title: '提示',
        content: '确定要取消编辑吗？',
        success: (res) => {
          if (res.confirm) {
            uni.navigateBack()
          }
        }
      })
    },
    handleSave() {
		this.form.team_photos= this.uploadedPhotoPaths.join(',')||this.photos.join(',')
		//const tags = this.selectedTags.map(item => item.name).join(',');
		this.form.tags=JSON.stringify(this.selectedTags)
		updateEntity(this.form).then(res=>{
			if(res.code==0){
				this.$store.dispatch('getuserinfo');
			}
			// 保存逻辑
			uni.showToast({
			  title: '保存成功',
			  icon: 'success'
			})
			setTimeout(() => {
			  uni.navigateBack()
			}, 1500)
		})
		
     
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  background-color: #f5f5f5;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nav-left {
  padding: 0 32rpx;
}

.nav-right {
  padding: 0 32rpx;
}

.save-text {
  color: #3D6AFF;
  font-size: 28rpx;
  font-weight: 500;
}

.scroll-content {
  flex: 1;
  padding:20rpx;
}

// 卡片容器
.card-container {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  padding: 32rpx 32rpx 0;
  margin-bottom: 24rpx;
}

.card-content {
  padding: 0 32rpx 32rpx;
}

// Logo上传
.logo-upload {
  display: flex;
  justify-content: center;
  margin-bottom: 24rpx;
}

.logo-container {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}

.logo-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 12rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #999;
  text-align: center;
  line-height: 1.4;
}

.upload-tip {
  text-align: center;
  font-size: 24rpx;
  color: #999;
}

// 表单项
.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

// 标签
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

// 相册网格
.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.photo-item {
  aspect-ratio: 1;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;
  background-color: #f8f9fa;
  
  &.add-photo {
    border: 2rpx dashed #ddd;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-delete {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-photo-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 8rpx;
}

.add-photo-text {
  font-size: 24rpx;
  color: #999;
}

// 底部按钮
.bottom-buttons {
  display: flex;
  gap: 32rpx;
  margin: 48rpx 0;
}

.cancel-btn {
  flex: 1;
  height: 88rpx;
  border-color: #ddd;
  color: #666;
}

.save-btn {
  flex: 2;
  height: 88rpx;
  background-color: #3D6AFF;
}

.bottom-safe {
  height: calc(env(safe-area-inset-bottom) + 32rpx);
}

// 标签选择弹窗
.tag-picker {
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
  max-height: 80vh;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 2rpx solid #eee;
}

.picker-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.picker-content {
  padding: 32rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.picker-tag {
  padding: 16rpx 32rpx;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #666;
  
  &.selected {
    background-color: #3D6AFF;
    color: #fff;
  }
}

// uView组件样式覆盖
::v-deep .u-input__content {
  background-color: transparent;
}

::v-deep .u-navbar {
  border-bottom: 2rpx solid #eee;
}

::v-deep .u-button {
  border-radius: 12rpx;
  font-weight: 500;
}
</style>