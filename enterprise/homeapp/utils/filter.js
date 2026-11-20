import Vue from 'vue'
 
Vue.prototype.copyAll = (txt) => {
	if(!txt) return ''
	uni.setClipboardData({ 
	    data: txt,  
	    success: function () { 
	        // 设置成功 
			uni.showToast({
				title:'已复制'
			})
	    },  
	    fail: function () {
	        // 设置失败 
			uni.showToast({
				title:'复制失败 '
			})
	    } 
	});
}
Vue.filter('date', (timeStamp, format)=>{
	if(!timeStamp) return '';

	if('' + timeStamp.length <= 10){
		timeStamp = + timeStamp * 1000;
	}else{
		timeStamp = + timeStamp;
	}
	let _date = new Date(timeStamp),
		Y = _date.getFullYear(),
		m = _date.getMonth() + 1,
		d = _date.getDate(),
		H = _date.getHours(),
		i = _date.getMinutes(),
		s = _date.getSeconds();
	
	m = m < 10 ? '0' + m : m;
	d = d < 10 ? '0' + d : d;
	H = H < 10 ? '0' + H : H;
	i = i < 10 ? '0' + i : i;
	s = s < 10 ? '0' + s : s;

	return format.replace(/[YmdHis]/g, key=>{
		return {Y,m,d,H,i,s}[key];
	});
})

Vue.filter('shot', (txt)=>{
	return txt.substr(0,4)+'****'+txt.substr(txt.length-4)
})
Vue.filter('getName', (id, data)=>{
	let arr=data.filter(item=>item.id==id)
	return arr[0]&& arr[0].name||''
})
Vue.filter('price', (amount, fixed=2)=>{
	if(!amount || isNaN(amount)){
		return 0
	}
	const parts = parseFloat(amount).toFixed(fixed).split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return `${parts.join('.')}`;
	//return fixed > 0 ? parseFloat(price).toFixed(fixed) : + parseFloat(price).toFixed(2);
})
/**
 * 格式化时间戳 Y-m-d H:i:s
 * @param {String} format Y-m-d H:i:s
 * @param {Number} timestamp 时间戳   
 * @return {String}
 */
 