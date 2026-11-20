<template>
  <view class="consultation-detail">
    <!-- 加载状态 -->
    <view class="loading-container" v-if="loading">
      <u-loading-icon mode="spinner" size="40"></u-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 咨询详情 -->
    <view v-else-if="consultationDetail" class="detail-container">
      <!-- 咨询头部 -->
      <view class="consultation-header">
        <view class="header-left">
          <view class="consultation-icon">
            <image src="/static/icon/icon5.png" class="icon-img"></image>
          </view>
          <view class="consultation-info">
            <text class="consultation-title">{{ consultationDetail.title }}</text>
            <view class="consultation-meta">
              <text class="consultation-time">{{ formatTime(consultationDetail.created_at) }}</text>
              <text class="consultation-category">{{ getCategoryName(consultationDetail.category) }}</text>
            </view>
          </view>
        </view>
        <view class="header-right">
          <view class="priority-tag" :class="consultationDetail.priorityClass">
            {{ getPriorityName(consultationDetail.priority) }}
          </view>
          <view class="status-tag" :class="consultationDetail.statusClass">
            {{ getStatusName(consultationDetail.status) }}
          </view>
        </view>
      </view>

      <!-- 咨询内容 -->
      <view class="consultation-content">
        <view class="content-title">咨询内容</view>
        <text class="content-text">{{ consultationDetail.content }}</text>
        
        <!-- 图片列表 -->
        <view class="image-list" v-if="consultationDetail.images && consultationDetail.images.length > 0">
          <image 
            v-for="(img, index) in consultationDetail.images" 
            :key="index"
            :src="img"
            class="content-image"
            @click="previewImage(img, consultationDetail.images)"
          ></image>
        </view>
      </view>

      <!-- 回复内容 -->
      <view class="reply-content" v-if="consultationDetail.reply_content">
        <view class="reply-title">回复内容</view>
        <text class="reply-text">{{ consultationDetail.reply_content }}</text>
        <view class="reply-time">
          回复时间：{{ formatTime(consultationDetail.reply_time) }}
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <u-button 
          type="primary" 
          @click="showReplyModal" 
          v-if="consultationDetail.status === 1"
          :loading="replying"
        >
          回复咨询
        </u-button>
        <u-button 
          type="default" 
          @click="closeConsultation"
          v-if="consultationDetail.status !== 3"
          :loading="closing"
        >
          关闭咨询
        </u-button>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-container" v-else>
      <image src="/static/icon/empty.png" class="empty-icon"></image>
      <text class="empty-text">咨询不存在或已删除</text>
      <u-button type="primary" @click="goBack">返回</u-button>
    </view>

    <!-- 回复弹窗 -->
    <u-popup v-model="showReply" mode="bottom" border-radius="20">
      <view class="reply-modal">
        <view class="modal-header">
          <text class="modal-title">回复咨询</text>
          <u-icon name="close" @click="showReply = false" size="40"></u-icon>
        </view>
        <view class="modal-content">
          <u-textarea
            v-model="replyContent"
            placeholder="请输入回复内容..."
            :maxlength="500"
            :height="200"
            count
          ></u-textarea>
        </view>
        <view class="modal-footer">
          <u-button type="default" @click="showReply = false">取消</u-button>
          <u-button type="primary" @click="submitReply" :loading="replying">确认回复</u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import {
  getConsultationDetail,
  replyConsultation,
  closeConsultation
} from '@/utils/api.js';

export default {
  data() {
    return {
      consultationId: '',
      consultationDetail: null,
      loading: true,
      replying: false,
      closing: false,
      showReply: false,
      replyContent: ''
    }
  },
  onLoad(options) {
    this.consultationId = options.id;
    this.fetchConsultationDetail();
  },
  methods: {
    // 获取咨询详情
    fetchConsultationDetail() {
      this.loading = true;
      
      getConsultationDetail({ consultation_id: this.consultationId }).then(res => {
        if (res.data && res.data.msg === 'ok') {
          const detail = res.data.data;
          // 预计算样式类，避免模板中的方法调用
          this.consultationDetail = {
            ...detail,
            priorityClass: this.getPriorityClass(detail.priority),
            statusClass: this.getStatusClass(detail.status)
          };
        }
        this.loading = false;
      }).catch(err => {
        console.error('获取咨询详情失败:', err);
        this.loading = false;
      });
    },
    // 显示回复弹窗
    showReplyModal() {
      this.replyContent = '';
      this.showReply = true;
    },
    // 提交回复
    submitReply() {
      if (!this.replyContent.trim()) {
        uni.showToast({
          title: '请输入回复内容',
          icon: 'none'
        });
        return;
      }
      
      this.replying = true;
      
      replyConsultation({
        consultation_id: this.consultationId,
        content: this.replyContent
      }).then(res => {
        if (res.data && res.data.msg === 'ok') {
          uni.showToast({
            title: '回复成功',
            icon: 'success'
          });
          this.showReply = false;
          this.fetchConsultationDetail(); // 刷新详情
        }
        this.replying = false;
      }).catch(err => {
        console.error('回复失败:', err);
        uni.showToast({
          title: '回复失败',
          icon: 'error'
        });
        this.replying = false;
      });
    },
    // 关闭咨询
    closeConsultation() {
      uni.showModal({
        title: '确认关闭',
        content: '确定要关闭这个咨询吗？',
        success: (res) => {
          if (res.confirm) {
            this.closing = true;
            
            closeConsultation({ consultation_id: this.consultationId }).then(res => {
              if (res.data && res.data.msg === 'ok') {
                uni.showToast({
                  title: '已关闭',
                  icon: 'success'
                });
                this.fetchConsultationDetail(); // 刷新详情
              }
              this.closing = false;
            }).catch(err => {
              console.error('关闭咨询失败:', err);
              uni.showToast({
                title: '操作失败',
                icon: 'error'
              });
              this.closing = false;
            });
          }
        }
      });
    },
    // 预览图片
    previewImage(current, urls) {
      uni.previewImage({
        current,
        urls
      });
    },
    // 获取分类名称
    getCategoryName(category) {
      const categoryMap = {
        1: '产品咨询',
        2: '服务咨询',
        3: '技术咨询',
        4: '其他'
      };
      return categoryMap[category] || '未知';
    },
    // 获取优先级名称
    getPriorityName(priority) {
      const priorityMap = {
        1: '低',
        2: '中',
        3: '高',
        4: '紧急'
      };
      return priorityMap[priority] || '未知';
    },
    // 获取优先级样式类
    getPriorityClass(priority) {
      const classMap = {
        1: 'priority-low',
        2: 'priority-medium',
        3: 'priority-high',
        4: 'priority-urgent'
      };
      return classMap[priority] || 'priority-low';
    },
    // 获取状态名称
    getStatusName(status) {
      const statusMap = {
        1: '待回复',
        2: '已回复',
        3: '已关闭'
      };
      return statusMap[status] || '未知';
    },
    // 获取状态样式类
    getStatusClass(status) {
      const classMap = {
        1: 'status-pending',
        2: 'status-replied',
        3: 'status-closed'
      };
      return classMap[status] || 'status-pending';
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
.consultation-detail {
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

.consultation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40rpx;
  
  .header-left {
    display: flex;
    align-items: flex-start;
    flex: 1;
    
    .consultation-icon {
      width: 80rpx;
      height: 80rpx;
      background-color: #e6fff0;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;
      
      .icon-img {
        width: 40rpx;
        height: 40rpx;
      }
    }
    
    .consultation-info {
      flex: 1;
      
      .consultation-title {
        font-size: 32rpx;
        font-weight: 500;
        color: #333;
        line-height: 1.4;
        margin-bottom: 10rpx;
        display: block;
      }
      
      .consultation-meta {
        display: flex;
        gap: 20rpx;
        
        .consultation-time,
        .consultation-category {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
  
  .header-right {
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
      
      &.status-replied {
        background-color: #e6fff0;
        color: #00c851;
      }
      
      &.status-closed {
        background-color: #f5f5f5;
        color: #999;
      }
    }
  }
}

.consultation-content {
  margin-bottom: 40rpx;
  
  .content-title {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .content-text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 20rpx;
  }
  
  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    
    .content-image {
      width: 200rpx;
      height: 200rpx;
      border-radius: 12rpx;
      object-fit: cover;
    }
  }
}

.reply-content {
  background-color: #f8f9fa;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  
  .reply-title {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .reply-text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 20rpx;
  }
  
  .reply-time {
    font-size: 24rpx;
    color: #999;
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

.reply-modal {
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
  padding: 40rpx;
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .modal-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
    }
  }
  
  .modal-content {
    margin-bottom: 30rpx;
  }
  
  .modal-footer {
    display: flex;
    gap: 20rpx;
    
    .u-button {
      flex: 1;
    }
  }
}
</style> 