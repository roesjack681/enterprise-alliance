<template>
    <el-dialog class="dialog" :title="formTitle" :close-on-click-modal="false" :visible.sync="formVisible">
        <el-form ref="dataForm" :rules="rules" :model="formData" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">

            <el-form-item label="上级分类" prop="pid">
                <el-select v-model="formData.pid" filterable default-first-option placeholder="请选择上级分类">
                    <el-option v-for="item in renderCateList" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="分类名称" prop="name">
                <el-input v-model="formData.name" clearable maxlength="10" placeholder="请输入分类名称" />
            </el-form-item> 
			<el-form-item label="分类图标" prop="icon">
			    <image-upload v-if="formVisible" ref="thumbUpload" :files="formData.icon ? [formData.icon] : []" @onChanged="onThumbChanged"></image-upload>
			</el-form-item>
            <el-form-item label="排序" prop="sort">
				<el-input-number v-model="formData.sort" :step="1" :min="0" :max="999" step-strictly></el-input-number>
            </el-form-item>

			<el-form-item label="是否启用" prop="status">
				<el-switch 
					class="has-text"
					style="margin-left: 6px;" 
					v-model="formData.status" 
					:width="36" 
					:active-value="1" 
					:inactive-value="0"
					active-text="启用"
					inactive-text="禁用">
				</el-switch>
			</el-form-item>

            <el-form-item label="备注" prop="remark">
                <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
            </el-form-item>

        </el-form>
        <div slot="footer" class="dialog-footer" style="padding-left: 140px">
            <el-button size="medium" class="confirm-btn" @click="formVisible=false"> 取消 </el-button>
            <el-button size="medium" class="confirm-btn" type="primary" @click="submit"> 提交 </el-button>
        </div>
    </el-dialog>
</template>

<script>
    export default {
        data() {
            return {
				renderCateList: [],
                formVisible: false, //表单显示状态
                formData: {
                    id: 0,
                    name: '',
                    icon: '',
                    sort: 0,
                    pid: 0,
                    status: 1,
                    remark: ''
                }, //表单数据
                rules: {
                    name: [{required: true, message: '请输入分类名称', trigger: 'blur'}],
                    //icon: [{required: true, message: '请输入图标路径', trigger: 'blur'}],
					sort: [{required: true, message: '请输入排序值', trigger: 'blur'}],
					status: [{required: true}],
                }
            }
        },
		props: {
		    cateList: Array
		},
		computed: {
			formTitle(){
				return this.formData.id ? '编辑分类' : '添加分类';
			}
		},
        watch: {
            formVisible(state){
                if(state){
					//分类处理 - 过滤出顶级分类，排除当前编辑的分类
					const renderList = this.cateList.filter(item => !item.pid && item.id != this.formData.id);
					renderList.unshift({
						id: 0,
						name: '顶级分类'
					})
					this.renderCateList = renderList;
					
					//默认数据
					if(!this.formData.id){
						this.formData = {
                            id: 0,
                            name: '',
                            icon: '',
                            sort: 0,
                            pid: 0,
                            status: 1,
                            remark: ''
						}
					}
				}else{
					this.$refs.dataForm.resetFields();
					this.formData = {
                        id: 0,
                        name: '',
                        icon: '',
                        sort: 0,
                        pid: 0,
                        status: 1,
                        remark: ''
                    }; //清空表单
				}
            }
        },
        methods: {
			onThumbChanged(files){
				this.formData.icon = files[0];
			},
            async submit(){
                try {
                    const valid = await this.$refs.dataForm.validate();
                    if (!valid) {
                        return;
                    }

                    const data = {...this.formData};
                    
                    // 根据是否有ID判断是添加还是更新
                    const operation = data.id ? 'update' : 'add';
                    const response = await this.$request('category', operation, data); 
                    if(response && response.code === 1){
                        this.$message.success(response.message || '操作成功');
                        this.$emit('refreshData');
                        this.formVisible = false;
                    } else {
                        this.$message.error(response.message || '操作失败');
                    }
                } catch (error) {
                    console.error('提交分类错误:', error);
                    this.$message.error('操作失败');
                }
            }
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
           /* margin-top: 5vh !important; */
            margin-bottom: 5vh;
            min-width: 880px;
            max-width: 880px;
        }
    }
</style>
