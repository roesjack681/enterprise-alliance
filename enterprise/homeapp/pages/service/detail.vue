<template>
  <view class="service-detail-page">
    <view v-if="loading" style="text-align:center;padding:80rpx 0;">
      <u-loading-icon mode="spinner" size="40" color="#3D6AFF"></u-loading-icon>
      <text style="display:block;margin-top:20rpx;color:#999;">加载中...</text>
    </view>
    <view v-else class="content">
      <!-- 服务轮播图 -->
      <view class="service-swiper-card" v-if="swiperImages.length">
        <swiper 
          :indicator-dots="true" 
          :autoplay="true" 
          :interval="3000" 
          :duration="500"
          class="swiper"
          indicator-color="rgba(255, 255, 255, 0.4)"
          indicator-active-color="#3D6AFF"
        >
          <swiper-item v-for="(image, index) in swiperImages" :key="index">
            <image 
              :src="image" 
              mode="aspectFill"
              class="swiper-image"
            ></image>
          </swiper-item>
        </swiper>
      </view>

      <!-- 服务基本信息 -->
      <view class="service-info-card">
        <view class="service-title">{{ serviceData.title }}</view>
        <view class="price-section">
          <text class="price">¥{{ serviceData.price }}</text>
          <text class="price-unit" v-if="serviceData.unit">/{{ serviceData.unit }}</text>
        </view>
        <view class="rating-section">
          <u-rate 
            :value="serviceData.rating || 5" 
            :disabled="true" 
            :size="24"
            active-color="#FFD700"
            inactive-color="#E5E5E5"
          ></u-rate>
          <text class="rating-text">{{ serviceData.rating ? serviceData.rating + '分' : '' }}</text>
          <text class="review-count" v-if="serviceData.reviewCount">{{ serviceData.reviewCount }}条评价</text>
        </view>
        <view class="tags">
          <view class="tag" v-for="(tag, i) in serviceData.tags" :key="i">{{ tag.name || tag }}</view>
        </view>
      </view>

      <!-- 分割线 --> 
      <u-gap height="10" bgColor="#f5f5f5"></u-gap> 
      <!-- 服务商主页入口 -->
      <view class="provider-card" @click="goToProviderHome">
        <view class="provider-info">
          <image :src="entityInfo.logo || '/static/img/avatar.png'" mode="aspectFill" class="provider-avatar"></image>
          <view class="provider-details">
            <view class="provider-name">{{ entityInfo.name || '服务商名称' }}</view>
            <view class="provider-rating">
              <u-rate 
                :value="entityInfo.tags&&entityInfo.tags.starts" 
                :disabled="true" 
                :size="20"
                active-color="#FFD700"
                inactive-color="#E5E5E5"
              ></u-rate>
              <text class="rating-score">{{entityInfo.tags&& entityInfo.tags.starts || 5 }}分</text>
            </view>
            <view class="provider-desc"> <span class="cu-tag sm round" v-for="(tag, i) in entityInfo.tags.tags" :key="i">{{ tag.name }}</span></view>
          </view>
        </view>
        <view class="provider-action">
          <u-button type="primary" size="mini" @click.stop="goToProviderHome">查看主页</u-button>
        </view>
      </view>

      <!-- 分割线 -->
      <u-gap height="10" bgColor="#f5f5f5"></u-gap> 

      <!-- 服务介绍 -->
      <view class="service-intro-card">
        <view class="card-title">服务介绍</view>
        <view class="intro-text">{{ serviceData.description }}</view>
        
        <!-- 视频播放组件 -->
        <view class="video-section" v-if="serviceData.videos"> 
          <view class="video-item">
            <video 
              :src="serviceData.videos"
              :controls="true" 
              :object-fit="'contain'"
              class="video-player" 
            ></video>
          </view>
        </view>
        
        <!-- 资质展示 -->
        <view class="qualification-section" v-if="serviceData.qualification && serviceData.qualification.length">
          <view class="qualification-title">相关资质</view>
          <view class="qualification-list">
            <view class="qualification-item" v-for="(item, index) in serviceData.qualification" :key="index" v-if="item.file">
              <view class="qualification-info">
                <view class="qualification-name">{{ item.name }}</view>
                <view class="qualification-desc">点击查看详情</view>
              </view>
              <view class="qualification-preview" @click="previewQualification(item)">
                <image :src="item.file" mode="aspectFill" class="preview-image"></image>
                <view class="preview-overlay">
                  <u-icon name="eye" size="32" color="#fff"></u-icon>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 服务特色（可根据实际数据扩展） -->
      <view class="service-features" v-if="serviceData.features && serviceData.features.length">
        <view class="feature-item" v-for="(feature, idx) in serviceData.features" :key="idx">
          <view class="feature-icon">
            <image :src="feature.icon" mode="aspectFill" class="icon-image"></image>
          </view>
          <view class="feature-content">
            <view class="feature-title">{{ feature.title }}</view>
            <view class="feature-desc">{{ feature.desc }}</view>
          </view>
        </view>
      </view>

      <!-- 分割线 -->
      <u-gap height="10" bgColor="#f5f5f5"></u-gap> 
      <!-- 用户评价（静态示例，后续可接入接口） -->
      <view class="reviews-card">
        <view class="card-header">
          <view class="card-title">用户评价</view>
          <view class="view-all" @click="viewAllReviews">
            <text>查看全部</text>
            <u-icon name="arrow-right" size="24" color="#3D6AFF"></u-icon>
          </view>
        </view>
        <view class="review-list">
          <view class="review-item">
            <view class="review-header">
              <image src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop" mode="aspectFill" class="avatar"></image>
              <view class="user-info">
                <view class="username">张经理</view>
                <u-rate 
                  :value="5" 
                  :disabled="true" 
                  :size="20"
                  active-color="#FFD700"
                  inactive-color="#E5E5E5"
                ></u-rate>
                <view class="review-date">2024-01-15</view>
              </view>
            </view>
            <view class="review-content">
              服务非常专业，顾问团队很负责任，帮助我们企业完成了数字化转型的关键步骤。
            </view>
          </view>
          <u-line color="#e5e5e5" margin="24rpx 24rpx"></u-line>
          <view class="review-item">
            <view class="review-header">
              <image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" mode="aspectFill" class="avatar"></image>
              <view class="user-info">
                <view class="username">李总监</view>
                <u-rate 
                  :value="5" 
                  :disabled="true" 
                  :size="20"
                  active-color="#FFD700"
                  inactive-color="#E5E5E5"
                ></u-rate>
                <view class="review-date">2024-01-10</view>
              </view>
            </view>
            <view class="review-content">
              整个咨询过程非常顺畅，团队的专业度和执行力都得到了我们的认可。
            </view>
          </view>
        </view>
      </view>

      <!-- 分割线 -->
      <u-gap height="10" bgColor="#f5f5f5"></u-gap> 

      <!-- 在线咨询 -->
      <view class="consultation-card">
        <view class="card-title">在线咨询</view>
        <view class="consultation-options">
          <view class="consultation-item" @click="phoneConsult">
            <view class="consult-icon">
              <u-icon name="phone" size="40" color="#3D6AFF"></u-icon>
            </view>
            <view class="consult-content">
              <view class="consult-title">电话咨询</view>
              <view class="consult-desc">工作日 9:00-18:00</view>
            </view>
          </view>
          <u-line direction="vertical" color="#e5e5e5" length="80rpx"></u-line>
          <view class="consultation-item" @click="onlineConsult">
            <view class="consult-icon">
              <u-icon name="chat" size="40" color="#3D6AFF"></u-icon>
            </view>
            <view class="consult-content">
              <view class="consult-title">在线客服</view>
              <view class="consult-desc">24小时在线服务</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 分割线 -->
      <u-gap height="10" bgColor="#f5f5f5"></u-gap> 

      <!-- 相关服务 -->
      <view class="related-services-card" v-if="relatedServices.length">
        <view class="card-title">相关服务</view>
        <view class="related-list">
          <view class="related-item" v-for="item in relatedServices" :key="item.id" @click="goToServiceDetail(item.id)">
            <image :src="item.images[0]" mode="aspectFill" class="related-image"></image>
            <view class="related-info">
              <view class="related-title">{{ item.title }}</view>
              <view class="related-price">¥{{ item.price }}{{ item.unit ? '/' + item.unit : '' }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions">
      <view class="action-btn outline" @click="toggleFavorite">
        <u-icon name="heart" size="32" :color="isFavorite ? '#FF4757' : '#666'"></u-icon>
        <text class="btn-text">收藏</text>
      </view>
      <view class="action-btn outline" @click="onlineConsult">
        <u-icon name="chat" size="32" color="#3D6AFF"></u-icon>
        <text class="btn-text">在线咨询</text>
      </view>
      <view class="action-btn primary" @click="purchaseNow">
        <text class="btn-text">立即购买</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getServiceProductDetail, getServiceProductList ,getEntityInfo,createPrivateRoom} from '@/utils/api'
export default {
  name: 'ServiceDetailPage',
  data() {
    return {
      userInfo:uni.getStorageSync('$userinfo'),
      isFavorite: false,
      swiperImages: [],
      serviceData: {},
      entityInfo:{},
      loading: false,
      relatedServices: [] // 新增相关服务
    }
  },
  onLoad(options) {
    if (options.id) {
      this.fetchDetail(options.id)
    }
  },
  methods: {
    async fetchDetail(id) {
      this.loading = true
      try {
       
        const res = await getServiceProductDetail({ id })
        if (res.code === 0 && res.data && res.data[0]) {
          const detail = res.data[0]
          this.serviceData = detail
          this.swiperImages = detail.images ? JSON.parse(detail.images) : []
          this.serviceData.tags = detail.tags ? JSON.parse(detail.tags) : []
          this.serviceData.videos = detail.videos || ''
          // 解析资质信息
          this.serviceData.qualification = detail.qualification ? JSON.parse(detail.qualification) : []
          // 获取相关服务
          this.fetchRelatedServices(detail.category_id, id)
          //获取服务商信息
          const entityInfo = await getEntityInfo({ user_id: this.serviceData.entity_id })
          
          this.entityInfo = entityInfo.data          
		      let entityInfotag= this.entityInfo.tags[0]
           
          entityInfotag.tags=JSON.parse(entityInfotag.tags)
          
          this.entityInfo.tags=entityInfotag.tags
        } else {
          uni.showToast({ title: res.msg || '获取详情失败', icon: 'none' })
        }
      } catch (e) {        
        console.log(e)
        //uni.showToast({ title: '网络错误', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    async fetchRelatedServices(category_id, currentId) {
      // 获取同分类下2条其他服务
      const params = {
        page: 1,
        page_size: 3,
        category_id
      }
      const res = await getServiceProductList(params)
      if (res && res.data && res.data.list) {
        // 排除当前服务id，取2条
        this.relatedServices = res.data.list.filter(item => item.id !== Number(currentId)).slice(0, 2)
        this.relatedServices.forEach(item => {
          item.images = item.images ? JSON.parse(item.images) : []
        })
      } else {
        this.relatedServices = []
      }
    },
    toggleFavorite() {
      this.isFavorite = !this.isFavorite
      uni.showToast({
        title: this.isFavorite ? '已收藏' : '已取消收藏',
        icon: 'none'
      })
    },
    viewAllReviews() {
      uni.navigateTo({ url: '/pages/reviews/index' })
    },
    phoneConsult() {
      uni.makePhoneCall({ phoneNumber: '400-123-4567' })
    },
    async onlineConsult() {
      // 创建私聊房间 
      if (this.serviceData.entity_id === this.userInfo.id) {
        uni.showToast({ title: '不能和自己聊天', icon: 'none' })
        return
      }
      
      // 保存服务信息到缓存，用于聊天页面显示
      const serviceInfo = {
        title: this.serviceData.title,
        img: this.swiperImages.length > 0 ? this.swiperImages[0] : '',
        desc: this.serviceData.description ? this.serviceData.description.substring(0, 100) + '...' : '',
        link: `/pages/service/detail?id=${this.serviceData.id}`
      }
      uni.setStorageSync('chat_service_info', serviceInfo)
      
      const res = await createPrivateRoom({ user_id2: this.serviceData.entity_id })
      if (res.code === 0 && res.data && res.data.room_id) {
        uni.navigateTo({ url: `/pages/chat/chat?room_id=${res.data.room_id}&room_name=${encodeURIComponent('服务咨询')}` })
      }else{
        uni.showToast({ title: res.msg || '错误，请重试', icon: 'none' })
      }
    },
    goToService(type) {
      uni.navigateTo({ url: `/pages/service/detail?type=${type}` })
    },
    purchaseNow() {
      uni.navigateTo({ url: `/pages/order/create?id=${this.serviceData.id}` })
    },
    goToServiceDetail(id) {
      uni.navigateTo({ url: `/pages/service/detail?id=${id}` })
    },
    goToProviderHome() {
      uni.navigateTo({ url: `/pages/provider/home?id=${this.entityInfo.entity_id}` })
    },
    previewQualification(item) {
      if (item.file) {
        uni.previewImage({
          urls: [item.file],
          current: item.file,
          longPressActions: {
            itemList: ['发送给朋友', '保存图片', '收藏'],
            success: function (data) {
              console.log('选中了第' + (data.tapIndex + 1) + '个按钮');
            },
            fail: function (err) {
              console.log(err.errMsg);
            }
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.service-detail-page {
  min-height: 100vh;
  background-color: #ffffff;
  padding-bottom: 90rpx;
}

.content {
  padding: 0;
}

.service-swiper-card {
  background: white;
  margin: 0;
  overflow: hidden;
  
  .swiper {
    width: 100%;
    height: 400rpx;
    
    .swiper-image {
      width: 100%;
      height: 100%;
    }
  }
}

.service-info-card {
  background: white;
  margin: 0;
  padding: 32rpx 24rpx;
  
  .service-title {
    font-size: 32rpx;
    font-weight: 400;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .price-section {
    display: flex;
    align-items: baseline;
    margin-bottom: 24rpx;
    
    .price {
      font-size: 48rpx;
      font-weight: 600;
      color: #FF4757;
      text-shadow: 0 2rpx 4rpx rgba(255, 71, 87, 0.1);
    }
    
    .price-unit {
      font-size: 28rpx;
      color: #999;
      margin-left: 8rpx;
      font-weight: 400;
    }
  }
  
  .rating-section {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;
    
    .rating-text {
      font-size: 26rpx;
      color: #333;
      margin-left: 12rpx;
    }
    
    .review-count {
      font-size: 24rpx;
      color: #999;
      margin-left: 16rpx;
    }
  }
  
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    
    .tag {
      background: linear-gradient(135deg, #F0F4FF 0%, #E3F2FD 100%);
      color: #3D6AFF;
      padding: 10rpx 20rpx;
      border-radius: 24rpx;
      font-size: 24rpx;
      font-weight: 500;
      border: 1rpx solid rgba(61, 106, 255, 0.1);
    }
  }
}

.provider-card {
  background: white;
  margin: 0;
  padding: 32rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;

  .provider-info {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .provider-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
    }

    .provider-details {
      flex: 1;

      .provider-name {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 8rpx;
      }

      .provider-rating {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .rating-score {
          font-size: 24rpx;
          color: #FFD700;
        }
      }

      .provider-desc {
        margin-top: 12rpx;
        font-size: 22rpx;
        color: #666;
        line-height: 1.5;
        
        .cu-tag {
          margin-right: 8rpx;
          margin-bottom: 4rpx;
          background: #f8f9fa;
          color: #666;
          border: 1rpx solid #e9ecef;
        }
      }
    }
  }

  .provider-action {
    flex-shrink: 0;
  }
}

  .service-intro-card {
  background: white;
  margin: 0;
  padding: 32rpx 24rpx;
  
  .card-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 24rpx;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: -24rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 6rpx;
      height: 32rpx;
      background: #3D6AFF;
      border-radius: 3rpx;
    }
  }
  
  .intro-text {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
  }
  
  .video-section {
    margin-top: 32rpx;
    
    .video-title {
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 20rpx;
    }
    
    .video-item {
      .video-player {
        width: 100%;
        height: 400rpx;
        border-radius: 16rpx;
        background-color: #000;
      }
    }
  }
  
  .qualification-section {
    margin-top: 32rpx;
    
    .qualification-title {
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 20rpx;
    }
    
    .qualification-list {
      display: flex;
      flex-direction: column;
      gap: 20rpx;
      
      .qualification-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20rpx;
        background: #f8f9fa;
        border-radius: 12rpx;
        border: 1rpx solid #e9ecef;
        
        .qualification-info {
          flex: 1;
          
          .qualification-name {
            font-size: 26rpx;
            font-weight: 500;
            color: #333;
            margin-bottom: 8rpx;
          }
          
          .qualification-desc {
            font-size: 22rpx;
            color: #999;
          }
        }
        
        .qualification-preview {
          position: relative;
          width: 120rpx;
          height: 80rpx;
          border-radius: 8rpx;
          overflow: hidden;
          
          .preview-image {
            width: 100%;
            height: 100%;
          }
          
          .preview-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          &:active .preview-overlay {
            opacity: 1;
          }
        }
      }
    }
  }
}

.service-features {
  background: white;
  margin: 0;
  padding: 32rpx 24rpx;
  display: flex;
  gap: 40rpx;
  
  .feature-item {
    flex: 1;
    text-align: center;
    
    .feature-icon {
      width: 80rpx;
      height: 80rpx;
      margin: 0 auto 16rpx;
      
      .icon-image {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
    
    .feature-title {
      font-size: 26rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 8rpx;
    }
    
    .feature-desc {
      font-size: 22rpx;
      color: #999;
    }
  }
}

  .reviews-card {
  background: white;
  margin: 0;
  padding: 32rpx 24rpx;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .card-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        left: -24rpx;
        top: 50%;
        transform: translateY(-50%);
        width: 6rpx;
        height: 32rpx;
        background: #3D6AFF;
        border-radius: 3rpx;
      }
    }
    
    .view-all {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 24rpx;
      color: #3D6AFF;
    }
  }
  
  .review-list {
    .review-item {
      padding: 24rpx 0;
      
      &:first-child {
        padding-top: 0;
      }
      
      .review-header {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;
        
        .avatar {
          width: 64rpx;
          height: 64rpx;
          border-radius: 50%;
          margin-right: 16rpx;
        }
        
        .user-info {
          flex: 1;
          
          .username {
            font-size: 26rpx;
            font-weight: 500;
            color: #333;
            margin-bottom: 8rpx;
          }
          
          .review-date {
            font-size: 22rpx;
            color: #999;
            margin-top: 8rpx;
          }
        }
      }
      
      .review-content {
        font-size: 26rpx;
        color: #666;
        line-height: 1.5;
        margin-left: 80rpx;
      }
    }
  }
}

  .consultation-card {
  background: white;
  margin: 0;
  padding: 32rpx 24rpx;
  
  .card-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 24rpx;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: -24rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 6rpx;
      height: 32rpx;
      background: #3D6AFF;
      border-radius: 3rpx;
    }
  }
  
  .consultation-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .consultation-item {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 24rpx;
      border: 1rpx solid #e5e5e5;
      border-radius: 12rpx;
      background: #fafafa;
      
      .consult-icon {
        margin-right: 16rpx;
      }
      
      .consult-content {
        .consult-title {
          font-size: 26rpx;
          font-weight: 500;
          color: #333;
          margin-bottom: 4rpx;
        }
        
        .consult-desc {
          font-size: 22rpx;
          color: #999;
        }
      }
    }
  }
}

  .related-services-card {
  background: white;
  margin: 0;
  padding: 32rpx 24rpx;
  
  .card-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 24rpx;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: -24rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 6rpx;
      height: 32rpx;
      background: #3D6AFF;
      border-radius: 3rpx;
    }
  }
  
  .related-list {
    display: flex;
    gap: 24rpx;
    
    .related-item {
      flex: 1;
      border-radius: 12rpx;
      overflow: hidden;
      border: 1rpx solid #e5e5e5;
      background: #fafafa;
      
      .related-image {
        width: 100%;
        height: 200rpx;
      }
      
      .related-info {
        padding: 20rpx;
        
        .related-title {
          font-size: 24rpx;
          font-weight: 500;
          color: #333;
          margin-bottom: 8rpx;
        }
        
        .related-price {
          font-size: 26rpx;
          font-weight: 600;
          color: #FF4757;
        }
      }
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20rpx 24rpx;
  display: flex;
  gap: 16rpx;
  z-index: 5;
  border-top: 1rpx solid #e5e5e5;
  
  .action-btn {
    border-radius: 40rpx;
    padding: 20rpx 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    transition: all 0.3s ease;
    
    &.outline {
     
      border: 1rpx solid #e5e5e5;
      background: white;
      
      &:active {
        background: #f5f5f5;
      }
      
      .btn-text {
        font-size: 26rpx;
        color: #666;
      }
    }
    
    &.primary {
      flex: 2;
      background: linear-gradient(135deg, #3D6AFF 0%, #1976d2 100%);
      
      &:active {
        transform: translateY(2rpx);
      }
      
      .btn-text {
        font-size: 28rpx;
        font-weight: 500;
        color: white;
      }
    }
  }
}
/* 强制设置星星颜色 - 覆盖内联样式 */
::v-deep .u-rate {
 
 .u-rate__content__item:not(.u-rate__content__item--active) .uicon-star-fill {
   color: #FFD700 !important;
 }
}
</style>