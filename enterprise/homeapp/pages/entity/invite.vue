<template>
	<view class="enterprise-invitation"> 
		<!-- 主要内容区域 -->
		<view class="content-section">
			<!-- 邀请人信息 -->
			<view class="inviter-info">
				<u-avatar size="120" :src="userInfo.avatar||'/static/img/user.png'" class="inviter-avatar"></u-avatar>
				<view class="inviter-text">
					<text class="inviter-name">{{userInfo.nickname}}</text>
					<text class="inviter-desc">邀请您加入</text>
				</view>
			</view>

			<!-- 企业信息 -->
			<view class="company-info">
				<text class="company-name">{{userInfo.entityInfo && userInfo.entityInfo.name}}</text>
				<text class="company-desc">致力于打造高效协作平台，共创美好未来</text>
			</view>

			<!-- 企业展示图片/二维码 -->
			<view class="company-image-section">
				<view class="image-wrapper">
					<image :src="companyImage" class="company-image" mode="aspectFit"></image>

				</view>
			</view>

			<!-- 二维码提示 -->
			<view class="qr-tip">
				<text class="qr-text">扫描二维码加入企业</text>
			</view>

			<!-- 底部提示 -->
			<view class="bottom-tip">
				<text class="tip-text">加入后即可使用企业内所有功能</text>
			</view>

			<!-- 立即加入按钮 -->
			<view class="join-button-section">
				<u-button type="primary" :custom-style="joinButtonStyle" @click="handleJoin" class="join-button">
					复制邀请链接
				</u-button>
			</view>
		</view>
	</view>
</template>

<script>
	import {getLink,getMiniQrcode} from "@/utils/api.js"
	export default {
		name: 'EnterpriseInvitation',
		data() {
			return {
				userInfo: {},
				companyImage: '', // 企业展示图片
				companyLink:'',//邀请链接
				joinButtonStyle: {
					backgroundColor: '#3D6AFF',
					borderRadius: '24px',
					height: '48px',
					fontSize: '16px',
					fontWeight: '500'
				}
			}
		},
		onLoad() {
			this.userInfo = uni.getStorageSync('$userinfo');			
			if(this.userInfo.id) this.getdata();
		},
		methods: {
			async getdata(){
				const data={
					scene:`inviteCode=${this.userInfo.inviteCode}`
				}
				getMiniQrcode(data).then(res=>{ 
					this.companyImage=res.data
				})
				const data2={
					query:`inviteCode=${this.userInfo.inviteCode}`   //pid=${this.userInfo.id}&
				}
				getLink(data2).then(res=>{
					this.companyLink=res.data
				})
			},
			shareInviteLink() {				
				// 分享邀请链接
				uni.share({
					provider: 'weixin',
					scene: 'WXSceneSession',
					type: 0,
					href: this.companyLink,
					title: '企业注册邀请',
					summary: '邀请您完善企业信息',
					success: (res) => {
						console.log('分享成功')
					},
					fail: (err) => {
						console.log('分享失败', err)
					}
				})
			},
			handleJoin() {
				// 处理加入企业逻辑
				//this.shareInviteLink()
				this.$C.copyToClipboard(this.companyLink);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.enterprise-invitation {
		min-height: 100vh;
		padding:20rpx;
		background-color: #f5f6fa;
	}


	.content-section {
		background: #ffffff;
		border-radius: 40rpx;
		margin-top: 20rpx;
		
		padding: 50rpx 40rpx 80rpx;
		position: relative;
	}

	.inviter-info {
		display: flex;
		align-items: center;
		margin-bottom: 60rpx;

		.inviter-avatar {
			margin-right: 24rpx;
		}

		.inviter-text {
			display: flex;
			flex-direction: column;

			.inviter-name {
				font-size: 32rpx;
				font-weight: 600;
				color: #333333;
				margin-bottom: 8rpx;
			}

			.inviter-desc {
				font-size: 28rpx;
				color: #666666;
			}
		}
	}

	.company-info {
		margin-bottom: 50rpx;

		.company-name {
			display: block;
			font-size: 40rpx;
			font-weight: 700;
			color: #333333;
			margin-bottom: 20rpx;
		}

		.company-desc {
			display: block;
			font-size: 28rpx;
			color: #666666;
			line-height: 1.6;
		}
	}

	.company-image-section {
		position: relative;
		margin-bottom: 50rpx;

		.image-wrapper {
			position: relative;

		}

		.company-image {
			width: 100%;
			height: 280rpx;
			border-radius: 12rpx;

			display: block;
		}

	}

	.qr-tip {
		text-align: center;
		margin-bottom: 80rpx;

		.qr-text {
			font-size: 32rpx;
			color: #333333;
			font-weight: 500;
		}
	}

	.bottom-tip {
		text-align: center;
		margin-bottom: 60rpx;

		.tip-text {
			font-size: 24rpx;
			color: #999999;
		}
	}

	.join-button-section {
		padding: 0 20rpx;

		.join-button {
			width: 100%;
		}
	}

	// uView组件样式穿透
	::v-deep .u-button {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	::v-deep .u-avatar {
		.u-avatar__wrapper {
			border: 4rpx solid #f0f0f0;
		}
	}
</style>