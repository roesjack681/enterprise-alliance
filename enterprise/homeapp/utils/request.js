import Aes256Cryto from "@/utils/aes256Encryption";
import i18n from "@/i18n";

module.exports = (vm) => {
	uni.$u.http.setConfig((config) => {
		// 设置基础URL
		//config.baseURL = 'http://127.0.0.1:3009'; // 开发环境
		// config.baseURL = 'http://115.190.133.216:3009'; // 生产环境
		config.header["Content-Type"] = "application/x-www-form-urlencoded;charset=utf-8";
		// config.header["ip"] = store.state.ip || '';
		return config
	})
	
	// 请求拦截
	uni.$u.http.interceptors.request.use((config) => {
		config.header["x-api-key"]="REPLACE_WITH_LOCAL_VALUE";
		config.header["lang"] = i18n.locale;
		config.header["ip"] = uni.getStorageSync('ip') || '';
		
		// 登录接口不需要token
		if (!config.url.includes('/entity/login') && !config.url.includes('/register') && !config.url.includes('/find_password')) {
			config.header["token"] = uni.getStorageSync('token') || '';
		}
		
		return config;
	});
	
	// 响应拦截
	uni.$u.http.interceptors.response.use((response) => { 
		// const custom = response.config?.custom
		if (response.data && response.data.code === 1) {
			uni.showToast({title: response.data.msg, icon: 'none'});
		} else if (response.data && response.data.code === 5) {
			uni.showToast({title: response.data.msg, icon: 'none', success: () => {
				let toLogin = setInterval(() => {
					uni.navigateTo({url: "/pages/user/login"});
					clearInterval(toLogin)
				}, 1500)
			}});
		} else if (response.data && response.data.code === 0) {
			const type = typeof response.data.data; 
			//response.data.data = type==='string' ? JSON.parse(Aes256Cryto.Decrypt(response.data.data)) : response.data.data;
            return response.data;
		}
		return response.data;
	}, (response) => { 
		// 对响应错误做点什么 （statusCode !== 200） 
		if (response.data && response.data.code === 1) {
			uni.showToast({title: response.data.msg, icon: 'none'});
		} else if (response.data && response.data.code === 5) {
			uni.showToast({title: response.data.msg, icon: 'none', success: () => {
				let toLogin = setInterval(() => {
					uni.navigateTo({url: "/pages/user/login"});
					clearInterval(toLogin)
				}, 1500)
			}});
		} 
		return Promise.reject(response)
	})
}