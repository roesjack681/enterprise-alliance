<template name="home">
	<view>
		
		<view class="content">
			<!-- 分类标签 -->
			<view style="background:#fff;"> 
				<u-tabs :list="tabs" @click="tabCur" :current="activeTab" lineColor="#3D6AFF" lineWidth="80rpx" lineHeight="10"
					:inactiveStyle="{fontSize: '28rpx'}" :activeStyle="{fontSize: '28rpx', color: '#3D6AFF'}"></u-tabs>
			</view>
			<view class="task">
				<!-- 空状态显示 -->
				<view v-if="list.length == 0 " class="empty-state">
					
					<view class="empty-text">暂无发布内容</view>
					
					<button class="cu-btn bg-blue round" @tap="gourl('/pages/demand/add')">
						立即发布
					</button>
				</view>
				
				<view class="demand-list" v-else>
					<view class="demand-item margin-top" :style="{'animationDelay': (index + 1)*0.1 + 's'}"
						v-for="(item,index) in list" :key="index" @tap="viewDetail(item)">
						
						<!-- 左侧图片 -->
						<view class="item-image" @tap.stop="ViewImage(item.images, 0)" v-if="item.images && item.images[0]">
							<image :src="item.images[0]" mode="aspectFill" class="image"></image>
						</view>
						<view class="item-image no-image" v-else>
							<text class="cuIcon-pic text-gray"></text>
						</view>
						
						<!-- 中间内容区域 -->
						<view class="item-content">
							<view class="content-top">
								<view class="item-title">{{item.title}}</view>
								<view class="item-tags">
									<view class="tag status-tag" :class="item.statusClass">{{item.statusText}}</view>
									<view class="tag type-tag">{{item.typeName || '未知类型'}}</view>
									<view class="tag price-tag" v-if="item.budget_price && item.budget_price > 0">¥{{item.budget_price}}</view>
									<view class="tag private-tag" v-if="item.visibility === 2">仅经纪人可见</view>
								</view>
							</view>
							<view class="content-bottom">
								<!-- <view class="company-info">
									<text class="company-name">{{item.company_name}}</text>
									
								</view> -->
								<view class="publish-time">
									<text class="time-text">{{item.create_time|date('y-m-d h:s')}}</text>
								</view>
							</view>
						</view>
						
						<!-- 右侧操作按钮 -->
						<view class="item-actions">
							<text class="more-btn cuIcon-more" @click.stop="showActionSheet(item)"></text>
							
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getMyDemandList, deleteDemand } from '@/utils/api.js';

	export default {
		data() {
			return {
				userdata: {
					flg:0, 
				},
				modalName: '',
				TabCur: 1,
				activeTab: 0, // u-tabs组件使用的当前选中索引
				p: 1,
				limit: 20,
				list: [],
				// u-tabs组件需要的格式
				tabs: [
					{ name: "需求", value: 1 }, 
					{ name: "求购", value: 2 }, 
					{ name: "货物", value: 3 }, 
					{ name: "服务", value: 4 },
					{ name: "易货", value: 5 }
				],
				tylist: [
					{ "cname": "需求", "value": 1 }, 
					{ "cname": "求购", "value": 2 }, 
					{ "cname": "货物", "value": 3 }, 
					{ "cname": "服务", "value": 4 },
					{ "cname": "易货", "value": 5 }
				],
				// 发布类型映射（与后端type字段对应）
				typeMapping: {
					1: { cname: "需求", value: 1 },
					2: { cname: "求购", value: 2 },
					3: { cname: "货物", value: 3 },
					4: { cname: "服务", value: 4 },
					5: { cname: "易货", value: 5 }
				},
				// 状态映射（1:发布中 2:已完成 3:已取消）
				statusMapping: {
				  1: { name: "发布中", class: "status-active" },
				  2: { name: "已完成", class: "status-completed" },
				  3: { name: "已取消", class: "status-cancelled" }
				}
			}
		}, 
		onLoad() {
			this.userdata = uni.getStorageSync('$userinfo');
			this.loadList();
		},
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
			// 显示操作菜单
			showActionSheet(item) {
				uni.showActionSheet({
					itemList: ['编辑', '删除'],
					itemColor: '#333',
					popover: {
						top: 100,
						left: 50
					},
					success: (res) => {
						if (res.tapIndex === 0) {
							// 编辑
							this.edit(item);
						} else if (res.tapIndex === 1) {
							// 删除
							this.del(item);
						}
					},
					fail: () => {
						// 用户取消操作
					}
				});
			},
			tabCur(e) {
				this.p = 1;
				this.activeTab = e.index; // u-tabs传递的是索引
				this.TabCur = this.tabs[e.index].value; // 获取对应的value值
				this.loadList();
			},
			gourl(url) {
				uni.navigateTo({
					url: url
				})
			},
			edit(item) {
				// 跳转到编辑页面，传递需求ID
				uni.navigateTo({
					url: `/pages/demand/add?id=${item.id}&mode=edit`
				})
			},
			viewDetail(item) {
				// 跳转到需求详情页面
				uni.navigateTo({
					url: `/pages/demand/detail?id=${item.id}`
				})
			},
			async del(item){
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这个需求吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								const result = await deleteDemand({ id: item.id });
								if (result.code === 0) {
									uni.showToast({
										title: '删除成功',
										icon: 'success'
									});
									this.p = 1;
									this.loadList();
								} else {
									uni.showToast({
										title: result.msg || '删除失败',
										icon: 'none'
									});
								}
							} catch (error) {
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								});
							}
						}
					}
				});
			}, 
			hrefChat(item) {
				uni.makePhoneCall({
					phoneNumber:item.mobile
				})
			},
			//加载我的需求列表
			async loadList() {
				if (this.loaded) return;
				
				const sendData = {
					page: this.p,
					page_size: this.limit,
					visibility:2,
					type: this.TabCur, // 根据当前选中的类型筛选
				}
				
				this.loaded = true;
				uni.showLoading({title:'加载中...',mask:false});
				
				try {
					const res = await getMyDemandList(sendData);
					
					if (res.code === 0) {
						const dest = (res.data && res.data.list) ? res.data.list : [];
						
						// 处理数据格式
						for (let i = 0; i < dest.length; i++) {
							// 处理图片数据
							if (dest[i].images) {
								try {
									dest[i].images = JSON.parse(dest[i].images);
								} catch (e) {
									dest[i].images = [];
								}
							} else {
								dest[i].images = [];
							}
							
							// 转换时间戳为毫秒
							dest[i].create_time = dest[i].create_time * 1000;
							
							// 添加类型名称用于显示
							dest[i].typeName = this.typeMapping[dest[i].type]?.cname || '未知类型';
							// 添加状态文本和样式类
							const sm = this.statusMapping[dest[i].status] || this.statusMapping[1];
							dest[i].statusText = sm.name;
							dest[i].statusClass = sm.class;
						}
						
						if (this.p == 1) {
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
						title: '加载失败',
						icon: 'none'
					});
					// 确保即使出错也能显示空状态
					if (this.p === 1) {
						this.list = [];
					}
				}
				
				this.loaded = false;
				uni.hideLoading(); 
				
				setTimeout(() => {
					this.loaded = false;
				}, 1000);
			}, 
			ViewImage(imgList,index) {
				const imgs =imgList 
				uni.previewImage({
					indicator: 'number',
					urls: imgs,
					current: imgs[index],
				});
			} 
		},

	}
</script>

<style lang="scss" scoped>
	.content{min-height: 100vh;}
	.task {
		width: 100vw;
		padding: 0 20rpx;
		box-sizing: border-box;

		.demand-list {
			.demand-item {
				display: flex;
				align-items: center;
				background: #fff;
				border-radius: 16rpx;
				margin-bottom: 20rpx;
				padding: 24rpx 24rpx 40rpx 24rpx;
				box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
				transition: all 0.3s ease;
				position: relative;
				
				&:active {
					transform: scale(0.98);
					box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
				}

				.item-image {
					width: 120rpx;
					height: 120rpx;
					border-radius: 12rpx;
					overflow: hidden;
					flex-shrink: 0;
					margin-right: 24rpx;
					background: #f5f5f5;
					display: flex;
					align-items: center;
					justify-content: center;

					.image {
						width: 100%;
						height: 100%;
					}

					&.no-image {
						background: #f8f9fa;
						border: 2rpx dashed #e9ecef;
						
						.cuIcon-pic {
							font-size: 48rpx;
							color: #adb5bd;
						}
					}
				}

				.item-content {
					flex: 1;
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					height: 120rpx;
				
					.content-top {
						.item-title {
							font-size: 28rpx;
							font-weight: 600;
							color: #333;
							line-height: 1.4;
							margin-bottom: 12rpx;
							display: -webkit-box;
							-webkit-line-clamp: 2;
							line-clamp: 2;
							-webkit-box-orient: vertical;
							overflow: hidden;
							text-overflow: ellipsis;
						}

						.item-tags {
							display: flex;
							flex-wrap: wrap;
							gap: 8rpx;
							margin-bottom: 12rpx;

							.tag {
								padding: 4rpx 12rpx;
								border-radius: 12rpx;
								font-size: 20rpx;
								border: 2rpx solid #3D6AFF;
								background: transparent;
								color: #3D6AFF;
								
								&.type-tag {
									border-color: #3D6AFF;
									color: #3D6AFF;
								}
								
								&.price-tag {
									border-color: #3D6AFF;
									color: #3D6AFF;
								}
								
								&.private-tag {
									border-color: #FF6B35;
									color: #FF6B35;
								}
							}
						}
					}

					.content-bottom {
						.company-info {
							margin-bottom: 8rpx;
							
							.company-name {
								font-size: 24rpx;
								color: #666;
								margin-right: 16rpx;
							}
							
							.contact-info {
								font-size: 24rpx;
								color: #999;
							}
						}

						.publish-time {
							.time-text {
								font-size: 24rpx;
								color: #999;
							}
						}
					}
				}

				.item-actions {
					display: flex;
					align-items: center;
					flex-shrink: 0;
					margin-left: 20rpx;

					.more-btn {
						width: 60rpx;
						height: 60rpx;
						 
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 32rpx;
						color: #999;
						
						
						
						.cuIcon-more {
							transform: rotate(90deg);
						}
					}
				}

			}
		}
	}

	/* 空状态样式 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 40rpx;
		text-align: center;
	}

	.empty-icon {
		font-size: 120rpx;
		margin-bottom: 30rpx;
	}

	.empty-text {
		font-size: 32rpx;
		color: #666;
		margin-bottom: 20rpx;
	}

	.empty-desc {
		font-size: 28rpx;
		color: #999;
		margin-bottom: 40rpx;
	}
</style>

<!-- 深度选择器样式 -->
<style>
	/* u-tabs样式调整 */
	::v-deep .u-tabs {
		background: #fff !important;
	}
	
	::v-deep .u-tabs__wrapper__nav {
		padding: 0 32rpx !important;
	}
</style>