<template>
  <view class="invoice-select-page">
    <!-- 头部操作 -->
    <view class="header-actions">
      <u-button 
        type="primary" 
        size="normal"
        shape="circle"
        @click="addInvoice"
        :custom-style="{ backgroundColor: '#3D6AFF', borderColor: '#3D6AFF', marginBottom: '20rpx' }"
      > 
        新增发票
      </u-button>
    </view>

    <!-- 发票列表 -->
    <view class="invoice-list" v-if="!loading">
      <view 
        v-for="(item, index) in invoiceList" 
        :key="item.id"
        class="invoice-item"
        :class="{ 'selected': selectedInvoice && selectedInvoice.id === item.id }"
        @click="selectInvoice(item)"
      >
        <view class="item-header">
          <view class="invoice-title">{{ item.title }}</view>
          <view class="item-badges">
            <view class="default-badge" v-if="item.is_default">默认</view>
            <view class="selected-badge" v-if="selectedInvoice && selectedInvoice.id === item.id">
              <u-icon name="checkmark-circle-fill" color="#3D6AFF" size="40rpx"></u-icon>
            </view>
          </view>
        </view>
        
        <view class="item-content">
          <view class="info-row">
            <text class="label">纳税人识别号:</text>
            <text class="value">{{ item.tax_number }}</text>
          </view>
          <view class="info-row">
            <text class="label">发票类型:</text>
            <text class="value">{{ item.invoice_type==2?'增值税专用发票':'普通发票' }}</text>
          </view>
          <view class="info-row" v-if="item.company_address">
            <text class="label">公司地址:</text>
            <text class="value">{{ item.company_address }}</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="item-actions">
          <u-button 
            v-if="!item.is_default"
            size="mini" 
            type="default" 
            plain
            shape="circle"
            @click="setDefault(item, $event)"
            :custom-style="{ 
              borderColor: '#3D6AFF', 
              color: '#3D6AFF',
              backgroundColor: 'transparent',
              fontSize: '22rpx',
              padding: '8rpx 16rpx',
              height: '56rpx'
            }"
            class="action-btn default-btn"
          >
            设为默认
          </u-button>
          <u-button 
            size="mini" 
            type="default" 
            plain
            shape="circle"
            @click="editInvoice(item, $event)"
            :custom-style="{ 
              borderColor: '#909399', 
              color: '#909399',
              backgroundColor: 'transparent',
              fontSize: '22rpx',
              padding: '8rpx 16rpx',
              height: '56rpx'
            }"
            class="action-btn edit-btn"
          >
            编辑
          </u-button>
          <u-button 
            size="mini" 
            type="default" 
            plain
            shape="circle"
            @click="handleDeleteInvoice(item, index, $event)"
            :custom-style="{ 
              borderColor: '#F56C6C', 
              color: '#F56C6C',
              backgroundColor: 'transparent',
              fontSize: '22rpx',
              padding: '8rpx 16rpx',
              height: '56rpx'
            }"
            class="action-btn delete-btn"
          >
            删除
          </u-button>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="invoiceList.length === 0" class="empty-state">
        <u-empty 
          mode="data" 
          text="暂无发票信息"
          textColor="#909399"
          iconSize="120"
        >
          <template #bottom>
            <u-button 
              type="primary" 
              size="normal"
              @click="addInvoice"
              style="margin-top: 20rpx;"
            >
              添加发票
            </u-button>
          </template>
        </u-empty>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-wrap">
      <u-loading-page :loading="loading" loading-text="加载中..."></u-loading-page>
    </view>

    <!-- 底部确认按钮 -->
    <view class="bottom-actions" v-if="invoiceList.length > 0">
      <u-button 
        type="default" 
        shape="circle" 
        size="large"
        @click="cancel"
        class="cancel-btn"
      >
        取消
      </u-button>
      <u-button 
        type="primary" 
        shape="circle" 
        size="large"
        :disabled="!selectedInvoice"
        @click="confirm"
        :custom-style="{ backgroundColor: '#3D6AFF', borderColor: '#3D6AFF' }"
        class="confirm-btn"
      >
        确认选择
      </u-button>
    </view>
  </view>
</template>

<script>
import { getInvoiceList, getDefaultInvoice, setDefaultInvoice, deleteInvoice } from '@/utils/api'

export default {
  data() {
    return {
      invoiceList: [],
      selectedInvoice: null,
      loading: false,
      currentInvoiceId: null // 当前已选择的发票ID（从上一页传入）
    }
  },
  onLoad(options) {
    // 获取当前已选择的发票ID
    if (options.currentId) {
      this.currentInvoiceId = parseInt(options.currentId)
    }
    
    this.loadInvoiceList()
  },
  methods: {
    // 加载发票列表
    async loadInvoiceList() {
      this.loading = true

      try {
        const response = await getInvoiceList({
          page: 1,
          page_size: 100, // 获取所有发票
          status: 1
        })
        
        if (response.code === 0) {
          this.invoiceList = response.data.list || []
          
          // 设置默认选择项
          this.setDefaultSelection()
        } else {
          this.$u.toast(response.msg || '获取发票列表失败')
        }
      } catch (error) {
        console.error('获取发票列表失败:', error)
        this.$u.toast('网络错误，请重试')
      } finally {
        this.loading = false
      }
    },

    // 设置默认选择项
    setDefaultSelection() {
      if (this.invoiceList.length === 0) return

      // 如果有传入当前发票ID，优先选择
      if (this.currentInvoiceId) {
        const currentInvoice = this.invoiceList.find(item => item.id === this.currentInvoiceId)
        if (currentInvoice) {
          this.selectedInvoice = currentInvoice
          return
        }
      }

      // 否则选择默认发票
      const defaultInvoice = this.invoiceList.find(item => item.is_default === 1)
      if (defaultInvoice) {
        this.selectedInvoice = defaultInvoice
        return
      }

      // 如果没有默认发票，选择第一个
      if (this.invoiceList.length > 0) {
        this.selectedInvoice = this.invoiceList[0]
      }
    },

    // 选择发票
    selectInvoice(invoice) {
      this.selectedInvoice = invoice
    },

    // 添加发票
    addInvoice() {
      uni.navigateTo({
        url: '/pages/invoices/edit?fromSelect=1'
      })
    },

    // 编辑发票
    editInvoice(item, event) {
      if (event && event.stopPropagation) {
        event.stopPropagation()
      }
      uni.navigateTo({
        url: `/pages/invoices/edit?id=${item.id}&fromSelect=1`
      })
    },

    // 设为默认发票
    async setDefault(item, event) {
      if (event && event.stopPropagation) {
        event.stopPropagation()
      }
      try {
        const response = await setDefaultInvoice({ id: item.id })
        
        if (response.code === 0) {
          this.$u.toast('设置成功')
          // 更新列表中的默认状态
          this.invoiceList.forEach(invoice => {
            invoice.is_default = invoice.id === item.id ? 1 : 0
          })
          // 如果设置为默认的发票不是当前选中的，则切换选择
          if (!this.selectedInvoice || this.selectedInvoice.id !== item.id) {
            this.selectedInvoice = item
          }
        } else {
          this.$u.toast(response.msg || '设置失败')
        }
      } catch (error) {
        console.error('设置默认发票失败:', error)
        this.$u.toast('网络错误，请重试')
      }
    },

    // 删除发票
    handleDeleteInvoice(item, index, event) {
      if (event && event.stopPropagation) {
        event.stopPropagation()
      }
      uni.showModal({
        title: '确认删除',
        content: `确定要删除发票"${item.title}"吗？`,
        confirmText: '删除',
        confirmColor: '#ff3b30',
        success: async (res) => {
          if (res.confirm) {
           
            try {
              const response = await deleteInvoice({ id: item.id })
              
              if (response.code === 0) {
                this.$u.toast('删除成功')
                this.invoiceList.splice(index, 1)
                
                // 如果删除的是当前选中的发票，重新选择默认发票
                if (this.selectedInvoice && this.selectedInvoice.id === item.id) {
                  this.setDefaultSelection()
                }
              } else {
                this.$u.toast(response.msg || '删除失败')
              }
            } catch (error) {
              console.error('删除发票失败:', error)
              this.$u.toast('网络错误，请重试')
            } finally {
              uni.hideLoading()
            }
          }
        }
      })
    },

    // 确认选择
    confirm() {
      if (!this.selectedInvoice) {
        this.$u.toast('请选择发票')
        return
      }

      // 通过事件总线传递选择的发票信息
      try {
        const eventChannel = this.getOpenerEventChannel()
        if (eventChannel) {
          eventChannel.emit('selectInvoice', this.selectedInvoice)
        }
      } catch (error) {
        console.log('EventChannel not available, using storage fallback')
        // 如果事件通道不可用，使用本地存储作为备选方案
        uni.setStorageSync('selectedInvoice', this.selectedInvoice)
      }

      // 返回上一页
      uni.navigateBack()
    },

    // 取消选择
    cancel() {
      uni.navigateBack()
    }
  },
  
  onShow() {
    // 从添加发票页面返回时刷新列表
    this.loadInvoiceList()
  }
}
</script>

<style scoped>
.invoice-select-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.header-actions {
  margin-bottom: 20rpx;
}

.invoice-list {
  margin-bottom: 30rpx;
}

.invoice-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  position: relative;
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
}


.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.invoice-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #303133;
  flex: 1;
}

.item-badges {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.default-badge {
  background-color: rgba(61, 106, 255, 0.1);
  color: #3D6AFF;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-weight: 500;
}

.selected-badge {
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-content {
  margin-bottom: 8rpx;
}

.info-row {
  display: flex;
  margin-bottom: 16rpx;
  align-items: flex-start;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #909399;
  font-size: 26rpx;
  width: 180rpx;
  flex-shrink: 0;
  line-height: 1.4;
}

.value {
  color: #303133;
  font-size: 26rpx;
  flex: 1;
  word-break: break-all;
  line-height: 1.4;
}

.empty-state {
  padding: 100rpx 0;
}

.loading-wrap {
  padding: 100rpx 0;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  z-index: 10;
  border-top: 1rpx solid #eee;
}

::v-deep .cancel-btn {
  width: 200rpx !important;
  margin-right: 24rpx;
  height: 88rpx !important;
}

::v-deep .confirm-btn {
  flex: 1;
  height: 88rpx !important;
}

/* 选中状态动画 */
.invoice-item {
  transform: scale(1);
}

.invoice-item.selected {
  transform: scale(1.02);
  border-color: #3D6AFF;
  box-shadow: 0 4rpx 20rpx rgba(61, 106, 255, 0.2);
}

.item-actions {
  display: flex !important;
  justify-content: flex-end !important;
  align-items: center;
  gap: 8rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
  padding-right: 0;
}

::v-deep .item-actions .u-button {
  flex: none !important;
  margin-right: 0 !important;
  margin-left: 8rpx !important;
}

::v-deep .item-actions .u-button:first-child {
  margin-left: 0 !important;
}

/* 操作按钮样式优化 */
::v-deep .action-btn {
  font-size: 22rpx !important;
  padding: 8rpx 16rpx !important;
  border-radius: 28rpx !important;
  height: 56rpx !important;
  line-height: 1 !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
  border-width: 1rpx !important;
  flex-shrink: 0 !important;
  width: auto !important;
}

/* 按钮悬停效果 */
::v-deep .default-btn:active {
  background-color: rgba(61, 106, 255, 0.1) !important;
  transform: scale(0.95) !important;
}

::v-deep .edit-btn:active {
  background-color: rgba(144, 147, 153, 0.1) !important;
  transform: scale(0.95) !important;
}

::v-deep .delete-btn:active {
  background-color: rgba(245, 108, 108, 0.1) !important;
  transform: scale(0.95) !important;
}
</style>