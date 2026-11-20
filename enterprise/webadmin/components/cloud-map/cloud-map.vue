<template>
	<view class="uni-forms-item__content">
		<view class="flex text-gray" style="margin-bottom: 20rpx;">
			<text v-if="name">{{name}}</text>
			<text v-else>拖动地图或搜索改变位置</text>
		</view>
		<map ref="map1" class="map" min-scale="10" :scale="17" :show-location="true" :latitude="latitude"
			:longitude="longitude" @regionchange="onRegionchange">
			<cover-image class="map-center-icon" src="/static/location-center.png"></cover-image>
		</map> 
		<view class="flex" style="margin-top: 20rpx;">
			<el-input v-model="formData.addressSearch" placeholder="搜索地址" style="width:570px">
				  <el-link slot="append" type="primary" @click="geocoder">搜索</el-link>
			</el-input> 
		</view>
	 
	</view>
</template>

<script>
	//const db = uniCloud.database();
	export default {
		name: 'cloud-map',
		data() {
			return {
				formVisible:false,
				formData: {
					addressSearch: "",
				},
				name: "",
				timer: false,	
				latitude:40.720433,
				longitude:108.648788,
				nearAddressList: []
			};
		},
		props: {
			value: [Number, String, Array, Object],
			location: {
				// 排列方向 row column
				type: Object,
				default: () => {}
			},
		}, 
		created() {	 
			const data=uni.getStorageSync('$pickupinfo')
			this.setValues(data);
		},
		watch: { 
			value(newVal) {
				console.log(newVal);
				if (newVal){
					this.setValues(newVal);					
				}
			}
		},
		methods: { 
			setValues(newVal) {
				if (typeof newVal == "string") {
					console.log("string", newVal)
					this.formData.addressSearch = newVal;
					this.geocoder()
					this.name = newVal;
					this.formData.addressSearch = "";
				} else {
					this.name = newVal.name||newVal.address;
					this.latitude = newVal.latitude;
					this.longitude = newVal.longitude;
				}
			},
			//地图区域改变
			async onRegionchange(e) {				 
				clearTimeout(this.timer)
				this.timer = setTimeout(() => {
					//h5 end  安卓 regionchange
					if (e.type === 'end' || e.type === 'regionchange') {
						//中间位置
						console.log(e);
						this.latitude = e.detail.centerLocation.latitude
						this.longitude = e.detail.centerLocation.longitude
						console.log("拖动地图", this.latitude, this.longitude)
						this.reverseGeocoder(); 
					}
				}, 500)
			},
			async geocoder() {
				console.log("开始搜索", this.formData.addressSearch)
				 
				this.$request('map','getAddressGeo', {
						address: this.formData.addressSearch
					})
					.then(res => {
						console.log(res)
						this.latitude = res.location.lat;
						this.longitude = res.location.lng;
						this.reverseGeocoder();
					}).catch(err => {

					}).finally(err => {})
			},
			async reverseGeocoder() {
				this.$request('map','getLocationAddress', {
						fromLatlng: [this.latitude, this.longitude].join(",")
					})
					.then(res => {
						console.log(res)
						this.name = res.formatted_addresses.recommend;
						this.$emit('input', {
							...res.ad_info,
							name: res.formatted_addresses.recommend,
							addres: res.address,
							latitude: this.latitude,
							longitude: this.longitude,
							//location: new db.Geo.Point(this.longitude, this.latitude)
						}); 
					}).catch(err => {

					}).finally(err => {})
			},
		}
	}
</script>
<style lang="scss">
	.map {
			width: 960rpx;
			height: 500rpx;
		} 
		.map-center-icon {
			position: absolute;
			left: 444rpx;
			top: 214rpx;
			width: 72rpx;
			height: 72rpx;
		}
</style>
