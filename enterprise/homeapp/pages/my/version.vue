<template>
	<view class="version">
		<view>
			<u-image src="/static/img/common/logo.png" width="180rpx" height="180rpx" class="logo" :showLoading="true"></u-image>
			<view class="current">{{ $t('version.current') }}{{ current }}</view>
			<u-button :text="!isUpDate ? $t('version.btn1') : $t('version.btn2')" @click="upDateHandler" :disabled="!isUpDate" shape="circle" class="btn"></u-button>
		</view>
	</view>
</template>

<script>
	import { isUpDataApp } from '@/utils/api.js'
	
	export default {
		data() {
			return {
				current: '',
				isUpDate: false,
				downloadUrl: ''
			};
		},
		onReady() {
			uni.setNavigationBarTitle({title: this.$t('version.title')});
		},
		created() {
			plus.runtime.getProperty(plus.runtime.appid, (widgetInfo) => {
				this.current = widgetInfo.version;
				isUpDataApp().then(UpDataRes => {
					if (Number(widgetInfo.versionCode) < Number(UpDataRes.data.version_number)) {
						this.isUpDate = true;
						this.downloadUrl = UpDataRes.data.url;
					}
				})
			});
		},
		methods: {
			// 跳转下载新版本App
			upDateHandler () {
				plus.runtime.openURL(this.downloadUrl);
			}
		}
	}
</script>

<style lang="scss">
.version {
	height: 50vh; display: flex; align-items: center; justify-content: center;
	> view {
		.logo { width: 180rpx; border-radius: 100%; overflow: hidden; margin: 100rpx auto 0 auto;}
		.current { font-size: 28rpx; text-align: center; margin: 40rpx 0 50rpx 0;}
		.btn { width: 420rpx; height: 80rpx; color: #fff; background: #5badff; border: none; margin-top: 30rpx;}
	}
}
</style>
