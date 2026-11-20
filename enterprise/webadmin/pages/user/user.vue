<template>
	<view class="content">
		<!-- 检索-->
		<div class="handle-box">
			<el-input v-model="filter.mobile" clearable placeholder="账号" class="handle-input mr5"></el-input>
		    <el-input v-model="filter.nickname" clearable placeholder="昵称" class="handle-input mr5"></el-input>
		    <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
		    <el-button icon="el-icon-refresh" @click="filter = {}">重置</el-button>
		</div>
		<!-- 列表 -->
		<el-table v-if="loaded" :data="list" height="calc(100% - 120px)" @sort-change="changeTableSort">
			<el-table-column prop="_id" label="编号" :show-overflow-tooltip="true"  width="90"></el-table-column>
			<el-table-column prop="branch.name" label="所属平台"  width="90"></el-table-column> 
			<el-table-column prop="image" label="头像" width="70" align="center">
				 <el-image slot-scope="scope" :preview-src-list="[scope.row.avatar]" :src="scope.row.avatar || '/static/admin/icon/default-avatar.png'" style="width: 40px;height: 40px;border-radius: 100px;" mode="aspectFill"></el-image>
			</el-table-column>
			<el-table-column prop="username" label="账号" width="240"></el-table-column>
			<el-table-column prop="nickname" label="昵称">
				<template slot-scope="scope">
					<el-link type="primary">{{scope.row.nickname}}</el-link> 
				</template>
			</el-table-column>
			<!--
			<el-table-column label="性别">
				<span slot-scope="scope">{{ scope.row.gender == 1 ? '男' : scope.row.gender == 2 ? '女' : '' }}</span>
			</el-table-column>
			 -->
			<el-table-column  :show-overflow-tooltip="true" label="注册时间">
				<span slot-scope="scope">{{ scope.row.register_date | date('Y-m-d H:i') }}</span>
			</el-table-column>
			<el-table-column  :show-overflow-tooltip="true" label="最后登录">
				<span slot-scope="scope">{{ scope.row.last_login_date | date('Y-m-d H:i') }}</span>
			</el-table-column> 
			<el-table-column label="账户余额">
				<span slot-scope="scope">{{ scope.row.balance | price }}</span>
			</el-table-column>
			<el-table-column label="积分余额">
				<span slot-scope="scope">{{ scope.row.score || 0 }}</span>
			</el-table-column>
			<el-table-column prop="orderCount" label="下单次数"></el-table-column>
			<el-table-column sortable="consumption" label="消费总额">
				<template slot-scope="scope">
					<el-link @click="navTo('money-log',{username:scope.row.username})" type="primary">资金记录</el-link>
				</template>
				 
			</el-table-column>
			<!--<el-table-column prop="finishOrderCount" label="成交次数"></el-table-column>
			<el-table-column sortable="consumption" label="消费总额">
				<span slot-scope="scope">{{ scope.row.consumption | price }}</span>
			</el-table-column>
			
			<el-table-column sortable="commission" label="分销佣金">
				<span slot-scope="scope">{{ scope.row.commission | price }}</span>
			</el-table-column>
			<el-table-column sortable="thdyj_price" label="提货点佣金">
				<span slot-scope="scope">{{ scope.row.thdyj_price | price }}</span>
			</el-table-column>-->
			<el-table-column label="操作" width="180" align="center">
				<template slot-scope="scope">
					<!-- 2封禁 -->
					<el-button v-if="scope.row.status === 1" type="warning" icon="el-icon-circle-plus-outline" @click="changeStatus(scope.row)">解封</el-button>
					<el-button v-else type="danger" icon="el-icon-remove-outline" @click="changeStatus(scope.row)">封禁</el-button>
					<el-button type="primary" icon="el-icon-edit" @click="recharge(scope.row)">充值</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!-- 分页 -->
		<div v-if="loaded" class="pagination">
			<el-pagination background @current-change="pagination" layout="total,prev,pager,next,jumper" :current-page="page" :page-size="pageLimit" :total="totalSize">
			</el-pagination>
		</div>
		
		<!-- 充值面板 -->
		<recharge ref="recharge" @refreshData="loadList"></recharge>
	</view>
</template>

<script>
	import recharge from './components/recharge.vue'
	export default {
		components: {
			recharge
		},
		data() {
			return {
				filter: {},
				orderBy: {},
				list: [],
				pageLimit: 20,
			}
		},
		created() {
			this.loadList();
		},
		methods: {
			navTo(name, params={}){
				this.$router.push({
					name,
					params
				});
			},
			/* 获取用户列表 */
			async loadList() {
				const {page, pageLimit, filter} = this;
				const sendData = {
					offset: (page-1)*pageLimit,
					limit: pageLimit,
					mobile: filter.mobile,
					nickname: filter.nickname,
					orderBy: this.orderBy || {}
				}
				const res = await this.$request('user', 'getList', sendData);
				const list = res.data;
				list.forEach(item=> {
					item.orderCount = item.order.length;
					item.finishOrderCount = item.order.filter(v=> v.status===3 || v.status===4).length;
					item.branch=item.branch.length>0?item.branch[0]:{}
				})
				this.totalSize = res.affectedDocs;
				this.list = list;
				this.loaded = true;
			},
			//封禁、解封
			changeStatus(item){
				const tip = item.status===2?'解封':'封禁';
				this.$confirm(`确定要${tip}用户${item.username}吗`, `用户${tip}`, {
				    confirmButtonText: '确定',
				    type: 'warning'
				}).then(async ()=>{
				    const res = await this.$request('user', 'changeStatus', {
				    	uid: item._id,
						status: item.status == 1 ? 0 : 1
				    });
				    if (res.status === 1) {
				    	this.$message.success(`已${tip}用户`);
						this.loadList();
				    }else{
				        this.$message.error(res.msg || `${tip}失败`);
				    }
				})
			},
			//充值
			recharge(item){
				this.$refs.recharge.formData = {
					uid: item._id
				}
				this.$refs.recharge.formVisible = true;
			},
			// 排序
			changeTableSort(e){
			    this.orderBy =
			        e.order === 'ascending' ? {[e.column.sortable]: 1} :
			        e.order === 'descending' ? {[e.column.sortable]: -1} :
			        {add_time: -1};
			    this.page = 1;
			    this.loadList();
			},
			//搜索
			search(){
				this.page = 1;
				this.loadList()
			},
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
	::v-deep .el-image .el-icon-circle-close{font-size: 40px;color:#fff;}
</style>
