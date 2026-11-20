import i18n from "@/i18n";
class common {
	constructor() { }
	getRoleName(roleValue) {
		const roleNameMap = {
			1: '管理员',
			2: '省级',
			3: '市级',
			4: '区县级',
			5: '乡镇级',
			6: '街道级',
			7: '服务商',
			8: '企业',
			9: '协会',
			10: '经纪人',
		};
		return roleNameMap[roleValue] || '普通用户';
	}
	getAuthName(id) {
		const data = {
			1: '待审核',
			2: '审核通过',
			3: '审核拒绝',
			4: '已驳回',
		}
		return data[id] || '未认证'
	}

	jump(url) {
		uni.navigateTo({
			url: url
		})
	}
	toBack() {
		uni.navigateBack()
	}
	//
	/*
	 * 时间差转换显示,支持毫秒/秒时间戳自动判断
	 * formatTimeAgo(timestamp)
	 * 刚刚，几分钟前...	
	*/
	formatTimeAgo(timestamp) {
		if (!timestamp) return timestamp;

		if (timestamp < 1e12) {
			// 秒级时间戳，转为毫秒
			timestamp *= 1000;
		}
		const now = Date.now();
		const diff = now - timestamp;

		const seconds = Math.floor(diff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);
		const weeks = Math.floor(days / 7);
		const months = Math.floor(days / 30);
		const years = Math.floor(days / 365);

		if (seconds < 60) return '刚刚';
		if (minutes < 60) return `${minutes} 分钟前`;
		if (hours < 24) return `${hours} 小时前`;
		if (days < 7) return `${days} 天前`;
		if (weeks < 5) return `${weeks} 周前`;
		if (months < 12) return `${months} 个月前`;
		return `${years} 年前`;
	}
		/*
	 * 时间戳转动态短日期时间格式,支持毫秒/秒时间戳自动判断
	 * formatDateSmart(timestamp)
	 * 刚刚					刚刚
	 * 几分钟前				5分钟前
	 * 2025-06-18 11:30	同一天	11:30
	 * 2025-06-17 11:30	昨天	昨天 11:30
	 * 2025-06-16 11:30	同年	06-16 11:30
	 * 2023-12-03 12:23	不同年	2023-12-03 12:23			
	*/

	formatDateSmart(timestamp) {
		if (!timestamp) return '';
		if(timestamp==0){
			return '';
		}
		// 处理秒级时间戳
		if (timestamp < 1e12) {
			timestamp *= 1000;
		}

		const date = new Date(timestamp);
		const now = new Date();

		const pad = (n) => (n < 10 ? '0' + n : n);

		const year = date.getFullYear();
		const month = pad(date.getMonth() + 1);
		const day = pad(date.getDate());
		const hours = pad(date.getHours());
		const minutes = pad(date.getMinutes());

		const nowYear = now.getFullYear();
		const nowMonth = now.getMonth();
		const nowDay = now.getDate();

		// 计算时间差（以毫秒为单位）
		const timeDiff = now - date;
		const minutesDiff = Math.floor(timeDiff / (1000 * 60));
		
		// 计算日期差（以天为单位）- 使用更准确的方法
		const date1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const date2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const dateDiff = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));

		// 刚刚（1分钟内）
		if (timeDiff < 60 * 1000) {
			return '刚刚';
		}
		// 几分钟前（1小时内）
		else if (minutesDiff < 60) {
			return `${minutesDiff}分钟前`;
		}
		// 今天（同一天）
		else if (year === nowYear && date.getMonth() === nowMonth && date.getDate() === nowDay) {
			return `${hours}:${minutes}`;
		}
		// 昨天
		else if (dateDiff === 1) {
			return `昨天 ${hours}:${minutes}`;
		}
		// 同一年
		else if (year === nowYear) {
			return `${month}-${day} ${hours}:${minutes}`;
		}
		// 不同年
		else {
			return `${year}-${month}-${day} ${hours}:${minutes}`;
		}
	}

	// 日期处理
	dateFormat(val, type = 'YYYY-MM-DD HH:mm') {
		if (val) {
			let date = new Date(val);
			switch (type) {
				case 'YYYY-MM-DD':
					return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
				case 'YYYY-MM-DD HH:mm':
					return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
				case 'HH:mm':
					return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
				case 'MM-DD HH:mm':
					return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
				case 'MM-DD':
					return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
				default:
					return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
			}
		} else {
			return '';
		}
	}

	// 复制内容到粘贴板
	copyToClipboard(val) {
		uni.setClipboardData({
			data: val,
			showToast: false,
			success: () => {
				uni.showToast({
					title: '复制成功',
					icon: 'none'
				});
			}
		})
	}
	// 设置语言
	setLanguage(language) {
		i18n.locale = language;
		// uni.setTabBarItem({ index: 0, text: i18n.t('tabbar.home')});
		// uni.setTabBarItem({ index: 1, text: i18n.t('tabbar.video')});
		// uni.setTabBarItem({ index: 2, text: i18n.t('tabbar.teams')}); 
		// uni.setTabBarItem({ index: 3, text: i18n.t('tabbar.my')});
		uni.setStorageSync("language", language);
	}
	randString(num) {
		let str = ""
		const strArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S',];
		for (let i = 0; i < num; i++) {
			str += strArr[Math.floor(Math.random() * strArr.length)]
		}
		return str
	}

}

export default new common();