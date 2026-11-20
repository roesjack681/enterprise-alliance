<template>
    <view class="pending-page">
      <!-- 页面头部 -->
      <view class="page-header">
        <text class="header-title">待办事项，订单付款，服务工作流程管理</text>
        <text class="header-count" v-if="totalCount > 0">共{{ totalCount }}项</text>
      </view>
  
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
  
      <!-- 待办列表 -->
      <view class="pending-list">
        <!-- 加载状态 -->
        <view class="loading-container" v-if="loading">
          <u-loading-icon mode="spinner" size="40"></u-loading-icon>
          <text class="loading-text">加载中...</text>
        </view>
  
        <!-- 空状态 -->
        <view class="empty-container" v-else-if="pendingList.length === 0">
          <image src="/static/icon/empty.png" class="empty-icon"></image>
          <text class="empty-text">暂无待办事项</text>
        </view>
  
        <!-- 待办列表 -->
        <view v-else>
          <view 
            class="pending-item" 
            v-for="(item, index) in pendingList" 
            :key="index"
            @click="handlePendingClick(item)"
          >
            <view class="item-header">
              <view class="item-left">
                <view class="item-icon" :class="item.iconClass">
                  <image :src="getIconSrc(item.type)" class="icon-img"></image>
                </view>
                <view class="item-info">
                  <text class="item-title">{{ item.title }}</text>
                  <text class="item-time">{{ formatTime(item.created_at) }}</text>
                </view>
              </view>
              <view class="item-right">
                <view class="priority-tag" :class="item.priorityClass">
                  {{ getPriorityName(item.priority) }}
                </view>
                <view class="status-tag" :class="item.statusClass">
                  {{ getStatusName(item.status) }}
                </view>
              </view>
            </view>
            
            <view class="item-content">
              <text class="content-text">{{ item.content }}</text>
            </view>
            
            <view class="item-footer">
              <view class="footer-left">
                <text class="creator">发起人：{{ item.creator_name || '系统' }}</text>
                <text class="deadline" v-if="item.deadline">截止：{{ formatDeadline(item.deadline) }}</text>
              </view>
              <view class="footer-right">
                <u-button 
                  type="primary" 
                  size="mini" 
                  @click.stop="handlePending(item)"
                >
                  处理
                </u-button>
              </view>
            </view>
          </view>
        </view>
  

      </view>
    </view>
  </template>
  
  <script>
  import {
    getBusinessNotificationList,
    markBusinessNotificationRead
  } from '@/utils/api.js';
  
  export default {
    data() {
      return {
        activeTab: 0,
        tabs: [
          { name: '全部', count: 0 },
          { name: '待审核', count: 0 },
          { name: '待处理', count: 0 },
          { name: '已过期', count: 0 }
        ],
        pendingList: [],
        loading: false,
        totalCount: 0
      }
    },
    onLoad() {
      this.fetchPendingList();
    },
    onShow() {
      this.fetchPendingList();
    },
    onPullDownRefresh() {
      this.refreshData();
    },
    methods: {
      // 切换标签
      switchTab(index) {
        this.activeTab = index;
        this.pendingList = [];
        this.fetchPendingList();
      },
      // 获取待办列表
      fetchPendingList() {
        this.loading = true;
        
        const params = {
          is_read: false
        };
        
        // 根据标签筛选
        if (this.activeTab === 1) {
          params.type = 6; // 服务审核
        } else if (this.activeTab === 2) {
          params.type = 5; // 订单状态
        } else if (this.activeTab === 3) {
          // 已过期的逻辑
        }
        
        getBusinessNotificationList(params).then(res => {
          if (res.data && res.data.msg === 'ok') {
            const notifications = res.data.data.notifications || [];
            const formattedList = notifications.map(item => {
              const itemType = this.getNotificationType(item.type);
              const itemPriority = item.priority || 2;
              const itemStatus = item.status || 1;
              
              return {
                ...item,
                type: itemType,
                priority: itemPriority,
                status: itemStatus,
                // 预计算样式类，避免模板中的方法调用
                iconClass: this.getIconClass(itemType),
                priorityClass: this.getPriorityClass(itemPriority),
                statusClass: this.getStatusClass(itemStatus)
              };
            });
            
            this.pendingList = formattedList;
            this.totalCount = res.data.data.total || 0;
            this.updateTabCounts();
          }
          this.loading = false;
        }).catch(err => {
          console.error('获取待办列表失败:', err);
          this.loading = false;
        });
      },
      // 更新标签页计数
      updateTabCounts() {
        // 这里可以根据实际数据结构调整
        this.tabs[0].count = this.totalCount;
        this.tabs[1].count = this.pendingList.filter(item => item.type === 'audit').length;
        this.tabs[2].count = this.pendingList.filter(item => item.type === 'order').length;
        this.tabs[3].count = this.pendingList.filter(item => this.isExpired(item)).length;
      },
      // 判断是否过期
      isExpired(item) {
        if (!item.deadline) return false;
        return new Date(item.deadline) < new Date();
      },
      // 获取通知类型
      getNotificationType(type) {
        const typeMap = {
          5: 'order',
          6: 'audit',
          7: 'payment',
          8: 'review'
        };
        return typeMap[type] || 'other';
      },

      // 刷新数据
      refreshData() {
        this.pendingList = [];
        this.fetchPendingList();
        uni.stopPullDownRefresh();
      },
      // 处理待办点击
      handlePendingClick(item) {
        // 标记为已读
        this.markAsRead(item);
        
        // 跳转到相应页面
        this.navigateToDetail(item);
      },
      // 处理待办
      handlePending(item) {
        // 标记为已读
        this.markAsRead(item);
        
        // 跳转到处理页面
        this.navigateToProcess(item);
      },
      // 标记为已读
      markAsRead(item) {
        if (item.is_read) return;
        
        markBusinessNotificationRead({ notification_id: item.id }).then(() => {
          item.is_read = true;
          this.updateTabCounts();
        }).catch(err => {
          console.error('标记已读失败:', err);
        });
      },
      // 跳转到详情页
      navigateToDetail(item) {
        const routes = {
          'order': `/pages/order/detail?id=${item.related_id}`,
          'audit': `/pages/audit/detail?id=${item.related_id}`,
          'payment': `/pages/payment/detail?id=${item.related_id}`,
          'review': `/pages/review/detail?id=${item.related_id}`
        };
        
        const route = routes[item.type];
        if (route) {
          uni.navigateTo({ url: route });
        } else {
          uni.navigateTo({
            url: `/pages/msg/detail?type=business&id=${item.id}`
          });
        }
      },
      // 跳转到处理页面
      navigateToProcess(item) {
        const routes = {
          'order': `/pages/order/process?id=${item.related_id}`,
          'audit': `/pages/audit/process?id=${item.related_id}`,
          'payment': `/pages/payment/process?id=${item.related_id}`,
          'review': `/pages/review/process?id=${item.related_id}`
        };
        
        const route = routes[item.type];
        if (route) {
          uni.navigateTo({ url: route });
        } else {
          uni.showToast({
            title: '暂不支持此类型处理',
            icon: 'none'
          });
        }
      },
      // 获取图标样式类
      getIconClass(type) {
        const classMap = {
          'order': 'order-icon',
          'audit': 'audit-icon',
          'payment': 'payment-icon',
          'review': 'review-icon'
        };
        return classMap[type] || 'default-icon';
      },
      // 获取图标路径
      getIconSrc(type) {
        const iconMap = {
          'order': '/static/icon/icon6.png',
          'audit': '/static/icon/icon7.png',
          'payment': '/static/icon/icon8.png',
          'review': '/static/icon/icon9.png'
        };
        return iconMap[type] || '/static/icon/icon1.png';
      },
      // 获取优先级名称
      getPriorityName(priority) {
        const priorityMap = {
          1: '低',
          2: '中',
          3: '高',
          4: '紧急'
        };
        return priorityMap[priority] || '中';
      },
      // 获取优先级样式类
      getPriorityClass(priority) {
        const classMap = {
          1: 'priority-low',
          2: 'priority-medium',
          3: 'priority-high',
          4: 'priority-urgent'
        };
        return classMap[priority] || 'priority-medium';
      },
      // 获取状态名称
      getStatusName(status) {
        const statusMap = {
          1: '待处理',
          2: '处理中',
          3: '已完成'
        };
        return statusMap[status] || '待处理';
      },
      // 获取状态样式类
      getStatusClass(status) {
        const classMap = {
          1: 'status-pending',
          2: 'status-processing',
          3: 'status-completed'
        };
        return classMap[status] || 'status-pending';
      },
      // 格式化时间
      formatTime(time) {
        if (!time) return '';
        
        const date = new Date(time);
        return date.toLocaleString();
      },
      // 格式化截止时间
      formatDeadline(deadline) {
        if (!deadline) return '';
        
        const date = new Date(deadline);
        const now = new Date();
        const diff = date - now;
        
        if (diff < 0) {
          return '已过期';
        } else if (diff < 24 * 60 * 60 * 1000) {
          return '今天';
        } else if (diff < 2 * 24 * 60 * 60 * 1000) {
          return '明天';
        } else {
          return date.toLocaleDateString();
        }
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .pending-page {
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
    padding: 0 30rpx;
    border-bottom: 1rpx solid #eee;
    
    .tab-item {
      padding: 20rpx 30rpx;
      font-size: 28rpx;
      color: #666;
      position: relative;
      display: flex;
      align-items: center;
      
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
  
  .pending-list {
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
  
  .pending-item {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20rpx;
      
      .item-left {
        display: flex;
        align-items: flex-start;
        flex: 1;
        
        .item-icon {
          width: 80rpx;
          height: 80rpx;
          border-radius: 16rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 20rpx;
          
          &.order-icon {
            background-color: #e6f0ff;
          }
          
          &.audit-icon {
            background-color: #fff3e6;
          }
          
          &.payment-icon {
            background-color: #e6fff0;
          }
          
          &.review-icon {
            background-color: #ffe6e6;
          }
          
          .icon-img {
            width: 40rpx;
            height: 40rpx;
          }
        }
        
        .item-info {
          flex: 1;
          
          .item-title {
            font-size: 30rpx;
            font-weight: 500;
            color: #333;
            line-height: 1.4;
            margin-bottom: 8rpx;
            display: block;
          }
          
          .item-time {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
      
      .item-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10rpx;
        
        .priority-tag {
          font-size: 20rpx;
          padding: 8rpx 16rpx;
          border-radius: 20rpx;
          
          &.priority-low {
            background-color: #e6f0ff;
            color: #3D6AFF;
          }
          
          &.priority-medium {
            background-color: #fff3e6;
            color: #ff9500;
          }
          
          &.priority-high {
            background-color: #ffe6e6;
            color: #ff4757;
          }
          
          &.priority-urgent {
            background-color: #ff4757;
            color: #fff;
          }
        }
        
        .status-tag {
          font-size: 20rpx;
          padding: 8rpx 16rpx;
          border-radius: 20rpx;
          
          &.status-pending {
            background-color: #fff3e6;
            color: #ff9500;
          }
          
          &.status-processing {
            background-color: #e6f0ff;
            color: #3D6AFF;
          }
          
          &.status-completed {
            background-color: #e6fff0;
            color: #00c851;
          }
        }
      }
    }
    
    .item-content {
      margin-bottom: 20rpx;
      
      .content-text {
        font-size: 28rpx;
        color: #666;
        line-height: 1.5;
      }
    }
    
    .item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .footer-left {
        display: flex;
        flex-direction: column;
        gap: 8rpx;
        
        .creator,
        .deadline {
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .footer-right {
        .u-button {
          background-color: #3D6AFF;
        }
      }
    }
  }
  

  </style>