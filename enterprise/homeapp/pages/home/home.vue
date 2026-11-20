<template>
  <view class="home-container">
    <!-- 下拉刷新 -->
    <scroll-view 
      class="scroll-container" 
      scroll-y="true" 
      refresher-enabled="true"
      @refresherrefresh="onRefresh"
    >
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-container" @click="goToSearch">
        <u-icon name="search" size="32" color="#999" class="search-icon"></u-icon>
        <text class="search-placeholder">搜索企业名称、行业、服务等</text>
      </view>
    </view>

    <!-- 轮播图 -->
    <view class="banner-section">
      <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500">
        <swiper-item v-for="(banner, index) in bannerList" :key="banner.id" @click="onBannerClick(banner)">
          <view class="banner-item">
            <image class="banner-bg" :src="banner.image" mode="aspectFill"></image>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-entry">
      <view class="entry-item" @click="goToAuth">
        <view class="entry-icon">
          <image class="img" src="/static/icon/home1.png" mode="aspectFit"></image>
        </view>
        <text class="entry-title">服务商入驻</text>
        <text class="entry-desc">一站式企业服务</text>
        <text class="entry-tag">热门</text>
      </view>
      <view class="entry-item" @click="goToAuth">
        <view class="entry-icon">
          <image class="img" src="/static/icon/home2.png" mode="aspectFit"></image>
        </view>
        <text class="entry-title">企业入驻</text>
        <text class="entry-desc">快速注册认证</text>
        <text class="entry-tag">推荐</text>
      </view>
      <view class="entry-item" @click="goToAuth">
        <view class="entry-icon">
          <image class="img" src="/static/icon/a3.png" mode="aspectFit"></image>
        </view>
        <text class="entry-title">经纪人入驻</text>
        <text class="entry-desc">专业经纪服务</text>
        <text class="entry-tag">撮合</text>
      </view>
    </view>

    <!-- 热门服务 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门服务</text>
        <view class="section-more" @click="goToHotServiceList">
          <text>查看全部</text>
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </view>
      <view class="service-grid">
        <view class="service-item" v-for="(service, index) in hotServices" :key="service.id" @click="goToServiceDetail(service)">
          <view class="service-icon">
            <image class="img" :src="service.images && service.images[0] ? service.images[0] : '/static/icon/default-service.png'" mode="aspectFit"></image>
          </view>
          <text class="service-title">{{ service.title }}</text>
          <text class="service-desc">{{ service.description }}</text>
          <text class="service-price">￥{{ service.price }}{{ service.unit ? '/' + service.unit : '' }}</text>
          <view class="service-stats">
            <text class="stat-item">{{ service.tag }}</text>
            <text class="stat-item">已售 {{ service.sales }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 本月推荐 -->
    <view class="section" v-if="activityConfig"> 
      <view class="recommend-card" @click="onActivityClick">
		  <view class="section-header">
		    <text class="section-title">本月推荐</text>
		    <view class="recommend-btn">
		      <text>{{activityConfig.button_text}}</text>
		    </view>
		  </view>
        <text class="recommend-title">{{activityConfig.title}}</text>
        <text class="recommend-desc">{{activityConfig.description}}</text>
        <text class="recommend-price">{{activityConfig.price}}</text>
        <view class="recommend-icon">
          <image class="img" :src="activityConfig.image" mode="aspectFit"></image>
        </view>
      </view>
    </view>

    <!-- 全部服务 -->
	
    <view class="section">
      <view class="section-header">
        <text class="section-title">全部服务</text>
        <view class="section-more" @click="goToMore('/pages/service/category')">
          <text>更多</text>
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </view>
      <view class="all-services">
        <view class="service-grid">
          <view class="service-cell" v-for="(item, index) in serviceCategories" :key="item.id" @click="goToService(item)">
            <view class="cell-icon">
             <image class="img" :src="item.icon || '/static/icon/default.png'" mode="aspectFit"></image>
            </view>
            <text class="cell-title">{{item.name}}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 推荐企业 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">推荐企业</text>
        <view class="section-more" @click="goToMore('/pages/home/qylist')">
          <text>更多</text>
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </view>
      <view class="enterprise-grid">
        <view class="enterprise-card" v-for="(item, index) in enterprises" :key="item.id" @click="goToEnterprise(item)">
          <view class="card-header">
            <image class="company-logo" :src="item.logo" mode="aspectFill"></image>
        </view>
          <view class="card-content">
            <view class="company-header">
              <text class="company-name">{{item.name}}</text>
              <view class="company-tag" :class="item.tagClass">{{item.typeName}}</view>
            </view>
            <text class="company-desc">{{item.desc}}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 行业资讯 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">行业资讯</text>
        <view class="section-more" @click="goToMore('/pages/home/newslist')">
          <text>更多</text>
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </view>
      <view class="news-list">
        <view class="news-item" v-for="(item, index) in newsList" :key="index" @click="goToNews(item)">
          <image class="news-image" :src="item.image" mode="aspectFill"></image>
          <view class="news-content">
            <text class="news-title">{{item.title}}</text>
            <text class="news-desc">{{item.desc}}</text>
            <view class="news-info">
              <text class="news-source">{{item.source}}</text>
              <text class="news-time">{{item.time}}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    </scroll-view>
  </view>
</template>

<script>
import {getCategory, getHomepageArticleList, getEntityInfoList, getServiceProductList, getHomeConfig} from "@/utils/api"

export default {
  data() {
    return {
      serviceCategories: [],
      enterprises: [],
      newsList: [],
      hotServices: [],
      bannerList: [],
      activityConfig: null
    }
  },
  onLoad(options) {
    if (options.inviteCode) {
      uni.setStorageSync('inviteCode', options.inviteCode);
    }
    this.loadAllData();
  },
  methods: {
    // 统一加载所有数据
    async loadAllData() {
      await Promise.all([
        this.loadServiceCategories(),
        this.loadLatestNews(),
        this.loadRecommendedEnterprises(),
        this.loadHotServices(),
        this.loadHomeConfig()
      ]);
    },

    // 加载服务分类数据
    async loadServiceCategories() {
      try {
        const response = await getCategory();
        if (response?.code === 0 && response.data) {
          this.serviceCategories = response.data.map(category => ({
            id: category.id,
            name: category.name,
            icon: category.icon || '/static/icon/default.png'
          }));
        }
      } catch (error) {
        // 静默处理
      }
    },

    // 加载最新新闻数据
    async loadLatestNews() {
      try {
        const response = await getHomepageArticleList({
          page: 1,
          page_size: 5,
          is_published: 1,
          order_by: 'created_at',
          order_type: 'desc'
        });
        
        if (response?.code === 0 && response.data) {
          const articles = response.data.data || response.data || [];
          this.newsList = articles.map(article => ({
            id: article.id,
            title: article.title,
            desc: article.summary || article.content?.substring(0, 80) + '...' || '暂无描述',
            source: article.enterprise_name,
            time: this.formatDate(article.created_at * 1000),
            image: article.cover_image || '/static/img/news1.png',
            enterprise_id: article.enterprise_id
          }));
        }
      } catch (error) {
        // 静默处理
      }
    },

    // 加载推荐企业数据
    async loadRecommendedEnterprises() {
      try {
        const response = await getEntityInfoList({
          page: 1,
          page_size: 5
        });
        
        if (response?.code === 0 && response.data) {
          this.enterprises = response.data.map(item => {
            const role = String(item.role || '7');
            return {
              id: item.id,
              entity_id: item.entity_id,
              name: item.name || '未命名企业',
              desc: item.descp || '暂无简介',
              logo: item.logo || '/static/img/about.png',
              type: role,
              typeName: this.getTypeName(role),
              tagClass: this.getTagClass(role)
            };
          });
        }
      } catch (error) {
        // 静默处理
      }
    },

    // 获取企业类型名称
    getTypeName(type) {
      const typeMap = {
        '7': '服务商',
        '8': '企业',
        '9': '协会',
        '10': '经纪人'
      };
      return typeMap[type] || '企业';
    },

    // 获取标签样式类
    getTagClass(type) {
      const classMap = {
        '7': 'tag-enterprise',
        '8': 'tag-provider', 
        '9': 'tag-association',
        '10': 'tag-broker'
      };
      return classMap[type] || 'tag-enterprise';
    },

    // 跳转到企业详情
    goToEnterprise(item) {
      let url = '';
      
      switch (item.type) {
        case '8':
          url = `/pages/company/home?enterpriseId=${item.entity_id}`;
          break;
        case '7':
          url = `/pages/provider/home?id=${item.entity_id}`;
          break;
        case '9':
          url = `/pages/association/home?associationId=${item.entity_id}`;
          break;
        case '10':
          url = `/pages/company/home?enterpriseId=${item.entity_id}`;
          break;
        default:
          url = `/pages/company/home?enterpriseId=${item.entity_id}`;
      }
      
      uni.navigateTo({ url });
    },

    // 加载热门服务数据
    async loadHotServices() {
      try {
        const response = await getServiceProductList({
          page: 1,
          page_size: 6,
          sort_by: 'favorite_count',
          sort_order: 'desc'
        });
        
        if (response?.code === 0 && response.data?.list) {
          this.hotServices = response.data.list.map(item => {
            let images = ['/static/icon/default-service.png'];
            try {
              const parsed = JSON.parse(item.images);
              if (parsed?.length > 0) images = parsed;
            } catch (e) {}
            
            const count = item.favorite_count || 0;
            const tag = count > 100 ? '热销' : count > 50 ? '优选' : '新品';
            
            return {
              id: item.id,
              title: item.title || '服务名称',
              description: item.description || '专业服务',
              price: item.price || '0',
              unit: item.unit || '次',
              images,
              tag,
              sales: count
            };
          });
        }
      } catch (error) {
        // 静默处理
      }
    },

    // 加载首页配置数据（轮播图和活动）
    async loadHomeConfig() {
      // 先加载缓存
      try {
        const cachedBanners = uni.getStorageSync('home_banner_list');
        const cachedActivity = uni.getStorageSync('home_activity_config');
        if (cachedBanners) this.bannerList = cachedBanners;
        if (cachedActivity) this.activityConfig = cachedActivity;
      } catch (e) {}
      
      // 然后更新数据
      try {
        const response = await getHomeConfig({ ids: [3, 4] });
        
        if (response?.code === 0 && response.data?.length > 0) {
          // 处理轮播图配置
          const bannerConfig = response.data.find(item => item.id === 3);
          if (bannerConfig?.json) {
            try {
              const data = typeof bannerConfig.json === 'string' ? JSON.parse(bannerConfig.json) : bannerConfig.json;
              if (data.status === 1 && data.image) {
                this.bannerList = [{
                  id: 1,
                  image: data.image,
                  title: data.title || '',
                  subtitle: data.subtitle || '',
                  link: data.link || ''
                }];
                uni.setStorageSync('home_banner_list', this.bannerList);
              }
            } catch (e) {}
          }
          
          // 处理首页活动配置
          const activityConfig = response.data.find(item => item.id === 4);
          if (activityConfig?.json) {
            try {
              const data = typeof activityConfig.json === 'string' ? JSON.parse(activityConfig.json) : activityConfig.json;
              if (data.status === 1) {
                this.activityConfig = {
                  image: data.image || '/static/icon/serv4.png',
                  title: data.title || '企业全套服务包',
                  subtitle: data.subtitle || '',
                  description: data.description || '包含工商注册、财税代理、法律咨询等多项服务',
                  price: data.price || '￥5999起',
                  button_text: data.button_text || '限时抢购',
                  link: data.link || ''
                };
                uni.setStorageSync('home_activity_config', this.activityConfig);
              }
            } catch (e) {}
          }
        }
      } catch (error) {
        // 静默处理
      }
    },

    // 跳转到热门服务详情
    goToServiceDetail(service) {
      uni.navigateTo({
        url: `/pages/service/detail?id=${service.id}`
      });
    },

    // 跳转到热门服务列表
    goToHotServiceList() {
      // 清除可能存在的分类参数，确保显示热门服务
      uni.removeStorageSync('categoryParams');
      uni.switchTab({
        url: '/pages/service/list'
      });
    },

    // 跳转到搜索页面
    goToSearch() {
      uni.navigateTo({
        url: '/pages/home/search'
      })
    },
    
    // 跳转到认证页面
    goToAuth() {
      uni.navigateTo({
        url: '/pages/entity/auth'
      })
    },
    
    // 查看更多服务
    goToMore(url) {
      uni.navigateTo({
        url: url 
      });
    },
    goToService(item) {
      // 存储分类参数，跳转到服务列表页面
      uni.setStorageSync('categoryParams', { 
        pid: item.id, 
        tid: 0,
        categoryName: item.name 
      });
      uni.switchTab({
        url: '/pages/service/list'
      });
    },
    goToNews(item) {
      if (item.id && item.enterprise_id) {
        uni.navigateTo({
          url: `/pages/company/news_detail?id=${item.id}&enterpriseId=${item.enterprise_id}`
        });
      }
    },
    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      const diff = Date.now() - new Date(dateString);
      
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
      if (diff < 2592000000) return Math.floor(diff / 86400000) + '天前';
      
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },

    // 轮播图点击事件
    onBannerClick(banner) {
      if (!banner.link) return;
      
      const url = banner.link.startsWith('http') 
        ? `/pages/webview/webview?url=${encodeURIComponent(banner.link)}`
        : banner.link;
      uni.navigateTo({ url });
    },

    // 首页活动点击事件
    onActivityClick() {
      if (!this.activityConfig?.link) return;
      
      const url = this.activityConfig.link.startsWith('http')
        ? `/pages/webview/webview?url=${encodeURIComponent(this.activityConfig.link)}`
        : this.activityConfig.link;
      uni.navigateTo({ url });
    },

    // 下拉刷新事件
    async onRefresh() {
      try {
        uni.removeStorageSync('home_banner_list');
        uni.removeStorageSync('home_activity_config');
        await this.loadAllData();
        uni.showToast({ title: '刷新成功', icon: 'success' });
      } catch (error) {
        uni.showToast({ title: '刷新失败', icon: 'none' });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background: #f5f5f5;
  
  .scroll-container {
    height: 100vh;
  padding-bottom: 60rpx;
  }
}

/* 搜索栏 */
.search-bar {
  background: #fff;
  padding: 16rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.search-container {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
  height: 72rpx;
  box-sizing: border-box;
  
  .search-icon {
      margin-right: 16rpx;
    flex-shrink: 0;
  }
  
  .search-placeholder {
    font-size: 28rpx;
    color: #999;
    flex: 1;
  }
}

/* 轮播图 */
.banner-section {
  margin: 24rpx 32rpx;
  
  .banner-swiper {
    height: 360rpx;
    border-radius: 24rpx;
    overflow: hidden;
  }
  
  .banner-item {
    height: 100%;
    
    .banner-bg {
      width: 100%;
      height: 100%;
    }
  }
}

/* 快捷入口 */
.quick-entry {
  display: flex;
  gap: 16rpx;
  margin: 0 32rpx 32rpx;
  
  .entry-item {
    flex: 1;
    background: #fff;
    border-radius: 20rpx;
    padding: 24rpx 16rpx;
    position: relative;
    
    .entry-icon { 
      width: 80rpx;
      height: 80rpx;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16rpx;
      .img{
		  width: 80rpx;
		  height: 80rpx;
	  }
     
    }
    
    .entry-title {
      display: block;
      font-size: 26rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 6rpx;
      text-align: center;
    }
    
    .entry-desc {
		display: block;
      font-size: 22rpx;
      color: #999;
	  margin-bottom: 20rpx;
	  text-align: center;
	  line-height: 1.3;
    }
    
    .entry-tag {
      position: absolute;
      top: 16rpx;
      right: 16rpx;
      background:#e0e7fa ;
      color: #3D6AFF;
      font-size: 18rpx;
      padding: 4rpx 12rpx;
      border-radius: 16rpx;
    }
  }
}

/* 公共样式 */
.section {
  margin: 0 32rpx 32rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .section-title {
      font-size: 30rpx;
      font-weight: 400;
      color: #333;
    }
    
    .section-more {
      display: flex;
      align-items: center;
      color: #666;
      font-size: 28rpx;
      
      .img{
      		  width: 96rpx;
      		  height: 96rpx;
      }
    }
  }
}

/* 热门服务 */
.service-grid {
  display: flex;
  gap: 16rpx;
  overflow-x: auto;
  padding-bottom: 20rpx;
  padding-right: 32rpx;
  margin-bottom: 10rpx;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  .service-item {
    flex-shrink: 0;
    width: 320rpx;
    background: #fff;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 8rpx;
    text-align: left;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    
    .service-icon {
      width: 100%;
      height: 180rpx;
      border-radius: 16rpx;
      overflow: hidden;
      margin-bottom: 20rpx;
      background: #f8f9fa;
      
      .img{
      	width: 100%;
      	height: 100%;
      	object-fit: cover;
      }
    }
    
    .service-title {
      display: block;
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 8rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.3;
    }
    
    .service-desc {
      display: block;
      font-size: 24rpx;
      color: #666;
      margin-bottom: 12rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.4;
    }
    
    .service-price {
      display: block;
      font-size: 28rpx;
      font-weight: 600;
      color: #3D6AFF;
      margin-bottom: 12rpx;
    }
    
    .service-stats {
      display: flex;
      justify-content: flex-start;
      gap: 8rpx;
      
      .stat-item {
        font-size: 20rpx;
        color: #999;
        padding: 4rpx 12rpx;
        background: #f5f5f5;
        border-radius: 12rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100rpx;
      }
    }
  }
}

/* 本月推荐 */
.recommend-btn {
  background: linear-gradient(135deg, #3D6AFF, #5B7CFF);
  color: #fff;
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.recommend-card {
  background:#fff;
  border-radius: 24rpx;
  padding: 40rpx;
  position: relative;
  
  
  .recommend-title {
    display: block;
    font-size: 28rpx;
    font-weight: 400;
    line-height: 80rpx;
  }
  
  .recommend-desc {
    display: block;
    font-size: 28rpx;
    opacity: 0.9;
    margin-bottom: 20rpx;
    line-height: 1.6;
	color:#aaa;
	width: 70%;
  }
  
  .recommend-price {
	color: #3D6AFF;
    font-size: 28rpx;
    font-weight: 400;
  }
  
  .recommend-icon {
	
    position: absolute;
    right: 40rpx;
    top: 60%;
    transform: translateY(-50%);
    
    .img{
    	width: 160rpx;
    	height: 160rpx;
    }
  }
}

/* 全部服务 */
.all-services {
	background:#fff;
	border-radius: 24rpx;
	padding: 30rpx 20rpx;
	
  .service-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20rpx;
  }
  
  .service-cell {
    background: #fff;
    border-radius: 20rpx;
    padding: 24rpx 12rpx;
    text-align: center;
    
    .cell-icon {
      width: 60rpx;
      height: 60rpx; 
      border-radius: 50%;
      background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12rpx;
      
      .img{
      	width: 36rpx;
      	height: 36rpx;
      }
    }
    
    .cell-title {
      font-size: 24rpx;
      color: #333;
      line-height: 1.4;
      word-break: break-all;
    }
  }
}

/* 推荐企业 */
.enterprise-grid {
  background: #fff;
  border-radius: 24rpx;
  padding: 20rpx;
  
  .enterprise-card {
  display: flex;
    align-items: center;
    padding: 24rpx 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .card-header {
      margin-right: 20rpx;
      
      .company-logo {
        width: 80rpx;
        height: 80rpx;
        border-radius: 16rpx;
        flex-shrink: 0;
      }
    }
    
    .card-content {
    flex: 1;
      
      .company-header {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;
        
        .company-name {
          font-size: 30rpx;
          font-weight: 500;
          color: #333;
          margin-right: 16rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }
        
        .company-tag {
      font-size: 20rpx;
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
          flex-shrink: 0;
          
          &.tag-enterprise {
            background: rgba(61, 106, 255, 0.1);
            color: #3D6AFF;
          }
          
          &.tag-provider {
            background: rgba(255, 87, 51, 0.1);
            color: #FF5733;
          }
          
          &.tag-association {
            background: rgba(76, 175, 80, 0.1);
            color: #4CAF50;
          }
          
          &.tag-broker {
            background: rgba(255, 152, 0, 0.1);
            color: #FF9800;
          }
        }
      }
      
      .company-desc {
        font-size: 26rpx;
        color: #666;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }
}

/* 行业资讯 */
.news-list {
  .news-item {
    background: #fff;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    display: flex;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .news-image {
      width: 160rpx;
      height: 120rpx;
      border-radius: 12rpx;
      margin-right: 24rpx;
    }
    
    .news-content {
      flex: 1;
      
      .news-title {
        display: block;
        font-size: 26rpx;
        font-weight: 400;
        color: #333;
        margin-bottom: 12rpx;
        line-height: 1.4;
      }
      
      .news-desc {
        display: block;
        font-size: 24rpx;
        color: #999;
        margin-bottom: 16rpx;
        line-height: 1.5;
      }
      
      .news-info {
        display: flex;
        justify-content: space-between;
        
        .news-source,
        .news-time {
          font-size: 22rpx;
          color: #ccc;
        }
      }
    }
  }
}
 
/* 深度选择器样式 */
::v-deep .u-swiper__wrapper {
  border-radius: 24rpx;
}

::v-deep .uni-swiper-dot {
  background: rgba(255, 255, 255, 0.5) !important;
}

::v-deep .uni-swiper-dot-active {
  background: #fff !important;
}
</style>