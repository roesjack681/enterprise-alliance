<template>
	<view>
		<!-- 我的功能 -->
		<view class="section">
			<view class="section-header">
				<view class="section-title">我的功能</view>
				<view class="section-more">
					<u-icon name="arrow-right" color="#999" size="28"></u-icon>
				</view>
			</view>
			<view class="function-grid">
				<view class="function-grid-item" v-for="(item, index) in functionList" :key="index"
					@click="jump(item.url)">
					<view class="function-icon-wrapper" >
						<image :src="item.icon" mode="aspectFill" class="function-icon-img"></image>
					</view>
					<view class="function-name">{{ item.name }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				functionList: [{
						name: '企业管理',
						icon: '/static/icon/t1.png',
						url:'/pages/entity/list?role=8',
						bgColor: '#E3F2FD',
						type: 'profile'
					},
					{
						name: '服务商管理',
						icon: '/static/icon/t2.png',
						url:'/pages/entity/list?role=7',
						bgColor: '#F3E5F5',
						type: 'activity'
					},
					{
						name: '服务管理',
						icon: '/static/icon/t3.png',
						url:'/pages/association/list',
						bgColor: '#E8F5E8',
						type: 'task'
					},
					{
						name: '经纪人管理',
						icon: '/static/icon/t4.png',
						url:'/pages/entity/list?role=10',
						bgColor: '#FFF8E1',
						type: 'achievement'
					},
					{
						name: '交易流水',
						icon: '/static/icon/t5.png',
						bgColor: '#FFEBEE',
						type: 'checkin'
					},
					{
						name: '编辑企业资料',
						icon: '/static/icon/t6.png',
						url:'/pages/entity/edit',
						bgColor: '#E8EAF6',
						type: 'organization'
					},
					{
						name: '邀请码',
						icon: '/static/icon/t7.png',
						url:'/pages/entity/invite',
						bgColor: '#E0F2F1',
						type: 'vote'
					},
					
				],
			}
		},
		methods: {
			refreshData() {
			  // 你自己的数据获取逻辑
			  this.message = '子组件数据已刷新 ' + Date.now();
			  console.log('子组件 refreshData 被调用');
			},
			jump(url){
				uni.navigateTo({
					url: url
				})
			},
		}
	}
</script>

<style lang="scss" scoped>

	.section {
		background-color: #fff;
		
		padding: 30rpx;
		
		margin: 0 24rpx 20rpx;
		border-radius: 16rpx;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.section-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.section-more {
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #999;
	}
	
	.section {
	  background-color: #fff;
	  margin-bottom: 20rpx;
	  padding: 30rpx;
	}
	
	.section-header {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  margin-bottom: 30rpx;
	}
	
	.section-title {
	  font-size: 32rpx;
	  font-weight: 600;
	  color: #333;
	}
	
	.section-more {
	  display: flex;
	  align-items: center;
	  font-size: 28rpx;
	  color: #999;
	}
	
	.function-grid {
	  display: flex;
	  flex-wrap: wrap;
	  margin: -20rpx -10rpx;
	}
	
	.function-grid-item {
	  width: 25%;
	  padding: 20rpx 10rpx;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	}
	
	.function-icon-wrapper {
	  width: 120rpx;
	  height: 120rpx;
	  border-radius: 60rpx;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  margin-bottom: 16rpx;
	  position: relative;
	}
	
	.function-icon-img {
	  width: 120rpx;
	  height: 120rpx;
	}
	
	.function-name {
	  font-size: 24rpx;
	  color: #333;
	  text-align: center;
	  line-height: 1.2;
	}
	
</style>