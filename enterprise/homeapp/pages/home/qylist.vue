<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-box" @click="goToSearch">
        <u-icon name="search" size="28" color="#999"></u-icon>
        <text class="placeholder">搜索企业名称、行业、服务等</text>
      </view>
    </view>

    <!-- 分类选择 -->
    <view class="category-tabs">
      <view 
        class="tab-item" 
        v-for="(item, index) in categoryTabs" 
        :key="index"
        :class="{ active: currentTab === index }"
        @click="switchTab(index)"
      >
        <text class="tab-text">{{ item.name }}</text>
      </view>
    </view>

    <!-- 企业列表 -->
    <view class="company-list">
      <view 
        class="company-item" 
        v-for="(item, index) in companyList" 
        :key="index"
        @click="goToCompanyDetail(item)"
      >
        <image class="company-logo" :src="item.logo || '/static/logo.png'" mode="aspectFill"></image>
        <view class="company-info">
          <view class="company-header">
            <text class="company-name">{{ item.name }}</text>
            <view class="company-tag" :class="item.tagClass">{{ item.typeName }}</view>
          </view>
          <text class="company-desc">{{ item.description || '暂无简介' }}</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="!loading && companyList.length === 0">
        <text class="empty-title">暂无企业</text>
        <text class="empty-desc">换个筛选条件试试吧</text>
      </view>

      <!-- 加载状态 -->
      <view class="loading-container" v-if="loading">
        <u-loading-icon mode="spinner" size="40"></u-loading-icon>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 加载更多提示 -->
      <view class="load-more" v-if="!loading && companyList.length > 0">
        <text class="load-more-text">{{ hasMore ? '上拉加载更多' : '没有更多数据了' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getEntityInfoList } from '@/utils/api.js'

export default {
  data() {
    return {
      loading: false,
      currentPage: 1,
      pageSize: 10,
      hasMore: true,
      categoryTabs: [
        { name: '全部', type: 'all' },
        { name: '服务商', type: '7' },
        { name: '企业', type: '8' },
        { name: '协会', type: '9' },
        { name: '经纪人', type: '10' }
      ],
      currentTab: 0,
      companyList: []
    }
  },
  
  onLoad() {
    this.loadCompanyList(true)
  },
  
  onPullDownRefresh() {
    this.loadCompanyList(true)
  },
  
  onReachBottom() {
    if (!this.loading && this.hasMore) {
      this.loadCompanyList()
    }
  },
  
  methods: {
    // 切换分类标签
    switchTab(index) {
      if (this.currentTab === index) return
      this.currentTab = index
      this.loadCompanyList(true)
    }, 
    
    // 加载企业列表
    async loadCompanyList(reset = false) {
      if (reset) {
        this.currentPage = 1
        this.hasMore = true
      }
      
      if (!this.hasMore && !reset) return
      
      this.loading = true
      
      try {
        const type = this.categoryTabs[this.currentTab].type
        const params = {
          page: this.currentPage,
          page_size: this.pageSize
        }
        
        // 如果不是全部类型，添加role参数
        if (type !== 'all') {
          params.role = type
        }
        
        const response = await getEntityInfoList(params)
        
        if (response.code === 0 && response.data) {
          const newData = this.formatCompanyData(response.data)
          
          this.companyList = reset ? newData : [...this.companyList, ...newData]
          this.hasMore = newData.length >= this.pageSize
          
          if (newData.length > 0) {
            this.currentPage++
          }
        } else {
          uni.showToast({
            title: response.msg || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
        if (reset) {
          uni.stopPullDownRefresh()
        }
      }
    },
    
    // 格式化企业数据
    formatCompanyData(data) {
      if (!Array.isArray(data)) return []
      
      return data.map(item => {
        const role = String(item.role)
        return {
          id: item.id,
          entity_id: item.entity_id,
          name: item.name || '未命名',
          logo: item.logo || '/static/logo.png',
          type: role,
          description: item.descp || '暂无简介',
          tagClass: this.getTagClass(role),
          typeName: this.getTypeName(role)
        }
      })
    },
    
    // 获取企业类型名称
    getTypeName(type) {
      return this.$C.getRoleName(type)
    },
    
    // 获取标签样式类
    getTagClass(type) {
      switch (type) {
        case '7':
          return 'tag-enterprise'
        case '8':
          return 'tag-provider'
        case '9':
          return 'tag-association'
        case '10':
          return 'tag-broker'
        default:
          return ''
      }
    },
    
    // 跳转到搜索页面
    goToSearch() {
      uni.navigateTo({
        url: '/pages/home/search'
      })
    },
    
    // 跳转到企业详情页
    goToCompanyDetail(item) {
      let url = '' 
      
      switch (item.type) {
        case '8':
          url = `/pages/company/home?enterpriseId=${item.entity_id}`
          break
        case '7':
          url = `/pages/provider/home?id=${item.entity_id}`
          break
        case '9':
          url = `/pages/association/home?associationId=${item.entity_id}`
          break
        case '10':
          url = `/pages/company/home?enterpriseId=${item.entity_id}`
          break
        default:
          url = `/pages/company/home?enterpriseId=${item.entity_id}`
      }
      
      uni.navigateTo({ url })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 搜索栏 */
.search-bar {
  background-color: #fff;
  padding: 20rpx 30rpx;
  
  .search-box {
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 40rpx;
    padding: 16rpx 30rpx;
    
    .placeholder {
      font-size: 28rpx;
      color: #999;
      margin-left: 16rpx;
    }
  }
}

/* 分类标签 */
.category-tabs {
  display: flex;
  background-color: #fff;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .tab-item {
    position: relative;
    padding: 24rpx 0;
    margin-right: 60rpx;
    
    .tab-text {
      font-size: 30rpx;
      color: #666;
    }
    
    &.active {
      .tab-text {
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
        background-color: #3D6AFF;
        border-radius: 3rpx;
      }
    }
  }
}

/* 企业列表 */
.company-list {
  padding: 20rpx 30rpx;
  
  .company-item {
    display: flex;
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
    
    .company-logo {
      width: 120rpx;
      height: 120rpx;
      border-radius: 12rpx;
      margin-right: 24rpx;
      flex-shrink: 0;
    }
    
    .company-info {
      flex: 1;
      
      .company-header {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;
        
        .company-name {
          font-size: 30rpx;
          font-weight: 600;
          color: #333;
          margin-right: 16rpx;
        }
        
        .company-tag {
          font-size: 22rpx;
          padding: 4rpx 12rpx;
          border-radius: 6rpx;
          width: 100rpx;
          text-align: center;
          
          &.tag-enterprise {
            background-color: rgba(61, 106, 255, 0.1);
            color: #3D6AFF;
          }
          
          &.tag-provider {
            background-color: rgba(255, 87, 51, 0.1);
            color: #FF5733;
          }
          
          &.tag-association {
            background-color: rgba(76, 175, 80, 0.1);
            color: #4CAF50;
          }
          
          &.tag-broker {
            background-color: rgba(255, 152, 0, 0.1);
            color: #FF9800;
          }
        }
      }
      
      .company-desc {
        font-size: 28rpx;
        color: #666;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
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
  padding: 100rpx 40rpx;
  
  .empty-title {
    font-size: 32rpx;
    color: #333;
    margin-bottom: 16rpx;
    font-weight: 500;
  }
  
  .empty-desc {
    font-size: 28rpx;
    color: #999;
  }
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
  
  .loading-text {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #999;
  }
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 30rpx 0;
  
  .load-more-text {
    font-size: 26rpx;
    color: #999;
  }
}
</style>