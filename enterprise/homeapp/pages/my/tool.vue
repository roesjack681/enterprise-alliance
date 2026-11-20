<template>
	<view>
		<u-grid col="4" @click="toToolPages">
			<u-grid-item name="companyHoldings"><IconFont name="toolCompanyHoldings" :fontSize="54" color="#0059ff" /><text class="grid-text">{{ $t('tool.tool1') }}</text></u-grid-item>
			<u-grid-item name="sentimentIndex"><IconFont name="toolSentimentIndex" :fontSize="54" color="#0059ff" /><text class="grid-text">{{ $t('tool.tool2') }}</text></u-grid-item>
			<u-grid-item name="MTGoxMonitor"><IconFont name="toolMTGoxMonitor" :fontSize="54" color="#0059ff" /><text class="grid-text">{{ $t('tool.tool3') }}</text></u-grid-item>
			<u-grid-item name="outsidePrice"><IconFont name="toolOutsidePrice" :fontSize="54" color="#0059ff" /><text class="grid-text">{{ $t('tool.tool4') }}</text></u-grid-item>
			<u-grid-item name="outsideDisk"><IconFont name="toolOutsideDisk" :fontSize="54" color="#0059ff" /><text class="grid-text">{{ $t('tool.tool5') }}</text></u-grid-item>
			<u-grid-item name="largeIncrease"><IconFont name="toolLargeIncrease" :fontSize="54" color="#0059ff" /><text class="grid-text">{{ $t('tool.tool6') }}</text></u-grid-item>
			<u-grid-item name="largeDecrease"><IconFont name="toolLargeDecrease" :fontSize="54" color="#0059ff" /><text class="grid-text">{{ $t('tool.tool7') }}</text></u-grid-item>
			<u-grid-item name="stableCoin"><IconFont name="toolStableCoin" :fontSize="54" color="#0059ff" /><text class="grid-text">{{ $t('tool.tool8') }}</text></u-grid-item>
			<u-grid-item name="blockChainBrowser"><IconFont name="toolBlockChainBrowser" :fontSize="54" color="#0059ff" /><text class="grid-text">{{ $t('tool.tool9') }}</text></u-grid-item>
		</u-grid>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			};
		},
		onReady() {
			uni.setNavigationBarTitle({title: this.$t('tool.title')});
		},
		methods: {
			toToolPages (name) {
				let url = '';
				if (name === 'companyHoldings') {
					url = '/pages/tool/companyHoldings';
				}
				if (name === 'sentimentIndex') {
					url = '/pages/tool/sentimentIndex';
				}
				if (name === 'MTGoxMonitor') {
					url = '/pages/tool/MTGoxMonitor';
				}
				if (name === 'outsidePrice') {
					url = '/pages/tool/outsidePrice';
				}
				if (name === 'outsideDisk') {
					url = '/pages/tool/outsideDisk';
				}
				if (name === 'largeIncrease') {
					url = '/pages/tool/largeIncrease';
				}
				if (name === 'largeDecrease') {
					url = '/pages/tool/largeDecrease';
				}
				if (name === 'stableCoin') {
					url = '/pages/tool/stableCoin';
				}
				if (name === 'blockChainBrowser') {
					url = '/pages/tool/blockChainBrowser';
				}
				uni.navigateTo({ url });
			}
		}
	}
</script>

<style lang="scss">
.u-grid-item { border-right: 2rpx solid #ebedf0; border-bottom: 2rpx solid #ebedf0; padding: 20rpx 0;}
.u-grid-item:nth-child(4) { border-right: none;}
.u-grid-item:nth-child(8) { border-right: none;}
.grid-text { font-size: 26rpx; color: #646566; text-align: center; margin-top: 15rpx;}
</style>
