<template>
	<div class="content">
		<div class="handle-box">
		    <el-button
		        type="primary"
		        icon="el-icon-circle-plus-outline"
		        class="mr20"
		        @click="$refs.formDialog.formVisible = true"
		    >添加子平台</el-button>
		</div>
		<!-- 列表 -->
		<el-table v-if="loaded" :data="list" height="calc(100% - 60px)" @sort-change="changeTableSort">
			<el-table-column prop="id" label="平台ID" align="left"></el-table-column>
			<el-table-column prop="name" label="平台名称" align="left"></el-table-column>
			<el-table-column prop="code" label="平台代码" align="left"></el-table-column>
			<el-table-column prop="code" label="地址(addr)" align="left">
				<template slot-scope="scope">
					<span  >{{ scope.row.address|shot }}</span>
					<el-link type="primary" @click="copyAll(scope.row.address)" icon="el-icon-copy-document"></el-link>
				</template>				
			</el-table-column>
			<el-table-column prop="code" label="私钥" align="left">
				<template slot-scope="scope">
					<span  >{{ scope.row.private_key|shot }}</span>
					<el-link type="primary" @click="copyAll(scope.row.private_key)" icon="el-icon-copy-document"></el-link>
				</template> 
			</el-table-column>
			<el-table-column prop="ploys" label="策略" align="left" width="120"></el-table-column>
			<el-table-column label="操作" width="200" align="center">
				<template slot-scope="scope">
					<el-button type="primary" icon="el-icon-edit" @click="edit(scope.row)">编辑</el-button>
					<el-button type="danger" icon="el-icon-delete" @click.native.prevent="toDelete(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		
		<!-- 新增、编辑 -->
		<mch-manage ref="formDialog" @refreshData="loadList"></mch-manage>
	</div>
</template>

<script> 
	import mchManage from './mch-manage'
	export default {
	    components: {
	        mchManage
	    },
		data() {
			return {
				list: []
			}
		},
		created() {
			this.loadList();
		},
		methods: { 
			async loadList() {
				const response = await this.$request('mch', 'list'); 
				this.list = response.data;
				this.loaded = true;
			},
			/* 删除 */
			toDelete(index, item){
				this.$confirm(`是否要删除分组：${item.name}`, '删除提示', {
				    confirmButtonText: '删除',
				    type: 'warning'
				}).then(async ()=>{
				    const response = await this.$request('mch', 'del', {
				    	id:item.id
				    });
				    if(response.code === 1){
				    	this.$message.success('删除成功');
				    	this.list.splice(index, 1);
				    }else{
				    	this.$message.error(response.msg);
				    }
				}).catch(()=>{})
			},
			/* 编辑 */
			edit(item){
				this.$refs.formDialog.formData = JSON.parse(JSON.stringify(item));
				this.$refs.formDialog.formVisible = true;
			}
		}
	}
</script>

<style scoped lang="scss">
	
</style>
