import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import i18n from './i18n'
import uView from 'uview-ui'
import store from './store'
Vue.use(uView)

uni.$u.setConfig({
	config: {
		unit: 'rpx'
	},
	props: {
		loadmore: {
			iconSize: 28,
			fontSize: 28,
			height: 100,
			color: '#bebebe',
			marginTop: 0,
			marginBottom: 0,
			loadingIcon: 'circle',
		},
		loadingIcon: {
			size: 28,
			mode: "circle"
		},
		noticeBar: {
			fontSize: 26
		},
		picker: {
			itemHeight: 80,
			closeOnClickOverlay: true
		},
		empty: {
			textSize: 28,
			iconSize: 150
		}
	},
})

import Common from "@/utils/common";
import cuCustom from './colorui/components/cu-custom.vue'
Vue.component('cu-custom',cuCustom)

Vue.prototype.$C = Common;
Vue.prototype.$store = store

Vue.prototype.$FileBaseUrl = 'https://media.zhbtc.cc/storage/';
import filter from '@/utils/filter'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	i18n,
  ...App,
})
require('@/utils/request.js')(app)
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif