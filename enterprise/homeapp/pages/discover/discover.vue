<template>
  <view class="discover-page">


    <!-- 搜索栏 -->
    <view class="search-container" @click="goToSearch">
      <view class="search-box">
        <u-icon name="search" size="32" color="#999"></u-icon>
        <text class="search-placeholder">搜索企业名称、行业、服务等</text>
      </view>
    </view>

    <!-- 分类标签 -->
    <view class="category-tabs">
      <view class="tab-item active">全部</view>
      <view class="tab-item">数字化</view>
      <view class="tab-item">营销</view>
      <view class="tab-item">人事</view>
      <view class="tab-item">财务</view>
    </view>

    <!-- 服务卡片区域 -->
    <view class="service-cards">
      <!-- 主要服务卡片 -->
      <view class="main-card">
        <view class="card-content">
          <view class="card-title">企业专属数字化转型服务包</view>
          <view class="card-subtitle">新客户专享礼包</view>
          <view class="card-action">立即参与 ></view>
        </view>
      </view>

      <!-- 次要服务卡片 -->
      <view class="secondary-card">
        <view class="card-content">
          <view class="card-title">云服务咨询</view>
          <view class="card-action">立即咨询</view>
        </view>
      </view>
    </view>

    <!-- 推荐服务 -->
    <view class="recommend-section">
      <view class="section-header">
        <text class="section-title">推荐服务</text>
        <text class="section-more">查看更多 ></text>
      </view>

      <view class="service-grid">
        <view class="service-item">

          <view class="service-info">
            <view class="service-name">智能客服系统</view>
            <view class="service-rating">
              <text class="rating-score">4.8</text>
              <view class="rating-stars"></view>
              <text class="rating-count">2,345条企业推荐</text>
            </view>
            <view class="service-desc">AI驱动的全渠道客户服务解决方案</view>
          </view>
          <image class="service-icon" src="/static/img/fa1.png" mode="aspectFit"></image>
        </view>

        <view class="service-item">

          <view class="service-info">
            <view class="service-name">企业数据分析</view>
            <view class="service-rating">
              <text class="rating-score">4.7</text>
              <view class="rating-stars"></view>
              <text class="rating-count">1,892家企业在使用</text>
            </view>
            <view class="service-desc">一站式数据可视化与深度业务分析平台</view>
          </view>
          <image class="service-icon" src="/static/img/fa1.png" mode="aspectFit"></image>
        </view>

        <view class="service-item">

          <view class="service-info">
            <view class="service-name">智能会议管理</view>
            <view class="service-rating">
              <text class="rating-score">4.6</text>
              <view class="rating-stars"></view>
              <text class="rating-count">1,456家企业安装</text>
            </view>
            <view class="service-desc">高效的会议管理与协作流程优化系统</view>
          </view>
          <image class="service-icon" src="/static/img/fa1.png" mode="aspectFit"></image>
        </view>

        <view class="service-item">

          <view class="service-info">
            <view class="service-name">财务云</view>
            <view class="service-rating">
              <text class="rating-score">4.9</text>
              <view class="rating-stars"></view>
              <text class="rating-count">3,210家企业选择</text>
            </view>
            <view class="service-desc">一体化财务管理与智能税务筹划工具</view>
          </view>
          <image class="service-icon" src="/static/img/fa1.png" mode="aspectFit"></image>
        </view>
      </view>
    </view>

    <!-- 行业洞察 -->
    <view class="insight-section">
      <view class="section-header">
        <text class="section-title">行业洞察</text>
        <text class="section-more">更多 ></text>
      </view>

      <view class="insight-list">
        <view class="insight-item">
          <image class="insight-image" src="/static/img/fa1.png" mode="aspectFill"></image>
          <view class="insight-content">
            <view class="insight-title">2023年中国企业数字化转型趋势报告</view>
            <view class="insight-meta">2023-06-15 • 12,456阅读 • 研究报告</view>
          </view>
        </view>

        <view class="insight-item">
          <view class="insight-content full-width">
            <view class="insight-title">如何构建高效的企业数据平台</view>
            <view class="insight-meta">2023-06-10 • 8,932阅读 • 最佳实践</view>
          </view>
        </view>

        <view class="insight-item">
          <view class="insight-content full-width">
            <view class="insight-title">企业上云的五大关键步骤</view>
            <view class="insight-meta">2023-06-05 • 7,845阅读 • 技术指南</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 大咖说 -->
    <view class="expert-section">
      <view class="section-header">
        <text class="section-title">大咖说</text>
        <text class="section-more">更多 ></text>
      </view>

      <view class="expert-list">
        <view class="expert-item">
          <view class="expert-header">
            <image class="expert-avatar" src="/static/img/user.png" mode="aspectFill"></image>
            <view class="expert-info">
              <view class="expert-name">张明</view>
              <view class="expert-title">互联网技术专家</view>
            </view>
          </view>
          <view class="expert-content">
            <text class="expert-text">企业数字化转型不是简单的技术升级，而是需要业务模式的重新思考。</text>
            <image class="expert-image" src="/static/img/news2.png" mode="aspectFill"></image>
          </view>
          <view class="expert-stats">
            <view class="stat-item">
              <u-icon name="thumb-up" size="28"></u-icon>
              <text class="stat-text">2,345</text>
            </view>
            <view class="stat-item">
              <u-icon name="file-text" size="28"></u-icon>
              <text class="stat-text">128</text>
            </view>
          </view>
        </view>

        <view class="expert-item">
          <view class="expert-header">
            <image class="expert-avatar" src="/static/img/user.png" mode="aspectFill"></image>
            <view class="expert-info">
              <view class="expert-name">李萍</view>
              <view class="expert-title">企业战略顾问</view>
            </view>
          </view>
          <view class="expert-content">
            <text class="expert-text">数据驱动决策将是未来企业的核心竞争力，关键...</text>
            <image class="expert-image" src="/static/img/news2.png" mode="aspectFill"></image>
          </view>
          <view class="expert-stats">
            <view class="stat-item">
              <u-icon name="thumb-up" size="28"></u-icon>
              <text class="stat-text">1,892</text>
            </view>
            <view class="stat-item">
              <u-icon name="file-text" size="28"></u-icon>
              <text class="stat-text">86</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 最新案例 -->
    <view class="case-section">
      <view class="section-header">
        <text class="section-title">最新案例</text>
        <text class="section-more">查看全部 ></text>
      </view>

      <view class="case-list">
        <view class="case-item">
          <image class="case-icon" src="/static/img/fa1.png" mode="aspectFit"></image>
          <view class="case-content">
            <view class="case-title">智慧物流集团</view>
            <view class="case-tags">
              <text class="case-tag success">应用成功</text>
              <text class="case-tag">智能调度系统</text>
            </view>
            <view class="case-benefits">
              <text class="benefit-item success">应用成效</text>
              <text class="benefit-item">运输效率提升35%</text>
            </view>
            <view class="case-action">了解详情</view>
          </view>
        </view>

        <view class="case-item">
          <image class="case-icon" src="/static/img/fa1.png" mode="aspectFit"></image>
          <view class="case-content">
            <view class="case-title">创新服务</view>
            <view class="case-tags">
              <text class="case-tag warning">应用服务</text>
              <text class="case-tag">智能调度系统</text>
            </view>
            <view class="case-benefits">
              <text class="benefit-item warning">应用成效</text>
              <text class="benefit-item">运输效率提升35%</text>
            </view>
            <view class="case-action">了解详情</view>
          </view>
        </view>
      </view>
    </view>
    <!-- 推荐企业 -->
    <view class="recommended-companies">
      <view class="section-header">
        <text class="section-title">推荐企业</text>
        <text class="section-more" @click="goToCompanyList">查看全部 ></text>
      </view>
      <view class="company-list">
        <view class="company-item" v-for="(item, index) in recommendedCompanies" :key="index"
          @click="goToCompanyDetail(item)">
          <image class="company-logo" :src="item.logo || '/static/img/default-logo.png'" mode="aspectFill"></image>
          <view class="company-info">
            <view class="company-name">{{ item.name }}</view> 
            <view class="company-desc">{{ item.description }}</view>
            <view class="company-tag" :class="item.tagClass">{{ item.typeName }}</view>
            <view v-if="item.tags && item.tags.length" class="company-tags-list">
              <text v-for="(tag, tIdx) in parseCompanyTags(item.tags)" :key="tIdx">
                {{ tag.name }}<span v-if="tIdx < parseCompanyTags(item.tags).length - 1">，</span>
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getHotEntList } from '@/utils/api.js'

export default {
  name: 'DiscoverPage',
  data() {
    return {
      activeTab: 0,
      // 推荐企业数据
      recommendedCompanies: [],
      loadingCompanies: false
    }
  },

  mounted() {
    // 加载推荐企业
    this.loadRecommendedCompanies()
  },
  methods: {
    // 跳转到搜索页面
    goToSearch() {
      uni.navigateTo({
        url: '/pages/home/search'
      })
    },

    // 显示筛选
    showFilter() {
      console.log('显示筛选')
    },

    // 搜索功能
    onSearch() {
      console.log('搜索功能')
    },

    // 切换分类
    switchTab(index) {
      this.activeTab = index
    },

    // 服务卡片点击
    onServiceClick(service) {
      console.log('点击服务：', service)
    },

    // 加载推荐企业
    async loadRecommendedCompanies() {
      this.loadingCompanies = true

      try {
        const response = await getHotEntList({
          page: '1',
          page_size: 5 // 只获取5个企业
        })

        if (response.code === 0 && response.data) {
          this.recommendedCompanies = this.formatCompanyData(response.data)
        }
      } catch (error) {
        console.error('加载推荐企业失败:', error)
      } finally {
        this.loadingCompanies = false
      }
    },

    // 格式化企业数据
    formatCompanyData(data) {
      if (!data) return [];

      // 如果是数组，直接处理
      if (Array.isArray(data)) {
        return data.map(item => ({
          id: item.entity_id,
          entity_id: item.entity_id,
          name: item.name || '未命名企业',
          logo: item.logo || '/static/img/default-logo.png',
          role: item.role, // 没有type字段，默认企业
          description: item.descp || '暂无简介',
          industry: item.industry_name || '', // 如果有行业字段可补充
          region: item.address || item.region_name || '',
          tags:item.tags || [],
          tagClass: this.getTagClass(item.role), // 添加 tagClass 数据
          typeName: this.getTypeName(item.role) // 添加 typeName 数据
        }));
      } 

      return [];
    },

    // 获取企业类型名称
    getTypeName(type) {
     
      switch (type) {
        case 7:
          return '服务商'
        case 8:
          return '企业'
        case 9:
          return '协会'
        default:
          return '未知'
      }
    },
    parseCompanyTags(tags) {
      // tags 可能是 [{tags: '[{"id": 6, "name": "税务筹划"}]'}]
      if (!tags || !tags.length) return [];
      let result = [];
      tags.forEach(t => {
        if (typeof t.tags === 'string') {
          try {
            const arr = JSON.parse(t.tags);
            if (Array.isArray(arr)) result = result.concat(arr);
          } catch (e) {}
        } else if (Array.isArray(t.tags)) {
          result = result.concat(t.tags);
        }
      });
      return result;
    },
    // 获取标签样式类
    getTagClass(type) {
      switch (type) {
        case 7:
          return 'tag-provider'
        case 8:
          return 'tag-enterprise'
        case 9:
          return 'tag-association'
        default:
          return ''
      }
    },

    // 跳转到企业详情页
    goToCompanyDetail(item) {
      let url = ''

      switch (item.role) { 
        case 7:
          url = `/pages/provider/home?id=${item.id}`
          break
        case 8:
          url = `/pages/company/home?enterpriseId=${item.id}`
          break
        case 9:
          url = `/pages/association/home?id=${item.id}`
          break
        default:
          url = `/pages/company/home?enterpriseId=${item.id}`
      }

      uni.navigateTo({ url })
    },

    // 跳转到企业列表页
    goToCompanyList() {
      uni.navigateTo({
        url: '/pages/home/qylist'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.discover-page {
  padding-bottom: 100rpx;
  background-color: #f8f9fa;
}

// 搜索栏
.search-container {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background-color: #fff;
  margin-bottom: 16rpx;

  .search-box {
    flex: 1;
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 40rpx;
    padding: 16rpx 24rpx;
    height: 72rpx;
    box-sizing: border-box;

    .search-icon {
      margin-right: 16rpx;
      flex-shrink: 0;
    }

    .search-placeholder {
      font-size: 28rpx;
      color: #999;
      flex: 1;
    }
  }

  .filter-icon {
    width: 68rpx;
    height: 68rpx;
    margin-left: 24rpx;
  }
}

// 分类标签
.category-tabs {
  display: flex;
  padding: 32rpx 24rpx;
  background-color: #fff;
  gap: 40rpx;

  .tab-item {
    font-size: 28rpx;
    color: #666;
    position: relative;

    &.active {
      color: #3D6AFF;
      font-weight: 400;

      &::after {
        content: '';
        position: absolute;
        bottom: -8rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 6rpx;
        background-color: #3D6AFF;
        border-radius: 3rpx;
      }
    }
  }
}

// 服务卡片
.service-cards {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;

  .main-card {
    flex: 2;
    background: linear-gradient(135deg, #3D6AFF 0%, #5B7CFF 100%);
    border-radius: 24rpx;
    padding: 40rpx 32rpx;

    .card-content {
      .card-title {
        font-size: 32rpx;
        font-weight: 400;
        color: #fff;
        margin-bottom: 12rpx;
        line-height: 1.4;
      }

      .card-subtitle {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 32rpx;
      }

      .card-action {
        font-size: 28rpx;
        color: #fff;
        font-weight: 400;
      }
    }
  }

  .secondary-card {
    flex: 1;
    background: linear-gradient(135deg, #5B9BFF 0%, #7DB8FF 100%);
    border-radius: 24rpx;
    padding: 40rpx 24rpx;

    .card-content {
      .card-title {
        font-size: 28rpx;
        font-weight: 400;
        color: #fff;
        margin-bottom: 24rpx;
        line-height: 1.4;
      }

      .card-action {
        font-size: 24rpx;
        color: #fff;
        font-weight: 400;
      }
    }
  }
}

// 推荐服务
.recommend-section {
  padding: 32rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 400;
      color: #333;
    }

    .section-more {
      font-size: 24rpx;
      color: #3D6AFF;
    }
  }

  .service-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24rpx;

    .service-item {
      background-color: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      display: flex;
      align-items: flex-start;

      .service-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 16rpx;
        margin-bottom: 16rpx;
        flex: 1;
      }

      .service-info {
        width: 80%;

        .service-name {
          font-size: 28rpx;
          font-weight: 400;
          color: #333;
          margin-bottom: 8rpx;
        }

        .service-rating {
          display: flex;
          align-items: center;
          margin-bottom: 12rpx;

          .rating-score {
            font-size: 24rpx;
            color: #3D6AFF;
            font-weight: 400;
            margin-right: 8rpx;
          }

          .rating-count {
            font-size: 20rpx;
            color: #999;
            margin-left: 8rpx;
          }
        }

        .service-desc {
          font-size: 22rpx;
          color: #666;
          line-height: 1.4;
        }
      }
    }
  }
}

// 行业洞察
.insight-section {
  padding: 32rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 400;
      color: #333;
    }

    .section-more {
      font-size: 24rpx;
      color: #3D6AFF;
    }
  }

  .insight-list {
    .insight-item {
      display: flex;
      background-color: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;

      .insight-image {
        width: 120rpx;
        height: 80rpx;
        border-radius: 12rpx;
        margin-right: 20rpx;
      }

      .insight-content {
        flex: 1;

        &.full-width {
          width: 100%;
        }

        .insight-title {
          font-size: 28rpx;
          font-weight: 400;
          color: #333;
          line-height: 2;
          margin-bottom: 12rpx;
        }

        .insight-meta {
          line-height: 2;
          font-size: 22rpx;
          color: #999;
        }
      }
    }
  }
}

// 大咖说
.expert-section {
  padding: 32rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 400;
      color: #333;
    }

    .section-more {
      font-size: 24rpx;
      color: #3D6AFF;
    }
  }

  .expert-list {
    .expert-item {
      background-color: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 16rpx;

      .expert-header {
        display: flex;
        align-items: center;
        margin-bottom: 20rpx;

        .expert-avatar {
          width: 80rpx;
          height: 80rpx;
          border-radius: 50%;
          margin-right: 16rpx;
        }

        .expert-info {
          .expert-name {
            font-size: 28rpx;
            font-weight: 400;
            color: #333;
            margin-bottom: 4rpx;
          }

          .expert-title {
            font-size: 22rpx;
            color: #999;
          }
        }
      }

      .expert-content {
        margin-bottom: 20rpx;

        .expert-text {
          font-size: 26rpx;
          color: #333;
          line-height: 1.5;
          margin-bottom: 16rpx;
        }

        .expert-image {
          width: 100%;
          height: 300rpx;
          border-radius: 12rpx;
        }
      }

      .expert-stats {
        display: flex;
        gap: 40rpx;

        .stat-item {
          display: flex;
          align-items: center;

          .stat-icon {
            width: 32rpx;
            height: 32rpx;
            margin-right: 8rpx;
          }

          .stat-text {
            font-size: 24rpx;
            color: #666;
          }
        }
      }
    }
  }
}

// 最新案例
.case-section {
  padding: 32rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 400;
      color: #333;
    }

    .section-more {
      font-size: 24rpx;
      color: #3D6AFF;
    }
  }

  .case-list {
    display: flex;
    gap: 24rpx;

    .case-item {
      flex: 1;
      background-color: #fff;
      border-radius: 16rpx;
      padding: 24rpx;

      .case-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 16rpx;
        margin-bottom: 16rpx;
      }

      .case-content {
        .case-title {
          font-size: 28rpx;
          font-weight: 400;
          color: #333;
          margin-bottom: 12rpx;
        }

        .case-tags {
          margin-bottom: 16rpx;

          .case-tag {
            display: inline-block;
            padding: 8rpx 16rpx;
            border-radius: 20rpx;
            font-size: 20rpx;
            margin-right: 8rpx;
            margin-bottom: 8rpx;

            &.success {
              background-color: #E8F5E8;
              color: #52C41A;
            }

            &.warning {
              background-color: #FFF2E8;
              color: #FA8C16;
            }

            &:not(.success):not(.warning) {
              background-color: #F0F0F0;
              color: #666;
            }
          }
        }

        .case-benefits {
          margin-bottom: 20rpx;

          .benefit-item {
            display: inline-block;
            padding: 8rpx 16rpx;
            border-radius: 20rpx;
            font-size: 20rpx;
            margin-right: 8rpx;
            margin-bottom: 8rpx;

            &.success {
              background-color: #E8F5E8;
              color: #52C41A;
            }

            &.warning {
              background-color: #FFF2E8;
              color: #FA8C16;
            }

            &:not(.success):not(.warning) {
              background-color: #F0F0F0;
              color: #666;
            }
          }
        }

        .case-action {
          color: #3D6AFF;
          font-size: 24rpx;
          padding: 16rpx 32rpx;
          border: 2rpx solid #3D6AFF;
          border-radius: 48rpx;
          text-align: center;
        }
      }
    }
  }
}

// 推荐企业
.recommended-companies {
  padding: 32rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 400;
      color: #333;
    }

    .section-more {
      font-size: 24rpx;
      color: #3D6AFF;
    }
  }

  .company-scroll {
    width: 100%;
  }

  .company-list {
    display: flex;
    flex-direction: column;
    padding: 10rpx 0;

    .company-item {
      width: 100%;
      margin-bottom: 24rpx;
      background-color: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      .company-logo {
        width: 80rpx;
        height: 80rpx;
        border-radius: 16rpx;
        margin-right: 24rpx;
        margin-bottom: 0;
        flex-shrink: 0;
      }

      .company-info {
        flex: 1;
        .company-name {
          font-size: 28rpx;
          font-weight: 400;
          color: #333;
          margin-bottom: 8rpx;
        }

        .company-tag {
          display: inline-block;
          font-size: 20rpx;
          padding: 4rpx 12rpx;
          border-radius: 6rpx;
          margin-bottom: 8rpx;

          &.tag-enterprise {
            background-color: rgba(61, 106, 255, 0.1);
            color: #3D6AFF;
          }

          &.tag-provider {
            background-color: rgba(255, 87, 51, 0.1);
            color: #FF5733;
          }

          &.tag-association {
            background-color: rgba(76, 175, 80, 0.1);
            color: #4CAF50;
          }
        }
        .company-tags-list {
          display: inline;
          font-size: 20rpx;
          color: #888;
          margin-left: 12rpx;
        }
        .company-desc {
          font-size: 22rpx;
          color: #666;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }
    }
  }
}

// 响应式处理
::v-deep .uni-grid-item {
  border: none !important;
}
</style>