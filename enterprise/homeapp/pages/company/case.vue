<template>
  <view class="page">
    <!-- 主要内容 -->
    <scroll-view class="main-content" scroll-y="true" @scrolltolower="loadMore" refresher-enabled @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <!-- 轮播图区域 -->
      <view class="banner-section" v-if="banners.length > 0">
        <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" indicator-color="rgba(255,255,255,0.5)" indicator-active-color="#fff">
          <swiper-item v-for="(item, index) in banners" :key="item.id">
            <view class="banner-item" :style="{ backgroundImage: 'url(' + item.image_url + ')' }" @click="handleBannerClick(item)">
              
            </view>
          </swiper-item>
        </swiper>
      </view>

      <!-- 分类导航 -->
      <view class="category-nav" v-if="categoryList.length > 0">
        <view 
          class="nav-item" 
          :class="{ active: activeCategory === item.id }"
          v-for="item in categoryList" 
          :key="item.id"
          @click="switchCategory(item.id)"
        >
          <text class="nav-text">{{ item.name }}</text>
        </view>
      </view>

      <!-- 案例列表 -->
      <view class="case-section">
        <view class="section-header">
          <text class="section-title">成功案例</text>
        </view>
        
        <!-- 案例列表 -->
        <view class="case-list" v-if="caseList.length > 0">
          <view class="case-item" v-for="caseItem in caseList" :key="caseItem.id" @click="handleCaseClick(caseItem)">
            <image :src="caseItem.cover_image || '/static/case1.jpg'" class="case-image" mode="aspectFill" @error="handleImageError"></image>
            <view class="case-info">
              <text class="case-title">{{ caseItem.title }}</text>
              <text class="case-desc">{{ caseItem.description || (caseItem.content ? caseItem.content.substring(0, 50) + '...' : '') }}</text>
              <view class="case-tag">
                <text class="tag-text">{{ caseItem.category_name || '案例' }}</text>
              </view>
              <view class="more-link">
                <text class="more-text">查看详情</text>
                <text class="more-icon">></text>
              </view>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="!loading && caseList.length === 0">
          <image src="/static/images/empty-case.png" class="empty-icon" mode="aspectFit"></image>
          <text class="empty-title">暂无案例</text>
          <text class="empty-desc">敬请期待更多精彩案例</text>
        </view>
      </view>

      <!-- 底部咨询区域 -->
      <view class="consult-section">
        <view class="consult-bg">
          <view class="consult-content">
            <view class="consult-title">寻找定制解决方案？</view>
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
        <image src="/static/network-error.png" class="error-icon" mode="aspectFit"></image>
        <text class="error-title">网络连接失败</text>
        <text class="error-desc">请检查网络设置后重试</text>
        <view class="retry-btn" @click="retryLoadData">
          <text class="retry-text">重新加载</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部导航 -->
    <TabBar :current="3" pagePath="/pages/company/case" />
  </view>
</template>
<script>
import { 
  getBanners, 
  getCaseList,
  getHomePageCategory,
  createPrivateRoom
} from '@/utils/api.js'
import TabBar from './components/TabBar.vue'

export default {
  components: {
    TabBar
  },
  
  data() {
    return {
      userInfo:uni.getStorageSync('$userinfo'),
      loading: false,
      refreshing: false,
      networkError: false,
      enterpriseId: null,
      
      // 分页参数
      currentPage: 1,
      pageSize: 10,
      hasMore: true,
      
      // 筛选参数
      activeCategory: 'all',
      
      // 数据
      banners: [],
      categoryList: [
        { id: 'all', name: '全部' }
      ],
      caseList: []
    }
  },
  
  onLoad(options) {
    // 获取企业ID
    this.enterpriseId = options.enterpriseId || uni.getStorageSync('enterpriseId') || 1
    
    // 设置页面标题
    uni.setNavigationBarTitle({
      title: '成功案例'
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
    
    // 加载页面数据
    async loadPageData() {
      this.loading = true
      this.networkError = false
      
      try {
        // 先尝试从缓存加载数据
        this.loadFromCache()
        
        // 并行加载数据
        const tasks = [
          this.loadBanners(),
          this.loadCategories(),
          this.loadCases(true)
        ]
        
        await Promise.all(tasks)
        
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
        const cacheKey = `case_data_${this.enterpriseId}`
        const cachedData = uni.getStorageSync(cacheKey)
        if (cachedData) {
          const parsed = JSON.parse(cachedData)
          const { data, timestamp } = parsed
          const now = Date.now()
          // 缓存有效期5分钟
          if (data && now - timestamp < 5 * 60 * 1000) {
            this.banners = data.banners || []
            this.categoryList = data.categoryList || [{ id: 'all', name: '全部' }]
            this.caseList = data.caseList || []
          }
        }
      } catch (error) {
        console.error('从缓存加载数据失败:', error)
      }
    },
    
    // 保存数据到缓存
    saveToCache() {
      try {
        const cacheKey = `case_data_${this.enterpriseId}`
        const cacheData = {
          data: {
            banners: this.banners,
            categoryList: this.categoryList,
            caseList: this.caseList
          },
          timestamp: Date.now()
        }
        uni.setStorageSync(cacheKey, JSON.stringify(cacheData))
      } catch (error) {
        console.error('保存数据到缓存失败:', error)
      }
    },
    
    // 加载轮播图
    async loadBanners() {
      try {
        const response = await getBanners({ 
          enterprise_id: this.enterpriseId,
          type: 'case' // 案例页面专用轮播图
        })
        if (response.code === 0 && response.data) {
          this.banners = response.data
        }
      } catch (error) {
        console.error('加载轮播图失败:', error)
      }
    },
    
    // 加载分类
    async loadCategories() {
      try {
        const response = await getHomePageCategory({ 
          enterprise_id: this.enterpriseId,
          type: 'case' // 案例分类
        })
        if (response.code === 0 && response.data) {
          this.categoryList = [
            { id: 'all', name: '全部' },
            ...response.data
          ]
        }
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    },
    
    // 加载案例列表
    async loadCases(reset = false) {
      try {
        if (reset) {
          this.currentPage = 1
          this.hasMore = true
        }
        
        if (!this.hasMore && !reset) return
        
        const params = {
          enterprise_id: this.enterpriseId,
          page: this.currentPage,
          page_size: this.pageSize,
          status: 1
        }
        
        // 添加分类筛选
        if (this.activeCategory !== 'all') {
          params.category_id = this.activeCategory
        }
        
        const response = await getCaseList(params)
        
        if (response.code === 0 && response.data) {
          // 确保我们获取到的是数组
          let newCases = []
          
          if (response.data.data && Array.isArray(response.data.data)) {
            newCases = response.data.data
          } else if (Array.isArray(response.data)) {
            newCases = response.data
          } else {
            console.error('API返回的案例数据格式不正确:', response.data)
          }
          
          if (reset) {
            this.caseList = newCases
          } else {
            this.caseList = [...this.caseList, ...newCases]
          }
          
          // 检查是否还有更多数据
          this.hasMore = newCases.length === this.pageSize
          if (this.hasMore) {
            this.currentPage++
          }
        }
      } catch (error) {
        console.error('加载案例列表失败:', error)
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
        await this.loadCases(false)
      }
    },
    
    // 重试加载数据
    retryLoadData() {
      this.checkNetworkStatus()
      if (!this.networkError) {
        this.loadPageData()
      }
    },
    
    // 分类切换
    async switchCategory(categoryId) {
      if (this.activeCategory === categoryId) return
      
      // 添加触感反馈
      
      
      this.activeCategory = categoryId
      this.loading = true
      
      try {
        await this.loadCases(true)
      } finally {
        this.loading = false
      }
    },
    
    // 点击事件处理
    handleBannerClick(banner) {
      
      
      if (banner.link_url) {
        if (banner.link_url.startsWith('http')) {
          uni.navigateTo({
            url: `/pages/webview/webview?url=${encodeURIComponent(banner.link_url)}`
          })
        } else {
          uni.navigateTo({
            url: banner.link_url
          })
        }
      }
    },
    
    handleCaseClick(caseItem) {
      
      uni.navigateTo({
        url: `/pages/company/case_detail?id=${caseItem.id}&enterpriseId=${this.enterpriseId}`
      })
    },
    
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

/* 主要内容 */
.main-content { 
  height: 90vh;
}

/* 轮播图 */
.banner-section {
  .banner-swiper {
    height: 400rpx;
    
    .banner-item {
      height: 100%;
      background-size: cover;
      background-position: center;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0; 
      } 
    }
  }
}

/* 分类导航 */
.category-nav {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
  overflow-x: auto;
  white-space: nowrap;
  
  .nav-item {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 72rpx;
    padding: 0 30rpx;
    position: relative;
    
    .nav-text {
      font-size: 28rpx;
      color: #666;
      transition: color 0.3s;
    }
    
    &.active {
      .nav-text {
        color: #3D6AFF;
        font-weight: 500;
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 6rpx;
        background: #3D6AFF;
        border-radius: 3rpx;
      }
    }
  }
}

/* 通用section样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
}

/* 案例列表 */
.case-section {
  background: #fff;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
}

.case-list {
  .case-item {
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .case-image {
      width: 100%;
      height: 320rpx;
      object-fit: cover;
    }
    
    .case-info {
      padding: 24rpx;
      position: relative;
      
      .case-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 16rpx;
        display: block;
      }
      
      .case-desc {
        font-size: 28rpx;
        color: #666;
        line-height: 1.5;
        margin-bottom: 24rpx;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .case-tag {
        display: inline-block;
        background: rgba(61, 106, 255, 0.1);
        border-radius: 6rpx;
        padding: 6rpx 16rpx;
        margin-bottom: 16rpx;
        
        .tag-text {
          font-size: 24rpx;
          color: #3D6AFF;
        }
      }
      
      .more-link {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        
        .more-text {
          font-size: 26rpx;
          color: #3D6AFF;
          margin-right: 8rpx;
        }
        
        .more-icon {
          font-size: 26rpx;
          color: #3D6AFF;
        }
      }
    }
  }
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

/* 咨询区域 */
.consult-section {
  margin-bottom: 40rpx;
  
  .consult-bg {
    background: linear-gradient(135deg, #3D6AFF 0%, #5B7CFF 100%);
    margin: 0 30rpx;
    border-radius: 20rpx;
    padding: 60rpx 40rpx;
    text-align: center;
    
    .consult-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #fff;
      margin-bottom: 16rpx;
    }
    
    .consult-desc {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 40rpx;
      line-height: 1.5;
    }
    
    .consult-btn {
      background: #fff;
      color: #3D6AFF;
      font-size: 30rpx;
      font-weight: 500;
      padding: 24rpx 48rpx;
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

/* 深层样式穿透 */
::v-deep .uni-swiper-dot {
  background-color: rgba(255, 255, 255, 0.5) !important;
  
  &.uni-swiper-dot-active {
    background-color: #fff !important;
  }
}

/* 分类导航滚动条隐藏 */
.category-nav::-webkit-scrollbar {
  display: none;
}
</style>