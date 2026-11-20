<template>
  <view class="enterprise-homepage">
    <!-- 轮播图 -->
    <view v-if="settings.show_banner && banners.length > 0" class="banner-section">
      <u-swiper 
        :list="banners" 
        :autoplay="true" 
        :interval="3000"
        :duration="500"
        height="400rpx"
        @click="handleBannerClick"
      ></u-swiper>
    </view>

    <!-- 关于我们 -->
    <view v-if="settings.show_about && about" class="about-section">
      <view class="section-header">
        <text class="section-title">关于我们</text>
      </view>
      <view class="about-content">
        <view class="company-info">
          <image v-if="about.logo_url" class="company-logo" :src="about.logo_url" mode="aspectFit"></image>
          <view class="company-details">
            <text class="company-name">{{ about.company_name }}</text>
            <text class="company-desc">{{ about.description }}</text>
          </view>
        </view>
        
        <view class="company-values">
          <view class="value-item" v-if="about.vision">
            <text class="value-title">企业愿景</text>
            <text class="value-content">{{ about.vision }}</text>
          </view>
          <view class="value-item" v-if="about.mission">
            <text class="value-title">企业使命</text>
            <text class="value-content">{{ about.mission }}</text>
          </view>
          <view class="value-item" v-if="about.values">
            <text class="value-title">企业价值观</text>
            <text class="value-content">{{ about.values }}</text>
          </view>
        </view>
        
        <view class="company-history" v-if="about.history">
          <text class="history-title">发展历程</text>
          <text class="history-content">{{ about.history }}</text>
        </view>
        
        <view class="team-intro" v-if="about.team_intro">
          <text class="team-title">团队介绍</text>
          <text class="team-content">{{ about.team_intro }}</text>
        </view>
      </view>
    </view>

    <!-- 产品展示 -->
    <view v-if="settings.show_products && products.length > 0" class="products-section">
      <view class="section-header">
        <text class="section-title">产品服务</text>
        <text class="more-link" @click="goToProducts">查看更多</text>
      </view>
      <view class="products-grid">
        <view 
          class="product-card" 
          v-for="product in products.slice(0, 6)" 
          :key="product.id"
          @click="goToProductDetail(product)"
        >
          <image class="product-image" :src="product.image_urls[0]" mode="aspectFill"></image>
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <text class="product-desc">{{ product.description }}</text>
            <text class="product-price">{{ product.price_range }}</text>
            <view class="product-tags">
              <text v-for="tag in product.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 文章展示 -->
    <view v-if="settings.show_articles && articles.length > 0" class="articles-section">
      <view class="section-header">
        <text class="section-title">最新文章</text>
        <text class="more-link" @click="goToArticles">查看更多</text>
      </view>
      <view class="articles-list">
        <view 
          class="article-item" 
          v-for="article in articles.slice(0, 3)" 
          :key="article.id"
          @click="goToArticleDetail(article)"
        >
          <image class="article-image" :src="article.cover_image" mode="aspectFill"></image>
          <view class="article-info">
            <text class="article-title">{{ article.title }}</text>
            <text class="article-summary">{{ article.summary }}</text>
            <view class="article-meta">
              <text class="article-author">{{ article.author }}</text>
              <text class="article-views">{{ article.view_count }} 阅读</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 案例展示 -->
    <view v-if="settings.show_cases && cases.length > 0" class="cases-section">
      <view class="section-header">
        <text class="section-title">成功案例</text>
        <text class="more-link" @click="goToCases">查看更多</text>
      </view>
      <view class="cases-list">
        <view 
          class="case-item" 
          v-for="caseItem in cases.slice(0, 3)" 
          :key="caseItem.id"
          @click="goToCaseDetail(caseItem)"
        >
          <image class="case-image" :src="caseItem.image_urls[0]" mode="aspectFill"></image>
          <view class="case-info">
            <text class="case-title">{{ caseItem.title }}</text>
            <text class="case-client">客户：{{ caseItem.client_name }}</text>
            <text class="case-industry">行业：{{ caseItem.industry }}</text>
            <text class="case-desc">{{ caseItem.description }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 联系我们 -->
    <view v-if="settings.show_contact && contact" class="contact-section">
      <view class="section-header">
        <text class="section-title">联系我们</text>
      </view>
      <view class="contact-content">
        <view class="contact-info">
          <view class="contact-item" v-if="contact.contact_person">
            <u-icon name="account" size="32" color="#3D6AFF"></u-icon>
            <text class="contact-text">{{ contact.contact_person }}</text>
          </view>
          <view class="contact-item" v-if="contact.phone">
            <u-icon name="phone" size="32" color="#3D6AFF"></u-icon>
            <text class="contact-text" @click="makePhoneCall(contact.phone)">{{ contact.phone }}</text>
          </view>
          <view class="contact-item" v-if="contact.email">
            <u-icon name="email" size="32" color="#3D6AFF"></u-icon>
            <text class="contact-text">{{ contact.email }}</text>
          </view>
          <view class="contact-item" v-if="contact.address">
            <u-icon name="map-pin" size="32" color="#3D6AFF"></u-icon>
            <text class="contact-text">{{ contact.address }}</text>
          </view>
          <view class="contact-item" v-if="contact.website">
            <u-icon name="link" size="32" color="#3D6AFF"></u-icon>
            <text class="contact-text" @click="openWebsite(contact.website)">{{ contact.website }}</text>
          </view>
          <view class="contact-item" v-if="contact.wechat">
            <u-icon name="weixin-fill" size="32" color="#3D6AFF"></u-icon>
            <text class="contact-text">微信：{{ contact.wechat }}</text>
          </view>
          <view class="contact-item" v-if="contact.qq">
            <u-icon name="qq-fill" size="32" color="#3D6AFF"></u-icon>
            <text class="contact-text">QQ：{{ contact.qq }}</text>
          </view>
          <view class="contact-item" v-if="contact.work_time">
            <u-icon name="clock" size="32" color="#3D6AFF"></u-icon>
            <text class="contact-text">{{ contact.work_time }}</text>
          </view>
        </view>
        
        <!-- 地图 -->
        <view v-if="contact.latitude && contact.longitude" class="map-container">
          <map 
            :latitude="contact.latitude" 
            :longitude="contact.longitude"
            :markers="mapMarkers"
            style="width: 100%; height: 300rpx;"
          ></map>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getHomepage } from '@/utils/api'

export default {
  data() {
    return {
      enterpriseId: null,
      banners: [],
      about: null,
      contact: null,
      products: [],
      articles: [],
      cases: [],
      settings: {
        show_banner: true,
        show_about: true,
        show_products: true,
        show_articles: true,
        show_cases: true,
        show_contact: true
      },
      mapMarkers: []
    }
  },
  
  onLoad(options) {
    this.enterpriseId = parseInt(options.id) || 1
    this.loadHomepageData()
  },
  
  methods: {
    // 加载企业主页数据
    async loadHomepageData() {
      try {
        const res = await getHomepage(this.enterpriseId)
        if (res.data) {
          const data = res.data
          this.banners = data.banners || []
          this.about = data.about
          this.contact = data.contact
          this.products = data.products || []
          this.articles = data.articles || []
          this.cases = data.cases || []
          this.settings = data.settings || this.settings
          
          // 设置地图标记
          if (this.contact && this.contact.latitude && this.contact.longitude) {
            this.mapMarkers = [{
              id: 1,
              latitude: this.contact.latitude,
              longitude: this.contact.longitude,
              title: this.about?.company_name || '公司地址',
              iconPath: '/static/img/map-marker.png'
            }]
          }
        }
      } catch (error) {
        console.error('加载企业主页数据失败:', error)
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      }
    },
    
    // 轮播图点击
    handleBannerClick(index) {
      const banner = this.banners[index]
      if (banner.link_url) {
        // 处理轮播图链接跳转
        if (banner.link_url.startsWith('/pages/')) {
          uni.navigateTo({
            url: banner.link_url
          })
        } else {
          // 外部链接
          uni.navigateTo({
            url: `/pages/webview?url=${encodeURIComponent(banner.link_url)}`
          })
        }
      }
    },
    
    // 拨打电话
    makePhoneCall(phone) {
      uni.makePhoneCall({
        phoneNumber: phone
      })
    },
    
    // 打开网站
    openWebsite(website) {
      if (!website.startsWith('http')) {
        website = 'https://' + website
      }
      uni.navigateTo({
        url: `/pages/webview?url=${encodeURIComponent(website)}`
      })
    },
    
    // 跳转到产品列表
    goToProducts() {
      uni.navigateTo({
        url: `/pages/enterprise/products?enterprise_id=${this.enterpriseId}`
      })
    },
    
    // 跳转到产品详情
    goToProductDetail(product) {
      uni.navigateTo({
        url: `/pages/enterprise/product-detail?id=${product.id}`
      })
    },
    
    // 跳转到文章列表
    goToArticles() {
      uni.navigateTo({
        url: `/pages/enterprise/articles?enterprise_id=${this.enterpriseId}`
      })
    },
    
    // 跳转到文章详情
    goToArticleDetail(article) {
      uni.navigateTo({
        url: `/pages/enterprise/article-detail?id=${article.id}`
      })
    },
    
    // 跳转到案例列表
    goToCases() {
      uni.navigateTo({
        url: `/pages/enterprise/cases?enterprise_id=${this.enterpriseId}`
      })
    },
    
    // 跳转到案例详情
    goToCaseDetail(caseItem) {
      uni.navigateTo({
        url: `/pages/enterprise/case-detail?id=${caseItem.id}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.enterprise-homepage {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.banner-section {
  margin-bottom: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 400;
    color: #333;
  }
  
  .more-link {
    font-size: 28rpx;
    color: #3D6AFF;
  }
}

.about-section, .products-section, .articles-section, .cases-section, .contact-section {
  margin-bottom: 32rpx;
  background-color: #fff;
}

.about-content {
  padding: 32rpx;
  
  .company-info {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;
    
    .company-logo {
      width: 120rpx;
      height: 120rpx;
      border-radius: 12rpx;
      margin-right: 24rpx;
    }
    
    .company-details {
      flex: 1;
      
      .company-name {
        font-size: 32rpx;
        font-weight: 400;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .company-desc {
        font-size: 28rpx;
        color: #666;
        line-height: 1.5;
      }
    }
  }
  
  .company-values {
    margin-bottom: 32rpx;
    
    .value-item {
      margin-bottom: 24rpx;
      
      .value-title {
        font-size: 28rpx;
        font-weight: 400;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .value-content {
        font-size: 26rpx;
        color: #666;
        line-height: 1.5;
      }
    }
  }
  
  .company-history, .team-intro {
    margin-bottom: 24rpx;
    
    .history-title, .team-title {
      font-size: 28rpx;
      font-weight: 400;
      color: #333;
      margin-bottom: 8rpx;
    }
    
    .history-content, .team-content {
      font-size: 26rpx;
      color: #666;
      line-height: 1.5;
    }
  }
}

.products-grid {
  padding: 32rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  
  .product-card {
    background-color: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    
    .product-image {
      width: 100%;
      height: 200rpx;
    }
    
    .product-info {
      padding: 24rpx;
      
      .product-name {
        font-size: 28rpx;
        font-weight: 400;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .product-desc {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 12rpx;
        line-height: 1.4;
      }
      
      .product-price {
        font-size: 26rpx;
        color: #ff4444;
        font-weight: 400;
        margin-bottom: 12rpx;
      }
      
      .product-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8rpx;
        
        .tag {
          font-size: 20rpx;
          color: #3D6AFF;
          background: rgba(61, 106, 255, 0.1);
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
        }
      }
    }
  }
}

.articles-list, .cases-list {
  padding: 32rpx;
  
  .article-item, .case-item {
    display: flex;
    margin-bottom: 24rpx;
    
    .article-image, .case-image {
      width: 200rpx;
      height: 150rpx;
      border-radius: 12rpx;
      margin-right: 24rpx;
    }
    
    .article-info, .case-info {
      flex: 1;
      
      .article-title, .case-title {
        font-size: 28rpx;
        font-weight: 400;
        color: #333;
        margin-bottom: 8rpx;
        line-height: 1.4;
      }
      
      .article-summary, .case-desc {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 12rpx;
        line-height: 1.5;
      }
      
      .article-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .article-author, .case-client {
          font-size: 22rpx;
          color: #999;
        }
        
        .article-views {
          font-size: 22rpx;
          color: #3D6AFF;
        }
      }
      
      .case-industry {
        font-size: 22rpx;
        color: #999;
        margin-bottom: 8rpx;
      }
    }
  }
}

.contact-content {
  padding: 32rpx;
  
  .contact-info {
    margin-bottom: 32rpx;
    
    .contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 24rpx;
      
      .contact-text {
        font-size: 28rpx;
        color: #333;
        margin-left: 16rpx;
      }
    }
  }
  
  .map-container {
    border-radius: 16rpx;
    overflow: hidden;
  }
}
</style> 