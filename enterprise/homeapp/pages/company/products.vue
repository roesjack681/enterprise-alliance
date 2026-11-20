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

      <!-- 精品推荐 -->
      <view class="recommend-section" v-if="recommendList.length > 0">
        <view class="section-title">
          <text class="title-text">精品推荐</text>
        </view>
        <swiper class="recommend-swiper" :indicator-dots="true" indicator-color="rgba(0,0,0,0.3)" indicator-active-color="#3D6AFF">
          <swiper-item v-for="(item, index) in recommendList" :key="item.id">
            <view class="recommend-item" @click="handleRecommendClick(item)">
              <image class="recommend-image" :src="item.thumb || '/static/images/product-default.jpg'" mode="aspectFill" @error="handleImageError"></image>
              <view class="recommend-overlay">
                <view class="recommend-tag" v-if="item.is_hot">热门产品</view>
                <view class="recommend-title">{{ item.name }}</view>
                <view class="recommend-desc">{{ item.features || item.description }}</view>
              </view>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <!-- 产品列表 -->
      <view class="product-section">
        <view class="section-header">
          <text class="section-title">产品列表</text>
          <view class="filter-btn" @click="showFilterModal = true">
            <text class="filter-text">筛选</text>
            <text class="iconfont icon-filter"></text>
          </view>
        </view>
        
        <!-- 产品网格 -->
        <view class="product-grid" v-if="productList.length > 0">
          <view 
            class="product-item" 
            v-for="item in productList" 
            :key="item.id"
            @click="handleProductClick(item)"
          >
            <image class="product-image" :src="item.thumb || '/static/images/product-default.jpg'" mode="aspectFill" @error="handleImageError"></image>
            <view class="product-info">
              <view class="product-title">{{ item.name }}</view>
              <view class="product-desc">{{ item.features || item.description }}</view>
              <view class="product-price" v-if="item.price">¥{{ item.price }}</view>
            </view>
            <view class="product-tag" v-if="item.is_hot">热门</view>
          </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="!loading && productList.length === 0">
          <image src="/static/images/empty-product.png" class="empty-icon" mode="aspectFit"></image>
          <text class="empty-title">暂无产品</text>
          <text class="empty-desc">敬请期待更多精彩产品</text>
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

    <!-- 筛选弹窗 -->
    <u-popup :show="showFilterModal" mode="bottom" border-radius="20" :safe-area-inset-bottom="true">
      <view class="filter-modal">
        <view class="filter-header">
          <text class="filter-title">产品筛选</text>
          <view class="filter-close" @click="showFilterModal = false">
            <text class="iconfont icon-close"></text>
          </view>
        </view>
        <view class="filter-content">
          <view class="filter-group">
            <text class="filter-group-title">产品分类</text>
            <view class="filter-options">
              <view 
                class="filter-option" 
                :class="{ active: filterCategory === item.id }"
                v-for="item in categoryList" 
                :key="item.id"
                @click="filterCategory = item.id"
              >
                <text class="filter-option-text">{{ item.name }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="filter-footer">
          <view class="filter-reset" @click="resetFilter">重置</view>
          <view class="filter-confirm" @click="applyFilter">确定</view>
        </view>
      </view>
    </u-popup>

    <!-- 底部导航 -->
    <TabBar :current="1" pagePath="/pages/company/products" />
  </view>
</template>

<script>
import { 
  getBanners, 
  getProductList, 
  getProductDetail,
  getHomePageCategory,
  createPrivateRoom
} from '@/utils/api.js'
import TabBar from './components/TabBar.vue'

export default {
  components: {
    TabBar,
    // 确保uView组件可用
    'u-popup': () => import('@/uview-ui/components/u-popup/u-popup')
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
      filterCategory: 'all',
      showFilterModal: false,
      
      // 数据
      banners: [],
      categoryList: [
        { id: 'all', name: '全部' }
      ],
      recommendList: [],
      productList: [],

    }
  },
  
  onLoad(options) {
    // 获取企业ID
    this.enterpriseId = options.enterpriseId || uni.getStorageSync('enterpriseId') || 1
    
    // 设置页面标题
    uni.setNavigationBarTitle({
      title: '产品中心'
    })
    
    this.checkNetworkStatus()
    this.loadPageData()
  },
  
  // 下拉刷新和上拉加载更多功能已移除
  onPullDownRefresh() {
    uni.stopPullDownRefresh()
  },
  
  onReachBottom() {
    // 上拉加载更多功能已移除
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
        // 并行加载数据
        const tasks = [
          this.loadBanners(),
          this.loadCategories(),
          this.loadProducts(true)
        ]
        
        await Promise.all(tasks)
        
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
    
    // 从缓存加载数据 - 已移除
    loadFromCache() {
      // 缓存功能已移除
    },
    
    // 保存数据到缓存 - 已移除
    saveToCache() {
      // 缓存功能已移除
    },
    
    // 加载轮播图
    async loadBanners() {
      try {
        const response = await getBanners({ 
          enterprise_id: this.enterpriseId,
          type: 'product' // 产品页面专用轮播图
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
          type: 'product'
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
    
    // 加载产品列表
    async loadProducts(reset = false) {
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
        
        const response = await getProductList(params)
        
        if (response.code === 0 && response.data) {
          // 确保我们获取到的是数组
          let newProducts = []
          
          if (response.data.data && Array.isArray(response.data.data)) {
            newProducts = response.data.data
          } else if (Array.isArray(response.data)) {
            newProducts = response.data
          } else {
            console.error('API返回的产品数据格式不正确:', response.data)
          }
          
          if (reset) {
            this.productList = newProducts
            // 设置推荐产品（取前3个热门产品）
            // 确保newProducts是数组
            if (Array.isArray(newProducts)) {
              this.recommendList = newProducts.filter(item => item.is_hot).slice(0, 3)
              // 按类型分类产品
              this.categorizeProducts(newProducts)
            } else {
              console.error('产品数据不是数组格式:', newProducts)
              this.recommendList = []
            }
          } else {
            this.productList = [...this.productList, ...newProducts]
          }
          
          // 检查是否还有更多数据
          this.hasMore = newProducts.length === this.pageSize
          if (this.hasMore) {
            this.currentPage++
          }
        }
      } catch (error) {
        console.error('加载产品列表失败:', error)
        throw error
      }
    },
    
    // 按类型分类产品 - 已简化
    categorizeProducts(products) {
      // 智能硬件相关代码已移除
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
        await this.loadProducts(false)
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
      
      this.activeCategory = categoryId
      this.loading = true
      
      try {
        await this.loadProducts(true)
      } finally {
        this.loading = false
      }
    },
    
    // 筛选相关方法
    resetFilter() {
      this.filterCategory = 'all'
    },
    
    async applyFilter() {
      this.activeCategory = this.filterCategory
      this.showFilterModal = false
      
      this.loading = true
      try {
        await this.loadProducts(true)
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
    
    handleRecommendClick(item) {
      this.handleProductClick(item)
    },
    
    handleProductClick(item) {
      uni.navigateTo({
        url: `/pages/company/product_detail?id=${item.id}&enterpriseId=${this.enterpriseId}`
      })
    },
    
    viewAllProducts() {
      
      // 已经在产品页面，可以滚动到产品列表区域
      uni.pageScrollTo({
        selector: '.product-section',
        duration: 300
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
        uni.navigateTo({ url: `/pages/chat/chat?room_id=${res.data.room_id}&room_name=${encodeURIComponent('产品咨询')}` })
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

<style lang="less" scoped>
.page {
  min-height: 90vh;
  background-color: #f5f5f5;
}

/* 主要内容 */
.main-content { 
  height:90vh;
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

/* 精品推荐 */
.recommend-section {
  padding: 40rpx 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
  
  .section-title {
    margin-bottom: 30rpx;
    
    .title-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }
  
  .recommend-swiper {
    height: 320rpx;
    
    .recommend-item {
      height: 100%;
      border-radius: 16rpx;
      overflow: hidden;
      position: relative;
      
      .recommend-image {
        width: 100%;
        height: 100%;
      }
      
      .recommend-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(transparent 40%, rgba(0, 0, 0, 0.6));
        padding: 30rpx;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        
        .recommend-tag {
          background: #3D6AFF;
          color: #fff;
          font-size: 24rpx;
          padding: 8rpx 16rpx;
          border-radius: 20rpx;
          align-self: flex-start;
          margin-bottom: 16rpx;
        }
        
        .recommend-title {
          font-size: 32rpx;
          font-weight: 600;
          color: #fff;
          margin-bottom: 12rpx;
        }
        
        .recommend-desc {
          font-size: 26rpx;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.4;
        }
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
  
  .more-btn, .filter-btn {
    display: flex;
    align-items: center;
    
    .more-text, .filter-text {
      font-size: 28rpx;
      color: #3D6AFF;
      margin-right: 8rpx;
    }
    
    .iconfont {
      font-size: 24rpx;
      color: #3D6AFF;
    }
  }
}

/* 产品列表 */
.product-section {
  background: #fff;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
  
  .product-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24rpx;
    
    .product-item {
      background: #f9f9f9;
      border-radius: 16rpx;
      overflow: hidden;
      position: relative;
      
      .product-image {
        width: 100%;
        height: 200rpx;
      }
      
      .product-info {
        padding: 24rpx 20rpx;
        
        .product-title {
          font-size: 28rpx;
          font-weight: 500;
          color: #333;
          margin-bottom: 12rpx;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .product-desc {
          font-size: 24rpx;
          color: #666;
          line-height: 1.4;
          margin-bottom: 8rpx;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .product-price {
          font-size: 26rpx;
          color: #ff4757;
          font-weight: 600;
        }
      }
      
      .product-tag {
        position: absolute;
        top: 16rpx;
        right: 16rpx;
        background: #ff4757;
        color: #fff;
        font-size: 20rpx;
        padding: 6rpx 12rpx;
        border-radius: 12rpx;
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

/* 解决方案 */
.solution-section {
  background: #fff;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
  
  .solution-list {
    .solution-item {
      display: flex;
      margin-bottom: 32rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .solution-image {
        width: 160rpx;
        height: 120rpx;
        border-radius: 12rpx;
        margin-right: 24rpx;
        flex-shrink: 0;
      }
      
      .solution-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        
        .solution-title {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
          margin-bottom: 12rpx;
        }
        
        .solution-desc {
          font-size: 26rpx;
          color: #666;
          line-height: 1.4;
          margin-bottom: 16rpx;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .solution-more {
          font-size: 26rpx;
          color: #3D6AFF;
        }
      }
    }
  }
}

/* 智能硬件部分已移除 */

/* 咨询区域 */
.consult-section {
  margin-bottom: 40rpx;
  padding-bottom:40rpx;
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

/* 筛选弹窗 */
.filter-modal {
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 40rpx;
    border-bottom: 1rpx solid #eee;
    
    .filter-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
    
    .filter-close {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .iconfont {
        font-size: 32rpx;
        color: #999;
      }
    }
  }
  
  .filter-content {
    padding: 40rpx;
    max-height: 60vh;
    overflow-y: auto;
    
    .filter-group {
      margin-bottom: 40rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .filter-group-title {
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 24rpx;
      }
      
      .filter-options {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;
        
        .filter-option {
          padding: 16rpx 32rpx;
          background: #f5f5f5;
          border-radius: 40rpx;
          border: 2rpx solid transparent;
          
          .filter-option-text {
            font-size: 28rpx;
            color: #666;
          }
          
          &.active {
            background: rgba(61, 106, 255, 0.1);
            border-color: #3D6AFF;
            
            .filter-option-text {
              color: #3D6AFF;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
  
  .filter-footer {
    display: flex;
    padding: 30rpx 40rpx;
    border-top: 1rpx solid #eee;
    gap: 20rpx;
    
    .filter-reset {
      flex: 1;
      height: 88rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 44rpx;
      font-size: 30rpx;
      color: #666;
    }
    
    .filter-confirm {
      flex: 2;
      height: 88rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #3D6AFF;
      border-radius: 44rpx;
      font-size: 30rpx;
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