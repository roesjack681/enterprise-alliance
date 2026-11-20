<script>
	import Vue from 'vue'
	//import Aes256Cryto from "@/utils/aes256Encryption";
	import socket from '@/utils/socket.js';
	let sign = null;
	let signNum = 0;
	export default {
		globalData: {
			// 移除复杂的socket管理，使用统一的socket工具类
		},
		data() {
			return {
				socketCheckStarted: false, // 标记Socket状态检查是否已启动
				socketCheckTimer: null // Socket状态检查定时器
			}
		},
		onLaunch: function() {
			uni.getSystemInfo({
				success: e=> {
					this.initSize(e);
				}
			})			
			this.setLanguage();
			this.addWatchJump();
			
			// 只有在有token的情况下才初始化socket
			const token = uni.getStorageSync('token');
			if (token) {
				socket.init();
			}
			
			// #ifdef APP
			//	this.pushInit();
			
			// #endif
		},
		onShow: function() {
			// #ifdef APP
			// this.isOpenPush();
			// #endif
			sign = setInterval(() => { signNum++ }, 1000);
			
			// 定期检查socket连接状态（只启动一次）
			if (!this.socketCheckStarted) {
				this.startSocketStatusCheck();
				this.socketCheckStarted = true;
			}
		},
		onHide: function() {
			clearInterval(sign);
		},
		methods: {
			initSize(e){
				// #ifndef MP
				Vue.prototype.StatusBar = e.statusBarHeight+10;
				if (e.platform == 'android') {
					Vue.prototype.CustomBar = e.statusBarHeight + 50;
				} else {
					Vue.prototype.CustomBar = e.statusBarHeight + 45;
				};
				// #endif 
				// #ifdef MP-WEIXIN
				Vue.prototype.StatusBar = e.statusBarHeight;
				let custom = wx.getMenuButtonBoundingClientRect();
				Vue.prototype.Custom = custom;
				Vue.prototype.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
				// #endif 
				// #ifdef MP-ALIPAY
				Vue.prototype.StatusBar = e.statusBarHeight;
				Vue.prototype.CustomBar = e.statusBarHeight + e.titleBarHeight;
				// #endif 
			},
			// 判断是否开启消息推送
			isOpenPush () {
				// if (uni.getAppAuthorizeSetting().notificationAuthorized !== 'authorized') {
				// 	uni.showModal({
				// 		title: '通知权限开启提醒',
				// 		content: '您还没有开启通知权限，无法接受到消息通知，请前往设置',
				// 		showCancel: false,
				// 		confirmText: '去设置',
				// 		success (res) {
				// 			if (res.confirm) {
				// 				uni.openAppAuthorizeSetting();
				// 			}
				// 		}
				// 	})
				// }
			},
			// 消息推送
			pushInit () {
				// 获取设备CID
				// uni.getPushClientId({
				// 	success(res) {
				// 		uni.setStorageSync('clientId', res.cid);
				// 		// plus.runtime.setBadgeNumber(3)
				// 	}
				// })
				// // 监听点击消息进入
				// uni.onPushMessage(res => {
				// 	console.log(res);
				// 	if (res.type === 'click') {
				// 		uni.navigateTo({ url: res.data.payload.url });
				// 	}
				// })
			},
			// 监听 switchTab、navigateTo判断是否必须登录、签到计时
			addWatchJump () {
				let _this = this;
				// 监听 navigateTo 判断是否必须登录、签到计时
				let needLogin = ['/pages/my/my', '/pages/my/editUser', '/pages/my/set'];
				uni.addInterceptor('navigateTo', {
					invoke (e) {
						if (needLogin.includes(e.url) && !uni.getStorageSync('token')) {
							uni.navigateTo({url: '/pages/user/login'});
							return false;
						}; 
					}
				})
				 
			},			 
			// 获取IP并设置语言
			setLanguage () {
				let language = uni.getStorageSync('language');
				this.$C.setLanguage(language || 'zh_CN'); 
			},
			
			// 处理登录状态变化时的socket重连
			handleLoginStateChange() {
				const token = uni.getStorageSync('token');
				if (token) {
					// 有token时初始化socket
					socket.init();
				} else {
					// 无token时断开socket
					socket.disconnect();
				}
			},
			
			// 开始socket状态检查（避免重复启动）
			startSocketStatusCheck() {
				if (this.socketCheckTimer) {
					return;
				}
				
				this.socketCheckTimer = setInterval(() => {
					socket.checkConnectionStatus();
				}, 30000);
			},
			
			// 停止socket状态检查
			stopSocketStatusCheck() {
				if (this.socketCheckTimer) {
					clearInterval(this.socketCheckTimer);
					this.socketCheckTimer = null;
					this.socketCheckStarted = false;
				}
			}
		}
	}
</script>

<style lang="scss">	
	@import "uview-ui/index.scss";
	@import 'static/fonts/iconfont.css';
	@import "colorui/main.css";
	@import "colorui/icon.css";
	/*每个页面公共css */
</style>
