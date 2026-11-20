<template>
	<div class="content">
		<div class="handle-box">
		    <el-button
		        type="primary"
		        icon="el-icon-circle-plus-outline"
		        class="mr20"
		        @click="$refs.formDialog.formVisible = true"
		    >添加分类</el-button>
		</div>
		
		<!-- 列表 -->
		<el-table 
			v-if="loaded" 
			:data="cateList" 
			height="calc(100% - 60px)"
			:tree-props="{children: 'children', hasChildren: 'hasChildren'}"
			row-key="_id"
		>
			<el-table-column label="分类名称" width="200">
				<span class="title" :class="{bold:!scope.row.pid}" slot-scope="scope">{{ scope.row.name }}</span>
			</el-table-column>
			
			<el-table-column prop="icon" label="分类图标">
				<img class="cate-pic" :class="{small: scope.row.id}" slot-scope="scope" :src="scope.row.icon" v-if="scope.row.icon" />
			</el-table-column>
			<el-table-column label="ID" prop="_id" width="170">				
			</el-table-column>
			<el-table-column prop="sort" label="排序" width="150" align="center"></el-table-column>
			<el-table-column prop="status" label="是否启用" width="190" align="center">
				<el-switch slot-scope="scope" v-model="scope.row.status" :width="36" :active-value="1" :inactive-value="0" @change="stateChange(scope.$index,scope.row)"></el-switch>
			</el-table-column>
			<el-table-column label="操作" width="200" align="center">
				<template slot-scope="scope">
					<el-button type="text" icon="el-icon-edit" @click="edit(scope.row)">编辑</el-button>
					<el-button type="text" icon="el-icon-delete" @click.native.prevent="toDelete(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<!-- 新增 编辑分类 -->
		<category-manage ref="formDialog" :cateList="cateList" @refreshData="loadCateList"></category-manage>
	</div>
</template>

<script>
	import categoryManage from './category-manage'
		export default {
		components: {
			categoryManage
		},
		data() {
			return {
				cateList: [],
				loaded: false
			}
		},
		created() {
			this.loadCateList();
		},
		methods: {
			/* 获取产品分类 */
			async loadCateList(){
				try {
					const response = await this.$request('category', 'list');
					if (response && response.data) {
						// 处理分类数据，构建树形结构
						const list = this.buildCategoryTree(response.data);
						this.cateList = list;
						this.loaded = true;
					} else {
						this.$message.error('获取分类列表失败');
					}
				} catch (error) {
					console.error('获取分类列表错误:', error);
					this.$message.error('获取分类列表失败');
				}
			},
			
			/* 构建分类树形结构 */
			buildCategoryTree(categories) {
				// 创建映射表
				const categoryMap = new Map();
				const tree = [];
				
				// 初始化所有分类，添加children数组
				categories.forEach(category => {
					categoryMap.set(category.id, {
						...category,
						_id: category.id, // 兼容前端使用的_id字段
						children: []
					});
				});
				
				// 构建树结构
				categories.forEach(category => {
					const node = categoryMap.get(category.id);
					if (category.pid === 0) {
						// 根节点
						tree.push(node);
					} else {
						// 子节点
						const parent = categoryMap.get(category.pid);
						if (parent) {
							parent.children.push(node);
						}
					}
				});
				
				// 处理子分类的显示名称
				tree.forEach(parent => {
					if (parent.children && parent.children.length > 0) {
						parent.children.forEach((child, index) => {
							child.renderName = index === parent.children.length - 1 ? 
								'└─ ' + child.name : '├─ ' + child.name;
						});
					}
				});
				
				return tree;
			},
			/* 编辑 */
			edit(item){
				// 确保数据格式正确，将_id映射为id
				const editData = {
					...item,
					id: item._id || item.id
				};
				this.$refs.formDialog.formData = editData;
				this.$refs.formDialog.formVisible = true;
			},
			/* 删除 */
			async toDelete(index, item){
				if(item.children && item.children.length > 0){
					this.$message.error(`${item.name}包含子分类，无法删除`);
					return;
				}
				this.$confirm(`是否要删除分类：${item.name}`, '删除分类', {
				    confirmButtonText: '删除',
				    type: 'warning'
				}).then(async ()=>{
					try {
						const response = await this.$request('category', 'del', {
							id: item._id
						});
						if(response && response.code === 1){
							this.$message.success('分类删除成功');
							this.loadCateList();
						}else{
							this.$message.error(response.message || '删除失败');
						}
					} catch (error) {
						console.error('删除分类错误:', error);
						this.$message.error('删除失败');
					}
				}).catch(()=>{})
			},
			/* 状态修改 */
			async stateChange(index, row) {
				try {
					const response = await this.$request('category', 'setStatus', {
						id: row._id,
						status: row.status
					});
					if (response && response.code === 1) {
						this.$message.success('状态更新成功');
					} else {
						this.$message.error(response.message || '操作失败');
						// 恢复原状态
						row.status = row.status == 1 ? 0 : 1;
					}
				} catch (error) {
					console.error('状态修改错误:', error);
					this.$message.error('操作失败');
					// 恢复原状态
					row.status = row.status == 1 ? 0 : 1;
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	.handle-box {
	    display: flex;
	    align-items: center;
	    padding: 12px 10px;
	    background-color: #fff;
	    border-bottom: 1px solid #f0f0f0;
	    margin-bottom: 5px;
	}
	.title{
		font-size: 14px;
		color: #606266;
		
		&.bold{
			color: #303133;
			font-weight: bold;
		}
	}
	.cate-pic{
		display: block; 
		width: 132px;
		height: 50px; 
		border-radius: 4px;
		
		&.small{
			width: 50px;
			height: 50px; 
		}
	}
</style>
