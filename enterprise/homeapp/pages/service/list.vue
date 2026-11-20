<template>
  <view class="container"> 
    <!-- 搜索栏 -->
    <view class="search-container">
      <u-search 
        v-model="searchKeyword" 
        placeholder="搜索服务名称、描述、标签" 
        @search="onSearch" 
        @custom="onSearch" 
        @clear="onClearSearch" 
        height="70" 
        searchIconSize="36" 
        actionText="搜索"
        :showAction="searchKeyword.length > 0"
        bg-color="#f5f5f5"
        border-color="transparent"
      ></u-search>
    </view>

    <!-- 分类标签 -->
    <view style="background:#fff;"> 
      <u-tabs :list="tabs" @click="tabCur" :current="activeTab" lineColor="#3D6AFF" lineWidth="80rpx" lineHeight="10"
			:inactiveStyle="{fontSize: '28rpx'}" :activeStyle="{fontSize: '28rpx', color: '#3D6AFF'}"></u-tabs>

    </view>

    <!-- 筛选器 -->
    <view class="filter-container">
      <view 
        class="filter-item"
        v-for="(filter, index) in filters"
        :key="index"
        @click="toggleFilter(index)"
      >
        <text class="filter-text">{{ filter.name }}</text> 
        <u-icon :name="filter.active ? 'arrow-down' : 'arrow-up'" size="24" color="#333" class="margin-top-xs"></u-icon>
      </view>
    </view>

    <!-- 产品列表 -->
    <view class="product-list">
      <view 
        class="product-card"
        v-for="(product, index) in productList"
        :key="index"
        @click="goDetail(product)"
      >
        <view class="product-image-container">
          <image class="product-image" :src="product.images&&product.images[0]" mode="aspectFill"></image>
          <view class="product-tag" :class="{ 'product-tag-new': product.tag === '新品' }" v-if="product.tag">{{ product.tag }}</view>
        </view>
        
        <view class="product-info">
          <view class="product-title">{{ product.title }}<span v-if="index==0" class="cu-tag bg-red round sm">立减100元</span></view>
          <view class="product-category">{{ product.category }}</view>
          
          <view class="product-rating">
            <u-rate 
              :value="product.rating || 5" 
              :disabled="true" 
              :size="24"
              active-color="#FFD700"
              inactive-color="#E0E0E0"
              :custom-style="{ color: '#FFD700' }"
            ></u-rate>
            <text class="rating-text" v-if="product.ratingScore">({{ product.ratingScore }}分)</text>
          </view>
          
          <view class="product-bottom">
            <view class="price-container">
              <text class="price">¥{{ product.price }}</text> 
              <text class="price-unit" v-if="product.unit">/{{ product.unit }}</text>
            </view>
            <view class="sales-info">
              <text class="sales-text">已售 {{ product.sales }}</text>
            </view>
          </view>
          <view class="tags" v-if="product.tags && product.tags.length">
            <view class="tag" v-for="(tag, i) in product.tags" :key="i">{{ tag.name || tag }}</view>
          </view>
        </view>
         
      </view>
    </view>
  </view>
</template>

<script>
import { getCategory,getServiceProductList } from '@/utils/api'
export default {
  data() {
    return {
      activeTab: 1, // 默认选中热门服务
      tabs: [], // 动态获取一级分类
      filters: [
        { name: '综合排序', active: false },
        { name: '销量优先', active: false },
        { name: '价格筛选', active: false },
        { name: '服务类型', active: false }
      ],
      productList: [],
      currentCategoryId: null, // 当前选中分类id
      currentCategoryName: '', // 当前分类名
      subCategoryId: null, // 二级分类id
      searchKeyword: '', // 搜索关键词
      isSearching: false // 是否处于搜索状态
    }
  },
  onLoad(options) {
    this.loadCategories().then(() => {      
        // 默认热门服务
        if (this.tabs[1]) {
          this.currentCategoryId = this.tabs[1].id
          this.setTitle(this.tabs[1].name) 
        } 
        this.loadProductListByCategory(null, null, true)
    })
  },
  onShow() {
    const params = uni.getStorageSync('categoryParams')
    
    if (params && params.pid ) {
      this.currentCategoryId = Number(params.pid)
      this.subCategoryId = Number(params.tid)
      const idx = this.tabs.findIndex(tab => tab.id === this.currentCategoryId)
      if (idx !== -1) {
        this.activeTab = idx
        
      }
      //this.setTitle(params.name||this.tabs[idx].name)
      this.loadProductListByCategory(this.currentCategoryId, this.subCategoryId)
      uni.removeStorageSync('categoryParams')
      return
    }
   
  },
  methods: {
    // 搜索功能
    async onSearch() {
      if (!this.searchKeyword.trim()) {
        this.onClearSearch();
        return;
      }
      
      this.isSearching = true;
      this.loadProductListByCategory(this.currentCategoryId, this.subCategoryId);
    },
    
    // 清空搜索
    async onClearSearch() {
      this.searchKeyword = '';
      this.isSearching = false;
      this.loadProductListByCategory(this.currentCategoryId, this.subCategoryId);
    },
    
    async loadCategories() {
      const res = await getCategory()
      if (res && res.data) {
        // 只取一级分类，并在全部后插入热门服务
        const hotTab = { name: '热门服务', id: -1 }
        this.tabs = [{ name: '全部', id: 0 }, hotTab, ...res.data.map(item => ({ name: item.name, id: item.id }))]
      }
    },
    setTitle(name) {
      uni.setNavigationBarTitle({ title: name })
      this.currentCategoryName = name
    },
    tabCur(e) {
      const idx = e.index !== undefined ? e.index : e
      this.activeTab = idx
      if (idx === 0) {
        // 跳转到category.vue
        uni.navigateTo({ url: '/pages/service/category' })
        return
      }
      if (this.tabs[idx].id === -1) {
        // 热门服务逻辑
        this.setTitle('热门服务')
        this.currentCategoryId = -1  // 保存热门服务标识
        this.subCategoryId = null
        this.loadProductListByCategory(null, null, true) // 传递热门服务标记
        return
      }
      this.currentCategoryId = this.tabs[idx].id
      this.setTitle(this.tabs[idx].name)
      this.subCategoryId = null
      this.loadProductListByCategory(this.currentCategoryId)
    },
    loadProductListByCategory(pid, tid, isHot) {
      // 调用服务列表接口，支持一级和二级分类筛选，带分页
      const params = {
        page: 1,
        page_size: 20,
        sort_by: 'create_time',
        sort_order: 'desc'
      }
      
      // 判断是否是热门服务（通过 isHot 参数或者 currentCategoryId === -1）
      const isHotService = isHot || this.currentCategoryId === -1;
      
      if (isHotService) {
        params.sort_by = 'favorite_count'
        params.sort_order = 'desc'
        // 热门服务不需要传递分类参数
      } else {
        if (pid) params.category_id = pid
        if (tid) params.sub_category_id = tid
      }
      
      // 如果有搜索关键词，添加搜索参数
      if (this.isSearching && this.searchKeyword.trim()) {
        params.keyword = this.searchKeyword.trim();
      }
      getServiceProductList(params).then(res => {
        if (res && res.data && res.data.list) {
          this.productList = res.data.list
          //json转数组
          this.productList.forEach(item => {
            item.images = JSON.parse(item.images)
            item.qualification = JSON.parse(item.qualification)
            item.tags = item.tags ? JSON.parse(item.tags) : []
            item.rating = item.rating || 5
            item.ratingScore = item.ratingScore || (item.rating ? item.rating.toFixed(1) : '5.0')
          })
        } else {
          this.productList = []
        }
      })
    },
    showFilter() {
      console.log('显示筛选')
    },
    toggleFilter(index) {
      this.filters[index].active = !this.filters[index].active
    },
    goDetail(product) {
      uni.navigateTo({
        url: `/pages/service/detail?id=${product.id}`
      })
    },
  
  },
 
}
</script>

<style lang="scss" scoped>
.container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom:20rpx
}

/* 搜索栏 */
.search-container {
  background-color: #fff;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

/* 分类标签横向滚动容器 */
.category-tabs-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  white-space: nowrap;
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 0 32rpx;
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    background: transparent;
  }
}

.category-tabs {
  display: flex;
  flex-wrap: nowrap;
}

.tab-item {
  display: inline-block;
  padding: 24rpx 0;
  margin-right: 48rpx;
  font-size: 28rpx;
  color: #666;
  position: relative;
  white-space: nowrap;
  &.active {
    color: #3D6AFF;
    font-weight: 400;
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 4rpx;
      background-color: #3D6AFF;
      border-radius: 2rpx;
    }
  }
}

/* 筛选器 */
.filter-container {
  display: flex;
  background-color: #fff;
  padding: 24rpx 32rpx;
  margin-bottom: 20rpx;
  flex-wrap: nowrap;
  justify-content: flex-start;
}

.filter-item {
  display: flex;
  align-items: center;
  margin-right: 32rpx;
  min-width: 80rpx;
  padding: 0 8rpx;
  white-space: nowrap;
}

.filter-text {
  font-size: 28rpx;
  color: #333;
  margin-right: 8rpx;
  line-height: 1;
}

.filter-arrow {
  width: 24rpx;
  height: 24rpx;
}

/* 产品列表 */
.product-list {
  padding: 0 32rpx;
}

.product-card {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  position: relative;
  
  .product-image-container {
    position: relative;
    height: 320rpx;
    
    .product-image {
      width: 100%;
      height: 100%;
    }
    
    .product-tag {
      position: absolute;
      top: 16rpx;
      right: 16rpx;
      background-color: #ff4444;
      color: #fff;
      padding: 8rpx 16rpx;
      border-radius: 8rpx;
      font-size: 24rpx;
    }
    
    .product-tag-new {
      background-color: #00C851;
    }
  }
  
  .product-info {
    padding: 32rpx;
    
    .product-title {
      font-size: 32rpx;
      font-weight: 400;
      color: #333;
      margin-bottom: 16rpx;
    }
    
    .product-category {
      font-size: 24rpx;
      color: #3D6AFF;
      background-color: rgba(61, 106, 255, 0.1);
      padding: 8rpx 16rpx;
      border-radius: 8rpx;
      display: inline-block;
      margin-bottom: 24rpx;
    }
    
    .product-rating {
      display: flex;
      align-items: center;
      margin-bottom: 24rpx;
      
      .stars {
        display: flex;
        margin-right: 16rpx;
        
        .star {
          width: 24rpx;
          height: 24rpx;
          margin-right: 4rpx;
        }
      }
      
      .rating-text {
        font-size: 24rpx;
        color: #666;
      }
    }
    
    .product-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .price-container {
        display: flex;
        align-items: baseline;
        
        .price {
          font-size: 36rpx;
          font-weight: 400;
          color: #ff4444;
        }
        
        .price-unit {
          font-size: 24rpx;
          color: #666;
          margin-left: 8rpx;
        }
      }
      
      .sales-info {
        .sales-text {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      margin-bottom: 12rpx;
      .tag {
        background: #F0F4FF;
        color: #3D6AFF;
        padding: 6rpx 14rpx;
        border-radius: 20rpx;
        font-size: 20rpx;
      }
    }
  }
  


}

/* 深度选择器 */
::v-deep .u-input {
  font-size: 28rpx !important;
}

::v-deep .u-button {
  border-radius: 24rpx !important;
}

/* 强制设置星星颜色 - 覆盖内联样式 */
::v-deep .u-rate {
 
  .u-rate__content__item:not(.u-rate__content__item--active) .uicon-star-fill {
    color: #FFD700 !important;
  }
}


</style>