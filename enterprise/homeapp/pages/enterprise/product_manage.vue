<template>
	<view class="container">
		<!-- 产品列表 -->
		<view class="product-list">
			<view class="product-item" v-for="(item, index) in productList" :key="item.id">
				<!-- 产品图片 -->
				<view class="product-image">
					<image :src="item.thumb || '/static/images/default.jpg'" mode="aspectFill"></image>
				</view>

				<!-- 产品信息 -->
				<view class="product-info">
					<view class="product-header">
						<text class="product-name">{{ item.name }}</text>
						<u-icon name="more-dot-fill" color="#999" size="32" @click="showMore(item, index)"></u-icon>
					</view>

					<view class="product-details">
						<text class="product-category">{{ item.features }}</text>
					</view>

					<view class="product-footer">
						<text class="product-price">¥{{ item.price }}</text>

					</view>
				</view>
			</view>
		</view>
		<view class="floating-add-btn" @click="addProduct">
			<u-icon name="plus" color="#fff" size="48"></u-icon>
		</view>
	</view>
</template>

<script>
import { getProductList, deleteProduct } from '@/utils/api.js'
export default {
	data() {
		return {
			userInfo: {},
			productList: [],
			page: 1,
			pageSize: 20,
			total: 0,
			loading: false
		}
	},
	onLoad() {
		this.userInfo = uni.getStorageSync('$userinfo')
		
	},
	onShow() {
		this.fetchProductList();
	}, 
	methods: {
		async fetchProductList() {
			this.loading = true;
			try {
				const res = await getProductList({ page: this.page, page_size: this.pageSize, enterprise_id: this.userInfo.id });
				if (res && res.code === 0 && res.data && res.data.data) {
					this.productList = res.data.data;
					this.total = res.data.total;
				} else {
					this.productList = [];
				}
			} catch (e) {
				this.productList = [];
			} finally {
				this.loading = false;
			}
		},
		addProduct() {
			uni.navigateTo({
				url: '/pages/enterprise/product_edit'
			})
		},
		showMore(item, index) {
			uni.showActionSheet({
				itemList: ['编辑', '分享', '删除'],
				success: (res) => {
					switch (res.tapIndex) {
						case 0:
							this.editProduct(item)
							break
						case 1:
							this.shareProduct(item)
							break
						case 2:
							this.deleteProduct(item, index)
							break
					}
				}
			})
		},
		editProduct(item) {
			uni.navigateTo({
				url: `/pages/enterprise/product_edit?id=${item.id}`
			})
		},
		shareProduct(item) {
			uni.showToast({
				title: '分享功能开发中',
				icon: 'none'
			})
		},
		deleteProduct(item, index) {
			uni.showModal({
				title: '确认删除',
				content: `确定要删除"${item.name}"吗？`,
				success: async (res) => {
					if (res.confirm) {
						const res = await deleteProduct({ id: item.id });
						if (res && res.code === 0) {
							this.productList.splice(index, 1)
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							})
						} else {
							uni.showToast({
								title: '删除失败',
								icon: 'none'
							})
						}

					}
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

/* 产品列表 */
.product-list {
	padding: 30rpx;
}

.product-item {
	background-color: #fff;
	border-radius: 24rpx;
	margin-bottom: 20rpx;
	padding: 30rpx;
	display: flex;
	gap: 24rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.product-image {
	width: 120rpx;
	height: 120rpx;
	border-radius: 16rpx;
	overflow: hidden;
	flex-shrink: 0;
}

.product-image image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.product-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.product-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 12rpx;
}

.product-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	line-height: 1.4;
	flex: 1;
}

.product-details {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	margin-bottom: 16rpx;
}

.product-sku,
.product-category {
	font-size: 24rpx;
	color: #999;
}

.product-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.product-price {
	font-size: 36rpx;
	font-weight: 600;
	color: #3D6AFF;
}

.product-stock {
	font-size: 24rpx;
	color: #999;
}

/* 右下角浮动添加按钮 */
.floating-add-btn {
	position: fixed;
	bottom: 60rpx;
	right: 60rpx;
	width: 120rpx;
	height: 120rpx;
	background: #3D6AFF;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(61, 106, 255, 0.3);
	z-index: 100;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-add-btn:active {
	transform: scale(0.95);
	box-shadow: 0 4rpx 16rpx rgba(61, 106, 255, 0.4);
}

/* 深度选择器示例 */
::v-deep .u-icon {
	transition: all 0.3s ease;
}

::v-deep .floating-add-btn:active .u-icon {
	transform: rotate(45deg);
}
</style>