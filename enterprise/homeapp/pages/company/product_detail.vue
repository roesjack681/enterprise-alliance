<template>
  <view class="page">
  
    
    <!-- 主要内容 -->
    <scroll-view class="main-content" scroll-y="true" refresher-enabled @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <!-- 产品图片轮播 -->
      <view class="image-gallery">
        <swiper class="gallery-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" indicator-color="rgba(0,0,0,0.3)" indicator-active-color="#3D6AFF">
          <swiper-item v-if="productDetail.thumb">
            <image :src="productDetail.thumb" mode="aspectFill" class="gallery-image" @click="previewImage(productDetail.thumb, allProductImages)" @error="handleImageError"></image>
          </swiper-item>
          <swiper-item v-for="(image, index) in productImages" :key="index">
            <image :src="image" mode="aspectFill" class="gallery-image" @click="previewImage(image, allProductImages)" @error="handleImageError"></image>
          </swiper-item>
          <swiper-item v-if="productImages.length === 0 && !productDetail.thumb">
            <image src="/static/images/product-default.jpg" mode="aspectFill" class="gallery-image"></image>
          </swiper-item>
        </swiper>
      </view>
      
      <!-- 产品标题 -->
      <view class="product-title">
        <text class="title-text">{{ productDetail.name }}</text>
      </view>
      
      <!-- 产品信息 -->
      <view class="product-info">
        <view class="category-tag" v-if="productDetail.category_name">
          <text class="tag-text">{{ productDetail.category_name }}</text>
        </view>
        <view class="price-tag" v-if="productDetail.price">
          <text class="price-text">¥{{ productDetail.price }}</text>
        </view>
      </view>
      
      <!-- 企业信息 -->
      <view class="company-info" @click="goToCompanyHome" v-if="companyInfo.logo_url || companyInfo.company_name">
        <image :src="companyInfo.logo_url || '/static/images/default-logo.png'" class="company-logo" mode="aspectFit"></image>
        <view class="company-name-container">
          <text class="company-name">{{ companyInfo.company_name || '企业主页' }}</text>
          <text class="company-link">查看企业主页 ></text>
        </view>
      </view>
      
      <!-- 产品特点 -->
      <view class="features-section" v-if="productDetail.features">
        <view class="section-title">
          <text class="title-text">产品特点</text>
        </view>
        <view class="features-content">
          <rich-text :nodes="formatContent(productDetail.features)"></rich-text>
        </view>
      </view>
      
      <!-- 产品描述 -->
      <view class="description-section">
        <view class="section-title">
          <text class="title-text">产品描述</text>
        </view>
        <view class="description-content">
          <rich-text :nodes="formatContent(productDetail.description || '暂无详细描述')"></rich-text>
        </view>
      </view>
      
      <!-- 产品标签 -->
      <view class="tags-section" v-if="productTags.length > 0">
        <view class="section-title">
          <text class="title-text">产品标签</text>
        </view>
        <view class="tags-list">
          <view class="tag-item" v-for="(tag, index) in productTags" :key="index">
            <text class="tag-text">{{ tag }}</text>
          </view>
        </view>
      </view>
      
      
      <!-- 相关产品 -->
      <view class="related-section" v-if="relatedProducts.length > 0">
        <view class="section-title">
          <text class="title-text">相关产品</text>
        </view>
        <view class="related-grid">
          <view class="related-item" v-for="item in relatedProducts" :key="item.id" @click="handleRelatedClick(item)">
            <image :src="item.thumb || '/static/images/product-default.jpg'" class="related-image" mode="aspectFill" @error="handleImageError"></image>
            <view class="related-info">
              <text class="related-name">{{ item.name }}</text>
              <text class="related-price" v-if="item.price">¥{{ item.price }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 咨询区域 -->
      <!-- <view class="consult-section">
        <view class="consult-bg">
          <view class="consult-content">
            <view class="consult-title">对产品感兴趣？</view>
            <view class="consult-desc">立即联系我们获取更多产品信息</view>
            <view class="consult-btn" @click="handleConsult">联系我们</view>
          </view>
        </view>
      </view> -->
      
      <!-- 加载状态 -->
      <view class="loading-container" v-if="loading">
        <u-loading-icon mode="spinner" size="40"></u-loading-icon>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 网络错误状态 -->
      <view class="error-container" v-if="networkError && !loading">
        <image src="/static/images/network-error.png" class="error-icon" mode="aspectFit"></image>
        <text class="error-title">网络连接失败</text>
        <text class="error-desc">请检查网络设置后重试</text>
        <view class="retry-btn" @click="retryLoadData">
          <text class="retry-text">重新加载</text>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bottom-btn inquiry-btn" @click="handleInquiry">
        <text class="btn-text">立即咨询</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getProductDetail, getProductList, getAbout,createPrivateRoom } from '@/utils/api.js'

export default {
  data() {
    return {
      userInfo:uni.getStorageSync('$userinfo'),
      loading: false,
      refreshing: false,
      networkError: false,
      productId: null,
      enterpriseId: null,
      
      // 产品详情
      productDetail: {},
      
      // 产品图片
      productImages: [],
      
      // 产品标签
      productTags: [],
      
      // 相关产品
      relatedProducts: [],
      
      
      // 企业信息
      companyInfo: {}
    }
  },
  
  computed: {
    // 所有产品图片（包括缩略图）
    allProductImages() {
      const images = []
      if (this.productDetail.thumb) {
        images.push(this.productDetail.thumb)
      }
      return [...images, ...this.productImages]
    }
  },
  
  onLoad(options) {
    // 获取产品ID和企业ID
    this.productId = options.id
    this.enterpriseId = options.enterpriseId || uni.getStorageSync('enterpriseId') || 1
    
    // 设置页面标题
    uni.setNavigationBarTitle({
      title: '产品详情'
    })
    
    this.checkNetworkStatus()
    this.loadProductDetail()
  },
  
  onShareAppMessage() {
    return {
      title: this.productDetail.name || '精彩产品分享',
      path: `/pages/company/product_detail?id=${this.productId}&enterpriseId=${this.enterpriseId}`,
      imageUrl: this.productDetail.thumb
    }
  },
  
  methods: {
    // 检查网络状态
    checkNetworkStatus() {
      uni.getNetworkType({
        success: (res) => {
          if (res.networkType === 'none') {
            this.networkError = true
            uni.showToast({
              title: '网络连接失败，请检查网络设置',
              icon: 'none',
              duration: 3000
            })
          }
        }
      })
    },
    
    // 加载产品详情
    async loadProductDetail() {
      this.loading = true
      this.networkError = false
      
      try {
        const response = await getProductDetail({ 
          id: this.productId,
          enterprise_id: this.enterpriseId
        })
        
        if (response.code === 0 && response.data) {
          this.productDetail = response.data
          
          // 解析产品图片
          this.parseProductImages()
          
          // 解析产品标签
          this.parseProductTags()
          
          // 加载相关产品
          this.loadRelatedProducts()
          
          
          // 加载企业信息
          this.loadCompanyInfo()
        }
      } catch (error) {
        console.error('加载产品详情失败:', error)
        this.networkError = true
        uni.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 解析产品图片
    parseProductImages() {
      if (!this.productDetail.image_urls) return
      
      try {
        if (typeof this.productDetail.image_urls === 'string') {
          // 尝试解析JSON格式的图片数组
          if (this.productDetail.image_urls.startsWith('[')) {
            this.productImages = JSON.parse(this.productDetail.image_urls)
          } else {
            // 如果是逗号分隔的字符串
            this.productImages = this.productDetail.image_urls.split(',').map(url => url.trim())
          }
        } else if (Array.isArray(this.productDetail.image_urls)) {
          this.productImages = this.productDetail.image_urls
        }
      } catch (error) {
        console.error('解析产品图片失败:', error)
        this.productImages = []
      }
    },
    
    // 解析产品标签
    parseProductTags() {
      if (!this.productDetail.tags) return
      
      try {
        if (typeof this.productDetail.tags === 'string') {
          // 尝试解析JSON格式的标签
          if (this.productDetail.tags.startsWith('[')) {
            this.productTags = JSON.parse(this.productDetail.tags)
          } else {
            // 如果是逗号分隔的字符串
            this.productTags = this.productDetail.tags.split(',').map(tag => tag.trim())
          }
        } else if (Array.isArray(this.productDetail.tags)) {
          this.productTags = this.productDetail.tags
        }
      } catch (error) {
        console.error('解析产品标签失败:', error)
        this.productTags = []
      }
    },
    
    // 加载相关产品
    async loadRelatedProducts() {
      try {
        // 如果有分类ID，则按分类查找相关产品
        const params = {
          enterprise_id: this.enterpriseId,
          page: 1,
          page_size: 4,
          status: 1
        }
        
        if (this.productDetail.category_id) {
          params.category_id = this.productDetail.category_id
        }
        
        const response = await getProductList(params)
        
        if (response.code === 0 && response.data) {
          let products = []
          
          if (response.data.data && Array.isArray(response.data.data)) {
            products = response.data.data
          } else if (Array.isArray(response.data)) {
            products = response.data
          }
          
          // 过滤掉当前产品
          this.relatedProducts = products.filter(item => item.id !== this.productId).slice(0, 4)
        }
      } catch (error) {
        console.error('加载相关产品失败:', error)
      }
    },
    
    
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true
      try {
        await this.loadProductDetail()
      } finally {
        this.refreshing = false
      }
    },
    
    // 重试加载数据
    retryLoadData() {
      this.checkNetworkStatus()
      if (!this.networkError) {
        this.loadProductDetail()
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1
      })
    },
    
    
    
    // 预览图片
    previewImage(current, urls) {
      if (!urls || urls.length === 0) return
      
      uni.previewImage({
        current,
        urls
      })
    },
    
    // 点击相关产品
    handleRelatedClick(item) {
      uni.navigateTo({
        url: `/pages/company/product_detail?id=${item.id}&enterpriseId=${this.enterpriseId}`
      })
    },
    
    // 咨询联系
    handleConsult() {
      uni.navigateTo({
        url: `/pages/company/contact?enterpriseId=${this.enterpriseId}`
      })
    },
    
    // 立即咨询
    async handleInquiry() {
      if(this.userInfo.id == this.enterpriseId){
        uni.showToast({ title: '不能和自己聊天', icon: 'none' })
        return
      } 
      // 创建私聊房间
      const res = await createPrivateRoom({ user_id2: this.enterpriseId })
      if (res.code === 0 && res.data && res.data.room_id) {
        uni.navigateTo({ url: `/pages/chat/chat?room_id=${res.data.room_id}&room_name=${encodeURIComponent('产品咨询')}` })
      }else{
        uni.showToast({ title: res.msg || '错误，请重试', icon: 'none' })
      }
    },
    
    // 格式化内容
    formatContent(content) {
      if (!content) return ''
      
      let formattedContent = content;
      
      // 如果内容不是HTML格式，转换换行符
      if (!content.includes('<') || !content.includes('>')) {
        formattedContent = content.replace(/\n/g, '<br>')
      }
      
      // 处理内容中的图片，添加样式确保不超出屏幕
      formattedContent = formattedContent.replace(/<img/g, '<img style="max-width:100%;height:auto;"')
      
      return formattedContent
    },
    
    // 加载企业信息
    async loadCompanyInfo() {
      try {
        const response = await getAbout({ 
          enterpriseId: this.enterpriseId
        })
        
        if (response.code === 0 && response.data) {
          this.companyInfo = response.data
        }
      } catch (error) {
        console.error('加载企业信息失败:', error)
      }
    },
    
    // 跳转到企业主页
    goToCompanyHome() {
      uni.navigateTo({
        url: `/pages/company/home?enterpriseId=${this.enterpriseId}`
      })
    },
    
    // 图片加载错误处理
    handleImageError(e) {
      console.log('图片加载失败:', e)
      // 可以设置默认图片
    }
  }
}
</script>

<style lang="less" scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx; /* 为底部操作栏留出空间 */
}

/* 头部导航 */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  z-index: 100;
  
  .back-btn {
    width: 70rpx;
    height: 70rpx;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .iconfont {
      font-size: 36rpx;
      color: #333;
    }
  }
}

/* 主要内容 */
.main-content { 
  height: 100vh;
 
}

/* 图片轮播 */
.image-gallery {
  background: #fff;
  
  .gallery-swiper {
    height: 500rpx;
    
    .gallery-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

/* 产品标题 */
.product-title {
  padding: 30rpx 30rpx 20rpx;
  background: #fff;
  
  .title-text {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.4;
  }
}

/* 产品信息 */
.product-info {
  display: flex;
  align-items: center;
  padding: 0 30rpx 30rpx;
  background: #fff;
  
  .category-tag {
    background: rgba(61, 106, 255, 0.1);
    border-radius: 6rpx;
    padding: 6rpx 16rpx;
    margin-right: 20rpx;
    
    .tag-text {
      font-size: 24rpx;
      color: #3D6AFF;
    }
  }
  
  .price-tag {
    .price-text {
      font-size: 32rpx;
      color: #ff4757;
      font-weight: 600;
    }
  }
}

/* 企业信息 */
.company-info {
  display: flex;
  align-items: center;
  padding: 16rpx 30rpx;
  margin-bottom: 20rpx; 
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  
  .company-logo {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    margin-right: 16rpx;
  }
  
  .company-name-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .company-name {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
      margin-bottom: 4rpx;
    }
    
    .company-link {
      font-size: 24rpx;
      color: #3D6AFF;
    }
  }
}

/* 通用section样式 */
.section-title {
  margin-bottom: 20rpx;
  
  .title-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
}

/* 产品特点 */
.features-section {
  margin-top: 20rpx;
  padding: 30rpx;
  background: #fff;
  
  .features-content {
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
  }
}

/* 产品描述 */
.description-section {
  margin-top: 20rpx;
  padding: 30rpx;
  background: #fff;
  
  .description-content {
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
    
    :deep(img) {
      max-width: 100% !important;
      height: auto !important;
    }
    
    :deep(image) {
      max-width: 100% !important;
      height: auto !important;
    }
  }
}

/* 产品标签 */
.tags-section {
  margin-top: 20rpx;
  padding: 30rpx;
  background: #fff;
  
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    
    .tag-item {
      background: #f5f5f5;
      border-radius: 30rpx;
      padding: 12rpx 24rpx;
      
      .tag-text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}


/* 相关产品 */
.related-section {
  margin-top: 20rpx;
  padding: 30rpx;
  background: #fff;
  
  .related-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20rpx;
    
    .related-item {
      background: #f9f9f9;
      border-radius: 12rpx;
      overflow: hidden;
      
      .related-image {
        width: 100%;
        height: 180rpx;
        object-fit: cover;
      }
      
      .related-info {
        padding: 16rpx;
        
        .related-name {
          font-size: 26rpx;
          color: #333;
          line-height: 1.4;
          margin-bottom: 8rpx;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .related-price {
          font-size: 24rpx;
          color: #ff4757;
          font-weight: 600;
        }
      }
    }
  }
}

/* 咨询区域 */
.consult-section {
  margin: 20rpx 0 40rpx;
  padding: 0 30rpx;
  
  .consult-bg {
    background: linear-gradient(135deg, #3D6AFF 0%, #5B7CFF 100%);
    border-radius: 20rpx;
    padding: 40rpx 30rpx;
    text-align: center;
    
    .consult-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #fff;
      margin-bottom: 16rpx;
    }
    
    .consult-desc {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 30rpx;
      line-height: 1.5;
    }
    
    .consult-btn {
      background: #fff;
      color: #3D6AFF;
      font-size: 28rpx;
      font-weight: 500;
      padding: 20rpx 40rpx;
      border-radius: 40rpx;
      display: inline-block;
    }
  }
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
  
  .bottom-btn {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 40rpx;
    
    &.inquiry-btn {
      background: #3D6AFF;
      
      .btn-text {
        font-size: 30rpx;
        color: #fff;
        font-weight: 500;
      }
    }
  }
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  
  .loading-text {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #999;
  }
}

/* 网络错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  background: #fff;
  border-radius: 20rpx;
  margin: 20rpx 30rpx;
  
  .error-icon {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 20rpx;
  }
  
  .error-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 10rpx;
  }
  
  .error-desc {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 30rpx;
    text-align: center;
    padding: 0 40rpx;
  }
  
  .retry-btn {
    background: #3D6AFF;
    border-radius: 50rpx;
    padding: 24rpx 60rpx;
    text-align: center;
    
    .retry-text {
      font-size: 32rpx;
      color: #fff;
      font-weight: 500;
    }
  }
}
</style>