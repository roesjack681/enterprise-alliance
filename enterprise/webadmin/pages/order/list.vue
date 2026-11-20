<template>
	<view class="content">
		<!-- 检索-->
		<div class="handle-box">
			<el-input v-model="filter.order_number" placeholder="订单号" class="handle-input lg mr5"></el-input>
		    <el-input v-model="filter.username" placeholder="用户名/用户ID" class="handle-input mr5"></el-input>
			<el-select v-model="filter.status" @change="search" filterable clearable default-first-option placeholder="订单状态" class="handle-select mr5">
			    <el-option label="全部状态" :value="0"></el-option>
			    <el-option v-for="item in statusList" :key="item.status" :label="item.name" :value="item.status"></el-option>
			</el-select>
		    <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
		    <el-button style="margin-top: 0;margin-left: 5px;" icon="el-icon-refresh" @click="resetFilter">重置</el-button>
			<div class="fill">
				</div>
			
			<el-button style="margin: 0 0 0 16px;" type="primary" @click="exportExcel">导出订单</el-button>
		</div>
		<!-- 列表 -->
		<el-table  ref="multipleTable" v-if="loaded" :data="list" height="calc(100% - 120px)" :row-key="row => { return row._id }" @selection-change="handleSelectionChange" @sort-change="changeTableSort">
			<el-table-column  type="selection" :reserve-selection="true" 	align="center"></el-table-column>
			<el-table-column prop="order_number" label="订单号" width="200">
				<div slot-scope="scope" class="column">
					<span>{{ scope.row.order_number}}</span>
					<span>{{ scope.row.add_time*1000|date('Y-m-d H:i:s') }}</span>
				</div>
			</el-table-column>
			<el-table-column label="业务信息" min-width="300">
				<template slot-scope="scope">
					<div class="g-cell column">
						<span class="title">{{ scope.row.business_title }}</span>
						<div class="bot">
							<span class="attr">业务类型：{{ scope.row.business_type }}</span>
							<span class="attr">业务ID：{{ scope.row.business_id || scope.row.entity_id }}</span>
						</div>
					</div>
				</template>
			</el-table-column>
			
			
			<el-table-column prop="user.username" label="用户信息" width="130">
				<div slot-scope="scope" class="column">
					<span>用户ID: {{ scope.row.entity_id }}</span>
					<span>用户名: {{ scope.row.user.username || '-' }}</span>
				</div>
			</el-table-column>
			<el-table-column label="原价" align="center" width="100">
				<div slot-scope="scope">
					<span>{{ scope.row.original_price | price }}</span>
				</div>
			</el-table-column>
			<el-table-column label="优惠金额" width="100">
				<div slot-scope="scope">
					<span>{{ scope.row.discount_price | price }}</span>
				</div>
			</el-table-column>
			<el-table-column label="实付金额" width="100">
				<div slot-scope="scope">
					<span class="pay-price">{{ scope.row.actual_price | price }}</span>
				</div>
			</el-table-column>
			<el-table-column label="支付信息" width="130">
				<div slot-scope="scope" class="column">
					<span>{{ scope.row.pay_status === 1 ? '已支付' : '未支付' }}</span>
					<span>{{ getPaymentMethodText(scope.row.payment_method) }}</span>
				</div>
			</el-table-column>
			<el-table-column label="订单状态" width="130">
				<span class="status-text" :class="'status-text-' + scope.row.status" slot-scope="scope">{{ scope.row.status_text }}</span>
			</el-table-column>
			
			<el-table-column fixed="right" label="操作" width="280" align="center" >
				<template slot-scope="scope">
					<el-button type="primary" class="mr5" plain icon="el-icon-document-remove" @click="showDetail(scope.row)">详情</el-button>
					<el-button type="success" class="mr5" v-if="scope.row.status===1 && scope.row.pay_status===0" @click="confirmPayment(scope.row)">确认收款</el-button>
					<el-button type="info" class="mr5" v-if="scope.row.status===2 && scope.row.business_status===0" @click="confirmProcess(scope.row)">确认处理</el-button>
					<el-button type="warning" class="mr5" v-if="scope.row.status===2" @click="processRefund(scope.row)">退款</el-button>
					<el-button type="danger" class="mr5" v-if="scope.row.status===1" @click="cancelOrder(scope.row)">取消</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!-- 分页 -->
		<div v-if="loaded" class="pagination">
			<el-pagination background @current-change="pagination" layout="total,prev,pager,next,jumper" :current-page="page" :page-size="pageLimit" :total="totalSize">
			</el-pagination>
		</div>
		
		<!-- 订单详情 -->
		<detail ref="detail"></detail>
	</view>
</template>

<script>
	import XLSX from 'xlsx'
	import detail from './components/detail.vue'
	import mixin from '../../common/mixin/mixin.js'
	export default {
		mixins: [mixin],
		components: {
			detail
		},
		data() {
			return {
			filter: {
				order_number:'',
				username:'',
				status:0
			},
				orderlist:[],
				statusList: [
					{status: 1, name: '待支付'},
					{status: 2, name: '已支付'},
					{status: 3, name: '已完成'},
					{status: 4, name: '已取消'},
					{status: 5, name: '已退款'}
				],
				list: [], // 订单列表数据
			}
		},
		created() {
			if(this.$route.params.status){
				this.filter.status = this.$route.params.status;
			}
			this.loadList();
		},
		methods: {
			/* 获取订单列表 */
			async loadList() {
				const {page, pageLimit} = this;
				const sendData = {
					offset: (page-1)*pageLimit,
					limit: pageLimit
				}
				
				// 只添加非空参数到请求中
				if (this.filter.status && this.filter.status !== 0) {
					sendData.status = this.filter.status;
				}
				if (this.filter.order_number && this.filter.order_number.trim() !== '') {
					sendData.order_number = this.filter.order_number.trim();
				}
				if (this.filter.username && this.filter.username.trim() !== '') {
					sendData.username = this.filter.username.trim();
				}
				
				const response = await this.$request('order', 'getList', sendData);
				// 修复数据结构：response.data 包含 {list, total, affectedDocs} 对象
				this.list = response.data.list || [];
				this.totalSize = response.data.affectedDocs || response.data.total || 0;
				this.loaded = true;
				//console.log(response);
			},
			//导出订单
			async exportExcel() {
				const filterData = {};
				
				// 只添加非空参数到请求中，与loadList保持一致
				if (this.filter.status && this.filter.status !== 0) {
					filterData.status = this.filter.status;
				}
				if (this.filter.order_number && this.filter.order_number.trim() !== '') {
					filterData.order_number = this.filter.order_number.trim();
				}
				if (this.filter.username && this.filter.username.trim() !== '') {
					filterData.username = this.filter.username.trim();
				}
				
				const res = await this.$request('order', 'exportOrderExcel', filterData);
				console.log(res);
				if (res.status === 1) {
					window.open(res.url);
				} else {
					this.$message.error(res.msg || '导出失败');
				}
			},
			//搜索
			search(){
				this.page = 1;
				this.loadList()
			},
			//重置筛选
			resetFilter(){
			this.filter = {
				order_number:'',
				username:'',
				status:0
			};
				this.page = 1;
				this.loadList();
			},
			//确认收款
			confirmPayment(item){
				this.$confirm('确认收到用户付款？', '确认收款', {
					 confirmButtonText: '确认收款',
				    type: 'warning'
				}).then(async ()=>{
				    const response = await this.$request('order', 'confirmPayment', {
				    	order_no: item.order_no,
						payment_method: 'manual',
						payment_order_no: 'MANUAL_' + Date.now(),
						actual_price: item.actual_price
				    });
				    if (response.code == 1) {
				    	this.$message.success('确认收款成功');
				        this.loadList()
				    }else{
				        this.$message.error(response.msg || '操作失败');
				    }
				})
			},
			//确认处理
			confirmProcess(item){
				this.$confirm('确认处理该订单？', '确认处理', {
					 confirmButtonText: '确认处理',
				    type: 'info'
				}).then(async ()=>{
				    const response = await this.$request('order', 'confirmProcess', {
				    	order_no: item.order_no,
						operator_id: 1
				    });
				    if (response.code == 1) {
				    	this.$message.success('确认处理成功');
				        this.loadList()
				    }else{
				        this.$message.error(response.msg || '操作失败');
				    }
				})
			},
			//处理退款
			processRefund(item){
				this.$prompt('请输入退款原因', '处理退款', {
					confirmButtonText: '确定退款',
					cancelButtonText: '取消',
					inputPattern: /.+/,
					inputErrorMessage: '退款原因不能为空'
				}).then(async ({ value }) => {
				    const response = await this.$request('order', 'processRefund', {
				    	order_no: item.order_no,
						refund_amount: item.actual_price,
						refund_reason: value,
						operator_id: 1
				    });
				    if (response.code == 1) {
				    	this.$message.success('退款处理成功');
				        this.loadList()
				    }else{
				        this.$message.error(response.msg || '退款处理失败');
				    }
				})
			},
			//取消订单
			cancelOrder(item){
				this.$prompt('请输入取消原因', '取消订单', {
					confirmButtonText: '确定取消',
					cancelButtonText: '取消',
					inputPattern: /.+/,
					inputErrorMessage: '取消原因不能为空'
				}).then(async ({ value }) => {
				    const response = await this.$request('order', 'cancelOrder', {
				    	order_no: item.order_no,
						reason: value,
						operator_id: 1
				    });
				    if (response.code == 1) {
				    	this.$message.success('订单取消成功');
				        this.loadList()
				    }else{
				        this.$message.error(response.msg || '取消失败');
				    }
				})
			},
			handleSelectionChange(val) { 
				this.orderlist = val;
				//console.log(this.orderlist);
			},
			//查看详情
			showDetail(item){
				this.$refs.detail.open(item);
			},
			//获取支付方式文本
			getPaymentMethodText(method) {
				const methodMap = {
					'wechat': '微信支付',
					'alipay': '支付宝',
					'bank_transfer': '银行转账',
					'manual': '线下支付',
					'cash': '现金支付',
					'pos': 'POS机',
					'online': '在线支付'
				};
				return methodMap[method] || (method ? method : '-');
			}
		}
	}
</script>

<style scoped lang="scss">
	::v-deep {
		.el-button--primary.is-plain{
			background: #fff;
			
			&:hover{
				color: #409EFF;
			}
		}
		.el-button+.el-button{
			margin: 6px 0 0 0;
		}
	}
	.mr5{
	    margin-right: 5px !important;
	}
	.mr20{
	    margin-right: 20px !important;
	}
	.handle-select {
	    width: 140px;
	}
	.num{color:#ff0000;font-weight: bold;}
	.handle-input {
	    width: 140px;
	    display: inline-block;
		
		&.lg{
			width: 170px;
		}
	}
	.status-text{
		font-size: 15px;
		color: #409EFF;
		font-weight: bold;
		
		&-1{
			color: #ff0000 // 待支付
		}
		&-2{
			color: #409EFF // 已支付
		}
		&-3{
			color: #67c23a; // 已完成
		}
		&-4{
			color: #999; // 已取消
		}
		&-5{
			color: #E6A23C; // 已退款
		}
	}
	
	.pay-price{
		font-size: 16px;
		font-weight: bold;
		color: #E6A23C;
	}
	.g-cell{
		padding: 10px 0 10px 5px;
		
		&:last-child{
			margin-bottom: 0;
		}
		.pic{
			flex-shrink: 0;
			width: 50px;
			height: 50px;
			margin-right: 10px;
		}
		.title{
			font-size: 14px;
			color: #333;
		}
		.bot{
			font-size: 12px;
			color: #999;
		}
		.attr{
			margin-right: 10px;
		}
	}
	.more-btn{
		width: 60px;
		margin-left: 1px;
		color: #409EFF;
	}
</style>
