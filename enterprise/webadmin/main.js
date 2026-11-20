import Vue from 'vue'
import App from '@/App'
import store from './store'
import router from '@/router'
import config from '@/config'
import { RouterMount } from 'uni-simple-router'
import request from '@/common/js/request'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import mixin from './common/mixin/mixin'
Vue.mixin(mixin) 

Vue.use(ElementUI, { size: 'small' });

Vue.prototype.$config = config
Vue.prototype.$request = request

import filter from './common/filter/filter'
/* excel */
import JsonExcel from 'vue-json-excel'
Vue.component('downloadExcel', JsonExcel)

import vueXlsxTable from 'vue-xlsx-table'
Vue.use(vueXlsxTable, {rABS: false})

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App,
    store
})

RouterMount(app,'#app');

export default app

