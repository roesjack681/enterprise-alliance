<template name="home">
	<view>
		<view class="content"> 
			<view class=" bg-white  padding-sm">
				<view class=" text-bold text-xl text-black">{{data.title||''}}
				</view> 
				<view class="item-tag margin-top-sm">
					<view class="cu-tag radius">{{getTypeName(data.type)}}</view>
					<view class="cu-tag radius" v-if="data.budget_price && data.budget_price > 0">预算: ¥{{data.budget_price}}</view>
					<view class="cu-tag radius text-red" v-if="data.visibility === 2">仅经纪人可见</view>
				</view>
				<view class="text-gray margin-top-sm">需求编号：<text class="text-black">{{data.id}}</text></view>
				<view class="text-gray">发布单位：<text class="text-blue">{{data.company_name}}</text></view>
				<view class="text-gray">发布时间：<text class="text-black">{{formatTime(data.create_time)}}</text></view> 
				<view class="text-gray text-cut">备注说明：{{data.remark||'暂无备注'}}</view> 
			</view>
			<view  class=" bg-white margin-top-sm padding-xs">
				<view class="action text-bold padding-sm  text-black solid-bottom">
					<text class="cuIcon-title text-blue"></text>详细内容
				</view>  
				<view v-if="data.images && data.images.length > 0" class="margin-top-sm grid col-4 grid-square flex-sub">
					<view class="bg-img" v-for="(item2, idx) in data.images" :key="idx" @tap="ViewImage(data.images,idx)" :data-url="item2">
						<image :src="item2" mode="aspectFill"></image>
					</view>
				</view>	 
				<view class=" margin-sm"> 
					<rich-text :nodes="formatContent(data.content)"></rich-text>
				</view>	 
			</view> 
			<view v-if="data.person && canViewContact" class=" bg-white margin-top-sm padding-xs">
				<view class=" text-bold  text-black padding-sm">
					联系方式			 
				</view> 
				<view   class="text-gray margin-sm">
					<text class="text-blue text-lg ">{{data.mobile}}</text>
					<text class="margin-left">联系人：{{data.person}}</text>
					<!-- <text class="text-blue  margin-left-sm" @tap="addToContacts">
						<text class=" margin-right-xs"></text>添加到通讯录
					</text> -->
					 
					<view class="text-left margin-top-sm">地址：{{data.address}}</view>
				</view>	  
			</view>
			
			<!-- 无权限查看联系方式的提示 -->
			<view v-if="data.person && !canViewContact && data.visibility === 2" class=" bg-white margin-top-sm padding-xs">
				<view class=" text-bold  text-black padding-sm">
					联系方式			 
				</view> 
				<view class="text-center margin-sm padding-lg permission-tip">
					<view class="lock-icon">
						<text class="cuIcon-lock text-orange"></text>
					</view>
					<view class="tip-title">
						此需求联系方式仅对认证经纪人可见
					</view>
					<view class="tip-desc">
						如需查看联系方式，请先完成经纪人认证
					</view>
					<button class="cu-btn bg-blue round sm margin-top" @tap="goToBrokerAuth">
						立即认证
					</button>
				</view>	  
			</view> 
			<!-- 添加到意向需求按钮（无权限时显示） -->
			<view v-if="userInfo.role==10" class="bg-white padding-sm">
				<button class="cu-btn bg-blue lg block" @tap="addIntentionDemand">加入意向需求</button>
			</view>
			<view style="margin-top: 40rpx; padding-bottom: 120rpx;"></view>
		</view>
		
		<!-- 底部菜单栏 -->
		<view v-if="userInfo.role==10" class="cu-bar bg-white tabbar border foot">
			<view class="action" @tap="goHome">
				<view class="cuIcon-home text-gray"></view>
				<view class="text-gray">首页</view>
			</view>
			<view class="action" @tap="makePhoneCall" v-if="canViewContact">
				<view class="cuIcon-phone text-green"></view>
				<view class="text-gray">拨号</view>
			</view>
			<view class="action" @tap="addClient">
				<view class="cuIcon-favor text-gray"></view>
				<view class="text-gray">添加客户</view>
			</view>			
			<view class="action" @tap="startChat" v-if="canViewContact">
				<view class="cuIcon-message text-blue"></view>
				<view class="text-gray">在线咨询</view>
			</view> 
		</view>
	</view>
</template>

<script>
	import { getDemandDetail,createPrivateRoom,addMarketGuest,addMarketNeed} from '@/utils/api.js';
	
	export default {
		data() {
			return {
				id:0,
				data:{},
				list: [],
				userInfo: {}, // 当前用户信息
				isFavorite: false, // 是否已收藏
			}
		},
		computed: {
			// 判断是否可以查看联系方式
			canViewContact() {
				// 如果没有联系人信息，直接返回false
				if (!this.data.person) {
					return false;
				}
				
				// 如果是需求发布者本人，总是可以查看
				if (this.data.user_id && this.userInfo.id && this.data.user_id === this.userInfo.id) {
					return true;
				}
				
				// 如果需求不是"仅经纪人可见"，所有人都可以查看
				if (this.data.visibility !== 2) {
					return true;
				}
				
				// 如果是"仅经纪人可见"，需要判断当前用户是否是经纪人
				// 经纪人角色：role = 10
				return this.userInfo.role === 10;
			}
		}, 
		onLoad(options) {
			if(options.id)
			this.id=options.id
			
			// 加载用户信息
			this.loadUserInfo();
			this.loadDetail();
		},	
		// #ifdef MP-WEIXIN
		onShareAppMessage(res) {
			let userInfo = uni.getStorageSync('userInfo')
			return {
				title: this.data.title || '需求详情',
				path: '/pages/demand/detail?id='+this.data.id,
				imageUrl: this.data.images && this.data.images[0] ? this.data.images[0] : 'https://mp-1a566ae5-a643-4f73-99dc-242564c591b3.cdn.bspapp.com/static/banner.jpg'
			}
		},
		// #endif	 
		methods: {
			// 加载用户信息
			loadUserInfo() {
				const userInfo = uni.getStorageSync('$userinfo');
				if (userInfo) {
					this.userInfo = userInfo;
				}
			},
			
			// 获取需求类型名称
			getTypeName(type) {
				const typeMapping = {
					1: "需求",
					2: "求购", 
					3: "货物",
					4: "服务",
					5: "易货"
				};
				return typeMapping[type] || "未知类型";
			},
			// 格式化时间
			formatTime(timestamp) {
				if (!timestamp) return '';
				const date = new Date(timestamp * 1000);
				return date.getFullYear() + '-' + 
					   String(date.getMonth() + 1).padStart(2, '0') + '-' + 
					   String(date.getDate()).padStart(2, '0');
			},

			//加载需求详情
			async loadDetail() {
				if (this.loaded) return;
				
				const sendData = {
					id: this.id
				}
				
				this.loaded = true;
				uni.showLoading({title: '加载中...', mask: false});
				
				try {
					const res = await getDemandDetail(sendData);
					
					if (res.code === 0 && res.data) {
						// 后端返回格式: {demand: {...}, publisher: {...}}
						const dest = res.data.demand || res.data;
						
						// 处理图片数据
						if (dest.images) {
							try {
								dest.images = typeof dest.images === 'string' ? JSON.parse(dest.images) : dest.images;
							} catch (e) {
								dest.images = [];
							}
						} else {
							dest.images = [];
						}
						
						// 处理时间戳
						if (dest.create_time && typeof dest.create_time === 'number') {
							dest.create_time = dest.create_time;
						}
						
						// 保存发布者信息
						if (res.data.publisher) {
							dest.publisher = res.data.publisher;
						}
						
						this.data = dest;
						
						// 添加到历史记录 - 使用新的API
						// TODO: 实现历史记录API
						
					} else {
						uni.showToast({
							title: res.msg || '加载失败',
							icon: 'none'
						});
						setTimeout(() => {
							uni.navigateBack();
						}, 1000);
					}
				} catch (error) {
					uni.showToast({
						title: '网络错误',
						icon: 'none'
					});
					setTimeout(() => {
						uni.navigateBack();
					}, 1000);
				}
				
				uni.hideLoading();
				this.loaded = false;
			}, 
			ViewImage(imgList,index) {
				const imgs =imgList 
				uni.previewImage({
					indicator: 'number',
					urls: imgs,
					current: imgs[index],
				});
			},
			// 格式化内容
			formatContent(content) {
				if (content) {
					const html = '<p>' + content.replace(/\n|\r\n/g, '</p><p>') + '</p>';
					return html;
				} 
				else {
					return content || '暂无详细描述';
				}
			},
			
			// 跳转到经纪人认证页面
			goToBrokerAuth() {
				uni.showModal({
					title: '经纪人认证',
					content: '是否前往经纪人认证页面？',
					success: (res) => {
						if (res.confirm) {
							// TODO: 根据实际路径调整
							uni.navigateTo({
								url: '/pages/entity/auth'
							});
						}
					}
				});
			},
			
			// 返回首页
			goHome() {
				uni.switchTab({
					url: '/pages/demand/list'
				});
			},
			
			// 添加客户
			async addClient() {
				if (!this.data.user_id) {
					uni.showToast({
						title: '缺少企业信息',
						icon: 'none'
					});
					return;
				}
				
				try {
					uni.showLoading({
						title: '添加中...',
						mask: true
					});
					
					const res = await addMarketGuest({
						entity_id: this.data.user_id
					});
					
					if (res.code === 0) {
						uni.showToast({
							title: '添加客户成功',
							icon: 'success'
						});
					} else {
						uni.showToast({
							title: res.msg || '添加失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.showToast({
						title:error.data.msg|| '网络错误',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			
			// 拨打电话
			makePhoneCall() {
				if (!this.canViewContact) {
					uni.showToast({
						title: '无权限查看联系方式',
						icon: 'none'
					});
					return;
				}
				
				if (this.data.mobile) {
					uni.makePhoneCall({
						phoneNumber: this.data.mobile,
						fail: (err) => {
							uni.showToast({
								title: '拨号失败',
								icon: 'none'
							});
						}
					});
				} else {
					uni.showToast({
						title: '联系电话不可用',
						icon: 'none'
					});
				}
			},
			
			// 开始聊天
			async startChat() {
				if (!this.canViewContact) {
					uni.showToast({
						title: '无权限查看联系方式',
						icon: 'none'
					});
					return;
				}
				// 创建私聊房间 
				if (this.data.user_id === this.userInfo.id) {
					uni.showToast({ title: '不能和自己聊天', icon: 'none' })
					return
				}
				
				// 保存服务信息到缓存，用于聊天页面显示
				const msgInfo = {
					title: this.data.title,
					img: this.data.images.length > 0 ? this.data.images[0] : '',
					desc: this.data.content ? this.removeHtmlTag(this.data.content).substring(0, 100) + '...' : '',//有html标签
					link: `/pages/demand/detail?id=${this.data.id}`
				}
				uni.setStorageSync('chat_service_info', msgInfo)
				
				const res = await createPrivateRoom({ user_id2: this.data.user_id })
				if (res.code === 0 && res.data && res.data.room_id) {
					uni.navigateTo({ url: `/pages/chat/chat?room_id=${res.data.room_id}&room_name=${encodeURIComponent('服务咨询')}` })
				}else{
					uni.showToast({ title: res.msg || '错误，请重试', icon: 'none' })
				}
			},
			// 添加到意向需求
			async addIntentionDemand() {
				if (!this.data.id) {
					uni.showToast({
						title: '需求信息不完整',
						icon: 'none'
					});
					return;
				}
				
				try {
					uni.showLoading({
						title: '添加中...',
						mask: true
					});
					
					const res = await addMarketNeed({
						demand_id: this.data.id
					});
					
					if (res.code === 0) {
						uni.showToast({
							title: '已加入意向需求',
							icon: 'success'
						});
					} else {
						uni.showToast({
							title: res.msg || '添加失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.showToast({
						title: error.data?.msg || '网络错误',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			//去掉html标签
			removeHtmlTag(content) {
				return content.replace(/<\/?[^>]*>/g, '');
			},
			// 添加到通讯录
			addToContacts() {
				if (!this.canViewContact || !this.data.person || !this.data.mobile) {
					uni.showToast({
						title: '联系信息不完整',
						icon: 'none'
					});
					return;
				}
				
				uni.showModal({
					title: '添加联系人',
					content: `确定要将 ${this.data.person}(${this.data.mobile}) 添加到通讯录吗？`,
					success: (res) => {
						if (res.confirm) {
							// TODO: 实现添加到通讯录的功能
							// 可以调用设备通讯录API或者添加到应用内通讯录
							uni.showToast({
								title: '通讯录功能开发中',
								icon: 'none'
							});
							
							// 示例：添加到设备通讯录（需要权限）
							// uni.addPhoneContact({
							//     firstName: this.data.person,
							//     mobilePhoneNumber: this.data.mobile,
							//     organization: this.data.company_name || '',
							//     success: () => {
							//         uni.showToast({
							//             title: '添加成功',
							//             icon: 'success'
							//         });
							//     },
							//     fail: (err) => {
							//         uni.showToast({
							//             title: '添加失败',
							//             icon: 'none'
							//         });
							//     }
							// });
						}
					}
				});
			},
		},

	}
</script>

<style lang="scss" scoped>
	.content{min-height: 100vh;}
	.cu-chat .cu-item>.main .content {
		display: block;
		width: 100%;

		padding: 0;
	}

	.cu-chat .cu-item>.main .content::before {
		display: none;

	}

	.cu-chat .cu-item>.main .content::after {
		display: none;

	}

	.cu-chat .cu-item .date {
		height: 40px;
		left: 0;
		bottom: 0;
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 15rpx;

		button {
			margin-left: auto;
			margin-right: 10rpx;
		}
	}

	.cu-chat .cu-item>.main {
		max-width: 100% !important;
		min-width: 100% !important;
	}

	.cu-chat .cu-item>.cu-avatar {
		width: 35px !important;
		height: 35px !important;
		border-radius: 50%;
	}

	.task {
		width: 100vw;
		display: flex;
		flex-flow: column;

		.cu-chat {
			.cu-item {
				margin: 20rpx 20rpx 0 20rpx;
				padding: 30rpx 30rpx 70rpx 30rpx;
				border-radius: 3px;
				background-color: #FFFFFF;

				.main {
					margin: 0;

					.content {
						background-color: #FFFFFF;

						.university {
							width: 100%;
							text-align: right;
							padding: 0 15rpx;
						}

						.item-header {
							width: 100%;
							display: flex;
							justify-content: flex-start;
							align-items: center;

							.item-price {
								margin-left: auto;
							}

							.item-title { 
								display: -webkit-box;
								/*设置为弹性盒子*/
								-webkit-line-clamp: 1;
								line-clamp: 1;
								/*最多显示1行*/
								overflow: hidden;
								/*超出隐藏*/
								text-overflow: ellipsis;
								/*超出显示为省略号*/
								-webkit-box-orient: vertical;
								word-break: break-all;
								/*强制英文单词自动换行 max-width: 350rpx;*/
								
							}
						}
						.item-tag{
							padding: 4rpx;
							display: -webkit-box;
						}
						.item-desc {
							 
							display: -webkit-box;
							/*设置为弹性盒子*/
							-webkit-line-clamp: 3;
							line-clamp: 3;
							/*最多显示3行*/
							overflow: hidden;
							/*超出隐藏*/
							text-overflow: ellipsis;
							/*超出显示为省略号*/
							-webkit-box-orient: vertical;
							word-break: break-all;
							/*强制英文单词自动换行*/
							max-width: 600rpx;
						}
					}
				}
			}

		}

	}

	.tower-swiper .tower-item {
		transform: scale(calc(0.5 + var(--index) / 10));
		margin-left: calc(var(--left) * 100upx - 150upx);
		z-index: var(--index);
	}
	.listsize{
		font-size: 40; border:1upx #ccc solid
	}
	 .cu-bar.fixed{ box-shadow: none;}
	.screen-swiper{ min-height: 600upx;}
	
	/* 权限提示样式 */
	.text-center {
		text-align: center;
	}
	
	.permission-tip {
		background: #f8f9fa;
		border-radius: 16rpx;
		margin: 20rpx;
		
		.lock-icon {
			margin-bottom: 20rpx;
			
			.cuIcon-lock {
				font-size: 80rpx;
				display: block;
			}
		}
		
		.tip-title {
			font-size: 30rpx;
			color: #333;
			font-weight: 600;
			margin-bottom: 16rpx;
		}
		
		.tip-desc {
			font-size: 26rpx;
			color: #666;
			line-height: 1.5;
			margin-bottom: 20rpx;
		}
	}
	
	/* 底部菜单样式 */
	.foot {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 999;
		box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.1);
		
		.action {
			flex: 1;
			text-align: center;
			padding: 16rpx 0;
			
			view {
				font-size: 24rpx;
				line-height: 1.2;
			}
			
			.cuIcon-home,
			.cuIcon-favor,
			.cuIcon-phone,
			.cuIcon-chat,
			.cuIcon-group {
				font-size: 40rpx;
				margin-bottom: 8rpx;
				display: block;
			}
			
			&:active {
				background-color: #f0f0f0;
			}
		}
	}
	
	/* 图片圆角样式 */
	.bg-img {
		border-radius: 16rpx;
		overflow: hidden;
		
		image {
			border-radius: 16rpx;
		}
	}
	
</style>