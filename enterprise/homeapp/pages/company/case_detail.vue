<template>
  <view class="page">
  
    <!-- 主要内容 -->
    <scroll-view class="main-content" scroll-y="true" refresher-enabled @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <!-- 案例标题 -->
      <view class="case-title">
        <text class="title-text">{{ caseDetail.title }}</text>
      </view>
      
      <!-- 案例信息 -->
      <view class="case-info">
        <text class="date-text">{{ formatDate(caseDetail.created_at) }}</text>
        <view class="category-tag" v-if="caseDetail.category_name">
          <text class="tag-text">{{ caseDetail.category_name }}</text>
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
      
      <!-- 封面图 -->
      <view class="cover-image" v-if="caseDetail.cover_image">
        <image :src="caseDetail.cover_image" mode="widthFix" @error="handleImageError"></image>
      </view>
      
      <!-- 案例图片轮播 -->
      <view class="image-gallery" v-if="caseImages.length > 0">
        <swiper class="gallery-swiper" :indicator-dots="true" :autoplay="false" indicator-color="rgba(0,0,0,0.3)" indicator-active-color="#3D6AFF">
          <swiper-item v-for="(image, index) in caseImages" :key="index">
            <image :src="image" mode="aspectFit" class="gallery-image" @click="previewImage(image, caseImages)" @error="handleImageError"></image>
          </swiper-item>
        </swiper>
      </view>
      
      <!-- 视频展示 -->
      <view class="video-container" v-if="caseDetail.video_url">
        <video :src="caseDetail.video_url" controls class="case-video"></video>
      </view>
      
      <!-- 案例内容 -->
      <view class="case-content">
        <rich-text :nodes="formatContent(caseDetail.content)"></rich-text>
      </view>
      
      
      <!-- 相关案例 -->
      <view class="related-section" v-if="relatedCases.length > 0">
        <text class="section-title">相关案例</text>
        <view class="related-list">
          <view class="related-item" v-for="item in relatedCases" :key="item.id" @click="handleRelatedClick(item)">
            <image :src="item.cover_image || '/static/images/case-default.jpg'" class="related-image" mode="aspectFill" @error="handleImageError"></image>
            <view class="related-content">
              <text class="related-title">{{ item.title }}</text>
              <text class="related-desc">{{ item.description || '' }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 咨询区域 -->
      <view class="consult-section">
        <view class="consult-bg">
          <view class="consult-content">
            <view class="consult-title">需要类似解决方案？</view>
            <view class="consult-desc">我们的专业团队为您提供一对一咨询服务</view>
            <view class="consult-btn" @click="handleConsult">联系我们</view>
          </view>
        </view>
      </view>
      
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
  </view>
</template>

<script>
import { getCase, getCaseList, getAbout,createPrivateRoom } from '@/utils/api.js'

export default {
  data() {
    return {
      userInfo:uni.getStorageSync('$userinfo'),
      loading: false,
      refreshing: false,
      networkError: false,
      caseId: null,
      enterpriseId: null,
      
      // 案例详情
      caseDetail: {},
      
      // 案例图片
      caseImages: [],
      
      // 相关案例
      relatedCases: [],
      
      
      // 企业信息
      companyInfo: {}
    }
  },
  
  onLoad(options) {
    // 获取案例ID和企业ID
    this.caseId = options.id
    this.enterpriseId = options.enterpriseId || uni.getStorageSync('enterpriseId') || 1
    
    // 设置页面标题
    uni.setNavigationBarTitle({
      title: '案例详情'
    })
    
    this.checkNetworkStatus()
    this.loadCaseDetail()
  },
  
  onShareAppMessage() {
    return {
      title: this.caseDetail.title || '精彩案例分享',
      path: `/pages/company/case_detail?id=${this.caseId}&enterpriseId=${this.enterpriseId}`,
      imageUrl: this.caseDetail.cover_image
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
    
    // 加载案例详情
    async loadCaseDetail() {
      this.loading = true
      this.networkError = false
      
      try {
        const response = await getCase({ 
          id: this.caseId,
          enterprise_id: this.enterpriseId
        })
        
        if (response.code === 0 && response.data) {
          this.caseDetail = response.data
          
          // 解析案例图片
          this.parseCaseImages()
          
          // 加载相关案例
          this.loadRelatedCases()
          
          
          // 加载企业信息
          this.loadCompanyInfo()
        }
      } catch (error) {
        console.error('加载案例详情失败:', error)
        this.networkError = true
        uni.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 解析案例图片
    parseCaseImages() {
      if (!this.caseDetail.image_urls) return
      
      try {
        if (typeof this.caseDetail.image_urls === 'string') {
          // 尝试解析JSON格式的图片数组
          if (this.caseDetail.image_urls.startsWith('[')) {
            this.caseImages = JSON.parse(this.caseDetail.image_urls)
          } else {
            // 如果是逗号分隔的字符串
            this.caseImages = this.caseDetail.image_urls.split(',').map(url => url.trim())
          }
        } else if (Array.isArray(this.caseDetail.image_urls)) {
          this.caseImages = this.caseDetail.image_urls
        }
      } catch (error) {
        console.error('解析案例图片失败:', error)
        this.caseImages = []
      }
    },
    
    // 加载相关案例
    async loadRelatedCases() {
      try {
        // 如果有分类ID，则按分类查找相关案例
        const params = {
          enterprise_id: this.enterpriseId,
          page: 1,
          page_size: 3,
          status: 1
        }
        
        if (this.caseDetail.category_id) {
          params.category_id = this.caseDetail.category_id
        }
        
        const response = await getCaseList(params)
        
        if (response.code === 0 && response.data) {
          let cases = []
          
          if (response.data.data && Array.isArray(response.data.data)) {
            cases = response.data.data
          } else if (Array.isArray(response.data)) {
            cases = response.data
          }
          
          // 过滤掉当前案例
          this.relatedCases = cases.filter(item => item.id !== this.caseId).slice(0, 2)
        }
      } catch (error) {
        console.error('加载相关案例失败:', error)
      }
    },
    
    
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true
      try {
        await this.loadCaseDetail()
      } finally {
        this.refreshing = false
      }
    },
    
    // 重试加载数据
    retryLoadData() {
      this.checkNetworkStatus()
      if (!this.networkError) {
        this.loadCaseDetail()
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
      uni.previewImage({
        current,
        urls
      })
    },
    
    // 点击相关案例
    handleRelatedClick(item) {
      uni.navigateTo({
        url: `/pages/company/case_detail?id=${item.id}&enterpriseId=${this.enterpriseId}`
      })
    },
    
    // 咨询联系
    async handleConsult() {
      if(this.userInfo.id == this.enterpriseId){
        uni.showToast({ title: '不能和自己聊天', icon: 'none' })
        return
      } 
      // 创建私聊房间
      const res = await createPrivateRoom({ user_id2: this.enterpriseId })
      if (res.code === 0 && res.data && res.data.room_id) {
        uni.navigateTo({ url: `/pages/chat/chat?room_id=${res.data.room_id}&room_name=${encodeURIComponent('案例咨询')}` })
      }else{
        uni.showToast({ title: res.msg || '错误，请重试', icon: 'none' })
      }
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      
      // 如果是时间戳（数字）
      if (typeof dateString === 'number') {
        dateString = new Date(dateString * 1000)
      }
      
      const date = new Date(dateString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
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
  background-color: #ffffff;
}



/* 主要内容 */
.main-content { 
  height: 100%;
  padding: 0rpx 30rpx 40rpx;
}

/* 案例标题 */
.case-title {
  margin-bottom: 20rpx;
  
  .title-text {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.4;
  }
}

/* 案例信息 */
.case-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  
  .date-text {
    font-size: 24rpx;
    color: #999;
    margin-right: 20rpx;
  }
  
  .category-tag {
    background: rgba(61, 106, 255, 0.1);
    border-radius: 6rpx;
    padding: 6rpx 16rpx;
    
    .tag-text {
      font-size: 24rpx;
      color: #3D6AFF;
    }
  }
}

/* 企业信息 */
.company-info {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  margin-bottom: 30rpx; 
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

/* 封面图 */
.cover-image {
  margin-bottom: 30rpx;
  overflow: hidden;
  
  image {
    width: 100%;
    max-width: 100%;
    border-radius: 12rpx;
    height: auto;
  }
}

/* 图片轮播 */
.image-gallery {
  margin-bottom: 30rpx;
  
  .gallery-swiper {
    height: 400rpx;
    
    .gallery-image {
      width: 100%;
      height: 100%;
      border-radius: 12rpx;
    }
  }
}

/* 视频容器 */
.video-container {
  margin-bottom: 30rpx;
  
  .case-video {
    width: 100%;
    height: 400rpx;
    border-radius: 12rpx;
  }
}

/* 案例内容 */
.case-content {
  margin-bottom: 40rpx;
  font-size: 30rpx;
  color: #333;
  line-height: 1.8;
  
  :deep(img) {
    max-width: 100% !important;
    height: auto !important;
  }
  
  :deep(image) {
    max-width: 100% !important;
    height: auto !important;
  }
}


/* 相关案例 */
.related-section {
  margin-bottom: 40rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    display: block;
  }
  
  .related-list {
    .related-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .related-image {
        width: 160rpx;
        height: 120rpx;
        border-radius: 12rpx;
        margin-right: 20rpx;
      }
      
      .related-content {
        flex: 1;
        
        .related-title {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 12rpx;
          display: block;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .related-desc {
          font-size: 24rpx;
          color: #999;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
    }
  }
}

/* 咨询区域 */
.consult-section {
  margin-bottom: 40rpx;
  
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
  margin: 20rpx 0;
  
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