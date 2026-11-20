<template>
	<div class="content">
		<div class="handle-box">
		    <el-button
		        type="primary"
		        icon="el-icon-circle-plus-outline"
		        class="mr20"
		        @click="$refs.formDialog.formVisible = true"
		    >添加文章</el-button>
		</div>
	<!-- 列表 -->
	<el-table v-if="loaded" :data="list" @sort-change="changeTableSort">
		<el-table-column label="" width="20"></el-table-column>
		<el-table-column prop="name" label="标题" align="left"></el-table-column>
		<el-table-column prop="cate_name" label="分类" align="left" width="120"></el-table-column>
		<el-table-column label="创建时间" align="center" width="160">
			<template slot-scope="scope">
				{{ formatTime(scope.row.create_time) }}
			</template>
		</el-table-column>
		<el-table-column prop="status" label="是否启用" width="120" align="center">
			<el-switch slot-scope="scope" v-model="scope.row.status" :width="36" :active-value="1" :inactive-value="0" @change="stateChange(scope.$index,scope.row)"></el-switch>
		</el-table-column>
		<el-table-column label="操作" width="200" align="center">
			<template slot-scope="scope">
				<el-button type="primary" icon="el-icon-edit" @click="edit(scope.row)">编辑</el-button>
				<el-button type="danger" icon="el-icon-delete" @click.native.prevent="toDelete(scope.$index, scope.row)">删除</el-button>
			</template>
		</el-table-column>
	</el-table>
		
		<!-- 新增、编辑 -->
		<article-manage ref="formDialog" @refreshData="loadList"></article-manage>
	</div>
</template>

<script>
	import articleManage from './article-manage'
	export default {
	    components: {
	        articleManage
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
				const response = await this.$request('article', 'getList');
				this.list = response.data;
				this.loaded = true;
			},
		/* 启用 | 禁用 */
		async stateChange(index, item) {
			const response = await this.$request('article', 'setStatus', {
				id: item.id,
				status: item.status
			});
			if (response.code !== 1) {
				this.$message.error(response.msg || '操作失败');
		        item.status = item.status == 1 ? 0 : 1;
		    }
		},
		/* 删除 */
		toDelete(index, item){
			this.$confirm(`是否要删除文章：${item.name}`, '删除提示', {
			    confirmButtonText: '删除',
			    type: 'warning'
			}).then(async ()=>{
			    const response = await this.$request('article', 'deleteArticle', {
			    	id: item.id
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
		},
		/* 格式化时间 */
		formatTime(timestamp){
			if(!timestamp) return '-';
			const date = new Date(timestamp * 1000);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const hour = String(date.getHours()).padStart(2, '0');
			const minute = String(date.getMinutes()).padStart(2, '0');
			return `${year}-${month}-${day} ${hour}:${minute}`;
		}
	}
}
</script>

<style scoped lang="scss">
	
</style>
