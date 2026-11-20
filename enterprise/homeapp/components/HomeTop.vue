<template>
	<view class="home" >
		<!-- 状态栏占位 -->
		<view class="status_bar" :style="`background-color:${color}`"></view>
		<view :style="`background-color:${color}`"> 
			<view class="status_content" >
				<!-- 后退按钮 -->
				<view v-if="color!=='#101217'" @click="goback" style="margin-left:10rpx;display: flex; align-items: center;">
					<u-icon name="arrow-left" color="#fff" size="32"></u-icon>
				</view>
				<view class="search" @click="toSearch">
					<u-icon name="search" color="#fff" size="32"></u-icon>
					<view class="block">{{ $t('search.searchPlaceholder') }}</view>
				</view>
				
				<view class="right-icon" @click="jump({val:'my',url:'/pages/my/my'})" style="margin-left: auto; ">
					<image :src="userInfo&&userInfo.head_picture||'/static/menu/user.png'" shape="circle" style="width: 50rpx; height: 50rpx;"></image>
				</view> 
				<view class="right-icon" @click="languageShow = true" style="margin-left: auto;">
					<image src="/static/img/lang.png" style="width: 50rpx; height: 50rpx; "></image>
				</view>
				<view class="right-icon" @click="showmenu=true" style="margin-left: auto;">
					<u-icon name="list" color="#fff" size="60"></u-icon>
				</view>
				
			</view> 
		</view>
		<u-popup :show="showmenu" mode="right" :closeable="true" @close="showmenu=false" :custom-style="{background: '#0a1019'}" >
		  <u-grid :border="false"  col="3" style="margin-top: 100rpx;">
		    <u-grid-item v-for="(item,idx) in menuList" :key="idx" @click="jump(item)">
		      <image :src="`/static/menu/menu${idx+1}.png`" style="width: 80rpx; height: 80rpx; padding-top: 50rpx;"></image>
		      <text class="grid-text" style="color: #FFFFFF; font-size: 14px; padding-top: 10rpx;">{{$t(item.name)}}</text>
		    </u-grid-item> 
		  </u-grid>
		<!-- 固定在底部的Logo和版权信息 -->
		 <view @click="jump({ name: '', val: 'home',url:'/pages/home/home'})" style="padding: 20rpx; display: flex;flex-direction: column;align-items: center;justify-content: flex-end;height: 100%;">
		   <image  src="/static/img/common/logo.png" style="width: 80rpx; height: 80rpx; margin-bottom: 10rpx;"></image>
		   <view style="color: #999999; font-size: 12px;">
			 © 2025 Block Feed. All Rights Reserved.
		   </view>
		 </view>
		</u-popup>
		<u-picker :show="languageShow" :columns="langs" keyName="label" @confirm="languageChange" @cancel="languageShow = false" @close="languageShow = false" :confirmText="$t('common.confirmText')" :cancelText="$t('common.cancelText')"></u-picker>
			
	</view>
</template>
<script>
	import { mapState } from 'vuex';
	
	export default {
		name: 'HomeTop',
		data() {
			return {
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar,
				showmenu: false,
				menuCur: 'feeds', 
				menuList:[
					{ name: 'homeMenu.feeds', val: 'feeds',url:'/pages/feeds/feeds'},
					{ name: 'homeMenu.whale', val: 'whale',url:'/pages/whale/whale'},
					{ name: 'homeMenu.news', val: 'news',url:'/pages/news/news'},
					{ name: 'homeMenu.airdrops', val: 'airdrops',url:'/pages/airdrops/airdrops'},
					{ name: 'homeMenu.notice', val: 'notice',url:'/pages/notice/notice'},
					{ name: 'homeMenu.activity', val: 'activity',url:'/pages/activity/activity'},
				], 
				langs: [[					
					{ label: '中文-简体', id: 'zh_CN' },
					{ label: '中文-繁体', id: 'zh_TW' },
					{ label: 'English', id: 'en_US' },
					{ label: '日本語', id: 'ja_JP' },
					{ label: '한국어', id: 'ko_KR' },					
				]],
				languageShow: false,
			};
		},
		props: {
			// 是否显示
			color: {
				type: String,
				default:'#101217' 
			},
		},
		watch: {
		  color(newVal, oldVal) { 
			  
		    // 根据 newVal 执行逻辑
		    if (newVal === '#101217') { 
				uni.setNavigationBarColor({
				    frontColor: '#ffffff',
				    backgroundColor: '#101217', 
				})  
		    } else {
				uni.setNavigationBarColor({
				    frontColor: '#101217',
				    backgroundColor: '#FFFFFF', 
				})
		    }
		  }
		},
		computed: {
			...mapState(['userInfo']),
		},
		mounted() { 
			
			const data=uni.getStorageSync('$userinfo')
			
			if(data){ 
				//使用vue set 赋值
				this.$set(this.userInfo, 'head_picture', this.$FileBaseUrl+ data.head_picture)
				this.$set(this.userInfo, 'banner_picture', this.$FileBaseUrl+ data.banner_picture)
				this.$set(this.userInfo, 'nickname', data.nickname)
				this.$set(this.userInfo, 'describe', data.describe) 
			}
		},
		methods: {
			goback() {
			    uni.navigateBack(); // 返回上一页
			},
			// 跳转搜索页
			toSearch() {
				uni.navigateTo({
					url: '/pages/home/search'
				});
			},
			// 语言设置
			languageChange (cur) {
				this.$C.setLanguage(cur.value[0].id);
				this.languageShow = false;
			},
			jump(item){
				this.menuCur = item.val;this.showmenu=false;
				if(item.val == 'home'||item.val=='my') {
					uni.switchTab({
						url: item.url
					});
					return;
				}else{
					uni.navigateTo({
						url:item.url
					})
					return;
				}
				
			},  
		},
	}	
</script>

<style lang="scss" scoped>
	
	.u-sticky {
		top: 0 !important;
	}
	.status_content{
		display: flex; align-items: center; justify-content: space-between;
		padding:20rpx 0rpx;
	} 
	.menu {
		font-size: 30rpx;
		line-height: 80rpx;
		color: #868ebb;
		background: #2c3254;
		display: flex;
		padding: 0 10rpx;
	
		view {
			text-align: center;
			margin: 0 auto;
		}
	}
	
	.search {
		width: 100%;
		opacity: 0.5;
		display: flex;
		align-items: center;
		padding:0 20rpx;
		
		.u-icon {
			height: 55rpx;
			background: transparent;
			border-radius: 30rpx 0 0 30rpx;
			border: 1rpx solid #fff;
			border-right: none;
			padding: 0 12rpx 0 20rpx;
		}
	
		.block {
			font-size: 24rpx;
			flex: 1;
			line-height: 55rpx;
			color: #fff;
			background: transparent;
			border: 1rpx solid #fff;
			border-left: none;
			border-radius: 0 30rpx 30rpx 0;
		}
	}
	.right-icon {
		margin-right: 20rpx;
	}
	
</style>