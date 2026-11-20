<template>
  <view class="page">
    <!-- 头部搜索 -->
    <view class="header-section">
      <view class="search-container">
        <u-search 
          v-model="searchKeyword" 
          placeholder="搜索新闻标题、内容、企业名称" 
          @search="onSearch" 
          @custom="onSearch" 
          @clear="onClearSearch" 
          height="70" 
          searchIconSize="36" 
          actionText="搜索"
          :showAction="searchKeyword.length > 0"
          bg-color="#f5f5f5"
          border-color="transparent"
        ></u-search>
      </view>
    </view>

    <!-- 主要内容 -->
    <scroll-view class="main-content" scroll-y="true" @scrolltolower="loadMore" refresher-enabled @refresherrefresh="onRefresh" :refresher-triggered="refreshing">

      <!-- 新闻列表 -->
      <view class="news-section">
        <view class="section-header">
          <text class="section-title">热门新闻</text>
        </view>
        
        <!-- 新闻列表 -->
        <view class="news-list" v-if="articleList.length > 0">
          <view class="news-item" v-for="article in articleList" :key="article.id" @click="handleArticleClick(article)">
            <view class="date-row">
              <text class="date-text">{{ formatDate(article.updated_at*1000) }}</text>
              <!-- <text class="enterprise-name">{{ article.enterprise_name || '' }}</text> -->
            </view>
            <view class="news-main">
              <view class="news-content">
                <text class="news-title">{{ article.title }}</text>
                <text class="news-desc">{{ article.summary || (article.content ? article.content.substring(0, 80) + '...' : '暂无描述') }}</text>
                <view class="news-stats">
                  <text class="stat-item">阅读 {{ article.view_count || 0 }}</text>
                  <text class="stat-item">{{ article.enterprise_name }}</text>
                </view>
              </view>
              <image :src="article.cover_image || '/static/img/news1.png'" class="news-image" mode="aspectFill" @error="handleImageError"></image>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="!loading && articleList.length === 0">
          <image src="/static/icon/empty.png" class="empty-icon" mode="aspectFit"></image>
          <text class="empty-title">暂无新闻</text>
          <text class="empty-desc">当前没有发布的新闻内容</text>
        </view>

        <!-- 加载状态 -->
        <view class="loading-container" v-if="loading">
          <view class="loading-spinner"></view>
          <text class="loading-text">加载中...</text>
        </view>
        
        <!-- 网络错误状态 -->
        <view class="error-container" v-if="networkError && !loading">
          <image src="/static/icon/error.png" class="error-icon" mode="aspectFit"></image>
          <text class="error-title">网络连接失败</text>
          <text class="error-desc">请检查网络设置后重试</text>
          <view class="retry-btn" @click="retryLoadData">
            <text class="retry-text">重新加载</text>
          </view>
        </view>
        
        <!-- 没有更多数据 -->
        <view class="no-more-data" v-if="!hasMore && articleList.length > 0 && !loading">
          <text class="no-more-text">没有更多新闻了</text>
        </view>
      </view>
    </scroll-view>
		
	</view>
</template>

<script>
import { getHomepageArticleList } from '@/utils/api.js'

	export default {
		data() {
			return {
      loading: false,
      refreshing: false,
      networkError: false,
      
      // 分页参数
      currentPage: 1,
      pageSize: 10,
      hasMore: true,
      
      // 搜索相关
      searchKeyword: '', // 搜索关键词
      isSearching: false, // 是否处于搜索状态
      
      // 数据
      articleList: []
    }
  },
  
  onLoad() {
    // 设置页面标题
    uni.setNavigationBarTitle({
      title: '热门新闻'
    })
    
    this.checkNetworkStatus()
    this.loadPageData()
  },
  
  onPullDownRefresh() {
    this.onRefresh()
    uni.stopPullDownRefresh()
  },
  
  onReachBottom() {
    this.loadMore()
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

    // 搜索功能
    async onSearch() {
      if (!this.searchKeyword.trim()) {
        this.onClearSearch();
        return;
      }
      
      this.isSearching = true;
      this.loading = true;
      
      try {
        await this.loadArticles(true);
      } finally {
        this.loading = false;
      }
    },
    
    // 清空搜索
    async onClearSearch() {
      this.searchKeyword = '';
      this.isSearching = false;
      this.loading = true;
      
      try {
        await this.loadArticles(true);
      } finally {
        this.loading = false;
      }
    },
    
    // 加载页面数据
    async loadPageData() {
      this.loading = true
      this.networkError = false
      
      try {
        // 先尝试从缓存加载数据
        this.loadFromCache()
        
        // 加载文章数据
        await this.loadArticles(true)
        
        // 保存数据到缓存
        this.saveToCache()
        
      } catch (error) {
        console.error('加载页面数据失败:', error)
        this.networkError = true
        uni.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 从缓存加载数据
    loadFromCache() {
      try {
        const cacheKey = 'hot_news_data'
        const cachedData = uni.getStorageSync(cacheKey)
        if (cachedData) {
          const parsed = JSON.parse(cachedData)
          const { data, timestamp } = parsed
          const now = Date.now()
          // 缓存有效期5分钟
          if (data && now - timestamp < 5 * 60 * 1000) {
            this.articleList = data.articleList || []
          }
        }
      } catch (error) {
        console.error('从缓存加载数据失败:', error)
      }
    },
    
    // 保存数据到缓存
    saveToCache() {
      try {
        const cacheKey = 'hot_news_data'
        const cacheData = {
          data: {
            articleList: this.articleList
          },
          timestamp: Date.now()
        }
        uni.setStorageSync(cacheKey, JSON.stringify(cacheData))
      } catch (error) {
        console.error('保存数据到缓存失败:', error)
      }
    },
    
    
    // 加载文章列表（平台所有企业的新闻）
    async loadArticles(reset = false) {
      try {
        if (reset) {
          this.currentPage = 1
          this.hasMore = true
        }
        
        if (!this.hasMore && !reset) return
        
        const params = {
          page: this.currentPage,
          page_size: this.pageSize,
          is_published: 1,
          // 不传enterprise_id，获取所有企业的新闻
          order_by: 'view_count', // 按阅读量排序，显示热门新闻
          order_type: 'desc'
        }
        
        // 如果有搜索关键词，添加搜索参数
        if (this.isSearching && this.searchKeyword.trim()) {
          params.keyword = this.searchKeyword.trim();
        }
        
        
        const response = await getHomepageArticleList(params)
        
        if (response.code === 0 && response.data) {
          // 确保我们获取到的是数组
          let newArticles = []
          
          if (response.data.data && Array.isArray(response.data.data)) {
            newArticles = response.data.data
          } else if (Array.isArray(response.data)) {
            newArticles = response.data
          } else {
            console.error('API返回的文章数据格式不正确:', response.data)
          }
          
          if (reset) {
            this.articleList = newArticles
          } else {
            this.articleList = [...this.articleList, ...newArticles]
          }
          
          // 检查是否还有更多数据
          this.hasMore = newArticles.length === this.pageSize
          if (this.hasMore) {
            this.currentPage++
          }
        }
      } catch (error) {
        console.error('加载文章列表失败:', error)
        throw error
      }
    },
    
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true
      try {
        await this.loadPageData()
      } finally {
        this.refreshing = false
      }
    },
    
    // 上拉加载更多
    async loadMore() {
      if (!this.loading && this.hasMore) {
        await this.loadArticles(false)
      }
    },
    
    // 重试加载数据
    retryLoadData() {
      this.checkNetworkStatus()
      if (!this.networkError) {
        this.loadPageData()
      }
    },
    
    
    // 点击事件处理
    handleArticleClick(article) {
      uni.navigateTo({
        url: `/pages/company/news_detail?id=${article.id}&enterpriseId=${article.enterprise_id}`
      })
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date
      
      if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前'
      } else if (diff < 86400000) { // 24小时内
        return Math.floor(diff / 3600000) + '小时前'
      } else if (diff < 2592000000) { // 30天内
        return Math.floor(diff / 86400000) + '天前'
      } else {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      }
    },
    
    // 图片加载错误处理
    handleImageError(e) {
      console.log('图片加载失败:', e)
      // 可以设置默认图片
    }
		}
	}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 头部搜索 */
.header-section {
  background: #fff;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-container {
  width: 100%;
}

/* 主要内容 */
.main-content {
  height: calc(100vh - 120rpx);
}


/* 通用section样式 */
.section-header {
  margin-bottom: 30rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
}

/* 新闻列表 */
.news-section {
  background: #fff;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
}

.news-list {
  .news-item {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.date-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.date-text {
  font-size: 24rpx;
  color: #3D6AFF;
  background: rgba(61, 106, 255, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.enterprise-name {
  font-size: 24rpx;
  color: #999;
  background: #f5f5f5;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.news-main {
  display: flex;
  align-items: flex-start;
}

.news-content {
  flex: 1;
  margin-right: 20rpx;
}

.news-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-stats {
  display: flex;
  gap: 20rpx;
  
  .stat-item {
    font-size: 24rpx;
    color: #999;
  }
}

.news-image {
  width: 160rpx;
  height: 120rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  
  .empty-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
    opacity: 0.6;
  }
  
  .empty-title {
    font-size: 32rpx;
    color: #333;
    margin-bottom: 16rpx;
    font-weight: 500;
  }
  
  .empty-desc {
    font-size: 28rpx;
    color: #999;
    text-align: center;
    line-height: 1.5;
  }
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  
  .loading-spinner {
    width: 40rpx;
    height: 40rpx;
    border: 4rpx solid #f3f3f3;
    border-top: 4rpx solid #3D6AFF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #999;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

/* 没有更多数据 */
.no-more-data {
  text-align: center;
  padding: 40rpx 0;
  
  .no-more-text {
    font-size: 28rpx;
    color: #999;
  }
}

</style>
