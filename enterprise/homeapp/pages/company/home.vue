<template>
  <view class="page">
 

    <!-- 主要内容 -->
    <scroll-view scroll-y class="content" @scrolltolower="loadMore" refresher-enabled @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <!-- 轮播图区域 -->
      <view class="banner-section" v-if="settings.show_banner">
        <swiper 
          class="banner-swiper" 
          :indicator-dots="true" 
          :autoplay="true"
          indicator-color="rgba(255,255,255,0.5)"
          indicator-active-color="#fff"
          v-if="banners.length > 0"
        >
          <swiper-item v-for="(banner, index) in banners" :key="banner.id">
            <view class="banner-item" @click="handleBannerClick(banner)">
              <image :src="banner.image_url" class="banner-bg" mode="aspectFill"></image>
            </view>
          </swiper-item>
        </swiper>
        
        <!-- 无轮播图时的默认内容 -->
        <view class="banner-item" v-if="banners.length === 0 && !loading">
          <image src="/static/banner1.jpg" class="banner-bg" mode="aspectFill"></image>
        </view>
      </view>

      <!-- 公司简介 -->
      <view class="intro-section" v-if="settings.show_about">
        <view class="section-header">
          <image :src="aboutInfo.logo_url" class="section-icon round" mode="aspectFit"></image>
          <text class="section-title">{{ aboutInfo.company_name }}</text>
        </view>
        <view class="intro-content">
          <text class="intro-text">{{ aboutInfo.description  }}</text>
        </view>
        <view class="more-link" @click="viewCompanyDetails">
          <text class="link-text">查看详情</text>
          <image src="/static/arrow-right.png" class="arrow-icon" mode="aspectFit"></image>
        </view>
      </view>

      <!-- 产品中心 -->
      <view class="product-section" v-if="settings.show_products">
        <view class="section-header-with-more">
          <text class="section-title-large">产品中心</text>
          <view class="more-link" @click="viewAllProducts">
            <text class="link-text-blue">查看全部</text>
            <image src="/static/arrow-right-blue.png" class="arrow-icon" mode="aspectFit"></image>
          </view>
        </view>
        
        <scroll-view class="product-grid-scroll" scroll-x v-if="products.length > 0" show-scrollbar="false" :style="'overflow:visible'">
          <view class="product-row">
            <view class="product-item" v-for="(product, idx) in products" :key="product.id" @click="viewProduct(product.id)" :style="idx !== products.length - 1 ? 'margin-right:20rpx' : ''">
              <image :src="product.thumb " class="product-image" mode="aspectFill"></image>
              <view class="product-info">
                <text class="product-title">{{ product.name }}</text>
                <text class="product-desc">{{ product.features }}</text>
                <text class="product-price" v-if="product.price">¥{{ product.price }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
        
      </view>

      <!-- 新闻动态 -->
      <view class="news-section" v-if="settings.show_articles">
        <view class="section-header-with-more">
          <text class="section-title-large">新闻动态</text>
          <view class="more-link" @click="viewAllNews">
            <text class="link-text-blue">查看全部</text>
            <image src="/static/arrow-right-blue.png" class="arrow-icon" mode="aspectFit"></image>
          </view>
        </view>

        <view class="news-list">
          <view class="news-item" v-for="(article, index) in validArticles" :key="index" @click="viewNews(article.id)">
            <view class="date-row">
              <text class="date-text">{{ $C.formatDateSmart(article.updated_at) }}</text>
            </view>
            <view class="news-main">
              <view class="news-content">
                <text class="news-title">{{ article.title }}</text>
                <text class="news-desc">{{ article.summary || (article.content ? article.content.substring(0, 50) + '...' : '') }}</text>
              </view>
              <image :src="article.cover_image || '/static/news1.jpg'" class="news-image" mode="aspectFill"></image>
            </view>
          </view>
        </view> 
      </view>

      <!-- 成功案例 -->
      <view class="case-section" v-if="settings.show_cases">
        <view class="section-header-with-more">
          <text class="section-title-large">成功案例</text>
          <view class="more-link" @click="viewAllCases">
            <text class="link-text-blue">查看全部</text>
            <image src="/static/arrow-right-blue.png" class="arrow-icon" mode="aspectFit"></image>
          </view>
        </view>

        <view class="case-grid" v-if="cases.length > 0">
          <view class="case-item" v-for="caseItem in cases.slice(0, 4)" :key="caseItem.id" @click="viewCase(caseItem.id)">
            <image :src="caseItem.cover_image || '/static/case1.jpg'" class="case-image" mode="aspectFill"></image>
            <view class="case-info">
              <text class="case-title">{{ caseItem.title }}</text>
              <text class="case-desc">{{ caseItem.description || (caseItem.content ? caseItem.content.substring(0, 20) + '...' : '') }}</text>
            </view>
          </view>
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
      <!-- 联系我们 -->
      <view class="contact-section" v-if="settings.show_contact">
        <text class="section-title-large">联系我们</text>
        
        <view class="contact-list">
          <view class="contact-item">
            <image src="/static/icon/h1.png" class="contact-icon" mode="aspectFit"></image>
            <text class="contact-text">{{ contactInfo.address}}</text>
          </view>
          
          <view class="contact-item">
            <image src="/static/icon/h2.png" class="contact-icon" mode="aspectFit"></image>
            <text class="contact-text">{{ contactInfo.phone }}</text>
          </view>
          
          <view class="contact-item">
            <image src="/static/icon/h3.png" class="contact-icon" mode="aspectFit"></image>
            <text class="contact-text">{{ contactInfo.email }}</text>
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
    <TabBar :current="0" pagePath="/pages/company/home" />
  </view>
</template>

<script>
import { 
  getBanners, 
  getAbout, 
  getContact, 
  getProductList, 
  getHomepageArticleList, 
  getCaseList,
  getSettings,
  createPrivateRoom
} from '@/utils/api.js'
import TabBar from './components/TabBar.vue'

export default {
  components: {
    TabBar
  },
  // 页面配置
  onPullDownRefresh: true,
  enablePullDownRefresh: true,
  backgroundTextStyle: 'dark',
  
  data() {
    return {
      userInfo:uni.getStorageSync('$userinfo'),
      value2: 0,
      loading: false,
      refreshing: false,
      enterpriseId: null,
      networkError: false,
      
      // 数据状态
      banners: [],
      aboutInfo: {},
      contactInfo: {},
      products: [],
      articles: [],
      cases: [],
      companyInfo: {},
      settings: {
        show_banner: 1,
        show_about: 1,
        show_products: 1,
        show_articles: 1,
        show_cases: 1,
        show_contact: 1,
      },
      // 定时器
      
    }
  },
  
  computed: {
    // 过滤有效的文章数据
    validArticles() {
      return this.articles.filter(article => article && article.id)
    }
  },
  
  onLoad(options) {
     uni.hideBackButton && uni.hideBackButton();
    // 获取企业ID，可以从路由参数或用户信息中获取
    this.enterpriseId = options.enterpriseId || uni.getStorageSync('enterpriseId') 
    uni.setStorageSync('enterpriseId', this.enterpriseId)
    // 设置页面标题
    uni.setNavigationBarTitle({
      title: '企业主页'
    })
    
    this.checkNetworkStatus()
    this.loadPageData()
  },
  
  // onShow() {
  //   // 页面显示时刷新数据
  //   this.loadPageData()
  // },
  
  onPullDownRefresh() {
    // 下拉刷新
    this.onRefresh()
    uni.stopPullDownRefresh()
  },
  
  onReachBottom() {
    // 上拉加载更多
    this.loadMore()
  },

  
  methods: {
    // 加载页面数据
    async loadPageData() {
      this.loading = true
      this.networkError = false
      try {
        // 先尝试从缓存加载数据
        this.loadFromCache()
        // 1. 先加载设置
        await this.loadCompanySettings()
        // 2. 根据设置加载其他内容
        const tasks = []
        if (this.settings.show_banner) tasks.push(this.loadBanners())
        if (this.settings.show_about) tasks.push(this.loadAboutInfo())
        if (this.settings.show_contact) tasks.push(this.loadContactInfo())
        if (this.settings.show_products) tasks.push(this.loadProducts())
        if (this.settings.show_articles) tasks.push(this.loadArticles())
        if (this.settings.show_cases) tasks.push(this.loadCases())
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
        const cacheKey = `homepage_data_${this.enterpriseId}`
        const cachedData = uni.getStorageSync(cacheKey)
        if (cachedData) {
          const parsed = JSON.parse(cachedData)
          const { data, timestamp } = parsed
          const now = Date.now()
          // 缓存有效期5分钟
          if (data && now - timestamp < 5 * 60 * 1000) {
            this.banners = data.banners || []
            this.aboutInfo = data.aboutInfo || {}
            this.contactInfo = data.contactInfo || {}
            this.products = data.products || []
            this.articles = data.articles || []
            this.cases = data.cases || []
            this.companyInfo = data.companyInfo || {}
          }
        }
      } catch (error) {
        console.error('从缓存加载数据失败:', error)
      }
    },
    
    // 保存数据到缓存
    saveToCache() {
      try {
        const cacheKey = `homepage_data_${this.enterpriseId}`
        const cacheData = {
          data: {
            banners: this.banners,
            aboutInfo: this.aboutInfo,
            contactInfo: this.contactInfo,
            products: this.products,
            articles: this.articles,
            cases: this.cases,
            companyInfo: this.companyInfo,
          },
          timestamp: Date.now()
        }
        uni.setStorageSync(cacheKey, JSON.stringify(cacheData))
      } catch (error) {
        console.error('保存数据到缓存失败:', error)
      }
    },
    
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
    
    // 重试加载数据
    retryLoadData() {
      this.checkNetworkStatus()
      if (!this.networkError) {
        this.loadPageData()
      }
    },       
    // 加载轮播图
    async loadBanners() {
      try {
        const response = await getBanners({ enterprise_id: this.enterpriseId })
        if (response.code ===0 && response.data) {
          this.banners = response.data
        }
      } catch (error) {
        console.error('加载轮播图失败:', error)
        // 不显示错误提示，使用默认内容
      }
    },
    
    // 加载关于我们信息
    async loadAboutInfo() {
      try {
        const response = await getAbout({ enterpriseId: this.enterpriseId })
        if (response.code === 0 && response.data) {
          this.aboutInfo = response.data
        }
      } catch (error) {
        console.error('加载关于我们信息失败:', error)
        // 使用默认内容
      }
    },
    
    // 加载联系信息
    async loadContactInfo() {
      try {
        const response = await getContact({ enterpriseId: this.enterpriseId })
        if (response.code === 0 && response.data) {
          this.contactInfo = response.data
        }
      } catch (error) {
        console.error('加载联系信息失败:', error)
        // 使用默认内容
      }
    },
    
    // 加载产品列表
    async loadProducts() {
      try {
        const response = await getProductList({
          enterprise_id: this.enterpriseId,
          page: 1,
          page_size: 5,
          status: 1
        })
        if (response.code === 0 && response.data) {
          const rawProducts = response.data.data || response.data
          // 过滤掉无效的产品数据
          this.products = Array.isArray(rawProducts) ? rawProducts.filter(product => product && product.id) : []
        }
      } catch (error) {
        console.error('加载产品列表失败:', error)
        // 使用空数组作为默认值
        this.products = []
      }
    },
    
    // 加载文章列表
    async loadArticles() {
      try {
        const response = await getHomepageArticleList({
          enterprise_id: this.enterpriseId,
          page: 1,
          page_size:3,
          is_published: 1
        })
        if (response.code === 0 && response.data) {
          const rawArticles = response.data.data || response.data
          // 过滤掉无效的文章数据
          this.articles = Array.isArray(rawArticles) ? rawArticles.filter(article => article && article.id) : []
        }
      } catch (error) {
        console.error('加载文章列表失败:', error)
        // 使用空数组作为默认值
        this.articles = []
      }
    },
    
    // 加载案例列表
    async loadCases() {
      try {
        const response = await getCaseList({
          enterprise_id: this.enterpriseId,
          page: 1,
          page_size: 4,
          status: 1
        })
        if (response.code === 0 && response.data) {
          const rawCases = response.data.data || response.data
          // 过滤掉无效的案例数据
          this.cases = Array.isArray(rawCases) ? rawCases.filter(caseItem => caseItem && caseItem.id) : []
        }
      } catch (error) {
        console.error('加载案例列表失败:', error)
        // 使用空数组作为默认值
        this.cases = []
      }
    },
    
    // 加载公司设置信息
    async loadCompanySettings() {
      try {
        const response = await getSettings({ enterpriseId: this.enterpriseId })
        if (response.code === 0 && response.data) {
          this.companyInfo = response.data
          // 只取settings相关字段
          this.settings = {
            ...this.settings,
            ...response.data
          }
        }
      } catch (error) {
        console.error('加载公司设置失败:', error)
        // 使用默认内容
      }
    },
    
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true
      await this.loadPageData()
      this.refreshing = false
    },
    
    // 上拉加载更多
    loadMore() {
      // 这里可以实现分页加载更多功能
      // 可以在这里添加分页逻辑
      // this.loadMoreProducts()
      // this.loadMoreArticles()
      // this.loadMoreCases()
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },
    
    // 轮播图点击处理
    handleBannerClick(banner) {
      if (banner.link_url) {
        // 如果是外部链接
        if (banner.link_url.startsWith('http')) {
          uni.navigateTo({
            url: `/pages/webview/webview?url=${encodeURIComponent(banner.link_url)}`
          })
        } else {
          // 如果是内部页面
          uni.navigateTo({
            url: banner.link_url
          })
        }
      }
    },
    
    // 轮播图按钮点击处理
    handleBannerButton(banner) {
      if (banner.link_url) {
        // 如果是外部链接
        if (banner.link_url.startsWith('http')) {
          uni.navigateTo({
            url: `/pages/webview/webview?url=${encodeURIComponent(banner.link_url)}`
          })
        } else {
          // 如果是内部页面
          uni.navigateTo({
            url: banner.link_url
          })
        }
      }
    },

    
    viewCompanyDetails() {
      uni.navigateTo({
        url: '/pages/company/about'
      })
    },
    
    viewAllProducts() {
      uni.navigateTo({
        url: '/pages/company/products'
      })
    },
    
    viewProduct(id) {
      uni.navigateTo({
        url: `/pages/company/product_detail?id=${id}&enterpriseId=${this.enterpriseId}`
      })
    },
    
    viewAllNews() {
      uni.navigateTo({
        url: '/pages/company/news'
      })
    },
    
    viewNews(id) {
      uni.navigateTo({
        url: `/pages/company/news_detail?id=${id}&enterpriseId=${this.enterpriseId}`
      })
    },
    
    viewAllCases() {
      uni.navigateTo({
        url: '/pages/company/case'
      })
    },
    
    viewCase(id) {
      uni.navigateTo({
        url: `/pages/company/case_detail?id=${id}&enterpriseId=${this.enterpriseId}`
      })
    },
    
    showConsult() {
      uni.navigateTo({
        url: '/pages/company/contact'
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
        uni.navigateTo({ url: `/pages/chat/chat?room_id=${res.data.room_id}&room_name=${encodeURIComponent('企业咨询')}` })
      }else{
        uni.showToast({ title: res.msg || '错误，请重试', icon: 'none' })
      }
    },
    
    openOfficialAccount() {
      // 打开微信公众号二维码
      uni.navigateTo({
        url: '/pages/qrcode/wechat'
      })
    },
    
    openApp() {
      // 打开APP下载页面
      uni.navigateTo({
        url: '/pages/download/app'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  background: #f5f5f5;
  min-height: 90vh;
}

.nav-left {
  display: flex;
  align-items: center;
  
  .logo {
    width: 52rpx;
    height: 52rpx;
    border-radius: 50%;
    margin-right: 16rpx;
  }
  
  .company-name {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
  }
}

.menu-icon {
  width: 48rpx;
  height: 48rpx;
}

.content {
  height:90vh;

}

// 轮播图区域
.banner-section {
  .banner-swiper {
    height: 400rpx;
    
    .banner-item {
      position: relative;
      width: 100%;
      height: 100%;
      
      .banner-bg {
        width: 100%;
        height: 100%;
      }
      
      .banner-content {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        padding: 0 60rpx;
        background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.1));
        
        .banner-title {
          font-size: 48rpx;
          font-weight: bold;
          color: #fff;
          margin-bottom: 20rpx;
        }
        
        .banner-desc {
          font-size: 28rpx;
          color: rgba(255,255,255,0.9);
          margin-bottom: 40rpx;
        }
        
        .banner-btn {
          background: #3D6AFF;
          border-radius: 40rpx;
          padding: 16rpx 40rpx;
          
          .btn-text {
            font-size: 28rpx;
            color: #fff;
            font-weight: 500;
          }
        }
      }
    }
  }
}

// 公司简介
 
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}
.section-icon {
  width: 60rpx;
  height: 60rpx;
  margin-right: 16rpx;
  border-radius: 50%;
}
.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}
.intro-content {
  margin-bottom: 30rpx;
}
.intro-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: #666;
}
.more-link {
  display: flex;
  align-items: center;
}
.link-text {
  font-size: 28rpx;
  color: #3D6AFF;
  margin-right: 8rpx;
}
.arrow-icon {
  width: 24rpx;
  height: 24rpx;
}
// 通用section样式
.intro-section,.product-section, .news-section, .case-section {
  padding: 20rpx 30rpx;
  margin-top: 20rpx;
  background-color: #fff;
}
.section-header-with-more {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20rpx 0;
}
.section-title-large {
  font-size: 32rpx; 
  color: #333;
}
.link-text-blue {
  font-size: 28rpx;
  color: #3D6AFF;
  margin-right: 0rpx;
}
// 产品中心横向滚动
.product-grid-scroll {
  overflow-x: auto;
  min-width: 100vw;
  padding-bottom: 10rpx;
  width: 100%;
  white-space: nowrap;
}
.product-row {
  display: flex;
  flex-direction: row;
}
.product-grid-scroll::-webkit-scrollbar {
  display: none;
}
.product-item {
  flex: 0 0 60vw;
  width: 60vw;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  .product-image {
      width: 100%;
      height: 300rpx;
      object-fit: cover;
    }
    
    .product-info {
  
      padding: 20rpx;
    }
    .product-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 8rpx;
      display: block;
    }
    
    .product-desc {
      font-size: 24rpx;
      color: #999;
      display: block;
      margin-bottom: 8rpx;
    }
    
    .product-price {
      font-size: 26rpx;
      color: #ff4757;
      font-weight: 600;
      display: block;
    }
}
.product-item:last-child {
  margin-right: 0;
}

.product-grid {
  display: none;
}
 

// 新闻动态
.news-list {
  margin-bottom: 20rpx;
}
.news-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
}
.date-row {
  margin-bottom: 10rpx;
}
.news-main {
  display: flex;
  align-items: flex-start;
}
.news-date {
  flex-shrink: 0;
  margin-right: 20rpx;
}
.date-text {
  font-size: 24rpx;
  color: #3D6AFF;
  background: rgba(61, 106, 255, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}
.news-content {
  flex: 1;
  margin-right: 20rpx;
}
.news-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.news-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.news-image {
  width: 120rpx;
  height: 80rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}
// 成功案例
.case-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  margin-bottom: 40rpx;
}
.case-item {
  width: calc(50% - 10rpx);
  margin-right: 0;
  box-sizing: border-box;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}
.case-item:last-child {
  margin-right: 0;
}
.case-image {
  width: 100%;
  height: 160rpx;
}
.case-info {
  padding: 20rpx 0;
}
.case-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.case-desc {
  font-size: 22rpx;
  color: #999;
  display: block;
}
.consult-btn {
  background: #3D6AFF;
  border-radius: 50rpx;
  padding: 10rpx;
  text-align: center;
  width: 240rpx;
  margin: 0 auto;
  .consult-text {
    font-size: 28rpx;
    color: #fff;
    font-weight: 500;
  }
}

// 联系我们
.contact-section {
  margin: 20rpx 30rpx;
  padding-bottom: 20rpx;
}

// 咨询区域
.consult-section {
  margin-bottom: 40rpx;
  padding-bottom: 40rpx;
  
  .consult-bg {
    background: linear-gradient(135deg, #3D6AFF 0%, #5B7CFF 100%);
    margin: 0 30rpx;
    border-radius: 20rpx;
    padding: 60rpx 40rpx;
    text-align: center;
    
    .consult-content {
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
}
.section-title-large {
  font-size: 32rpx; 
  color: #333;

}
.contact-list {
  margin: 40rpx 0;
}
.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}
.contact-icon {
  width:30rpx;
  height: 30rpx;
  margin-right: 20rpx;
}
.contact-text {
  font-size: 28rpx;
  color: #666;
  flex: 1;
}
.social-links {
  display: flex;
  justify-content: center;
  gap: 80rpx;
}
.social-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.social-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-bottom: 16rpx;
}
.social-text {
  font-size: 24rpx;
  color: #666;
}
// 加载状态
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

// 网络错误状态
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