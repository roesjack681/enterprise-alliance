<template>
  <view class="message-center">
    <!-- 快捷入口卡片 -->
    <view class="quick-cards">
      <view class="card-item" @click="goToPage('pending')">
        <view class="card-icon-bg bg-red">
          <image src="/static/icon/m1.png" class="card-icon"></image>
        </view>
        <text class="card-text">待办事项</text>
        <view class="badge" v-if="unreadCount.pending > 0">{{ unreadCount.pending }}</view>
      </view>
      <view class="card-item" @click="goToPage('audit')">
        <view class="card-icon-bg bg-blue">
          <image src="/static/icon/m2.png" class="card-icon"></image>
        </view>
        <text class="card-text">审批通知</text>
        <view class="badge" v-if="unreadCount.audit > 0">{{ unreadCount.audit }}</view>
      </view>
      <view class="card-item" @click="goToPage('notice')">
        <view class="card-icon-bg bg-orange">
          <image src="/static/icon/m3.png" class="card-icon"></image>
        </view>
        <text class="card-text">系统公告</text>
        <view class="badge" v-if="unreadCount.notice > 0">{{ unreadCount.notice }}</view>
      </view>
    </view>

    <!-- 企业通讯录 -->
    <view   class="contact-entry" @click="goToContacts">
      <view class="contact-left">
        <view class="contact-icon-bg">
          <image src="/static/icon/m4.png" class="contact-icon"></image>
        </view>
        <text class="contact-text">企业通讯录</text>
      </view>
      <u-icon class="arrow-icon" name="arrow-right" color="#999" size="28"></u-icon>
    </view>

    <!-- 消息列表 -->
    <view class="message-list">
      <!-- 加载状态 -->
      <view class="loading-container" v-if="loading">
        <u-loading-icon mode="spinner" size="40"></u-loading-icon>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view class="empty-container" v-else-if="roomList.length === 0">
        <image src="/static/icon/empty.png" class="empty-icon"></image>
        <text class="empty-text">暂无消息</text>
      </view>

      <!-- 消息列表 -->
      <view v-else>
        <!-- 紧急通知 -->
        <view class="message-item urgent" v-for="(item, index) in urgentMessages" :key="index" @click="handleMessageClick(item)">
          <view class="message-header">
            <text class="message-title">{{ item.title }}</text>
            <view class="urgent-tag">紧急</view>
          </view>
          <text class="message-content">{{ item.content }}</text>
          <view class="message-footer">
            <text class="message-time">{{ $C.formatDateSmart(item.created_at) }}</text>
            <text class="message-scope">{{ item.scope || '全体成员' }}</text>
          </view>
        </view>

        <!-- 普通消息 -->
        <view class="message-item" v-for="(item, index) in roomList" :key="index" @click="handleMessageClick(item)">
          <view class="message-user">
            <image v-if="item.avatar" :src="item.avatar" class="user-avatar"></image>
            <view v-else class="default-avatar" :class="item.avatarClass">
              <!-- 群聊显示"群"字，其他显示图标 -->
              <text v-if="item.isGroupChat && !item.avatar" class="group-text">群</text>
              <image v-else :src="getDefaultIcon(item.type)" class="default-icon"></image>
            </view>
            <view class="user-info">
              <text class="user-name">{{ item.sender_name || item.title }}{{ item.room_type==2?'群('+item.members.length+')':'' }} </text>
              <view class="unread-badge" v-if="item.unread_count > 0">{{ item.unread_count }}</view>
              <view class="status-tag" v-if="item.status === 'pending'">待处理</view>
            </view>
          </view>
          <view class="message-content">
            <text class="message-text">{{ item.content || item.last_message }}</text>
            <text class="message-time">{{ $C.formatDateSmart(item.last_message_time || (+new Date())) }}</text>
          </view>
        </view>

        <!-- 加载更多/没有更多 -->
        <view class="load-more" v-if="loadingMore">加载中...</view>
      </view>

      
    </view>
  </view>
</template>

<script>
import {
  getRoomList
} from '@/utils/api.js';

export default {
  data() {
    return {
      roomList: [],
      urgentMessages: [],
      unreadCount: {
        total: 0,
        pending: 0,
        audit: 0,
        notice: 0
      },
      loading: false,
      // 分页
      page: 1,
      pageSize: 20,
      totalPages: 1,
      loadingMore: false,
      noMore: false
    }
  },
  onLoad() {
    //this.resetAndFetch();
  },
  onShow() {
    // 页面显示时刷新数据
    this.resetAndFetch();
  },
  onPullDownRefresh() {
    // 下拉刷新
    this.refreshData();
  },
  onReachBottom() {
    // 触底加载更多
    this.loadMore();
  },
  methods: {
    // 刷新数据
    refreshData() {
      this.roomList = [];
      this.urgentMessages = [];
      this.page = 1;
      this.totalPages = 1;
      this.noMore = false;
      this.fetchConversations(true).then(() => {
        uni.stopPullDownRefresh();
      });
    },
    // 首次加载/显示时重置
    resetAndFetch() {
      this.roomList = [];
      this.page = 1;
      this.totalPages = 1;
      this.noMore = false;
      this.fetchConversations(true);
    },
    // 获取会话列表
    fetchConversations(reset = false) {
      const params = { page: this.page, page_size: this.pageSize };
      return getRoomList(params).then(res => {
       
        if (res.data && res.code ==0) {
          const rooms = (res.data.rooms) || [];
          this.totalPages = res.data.total_pages || 1;
          const userInfo = uni.getStorageSync('$userinfo') || {};
          const currentUserId = userInfo && userInfo.id != null ? String(userInfo.id) : '';
          const formattedList = rooms.map(item => {
            // 根据房间类型设置显示名称与头像
            let displayName = item.room_name || '群聊';
            let avatar = item.avatar || '';
            let isGroupChat = false;
            
            if (item.room_type === '1') {
              // 私聊房间：显示对方成员的昵称与头像
              const members = Array.isArray(item.members) ? item.members : [];
              const other = members.find(m => String(m.id) !== currentUserId);
              if (other) {
                displayName = other.nickname || other.name || displayName || '私聊';
                avatar = other.avatar || avatar;
              } else {
                displayName = displayName || '私聊';
              }
              isGroupChat = false;
            } else if (item.room_type === '2') {
              // 群聊房间
              displayName = item.room_name || '群聊';
              isGroupChat = true;
            }

            // 处理消息内容
            let messageContent = item.last_message_content || '';
            if (!messageContent) {
              messageContent = '暂无消息';
            }

            // 处理时间
            const messageTime = item.last_message_time || item.updated_at || item.created_at || new Date().toISOString();

            return {
              ...item,
              type: 'conversation',
              content: messageContent,
              sender_name: displayName,
              unread_count: item.unread_count || 0,
              id: item.id,
              avatar,
              updated_at: messageTime,
              room_type: item.room_type || '1',
              isGroupChat: isGroupChat,
              // 预计算样式类，避免模板中的方法调用
              avatarClass: this.getAvatarClass('conversation')
            };
          });

          if (reset || this.page === 1) {
            this.roomList = formattedList;
          } else {
            this.roomList = this.roomList.concat(formattedList);
          }
          this.noMore = this.page >= this.totalPages;
        }
      });
    },
    // 加载更多
    loadMore() {
      if (this.loadingMore || this.noMore) return;
      if (this.page >= this.totalPages) {
        this.noMore = true;
        return;
      }
      this.loadingMore = true;
      this.page += 1;
      this.fetchConversations().finally(() => {
        this.loadingMore = false;
      });
    },
    // 处理消息点击
    handleMessageClick(item) {
      // 根据消息类型跳转到相应页面
      switch (item.type) {
        case 'conversation':
          uni.navigateTo({
            url: `/pages/chat/chat?room_id=${item.id}`
          });
          break;
        default:
          uni.navigateTo({
            url: `/pages/msg/detail?type=general&id=${item.id}`
          });
      }
    },
    
    // 获取头像样式类
    getAvatarClass(type) {
      const classMap = {
        'conversation': 'group-avatar',
        'system': 'system-avatar',
        'business': 'business-avatar',
        'consultation': 'consultation-avatar'
      };
      return classMap[type] || 'default-avatar';
    },
    // 获取默认图标
    getDefaultIcon(type) {
      const iconMap = {
        'conversation': '/static/icon/icon2.png',
        'system': '/static/icon/icon3.png',
        'business': '/static/icon/icon4.png',
        'consultation': '/static/icon/icon5.png'
      };
      return iconMap[type] || '/static/icon/icon1.png';
    },
    // 跳转到指定页面
    goToPage(type) {
      const routes = {
        pending: '/pages/msg/pending',
        audit: '/pages/msg/audit',
        notice: '/pages/msg/notice'
      }
      uni.navigateTo({
        url: routes[type]
      })
    },
    // 跳转到通讯录
    goToContacts() {
      uni.navigateTo({
        url: '/pages/msg/contacts'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.message-center {
  min-height: 100vh;
  background-color: #f5f6fa;
  padding-bottom: 120rpx;
}

/* 快捷入口卡片 */
.quick-cards {
  display: flex;
  justify-content: space-around;
  padding: 20rpx 0;
  background-color: #fff;
  margin-bottom: 20rpx;

  .card-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 25%; /* 4个卡片平分宽度 */
    position: relative;

    .card-icon-bg {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10rpx;

      &.bg-red {
        background-color: #ffe6e6;
      }
      &.bg-blue {
        background-color: #e6f0ff;
      }
      &.bg-orange {
        background-color: #fff3e6;
      }

      .card-icon {
        width: 60rpx;
        height: 60rpx;
      }
    }

    .card-text {
      font-size: 24rpx;
      color: #333;
      margin-bottom: 8rpx;
    }

    .badge {
      position: absolute;
      top: -10rpx;
      right: -10rpx;
      background-color: #ff4757;
      color: #fff;
      font-size: 20rpx;
      min-width: 32rpx;
      height: 32rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8rpx;
    }
  }
}

/* 企业通讯录 */
.contact-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
  
  .contact-left {
    display: flex;
    align-items: center;
    
    .contact-icon-bg {
      width: 80rpx;
      height: 80rpx;
      background-color: #e6f0ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;
      
      .contact-icon {
       width: 80rpx;
       height: 80rpx;
      }
    }
    
    .contact-text {
      font-size: 30rpx;
      color: #333;
    }
  }
  
  .arrow-icon {
    width: 32rpx;
    height: 32rpx;
  }
}

/* 加载状态 */
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

/* 空状态 */
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

/* 消息列表 */
.message-list {
  .message-item {
    background-color: #fff;
    padding: 30rpx;
    margin-bottom: 2rpx;
    
    &.urgent {
      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16rpx;
        
        .message-title {
          font-size: 32rpx;
          font-weight: 400;
          color: #333;
        }
        
        .urgent-tag {
          background-color: #ff4757;
          color: #fff;
          font-size: 20rpx;
          padding: 8rpx 16rpx;
          border-radius: 20rpx;
        }
      }
      
      .message-content {
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
        margin-bottom: 20rpx;
      }
      
      .message-footer {
        display: flex;
        justify-content: space-between;
        
        .message-time,
        .message-scope {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
    
    .message-user {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;
      
      .user-avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        margin-right: 20rpx;
      }
      
              .default-avatar {
          width: 80rpx;
          height: 80rpx;
          border-radius: 16rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 20rpx;
          
          &.group-avatar {
            background-color: #e6f0ff;
          }
          
          &.system-avatar {
            background-color: #e6f0ff;
          }
          
          &.business-avatar {
            background-color: #fff3e6;
          }
          
          &.consultation-avatar {
            background-color: #e6fff0;
          }
          
          .default-icon {
            width: 40rpx;
            height: 40rpx;
          }
          
          .group-text {
            color: #3D6AFF;
            font-size: 32rpx;
            font-weight: 500;
            line-height: 1;
            text-align: center;
          }
        }
      
      .user-info {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .user-name {
          font-size: 30rpx;
          color: #333;
          font-weight: 400;
        }
        
        .unread-badge {
          background-color: #3D6AFF;
          color: #fff;
          font-size: 20rpx;
          min-width: 32rpx;
          height: 32rpx;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 8rpx;
        }
        
        .status-tag {
          background-color: #ff4757;
          color: #fff;
          font-size: 20rpx;
          padding: 8rpx 16rpx;
          border-radius: 20rpx;
        }
      }
    }
    
    .message-content {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20rpx;
      margin-left: 100rpx;
      margin-bottom: 16rpx;

      .message-text {
        flex: 1;
        font-size: 28rpx;
        color: #666;
        line-height: 1.5;
        word-break: break-word;
      }

      .message-time {
        font-size: 24rpx;
        color: #999;
        white-space: nowrap;
        text-align: right;
        margin-left: 20rpx;
      }
    }
  }
}



/* 深度选择器示例 */
::v-deep .u-button {
  background-color: #3D6AFF;
}
</style>