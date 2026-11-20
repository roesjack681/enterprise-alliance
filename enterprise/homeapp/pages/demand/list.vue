<template name="home">
	<view>
		<!-- 搜索栏 -->
		<view class="search-container">
			<u-search 
				v-model="searchKeyword" 
				placeholder="搜索需求标题、内容、公司名称" 
				@search="onSearch" 
				@custom="onSearch" 
				@clear="onClearSearch" 
				height="70" 
				searchIconSize="36" 
				actionText="搜索"
				:showAction="searchKeyword.length > 0"
				bg-color="#f5f5f5"
				border-color="transparent"
			></u-search>
		</view>
	
		<!-- 需求类型选项卡 -->
		<view class="content">
			<view class="category-tabs">
				<scroll-view class="tabs-scroll" scroll-x>
					<view class="tabs-container">
						<view 
							class="tab-item" 
							v-for="(item, index) in typeList" 
							:key="index"
							:class="{ active: currentType === item.value }"
							@click="switchType(item.value)"
						>
							<text class="tab-text">{{ item.name }}</text>
						</view>
					</view>
				</scroll-view>
			</view> 
			<view class="task">
				<view class="cu-chat">
					<view class="cu-item animation-bottom-top" @click="gourl('/pages/demand/detail?id='+item.id)" :style="{'animationDelay': (index + 1)*0.1 + 's'}"
						v-for="(item,index) in list" :key="index">
						<view class="main">
							<view class="content shadow">
								<view class="item-header">
									<view class="item-title text-bold">【{{getTypeName(item.type)}}】{{item.title}}</view>
									<view v-if="item.budget_price && item.budget_price > 0" class="item-price">
										<text class="text-red">¥{{item.budget_price}}</text>
									</view>
								</view>
								<view class="item-tag">
									<view class="cu-tag text-grey radius">{{getTypeName(item.type)}}</view>
									<view class="cu-tag text-grey radius" v-if="item.budget_price && item.budget_price > 0">预算: ¥{{item.budget_price}}</view>
									
									<view class="cu-tag radius text-red" v-if="item.visibility === 2">仅经纪人可见</view>
								</view>
								<view v-if="item.images && item.images.length > 0" class="margin-top-sm grid col-4 grid-square flex-sub">
									<view class="bg-img" v-for="(item2, idx) in item.images" :key="idx"
										@tap="ViewImage(item.images,idx)" :data-url="item2">
										<image :src="item2" mode="aspectFill"></image>
									</view>
								</view>
								<view class="university">
									<view class="text-grey text-sm">{{item.company_name || ''}}</view>
								</view>
							</view>
						</view>
						<view class="date justify-between">
							<view selectable="true" class=" margin-sm  text-left">
								<text class="text-xs text-gray">发布时间:{{formatTime(item.create_time)}}</text>
							</view> 
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getDemandList } from '@/utils/api.js';
	
	export default {
		data() {
			return {
				userInfo:{},
				modalName: '',
				p: 1,
				currentType: 0, // 当前选中的需求类型，0表示全部
				limit: 20,
				list: [],
				loaded: false,
				searchKeyword: '', // 搜索关键词
				isSearching: false, // 是否处于搜索状态
				// 需求类型选项卡
				typeList: [
					{ id: 0, name: '全部', value: 0 },
					{ id: 1, name: '需求', value: 1 },
					{ id: 2, name: '求购', value: 2 },
					{ id: 3, name: '货物', value: 3 },
					{ id: 4, name: '服务', value: 4 },
					{ id: 5, name: '易货', value: 5 }
				]
			}
		},
		onShow() {
			this.userInfo = uni.getStorageSync('$userinfo') || {};
			this.currentType = uni.getStorageSync('demandType') || 0;
			this.loadList();
		},
		// #ifdef MP-WEIXIN
		onShareAppMessage(res) {
			let userInfo = uni.getStorageSync('userInfo')
			return {
				title: '企业联盟',
				path: '/pages/home/home?inviteCode=' +userInfo.inviteCode,
				imageUrl: 'https://mp-1a566ae5-a643-4f73-99dc-242564c591b3.cdn.bspapp.com/static/banner.jpg?t=1'
			}
		},
		// #endif
		onReachBottom() {
			setTimeout(() => {
				this.p++;
				this.loadList();
			}, 300);
		},
		onPullDownRefresh() {
			this.p = 1;
			this.loadList();
			setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		methods: {
			// 搜索功能
			async onSearch() {
				if (!this.searchKeyword.trim()) {
					this.onClearSearch();
					return;
				}
				
				this.p = 1;
				this.isSearching = true;
				await this.loadList();
			},
			
			// 清空搜索
			async onClearSearch() {
				this.searchKeyword = '';
				this.isSearching = false;
				this.p = 1;
				await this.loadList();
			},
			
			// 切换需求类型
			async switchType(type) {
				if (this.currentType === type) return;
				
				this.p = 1;
				this.currentType = type;
				uni.setStorageSync('demandType', type);
				await this.loadList();
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
			
			// 判断是否可以显示联系按钮
			canShowContactButton(item) {
				// 如果是"仅经纪人可见"的需求，只有经纪人才能看到联系按钮
				if (item.visibility === 2) {
					return this.userInfo.role === 10; // 经纪人角色
				}
				return true; // 公开需求，所有人都可以看到联系按钮
			},
			gourl(url) {
				uni.navigateTo({
					url: url
				})
			},
			 
			async addfavor(item) {
				// TODO: 实现收藏功能
				uni.showToast({
					title: '收藏功能开发中',
					icon: 'none'
				});
			},
			
			//加载需求列表
			async loadList() {
				if (this.loaded) return;
				
				const sendData = {
					page: this.p,
					page_size: this.limit,
					type: this.currentType === 0 ? '' : this.currentType, // 0表示全部，不传type参数
					sort_by: 'create_time',
					sort_order: 'desc'
				}
				
				// 如果有搜索关键词，添加搜索参数
				if (this.isSearching && this.searchKeyword.trim()) {
					sendData.keyword = this.searchKeyword.trim();
				}
				
				this.loaded = true;
				uni.showLoading({title:'加载中...',mask:false});
				
				try {
					const res = await getDemandList(sendData);
					
					if (res.code === 0 && res.data) {
						const dest = res.data.list || [];
						
						// 处理数据格式
						for (let i = 0; i < dest.length; i++) {
							// 处理图片数据
							if (dest[i].images) {
								try {
									dest[i].images = typeof dest[i].images === 'string' ? JSON.parse(dest[i].images) : dest[i].images;
								} catch (e) {
									dest[i].images = [];
								}
							} else {
								dest[i].images = [];
							}
							
							// 处理时间戳（如果需要转换）
							if (dest[i].create_time && typeof dest[i].create_time === 'number') {
								dest[i].create_time = dest[i].create_time;
							}
						}
						
						if (this.p === 1) {
							this.list = dest;
						} else if (dest.length > 0) {
							this.list = this.list.concat(dest);
						}
					} else {
						uni.showToast({
							title: res.msg || '加载失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.showToast({
						title: '网络错误',
						icon: 'none'
					});
				}
				
				this.loaded = false;
				uni.hideLoading();
			},

			ViewImage(imgList, index) {
				const imgs = imgList
				uni.previewImage({
					indicator: 'number',
					urls: imgs,
					current: imgs[index],
				});
			},

		},

	}
</script>

<style lang="scss" scoped>
	.content{min-height: 100vh;}
	
	/* 搜索栏样式 */
	.search-container {
		background-color: #fff;
		padding: 24rpx 32rpx;
		border-bottom: 1rpx solid #f0f0f0;
		position: sticky;
		top: 0;
		z-index: 100;
	}
	/* 分类标签样式 - 支持横向滚动 */
	.category-tabs {
		background-color: #fff;
		border-bottom: 1rpx solid #f0f0f0;
		
		.tabs-scroll {
			width: 100%;
			white-space: nowrap;
			
			.tabs-container {
				display: flex;
				padding: 0 30rpx;
				
				.tab-item {
					position: relative;
					padding: 24rpx 0;
					margin-right: 60rpx;
					flex-shrink: 0;
					white-space: nowrap;
					
					&:last-child {
						margin-right: 30rpx;
					}
					
					.tab-text {
						font-size: 30rpx;
						color: #666;
						white-space: nowrap;
					}
					
					&.active {
						.tab-text {
							color: #3D6AFF;
							font-weight: 500;
						}
						
						&::after {
							content: '';
							position: absolute;
							bottom: 0;
							left: 50%;
							transform: translateX(-50%);
							width: 40rpx;
							height: 6rpx;
							background-color: #3D6AFF;
							border-radius: 3rpx;
						}
					}
				}
			}
		}
	}
	
	.cu-list.grid.no-border>.cu-item{
		padding:0px;
	}
	.cu-chat .cu-item>.main .content {
		display: block;
		width: 100%;

		padding: 0;
	}
.avabg{
		background-color: #d9ebfd;width: 76upx;height: 76upx; padding:6upx;
		border-radius: 20upx; text-align: center;
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

						.item-tag {
							padding: 4rpx;
							display: -webkit-box;
						}

						.item-desc {

							display: -webkit-box;
							/*设置为弹性盒子*/
							-webkit-line-clamp: 3;
							line-clamp: 3;
							/*最多显示1行*/
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
	
	/* 图片圆角样式 */
	.bg-img {
		border-radius: 16rpx;
		overflow: hidden;
		
		image {
			border-radius: 16rpx;
		}
	}
</style>