<template>
  <view class="pay-page">
    <view v-if="loading" style="text-align:center;padding:80rpx 0;">
      <u-loading-icon mode="spinner" size="40" color="#3D6AFF"></u-loading-icon>
      <text style="display:block;margin-top:20rpx;color:#999;">加载中...</text>
    </view>
    
    <view v-else class="content">
      <!-- 订单信息卡片 -->
      <view class="order-card">
        <view class="order-header">
          <view class="order-title">{{ orderInfo.title || '订单支付' }}</view>
          <view class="order-no">订单号：{{ orderInfo.order_no }}</view>
        </view>
        <view class="order-amount">
          <text class="amount-label">应付金额</text>
          <text class="amount-value">¥{{ orderInfo.amount }}</text>
        </view>
      </view>

      <!-- 支付方式选择 -->
      <view class="payment-card">
        <view class="payment-title">选择支付方式</view>
        <view class="payment-list">
          <view class="payment-item" @click="selectPayment('bank')" :class="{'active': selectedPayment === 'bank'}">
            <view class="payment-left">
              <image class="payment-icon" src="/static/img/bank-icon.png" mode="aspectFit"></image>
              <text class="payment-name">对公转账</text>
            </view>
            <view class="payment-radio" :class="{'checked': selectedPayment === 'bank'}"></view>
          </view>
          <view class="payment-item" @click="selectPayment('wechat')" :class="{'active': selectedPayment === 'wechat'}">
            <view class="payment-left">
              <image class="payment-icon" src="/static/img/wechat-icon.png" mode="aspectFit"></image>
              <text class="payment-name">微信支付</text>
            </view>
            <view class="payment-radio" :class="{'checked': selectedPayment === 'wechat'}"></view>
          </view>
        </view>
      </view>

      <!-- 支付说明 -->
      <view class="payment-notice">
        <view class="notice-title">支付说明</view>
        <view class="notice-content">
          <text>• 支付成功后订单将立即生效</text>
          <text>• 如有疑问请联系客服：400-123-4567</text>
          <text>• 支付遇到问题可尝试更换支付方式</text>
        </view>
      </view>
    </view>

    <!-- 底部支付按钮 -->
    <view class="bottom-bar">
      <view class="pay-btn" @click="confirmPayment" :class="{'disabled': !selectedPayment}">
        <text class="pay-text">确认支付 ¥{{ orderInfo.amount }}</text>
      </view>
      <view class="agreement-text">
        <text>点击确认支付即表示同意《</text>
        <text class="agreement-link" @click="showAgreement">支付协议</text>
        <text>》</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getOrderByNo, weixinUnifiedOrder, updateOrderPaymentMethod, manualCheckPayment } from '@/utils/api'

export default {
  data() {
    return {
      orderNo: '',
      orderInfo: {
        order_no: '',
        amount: '0',
        title: ''
      },
      selectedPayment: 'wechat', // 默认微信支付
      loading: false
    }
  },
  onLoad(options) {
    if (options.order_no) {
      this.orderNo = options.order_no
      this.orderInfo.order_no = options.order_no
      this.orderInfo.amount = options.amount || '0'
      this.orderInfo.title = decodeURIComponent(options.title || '订单支付')
      this.fetchOrderDetail()
    } else {
      uni.showToast({ title: '订单参数错误', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 1500)
    }
  },
  methods: {
    async fetchOrderDetail() {
      this.loading = true
      try {
        const res = await getOrderByNo({ order_no: this.orderNo })
        if (res.code === 0 && res.data) {
          this.orderInfo = {
            ...this.orderInfo,
            ...res.data,
            amount: this.orderInfo.amount || res.data.actual_price,
            title: this.orderInfo.title || res.data.business_title || '订单支付'
          }
        } else {
          uni.showToast({ title: res.msg || '获取订单信息失败', icon: 'none' })
        }
      } catch (error) {
        uni.showToast({ title: '获取订单信息失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    selectPayment(type) {
      this.selectedPayment = type
    },
    async confirmPayment() {
      if (!this.selectedPayment) {
        uni.showToast({
          title: '请选择支付方式',
          icon: 'none'
        })
        return
      }
      
      // 根据选择的支付方式进行相应处理
      if (this.selectedPayment === 'bank') {
        this.handleBankTransfer()
      } else if (this.selectedPayment === 'wechat') {
        this.handleWechatPay()
      }
    },
    async handleBankTransfer() {
      uni.showLoading({ title: '处理中...' })
      
      try {
        const res = await this.createBankTransferOrder({
          order_no: this.orderNo,
          payment_method: 'bank_transfer'
        })
        
        uni.hideLoading()
        
        if (res.success) {
          const expireDate = res.data?.expire_time ? 
            new Date(res.data.expire_time).toLocaleString() : '3天后'
          
          uni.showModal({
            title: '银行转账说明',
            content: `订单有效期已延长至${expireDate}。请联系客服获取对公转账信息，转账完成后请主动联系客服确认到账。`,
            confirmText: '联系客服',
            cancelText: '我知道了',
            success: (modalRes) => {
              if (modalRes.confirm) {
                uni.makePhoneCall({ phoneNumber: '400-123-4567' })
              }
              this.goToPayResult('pending', this.orderNo)
            }
          })
        } else {
          const errorMsg = res.error === 'order_expired' ? '订单已过期，请重新创建' : 
                          res.error === 'order_not_found' ? '订单不存在' : 
                          '更新支付方式失败'
          uni.showToast({ title: errorMsg, icon: 'none' })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: '处理失败，请重试', icon: 'none' })
      }
    },
    async createBankTransferOrder(data) {
      try {
        const res = await updateOrderPaymentMethod({
          order_no: data.order_no,
          payment_method: data.payment_method
        })
        
        if (res.code === 0) {
          return { success: true, data: res.data }
        } else {
          return { success: false, error: res.msg }
        }
      } catch (error) {
        return { success: false, error: '网络请求失败' }
      }
    },
    async handleWechatPay() {
      uni.showLoading({ title: '正在调起支付...' })
      
      try {
        const loginRes = await uni.login({ provider: 'weixin' })
        
        if (!loginRes.code) {
          uni.hideLoading()
          uni.showToast({ title: '获取微信授权失败', icon: 'none' })
          return
        }
        
        if (!this.orderNo) {
          uni.hideLoading()
          uni.showToast({ title: '订单号不存在', icon: 'none' })
          return
        }
        
        const res = await weixinUnifiedOrder({
          orderNo: this.orderNo,
          code: loginRes.code
        })
        
        if (res.code === 0 && res.data) {
          const payData = res.data
          
          await uni.requestPayment({
            provider: 'wxpay',
            timeStamp: payData.timeStamp,
            nonceStr: payData.nonceStr,
            package: payData.package,
            signType: payData.signType || 'MD5',
            paySign: payData.paySign,
            success: () => {
              uni.hideLoading()
              // 支付成功后，调用主动查询
              this.verifyPaymentStatus(payData.orderNo || this.orderNo);
            },
            fail: (err) => {
              uni.hideLoading()
              
              if (err.errMsg?.includes('cancel')) {
                uni.showToast({ title: '支付已取消', icon: 'none' })
              } else {
                uni.showToast({ title: '支付失败，请重试', icon: 'none' })
              }
              
              setTimeout(() => {
                this.goToPayResult('failed', this.orderNo)
              }, 2000)
            }
          })
        } else {
          uni.hideLoading()
          const errorMsg = res.msg === 'invalid_params' ? '订单参数错误' :
                          res.msg === 'order_not_found' ? '订单不存在' :
                          res.msg === 'order_status_invalid' ? '订单状态异常' :
                          res.msg === 'order_expired' ? '订单已过期' :
                          res.msg === 'openid_not_found' ? '获取微信信息失败' :
                          res.msg || '调起支付失败'
          uni.showToast({ title: errorMsg, icon: 'none' })
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({ title: '支付服务异常，请重试', icon: 'none' })
        setTimeout(() => this.goToPayResult('failed', this.orderNo), 2000)
      }
    },
    // 新增：轮询查询支付状态
    async verifyPaymentStatus(orderNo) {
      uni.showLoading({ title: '正在确认支付结果...', mask: true });

      let paid = false;
      const maxAttempts = 3; // 最多尝试3次
      const delay = 2000; // 每次间隔2秒

      for (let i = 0; i < maxAttempts; i++) {
        try {
          const res = await manualCheckPayment({ out_trade_no: orderNo });
          if (res.code === 0 && res.data && res.data.status === 'paid') {
            paid = true;
            break; // 支付成功，跳出循环
          }
        } catch (error) {
          console.error('查询支付状态失败:', error);
        }
        
        if (i < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      uni.hideLoading();

      if (paid) {
        uni.showToast({ title: '支付成功', icon: 'success' });
        this.goToPayResult('success', orderNo);
      } else {
        uni.showToast({ title: '支付结果确认中', icon: 'none' });
        this.goToPayResult('pending', orderNo); // 跳转到中间状态页或失败页
      }
    },
    goToPayResult(status, orderNo) {
      uni.redirectTo({
        url: `/pages/order/ok?order_no=${orderNo || this.orderNo}&status=${status}&amount=${this.orderInfo.amount}`
      })
    },
    showAgreement() {
      uni.navigateTo({ url: '/pages/agreement/payment' })
    }
  }
}
</script>
<style lang="scss" scoped>
.pay-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 200rpx;
}

.content {
  padding: 0;
  padding-top:1px;
}

.order-card {
  background: white;
  margin: 20rpx 32rpx 24rpx;
  border-radius: 24rpx;
  padding: 32rpx;
  
  .order-header {
    margin-bottom: 32rpx;
    
    .order-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 12rpx;
    }
    
    .order-no {
      font-size: 26rpx;
      color: #666;
    }
  }
  
  .order-amount {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 0;
    border-top: 1rpx solid #eee;
    
    .amount-label {
      font-size: 32rpx;
      color: #333;
      font-weight: 600;
    }
    
    .amount-value {
      font-size: 40rpx;
      color: #ff4757;
      font-weight: 600;
    }
  }
}

.payment-card {
  margin: 0 32rpx 24rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  
  .payment-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 32rpx;
  }
  
  .payment-list {
    .payment-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      &.active {
        .payment-name {
          color: #3D6AFF;
        }
      }
      
      .payment-left {
        display: flex;
        align-items: center;
        
        .payment-icon {
          width: 48rpx;
          height: 48rpx;
          border-radius: 50%;
          margin-right: 24rpx;
        }
        
        .payment-name {
          font-size: 30rpx;
          color: #333;
        }
      }
      
      .payment-radio {
        width: 40rpx;
        height: 40rpx;
        border: 2rpx solid #ddd;
        border-radius: 50%;
        position: relative;
        
        &.checked {
          border-color: #3D6AFF;
          background-color: #3D6AFF;
          
          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20rpx;
            height: 20rpx;
            background-color: #fff;
            border-radius: 50%;
          }
        }
      }
    }
  }
}

.payment-notice {
  margin: 0 32rpx 24rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  
  .notice-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .notice-content {
    text {
      display: block;
      font-size: 24rpx;
      color: #666;
      line-height: 1.5;
      margin-bottom: 8rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 32rpx;
  border-top: 1rpx solid #eee;
  
  .pay-btn {
    width: 100%;
    height: 88rpx;
    background-color: #3D6AFF;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16rpx;
    transition: all 0.3s ease;
    
    &.disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    
    .pay-text {
      font-size: 32rpx;
      color: #fff;
      font-weight: 600;
    }
  }
  
  .agreement-text {
    text-align: center;
    font-size: 24rpx;
    color: #999;
    
    .agreement-link {
      color: #3D6AFF;
    }
  }
}
</style>