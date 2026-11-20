<template>
	<div class="content">
		<!-- 检索-->
		<div class="handle-box">
		    <el-input v-model="filter.username" placeholder="用户名" class="handle-input mr5"></el-input>
			<el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
		    <el-button icon="el-icon-refresh" @click="filter = {}">重置</el-button>
		</div>
		<!-- 列表 -->
		<el-table v-if="loaded" :data="list" height="calc(100% - 120px)" @sort-change="changeTableSort">
			<el-table-column prop="image" label="提货点" width="70" align="center"> 
				<el-image slot-scope="scope"  :preview-src-list="[scope.row.pickup.logo]" :src="scope.row.pickup.logo || '/static/admin/icon/default-avatar.png'" style="width: 40px;height: 40px;border-radius: 100px;" ></el-image>
			</el-table-column>
			<el-table-column  min-width="240">
				<template slot-scope="scope">
					<h4 class="title" >{{ scope.row.pickup.title }}</h4>
					<p style="color:#409EFF;font-size:11px">{{scope.row.pickup.address}}</p>
				</template>
			</el-table-column> 
			<el-table-column prop="image" label="会员" width="70" align="center">
				 <el-image slot-scope="scope" :preview-src-list="[scope.row.userinfo.avatar]" :src="scope.row.userinfo.avatar || '/static/admin/icon/default-avatar.png'" style="width: 40px;height: 40px;border-radius: 100px;" mode="aspectFill"></el-image>
			</el-table-column>
			<el-table-column prop="userinfo.nickname"></el-table-column>
			<el-table-column prop="userinfo.username" label="用户名" ></el-table-column>			
			<el-table-column label="收款码" >
				<el-image slot-scope="scope"  :preview-src-list="[scope.row.pickup.account]" :src="scope.row.pickup.account" style="width: 40px;height: 40px;" ></el-image>
			</el-table-column>
			<el-table-column prop="remark" label="备注" width="140"></el-table-column>
			<el-table-column label="提现金额" >
				<span class="money income" v-if="scope.row.status ===1" slot-scope="scope">{{ scope.row.money | price }}</span>
				<span class="money " v-else slot-scope="scope">{{ scope.row.money | price }}</span>
			</el-table-column>
			<el-table-column prop="status_name" label="审核状态"></el-table-column>
			<el-table-column label="时间" width="150">
				<span slot-scope="scope">{{ scope.row.add_time | date('Y-m-d H:i:s') }}</span>
			</el-table-column>
			<el-table-column label="操作" width="180" align="center">
				<template v-if="scope.row.status==0" slot-scope="scope">
					<el-button type="primary" icon="el-icon-edit" @click="submit(scope.row)">通过</el-button>
					<el-button type="danger" icon="el-icon-delete" @click.native.prevent="jujue(scope.row)">拒绝</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!-- 分页 -->
		<div v-if="loaded" class="pagination">
			<el-pagination background @current-change="pagination" layout="total,prev,pager,next,jumper" :current-page="page" :page-size="pageLimit" :total="totalSize">
			</el-pagination>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				filter: {}, 
				list: []
			}
		},
		 
		created() {
			this.loadList();
		},
		methods: {
			async loadList(){
				const {page, pageLimit} = this;
				const sendData = {
					offset: (page-1)*pageLimit,
					limit: pageLimit,
					...this.filter
				}
				const res = await this.$request('tixian', 'getLogList', sendData)
				
				this.list = res.data;
				this.totalSize = res.affectedDocs;
				this.loaded = true;
				//console.log(res.data);
			},
			async submit(item){ 
				const res = await this.$request('tixian', 'qrtg', {id:item._id}); 
				this.$message.success(res.msg);
				this.loadList() 
			},
			async jujue(item){
				const res = await this.$request('tixian', 'jujue', {id:item._id}); 
				this.$message.success(res.msg);
				this.loadList() 
			},
			search(){
				this.page = 1;
				this.loadList()
			}
		}
	}
</script>

<style scoped lang="scss">
	.money{
		font-size: 15px;
		color: #ff1f2c;
		font-weight: bold;
		
		&.income{
			color: #19be6b;
		}
	}
	.mr5{
	    margin-right: 5px !important;
	}
	.mr20{
	    margin-right: 20px !important;
	}
	.handle-select {
	    width: 160px;
	}
	.handle-input {
	    width: 160px;
	    display: inline-block;
		
		&.lg{
			width: 170px;
		}
	}
	::v-deep.el-image .el-icon-circle-close{font-size: 40px;color:#fff;}
</style>
