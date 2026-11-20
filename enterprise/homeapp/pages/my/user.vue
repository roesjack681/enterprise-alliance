<template>
  <view class="container">
    <!-- 头部企业信息 -->
    <view class="header-card">
      <view class="company-info">
        <image class="company-avatar" src="/static/company-avatar.png" mode="aspectFill"></image>
        <view class="company-details">
          <view class="company-name">
            <text>科技创新有限公司</text>
            <image class="verify-icon" src="/static/verify-icon.png" mode="aspectFill"></image>
          </view>
          <view class="rating">
            <u-rate v-model="rating" :count="5" :size="24" active-color="#FFD700" inactive-color="#E5E5E5"></u-rate>
          </view>
          <view class="credit-score">
            <text class="credit-label">信用分：</text>
            <text class="credit-value">92</text>
          </view>
          <view class="company-desc">专注技术创新 | 成立5年 | 注册资金1000万</view>
        </view>
      </view>
    </view>

    <!-- 统计数据 -->
    <view class="stats-card">
      <view class="stat-item">
        <view class="stat-number">12</view>
        <view class="stat-label">合作项目</view>
      </view>
      <view class="stat-item">
        <view class="stat-number">5</view>
        <view class="stat-label">进行中</view>
      </view>
      <view class="stat-item">
        <view class="stat-number">7</view>
        <view class="stat-label">已完成</view>
      </view>
      <view class="stat-item">
        <view class="stat-number">8</view>
        <view class="stat-label">评价数</view>
      </view>
    </view>

    <!-- 我的订单 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">我的订单</text>
        <view class="view-all" @click="viewAllOrders">
          <text>查看全部</text>
          <u-icon name="arrow-right" size="24" color="#999"></u-icon>
        </view>
      </view>
      
      <view class="order-tabs">
        <view class="tab-item" :class="{ active: currentTab === 'all' }" @click="switchTab('all')">全部</view>
        <view class="tab-item" :class="{ active: currentTab === 'pending' }" @click="switchTab('pending')">待付款</view>
        <view class="tab-item" :class="{ active: currentTab === 'processing' }" @click="switchTab('processing')">进行中</view>
        <view class="tab-item" :class="{ active: currentTab === 'completed' }" @click="switchTab('completed')">已完成</view>
      </view>

      <view class="order-list">
        <view class="order-item" v-for="order in orderList" :key="order.id">
          <view class="order-header">
            <image class="order-icon" src="/static/icon/h71.png" mode="aspectFill"></image>
            <view class="order-info">
              <view class="order-title">{{ order.title }}</view>
              <view class="order-number">订单编号：{{ order.orderNo }}</view>
            </view>
            <view class="order-status" :class="order.statusClass">{{ order.status }}</view>
          </view>
          <view class="order-footer">
            <view class="order-price">¥{{ order.price }}</view>
            <view class="order-date">{{ order.date }}</view>
            <view class="order-actions">
              <u-button type="default" size="mini" @click="viewOrderDetail(order)">查看详情</u-button>
              <u-button type="primary" size="mini" @click="handleOrderAction(order)">{{ order.actionText }}</u-button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 最新消息回复 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">最新消息回复</text>
        <u-icon name="arrow-right" size="24" color="#999"></u-icon>
      </view>
      
      <view class="message-list">
        <view class="message-item" v-for="message in messageList" :key="message.id">
          <view class="message-header">
            <text class="message-title">{{ message.title }}</text>
            <view class="message-badge" v-if="message.isNew"></view>
            <text class="message-time">{{ message.time }}</text>
          </view>
          <view class="message-content">{{ message.content }}</view>
        </view>
      </view>
    </view>

    <!-- 进行中的合作 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">进行中的合作</text>
        <u-icon name="arrow-right" size="24" color="#999"></u-icon>
      </view>
      
      <view class="cooperation-list">
        <view class="cooperation-item" v-for="coop in cooperationList" :key="coop.id">
          <view class="cooperation-header">
            <text class="cooperation-title">{{ coop.title }}</text>
            <text class="cooperation-deadline">剩余{{ coop.deadline }}</text>
          </view>
          <view class="cooperation-company">{{ coop.company }}</view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: coop.progress + '%' }"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="bottom-nav">
      <view class="nav-item" v-for="nav in navList" :key="nav.id" @click="navigateTo(nav.path)">
        <image class="nav-icon" :src="nav.icon" mode="aspectFill"></image>
        <text class="nav-text">{{ nav.text }}</text>
      </view>
    </view>

    <!-- 底部菜单 -->
    <view class="bottom-menu">
      <view class="menu-item" v-for="menu in menuList" :key="menu.id" @click="navigateTo(menu.path)">
        <image class="menu-icon" :src="menu.icon" mode="aspectFill"></image>
        <text class="menu-text">{{ menu.text }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      rating: 4,
      currentTab: 'all',
      orderList: [
        {
          id: 1,
          title: '技术服务订单',
          orderNo: '#10086',
          status: '进行中',
          statusClass: 'status-processing',
          price: '25,800',
          date: '2023-12-15',
          actionText: '联系客服'
        },
        {
          id: 2,
          title: '培训咨询服务',
          orderNo: '#10073',
          status: '已完成',
          statusClass: 'status-completed',
          price: '12,500',
          date: '2023-12-10',
          actionText: '联系客服'
        }
      ],
      messageList: [
        {
          id: 1,
          title: '项目合作意向确认',
          content: '关于智能硬件开发项目合作的详细方案已发送，请查收...',
          time: '10分钟前',
          isNew: true
        },
        {
          id: 2,
          title: '技术方案评审会议',
          content: '定于明天下午2点进行技术方案评审会议，请准时参加...',
          time: '2小时前',
          isNew: false
        },
        {
          id: 3,
          title: '合同签订通知',
          content: '双方已完成合同初稿审核，等待最终确认...',
          time: '昨天',
          isNew: false
        }
      ],
      cooperationList: [
        {
          id: 1,
          title: '技术开发',
          company: '智能科技有限公司',
          deadline: '15天',
          progress: 65
        },
        {
          id: 2,
          title: '市场推广',
          company: '营销顾问集团',
          deadline: '30天',
          progress: 30
        }
      ],
      navList: [
        { id: 1, text: '发布需求', icon: '/static/publish-icon.png', path: '/pages/publish/index' },
        { id: 2, text: '寻找合作', icon: '/static/cooperation-icon.png', path: '/pages/cooperation/index' },
        { id: 3, text: '项目管理', icon: '/static/project-icon.png', path: '/pages/project/index' },
        { id: 4, text: '数据报表', icon: '/static/report-icon.png', path: '/pages/report/index' }
      ],
      menuList: [
        { id: 1, text: '企业认证', icon: '/static/cert-icon.png', path: '/pages/cert/index' },
        { id: 2, text: '设置中心', icon: '/static/setting-icon.png', path: '/pages/setting/index' },
        { id: 3, text: '帮助中心', icon: '/static/help-icon.png', path: '/pages/help/index' },
        { id: 4, text: '联系客服', icon: '/static/service-icon.png', path: '/pages/service/index' }
      ]
    }
  },
  methods: {
    switchTab(tab) {
      this.currentTab = tab;
    },
    viewAllOrders() {
      uni.navigateTo({
        url: '/pages/orders/index'
      });
    },
    viewOrderDetail(order) {
      uni.navigateTo({
        url: `/pages/order-detail/index?id=${order.id}`
      });
    },
    handleOrderAction(order) {
      // 处理订单操作
      console.log('订单操作:', order);
    },
    navigateTo(path) {
      uni.navigateTo({
        url: path
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 200rpx;
}

.header-card {
  background: linear-gradient(135deg, #3D6AFF 0%, #5B7FFF 100%);
  padding: 60rpx 32rpx 40rpx;
  border-radius: 0 0 32rpx 32rpx;
  margin-bottom: 24rpx;
}

.company-info {
  display: flex;
  align-items: flex-start;
}

.company-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 24rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.company-details {
  flex: 1;
}

.company-name {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  
  text {
    font-size: 36rpx;
    font-weight: 600;
    color: #fff;
    margin-right: 12rpx;
  }
}

.verify-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
}

.rating {
  margin-bottom: 12rpx;
}

.credit-score {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.credit-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.credit-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #FFD700;
}

.company-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.stats-card {
  background: #fff;
  margin: 0 24rpx 24rpx;
  padding: 32rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  font-size: 48rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.section {
  background: #fff;
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.view-all {
  display: flex;
  align-items: center;
  
  text {
    font-size: 24rpx;
    color: #999;
    margin-right: 8rpx;
  }
}

.order-tabs {
  display: flex;
  padding: 0 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  padding: 24rpx 0;
  margin-right: 48rpx;
  font-size: 28rpx;
  color: #666;
  position: relative;
  
  &.active {
    color: #3D6AFF;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4rpx;
      background: #3D6AFF;
      border-radius: 2rpx;
    }
  }
}

.order-list {
  padding: 0 32rpx;
}

.order-item {
  padding: 32rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

.order-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.order-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.order-info {
  flex: 1;
}

.order-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.order-number {
  font-size: 24rpx;
  color: #999;
}

.order-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  
  &.status-processing {
    background: rgba(61, 106, 255, 0.1);
    color: #3D6AFF;
  }
  
  &.status-completed {
    background: rgba(52, 199, 89, 0.1);
    color: #34C759;
  }
}

.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-price {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.order-date {
  font-size: 24rpx;
  color: #999;
}

.order-actions {
  display: flex;
  gap: 16rpx;
}

.message-list {
  padding: 0 32rpx;
}

.message-item {
  padding: 32rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.message-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-right: 12rpx;
}

.message-badge {
  width: 12rpx;
  height: 12rpx;
  background: #FF3B30;
  border-radius: 50%;
  margin-right: 12rpx;
}

.message-time {
  font-size: 24rpx;
  color: #999;
  margin-left: auto;
}

.message-content {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cooperation-list {
  padding: 0 32rpx;
}

.cooperation-item {
  padding: 32rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

.cooperation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.cooperation-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.cooperation-deadline {
  font-size: 24rpx;
  color: #3D6AFF;
}

.cooperation-company {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.progress-bar {
  width: 100%;
  height: 8rpx;
  background: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3D6AFF;
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.bottom-nav {
  display: flex;
  background: #fff;
  padding: 24rpx 32rpx;
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.nav-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  margin-bottom: 8rpx;
}

.nav-text {
  font-size: 24rpx;
  color: #333;
}

.bottom-menu {
  display: flex;
  background: #fff;
  padding: 24rpx 32rpx;
  margin: 0 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.menu-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.menu-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  margin-bottom: 8rpx;
}

.menu-text {
  font-size: 24rpx;
  color: #333;
}

::v-deep .u-button {
  border-radius: 16rpx !important;
  
  &.u-button--primary {
    background: #3D6AFF !important;
    border-color: #3D6AFF !important;
  }
}
</style>