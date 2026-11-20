import store from '@/store'
import app from '@/main'
//云函数映射
const moduleMap = {
	app: 'app',
	swap: 'swap',
	user: 'user',
	project: 'project',
	admin: 'admin',
	order: 'order',
	trade: 'trade',
	company: 'company',
	birdeye: 'birdeye',
	news: 'news'
}

/**
 * @param {String} module  
 * @param {String} operation  
 * @param {Object} data 请求参数
 * @param {Object} ext 附加参数
 * @param {Number} ext.cache 数据缓存时间，秒
 */
export default function(module, operation, data = {}, ext = {}) {

	return new Promise((resolve, reject) => {

		const cloudFnName = module; // moduleMap[module] || 'app';		
		const token = uni.getStorageSync('uniIdTokenAdmin') || '';
		//const tokenExpired =uni.setStorageSync('getStorageSync')||'';
		//console.log(token)
		if (ext.cache > 0) {
			const cacheResult = cache.get(cloudFnName + '-' + module + '-' + operation);
			if (cacheResult !== false && cacheResult.status !== 0) {
				resolve(cacheResult);
				return;
			}
		}
		if (ext.showLoading) {
			uni.showLoading()
		}
		//服务器地址 
		let serverUrl="/adminapi"; //"http://45.207.53.253:9001"
		//const serverUrl = "http://127.0.0.1:9800"; //"http://45.207.53.253:9001" 
		
		//console.log(serverUrl+'/'+cloudFnName+'/'+operation)
		if (ext.serverUrl)
			serverUrl = ext.serverUrl

		uni.request({
			url: serverUrl + '/' + cloudFnName + '/' + operation,
			method: 'POST', // 请求方法，可选值：GET、POST、PUT、DELETE、OPTIONS、HEAD，默认为GET
			data: data, // 请求的参数，可以是普通对象或字符串
			header: {
				'Content-Type': 'application/json',
				'lang': 'zh',
				'token': token,
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36 Core/1.94.202.400 QQBrowser/11.9.5355.400',
			}, // 请求的头部信息   
			dataType: 'json' // 响应的数据类型，可选值：text、json，默认为json			 
		}).then(resa => {
			//console.log('请求返回数据111:',resa)
			if (ext.showLoading) uni.hideLoading();
			let res;
			if (Array.isArray(resa)) {
				// 处理返回结果为数组的情况
				for (let i = 0; i < resa.length; i++) {
					if (resa[i] !== null) {
						res = resa[i];
						break;
					}
				}
			} else {
				res = resa
			}

			if (res && typeof res.openExamine !== 'undefined') {
				store.commit('setStateAttr', {
					key: 'openExamine',
					val: res.openExamine
				});
			}

			if (res.statusCode == 200 || res.statusCode == 400) {
				//console.log(res)
				res = res.data;
				if (res.code >= 0) {
					const code = res.code;
					//token无效
					if (code === 5) {
						store.commit('logout');
						app.$router.push({
							name: 'login'
						});
						reject('无效的登录信息');
						return;
					} else if (code === 10001) {
						this.$message.error('帐号已被禁用');
						store.commit('logout');
						app.$router.push({
							name: 'login'
						});
						reject('用户被禁用');
						return;
					}
				}
				if (ext.cache > 0) {
					cache.put(cloudFnName + '-' + module + '-' + operation, res, ext.cache);
				}
				resolve(res);
			} else {
				// store.commit('logout');
				reject('无法连接到服务器' + res.statusCode);
			}
		}).catch((err) => {
			reject(err);
		})
	})
}