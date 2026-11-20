<template>
    <view class="message-detail">
      <!-- 加载状态 -->
      <view class="loading-container" v-if="loading">
        <u-loading-icon mode="spinner" size="40"></u-loading-icon>
        <text class="loading-text">加载中...</text>
      </view>
  
      <!-- 消息详情 -->
      <view v-else-if="messageDetail" class="detail-container">
        <!-- 消息头部 -->
        <view class="message-header">
          <view class="header-left">
            <view class="message-icon" :class="iconClass">
              <image :src="getIconSrc()" class="icon-img"></image>
            </view>
            <view class="message-info">
              <text class="message-title">{{ messageDetail.title }}</text>
              <text class="message-time">{{ formatTime(messageDetail.created_at) }}</text>
            </view>
          </view>
          <view class="header-right">
            <view class="priority-tag" v-if="messageDetail.priority === 4">紧急</view>
            <view class="status-tag" v-if="!messageDetail.is_read">未读</view>
          </view>
        </view>
  
        <!-- 消息内容 -->
        <view class="message-content">
          <text class="content-text">{{ messageDetail.content }}</text>
        </view>
  
        <!-- 关联信息 -->
        <view class="related-info" v-if="messageDetail.related_id || messageDetail.related_type">
          <view class="info-title">关联信息</view>
          <view class="info-item">
            <text class="info-label">关联类型：</text>
            <text class="info-value">{{ getRelatedTypeName(messageDetail.related_type) }}</text>
          </view>
          <view class="info-item" v-if="messageDetail.related_id">
            <text class="info-label">关联ID：</text>
            <text class="info-value">{{ messageDetail.related_id }}</text>
          </view>
        </view>
  
        <!-- 操作按钮 -->
        <view class="action-buttons">
          <u-button 
            type="primary" 
            @click="markAsRead" 
            v-if="!messageDetail.is_read"
            :loading="markingRead"
          >
            标记为已读
          </u-button>
          <u-button 
            type="default" 
            @click="goToRelated" 
            v-if="messageDetail.related_id"
          >
            查看详情
          </u-button>
          <u-button 
            type="default" 
            @click="deleteMessage"
            :loading="deleting"
          >
            删除消息
          </u-button>
        </view>
      </view>
  
      <!-- 空状态 -->
      <view class="empty-container" v-else>
        <image src="/static/icon/empty.png" class="empty-icon"></image>
        <text class="empty-text">消息不存在或已删除</text>
        <u-button type="primary" @click="goBack">返回</u-button>
      </view>
    </view>
  </template>
  
  <script>
  import {
    getSystemNotificationList,
    getBusinessNotificationList,
    markSystemNotificationRead,
    markBusinessNotificationRead,
    deleteMessage
  } from '@/utils/api.js';
  import socketMixin from '@/mixins/socketMixin.js';

  
  export default {
    mixins: [socketMixin],
    data() {
      return {
        messageType: '',
        messageId: '',
        messageDetail: null,
        loading: true,
        markingRead: false,
        deleting: false
      }
    },
    computed: {
      // 计算图标样式类，避免模板中的方法调用
      iconClass() {
        return this.getIconClass();
      }
    },
    onLoad(options) {
      this.messageType = options.type || 'system';
      this.messageId = options.id;
      this.fetchMessageDetail();
      this.initSocketListeners();
    },
    methods: {
      // 初始化Socket监听器
      initSocketListeners() {
        // 监听消息更新事件
        this.socketOn('msg', this.handleMsgEvent);
        this.socketOn('notification', this.handleNotificationEvent);
        this.socketOn('system', this.handleSystemEvent);
      },

      // 处理消息事件
      handleMsgEvent(data) {
        console.log('收到消息事件:', data);
        
        // 如果是当前消息的更新，刷新消息详情
        if (data.message_id === this.messageId) {
          this.fetchMessageDetail();
        }
        
        // 显示通知
        uni.showToast({
          title: data.title || '收到新消息',
          icon: 'none',
          duration: 2000
        });
      },
      
      // 处理通知事件
      handleNotificationEvent(data) {
        console.log('收到通知事件:', data);
        
        // 处理通知相关逻辑
        if (data.type === 'update' && data.message_id === this.messageId) {
          this.fetchMessageDetail();
        }
      },
      
      // 处理系统事件
      handleSystemEvent(data) {
        console.log('收到系统事件:', data);
        
        // 处理系统级别的通知
        if (data.action === 'refresh') {
          this.fetchMessageDetail();
        } else if (data.action === 'logout') {
          uni.showModal({
            title: '系统通知',
            content: '您的登录状态已过期，请重新登录',
            showCancel: false,
            success: () => {
              uni.navigateTo({ url: '/pages/user/login' });
            }
          });
        }
      },

      // 获取消息详情
      fetchMessageDetail() {
        this.loading = true;
        
        if (this.messageType === 'system') {
          this.fetchSystemNotificationDetail();
        } else if (this.messageType === 'business') {
          this.fetchBusinessNotificationDetail();
        } else {
          this.loading = false;
        }
      },
      // 获取系统通知详情
      fetchSystemNotificationDetail() {
        getSystemNotificationList({ 
          page: 1, 
          page_size: 100 
        }).then(res => {
          if (res.data && res.data.msg === 'ok') {
            const notifications = res.data.data.notifications || [];
            this.messageDetail = notifications.find(item => item.id === this.messageId);
          }
          this.loading = false;
        }).catch(err => {
          console.error('获取系统通知详情失败:', err);
          this.loading = false;
        });
      },
      // 获取业务通知详情
      fetchBusinessNotificationDetail() {
        getBusinessNotificationList({ 
          page: 1, 
          page_size: 100 
        }).then(res => {
          if (res.data && res.data.msg === 'ok') {
            const notifications = res.data.data.notifications || [];
            this.messageDetail = notifications.find(item => item.id === this.messageId);
          }
          this.loading = false;
        }).catch(err => {
          console.error('获取业务通知详情失败:', err);
          this.loading = false;
        });
      },
      // 标记为已读
      markAsRead() {
        if (!this.messageDetail || this.messageDetail.is_read) return;
        
        this.markingRead = true;
        
        const markPromise = this.messageType === 'system' 
          ? markSystemNotificationRead({ notification_id: this.messageId })
          : markBusinessNotificationRead({ notification_id: this.messageId });
        
        markPromise.then(res => {
          if (res.data && res.data.msg === 'ok') {
            this.messageDetail.is_read = true;
            uni.showToast({
              title: '已标记为已读',
              icon: 'success'
            });
          }
          this.markingRead = false;
        }).catch(err => {
          console.error('标记已读失败:', err);
          uni.showToast({
            title: '操作失败',
            icon: 'error'
          });
          this.markingRead = false;
        });
      },
      // 删除消息
      deleteMessage() {
        uni.showModal({
          title: '确认删除',
          content: '确定要删除这条消息吗？',
          success: (res) => {
            if (res.confirm) {
              this.deleting = true;
              
              deleteMessage({ message_id: this.messageId }).then(res => {
                if (res.data && res.data.msg === 'ok') {
                  uni.showToast({
                    title: '删除成功',
                    icon: 'success'
                  });
                  setTimeout(() => {
                    this.goBack();
                  }, 1500);
                }
                this.deleting = false;
              }).catch(err => {
                console.error('删除消息失败:', err);
                uni.showToast({
                  title: '删除失败',
                  icon: 'error'
                });
                this.deleting = false;
              });
            }
          }
        });
      },
      // 跳转到关联详情
      goToRelated() {
        if (!this.messageDetail.related_id) return;
        
        const routes = {
          'order': `/pages/order/detail?id=${this.messageDetail.related_id}`,
          'product': `/pages/product/detail?id=${this.messageDetail.related_id}`,
          'service': `/pages/service/detail?id=${this.messageDetail.related_id}`,
          'audit': `/pages/audit/detail?id=${this.messageDetail.related_id}`
        };
        
        const route = routes[this.messageDetail.related_type];
        if (route) {
          uni.navigateTo({ url: route });
        } else {
          uni.showToast({
            title: '暂不支持此类型',
            icon: 'none'
          });
        }
      },
      // 获取图标样式类
      getIconClass() {
        const classMap = {
          'system': 'system-icon',
          'business': 'business-icon'
        };
        return classMap[this.messageType] || 'default-icon';
      },
      // 获取图标路径
      getIconSrc() {
        const iconMap = {
          'system': '/static/icon/icon3.png',
          'business': '/static/icon/icon4.png'
        };
        return iconMap[this.messageType] || '/static/icon/icon1.png';
      },
      // 获取关联类型名称
      getRelatedTypeName(type) {
        const typeMap = {
          'order': '订单',
          'product': '产品',
          'service': '服务',
          'audit': '审核'
        };
        return typeMap[type] || type || '未知';
      },
      // 格式化时间
      formatTime(time) {
        if (!time) return '';
        
        const date = new Date(time);
        return date.toLocaleString();
      },
      // 返回上一页
      goBack() {
        uni.navigateBack();
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .message-detail {
    min-height: 100vh;
    background-color: #f5f6fa;
    padding: 20rpx;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200rpx 0;
    
    .loading-text {
      margin-top: 20rpx;
      font-size: 28rpx;
      color: #999;
    }
  }
  
  .detail-container {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 40rpx;
    margin-bottom: 20rpx;
  }
  
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40rpx;
    
    .header-left {
      display: flex;
      align-items: flex-start;
      flex: 1;
      
      .message-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;
        
        &.system-icon {
          background-color: #e6f0ff;
        }
        
        &.business-icon {
          background-color: #fff3e6;
        }
        
        .icon-img {
          width: 40rpx;
          height: 40rpx;
        }
      }
      
      .message-info {
        flex: 1;
        
        .message-title {
          font-size: 32rpx;
          font-weight: 500;
          color: #333;
          line-height: 1.4;
          margin-bottom: 10rpx;
          display: block;
        }
        
        .message-time {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
    
    .header-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      
      .priority-tag {
        background-color: #ff4757;
        color: #fff;
        font-size: 20rpx;
        padding: 8rpx 16rpx;
        border-radius: 20rpx;
        margin-bottom: 10rpx;
      }
      
      .status-tag {
        background-color: #3D6AFF;
        color: #fff;
        font-size: 20rpx;
        padding: 8rpx 16rpx;
        border-radius: 20rpx;
      }
    }
  }
  
  .message-content {
    margin-bottom: 40rpx;
    
    .content-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
    }
  }
  
  .related-info {
    background-color: #f8f9fa;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 40rpx;
    
    .info-title {
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 20rpx;
    }
    
    .info-item {
      display: flex;
      margin-bottom: 10rpx;
      
      .info-label {
        font-size: 26rpx;
        color: #666;
        width: 120rpx;
      }
      
      .info-value {
        font-size: 26rpx;
        color: #333;
        flex: 1;
      }
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 20rpx;
    
    .u-button {
      flex: 1;
    }
  }
  
  .empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200rpx 0;
    
    .empty-icon {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 20rpx;
    }
    
    .empty-text {
      font-size: 28rpx;
      color: #999;
      margin-bottom: 40rpx;
    }
  }
  </style>