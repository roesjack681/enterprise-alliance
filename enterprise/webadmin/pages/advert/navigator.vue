<template>
	<div class="content">
		<div class="handle-box">
		    <el-button
		        type="primary"
		        icon="el-icon-circle-plus-outline"
		        class="mr20"
		        @click="$refs.formDialog.formVisible = true"
		    >添加导航</el-button>
			<template v-if="userInfo.role_id=='abd27dd45f3109c80059c9a5199f4192'">
			<el-select v-model="filter.uid"   @change="search" filterable clearable default-first-option placeholder="所有平台" class="handle-select mr5">
			    <el-option v-for="item in users" :key="item._id"  :label="item.realname" :value="item._id"></el-option>
			</el-select> 
			<el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
			<el-button icon="el-icon-refresh" class="mr5" @click="resetFilter">重置</el-button>
			</template>
			<view class="fill"></view>
		</div>
		<!-- 列表 -->
		<el-table v-if="loaded" :data="list" height="calc(100% - 60px)" @sort-change="changeTableSort">
			<el-table-column prop="_id" label="编号" :show-overflow-tooltip="true"></el-table-column>
			<el-table-column v-if="userInfo.role_id=='abd27dd45f3109c80059c9a5199f4192'" prop="uid" label="所属平台" >
				<template slot-scope="scope">
					{{scope.row.opname||'管理员'}}
				</template>
			</el-table-column>
			<el-table-column prop="image" label="导航图标" width="120" align="center">
				<image slot-scope="scope" :src="scope.row.image" style="width: 60px;height: 60px;" mode="aspectFill"></image>
			</el-table-column>
			<el-table-column prop="name" label="导航名称" width="200" align="left"></el-table-column>
			<el-table-column prop="link" label="链接地址" align="left"></el-table-column>
			<el-table-column prop="sort" label="排序" width="180" align="center"></el-table-column>
			<el-table-column prop="status" label="是否启用" width="180" align="center">
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
		<navigator-manage ref="formDialog" :users="users" @refreshData="loadList"></navigator-manage>
	</div>
</template>

<script>
	import navigatorManage from './navigator-manage'
	export default {
	    components: {
	        navigatorManage
	    },
		data() {
			return {
				filter: {
					uid:'',
					type:'advert',  
				},
				users:[],
				list: []
			}
		},
		computed: {
			userInfo(){
				return this.$store.state.user.userInfo;
			}
		},
		created() {
			this.loadList();
			this.getusers();
		},
		methods: {
			async getusers() {
				const response = await this.$request('admin', 'getallList');
				this.users = response.data; 
			},
			async loadList() {
				const response = await this.$request('advert', 'getList', {
					type: 'navigator',
					uid:this.filter.uid
				});
				this.list = response.data;
				this.loaded = true;
			},
			/* 启用 | 禁用 */
			async stateChange(index, item) {
				const response = await this.$request('advert', 'setStatus', {
					id: item._id,
					status: item.status
				});
				if (response.updated !== 1) {
					this.$message.error(response.msg || '操作失败');
			        item.status = item.status == 1 ? 0 : 1;
			    }
			},
			/* 删除 */
			toDelete(index, item){
				this.$confirm(`是否要删除导航：${item.name}`, '删除提示', {
				    confirmButtonText: '删除',
				    type: 'warning'
				}).then(async ()=>{
				    const response = await this.$request('advert', 'deleteAdvert', {
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
			/* 编辑 */
			edit(item){
				this.$refs.formDialog.formData = JSON.parse(JSON.stringify(item));
				this.$refs.formDialog.formVisible = true;
			},
			//搜索
			search(){
				this.page = 1;
				this.loadList();
			},
			// 重置搜索 
			resetFilter(){
			    this.filter = {
			        cate_id: '',
			        isSales: '',
					keyword: '',
				}
			},// 获取搜索参数
			getFilterData(){
			    const filter = {};
			    for(let key in this.filter){
			        if(this.filter[key]){
			            filter[key] = this.filter[key];
			        }
			    }
			    return filter;
			}
		}
	}
</script>

<style scoped lang="scss">
	.mr5{
	    margin-right: 5px !important;
	}
	.mr20{
	    margin-right: 20px !important;
	}
	.handle-select {
	    width: 140px;
	}
	.handle-input {
	    width: 140px;
	    display: inline-block;
	}
	.pl-table {
	  ::v-deep td {
	    padding: 0px;
	  }
	  ::v-deep .cell{
	  	line-height:20px ;
	  }
	}
	.el-tag + .el-tag {
	    margin-left: 5px;
	  }
</style>
