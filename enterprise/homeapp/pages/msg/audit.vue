<template>
    <view class="audit-page">  
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
  
      <!-- 审批列表 -->
      <view class="audit-list">
        <!-- 加载状态 -->
        <view class="loading-container" v-if="loading">
          <u-loading-icon mode="spinner" size="40"></u-loading-icon>
          <text class="loading-text">加载中...</text>
        </view>
  
        <!-- 空状态 -->
        <view class="empty-container" v-else-if="auditList.length === 0">
          <image src="/static/icon/empty.png" class="empty-icon"></image>
          <text class="empty-text">暂无审批通知</text>
        </view>
  
        <!-- 审批列表 -->
        <view v-else>
          <view 
            class="audit-item" 
            v-for="(item, index) in auditList" 
            :key="index"
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
                <view class="status-tag" :class="item.statusClass">
                  {{ getStatusName(item.status) }}
                </view>
              </view>
            </view>
            
            <view class="item-content">
              <text class="content-text">{{ item.content || '无内容' }}</text>
            </view>
            
            <view class="item-footer">
              <view class="footer-left">
                <text class="applicant">申请企业：{{ item.applicant_name || '未知' }}</text>
                <text class="auditor" v-if="item.auditor_name">审核人：{{ item.auditor_name }}</text>
                <text class="remark" v-if="item.remark">审核意见：{{ item.remark }}</text>
              </view>
            </view>
          </view>
        </view>
  

      </view>
  
    </view>
  </template>
  
  <script>
  import {
    getAuditRecordList
  } from '@/utils/api.js';
  
  export default {
    data() {
      return {
        activeTab: 0,
        tabs: [
          { name: '全部', count: 0 },
          { name: '待审核', count: 0 },
          { name: '已通过', count: 0 },
          { name: '已拒绝', count: 0 }
        ],
        auditList: [],
        loading: false,
        totalCount: 0
      }
    },
    onLoad() {
      this.fetchAuditList();
    },
    onShow() {
      this.fetchAuditList();
    },
    onPullDownRefresh() {
      this.refreshData();
    },
    methods: {
      // 切换标签
      switchTab(index) {
        this.activeTab = index;
        this.auditList = [];
        this.fetchAuditList();
      },
      // 获取审核记录列表
      fetchAuditList() {
        this.loading = true;
        
        getAuditRecordList().then(res => {
          if (res.code === 0 && res.data) {
            const auditRecords = res.data || [];
            
            // 根据标签筛选
            let filteredList = auditRecords;
            if (this.activeTab === 1) {
              filteredList = auditRecords.filter(item => item.status === 1); // 待审核
            } else if (this.activeTab === 2) {
              filteredList = auditRecords.filter(item => item.status === 2); // 已通过
            } else if (this.activeTab === 3) {
              filteredList = auditRecords.filter(item => item.status === 3); // 已拒绝
            }
            
            const formattedList = filteredList.map(item => {
              const itemType = this.getAuditTypeName(item.audit_type);
              
              return {
                id: item.id,
                title: item.title,
                content: item.content || '',
                applicant_name: item.entity_name,
                status: item.status,
                remark: item.remark,
                auditor_name: item.auditor_name,
                created_at: item.create_time,
                audit_time: item.audit_time,
                type: itemType,
                iconClass: this.getIconClass(itemType),
                statusClass: this.getStatusClass(item.status)
              };
            });
            
            this.auditList = formattedList;
            this.totalCount = auditRecords.length;
            this.updateTabCounts();
          }
          this.loading = false;
        }).catch(err => {
          this.loading = false;
          uni.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
        });
      },
      // 更新标签页计数
      updateTabCounts() {
        // 更新各标签的计数（基于全部数据）
        getAuditRecordList().then(res => {
          if (res.code === 0 && res.data) {
            const allRecords = res.data || [];
            this.tabs[0].count = allRecords.length;
            this.tabs[1].count = allRecords.filter(item => item.status === 1).length;
            this.tabs[2].count = allRecords.filter(item => item.status === 2).length;
            this.tabs[3].count = allRecords.filter(item => item.status === 3).length;
          }
        });
      },
      // 获取审核类型名称
      getAuditTypeName(type) {
        const typeMap = {
          1: 'enterprise',  // 企业认证
          2: 'service',     // 服务产品
          3: 'demand'       // 需求发布
        };
        return typeMap[type] || 'other';
      },

      // 刷新数据
      refreshData() {
        this.auditList = [];
        this.fetchAuditList();
        uni.stopPullDownRefresh();
      },
      // 获取图标样式类
      getIconClass(type) {
        const classMap = {
          'service': 'service-icon',
          'product': 'product-icon',
          'enterprise': 'enterprise-icon',
          'demand': 'demand-icon'
        };
        return classMap[type] || 'default-icon';
      },
      // 获取图标路径
      getIconSrc(type) {
        const iconMap = {
          'service': '/static/icon/icon11.png',
          'product': '/static/icon/icon10.png',
          'enterprise': '/static/icon/icon12.png',
          'demand': '/static/icon/icon1.png'
        };
        return iconMap[type] || '/static/icon/icon1.png';
      },
      // 获取状态名称
      getStatusName(status) {
        const statusMap = {
          1: '待审批',
          2: '已通过',
          3: '已拒绝'
        };
        return statusMap[status] || '待审批';
      },
      // 获取状态样式类
      getStatusClass(status) {
        const classMap = {
          1: 'status-pending',
          2: 'status-approved',
          3: 'status-rejected'
        };
        return classMap[status] || 'status-pending';
      },
      // 格式化时间
      formatTime(timestamp) {
        if (!timestamp) return '';
        
        const date = new Date(timestamp * 1000); // Unix时间戳转换
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
  .audit-page {
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
  
  .audit-list {
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
  
  .audit-item {
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
          
          &.service-icon {
            background-color: #e6f0ff;
          }
          
          &.product-icon {
            background-color: #fff3e6;
          }
          
          &.enterprise-icon {
            background-color: #e6fff0;
          }
          
          &.demand-icon {
            background-color: #ffe6f0;
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
        
        .status-tag {
          font-size: 20rpx;
          padding: 8rpx 16rpx;
          border-radius: 20rpx;
          
          &.status-pending {
            background-color: #fff3e6;
            color: #ff9500;
          }
          
          &.status-approved {
            background-color: #e6fff0;
            color: #00c851;
          }
          
          &.status-rejected {
            background-color: #ffe6e6;
            color: #ff4757;
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
        
        .applicant,
        .auditor,
        .remark {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
  </style>