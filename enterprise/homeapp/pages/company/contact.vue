<template>
  <view class="page">
    <!-- 主要内容 -->
    <scroll-view class="main-content" scroll-y="true" refresher-enabled @refresherrefresh="onRefresh" :refresher-triggered="refreshing">
      <!-- 联系我们标题 -->
      <view class="contact-title">
        <text class="title-text">联系我们</text>
      </view>
      
      <!-- 地址信息 -->
      <view class="contact-item" v-if="contactInfo && contactInfo.address" @click="openLocation">
        <view class="item-icon">
          <image src="/static/icon/h1.png" class="icon-image" mode="aspectFit"></image>
        </view>
        <view class="item-content">
          <text class="item-text">{{ contactInfo.address }}</text>
        </view>
      </view>
     
      
      <!-- 电话信息 -->
      <view class="contact-item" v-if="contactInfo && contactInfo.phone" @click="makePhoneCall(contactInfo.phone)">
        <view class="item-icon">
          <image src="/static/icon/h2.png" class="icon-image" mode="aspectFit"></image>
        </view>
        <view class="item-content">
          <text class="item-text">{{ contactInfo.phone }}</text>
        </view>
      </view>
      
      <!-- 邮箱信息 -->
      <view class="contact-item" v-if="contactInfo && contactInfo.email" @click="sendEmail(contactInfo.email)">
        <view class="item-icon">
          <image src="/static/icon/h3.png" class="icon-image" mode="aspectFit"></image>
        </view>
        <view class="item-content">
          <text class="item-text">{{ contactInfo.email }}</text>
        </view>
      </view>
      
      <!-- 营业时间标题 -->
      <view class="business-hours-title">
        <text class="title-text">营业时间</text>
      </view>
      
      <!-- 营业时间信息 -->
      <view class="business-hours-content" v-if="contactInfo && contactInfo.work_time">
        <text class="hours-text">{{ formatWorkTime(contactInfo.work_time) }}</text>
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
import { getContact } from '@/utils/api.js'
 
export default {
  
  
  data() {
    return {
      loading: false,
      refreshing: false,
      networkError: false,
      enterpriseId: null,
      
      // 联系信息
      contactInfo: null,
      
      // 地图标记
      markers: [],
    }
  },
  
  onLoad(options) {
    // 获取企业ID
    this.enterpriseId = options.enterpriseId || uni.getStorageSync('enterpriseId') || 1
    
    // 设置页面标题
    uni.setNavigationBarTitle({
      title: '联系我们'
    })
    
    this.checkNetworkStatus()
    this.loadContactInfo()
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
    
    // 加载联系信息
    async loadContactInfo() {
      this.loading = true
      this.networkError = false
      
      try {
        const response = await getContact({ 
          enterpriseId: this.enterpriseId
        })
        
        if (response.code === 0 && response.data) {
          this.contactInfo = response.data
          
          // 设置地图标记
          if (this.contactInfo.latitude && this.contactInfo.longitude) {
            this.markers = [{
              id: 1,
              latitude: Number(this.contactInfo.latitude),
              longitude: Number(this.contactInfo.longitude),
              title: this.contactInfo.company_name || '公司位置',
              iconPath: '/static/images/marker.png',
              width: 32,
              height: 32
            }]
          }
        }
      } catch (error) {
        console.error('加载联系信息失败:', error)
        this.networkError = true
        uni.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 格式化工作时间
    formatWorkTime(workTime) {
      if (!workTime) return '';
      
      // 如果后端返回的是格式化好的工作时间，直接返回
      if (workTime.includes('周一') || workTime.includes('星期一')) {
        return workTime;
      }
      
      // 否则尝试格式化为设计图中的格式
      return '周一至周五: 9:00 - 18:00\n周六: 10:00 - 16:00\n周日: 休息';
    },
    
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true
      try {
        await this.loadContactInfo()
      } finally {
        this.refreshing = false
      }
    },
    
    // 重试加载数据
    retryLoadData() {
      this.checkNetworkStatus()
      if (!this.networkError) {
        this.loadContactInfo()
      }
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
  height: 90vh;
  padding: 30rpx;
}

/* 联系我们标题 */
.contact-title {
  margin-bottom: 40rpx;
  
  .title-text {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
  }
}

/* 联系项目通用样式 */
.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  
  .item-icon {
    width: 30rpx;
    height: 30rpx;
    margin-right: 20rpx;
    
    .icon-image {
      width: 100%;
      height: 100%;
    }
  }
  
  .item-content {
    flex: 1;
    
    .item-text {
      font-size: 30rpx;
      color: #666;
      line-height: 1.5;
    }
  }
}

/* 地图容器 */
.map-container {
  height: 300rpx;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  
  .map {
    width: 100%;
    height: 100%;
  }
}

/* 营业时间标题 */
.business-hours-title {
  margin-top: 60rpx;
  margin-bottom: 30rpx;
  
  .title-text {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
  }
}

/* 营业时间内容 */
.business-hours-content {
  .hours-text {
    font-size: 30rpx;
    color: #666;
    line-height: 2;
    white-space: pre-line;
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