<template name="home">
	<view>
		<!-- <cu-custom bgColor='bg-white' :isBack='true'>
			<block slot='backText'><text class="text-lg text-bold">供需发布</text></block>
		</cu-custom> -->
		<view class="content">
			<view class="cu-form-group ">
				<view class="title">*标题</view>
				<input placeholder="20字以内" v-model="formdata.title"></input>
			</view>
			<view class="cu-form-group">
				<view class="title">*发布类型</view>
				<picker @change="bindPickerChange" :range="tylist" range-key="cname" data-id="1">
					<view class="picker">
						{{ filter.comp1 || '选择发布类型' }}
					</view>
				</picker>
			</view>

			<view class="cu-form-group">
				<view class="title">*所在地</view>
				<view class="picker region-picker" @click="showPicker = true">
					{{ selectedText || '请选择所在地区' }}
				</view>
			</view>
			<view class="cu-form-group">
				<view class="title">*详细地址</view>
				<input placeholder="详细地址" v-model="formdata.address"></input>
			</view>
			<view class="cu-form-group">
				<view class="title">*联系人</view>
				<input placeholder="联系人" v-model="formdata.person"></input>
			</view>
			<view class="cu-form-group ">
				<view class="title">*联系方式</view>
				<input placeholder="联系电话" v-model="formdata.mobile"></input>
			</view>
			<view class="cu-form-group">
				<view class="title">发布企业</view>
				<view class="company-display">
					{{ formdata.company_name || '暂无企业信息' }}
				</view>
			</view>
			<view class="cu-form-group">
				<view class="title">*可见性</view>
				<picker @change="bindPickerChange" :range="visibilityList" range-key="name" data-id="2">
					<view class="picker">
						{{ filter.visibility || '选择可见性' }}
					</view>
				</picker>
			</view>
			<view class="cu-form-group" v-if="id">
				<view class="title">需求状态</view>
				<picker @change="bindPickerChange" :range="statusList" range-key="name" data-id="3">
					<view class="picker">
						{{ filter.statusText || '发布中' }}
					</view>
				</picker>
			</view>
			<view class="cu-form-group">
				<view class="title">预算价格</view>
				<input placeholder="请输入预算价格（元）" type="number" v-model="formdata.budget_price"></input>
			</view>
			<!-- 图片上传 -->
			<view class="cu-form-group">
				<view class="title">图片上传 ({{ imgList.length }}/4)</view>
				<view class="image-upload-container">
					<view class="image-item" v-for="(item, index) in imgList" :key="index">
						<image class="upload-img" :src="item" mode="aspectFill" @click="previewImage(index)"></image>
						<view class="delete-btn" @click="deleteImage(index)">
							<text class="cuIcon-close"></text>
						</view>
					</view>
					<view class="upload-placeholder" @click="chooseImage" v-if="imgList.length < 4">
						<image class="upload-icon" src="/static/icon/upload.png" mode="aspectFit"></image>
						<text class="upload-text">上传图片</text>
					</view>
				</view>
			</view>

			<view class=" foota  flex flex-direction">
				<button @click="submitForm" class="cu-btn bg-blue lg radius cuIcon-add">{{ id ? '保存修改' : '立即发布' }}</button>
			</view>
			<view  class="action bg-white text-bold  text-lg margin-top padding-sm solid-bottom">
				<text class="cuIcon-title text-blue"></text>详细内容
			</view>
			<view class="cu-form-group" style="padding: 0px;"> 
				<jinEdit height="90vh" :html="formdata.content" placeholder="请输入详细内容" @editOk="editOk" uploadFileUrl="/#"></jinEdit> 
			</view> 
			<!-- 地区选择弹窗 -->
			<RegionPicker :show.sync="showPicker" :provinceCode="'15'" :selectedValues="selectedCodes"
				@confirm="handleConfirm" />
			
		</view>
	</view>
</template>

<script>
import tkiTree from '@/components/tki-tree/tki-tree.vue';
import jinEdit from '@/components/jin-edit/jin-edit.vue'; 
import RegionPicker from '@/components/RegionPicker.vue';
import { uploadFileInChunks } from '@/utils/upload.js';
import { createDemand, updateDemand, getDemandDetail } from '@/utils/api.js';
import { msg } from '@/utils/util.js';
export default {
	components: {
		tkiTree,jinEdit,RegionPicker
	},
	data() {
		return {
			title:'发布',
			id: '',
			imgList: [],

			tylist: [{ "cname": "需求", "value": "1" }, { "cname": "求购", "value": "2" }, { "cname": "货物", "value": "3" }, { "cname": "服务", "value": "4" },{ "cname": "易货", "value": "5" }],
			visibilityList: [{ "name": "公开", "value": 1 }, { "name": "仅认证经纪人可见", "value": 2 }],
			statusList: [{ "name": "发布中", "value": 1 }, { "name": "已完成", "value": 2 }, { "name": "已取消", "value": 3 }],

			formdata: {
				title: '',
				type: 0,
				category_id: 1, // 默认分类ID，因为后端必需
				province: 0,
				city: 0,
				district: 0,
				street: 0,
				address: '', // 联系地址
				person: '',
				mobile: '',
				content: '',
				images: [],
				company_name: '', // 企业名称
				remark: '', // 备注信息
				visibility: 1, // 可见性（1:公开 2:仅认证经纪人可见）
				budget_price: 0, // 预算价格
				status: 1, // 需求状态（1:发布中 2:已完成 3:已取消）
			},
			filter: {
				comp1: '',
				visibility: '公开', // 默认显示文本
				statusText: '发布中',
			},
			showPicker: false,
			selectedCodes: [5, 58, 698, 8031],
			selectedText: '请选择地区',
		}
	},
	async onLoad(options) {
		// 检查是否为编辑模式
		if (options.id) {
			this.id = options.id;
			this.title = '编辑需求';
			uni.setNavigationBarTitle({
				title: '编辑需求'
			});
		} else {
			this.title = '发布需求';
			uni.setNavigationBarTitle({
				title: '发布需求'
			});
		}
		
		if(options.tid){
			this.formdata.type =+ this.tylist[options.tid].value;
			this.filter.comp1 = this.tylist[options.tid].cname;
			this.title=this.filter.comp1+'发布'
		}
		
		this.loadUserInfo();
		
		// 如果是编辑模式，加载需求详情
		if (this.id) {
			await this.loadDemandDetail();
		}
		
		setTimeout(()=>{
			uni.pageScrollTo({
				duration:300,//过渡时间必须为0，uniapp bug，否则运行到手机会报错
				scrollTop: 1,//滚动到目标位置
				success:function(){
					// console.log('成功了')
				},
			})
		},500)
	},
	// #ifdef MP-WEIXIN
	onShareAppMessage(res) {
		let userInfo = uni.getStorageSync('userInfo')
		return {
			title: '亿招采-实时招标采购信息',
			path: '/pages/home/home?inviteCode=' +userInfo.inviteCode,
			imageUrl: 'https://mp-1a566ae5-a643-4f73-99dc-242564c591b3.cdn.bspapp.com/static/banner.jpg?t=1'
		}
	},
	// #endif
	methods: {
		// 加载需求详情（编辑模式）
		async loadDemandDetail() {
			if (!this.id) return;
			
			uni.showLoading({
				title: '加载中...',
				mask: true
			});
			
			try {
				const res = await getDemandDetail({ id: this.id });
				
				if (res.code === 0 && res.data) {
					const data = res.data.demand || res.data;
					
					// 填充表单数据
					this.formdata = {
						...this.formdata, // 保留默认值
						title: data.title || '',
						type: data.type || 0,
						category_id: data.category_id || 1,
						province: data.province || 0,
						city: data.city || 0,
						district: data.district || 0,
						street: data.street || 0,
						address: data.address || '',
						person: data.person || '',
						mobile: data.mobile || '',
						content: data.content || '',
						company_name: data.company_name || '',
						remark: data.remark || '',
						visibility: data.visibility || 1,
						budget_price: data.budget_price || 0,
						status: data.status || 1,
					};
					
					// 处理图片数据
					if (data.images) {
						try {
							this.imgList = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
						} catch (e) {
							this.imgList = [];
						}
					}
					
					// 设置选择器显示值
					const typeItem = this.tylist.find(item => item.value == data.type);
					if (typeItem) {
						this.filter.comp1 = typeItem.cname;
					}
					
					const visibilityItem = this.visibilityList.find(item => item.value == data.visibility);
					if (visibilityItem) {
						this.filter.visibility = visibilityItem.name;
					}
					const statusItem = this.statusList.find(item => item.value == (data.status || 1));
					if (statusItem) {
						this.filter.statusText = statusItem.name;
					}

					// 设置地区显示
					if (data.province && data.city) {
						this.selectedCodes = [data.province, data.city, data.district || 0, data.street || 0];
						// 这里可以调用地区名称查询接口来设置显示文字，暂时使用地址
						this.selectedText = data.address || '已选择地区';
					}
					
				} else {
					uni.showToast({
						title: res.msg || '加载失败',
						icon: 'none'
					});
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				}
			} catch (error) {
				uni.showToast({
					title: '网络错误',
					icon: 'none'
				});
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}
			
			uni.hideLoading();
		},
		
		// 点击发布
		editOk(res) {
		    // console.log(res);
			if(res.isPublic){
				this.formdata.content=res.html;
				this.submitForm();
			}else{
				this.formdata.content=res.html;
			}				
		},
		loadUserInfo() {
			// 从本地存储获取用户信息
			const userInfo = uni.getStorageSync('$userinfo');
			
			if(userInfo) {
				// 优先使用 entityInfo 中的企业信息
				const entityInfo = userInfo.entityInfo;
				
				if (entityInfo) {
					this.formdata.company_name = entityInfo.name || ''; // 企业名称
					this.formdata.company = entityInfo.name || '';
					this.formdata.person = entityInfo.company_present_name || userInfo.nickname || ''; // 法人代表姓名
					this.formdata.mobile = entityInfo.company_present_mobile || userInfo.mobile || ''; // 法人代表手机号
					

					
					// 设置地区信息
					if (entityInfo.province) {
						this.formdata.province = entityInfo.province;
						this.formdata.city = entityInfo.city;
						this.formdata.district = entityInfo.town || 0; // 使用 town 作为 district
						this.formdata.street = entityInfo.street;
						
						// 如果用户还没有手动输入详细地址，则使用企业注册地址
						if (!this.formdata.address) {
							this.formdata.address = entityInfo.address || '';
						}
						
						this.selectedText = entityInfo.address || '';
						// 设置地区选择器的值
						this.selectedCodes = [entityInfo.province, entityInfo.city, entityInfo.town, entityInfo.street];
					}
				} else {
					// 如果没有 entityInfo，使用基本用户信息
					this.formdata.company_name = userInfo.nickname || '';
					this.formdata.company = userInfo.nickname || '';
					this.formdata.person = userInfo.nickname || '';
					this.formdata.mobile = userInfo.mobile || '';
				}
			}
		},
		//提交表单		  
		async submitForm() {
			// 表单验证
			if (!this.formdata.title ) {
				msg('请输入标题');
				return;
			}
			if(this.formdata.type==0){
				msg('请选择发布类型');
				return;
			}
			if (!this.formdata.person ) {
				msg('请输入联系人');
				return;
			}
			if (!this.formdata.mobile ) {
				msg('请输入联系方式');
				return;
			}
			if (!this.formdata.address ) {
				msg('请选择所在地区');
				return;
			}
			if(this.formdata.visibility==0){
				msg('请选择可见性');
				return;
			}
			if (!this.formdata.company_name ) {
				msg('企业名称不能为空');
				return;
			}
			
			// 准备提交数据
			const data = {
				...this.formdata,
				images: JSON.stringify(this.imgList), // 转换为JSON字符串
			}
			
			// 移除前端特有字段
			delete data.company_id;
			delete data.company;
			
			// 如果是编辑模式，添加ID
			if (this.id) {
				data.id = this.id;
			}
			
			uni.showLoading({
				title: this.id ? '保存中...' : '发布中...',
				mask: true
			});
			
			try {
				let res;
				if (this.id) {
					// 编辑模式：调用更新接口
					res = await updateDemand(data);
				} else {
					// 新建模式：调用创建接口
					res = await createDemand(data);
				}
				
				uni.hideLoading();
				
				if (res.code === 0) {
					msg(this.id ? '保存成功' : '发布成功');
					setTimeout(() => { 
						// 返回到我的需求列表
						uni.navigateTo({
							url: '/pages/demand/mydemand'
						});
					}, 1000);
				} else {
					msg(res.msg || (this.id ? '保存失败' : '发布失败'));
				}
			} catch (error) {
				uni.hideLoading();
				msg('网络错误，请重试');
			}
		},
		bindPickerChange(e) {
			this.TabCur = e.currentTarget.dataset.id;
			this.scrollLeft = (e.currentTarget.dataset.id - 1) * 60;

			if (this.TabCur == 1) {
				this.formdata.type =+ this.tylist[e.target.value].value;
				this.filter.comp1 = this.tylist[e.target.value].cname;
			}
			else if (this.TabCur == 2) {
				this.formdata.visibility = this.visibilityList[e.target.value].value;
				this.filter.visibility = this.visibilityList[e.target.value].name;
			}
			else if (this.TabCur == 3) {
				this.formdata.status = this.statusList[e.target.value].value;
				this.filter.statusText = this.statusList[e.target.value].name;
			}
		},
		
		chooseImage() {
			const that = this;
			const remainingCount = 4 - this.imgList.length;
			
			uni.chooseImage({
				count: remainingCount,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: function(res) {
					const tempFilePaths = res.tempFilePaths;
					const tempFiles = res.tempFiles;
					
					// 批量上传图片
					that.uploadImages(tempFiles);
				}
			});
		},
		
		async uploadImages(files) {
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				try {
					const result = await uploadFileInChunks(file, {
						onProgress: (percent) => {
							uni.showLoading({ 
								title: `上传中 ${percent}%`,
								mask: true 
							});
						}
					});
					

					uni.hideLoading();
					this.imgList.push(result.filePath);
					
				} catch (err) {
					uni.hideLoading();
					uni.showToast({
						title: '图片上传失败',
						icon: 'none'
					});
				}
			}
		},
		
		previewImage(index) {
			uni.previewImage({
				current: index,
				urls: this.imgList,
				indicator: 'number'
			});
		},
		
		deleteImage(index) {
			uni.showModal({
				title: '提示',
				content: '确定要删除这张图片吗？',
				cancelText: '取消',
				confirmText: '删除',
				success: (res) => {
					if (res.confirm) {
						this.imgList.splice(index, 1);
					}
				}
			});
		},
		handleConfirm({selectedValues,selectedNames}) {
			this.selectedCodes = selectedValues;
			this.selectedText = selectedNames.join(' ');
			// 更新表单数据
			this.formdata.province = selectedValues[0] || 0;
			this.formdata.city = selectedValues[1] || 0;
			this.formdata.district = selectedValues[2] || 0;
			this.formdata.street = selectedValues[3] || 0;
			
			// 如果用户还没有手动输入详细地址，则使用地区名称作为默认值
			if (!this.formdata.address) {
				this.formdata.address = selectedNames.join(' ');
			}
		},

	},

}
</script>

<style>
.cu-form-group {
	padding: 20rpx 30rpx;
}

.page {
	height: 100vh;
}

.title {
	min-width: calc(4em + 15px);
	color: #666666;
}

.foota {
	margin-top: 40upx;
	padding-bottom: 60upx;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 40upx 40rpx 60upx 40rpx;
}

/* 图片上传样式 */
.image-upload-container {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
	margin-top: 20rpx;
}

.image-item {
	position: relative;
	width: 200rpx;
	height: 200rpx;
	border-radius: 16rpx;
	overflow: hidden;
}

.upload-img {
	width: 100%;
	height: 100%;
	border-radius: 16rpx;
}

.delete-btn {
	position: absolute;
	top: 8rpx;
	right: 8rpx;
	width: 40rpx;
	height: 40rpx;
	background-color: rgba(0, 0, 0, 0.6);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #fff;
	font-size: 24rpx;
}

.upload-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 160rpx;
	height: 160rpx;
	background-color: #F8F9FA;
	border: 2rpx dashed #D9D9D9;
	border-radius: 12rpx;
}

.upload-icon {
	width: 32rpx;
	height: 32rpx;
	margin-bottom: 8rpx;
}

.upload-text {
	font-size: 22rpx;
	color: #666666;
}

/* 地区选择样式 */
.region-picker {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 100%;
}

/* 企业显示样式 */
.company-display {
	flex: 1;
	color: #333;
	font-size: 30rpx;
	line-height: 1.5;
	padding: 10rpx 0;
}
</style>