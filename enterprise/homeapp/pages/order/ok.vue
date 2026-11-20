<template>
  <view class="pay-result-page">
    <!-- 结果状态图标 -->
    <view class="result-icon">
      <view v-if="payStatus === 'success'" class="success-icon">
        <u-icon name="checkmark-circle-fill" size="120" color="#52c41a"></u-icon>
      </view>
      <view v-else-if="payStatus === 'pending'" class="pending-icon">
        <u-icon name="clock-fill" size="120" color="#faad14"></u-icon>
      </view>
      <view v-else class="error-icon">
        <u-icon name="close-circle-fill" size="120" color="#ff4d4f"></u-icon>
      </view>
    </view>

    <!-- 结果信息 -->
    <view class="result-info">
      <view class="result-title">{{ statusText.title }}</view>
      <view class="result-desc">{{ statusText.desc }}</view>
      
      <!-- 订单信息 -->
      <view class="order-summary">
        <view class="summary-item">
          <text class="item-label">订单编号</text>
          <text class="item-value">{{ orderInfo.order_no }}</text>
        </view>
        <view class="summary-item" v-if="orderInfo.amount">
          <text class="item-label">支付金额</text>
          <text class="item-value amount">¥{{ orderInfo.amount }}</text>
        </view>
        <view class="summary-item">
          <text class="item-label">支付时间</text>
          <text class="item-value">{{ formatCurrentTime() }}</text>
        </view>
      </view>
    </view>

    <!-- 操作建议 -->
    <view class="action-tips" v-if="payStatus === 'pending'">
      <view class="tips-title">接下来您需要：</view>
      <view class="tips-list">
        <view class="tip-item">
          <text>1. 联系客服获取对公转账账户信息</text>
        </view>
        <view class="tip-item">
          <text>2. 完成银行转账操作</text>
        </view>
        <view class="tip-item">
          <text>3. 转账完成后联系客服确认到账</text>
        </view>
      </view>
      
      <view class="contact-info">
        <view class="contact-item" @click="callService">
          <u-icon name="phone" size="32" color="#3D6AFF"></u-icon>
          <text class="contact-text">客服电话：400-123-4567</text>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <view class="action-row">
        <view class="action-btn outline" @click="goToOrderList">
          <text class="btn-text">查看订单</text>
        </view>
        <view class="action-btn primary" @click="goToHome">
          <text class="btn-text">返回首页</text>
        </view>
      </view> 
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderId: null, // 保持兼容性
      payStatus: 'success', // success, pending, failed
      orderInfo: {
        order_no: '',
        amount: ''
      }
    }
  },
  computed: {
    statusText() {
      const statusMap = {
        success: {
          title: '支付成功',
          desc: '您的订单已支付成功，我们将尽快为您提供服务'
        },
        pending: {
          title: '等待转账',
          desc: '请按照提示完成银行转账，客服将在收到转账后确认订单'
        },
        failed: {
          title: '支付失败',
          desc: '支付过程中出现问题，请重试或联系客服'
        }
      }
      return statusMap[this.payStatus] || statusMap.failed
    }
  },
  onLoad(options) {
    if (options.order_no) {
      this.orderId = options.order_no
      this.orderInfo.order_no = options.order_no
    } else if (options.order_id) {
      // 兼容旧参数
      this.orderId = options.order_id
      this.orderInfo.order_no = options.order_id
    }
    if (options.status) {
      this.payStatus = options.status
    }
    if (options.amount) {
      this.orderInfo.amount = options.amount
    }
  },
  methods: {
    formatCurrentTime() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    callService() {
      uni.makePhoneCall({
        phoneNumber: '400-123-4567'
      })
    }, 
    goToOrderList() {
      uni.redirectTo({
        url: '/pages/order/list'
      })
    },
    goToHome() {
      uni.switchTab({
        url: '/pages/home/home'
      })
    },
 
  }
}
</script>

<style lang="scss" scoped>
.pay-result-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 80rpx 32rpx 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-icon {
  margin-bottom: 48rpx;
  
  .success-icon,
  .pending-icon,
  .error-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    background: white;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  }
}

.result-info {
  text-align: center;
  margin-bottom: 48rpx;
  width: 100%;
  
  .result-title {
    font-size: 48rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .result-desc {
    font-size: 28rpx;
    color: #666;
    line-height: 1.5;
    margin-bottom: 48rpx;
  }
  
  .order-summary {
    background: white;
    border-radius: 24rpx;
    padding: 32rpx;
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .item-label {
        font-size: 28rpx;
        color: #666;
      }
      
      .item-value {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
        
        &.amount {
          color: #ff4757;
          font-size: 32rpx;
          font-weight: 600;
        }
      }
    }
  }
}

.action-tips {
  width: 100%;
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 48rpx;
  
  .tips-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 24rpx;
  }
  
  .tips-list {
    margin-bottom: 32rpx;
    
    .tip-item {
      margin-bottom: 16rpx;
      
      text {
        font-size: 26rpx;
        color: #666;
        line-height: 1.5;
      }
    }
  }
  
  .contact-info {
    border-top: 1rpx solid #eee;
    padding-top: 24rpx;
    
    .contact-item {
      display: flex;
      align-items: center;
      gap: 12rpx;
      
      .contact-text {
        font-size: 26rpx;
        color: #3D6AFF;
      }
    }
  }
}

.bottom-actions {
  width: 100%;
  
  .action-row {
    display: flex;
    gap: 24rpx;
    margin-bottom: 32rpx;
    
    .action-btn {
      flex: 1;
      height: 88rpx;
      border-radius: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.outline {
        border: 2rpx solid #3D6AFF;
        background: white;
        
        .btn-text {
          color: #3D6AFF;
        }
      }
      
      &.primary {
        background: #3D6AFF;
        
        .btn-text {
          color: white;
        }
      }
      
      .btn-text {
        font-size: 32rpx;
        font-weight: 500;
      }
    }
  }
  
  .extra-actions {
    display: flex;
    justify-content: center;
    gap: 80rpx;
    
    .extra-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;
      
      .extra-text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}
</style>