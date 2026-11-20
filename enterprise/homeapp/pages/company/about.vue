<template>
  <view class="page">
    <!-- 返回按钮和分享按钮 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-back"></text>
      </view>
      <view class="share-btn" @click="shareCompany">
        <text class="iconfont icon-share"></text>
      </view>
    </view>
    
    <!-- 主要内容 -->
    <scroll-view class="main-content" scroll-y="true" refresher-enabled @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <!-- 公司封面图 -->
      <view class="cover-image">
        <image src="/static/img/about.png" mode="aspectFill"></image>
      </view>
      
      <!-- 关于我们标题 -->
      <view class="section-title">
        <text class="title-text">关于我们</text>
      </view>
      
      <!-- 公司介绍 -->
      <view class="content-section" v-if="aboutInfo.description">
        <text class="content-text">{{ aboutInfo.description }}</text>
      </view>
      
      <!-- 使命 -->
      <view class="section-title" v-if="aboutInfo.mission">
        <text class="title-text">使命</text>
      </view>
      <view class="content-section" v-if="aboutInfo.mission">
        <text class="content-text">{{ aboutInfo.mission }}</text>
      </view>
      
      <!-- 愿景 -->
      <view class="section-title" v-if="aboutInfo.vision">
        <text class="title-text">愿景</text>
      </view>
      <view class="content-section" v-if="aboutInfo.vision">
        <text class="content-text">{{ aboutInfo.vision }}</text>
      </view>
      
      <!-- 发展历程 -->
      <view class="section-title" v-if="aboutInfo.history">
        <text class="title-text">发展历程</text>
      </view>
      <view class="timeline-section" v-if="historyItems.length > 0">
        <view class="timeline-item" v-for="(item, index) in historyItems" :key="index">
          <view class="timeline-dot"></view>
          <view class="timeline-content">
            <text class="timeline-year">{{ item.year }}</text>
            <text class="timeline-text">{{ item.description }}</text>
          </view>
        </view>
      </view>
      
      <!-- 团队介绍 -->
      <view class="section-title" v-if="teamMembers.length > 0">
        <text class="title-text">团队介绍</text>
      </view>
      <view class="team-section" v-if="teamMembers.length > 0">
        <view class="team-member" v-for="(member, index) in teamMembers" :key="index">
          <image :src="member.avatar" class="member-avatar" mode="aspectFill"></image>
          <text class="member-name">{{ member.name }}</text>
          <text class="member-title">{{ member.position }}</text>
        </view>
      </view>
      
      <!-- 联系我们 -->
      <view class="contact-section">
        <view class="section-title">
          <text class="title-text">联系我们</text>
        </view>
        
        <!-- 地址 -->
        <view class="contact-item" v-if="contactInfo && contactInfo.address" @click="openLocation">
          <view class="item-icon">
            <image src="/static/icon/h1.png" class="contact-icon" mode="aspectFit"></image>
          </view>
          <view class="item-content">
            <text class="item-text">{{ contactInfo.address }}</text>
          </view>
        </view>
        
        <!-- 电话 -->
        <view class="contact-item" v-if="contactInfo && contactInfo.phone" @click="makePhoneCall(contactInfo.phone)">
          <view class="item-icon">
            <image src="/static/icon/h2.png" class="contact-icon" mode="aspectFit"></image>
          </view>
          <view class="item-content">
            <text class="item-text">{{ contactInfo.phone }}</text>
          </view>
        </view>
        
        <!-- 邮箱 -->
        <view class="contact-item" v-if="contactInfo && contactInfo.email" @click="sendEmail(contactInfo.email)">
          <view class="item-icon">
             <image src="/static/icon/h3.png" class="contact-icon" mode="aspectFit"></image>
          </view>
          <view class="item-content">
            <text class="item-text">{{ contactInfo.email }}</text>
          </view>
        </view>
      </view>
      
      <!-- 页脚 -->
      <view class="footer">
        <text class="footer-text">© 2023 {{ aboutInfo.company_name || '公司名称' }} 版权所有</text> 
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

    <!-- 底部导航 -->
    <TabBar :current="4" pagePath="/pages/company/about" />
  </view>
</template>

<script>
import { getAbout, getContact } from '@/utils/api.js'
import TabBar from './components/TabBar.vue'

export default {
  components: {
    TabBar
  },
  
  data() {
    return {
      loading: false,
      refreshing: false,
      networkError: false,
      enterpriseId: null,
      
      // 关于我们信息
      aboutInfo: {},
      
      // 联系信息
      contactInfo: {},
      
      // 团队成员（从team_intro解析）
      teamMembers: [],
      
      // 发展历程（从history解析）
      historyItems: []
    }
  },
  
  onLoad(options) {
    // 获取企业ID
    this.enterpriseId = options.enterpriseId || uni.getStorageSync('enterpriseId') || 1
    
    // 设置页面标题
    uni.setNavigationBarTitle({
      title: '关于我们'
    })
    
    this.checkNetworkStatus()
    this.loadPageData()
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
          this.loadAboutInfo(),
          this.loadContactInfo()
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
    
    // 加载关于我们信息
    async loadAboutInfo() {
      try {
        const response = await getAbout({ 
          enterpriseId: this.enterpriseId
        })
        
        if (response.code === 0 && response.data) {
          this.aboutInfo = response.data
          
          // 解析团队成员
          this.parseTeamMembers()
          
          // 解析发展历程
          this.parseHistory()
        }
      } catch (error) {
        console.error('加载关于我们信息失败:', error)
        throw error
      }
    },
    
    // 加载联系信息
    async loadContactInfo() {
      try {
        const response = await getContact({ 
          enterpriseId: this.enterpriseId
        })
        
        if (response.code === 0 && response.data) {
          this.contactInfo = response.data
        }
      } catch (error) {
        console.error('加载联系信息失败:', error)
        throw error
      }
    },
    
    // 解析团队成员
    parseTeamMembers() {
      if (!this.aboutInfo.team_intro) return
      
      try {
        // 尝试解析JSON格式的团队介绍
        if (typeof this.aboutInfo.team_intro === 'string' && this.aboutInfo.team_intro.startsWith('[')) {
          this.teamMembers = JSON.parse(this.aboutInfo.team_intro)
        } else {
          // 模拟团队成员数据
          this.teamMembers = [
            {
              name: '张明',
              title: '创始人 & CEO',
              avatar: '/static/images/team/avatar1.jpg'
            },
            {
              name: '李华',
              title: '技术总监',
              avatar: '/static/images/team/avatar2.jpg'
            },
            {
              name: '王秀',
              title: '产品经理',
              avatar: '/static/images/team/avatar3.jpg'
            },
            {
              name: '赵伟',
              title: '市场总监',
              avatar: '/static/images/team/avatar4.jpg'
            }
          ]
        }
      } catch (error) {
        console.error('解析团队成员失败:', error)
        this.teamMembers = []
      }
    },
    
    // 解析发展历程
    parseHistory() {
      if (!this.aboutInfo.history) return
      
      try {
        // 尝试解析JSON格式的发展历程
        if (typeof this.aboutInfo.history === 'string' && this.aboutInfo.history.startsWith('[')) {
          this.historyItems = JSON.parse(this.aboutInfo.history)
        } else {
          // 模拟发展历程数据
          this.historyItems = [
            { year: '2023', content: '成立上市，市值突破100亿元' },
            { year: '2020', content: '获得B轮融资1亿元，业务覆盖全国' },
            { year: '2018', content: '获得A轮融资3000万元，团队扩展到50人' },
            { year: '2015', content: '公司成立，获得天使轮投资' }
          ]
        }
      } catch (error) {
        console.error('解析发展历程失败:', error)
        this.historyItems = []
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
    
    // 重试加载数据
    retryLoadData() {
      this.checkNetworkStatus()
      if (!this.networkError) {
        this.loadPageData()
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1
      })
    },
    
    // 分享公司信息
    shareCompany() {
      uni.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      })
    },
    
    // 拨打电话
    makePhoneCall(phone) {
      
      uni.makePhoneCall({
        phoneNumber: phone,
        fail: () => {
          uni.showToast({
            title: '拨号失败',
            icon: 'none'
          })
        }
      })
    },
    
    // 发送邮件
    sendEmail(email) {
      
      // 复制邮箱到剪贴板
      uni.setClipboardData({
        data: email,
        success: () => {
          uni.showToast({
            title: '邮箱已复制',
            icon: 'success'
          })
        }
      })
    },
    
    // 打开地图导航
    openLocation() {
      if (!this.contactInfo || !this.contactInfo.latitude || !this.contactInfo.longitude) {
        return
      }
      
      
      uni.openLocation({
        latitude: Number(this.contactInfo.latitude),
        longitude: Number(this.contactInfo.longitude),
        name: this.aboutInfo.company_name || '公司位置',
        address: this.contactInfo.address || '',
        scale: 18,
        fail: () => {
          uni.showToast({
            title: '打开地图失败',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.page {
  min-height: 90vh;
  background-color: #ffffff;
}


/* 主要内容 */
.main-content { 
  height: 100%;
  padding-bottom: 120rpx;
}

/* 封面图 */
.cover-image {
  width: 100%;
  height: 400rpx;
  
  image {
    width: 100%;
    height: 100%;
  }
}

/* 标题样式 */
.section-title {
  padding: 40rpx 30rpx 20rpx;
  
  .title-text {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

/* 内容样式 */
.content-section {
  padding: 0 30rpx 30rpx;
  
  .content-text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
  }
}

/* 发展历程时间轴 */
.timeline-section {
  padding: 0 30rpx 40rpx;
  
  .timeline-item {
    display: flex;
    margin-bottom: 30rpx;
    position: relative;
    align-items: flex-start;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 10rpx;
      top: 30rpx;
      bottom: -20rpx;
      width: 2rpx;
      background-color: #e0e0e0;
    }
    
    .timeline-dot {
      width: 20rpx;
      height: 20rpx;
      background: #3D6AFF;
      border-radius: 50%;
      margin-right: 20rpx;
      margin-top: 10rpx;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
    }
    
    .timeline-content {
      flex: 1;
      padding: 0;
      
      .timeline-year {
        font-size: 28rpx;
        color: #3D6AFF;
        font-weight: bold;
        margin-bottom: 8rpx;
        display: block;
      }
      
      .timeline-text {
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
      }
    }
  }
}

/* 团队介绍 */
.team-section {
  padding: 20rpx 30rpx 40rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  
  .team-member {
    width: 160rpx;
    margin-bottom: 30rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .member-avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      margin-bottom: 16rpx;
    }
    
    .member-name {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
      margin-bottom: 8rpx;
    }
    
    .member-title {
      font-size: 24rpx;
      color: #999;
      text-align: center;
    }
  }
}

/* 联系我们 */
.contact-section {
  padding-bottom: 40rpx;
  
  .contact-item {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
    
    .item-icon {
      width: 30rpx;
      height: 30rpx;
      margin-right: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .iconfont {
        font-size: 36rpx;
        color: #3D6AFF;
      }
    }
    
    .item-content {
      flex: 1;
      
      .item-text {
        font-size: 28rpx;
        color: #666;
        line-height: 1.5;
      }
    }
  }
}

/* 页脚 */
.footer {
  padding: 40rpx 30rpx;
  text-align: center;
  border-top: 1rpx solid #f0f0f0;
  
  .footer-text {
    font-size: 24rpx;
    color: #999;
    line-height: 1.8;
    display: block;
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