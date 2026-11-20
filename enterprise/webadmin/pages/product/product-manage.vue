<template>
    <el-dialog class="dialog" :title="formTitle" :close-on-click-modal="false" :visible.sync="formVisible">
        <el-form ref="dataForm" :rules="rules" :model="formData" label-position="left" label-width="100px" style="width: 650px; margin-left:50px;">

            <el-form-item label="产品分类" prop="cate_id">
                <el-select v-model="formData.cate_id" filterable default-first-option placeholder="请选择产品分类">
                    <el-option v-for="item in cateList" :key="item._id" :disabled="!item.parent_id" :label="item.renderName" :value="item._id"></el-option>
                </el-select>
				<el-button size="small" class="confirm-btn"  style="margin-left: 10px;" @click="formVisible=false"> 取消 </el-button>
				<el-button size="small" class="confirm-btn " type="primary" @click="submit"> 保存 </el-button>
            </el-form-item>
			<el-form-item label="供货商" prop="ghs_id">
				 <el-select style="min-width:570px;" 
				    v-model="formData.ghs_id"
				    filterable remote reserve-keyword  clearable placeholder="输入供货商名称/联系人/电话/经营内容查找"
				    :remote-method="remoteMethod" :loading="loading">
				    <el-option v-for="item in suplist" :key="item._id"  :label="item.value" :value="item._id"></el-option>
				  </el-select> 
				  <p><span style="color:#ccc">如未找到请到供货商管理模块新增数据。</span></p> 
			</el-form-item> 
            <el-form-item label="产品名称" prop="title">
                <el-input v-model="formData.title" clearable maxlength="30" placeholder="请输入产品名称" />
            </el-form-item>

            <el-form-item label="产品卖点" prop="title2">
                <el-input v-model="formData.title2" clearable maxlength="50" placeholder="产品卖点或简要介绍，10-30字最佳" />
            </el-form-item>
			<el-form-item label="销售价" prop="price">
			    <el-input v-model="formData.price" clearable maxlength="8" placeholder="请输入产品销售价格" />
			</el-form-item>
			<el-form-item label="划线价" prop="market_price">
			    <el-input v-model="formData.market_price" clearable maxlength="8" placeholder="请输入产品划线价格" />
			</el-form-item>
			<el-form-item label="产品库存" prop="stock">
			    <el-input v-model="formData.stock" clearable maxlength="8" placeholder="请输入产品库存" />
			</el-form-item> 
            <el-form-item label="产品主图" prop="thumb">
                <image-upload v-if="formVisible" ref="thumbUpload" :files="formData.thumb ? [formData.thumb] : []" @onChanged="onThumbChanged"></image-upload>
            </el-form-item> 
            <el-form-item class="form-item-widen" label="产品轮播图" prop="images">
                <image-upload v-if="formVisible" ref="imagesUpload" :files="formData.images ? formData.images : []" @onChanged="onImagesChanged" :count="8"></image-upload>
            </el-form-item> 
            <el-form-item v-if="formData.selltype==1" class="form-item-widen" label="产品规格">
                <sku v-if="formVisible" ref="skuModal" :skuData="formData.skuData" :sku="formData.sku" @setStock="setStock"></sku>
            </el-form-item>
			<el-form-item label="销售类型" prop="selltype">
			    <el-radio-group v-model="formData.selltype">
			        <el-radio :label="1">正常销售</el-radio>
			        <el-radio :label="2">提前预定</el-radio>
			    </el-radio-group>
			</el-form-item>
			<template v-if="formData.selltype==2">
				<el-form-item label="定金" >
				    <el-input v-model="formData.price_dj" clearable maxlength="8" placeholder="请输入预售产品的定金" />
				</el-form-item>
				<el-form-item label="抵扣" >
				    <el-input v-model="formData.price_dk" clearable maxlength="8" placeholder="请输入定金可抵扣本产品单价的多少" />
				</el-form-item>
			</template>
            <el-form-item label="图文详情" prop="content">
                <Tinymce ref="editor" v-model="formData.content" :width="660" :height="400" />
            </el-form-item>
			
			<el-form-item label="是否上架" prop="status">
				<el-switch 
					class="has-text"
					style="margin-left: 6px;" 
					v-model="formData.is_sales" 
					:width="36" 
					:active-value="1" 
					:inactive-value="0"
					active-text="上架"
					inactive-text="下架">
				></el-switch>
			</el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" style="padding-left: 140px">
            <el-button size="medium" class="confirm-btn" @click="formVisible=false"> 取消 </el-button>
            <el-button size="medium" class="confirm-btn" type="primary" @click="submit"> 提交 </el-button>
        </div>
    </el-dialog>
</template>

<script>
    import sku from './components/sku'
	import Tinymce from '@/components/Tinymce'
    export default {
        components: {
			Tinymce,
            sku
        },
        data() {
            return {
				loading: false,
				suplist:[], 
                formVisible: false, //表单显示状态
                formData: {
					selltype:1,
					ghs_id:'',
					stock: '',
					is_sales: 1,
					thumb: '',
				}, //表单数据
                rules: {
                    cate_id: [{required: true, message: '请选择产品分类', trigger: ["blur",'change']},],
					ghs_id: [{required: true, message: '请选择供货商', trigger: 'blur'}], 
                    title: [{required: true, message: '请输入产品名称', trigger: 'blur'}],
					price: [{required: true, message: '请输入销售价格', trigger: 'blur'}],
					stock: [{required: true, message: '请输入产品库存', trigger: 'blur'}],
                    thumb: [{required: true, message: '请上传产品主图', trigger: 'blur'}],
                    images: [{required: true, message: '请上传产品轮播图', trigger: 'blur'}],
                    content: [{required: true, message: '请编辑产品图文详情', trigger: 'blur'}],
                }
            }
        },
        props: {
            cateList: {
                type: Array,
                default(){
                    return [];
                }
            }
        },
		computed: {
			formTitle(){
				return this.formData._id ? '修改产品' : '添加产品';
			}
		}, 
        watch: {
            formVisible(state){
                if(state){
					this.suplist=[{_id:this.formData.ghs_id,value:this.formData.ghs}]
					
					this.$refs.editor && this.$refs.editor.setContent(this.formData.content || '');
                }else{
					
					this.$refs.dataForm.resetFields();
					this.formData = {
						selltype:1,
						ghs_id:'',
						stock: '',
						is_sales: 1,
						thumb: ''
					};
				}
            }
        },
        methods: {
            submit(){
                this.$refs.dataForm.validate(async res=>{
                    if(res === false){
						return;
                    }
					const skuData = this.getSkuData();
					if(skuData === false){
						this.$message.error('请补全规格信息');
						return;
					}
					const {formData, cateList,suplist} = this;
					const supRow = suplist.filter(item=> item._id === formData.ghs_id)[0]; //已选二级分类
					
					const cateRow = cateList.filter(item=> item._id === formData.cate_id)[0]; //已选二级分类
					const firstCateRow = cateList.filter(item=> item._id === cateRow.parent_id)[0];//已选一级分类
					const sendData = Object.assign({}, formData, {
						skuData,
						ghs:supRow.value,
						first_cate_id: firstCateRow._id,
						first_cate_name: firstCateRow.name,
						cate_name: cateRow.name,
						price: +formData.price,
						market_price: +formData.market_price,
						stock: +formData.stock,
						price_dj: +formData.price_dj,
						price_dk: +formData.price_dk,
					})
					const operation = formData._id ? 'updateProduct' : 'addProduct';
					const response = await this.$request('product', operation, sendData);
					
					console.log(response);
					if(response.status === 1){
						this.$message.success(response.msg);
						this.$emit('refreshData');
						this.formVisible = false;
					}else{
						this.$message.error(response.msg);
					}
                })
            },
			async remoteMethod(query) {
				if (query !== '') {
				 // this.formData.ghs_id=''
				  
				  this.loading = true;
				  const res = await this.$request('supplier', 'gethotList', {keyword:query});
				  const  data =res.data;
				  for (let i = 0; i < data.length; i++) {
				  	data[i].value=data[i].title+'/'+data[i].cname+'/'+data[i].mobile
				  } 
				  this.suplist=data;				  
				  this.loading = false; 
				} else {
				  this.suplist = [];
				}
			},
			//获取sku数据
			getSkuData(){
				let {specList, attrList, skuList} = this.$refs.skuModal;
				if(skuList.length === 0){
					return {
						specList: [], 
						attrList: [], 
						skuList: [{
							name: '',
							image: '',
							price: +this.formData.price,
							stock: +this.formData.stock
						}]
					};
				}
				if(skuList.some(item=>{
					if(!item.stock){
						console.log(item.stock);
					}
					return !item.price || (!item.stock && item.stock !== 0);
				})){
					return false;
				}
				skuList.forEach(item=> {
					item.price = + item.price;
					item.market_price = + item.market_price;
					item.stock = + item.stock;
				})
				return {
					specList, attrList, skuList
				}
			},
			onThumbChanged(files){
				this.formData.thumb = files[0];
			},
			onImagesChanged(files){
				this.formData.images = files;
			},
			//设置总库存
			setStock(val){
				this.formData.stock = val;
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
            margin-bottom: 5vh;
            min-width: 880px;
            max-width: 880px;
        }
    }
</style>
