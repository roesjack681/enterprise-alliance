<template>
	<div class="content">
		<!-- 检索-->
		<div class="handle-box">
		    <el-input v-model="filter.username" clearable placeholder="用户名" class="handle-input mr5"></el-input>
			<el-select v-model="filter.payType" filterable clearable placeholder="支付方式" class="handle-select mr5">
			    <el-option v-for="item in payTypeList" :key="item.type" :label="item.name" :value="item.type"></el-option>
			</el-select>
			<el-select v-model="filter.type" filterable clearable placeholder="类型" class="handle-select mr5">
			    <el-option v-for="item in typeList" :key="item.type" :label="item.name" :value="item.type"></el-option>
			</el-select>
		    <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
		    <el-button icon="el-icon-refresh" @click="filter = {}">重置</el-button>
		</div>
		<!-- 列表 -->
		<el-table v-if="loaded" :data="list" height="calc(100% - 120px)" @sort-change="changeTableSort">
			<el-table-column prop="_id" label="编号" :show-overflow-tooltip="true"  width="90"></el-table-column>
			<el-table-column prop="branch.name" label="所属平台"  width="90"></el-table-column>
			<el-table-column prop="image" label="会员" width="70" align="center">
				<image slot-scope="scope" :src="scope.row.user.avatar || '/static/admin/icon/default-avatar.png'" style="width: 40px;height: 40px;border-radius: 100px;" mode="aspectFill"></image>
			</el-table-column>
			<el-table-column prop="user.nickname" width="160"></el-table-column>
			<el-table-column prop="user.username" label="用户名" width="240"></el-table-column>
			<el-table-column label="类型" width="200">
				<span slot-scope="scope">{{ scope.row.type | moneyLogType }}</span>
			</el-table-column>
			<el-table-column label="支付方式" width="200">
				<span slot-scope="scope">{{ scope.row.pay_type | paytype }}</span>
			</el-table-column>
			<el-table-column prop="title" label="备注"></el-table-column>
			<el-table-column label="资金变动" width="140">
				<span class="money" v-if="scope.row.money < 0" slot-scope="scope">{{ scope.row.money | price }}</span>
				<span class="money income" v-else slot-scope="scope">+{{ scope.row.money | price }}</span>
			</el-table-column>
			<el-table-column label="时间" width="170">
				<span slot-scope="scope">{{ scope.row.add_time | date('Y-m-d H:i:s') }}</span>
			</el-table-column>
			<el-table-column label="操作" width="100" align="center">
				<template slot-scope="scope"> 
					<el-button type="danger" icon="el-icon-delete" @click.native.prevent="toDelete(scope.$index, scope.row)">删除</el-button>
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
				filter: {username:''},
				payTypeList: [
					{type: 'balance', name: '余额'},
					{type: 'wxpay', name: '微信支付'},
					{type: 'alipay', name: '支付宝'},
					{type: 'system', name: '系统'}
				],
				typeList: [
					{type: 'race', name: '支付方案'},
					{type: 'team', name: '大神包月'},
					{type: 'pay_order', name: '支付订单'},
					{type: 'refund_order', name: '订单退款'},
					{type: 'recharge', name: '充值'},
					{type: 'tixian', name: '提现'},
					{type: 'commission', name: '分销佣金'},
					{type: 'thdyj_commission', name: '提货点佣金'},
				],
				list: []
			}
		},
		filters: {
			moneyLogType(type){
				return {
					race: '支付方案',
					team:'大神包月',
					pay_order: '支付订单',
					refund_order: '订单退款',
					recharge: '充值',
					tixian: '提现',
					commission: '分销佣金',
					thdyj_commission: '提货点佣金'
				}[type]
			},
			paytype(type){
				return {
					balance: '余额',
					wxpay: '微信支付',
					alipay: '支付宝',
					system: '系统',
					admin:'后台充值'
				}[type]
			},
		},
		created() {
			if(this.$route.params.username){
				this.filter.username = this.$route.params.username;
			}
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
				const res = await this.$request('money', 'getLogList', sendData)
				
				this.list = res.data;
				this.totalSize = res.affectedDocs;
				this.loaded = true;
				console.log(res.data);
			},
			/* 删除 */
			toDelete(index, item){
				this.$confirm(`是否要删除：${item.remark}`, '删除提示', {
				    confirmButtonText: '删除',
				    type: 'warning'
				}).then(async ()=>{
				    const response = await this.$request('money', 'delete', {
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
</style>
