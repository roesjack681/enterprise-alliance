<template>
    <el-dialog class="dialog" :title="formTitle" :close-on-click-modal="false" :visible.sync="formVisible">
        <el-form ref="dataForm" :rules="rules" :model="formData" label-position="left" label-width="100px" style="width: 760px; margin-left:50px;">
            <el-form-item label="名称" prop="name">
                <el-input v-model="formData.name" clearable maxlength="20" placeholder="请输入名称" />
            </el-form-item>
			<el-form-item label="代码" prop="code">
			    <el-input v-model="formData.code" clearable maxlength="20" placeholder="请输入代码" />
			</el-form-item>
			<el-form-item label="地址" prop="address">
			    <el-input v-model="formData.address" clearable placeholder="账号地址addr,公钥" />
			</el-form-item>
			<el-form-item label="私钥" prop="private_key">
			    <el-input v-model="formData.private_key" clearable placeholder="账号私钥" />
				<span style="color: red;">&为了您的资金安全，请使用热钱包账号私钥。</span>
			</el-form-item>
			<el-form-item label="执行策略">
			    <el-radio-group v-model="formData.ploys">
			      <el-radio label="4">4分钟后卖出</el-radio>
			      <el-radio label="5">5分钟后卖出</el-radio>
			      <el-radio label="6">6分钟后卖出</el-radio>
			      <el-radio label="1">手动卖出</el-radio>
				  <el-radio label="0">无策略</el-radio>
			    </el-radio-group>
			  </el-form-item>
			  <el-form-item label="买入金额">
			    <el-radio-group v-model="formData.price">
					<el-radio label="0.01">0.01sol</el-radio>
					<el-radio label="0.02">0.02sol</el-radio>
					<el-radio label="0.05">0.05sol</el-radio>
					<el-radio label="0.1">0.1sol</el-radio>
					<el-radio label="0.2">0.2sol</el-radio>
					<el-radio label="0.5">0.5sol</el-radio>
					<el-radio label="1">1sol</el-radio> 
			    </el-radio-group>
			  </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" style="padding-left: 140px">
            <el-button size="medium" class="confirm-btn" @click="formVisible=false"> 取消 </el-button>
            <el-button size="medium" class="confirm-btn" type="primary" @click="submit"> 提交 </el-button>
        </div>
    </el-dialog>
</template>

<script>
	import routers from '@/router/routers'
    export default {
        data() {
            return {
                formVisible: false, //表单显示状态
                formData: {
					ploys:'',
					price:'',
				}, //表单数据
                rules: {
                    name: [{required: true, message: '请输入名称', trigger: 'blur'}],
					code: [{required: true, message: '请输入代码', trigger: 'blur'}],
                }
            }
        },
		computed: {
			formTitle(){
				return this.formData.id ? '修改子平台' : '添加子平台';
			}
		},
        watch: {
			formVisible(state){
			    if(state){
					//默认数据
					if(!this.formData.id){
						this.formData = {
							name: '',
							code: '',
							ploys:'',
							price:'',
						}
					}
				}else{
					this.$refs.dataForm.resetFields();
					this.formData = {name: '',
							code: '',
							ploys:'',
							price:'',}
				}
			}
        },
        methods: {
            submit(){
                this.$refs.dataForm.validate(async res=>{
                    if(res === false){
						return;
                    }
					const {
						name,
						code,
						id,
						address,
						private_key
					} = this.formData;
					
					const operation = this.formData.id ? 'update' : 'add';
					const response = await this.$request('mch', operation, {
						name,
						code: + code,
						id,
						address,
						private_key
					});
					if(response.code === 1){
						this.$message.success(response.msg);
						this.$emit('refreshData');
						this.formVisible = false;
					}else{
						this.$message.error(response.msg);
					}
                })
            },
        }
    }
</script>

<style lang="scss" scoped>
    /* 加宽行 */
    .form-item-widen{
        width: 650px;
    }
    .dialog{

        & ::v-deep .el-dialog__body{
            padding-bottom: 10px;
        }
        & ::v-deep .el-dialog{
            margin-bottom: 5vh;
            min-width: 880px;
            max-width: 880px;
        }
    }
</style>
