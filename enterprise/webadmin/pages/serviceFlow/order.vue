<template>
  <div class="service-order-management">
    <!-- 搜索筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="企业ID">
          <el-input 
            v-model="searchForm.entity_id" 
            placeholder="请输入企业ID"
            clearable>
          </el-input>
        </el-form-item>
        <el-form-item label="服务分类">
          <el-select v-model="searchForm.service_id" placeholder="请选择服务分类" clearable>
            <el-option label="财税服务" :value="1"></el-option>
            <el-option label="人力资源" :value="2"></el-option>
            <el-option label="工商注册" :value="3"></el-option>
            <el-option label="知识产权" :value="4"></el-option>
            <el-option label="科创申报" :value="5"></el-option>
            <el-option label="数字化" :value="6"></el-option>
            <el-option label="创业运营" :value="7"></el-option>
            <el-option label="法律服务" :value="8"></el-option>
            <el-option label="资质认证" :value="9"></el-option>
            <el-option label="融资服务" :value="10"></el-option>
            <el-option label="品牌推广" :value="11"></el-option>
            <el-option label="办公设施" :value="12"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务类型">
          <el-select v-model="searchForm.service_type" placeholder="请选择服务类型" clearable>
            <el-option label="一次性服务" value="one_time"></el-option>
            <el-option label="周期性服务" value="recurring"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择订单状态" clearable>
            <el-option label="待处理" value="Pending"></el-option>
            <el-option label="进行中" value="Active"></el-option>
            <el-option label="已暂停" value="Paused"></el-option>
            <el-option label="已完成" value="Completed"></el-option>
            <el-option label="已取消" value="Cancelled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="searchForm.priority" placeholder="请选择优先级" clearable>
            <el-option label="低" value="Low"></el-option>
            <el-option label="普通" value="Normal"></el-option>
            <el-option label="高" value="High"></el-option>
            <el-option label="紧急" value="Urgent"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分配管理员">
          <el-input 
            v-model="searchForm.assigned_admin" 
            placeholder="请输入管理员ID"
            clearable>
          </el-input>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd HH:mm:ss"
            value-format="timestamp"
            @change="handleDateRangeChange">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="el-icon-search">搜索</el-button>
          <el-button @click="handleReset" icon="el-icon-refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 批量操作区域 -->
    <el-card class="batch-operations" shadow="never">
      <el-row>
        <el-col :span="18">
          <el-button 
            type="primary" 
            @click="batchAssign" 
            :disabled="selectedOrders.length === 0"
            icon="el-icon-user">
            批量分配
          </el-button>
          <el-button 
            type="warning" 
            @click="batchSetPriority" 
            :disabled="selectedOrders.length === 0"
            icon="el-icon-star-off">
            批量设置优先级
          </el-button>
          <el-button 
            type="info" 
            @click="batchUpdateStatus" 
            :disabled="selectedOrders.length === 0"
            icon="el-icon-edit">
            批量更新状态
          </el-button>
        </el-col>
        <el-col :span="6" class="text-right">
          <span>已选择 {{ selectedOrders.length }} 项</span>
        </el-col>
      </el-row>
    </el-card>

    <!-- 调试信息 -->
    <div v-if="orderList.length === 0" style="margin: 10px; padding: 20px; background: #f0f9ff; border: 1px solid #e1f5fe;">
      <h4>调试信息</h4>
      <p>订单列表长度: {{ orderList.length }}</p>
      <p>加载状态: {{ loading }}</p>
      <p>总数: {{ pagination.total }}</p>
    </div>

    <!-- 订单列表 -->
    <el-card class="table-card" shadow="never">
      <div v-if="orderList.length > 0" style="margin-bottom: 10px; color: #67c23a;">
        找到 {{ orderList.length }} 条订单数据
      </div>
      <el-table 
        :data="orderList" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="order_id" label="订单ID" width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="title" label="服务名称"  show-overflow-tooltip></el-table-column>
        <el-table-column prop="service_type" label="服务类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.service_type === 'one_time' ? 'success' : 'warning'">
              {{ scope.row.service_type === 'one_time' ? '一次性' : '周期性' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="current_step" label="当前步骤" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="priority" label="优先级" width="80">
          <template slot-scope="scope">
            <el-tag :type="getPriorityType(scope.row.priority)" v-if="scope.row.priority">
              {{ getPriorityText(scope.row.priority) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="assigned_admin" label="分配管理员" width="120">
          <template slot-scope="scope">
            {{ scope.row.assigned_admin || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template slot-scope="scope">
            ¥{{ parseFloat(scope.row.price || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="进度" width="200" class-name="progress-column">
          <template slot-scope="scope">
            <div class="progress-container">
              <div class="progress-bar-wrapper">
                <el-progress 
                  :percentage="getProgressPercentage(scope.row)" 
                  :status="getProgressStatus(scope.row)"
                  :stroke-width="8"
                  :show-text="true"
                  :text-inside="false"
                  :format="() => getProgressDisplayText(scope.row)">
                </el-progress>
              </div>
              <div class="progress-info">
                <span class="progress-steps">{{ getProgressText(scope.row) }}</span>
                <span class="current-step-days" :class="getCurrentStepDaysClass(scope.row)" v-if="getCurrentStepDaysText(scope.row)">
                  {{ getCurrentStepDaysText(scope.row) }}
                </span>
                <span class="remaining-days" :class="getRemainingDaysClass(scope.row)" v-if="getRemainingDaysText(scope.row)">
                  {{ getRemainingDaysText(scope.row) }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="150">
          <template slot-scope="scope">
            {{ formatTimestamp(scope.row.create_time*1000) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template slot-scope="scope">
            <div class="operation-buttons">
              <el-button type="text" size="small" @click="viewOrderDetail(scope.row)">详情</el-button>
              <el-button type="text" size="small" @click="advanceProcess(scope.row)">推进</el-button>
              <el-button type="text" size="small" @click="assignOrder(scope.row)">分配</el-button>
              <el-dropdown @command="handleCommand" trigger="click" class="operation-dropdown">
                <span class="el-dropdown-link">
                  更多<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="{action: 'pause', row: scope.row}">暂停</el-dropdown-item>
                  <el-dropdown-item :command="{action: 'resume', row: scope.row}">恢复</el-dropdown-item>
                  <el-dropdown-item :command="{action: 'cancel', row: scope.row}">取消</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.current_page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total">
        </el-pagination>
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog 
      title="订单详情" 
      :visible.sync="detailDialogVisible" 
      width="800px"
      class="order-detail-dialog">
      <div v-if="selectedOrder" class="order-detail-content">
        <!-- 基本信息表格 -->
        <table class="detail-table">
          <tbody>
            <tr>
              <td class="label">订单ID</td>
              <td class="value">{{ selectedOrder.order_id }}</td>
              <td class="label">服务名称</td>
              <td class="value">{{ selectedOrder.title }}</td>
            </tr>
            <tr>
              <td class="label">订单状态</td>
              <td class="value">
                <el-tag :type="getStatusType(selectedOrder.status)" size="small">
                  {{ getStatusText(selectedOrder.status) }}
                </el-tag>
              </td>
              <td class="label">优先级</td>
              <td class="value">
                <el-tag :type="getPriorityType(selectedOrder.priority)" size="small">
                  {{ getPriorityText(selectedOrder.priority) }}
                </el-tag>
              </td>
            </tr>
            <tr>
              <td class="label">服务类型</td>
              <td class="value">
                <el-tag :type="selectedOrder.service_type === 'one_time' ? 'success' : 'warning'" size="small">
                  {{ selectedOrder.service_type === 'one_time' ? '一次性' : '周期性' }}
                </el-tag>
              </td>
              <td class="label">价格</td>
              <td class="value price">¥{{ parseFloat(selectedOrder.price || 0).toFixed(2) }}</td>
            </tr>
            <tr>
              <td class="label">当前步骤</td>
              <td class="value">{{ selectedOrder.current_step || '未开始' }}</td>
              <td class="label">用户ID</td>
              <td class="value">{{ selectedOrder.user_id }}</td>
            </tr>
            <tr>
              <td class="label">企业ID</td>
              <td class="value">{{ selectedOrder.entity_id }}</td>
              <td class="label">服务ID</td>
              <td class="value">{{ selectedOrder.service_id }}</td>
            </tr>
            <tr>
              <td class="label">分配管理员</td>
              <td class="value">{{ selectedOrder.assigned_admin || '未分配' }}</td>
              <td class="label">周期月数</td>
              <td class="value">{{ selectedOrder.cycle_months || '无' }}</td>
            </tr>
            <tr>
              <td class="label">开始时间</td>
              <td class="value">{{ formatTimestamp(selectedOrder.start_date) || '未设置' }}</td>
              <td class="label">结束时间</td>
              <td class="value">{{ selectedOrder.end_date ? formatTimestamp(selectedOrder.end_date) : '未设置' }}</td>
            </tr>
            <tr>
              <td class="label">创建时间</td>
              <td class="value">{{ formatTimestamp(selectedOrder.create_time * 1000) }}</td>
              <td class="label">更新时间</td>
              <td class="value">{{ formatTimestamp(selectedOrder.update_time * 1000) }}</td>
            </tr>
          </tbody>
        </table>
        
        <!-- 备注信息 -->
        <div v-if="selectedOrder.remarks" class="remarks-section">
          <h4 class="remarks-title">订单备注</h4>
          <div class="remarks-content">{{ selectedOrder.remarks }}</div>
        </div>
        
        <div v-if="selectedOrder.admin_remarks" class="remarks-section">
          <h4 class="remarks-title">管理员备注</h4>
          <div class="remarks-content">{{ selectedOrder.admin_remarks }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- 流程推进对话框 -->
    <el-dialog title="流程推进" :visible.sync="advanceDialogVisible" width="600px">
      <el-form :model="advanceForm" label-width="100px">
        <el-form-item label="当前步骤">
          <el-input v-model="advanceForm.current_step" readonly></el-input>
        </el-form-item>
        
        <el-form-item label="下一步骤">
          <div v-if="advanceForm.is_last_step" class="next-step-info">
            <el-tag type="success">已是最后一步，完成后将结束流程</el-tag>
          </div>
          <div v-else-if="advanceForm.next_step" class="next-step-info">
            <el-input v-model="advanceForm.next_step" readonly>
              <template slot="prepend">自动获取</template>
            </el-input>
            <div v-if="advanceForm.next_step_info" class="step-details">
              <p v-if="advanceForm.next_step_info.description">
                <strong>步骤说明:</strong> {{ advanceForm.next_step_info.description }}
              </p>
              <p v-if="advanceForm.next_step_info.estimated_days">
                <strong>预计用时:</strong> {{ advanceForm.next_step_info.estimated_days }} 天
              </p>
              <p v-if="advanceForm.next_step_info.approval_required === 1">
                <el-tag type="warning" size="mini">需要审批</el-tag>
              </p>
            </div>
          </div>
          <el-input 
            v-else
            v-model="advanceForm.next_step" 
            placeholder="请输入下一步骤名称">
          </el-input>
        </el-form-item>
        
        <el-form-item label="处理备注">
          <el-input 
            type="textarea" 
            v-model="advanceForm.remarks" 
            placeholder="请输入处理备注"
            :rows="3">
          </el-input>
        </el-form-item>
        
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="advanceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAdvanceProcess">确定</el-button>
      </div>
    </el-dialog>

    <!-- 任务分配对话框 -->
    <el-dialog title="任务分配" :visible.sync="assignDialogVisible" width="500px">
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="分配管理员">
          <el-input v-model="assignForm.admin_id" placeholder="请输入管理员ID"></el-input>
        </el-form-item>
        <el-form-item label="分配备注">
          <el-input 
            type="textarea" 
            v-model="assignForm.remarks" 
            placeholder="请输入分配备注"
            :rows="3">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssignOrder">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'ServiceOrderManagement',
  data() {
    return {
      loading: false,
      orderList: [],
      selectedOrders: [],
      selectedOrder: null,
      searchForm: {
        entity_id: '',
        service_id: null,
        service_type: '',
        status: '',
        priority: '',
        assigned_admin: '',
        start_date: '',
        end_date: ''
      },
      dateRange: [],
      pagination: {
        current_page: 1,
        page_size: 10,
        total: 0
      },
      detailDialogVisible: false,
      advanceDialogVisible: false,
      assignDialogVisible: false,
      advanceForm: {
        order_id: '',
        current_step: '',
        next_step: '',
        remarks: '',
        next_step_info: null,
        is_last_step: false
      },
      assignForm: {
        order_ids: [],
        admin_id: '',
        remarks: ''
      }
    }
  },
  mounted() {
    this.loadOrderList()
  },
  methods: {
    async loadOrderList() {
      try {
        this.loading = true
        // 过滤掉空字符串参数
        const filteredSearchForm = Object.fromEntries(
          Object.entries(this.searchForm).filter(([key, value]) => value !== '' && value !== null && value !== undefined)
        )
        
        const params = {
          ...filteredSearchForm,
          current_page: this.pagination.current_page,
          page_size: this.pagination.page_size
        }
        
        const response = await this.$request('serviceFlow', 'admin-query-order-list', params)
        
        if (response && response.code === 1) {
          if (response.data && Array.isArray(response.data.list)) {
            this.orderList = response.data.list
            this.pagination.total = response.data.total || 0
          } else {
            this.orderList = []
            this.pagination.total = 0
            console.warn('数据格式错误:', response.data)
          }
        } else {
          this.orderList = []
          this.pagination.total = 0
          if (response && response.msg) {
            this.$message.error(response.msg)
          } else {
            console.warn('查询订单列表失败: API接口不存在或返回格式错误')
          }
        }
      } catch (error) {
        this.orderList = []
        this.pagination.total = 0
        console.error('加载订单列表失败:', error)
        // 不显示错误消息，避免404等网络错误影响用户体验
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.pagination.current_page = 1
      this.loadOrderList()
    },
    handleReset() {
      this.searchForm = {
        entity_id: '',
        service_id: null,
        service_type: '',
        status: '',
        priority: '',
        assigned_admin: '',
        start_date: '',
        end_date: ''
      }
      this.dateRange = []
      this.pagination.current_page = 1
      this.loadOrderList()
    },
    handleDateRangeChange(dates) {
      if (dates && dates.length === 2) {
        this.searchForm.start_date = dates[0]
        this.searchForm.end_date = dates[1]
      } else {
        this.searchForm.start_date = ''
        this.searchForm.end_date = ''
      }
    },
    handleSelectionChange(selection) {
      this.selectedOrders = selection
    },
    handleSizeChange(size) {
      this.pagination.page_size = size
      this.loadOrderList()
    },
    handleCurrentChange(page) {
      this.pagination.current_page = page
      this.loadOrderList()
    },
    async viewOrderDetail(order) {
      try {
        const response = await this.$request('serviceFlow', 'admin-order-detail', { order_id: order.order_id })
        if (response.code == 1) {
          this.selectedOrder = response.data || {}
          this.detailDialogVisible = true
        } else {
          this.$message.error(response.msg || '获取订单详情失败')
        }
      } catch (error) {
        console.error('获取订单详情失败:', error)
        this.$message.error('获取订单详情失败')
      }
    },
    async advanceProcess(order) {
      try {
        // 先获取下一步骤信息
        const response = await this.$request('serviceFlow', 'get-next-step', { order_id: order.order_id })
        
        if (response.code === 1 && response.data) {
          this.advanceForm = {
            order_id: order.order_id,
            current_step: response.data.current_step,
            next_step: response.data.next_step ? response.data.next_step.step : '',
            remarks: '',
            next_step_info: response.data.next_step,
            is_last_step: response.data.is_last_step
          }
        } else {
          // 如果获取失败，使用原来的方式
          this.advanceForm = {
            order_id: order.order_id,
            current_step: order.current_step,
            next_step: '',
            remarks: '',
            next_step_info: null,
            is_last_step: false
          }
        }
        
        this.advanceDialogVisible = true
      } catch (error) {
        console.error('获取下一步骤失败:', error)
        // 发生错误时使用原来的方式
        this.advanceForm = {
          order_id: order.order_id,
          current_step: order.current_step,
          next_step: '',
          remarks: '',
          next_step_info: null,
          is_last_step: false
        }
        this.advanceDialogVisible = true
      }
    },
    async confirmAdvanceProcess() {
      try {
        const response = await this.$request('serviceFlow', 'admin-advance-process', this.advanceForm)
        if (response.code == 1) {
          this.$message.success('流程推进成功')
          this.advanceDialogVisible = false
          this.loadOrderList()
        } else {
          this.$message.error(response.msg || '流程推进失败')
        }
      } catch (error) {
        console.error('流程推进失败:', error)
        this.$message.error('流程推进失败')
      }
    },
    assignOrder(order) {
      this.assignForm = {
        order_ids: [order.order_id],
        admin_id: '',
        remarks: ''
      }
      this.assignDialogVisible = true
    },
    async confirmAssignOrder() {
      try {
        const response = await this.$request('serviceFlow', 'assign-tasks', this.assignForm)
        if (response.code == 1) {
          this.$message.success('任务分配成功')
          this.assignDialogVisible = false
          this.loadOrderList()
        } else {
          this.$message.error(response.msg || '任务分配失败')
        }
      } catch (error) {
        console.error('任务分配失败:', error)
        this.$message.error('任务分配失败')
      }
    },
    batchAssign() {
      this.assignForm = {
        order_ids: this.selectedOrders.map(order => order.order_id),
        admin_id: '',
        remarks: ''
      }
      this.assignDialogVisible = true
    },
    batchSetPriority() {
      this.$prompt('请输入优先级 (Low/Normal/High/Urgent)', '批量设置优先级', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        this.performBatchOperation('priority', value)
      })
    },
    batchUpdateStatus() {
      this.$prompt('请输入状态 (Pending/Active/Paused/Completed/Cancelled)', '批量更新状态', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        this.performBatchOperation('status', value)
      })
    },
    async performBatchOperation(operation, value) {
      try {
        const params = {
          order_ids: this.selectedOrders.map(order => order.order_id),
          operation,
          value,
          remarks: ''
        }
        
        const response = await this.$request('serviceFlow', 'batch-operation', params)
        if (response.code == 1) {
          this.$message.success('批量操作成功')
          this.loadOrderList()
        } else {
          this.$message.error(response.msg || '批量操作失败')
        }
      } catch (error) {
        console.error('批量操作失败:', error)
        this.$message.error('批量操作失败')
      }
    },
    handleCommand(command) {
      const { action, row } = command
      switch (action) {
        case 'pause':
          this.performSingleOperation(row, 'status', 'Paused')
          break
        case 'resume':
          this.performSingleOperation(row, 'status', 'Active')
          break
        case 'cancel':
          this.performSingleOperation(row, 'status', 'Cancelled')
          break
      }
    },
    async performSingleOperation(order, operation, value) {
      try {
        const params = {
          order_ids: [order.order_id],
          operation,
          value,
          remarks: ''
        }
        
        const response = await this.$request('serviceFlow', 'batch-operation', params)
        if (response.code == 1) {
          this.$message.success('操作成功')
          this.loadOrderList()
        } else {
          this.$message.error(response.msg || '操作失败')
        }
      } catch (error) {
        console.error('操作失败:', error)
        this.$message.error('操作失败')
      }
    },
    getStatusType(status) {
      const statusMap = {
        'Pending': 'warning',
        'Active': 'success',
        'Paused': 'info',
        'Completed': '',
        'Cancelled': 'danger'
      }
      return statusMap[status] || ''
    },
    getStatusText(status) {
      const statusMap = {
        'Pending': '待处理',
        'Active': '进行中',
        'Paused': '已暂停',
        'Completed': '已完成',
        'Cancelled': '已取消'
      }
      return statusMap[status] || status
    },
    getPriorityType(priority) {
      const priorityMap = {
        'Low': 'info',
        'Normal': '',
        'High': 'warning',
        'Urgent': 'danger'
      }
      return priorityMap[priority] || ''
    },
    getPriorityText(priority) {
      const priorityMap = {
        'Low': '低',
        'Normal': '普通',
        'High': '高',
        'Urgent': '紧急'
      }
      return priorityMap[priority] || priority
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN')
    },
    // 进度相关方法
    getProgressPercentage(order) {
      if (!order.progress_info) {
        // 根据订单状态提供默认进度
        if (order.status === 'Completed') return 100
        if (order.status === 'Cancelled') return 0
        return 0
      }
      
      // 确保返回的是数字类型的百分比
      const percentage = order.progress_info.progress_percentage || 0
      return Math.min(100, Math.max(0, parseInt(percentage)))
    },
    getProgressStatus(order) {
      if (order.status === 'Completed') return 'success'
      if (order.status === 'Cancelled') return 'exception'
      
      if (!order.progress_info) return null
      
      if (order.progress_info.is_overdue) return 'exception'
      if (order.progress_info.progress_percentage > 0) return null
      
      return null
    },
    getProgressText(order) {
      if (!order.progress_info) {
        // 根据订单状态提供默认文本
        if (order.status === 'Completed') return '(1/1)'
        if (order.status === 'Cancelled') return '(0/1)'
        return '(0/1)'
      }
      
      const { current_sequence, total_steps } = order.progress_info
      return `(${current_sequence || 0}/${total_steps || 1})`
    },
    getProgressDisplayText(order) {
      if (order.status === 'Completed') return '已完成'
      if (order.status === 'Cancelled') return '已取消'
      
      if (!order.progress_info) return '0%'
      
      const { progress_percentage } = order.progress_info
      return `${progress_percentage || 0}%`
    },
    getRemainingDaysText(order) {
      if (!order.progress_info) return ''
      
      const { estimated_remaining_days, is_overdue } = order.progress_info
      
      if (order.status === 'Completed') return '已完成'
      if (order.status === 'Cancelled') return '已取消'
      if (is_overdue) return '已超期'
      if (estimated_remaining_days === 0) return '即将完成'
      
      return `剩余${estimated_remaining_days}天`
    },
    getRemainingDaysClass(order) {
      if (!order.progress_info) return ''
      
      const { estimated_remaining_days, is_overdue } = order.progress_info
      
      if (order.status === 'Completed') return 'status-completed'
      if (order.status === 'Cancelled') return 'status-cancelled'
      if (is_overdue) return 'status-overdue'
      if (estimated_remaining_days <= 2) return 'status-urgent'
      if (estimated_remaining_days <= 5) return 'status-warning'
      
      return 'status-normal'
    },
    // 当前步骤剩余天数相关方法
    getCurrentStepDaysText(order) {
      if (!order.progress_info) return ''
      
      const { current_step_remaining_days, is_overdue } = order.progress_info
      
      if (order.status === 'Completed') return ''
      if (order.status === 'Cancelled') return ''
      
      // 如果整体已超期，不显示当前步骤信息，避免重复
      if (is_overdue) return ''
      
      if (current_step_remaining_days === undefined || current_step_remaining_days === null) return ''
      if (current_step_remaining_days === 0) return '今日完成'
      
      return `当前剩余${current_step_remaining_days}天`
    },
    getCurrentStepDaysClass(order) {
      if (!order.progress_info) return ''
      
      const { current_step_remaining_days, is_overdue } = order.progress_info
      
      if (order.status === 'Completed' || order.status === 'Cancelled') return ''
      if (is_overdue) return 'current-step-overdue'
      if (current_step_remaining_days === 0) return 'current-step-urgent'
      if (current_step_remaining_days === 1) return 'current-step-warning'
      
      return 'current-step-normal'
    }
  }
}
</script>

<style scoped>
.service-order-management {
  padding: 0px;
}

.filter-card, .batch-operations, .table-card {
  margin-bottom: 10px;
}

.search-form .el-form-item {
  margin-bottom: 10px;
}

.batch-operations {
  padding: 15px 20px;
}

.text-right {
  text-align: right;
  line-height: 32px;
  color: #666;
}

.pagination-wrapper {
  text-align: right;
  margin-top: 10px;
}

.remarks-section {
  margin-top: 10px;
}

.remarks-section h4 {
  margin-bottom: 10px;
  color: #409eff;
}

.remarks-section p {
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  margin: 0;
}

.operation-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  gap: 8px;
  white-space: nowrap;
}

.operation-buttons .el-button {
  margin: 0;
  padding: 5px 10px;
  font-size: 12px;
  min-width: auto;
  height: 28px;
  line-height: 1;
}

.operation-buttons .el-button + .el-button {
  margin-left: 0;
}

.operation-dropdown {
  flex-shrink: 0;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
}

.el-dropdown-link:hover {
  color: #66b1ff;
}

/* 订单详情对话框样式 */
.order-detail-dialog .el-dialog__body {
  padding: 20px;
}

.order-detail-content {
  font-size: 14px;
}

/* 详情表格样式 */
.detail-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.detail-table td {
  padding: 12px 15px;
  border: 1px solid #ebeef5;
  vertical-align: middle;
}

.detail-table .label {
  background-color: #fafafa;
  font-weight: 500;
  color: #606266;
  width: 120px;
  text-align: right;
}

.detail-table .value {
  color: #303133;
  font-weight: 400;
}

.detail-table .value.price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

/* 备注区域样式 */
.remarks-section {
  margin-bottom: 20px;
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
}

.remarks-section:first-of-type {
  border-top: none;
  padding-top: 0;
}

.remarks-title {
  margin: 0 0 10px 0;
  color: #409eff;
  font-size: 14px;
  font-weight: 600;
}

.remarks-content {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  color: #606266;
  line-height: 1.6;
  border-left: 3px solid #409eff;
  word-break: break-word;
}

/* 流程推进对话框样式 */
.next-step-info {
  margin-bottom: 10px;
}

.step-details {
  margin-top: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
  font-size: 13px;
}

.step-details p {
  margin: 5px 0;
  color: #606266;
}

.step-details strong {
  color: #303133;
}

/* 进度显示样式 */
.progress-container {
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 6px;
}

.progress-bar-wrapper {
  width: 100%;
  min-width: 120px;
}

.progress-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  width: 100%;
  flex-wrap: wrap;
}

.progress-text {
  color: #606266;
  font-weight: 500;
}

.progress-steps {
  font-size: 10px;
  color: #909399;
  background: #f4f4f5;
  padding: 1px 4px;
  border-radius: 8px;
  border: 1px solid #d3d4d6;
  white-space: nowrap;
}

.remaining-days {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 8px;
  font-weight: 500;
  white-space: nowrap;
}

.status-completed {
  background: #f0f9ff;
  color: #67c23a;
  border: 1px solid #b3d8ff;
}

.status-cancelled {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.status-overdue {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
  animation: blink 1.5s infinite;
}

.status-urgent {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f5dab1;
}

.status-warning {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f5dab1;
}

.status-normal {
  background: #f4f4f5;
  color: #909399;
  border: 1px solid #d3d4d6;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.5; }
}

/* 当前步骤剩余天数样式 */
.current-step-days {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 8px;
  font-weight: 500;
  white-space: nowrap;
}

.current-step-overdue {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
  animation: blink 1.5s infinite;
}

.current-step-urgent {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f5dab1;
  font-weight: 600;
}

.current-step-warning {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f5dab1;
}

.current-step-normal {
  background: #f0f9ff;
  color: #409eff;
  border: 1px solid #b3d8ff;
}

/* 表格进度列样式 */
.el-table .progress-column .cell {
  padding: 10px 8px !important;
  height: auto !important;
  line-height: normal !important;
  min-height: 60px !important;
}

/* Element UI 进度条样式调整 */
.progress-bar-wrapper .el-progress {
  margin: 0 !important;
  width: 100% !important;
}

.progress-bar-wrapper .el-progress .el-progress-bar {
  padding-right: 50px !important;
}

.progress-bar-wrapper .el-progress__text {
  font-size: 11px !important;
  color: #606266 !important;
  font-weight: 500 !important;
  position: relative !important;
}
</style>