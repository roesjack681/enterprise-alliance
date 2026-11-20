<template>
	<div class="content" style="background-color: white; padding-top: 30px;">
		<!-- 选项卡 -->
		<el-tabs v-model="activeTab" @tab-click="handleTabClick">
			<el-tab-pane label="轮播图设置" name="banner">
				<el-form ref="bannerForm" label-position="left" label-width="120px" style="width: 800px; padding: 0 40px;">
					
					<el-form-item label="轮播图片" prop="banner_image">
						<image-upload :files="formData.banner.image ? [formData.banner.image] : []" :count="1" @onChanged="onBannerImageChange"></image-upload>
						<div class="form-tip">建议尺寸：750x360px</div>
					</el-form-item>
					<el-form-item label="标题" prop="banner_title">
						<el-input v-model="formData.banner.title" clearable placeholder="请输入轮播图标题" />
					</el-form-item>
					<el-form-item label="副标题" prop="banner_subtitle">
						<el-input v-model="formData.banner.subtitle" clearable placeholder="请输入轮播图副标题" />
					</el-form-item>
					<el-form-item label="链接地址" prop="banner_link">
						<el-input v-model="formData.banner.link" clearable placeholder="请输入跳转链接" />
					</el-form-item>
					<el-form-item label="是否启用" prop="banner_status">
						<el-switch v-model="formData.banner.status" :active-value="1" :inactive-value="0"></el-switch>
					</el-form-item>
				</el-form>
			</el-tab-pane>
			
			<el-tab-pane label="首页活动配置" name="activity">
				<el-form ref="activityForm" label-position="left" label-width="120px" style="width: 800px; padding: 0 40px;">
				
					<el-form-item label="活动图片" prop="activity_image">
						<image-upload :files="formData.activity.image ? [formData.activity.image] : []" :count="1" @onChanged="onActivityImageChange"></image-upload>
						<div class="form-tip">建议尺寸：160x160px</div>
					</el-form-item>
					<el-form-item label="活动标题" prop="activity_title">
						<el-input v-model="formData.activity.title" clearable placeholder="请输入活动标题" />
					</el-form-item>
					<el-form-item label="活动副标题" prop="activity_subtitle">
						<el-input v-model="formData.activity.subtitle" clearable placeholder="请输入活动副标题" />
					</el-form-item>
					<el-form-item label="活动描述" prop="activity_description">
						<el-input 
							v-model="formData.activity.description" 
							type="textarea" 
							:rows="3"
							clearable 
							placeholder="请输入活动描述"
						></el-input>
					</el-form-item>
					<el-form-item label="活动价格" prop="activity_price">
						<el-input v-model="formData.activity.price" clearable placeholder="如：￥5999起" />
					</el-form-item>
					<el-form-item label="按钮文字" prop="activity_button">
						<el-input v-model="formData.activity.button_text" clearable placeholder="如：限时抢购" />
					</el-form-item>
					<el-form-item label="链接地址" prop="activity_link">
						<el-input v-model="formData.activity.link" clearable placeholder="请输入跳转链接" />
					</el-form-item>
					<el-form-item label="是否启用" prop="activity_status">
						<el-switch v-model="formData.activity.status" :active-value="1" :inactive-value="0"></el-switch>
					</el-form-item>
				</el-form>
			</el-tab-pane>
		</el-tabs>
		
		<div slot="footer" class="dialog-footer" style="padding-left: 170px; margin-top: 30px"> 
			<el-button size="medium" class="confirm-btn" type="primary" @click="submit">保存配置</el-button>
		</div>
	</div>
</template>

<script>
	import imageUpload from '../../components/image-upload/image-upload'
	
	export default {
		components: {
			imageUpload
		},
		data() {
			return {
				activeTab: 'banner',
				formData: {
					banner: {
						image: '',
						title: '',
						subtitle: '',
						link: '',
						status: 1
					},
					activity: {
						image: '',
						title: '',
						subtitle: '',
						description: '',
						price: '',
						button_text: '限时抢购',
						link: '',
						status: 1
					}
				}
			}
		},
		created() {
			this.loadHomeSet();
		},
		computed: { 
			userInfo(){
				return this.$store.state.user.userInfo;
			}
		},
		methods: {
			/* 切换选项卡 */
			handleTabClick(tab) {
				this.activeTab = tab.name;
			},
			
			/* 轮播图图片变化 */
			onBannerImageChange(files) {
				this.formData.banner.image = files.length > 0 ? files[0] : '';
			},
			
			/* 活动图片变化 */
			onActivityImageChange(files) {
				this.formData.activity.image = files.length > 0 ? files[0] : '';
			},
			
			/* 获取首页配置 */
			async loadHomeSet() {
				try {
					// 获取轮播图配置(ID=3)和首页活动配置(ID=4)
					const response = await this.$request('admin', 'getSysSet', { ids: [3, 4] }); 
					if(response.data && response.data.length > 0) {
						// 找到轮播图配置和活动配置
						const bannerConfig = response.data.find(item => item.id === 3);
						const activityConfig = response.data.find(item => item.id === 4);
						
						// 解析轮播图配置
						let bannerData = {};
						if(bannerConfig && bannerConfig.json) {
							bannerData = typeof bannerConfig.json === 'string' 
								? JSON.parse(bannerConfig.json) 
								: bannerConfig.json;
						}
						
						// 解析活动配置
						let activityData = {};
						if(activityConfig && activityConfig.json) {
							activityData = typeof activityConfig.json === 'string' 
								? JSON.parse(activityConfig.json) 
								: activityConfig.json;
						}
						
						// 合并配置数据到formData
						this.formData = {
							banner: {
								image: bannerData.image || '',
								title: bannerData.title || '',
								subtitle: bannerData.subtitle || '',
								link: bannerData.link || '',
								status: bannerData.status || 1
							},
							activity: {
								image: activityData.image || '',
								title: activityData.title || '',
								subtitle: activityData.subtitle || '',
								description: activityData.description || '',
								price: activityData.price || '',
								button_text: activityData.button_text || '限时抢购',
								link: activityData.link || '',
								status: activityData.status || 1
							}
						};
					}
				} catch (error) {
					// 静默处理错误，使用默认配置
				}
			},
			
			/* 保存配置 */
			async submit(){
				try {
					// 分别保存轮播图配置(ID=3)和首页活动配置(ID=4)
					const bannerResponse = await this.$request('admin', 'updateSysSet', { 
						id: 3,
						title: '轮播图配置',
						json: JSON.stringify(this.formData.banner),
						status: 1
					});
					
					const activityResponse = await this.$request('admin', 'updateSysSet', { 
						id: 4,
						title: '首页活动配置',
						json: JSON.stringify(this.formData.activity),
						status: 1
					});
					console.log(bannerResponse, activityResponse);
					if(bannerResponse.code == 1 && activityResponse.code == 1){
						this.$message.success('保存成功');					
					}else{
						this.$message.error('保存失败');
					}
				} catch (error) {
					this.$message.error('保存失败');
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.el-tabs {
		background: #fff;
		padding: 20px;
		margin: -20px;
	}
	
	::v-deep .el-tabs__header {
		margin-bottom: 20px;
		padding-left: 20px;
	}
	
	::v-deep .el-tabs__nav-wrap {
		padding-left: 20px;
	}
	
	::v-deep .el-tabs__content {
		height: auto;
		overflow: visible;
	}
	
	.form-tip {
		font-size: 12px;
		color: #999;
		margin-top: 5px;
		line-height: 1.2;
	}
	
	.el-form-item {
		margin-bottom: 25px;
	}
	
	::v-deep .el-avatar img{
		width: 100%;
	}
</style>