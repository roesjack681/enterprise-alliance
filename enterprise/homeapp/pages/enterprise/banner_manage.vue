<template>
  <view class="carousel-edit-page">
    <!-- 页面标题 -->
    <view class="page-title">轮播图编辑</view>
    
    <!-- 轮播图列表 -->
    <view class="carousel-list">
      <view 
        class="carousel-item" 
        v-for="(item, index) in carouselList" 
        :key="index"
      >
        <!-- 图片上传区域 -->
        <view class="image-upload-area">
          <view class="delete-btn" @click="deleteCarousel(index)">
            <u-icon name="close" color="#666" size="24"></u-icon>
          </view>
          
          <view class="upload-content" @click="chooseImage(index)">
            <image 
              v-if="item.image_url" 
              :src="item.image_url" 
              class="uploaded-image"
              mode="aspectFill"
            ></image>
            <view v-else class="upload-placeholder">
              <image src="/static/icon/upload.png" class="upload-icon"></image>
              <text class="upload-text">点击上传图片</text>
            </view>
          </view>
        </view>
        
        <!-- 轮播标题 -->
        <view class="form-group">
          <text class="form-label">轮播标题</text>
          <input 
            class="form-input" 
            placeholder="请输入标题"
            v-model="item.title"
            type="text"
          />
        </view>
        
        <!-- 跳转链接 -->
        <view class="form-group">
          <text class="form-label">跳转链接</text>
          <input 
            class="form-input" 
            placeholder="请输入链接"
            v-model="item.link_url"
            type="text"
          />
        </view>
      </view>
    </view>
    
    <!-- 添加轮播图按钮 -->
    <view class="add-carousel-btn" @click="addCarousel">
      <text class="add-btn-text">+ 添加轮播图</text>
    </view>
    
    <!-- 保存按钮 -->
    <view class="save-btn-container">
      <button class="save-btn" @click="saveCarousel">保存</button>
    </view>
  </view>
</template>

<script>
import { createBanner, updateBanner, getBanners, deleteBanner } from '@/utils/api.js'
import { uploadFileInChunks } from '@/utils/upload.js'
export default {
  name: 'CarouselEdit',
  data() {
    return {
      carouselList: [
        {
          id: null, // 新增时为null，编辑时有值
          image_url: '',
          title: '',
          link_url: '',
          sort_order: 0,
          is_active: true
        }
      ],
      enterprise_id: null // 需从用户信息或页面参数获取
    }
  },
  created() {
    // 假设 enterprise_id 从本地存储获取
    const userInfo = uni.getStorageSync('$userinfo')
    this.enterprise_id = userInfo?.id || null
    this.loadBanners()
  },
  methods: {
    // 选择图片并上传
    chooseImage(index) {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const file = res.tempFiles[0]
          uploadFileInChunks(file, {
            onProgress: (percent) => {
              uni.showLoading({ title: `上传中 ${percent}%` })
            }
          }).then(res => {
            uni.hideLoading()
            this.carouselList[index].image_url = res.filePath // 赋值 image_url
          }).catch(err => {
            uni.hideLoading()
            uni.showToast({ title: '上传失败', icon: 'none' })
          })
        }
      })
    },
    // 删除轮播图（本地删除，保存后同步到后端）
    deleteCarousel(index) {
      if (this.carouselList.length > 1) {
        deleteBanner({id:this.carouselList[index].id})
        this.carouselList.splice(index, 1)
      } else {
        uni.showToast({
          title: '至少保留一个轮播图',
          icon: 'none'
        })
      }
    },
    // 添加轮播图
    addCarousel() {
      this.carouselList.push({
        id: null,
        image_url: '',
        title: '',
        link_url: '',
        sort_order: 0,
        is_active: true
      })
    },
    // 保存轮播图（批量保存，实际可循环调用 create/update）
    async saveCarousel() {
      // 校验
      for (let i = 0; i < this.carouselList.length; i++) {
        const item = this.carouselList[i]
        if (!item.image_url) {
          uni.showToast({ title: `第${i + 1}个轮播图请上传图片`, icon: 'none' })
          return
        }
        if (!item.title) {
          uni.showToast({ title: `第${i + 1}个轮播图请输入标题`, icon: 'none' })
          return
        }
      }
      uni.showLoading({ title: '保存中...' })
      try {
        for (let i = 0; i < this.carouselList.length; i++) {
          const item = this.carouselList[i]
          const params = {
            enterprise_id: this.enterprise_id,
            title: item.title,
            image_url: item.image_url,
            link_url: item.link_url,
            sort_order: i,
            is_active: item.is_active
          }
          console.log(params)
          if (item.id) {
            await updateBanner({ id: item.id, ...params })
          } else {
            await createBanner(params)
          }
        }
        uni.hideLoading()
        uni.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } catch (e) {
        uni.hideLoading()
        console.log(e)
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    },
    // 加载轮播图列表
    async loadBanners() {
      if (!this.enterprise_id) return
      try {
        const res = await getBanners({ enterprise_id: this.enterprise_id })
        if (res.code==0) {
          this.carouselList = res.data.map(item => ({
            id: item.id,
            image_url: item.image_url,
            title: item.title,
            link_url: item.link_url,
            sort_order: item.sort_order,
            is_active: item.is_active
          }))
        }
      } catch (e) {
        // ignore
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.carousel-edit-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 32rpx 32rpx 200rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 40rpx;
}

.carousel-list {
  .carousel-item {
    background: #fff;
    border-radius: 16rpx;
    padding: 32rpx;
    margin-bottom: 32rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  }
}

.image-upload-area {
  position: relative;
  width: 100%;
  height: 320rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx dashed #e0e0e0;
  margin-bottom: 32rpx;
  overflow: hidden;
  
  .delete-btn {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 48rpx;
    height: 48rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }
  

  
  .upload-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  
  .uploaded-image {
    width: 100%;
    height: 100%;
    border-radius: 12rpx;
  }
  
  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .upload-icon {
    width: 64rpx;
    height: 64rpx;
    margin-bottom: 16rpx;
  }
  
  .upload-text {
    font-size: 28rpx;
    color: #999;
  }
}

.form-group {
  margin-bottom: 32rpx;
  
  .form-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
    font-weight: 500;
  }
  
  .form-input {
    width: 100%;
    height: 88rpx;
    background: #f8f9fa;
    border: 2rpx solid #e0e0e0;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;
    
    &::placeholder {
      color: #999;
    }
    
    &:focus {
      border-color: #3D6AFF;
      background: #fff;
    }
  }
}

.add-carousel-btn {
  background: #fff;
  border-radius: 16rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #3D6AFF;
  margin-bottom: 40rpx;
  
  .add-btn-text {
    font-size: 28rpx;
    color: #3D6AFF;
    font-weight: 500;
  }
}

.save-btn-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 32rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background: #3D6AFF;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
  border: none;
  
  &:active {
    background: #2952CC;
  }
}

::v-deep .uni-input-placeholder {
  color: #999 !important;
}
</style>