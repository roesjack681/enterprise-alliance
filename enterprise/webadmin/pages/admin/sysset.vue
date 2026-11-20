<template>
	<div class="content" style="background-color: white; padding-top: 30px;">
	 <div style="padding:30px;line-height: 30px;">
		<h1>系统设置,请登录独立子平台设置</h1> 
	 </div>
	 <el-form ref="dataForm" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;"> 
		<el-divider  content-position="left">微信配置项</el-divider>
	  	<el-form-item label="APPID" prop="appid">
	 	    <el-input v-model="formData.appid"  clearable maxlength="30" placeholder="公众号APPID" /> 
	 	</el-form-item>
	 	<el-form-item label="secret" prop="secret">
	 	    <el-input v-model="formData.secret"  clearable maxlength="30" placeholder="公众号secret" /> 
	 	</el-form-item>
		 <el-form-item label="mchId" prop="mchId">
		     <el-input v-model="formData.mchId"  clearable maxlength="30" placeholder="微信支付mchId" /> 
		 </el-form-item>
		 <el-form-item label="key" prop="key">
		     <el-input v-model="formData.key"  clearable maxlength="30" placeholder="微信支付key" /> 
		 </el-form-item>
		 <el-divider  content-position="left">其他配置</el-divider>
		 <el-form-item label="uni_appid" prop="uni_appid">
		     <el-input v-model="formData.uni_appid"  clearable  placeholder="前端appid" /> 
		 </el-form-item>
		 <el-form-item label="客户端地址" prop="website">
		     <el-input v-model="formData.website"  clearable  placeholder="客户端地址,如http://www.baidu.com/" /> 
		 </el-form-item>
		 <el-form-item label="统计场次" prop="nearnum">
		     <el-input v-model="formData.nearnum"  clearable type="number" placeholder="统计" /> 
		 </el-form-item>
		 <el-form-item label="备用参数" prop="param">
		     <el-input v-model="formData.param"  clearable maxlength="30" placeholder="参数" /> 
		 </el-form-item>
	 </el-form>
	 <div slot="footer" class="dialog-footer" style="padding-left: 140px"> 
	     <el-button size="medium" class="confirm-btn" type="primary" @click="submit"> 保存 </el-button>
	 </div>
	 </div>
</template>

<script>
	 
	export default { 
		data() {
			return { 
				formData:{
					nearnum:30
				}
			}
		},
		created() {
			this.loadList();
			 
		},
		computed: { 
			userInfo(){
				return this.$store.state.user.userInfo;
			}
		}, 
		methods: {
			async loadList() {
				try {
					// 获取微信支付配置(ID=1)和其他配置(ID=2)
					const response = await this.$request('admin', 'getSysSet', { ids: [1, 2] });
					if(response.data && response.data.length > 0) {
						// 找到微信支付配置和其他配置
						const wechatConfig = response.data.find(item => item.id === 1);
						const otherConfig = response.data.find(item => item.id === 2);
						
						// 解析微信支付配置
						let wechatData = {};
						if(wechatConfig && wechatConfig.json) {
							wechatData = typeof wechatConfig.json === 'string' 
								? JSON.parse(wechatConfig.json) 
								: wechatConfig.json;
						}
						
						// 解析其他配置
						let otherData = {};
						if(otherConfig && otherConfig.json) {
							otherData = typeof otherConfig.json === 'string' 
								? JSON.parse(otherConfig.json) 
								: otherConfig.json;
						}
						
						// 合并配置数据到formData
						this.formData = {
							// 微信支付配置
							appid: wechatData.appid || '',
							secret: wechatData.secret || '',
							mchId: wechatData.mchId || '',
							key: wechatData.key || '',
							// 其他配置
							uni_appid: otherData.uni_appid || '',
							website: otherData.website || '',
							nearnum: otherData.nearnum || 30,
							param: otherData.param || ''
						};
					}
				} catch (error) {
					// 静默处理错误，使用默认配置
				}
			}, 
			/* 编辑 */
			async submit(){
				try {
					// 分别保存微信支付配置(ID=1)和其他配置(ID=2)
					const wechatResponse = await this.$request('admin', 'updateSysSet', { 
						id: 1,
						title: '微信支付配置',
						json: JSON.stringify({
							appid: this.formData.appid,
							secret: this.formData.secret,
							mchId: this.formData.mchId,
							key: this.formData.key
						}),
						status: 1
					});
					
					const otherResponse = await this.$request('admin', 'updateSysSet', { 
						id: 2,
						title: '其他配置',
						json: JSON.stringify({
							uni_appid: this.formData.uni_appid,
							website: this.formData.website,
							nearnum: this.formData.nearnum,
							param: this.formData.param
						}),
						status: 1
					});
					
					if(wechatResponse.code == 1 && otherResponse.code ==1){
						this.$message.success('保存成功');					
					}else{
						this.$message.error('保存失败');
					}
					this.loadList();
				} catch (error) {
					this.$message.error('保存失败');
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	   .el-avatar ::v-deep img{width: 100%;}
</style>
