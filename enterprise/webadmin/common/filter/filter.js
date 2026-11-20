import Vue from 'vue'
import {
	date
} from '@/common/js/util'
Vue.prototype.copyAll = (txt) => {
	if (!txt) return ''
	uni.setClipboardData({
		data: txt,
		success: function() {
			// 设置成功 
			uni.showToast({
				title: '已复制'
			})
		},
		fail: function() {
			// 设置失败 
			uni.showToast({
				title: '复制失败 '
			})
		}
	});
}
Vue.filter('date', (timeStamp, format) => {
	if (!timeStamp) return '';
	return date(format, timeStamp);
})

Vue.filter('shot', (txt) => {
	return txt.substr(0, 4) + '****' + txt.substr(txt.length - 4)
})
Vue.filter('getName', (id, data) => {
	let arr = data.filter(item => item.id == id)
	return arr[0] && arr[0].name || ''
})
Vue.filter('price', (price, fixed = 2) => {
	if (!price || isNaN(price)) {
		return 0
	}
	return fixed > 0 ? parseFloat(price).toFixed(fixed) : +parseFloat(price).toFixed(2);
})
Vue.filter('withZeros', (val, decimalPlaces = 4) => {
	if (val === null || val === undefined || isNaN(val)) return val;

	// 转为数字并去除科学计数法
	val = Number(val).toString();

	// 获取整数部分和小数部分
	let [integerPart, decimalPart = ''] = val.split('.');

	// 统计小数部分前面的零的个数
	let leadingZeros = 0;
	for (let i = 0; i < decimalPart.length; i++) {
		if (decimalPart[i] === '0') {
			leadingZeros++;
		} else {
			break;
		}
	}

	// 如果小数部分有足够的零，将它们替换为 {数字} 格式
	let formattedDecimalPart = decimalPart;
	if (leadingZeros > 0) {
		formattedDecimalPart = `{${leadingZeros}}` + decimalPart.substring(leadingZeros,leadingZeros+decimalPlaces);
	} 
	// 组合结果
	let formattedVal = `${integerPart}.${formattedDecimalPart}`;
	if(formattedDecimalPart)
		return formattedVal;
	else 
		return val
})
Vue.filter('timeDiff', (seconds) => {
	if (!seconds || seconds < 0) return seconds;

	const UNITS = [{
			label: "月",
			value: 30 * 24 * 60 * 60
		}, // 1月 = 30天
		{
			label: "天",
			value: 24 * 60 * 60
		}, // 1天 = 24小时
		{
			label: "小时",
			value: 60 * 60
		}, // 1小时 = 60分钟
		{
			label: "分",
			value: 60
		}, // 1分 = 60秒
		{
			label: "秒",
			value: 1
		} // 秒
	];

	let result = "";

	for (const {
			label,
			value
		}
		of UNITS) {
		const unitAmount = Math.floor(seconds / value);
		if (unitAmount > 0 || (label === "秒" && result === "")) {
			result += `${unitAmount}${label}`;
		}
		seconds %= value;
	}

	return result;
})
Vue.filter('numberHandler',(val, decimalPlaces = 2)=>{	
	if(!val) return val;				
	val = val.toString().indexOf('e') == '-1' ? Number(val) : Number(val.toString().slice(0, 10))
	if ((val >= 10000 && val < 100000000) || (val <= -10000 && val > -100000000)) {
		val = fixedDecimalPlaces(val / 10000, decimalPlaces) + '万';
	}
	if (val >= 100000000) {
		val = fixedDecimalPlaces(val / 100000000, decimalPlaces) + '亿';
	}
	return typeof val == 'number' ? fixedDecimalPlaces(val, decimalPlaces) : val;
})
Vue.filter('dateDiff', (timestamp) => {
	if (!timestamp || timestamp < 0) return timestamp;

	const now = Date.now(); // 当前时间戳（毫秒）
	let milliseconds = Math.abs(now - timestamp); // 计算时间差（毫秒）

	const UNITS = [{
			label: "月",
			value: 30 * 24 * 60 * 60 * 1000
		}, // 1月 = 30天（毫秒）
		{
			label: "天",
			value: 24 * 60 * 60 * 1000
		}, // 1天 = 24小时（毫秒）
		{
			label: "小时",
			value: 60 * 60 * 1000
		}, // 1小时 = 60分钟（毫秒）
		{
			label: "分",
			value: 60 * 1000
		}, // 1分 = 60秒（毫秒）
		{
			label: "秒",
			value: 1000
		} // 秒（毫秒）
	];

	let result = "";

	for (const {
			label,
			value
		}
		of UNITS) {
		const unitAmount = Math.floor(milliseconds / value);
		if (unitAmount > 0 || (label === "秒" && result === "")) {
			result += `${unitAmount}${label}`;
		}
		milliseconds %= value;
	}

	return result;
});

function fixedDecimalPlaces (num, decimalPlaces = 4) {
	const numStr = num.toString();
	const decimalIndex = numStr.indexOf('.');
	if (decimalIndex === -1 || numStr.length - decimalIndex - 1 < decimalPlaces) {
		return numStr;
	}
	const decimalPart = numStr.substring(decimalIndex + 1, decimalIndex + 1 + decimalPlaces);
	const padding = '0'.repeat(Math.max(0, decimalPlaces - decimalPart.length));
	const integerPart = numStr.substring(0, decimalIndex || numStr.length);
	return `${integerPart}.${padding}${decimalPart}`;
}