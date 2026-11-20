<template>
  <view class="page">
    
    
    <!-- 主要内容 -->
    <scroll-view class="main-content" scroll-y="true" refresher-enabled @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <!-- 新闻标题 -->
      <view class="news-title">
        <text class="title-text">{{ articleDetail.title }}</text>
      </view>
      
      <!-- 新闻信息 -->
      <view class="news-info">
        <text class="date-text">{{$C.formatDateSmart(articleDetail.updated_at) }}</text>
        <text class="view-count">阅读量 {{ articleDetail.view_count || 0 }}</text>
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
      <view class="cover-image" v-if="articleDetail.cover_image">
        <image :src="articleDetail.cover_image" mode="widthFix" @error="handleImageError"></image>
      </view>
      
      <!-- 新闻内容 -->
      <view class="news-content">
        <rich-text :nodes="formatContent(articleDetail.content)"></rich-text>
      </view>
      
      
      <!-- 相关标签 -->
      <view class="tags-section" v-if="articleTags.length > 0">
        <text class="section-title">相关标签</text>
        <view class="tags-list">
          <view class="tag-item" v-for="(tag, index) in articleTags" :key="index" @click="handleTagClick(tag)">
            <text class="tag-text">{{ tag }}</text>
          </view>
        </view>
      </view>
      
      <!-- 相关新闻 -->
      <view class="related-section" v-if="relatedArticles.length > 0">
        <text class="section-title">相关新闻</text>
        <view class="related-list">
          <view class="related-item" v-for="article in relatedArticles" :key="article.id" @click="handleRelatedClick(article)">
            <image :src="article.cover_image || '/static/images/news-default.jpg'" class="related-image" mode="aspectFill" @error="handleImageError"></image>
            <view class="related-content">
              <text class="related-title">{{ article.title }}</text>
              <text class="related-date">{{ formatDate(article.published_at || article.created_at) }}</text>
            </view>
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
import { getArticle, getArticleList, getAbout } from '@/utils/api.js'

export default {
  data() {
    return {
      loading: false,
      refreshing: false,
      networkError: false,
      articleId: null,
      enterpriseId: null,
      
      // 文章详情
      articleDetail: {},
      
      // 文章标签
      articleTags: [],
      
      // 相关文章
      relatedArticles: [],
      
      
      // 企业信息
      companyInfo: {}
    }
  },
  
  onLoad(options) {
    // 获取文章ID和企业ID
    this.articleId = options.id
    this.enterpriseId = options.enterpriseId || uni.getStorageSync('enterpriseId') || 1
    
    // 设置页面标题
    uni.setNavigationBarTitle({
      title: '新闻动态'
    })
    
    this.checkNetworkStatus()
    this.loadArticleDetail()
  },
  
  onShareAppMessage() {
    return {
      title: this.articleDetail.title || '精彩文章分享',
      path: `/pages/company/news_detail?id=${this.articleId}&enterpriseId=${this.enterpriseId}`,
      imageUrl: this.articleDetail.cover_image
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
    
    // 加载文章详情
    async loadArticleDetail() {
      this.loading = true
      this.networkError = false
      
      try {
        const response = await getArticle({ 
          id: this.articleId
        })
        
        if (response.code === 0 && response.data) {
          this.articleDetail = response.data
          
          // 解析标签
          this.parseArticleTags()
          
          // 加载相关文章
          this.loadRelatedArticles()
          
          
          // 加载企业信息
          this.loadCompanyInfo()
        }
      } catch (error) {
        console.error('加载文章详情失败:', error)
        this.networkError = true
        uni.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
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
    
    // 解析文章标签
    parseArticleTags() {
      if (!this.articleDetail.tags) return
      
      try {
        if (typeof this.articleDetail.tags === 'string') {
          // 尝试解析JSON格式的标签
          if (this.articleDetail.tags.startsWith('[')) {
            this.articleTags = JSON.parse(this.articleDetail.tags)
          } else {
            // 如果是逗号分隔的字符串
            this.articleTags = this.articleDetail.tags.split(',').map(tag => tag.trim())
          }
        } else if (Array.isArray(this.articleDetail.tags)) {
          this.articleTags = this.articleDetail.tags
        }
      } catch (error) {
        console.error('解析文章标签失败:', error)
        this.articleTags = []
      }
    },
    
    // 加载相关文章
    async loadRelatedArticles() {
      try {
        // 如果有分类ID，则按分类查找相关文章
        const params = {
          enterprise_id: this.enterpriseId,
          page: 1,
          page_size: 3,
          is_published: 1
        }
        
        if (this.articleDetail.category_id) {
          params.category_id = this.articleDetail.category_id
        }
        
        const response = await getArticleList(params)
        
        if (response.code === 0 && response.data) {
          let articles = []
          
          if (response.data.data && Array.isArray(response.data.data)) {
            articles = response.data.data
          } else if (Array.isArray(response.data)) {
            articles = response.data
          }
          
          // 过滤掉当前文章
          this.relatedArticles = articles.filter(article => article.id !== this.articleId).slice(0, 2)
        }
      } catch (error) {
        console.error('加载相关文章失败:', error)
      }
    },
    
    
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true
      try {
        await this.loadArticleDetail()
      } finally {
        this.refreshing = false
      }
    },
    
    // 重试加载数据
    retryLoadData() {
      this.checkNetworkStatus()
      if (!this.networkError) {
        this.loadArticleDetail()
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1
      })
    },
    
    
    // 点击标签
    handleTagClick(tag) {
      
      uni.navigateTo({
        url: `/pages/company/news?tag=${encodeURIComponent(tag)}&enterpriseId=${this.enterpriseId}`
      })
    },
    
    // 点击相关文章
    handleRelatedClick(article) {
      
      uni.navigateTo({
        url: `/pages/company/news_detail?id=${article.id}&enterpriseId=${this.enterpriseId}`
      })
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

/* 新闻标题 */
.news-title {
  margin-bottom: 20rpx;
  
  .title-text {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.4;
  }
}

/* 新闻信息 */
.news-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  
  .date-text {
    font-size: 24rpx;
    color: #999;
    margin-right: 20rpx;
  }
  
  .view-count {
    font-size: 24rpx;
    color: #999;
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

/* 新闻内容 */
.news-content {
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


/* 相关标签 */
.tags-section {
  margin-bottom: 40rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    display: block;
  }
  
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

/* 相关新闻 */
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
        
        .related-date {
          font-size: 24rpx;
          color: #999;
        }
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