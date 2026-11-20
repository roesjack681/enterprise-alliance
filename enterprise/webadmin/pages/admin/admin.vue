<template>
	<div class="content">
		<div class="handle-box">
		    <el-button
		        type="primary"
		        icon="el-icon-circle-plus-outline"
		        class="mr20"
		        @click="$refs.formDialog.formVisible = true"
		    >添加管理员</el-button>
		</div>
		<!-- 列表 -->
		<el-table use-virtual v-if="loaded" :data="list" height="calc(100% - 60px)" @sort-change="changeTableSort">
			<el-table-column prop="image" label="头像">
				<el-avatar fit="fill"  :size="50"   :src="scope.row.image" slot-scope="scope" >
					<img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
				</el-avatar> 
			</el-table-column>
			<el-table-column prop="username" label="账号" align="left"></el-table-column>
			<el-table-column prop="realname" label="姓名" align="left"></el-table-column>
			<el-table-column prop="mobile" label="手机号" align="left"></el-table-column>
				
			<el-table-column prop="roles[0].name" label="分组" align="left">
				<span slot-scope="scope">{{ scope.row.role_id|getName(roleList) }}</span>
			</el-table-column>
			<el-table-column prop="mch[0].name" label="所属商户" align="left">
				<span slot-scope="scope">{{ scope.row.mch_id|getName(mchList) }}</span>
			</el-table-column>
			<el-table-column label="添加时间">
				<span slot-scope="scope">{{ scope.row.create_time | date('Y-m-d H:i') }}</span>
			</el-table-column>
			<!-- <el-table-column label="最后登录">
				<span slot-scope="scope">{{ scope.row.last_login_date | date('Y-m-d H:i') }}</span>
			</el-table-column>
			<el-table-column prop="last_login_ip" label="最后登录ip" align="left"></el-table-column>
			 -->
			<el-table-column prop="status" label="状态" align="center">
				<el-switch slot-scope="scope" v-model="scope.row.status" :width="36" :active-value="1" :inactive-value="0" @change="setStatus(scope.$index,scope.row)"></el-switch>
			</el-table-column>
			<el-table-column label="操作" width="200" align="center">
				<template slot-scope="scope">
					<el-button  type="text" icon="el-icon-edit" @click="edit(scope.row)">编辑</el-button>
					<el-button type="text" icon="el-icon-delete" @click.native.prevent="toDelete(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		
		<!-- 新增、编辑 -->
		<admin-manage ref="formDialog" :roleList="roleList" :mchList="mchList" @refreshData="loadList"></admin-manage>
	</div>
</template>

<script>
	import adminManage from './admin-manage'
	export default {
	    components: {
	       adminManage
	    },
		data() {
			return {
				roleList: [],
				mchList: [],
				list: []
			}
		},
		created() {
			this.loadList();
			this.loadRoleList();
			this.loadmchList();
		},
		methods: {
			async loadList() {
				const response = await this.$request('admin', 'list'); 
				this.list = response.data;
				this.loaded = true;
			},
			/* 获取分组 */
			async loadRoleList(){
				const res = await this.$request('roles', 'list');
				this.roleList = res.data;
			},
			/* 获取部门 */
			async loadmchList(){
				const res = await this.$request('mch', 'list');
				this.mchList = res.data;
			},
			/* 删除 */
			toDelete(index, item){
				this.$confirm(`是否要删除管理员：${item.username}`, '删除提示', {
				    confirmButtonText: '删除',
				    type: 'warning'
				}).then(async ()=>{
				    const response = await this.$request('admin', 'del', {
				    	id: item._id
				    });
				    if(response.status === 1){
				    	this.$message.success('删除成功');
				    	this.list.splice(index, 1);
				    }else{
				    	this.$message.error(response.msg);
				    }
				}).catch(()=>{})
			},
			// 是否禁用
			async setStatus(index, item) {
				const sendData = {
					id: item.id,
					status: +item.status
				}
				 
				const response = await this.$request('admin', 'setStatus', sendData);
				if (response.code !== 1) {
					this.$message.error(response.msg || '操作失败');
					item.status = item.status == 1 ? 0 : 1;
			    }
				this.loadList()
			},			
			/* 编辑 */
			edit(item){ 
				// if(item.username === 'admin'){
				// 	this.$message.error('不能编辑超级管理员');
				// 	return;
				// }
				this.$refs.formDialog.formData = JSON.parse(JSON.stringify(item));
				this.$refs.formDialog.formVisible = true;
			}
		}
	}
</script>

<style lang="scss" scoped>
	   .el-avatar ::v-deep img{width: 100%;}
</style>
