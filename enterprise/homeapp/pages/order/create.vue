<template>
  <view class="container">
    <!-- 服务信息卡片 -->
    <view class="service-card">
      <view class="service-main">
        <!-- 服务图片 -->
        <view class="service-image">
          <image 
            :src="serviceImage" 
            mode="aspectFill"
            class="service-img"
            @error="onImageError"
          ></image>
        </view>
        
        <!-- 服务内容 -->
        <view class="service-content">
          <view class="service-title">{{ serviceData.title || '加载中...' }}</view>
          <view class="service-desc">{{ serviceData.description || '' }}</view>
          <!-- <view class="service-area" v-if="serviceData.service_area">
            <text class="area-label">服务范围：</text>
            <text class="area-value">{{ serviceData.service_area }}</text>
          </view> -->
        </view>
        
        <!-- 价格信息 -->
        <view class="service-price">
          <view class="price-value">¥{{ serviceData.price || '0' }}</view>
          <view class="price-unit">/ {{ serviceData.unit || '次' }}</view>
        </view>
      </view>
      
   
    </view>

    <!-- 费用明细卡片 -->
    <view class="cost-card">
      <view class="cost-title">费用明细</view>
      <view class="cost-detail">
        <view class="cost-row">
          <text class="cost-label">服务基础费用</text>
          <text class="cost-value">¥{{orderInfo.originalPrice}}</text>
        </view>
        <view class="cost-row">
          <text class="cost-label">优惠折扣</text>
          <text class="cost-value discount">-¥{{orderInfo.discountPrice}}</text>
        </view>
      </view>
      <view class="total-amount">
        <text class="total-label">实付金额</text>
        <text class="total-value">¥{{orderInfo.actualPrice}}</text>
      </view>
    </view>


    <!-- 发票信息 -->
    <view class="invoice-card" @click="selectInvoice">
      <view class="invoice-header">
        <text class="invoice-title">发票信息</text>
        <text class="invoice-status">
          {{ selectedInvoice ? '已选择' : '选择发票' }} >
        </text>
      </view>
      <view class="invoice-detail" v-if="selectedInvoice">
        <view class="invoice-info">
          <text class="invoice-name">{{ selectedInvoice.title }}</text>
          <text class="invoice-tax">{{ selectedInvoice.tax_number }}</text>
        </view>
        <view class="invoice-type">{{ selectedInvoice.invoice_type_name }}</view>
      </view>
      <view class="invoice-placeholder" v-else>
        <text class="placeholder-text">请选择发票抬头</text>
      </view>
    </view>

    <!-- 订单备注 -->
    <view class="remark-card">
      <view class="remark-title">订单备注</view>
      <textarea 
        class="remark-input" 
        placeholder="请输入订单备注信息（选填）"
        v-model="orderRemark"
        maxlength="200"
      ></textarea>
    </view>

    <!-- 底部创建订单按钮 -->
    <view class="bottom-bar">
      <view class="create-btn" :class="{ disabled: loading }" @click="createOrder">
        <text class="btn-text">{{ loading ? '创建中...' : '创建订单' }}</text>
      </view>
      <view class="agreement-text">
        <text>点击创建订单即表示同意《</text>
        <text class="agreement-link" @click="showAgreement">服务协议</text>
        <text>》</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getServiceProductDetail, createOrder, getDefaultInvoice } from '@/utils/api'

export default {
  data() {
    return {
      serviceId: null,
      serviceData: {},
      orderInfo: {
        orderNo: '',
        createTime: '',
        serviceTime: '',
        originalPrice: '',
        discountPrice: '0',
        actualPrice: ''
      },
      orderRemark: '',
      selectedInvoice: null, // 选中的发票信息
      loading: false,
      defaultImage: '/static/img/default-service.png' // 默认服务图片
    }
  },
  computed: {
    serviceImage() {
      if (this.serviceData.images) {
        try {
          const images = JSON.parse(this.serviceData.images)
          return images && images.length > 0 ? images[0] : this.defaultImage
        } catch (error) {
          console.error('解析服务图片失败:', error)
          return this.defaultImage
        }
      }
      return this.defaultImage
    }
  },
  onLoad(options) {
    if (options.id) {
      this.serviceId = options.id
      this.fetchServiceDetail()
      this.initOrderInfo()
      this.loadDefaultInvoice()
    }
  },
  
  onShow() {
    // 从发票选择页面返回时，检查是否有新选择的发票
    const selectedInvoice = uni.getStorageSync('selectedInvoice')
    if (selectedInvoice) {
      this.selectedInvoice = selectedInvoice
      // 清除缓存
      uni.removeStorageSync('selectedInvoice')
    }
  },
  methods: {
    async fetchServiceDetail() {
      this.loading = true
      try {
        const res = await getServiceProductDetail({ id: this.serviceId })
        if (res.code === 0 && res.data && res.data[0]) {
          this.serviceData = res.data[0]
          this.orderInfo.originalPrice = this.serviceData.price
          this.orderInfo.actualPrice = this.serviceData.price
        }
      } catch (error) {
        console.error('获取服务详情失败:', error)
        uni.showToast({ title: '获取服务信息失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    initOrderInfo() {
      const now = new Date()
      this.orderInfo.orderNo = 'ORD' + now.getTime()
      this.orderInfo.createTime = this.formatDate(now)
      
      // 设置默认服务周期（假设服务周期为3个月）
      const endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
      this.orderInfo.serviceTime = this.formatDate(now) + ' 至 ' + this.formatDate(endDate)
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    // 加载默认发票
    async loadDefaultInvoice() {
      try {
        const response = await getDefaultInvoice({})
        if (response.code === 0 && response.data) {
          this.selectedInvoice = response.data
        }
      } catch (error) {
        console.error('加载默认发票失败:', error)
      }
    },
    
    // 选择发票
    selectInvoice() {
      uni.navigateTo({
        url: `/pages/invoices/select?currentId=${this.selectedInvoice?.id || ''}`,
        events: {
          // 监听发票选择结果
          selectInvoice: (invoice) => {
            this.selectedInvoice = invoice
            console.log('选择的发票:', invoice)
          }
        }
      })
    },
    async createOrder() {
      // 防重复点击
      if (this.loading) {
        return
      }
      
      // 参数验证
      if (!this.serviceId) {
        uni.showToast({ title: '服务信息错误', icon: 'none' })
        return
      }
      
      if (!this.orderInfo.actualPrice || parseFloat(this.orderInfo.actualPrice) <= 0.01) {
        uni.showToast({ title: '订单金额不能小于0.01元', icon: 'none' })
        return
      }
      
      if (!this.selectedInvoice) {
        uni.showToast({ title: '请选择发票信息', icon: 'none' })
        return
      }
      
      if (this.orderRemark && this.orderRemark.length > 500) {
        uni.showToast({ title: '订单备注不能超过500字符', icon: 'none' })
        return
      }
      
      this.loading = true
      try {
        const orderData = {
          business_type: 'service',
          business_id: this.serviceId,
          provider_id: this.serviceData.entity_id,
          actual_price: parseFloat(this.orderInfo.actualPrice),
          original_price: parseFloat(this.orderInfo.originalPrice),
          discount_price: parseFloat(this.orderInfo.discountPrice || 0),
          remark: this.orderRemark,
          invoice_id: this.selectedInvoice ? this.selectedInvoice.id : null
        }
        
        const res = await createOrder(orderData)
        if (res.code == 0 && res.data) {
          uni.showToast({ title: '订单创建成功', icon: 'success' })
          
          // 跳转到支付页面，使用新的order_no
          setTimeout(() => {
            uni.redirectTo({
              url: `/pages/order/pay?order_no=${res.data.order_no}&amount=${res.data.actual_price}&title=${encodeURIComponent(res.data.business_title || '订单支付')}`
            })
          }, 1500)
        } else {
          // 处理不同的错误类型
          let errorMsg = '订单创建失败' 
          uni.showToast({ title:res.msg || errorMsg, icon: 'none' })
        }
      } catch (error) {
        console.error('创建订单失败:', error)
        uni.showToast({ title: '创建订单失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    showAgreement() {
      // 显示服务协议
      uni.navigateTo({
        url: '/pages/agreement/agreement'
      })
    },
    
    // 图片加载失败处理
    onImageError() {
      console.log('服务图片加载失败，使用默认图片')
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 200rpx;
  padding-top:1px;
}

.service-card {
  margin: 32rpx 32rpx 24rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  
  .service-main {
    display: flex;
    align-items: flex-start;
    margin-bottom: 32rpx;
    
    .service-image {
      width: 120rpx;
      height: 120rpx;
      border-radius: 16rpx;
      overflow: hidden;
      margin-right: 24rpx;
      flex-shrink: 0;
      
      .service-img {
        width: 100%;
        height: 100%;
        border-radius: 16rpx;
      }
    }
    
    .service-content {
      flex: 1;
      margin-right: 16rpx;
      
      .service-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 12rpx;
        line-height: 1.4;
      }
      
      .service-desc {
        font-size: 26rpx;
        color: #666;
        line-height: 1.4;
        margin-bottom: 12rpx;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .service-area {
        font-size: 24rpx;
        color: #999;
        
        .area-label {
          color: #666;
        }
        
        .area-value {
          color: #3D6AFF;
          font-weight: 500;
        }
      }
    }
    
    .service-price {
      text-align: right;
      flex-shrink: 0;
      
      .price-value {
        font-size: 28rpx;
        color: #ff4757;
        font-weight: 500;
        line-height: 1.2;
      }
      
      .price-unit {
        font-size: 22rpx;
        color: #999;
        margin-top: 2rpx;
      }
    }
  }
  
  .order-info {
    border-top: 1rpx solid #f0f0f0;
    padding-top: 24rpx;
    
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .info-label {
        font-size: 26rpx;
        color: #666;
      }
      
      .info-value {
        font-size: 26rpx;
        color: #333;
        font-weight: 500;
      }
    }
  }
}

.cost-card {
  margin: 0 32rpx 24rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  
  .cost-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 32rpx;
  }
  
  .cost-detail {
    .cost-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;
      
      .cost-label {
        font-size: 28rpx;
        color: #666;
      }
      
      .cost-value {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
        
        &.discount {
          color: #ff4757;
        }
      }
    }
  }
  
  .total-amount {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 32rpx;
    padding-top: 32rpx;
    border-top: 1rpx solid #eee;
    
    .total-label {
      font-size: 32rpx;
      color: #333;
      font-weight: 600;
    }
    
    .total-value {
      font-size: 36rpx;
      color: #ff4757;
      font-weight: 600;
    }
  }
}


.invoice-card {
  margin: 0 32rpx 24rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  .invoice-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .invoice-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
    
    .invoice-status {
      font-size: 28rpx;
      color: #3D6AFF;
    }
  }
  
  .invoice-detail {
    background-color: #f8f9fa;
    border-radius: 12rpx;
    padding: 24rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .invoice-info {
      flex: 1;
      
      .invoice-name {
        display: block;
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .invoice-tax {
        font-size: 26rpx;
        color: #666;
      }
    }
    
    .invoice-type {
      font-size: 24rpx;
      color: #3D6AFF;
      background-color: rgba(61, 106, 255, 0.1);
      padding: 6rpx 12rpx;
      border-radius: 8rpx;
      margin-left: 16rpx;
    }
  }
  
  .invoice-placeholder {
    background-color: #f8f9fa;
    border: 2rpx dashed #ddd;
    border-radius: 12rpx;
    padding: 40rpx 24rpx;
    text-align: center;
    
    .placeholder-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}

.remark-card {
  margin: 0 32rpx 24rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  
  .remark-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 24rpx;
  }
  
  .remark-input {
    width: 100%;
    min-height: 120rpx;
    padding: 20rpx;
    border: 1rpx solid #eee;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #333;
    background-color: #f8f8f8;
    
    ::v-deep .uni-textarea-placeholder {
      color: #999;
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
  
  .create-btn {
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
      pointer-events: none;
    }
    
    .btn-text {
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