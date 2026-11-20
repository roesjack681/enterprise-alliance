<template>
  <view class="container"> 
    <view class="content">
      <!-- 全部服务 -->
      <view v-for="item in list" :key="item.id" class="service-section">
        <view class="section-header" @click="toggleSection(item.id)">
          <view class="section-title active">
            <view class="title-line"></view>
            <text class="title-text">{{item.name}}</text>
          </view>
          <u-icon :name="item.isExpanded? 'arrow-up' : 'arrow-down'" size="32" color="#999"></u-icon>
        </view>
        
        <view v-if="item.isExpanded"  class="service-grid">
          <view class="service-item" v-for="it in item.children" :key="it.id" @click="handleService(it)">
            <view class="service-icon" :style="{ backgroundColor: it.bgColor }">
              <image :src="it.icon" class="icon-img"></image>
            </view>
            <text class="service-name">{{ it.name }}</text>
          </view>
        </view>
      </view>

    </view>
  </view>
</template>

<script>
import {getCategory} from "@/utils/api"
export default {
  data() {
    return {     
      list: [],     
    }
  },
  onLoad() {
    this.getCategory()
  },
  methods: {
    getCategory() {
      getCategory().then(res => {
        this.list = res.data
      })
    },
    toggleSection(section) {
     this.list.forEach(item => {
      if(item.id === section) {
        item.isExpanded = !item.isExpanded
      }
     })
    },
    // ... existing code ...
    handleService(it) {
      uni.setStorageSync('categoryParams', { pid: it.pid, tid: it.id })
      uni.switchTab({
        url: '/pages/service/list'
      })
    } 
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  background-color: #f8f9fa;
} 
.search-icon {
  padding-right: 32rpx;
} 
.content {
  height: calc(100% - 88rpx);
  padding: 0 32rpx;
}

.service-section {
  margin-bottom: 0rpx;
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx 0;
    
    .section-title {
      display: flex;
      align-items: center;
      
      .title-line {
        width: 8rpx;
        height: 32rpx;
        background-color: #007AFF;
        margin-right: 16rpx;
        border-radius: 4rpx;
        
        &.gray {
          background-color: #D1D5DB;
        }
      }
      
      .title-text {
        font-size: 28rpx;
       
        color: #333;
        
        &.gray {
          color: #9CA3AF;
        }
      }
    }
  }
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32rpx;
  padding: 20rpx 0;
  border-radius: 20rpx;
   background-color: #fff;
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 16rpx;
  background-color: #fff;

  .service-icon {
    width: 96rpx;
    height: 96rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16rpx;
    
    .icon-img {
      width: 96rpx;
      height: 96rpx;
    }
  }
  
  .service-name {
    font-size: 24rpx;
    color: #333;
    text-align: center;
    line-height: 1.4;
  }
}

// uview样式覆盖
::v-deep .u-navbar {
  .u-navbar-inner {
    padding: 0 32rpx;
  }
  
  .u-navbar-content-title {
    font-size: 36rpx;
    font-weight: 600;
  }
}
</style>