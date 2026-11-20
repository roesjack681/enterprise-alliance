<template>
  <view class="container">
    <!-- 粉丝总数 -->
    <view class="header">我的粉丝（{{ totalFans }}）</view>

    <!-- 粉丝列表 -->
    <view
      class="fan-item"
      v-for="(item, index) in fansList"
      :key="index"
    >
      <view class="fan-content">
        <!-- 左侧头像 -->
        <image class="avatar" :src="$FileBaseUrl+item.user_info.head_picture" mode="aspectFill" />

        <!-- 中间昵称+描述 -->
        <view class="info">
          <view class="nickname">{{ item.user_info.nickname }}</view>
          <view class="desc">{{ item.user_info.describe }}</view>
        </view>

        <!-- 右侧按钮+更多 -->
        <view class="actions">
          <view
            class="follow-btn"
            :class="item.isMutual ? 'mutual' : ''"
          >
            {{ item.isMutual ? '互相关注' : '回关' }}
          </view>
          <u-icon name="more-dot-fill" size="36rpx" />
        </view>
      </view>
      <!-- 分割线 -->
      <view class="line"></view>
    </view>
  </view>
</template>

<script>
	import {getFollowingList } from '@/utils/api';
	
export default {
  data() {
    return {
      totalFans:'0人',
      fansList: [],
	  query: {
	  	page: 0,
	  	limit: 20,
	  },
    };
  },
  created() {
	uni.setNavigationBarTitle({
	  	title: this.$t('changeEmail.title')
	});
  	this.getList();
  },
  onReachBottom () {
  	this.getList();
  },
  methods: {
  	goto(url){
  		uni.navigateTo({
  			url: url
  		});
  	},  	
  	// 获取列表数据
  	getList(type) {
  		this.query.page += 1; 
  		getFollowingList(this.query).then(res => {
  			if (this.query.page === 1) {
  				this.totalFans = res.data.count+'人';
  				this.fansList = res.data.list;
  			} else {
  				this.fansList.push(...res.data.list);
  			}
  			 
  			
  		});
  	},			
  }
};
</script>

<style scoped lang="scss">
.container {
  padding: 24rpx;
}
.header {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 24rpx;
}

.fan-item {
  margin-bottom: 20rpx;
}
.fan-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
}
.info {
  flex: 1;
  margin-left: 20rpx;
  overflow: hidden;
}
.nickname {
  font-size: 30rpx;
  font-weight: bold;
  color: #000;
  margin-bottom: 6rpx;
}
.desc {
  font-size: 24rpx;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.actions {
  display: flex;
  align-items: center;
}
.follow-btn {
  background-color: #f74d54;
  color: #fff;
  font-size: 24rpx;
  border-radius: 28rpx;
  padding: 8rpx 28rpx;
  margin-right: 20rpx;
}
.follow-btn.mutual {
  background-color: #fff;
  color: #f74d54;
  border: 2rpx solid #f74d54;
}
.line {
  height: 1rpx;
  background-color: #eee;
  margin-top: 20rpx;
}
</style>
