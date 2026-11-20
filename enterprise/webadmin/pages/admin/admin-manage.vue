<template>
	<el-dialog class="dialog" :title="formTitle" :close-on-click-modal="false" :visible.sync="formVisible">
		<el-form ref="dataForm" :rules="rules" :model="formData" label-position="left" label-width="100px"
			style="width: 400px; margin-left:50px;">
			<el-form-item label="分组" prop="role_id">
				<el-select v-model="formData.role_id" filterable default-first-option placeholder="请选择管理员分组">
					<el-option v-for="item in roleList" :key="item.id" :label="item.name" :value="item.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="所属商户" prop="mch_id">
				<el-select v-model="formData.mch_id" clearable filterable default-first-option
					placeholder="请选择管理员所属商户">
					<el-option v-for="item in mchList" :key="item.id" :label="item.name"
						:value="item.id"></el-option>
				</el-select>
				<div>
					<span class="tip">*仅商户管理员需要选择该项</span>
				</div>
			</el-form-item>
			<el-form-item v-if="0 && formVisible" label="头像图片" prop="image">
				<image-upload ref="imageUpload" :files="formData.image ? [formData.image] : []"
					@onChanged="onImageChanged"></image-upload>
			</el-form-item>
			<el-form-item label="用户名" prop="username">
				<el-input v-model="formData.username" clearable maxlength="30" placeholder="请输入手机号" />
			</el-form-item>
			<el-form-item label="密码" prop="password">
				<el-input v-model="formData.password" clearable maxlength="30" placeholder="请输入密码" />
			</el-form-item>
			<el-form-item label="姓名" prop="realname">
				<el-input v-model="formData.realname" clearable maxlength="30" placeholder="请输入姓名" />
			</el-form-item>
			<el-form-item label="手机号" prop="mobile">
			    <el-input v-model="formData.mobile"  clearable maxlength="30" placeholder="请输入手机号" />
			</el-form-item>
			<el-form-item label="邮箱" prop="email">
			    <el-input v-model="formData.email"  clearable  placeholder="请输入邮箱" />
			</el-form-item>
			<el-form-item label="擅长" prop="memo">
				<el-input v-model="formData.memo" type="textarea" clearable maxlength="500" placeholder="请输入个人擅长" />
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
				teams: [],
				formVisible: false, //表单显示状态
				formData: {
					image: ''
				}, //表单数据
				rules: {
					role_id: [{
						required: true,
						message: '请选择管理员分组',
						trigger: ["blur", 'change']
					}, ],
					username: [{
						required: true,
						message: '请输入用户名',
						trigger: 'blur'
					}],
					realname: [{
						required: true,
						message: '请输入姓名',
						trigger: 'blur'
					}],
					password: [{
						required: true,
						message: '请输入密码',
						trigger: 'blur'
					}],

				}
			}
		},
		props: {
			roleList: {
				type: Array,
				default () {
					return [];
				}
			},
			mchList: {
				type: Array,
				default () {
					return [];
				}
			}
		},
		computed: {
			formTitle() {
				return this.formData._id ? '修改管理员' : '添加管理员';
			}
		},
		watch: {
			formVisible(state) {
				if (state) {
					//默认数据
					if (!this.formData.id) {
						this.formData = {
							name: '',
							image: ''
						}
					}
				} else {
					this.$refs.dataForm.resetFields();
					this.formData = {}
				}
			}
		},
		methods: {

			submit() {
				this.$refs.dataForm.validate(async res => {

					if (res === false) {
						return;
					}
					const operation = this.formData.id ? 'update' : 'add';

					const {
						username,
						password,
						role_id,
						mch_id,
						realname,
						mobile,
						email,
						image,
						memo,
						id
					} = this.formData;

					if (username.length < 4) {
						this.$message.error('账号长度4位以上');
						this.formVisible = false;
						return;
					}
					if (password.length < 6) {
						this.$message.error('密码长度6位以上');
						this.formVisible = false;
						return;
					}
					//console.log(code_id);return;
					const response = await this.$request('admin', operation, {
						username,
						password,
						role_id,
						mch_id,
						realname,
						mobile,
						email,
						image,
						memo,
						id
					});
					if (response.code === 1) {
						this.$message.success('保存成功');
						this.$emit('refreshData');
						this.formVisible = false;
					} else {
						this.$message.error(response.msg);
					}
				})
			},
			onImageChanged(files) {
				this.formData.image = files.length > 0 ? files[0] : '';
				this.$refs.dataForm.validateField('image')
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* 加宽行 */
	.form-item-widen {
		width: 650px;
	}

	.dialog {

		& ::v-deep .el-dialog__body {
			padding-bottom: 10px;
		}

		& ::v-deep .el-dialog {
			margin-bottom: 5vh;
			min-width: 880px;
			max-width: 880px;
		}
	}

	.tip {
		font-size: 11px;
		color: #ff4443;
	}
</style>