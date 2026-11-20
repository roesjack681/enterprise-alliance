<template>
	<view class="page">
		<view v-if="userType ==9">
			<association-panel ref="myPanel1" />
		</view>
		<view v-else-if="userType ==8">
			<company-panel ref="myPanel2" />
		</view>
		<view v-else-if="userType ==7">
			<provide-panel ref="myPanel3" />
		</view>
		<view v-else-if="userType ==10">
			<market-panel ref="myPanel4" />
		</view>
		<view v-else class="text-center margin-top">
			<text class="bg-white">加载中...</text>
		</view>
	</view>
</template>

<script>
	import AssociationPanel from './my_association.vue'
	import CompanyPanel from './my_company.vue'
	import ProvidePanel from './my_provider.vue'
	import MarketPanel from './my_market.vue'
	export default {
		components: {
			AssociationPanel,
			CompanyPanel,
			ProvidePanel,
			MarketPanel
		},
		data() {
			return {
				userType: ''
			}
		},
		onShow() {
			this.$store.dispatch('refreshToken');
			this.$store.dispatch('getuserinfo');
			// 每次页面显示时都执行，确保刷新
			this.waitUserInfoReady()
		},
		methods: {
		  waitUserInfoReady(retry = 0) {
		    const userInfo = uni.getStorageSync('$userinfo')
		    if (userInfo && userInfo.role) {
		      this.userType = userInfo.role
		      this.$nextTick(() => {
		        if (this.userType == 9) this.$refs.myPanel1?.refreshData?.()
		        else if (this.userType == 8) this.$refs.myPanel2?.refreshData?.()
		        else if (this.userType == 7) this.$refs.myPanel3?.refreshData?.()
		        else if (this.userType == 10) this.$refs.myPanel4?.refreshData?.()
		      })
		    } else if (retry < 10) {
		      setTimeout(() => this.waitUserInfoReady(retry + 1), 300)
		    } else {
		      console.warn('用户信息未获取到，放弃加载')
		    }
		  }
		}
	}
</script>


<style lang="scss" scoped>
	.page {
		height: 100%;
		background-color: #fff;
	}
</style>