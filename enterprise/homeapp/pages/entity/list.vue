<template>
	<view class="page"> 
		<view class="add-button" @click="$C.jump('./add?role='+role)">
			<u-icon name="plus" color="#409EFF" size="16"></u-icon>
			<text>添加{{getRoleName(role)}}</text>
		</view>
		<view class="section">			
			<view class="company-list">
				<view class="company-item" v-for="(company, index) in list" :key="index">
					<view class="company-avatar" @click="$C.jump(`/pages/${getDetailPath(role)}/home?id=${company.id}`)">
						<image :src="company.avatar" mode="aspectFill"></image>
					</view>
					<view class="company-info" @click="$C.jump(`/pages/${getDetailPath(role)}/home?id=${company.id}`)">
						<view class="company-name">{{ company.name||company.nickname||'未填写' }}
						<image class="tag" :src="company.review_status==2?'/static/icon/auth.png':'/static/icon/noauth.png'" mode="aspectFill"></image>
						</view>
						<view class="company-meta">
							<text>{{ getRegionName(company.city) }}</text>
							<text class="separator">•</text>
							<text>加入时间: {{ $C.formatTimeAgo(company.create_time)}}</text>
						</view>
					</view>
					<view v-if="company.review_status!==2" class="justify-end">
						<u-button @click="$C.jump('/pages/entity/review?id='+company.id)" shape="circle" size="small">查看审核</u-button>
					</view>
				</view>
			</view> 
		</view>
	</view>
</template>

<script>
	import {getEntityList}  from "@/utils/api.js"
	import {getRegionByIndex} from "@/utils/province.js"
	export default {
		data() {
			return {
				list:[],
				role:8,
				title:'企业列表'
			}
		},
		onLoad(options) {
			this.role=options.role||8
			this.title=this.getRoleName(this.role)+'列表'
			uni.setNavigationBarTitle({
			    title:this.title
			});
			this.getlist();
		},
		methods: {
			getlist() {			
			  getEntityList({role:this.role}).then(res=>{
				if(res.code===0 && res.data&& res.data.length>0){
					this.list=res.data
				}  
			  })
			},
			getRegionName(id){
				if(!id) return;
				const data=getRegionByIndex(id)
				return data&& data.n||''
			},
			getRoleName(role) {
				const roleMap = {
					7: '服务商',
					8: '企业',
					10: '经纪人'
				};
				return roleMap[role] || '未知';
			},
			getDetailPath(role) {
				const pathMap = {
					7: 'provider',
					8: 'company',
					10: 'company' // 假设经纪人详情页路径为 broker
				};
				return pathMap[role] || 'company';
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page{background-color: #fff;min-height: 100vh;}
	.section {
		background-color: #fff;
		
		padding: 30rpx;
		
		
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
		.more-text {
		  color: #409EFF;
		  font-size: 28rpx;
		  line-height: 1;
		  display: flex;
		  align-items: center;
		}
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
		margin:20rpx 40rpx;
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
