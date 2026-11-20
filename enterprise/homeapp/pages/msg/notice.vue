<template>
    <view class="notice-page">
    
  
      <!-- 筛选标签 -->
      <view class="filter-tabs">
        <view 
          class="tab-item" 
          :class="{ active: activeTab === index }"
          v-for="(tab, index) in tabs" 
          :key="index"
          @click="switchTab(index)"
        >
          {{ tab.name }}
          <view class="tab-badge" v-if="tab.count > 0">{{ tab.count }}</view>
        </view>
      </view>
  
      <!-- 公告列表 -->
      <view class="notice-list">
        <!-- 加载状态 -->
        <view class="loading-container" v-if="loading">
          <u-loading-icon mode="spinner" size="40"></u-loading-icon>
          <text class="loading-text">加载中...</text>
        </view>
  
        <!-- 空状态 -->
        <view class="empty-container" v-else-if="noticeList.length === 0">
          <image src="/static/icon/empty.png" class="empty-icon"></image>
          <text class="empty-text">暂无系统公告</text>
        </view>
  
        <!-- 公告列表 -->
        <view v-else>
          <view 
            class="notice-item" 
            v-for="(item, index) in noticeList" 
            :key="index"
          >
            <view class="item-title">{{ item.title }}</view>
            <view class="item-time">{{ formatTime(item.created_at) }}</view>
            <view class="item-content" v-html="item.content"></view>
          </view>
        </view>
  

      </view>
    </view>
  </template>
  
  <script>
  import {
    getArticleCategories,
    getArticleList
  } from '@/utils/api.js';
  
  export default {
    data() {
      return {
        activeTab: 0,
        tabs: [
          { name: '全部', count: 0, id: null }
        ],
        noticeList: [],
        loading: false,
        totalCount: 0
      }
    },
    onLoad() {
      this.loadCategories();
    },
    onShow() {
      this.loadCategories();
    },
    onPullDownRefresh() {
      this.refreshData();
    },
    methods: {
      // 加载分类
      loadCategories() {
        getArticleCategories().then(res => {
          if (res.code === 0 && res.data) {
            // 构建tabs: 全部 + 各个分类
            this.tabs = [
              { name: '全部', count: 0, id: null },
              ...res.data.map(cat => ({ name: cat.name, count: 0, id: cat.id }))
            ];
            this.fetchNoticeList();
          } else {
            this.fetchNoticeList();
          }
        }).catch(err => {
          this.fetchNoticeList();
          uni.showToast({
            title: '获取分类失败',
            icon: 'none'
          });
        });
      },
      // 切换标签
      switchTab(index) {
        this.activeTab = index;
        this.noticeList = [];
        this.fetchNoticeList();
      },
      // 获取文章列表
      fetchNoticeList() {
        this.loading = true;
        
        const params = {};
        const currentTab = this.tabs[this.activeTab];
        
        // 根据标签筛选分类
        if (currentTab && currentTab.id) {
          params.category_id = currentTab.id;
        }
        
        getArticleList(params).then(res => {
          if (res.code === 0 && res.data) {
            const articles = res.data || [];
            const formattedList = articles.map(item => {
              return {
                id: item.id,
                title: item.name,
                content: item.content,
                created_at: item.create_time
              };
            });
            
            this.noticeList = formattedList;
            this.totalCount = articles.length;
            this.updateTabCounts();
          }
          this.loading = false;
        }).catch(err => {
          this.loading = false;
          uni.showToast({
            title: '获取文章失败',
            icon: 'none'
          });
        });
      },
      // 更新标签页计数
      updateTabCounts() {
        // 更新当前标签的计数
        if (this.activeTab === 0) {
          this.tabs[0].count = this.totalCount;
        }
      },

      // 刷新数据
      refreshData() {
        this.noticeList = [];
        this.loadCategories();
        uni.stopPullDownRefresh();
      },
      // 格式化时间
      formatTime(timestamp) {
        if (!timestamp) return '';
        
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}`;
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .notice-page {
    min-height: 100vh;
    background-color: #f5f6fa;
  }
  
  .page-header {
    background-color: #fff;
    padding: 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1rpx solid #eee;
    
    .header-title {
      font-size: 36rpx;
      font-weight: 500;
      color: #333;
    }
    
    .header-count {
      font-size: 28rpx;
      color: #999;
    }
  }
  
  .filter-tabs {
    display: flex;
    background-color: #fff;
    padding: 0 20rpx;
    border-bottom: 1rpx solid #eee;
    overflow-x: auto;
    
    .tab-item {
      padding: 20rpx 20rpx;
      font-size: 28rpx;
      color: #666;
      position: relative;
      display: flex;
      align-items: center;
      white-space: nowrap;
      
      &.active {
        color: #3D6AFF;
        border-bottom: 4rpx solid #3D6AFF;
      }
      
      .tab-badge {
        background-color: #ff4757;
        color: #fff;
        font-size: 20rpx;
        min-width: 24rpx;
        height: 24rpx;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 8rpx;
        padding: 0 6rpx;
      }
    }
  }
  
  .notice-list {
    padding: 20rpx;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    
    .loading-text {
      margin-top: 20rpx;
      font-size: 28rpx;
      color: #999;
    }
  }
  
  .empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    
    .empty-icon {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 20rpx;
    }
    
    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
  
  .notice-item {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .item-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 16rpx;
      line-height: 1.4;
    }
    
    .item-time {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 20rpx;
    }
    
    .item-content {
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
      word-break: break-all;
    }
  }
  

  </style>