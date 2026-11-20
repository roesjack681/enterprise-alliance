<template>
  <view class="container">
    <!-- 标签导航 -->
    <view class="tabs-section">
      <u-tabs :list="tabs" @click="switchTab" :lineColor="'#3D6AFF'"  :lineHeight="6"></u-tabs>
    </view>
    <!-- 文章统计 -->
    <view class="article-count">
      <text class="count-text">共{{ total }}篇文章</text>
    </view>
    <!-- 文章列表 -->
    <scroll-view class="article-list" scroll-y @scrolltolower="loadMore">
      <view class="article-item" v-for="(article, index) in articleList" :key="article.id">
        <view class="article-content">
          <image :src="article.cover_image || '/static/images/default.jpg'" class="article-cover"></image>
          <view class="article-info"> 
            <view class="product-header">
              <text class="product-name">{{ article.title }}</text>
              <u-icon name="more-dot-fill" color="#999" size="32" @click="showMore(article, index)"></u-icon>
            </view>
            <text class="article-desc">{{ article.summary }}</text>
            <view class="article-meta">
              <text class="article-date">{{ formatDate(article.updated_at) }}</text>
              <view class="article-status" :class="article.statusClass">
                <text class="status-text">{{ article.statusText }}</text>
              </view>
            </view>
          </view>
        </view>
        
      </view>
    </scroll-view>
    <!-- 悬浮按钮 -->
    <view class="fab-btn" @click="createArticle">
      <u-icon name="plus" size="48" color="#fff"></u-icon>
    </view>
  
  </view>
</template>

<script>
import { getArticleList, deleteArticle } from '@/utils/api.js';
export default {
  data() {
    return {
      userInfo: {},
      currentTab: 0,
      moreVisible: false,
      selectedArticle: null,
      tabs: [
        { name: '全部' },
        { name: '已发布' },
        { name: '草稿' }
      ],
      articleList: [],
      page: 1,
      pageSize: 20,
      total: 0,
      loading: false,
      moreActions: [
        { text: '编辑', value: 'edit' },
        { text: '删除', value: 'delete' },
        { text: '分享', value: 'share' }
      ]
    }
  },
  onLoad() {
    this.userInfo = uni.getStorageSync('$userinfo')
  },
  onShow() {
    this.page = 1;
    this.fetchArticleList();
  },
  methods: {
    async fetchArticleList() {
      this.loading = true;
      let is_published='';
      if (this.currentTab === 1) is_published = 1;
      else if (this.currentTab === 2) is_published = 0;
      try {
        const res = await getArticleList({
          page: this.page,
          page_size: this.pageSize,
          enterprise_id: this.userInfo.id,
          is_published
        });
        if (res && res.code === 0 && res.data && res.data.data) {
          // 处理数据，添加状态相关的属性
          this.articleList = res.data.data.map(item => ({
            ...item,
            statusClass: this.getStatusClass(item.is_published),
            statusText: this.getStatusText(item.is_published)
          }));
          this.total = res.data.total;
        } else {
          this.articleList = [];
        }
      } catch (e) {
        this.articleList = [];
      } finally {
        this.loading = false;
      }
    },
    switchTab(tab) {
      this.currentTab = tab.index; 
      this.page = 1;
      this.fetchArticleList();
    },
    viewArticle(article) {
      uni.navigateTo({
        url: `/pages/enterprise/article_edit?id=${article.id}`
      });
    },
    loadMore() {
      if (this.articleList.length >= this.total) return;
      this.page++;
      this.fetchArticleList();
    }, 
    showMore(item, index) {
			uni.showActionSheet({
				itemList: ['编辑', '分享', '删除'],
				success: (res) => {
					switch (res.tapIndex) {
						case 0:
							this.editArticle(item)
							break
						case 1:
							this.shareArticle(item)
							break
						case 2:
							this.deleteArticle(item, index)
							break
					}
				}
			})
		},
    deleteArticle(item, index) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这篇文章吗？',
        success: async (res) => {
          if (res.confirm) {
            const r = await deleteArticle({ id: item.id });
            if (r && r.code === 0) {
              this.articleList.splice(index, 1);
              uni.showToast({ title: '删除成功', icon: 'success' });
            } else {
              uni.showToast({ title: '删除失败', icon: 'none' });
            }
          }
        }
      });
    },
    editArticle(item) {
			uni.navigateTo({
				url: `/pages/enterprise/article_edit?id=${item.id}`
			})
		},
    shareArticle() {
      uni.showToast({ title: '分享功能开发中', icon: 'none' });
    },
    createArticle() {
      uni.navigateTo({ url: '/pages/enterprise/article_edit' });
    },
    getStatusClass(is_published) {
      return is_published ? 'status-published' : 'status-draft';
    },
    getStatusText(is_published) {
      return is_published ? '已发布' : '草稿';
    },
    formatDate(ts) {
      if (!ts) return '';
      const d = new Date(ts * 1000);
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}


.tabs-section {
  background: #fff;
  padding: 24rpx 0 12rpx 0;
  margin-bottom: 24rpx;
 
  display: flex;
  justify-content: center;
  align-items: center;
}

.article-count {
  padding: 40rpx 40rpx 20rpx;
  background: #fff;

  .count-text {
    font-size: 24rpx;
    color: #999;
  }
}

.article-list {
  background: #fff;
  min-height: 800rpx;
  padding: 0 40rpx;

  .article-item {
    display: flex;
    align-items: center;
    padding: 40rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .article-content {
      flex: 1;
      display: flex;
      gap: 24rpx;

      .article-cover {
        width: 120rpx;
        height: 120rpx;
        border-radius: 16rpx;
        object-fit: cover;
        background: #f5f5f5;
      }

      .article-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .product-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12rpx;
          .product-name {
            font-size: 32rpx;
            font-weight: 600;
            color: #333;
            line-height: 1.4;
            flex: 1;
          }
        }

        .article-desc {
          font-size: 26rpx;
          color: #666;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-box-orient: vertical;

          overflow: hidden;
          margin-bottom: 16rpx;
        }

        .article-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .article-date {
            font-size: 24rpx;
            color: #999;
          }

          .article-status {
            padding: 8rpx 16rpx;
            border-radius: 20rpx;
            font-size: 22rpx;

            &.status-published {
              background: #e8f5e8;
              color: #52c41a;
            }

            &.status-draft {
              background: #f0f0f0;
              color: #666;
            }
          }
        }
      }
    }

    .article-more {
      margin-left: 20rpx;
      padding: 10rpx;
    }
  }
}

.fab-btn {
  position: fixed;
  bottom: 40rpx;
  right: 40rpx;
  width: 120rpx;
  height: 120rpx;
  background: #3D6AFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(61, 106, 255, 0.3);
  z-index: 999;
}

::v-deep .u-action-sheet {
  border-radius: 40rpx 40rpx 0 0;
}
</style>