<template>
	<view>
		<!-- 我的服务商 -->
		<view class="section">
			<view class="section-header">
				<view class="section-title">服务商</view>
				<view class="section-more" @click="$C.jump('/pages/entity/list?role=7')">
					<text class="text-blue ">查看全部</text>
					<u-icon class="margin-top-xs" name="arrow-right" color="#409EFF" size="28"></u-icon>
				</view>
			</view>
			<view class="service-list">
				<view class="service-item" v-for="(service, index) in services" :key="index" >
					<view class="service-avatar" @click="$C.jump('/pages/provider/home?id='+service.id)">
						<image :src="service.avatar" mode="aspectFill"></image>
					</view>
					<view class="service-info" @click="$C.jump('/pages/provider/home?id='+service.id)">
						<view class="service-name">{{ service.name }}
						<image class="tag" :src="service.review_status==2?'/static/icon/auth.png':'/static/icon/noauth.png'" mode="aspectFill"></image>
						</view>
						<view class="service-meta">
							<text>{{ getRegionName(service.city) }}</text>
							<text class="separator">•</text>
							<text>加入时间: {{ $C.formatTimeAgo(service.create_time) }}</text>
						</view>
					</view>
					<view v-if="service.review_status!==2" class="justify-end">
						<u-button @click="$C.jump('/pages/entity/review?id='+service.info_id)" shape="circle" size="small">查看审核</u-button>
					</view>
				</view>
			</view>
			<view class="add-button" @click="addService">
				<u-icon name="plus" color="#409EFF" size="16"></u-icon>
				<text>添加服务商</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {getTopEntityList}  from "@/utils/api.js"
	import {getRegionByIndex} from "@/utils/province.js"
	export default {
		data() {
			return {
				services: []
			}
		},
		methods: {
			refreshData() { 
				getTopEntityList({role:7,page:3}).then(res=>{
					if(res.code===0 && res.data){
						this.services=res.data
					}
				})
			},
			getRegionName(id){
				if(!id) return;
				const data=getRegionByIndex(id)
				return data&& data.n||''
			},
			addService() {
				uni.navigateTo({
					url: '/pages/entity/add?role=7'
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
	.tag{width:30rpx;height:30rpx;} 
	.company-list,
	.service-list {
		margin-bottom: 30rpx;
	}
	
	.company-item,
	.service-item {
		display: flex;
		align-items: center;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}
	
	.company-item:last-child,
	.service-item:last-child {
		border-bottom: none;
	}
	
	.company-avatar,
	.service-avatar {
		width: 80rpx;
		height: 80rpx;
		margin-right: 24rpx;
		border-radius: 12rpx;
		overflow: hidden;
		background-color: #f0f0f0;
	}
	
	.company-avatar image,
	.service-avatar image {
		width: 100%;
		height: 100%;
	}
	
	.company-info,
	.service-info {
		flex: 1;
	}
	
	.company-name,
	.service-name {
		font-size: 30rpx;
		color: #333;
		margin-bottom: 8rpx;
	}
	
	.company-meta,
	.service-meta {
		font-size: 24rpx;
		color: #999;
	}
	
	.separator {
		margin: 0 12rpx;
	}
	
	.add-button {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 80rpx;
		border: 2rpx dashed #409EFF;
		border-radius: 12rpx;
		color: #409EFF;
		font-size: 28rpx;
	}
	
	.add-button text {
		margin-left: 12rpx;
	}
	
</style>