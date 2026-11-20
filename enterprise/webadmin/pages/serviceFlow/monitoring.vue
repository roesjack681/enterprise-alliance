<template>
  <div class="process-monitoring">
    <!-- 监控概览 -->
    <el-row :gutter="20" class="monitoring-overview">
      <el-col :span="6">
        <el-card class="overview-card active-processes" shadow="never">
          <div class="card-content">
            <div class="icon">
              <i class="el-icon-loading"></i>
            </div>
            <div class="info">
              <h3>{{ overview.active_processes }}</h3>
              <p>活跃流程</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card overdue-tasks" shadow="never">
          <div class="card-content">
            <div class="icon">
              <i class="el-icon-warning"></i>
            </div>
            <div class="info">
              <h3>{{ overview.overdue_tasks }}</h3>
              <p>超时任务</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card pending-approval" shadow="never">
          <div class="card-content">
            <div class="icon">
              <i class="el-icon-document"></i>
            </div>
            <div class="info">
              <h3>{{ overview.pending_approval }}</h3>
              <p>待审批</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card exception-alerts" shadow="never">
          <div class="card-content">
            <div class="icon">
              <i class="el-icon-warning-outline"></i>
            </div>
            <div class="info">
              <h3>{{ overview.exception_alerts }}</h3>
              <p>异常告警</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="流程状态">
          <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
            <el-option label="未开始" value="NotStarted"></el-option>
            <el-option label="进行中" value="InProgress"></el-option>
            <el-option label="已完成" value="Completed"></el-option>
            <el-option label="已取消" value="Cancelled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="告警类型">
          <el-select v-model="filterForm.alert_type" placeholder="选择告警类型" clearable>
            <el-option label="超时" value="Overdue"></el-option>
            <el-option label="步骤延迟" value="StepDelay"></el-option>
            <el-option label="客户反馈" value="ClientFeedback"></el-option>
            <el-option label="系统错误" value="SystemError"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="严重程度">
          <el-select v-model="filterForm.severity" placeholder="选择严重程度" clearable>
            <el-option label="低" value="Low"></el-option>
            <el-option label="中" value="Medium"></el-option>
            <el-option label="高" value="High"></el-option>
            <el-option label="严重" value="Critical"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分配人员">
          <el-input v-model="filterForm.assigned_staff" placeholder="输入人员ID" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter" icon="el-icon-search">筛选</el-button>
          <el-button @click="resetFilter" icon="el-icon-refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 流程监控表格 -->
    <el-card class="monitoring-table-card" shadow="never">
      <div class="table-header">
        <h3>流程实例监控</h3>
        <el-button type="primary" @click="refreshProcessList" icon="el-icon-refresh">刷新</el-button>
      </div>
      
      <el-table :data="processList" v-loading="processLoading" stripe border>
        <el-table-column prop="instance_id" label="实例ID"></el-table-column>
        <el-table-column prop="order_id" label="订单ID"  ></el-table-column>
        <el-table-column prop="template_id" label="模板ID"></el-table-column>
        <el-table-column prop="current_step" label="当前步骤" width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="current_sequence" label="步骤序号" width="100" align="center"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getProcessStatusType(scope.row.status)">
              {{ getProcessStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assigned_staff" label="分配人员" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="160">
          <template slot-scope="scope">
            {{ formatTimestamp(scope.row.create_time*1000) }}
          </template>
        </el-table-column>
        <el-table-column label="进度" width="240">
          <template slot-scope="scope">
            <el-progress 
              :percentage="getProcessProgress(scope.row)" 
              :status="getProgressStatus(scope.row)"
              :stroke-width="6">
            </el-progress>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="viewProcessDetail(scope.row)">详情</el-button>
            <el-button type="text" @click="viewStepHistory(scope.row)">历史</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          @size-change="handleProcessSizeChange"
          @current-change="handleProcessCurrentChange"
          :current-page="processPagination.current_page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="processPagination.page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="processPagination.total">
        </el-pagination>
      </div>
    </el-card>

    <!-- 告警列表 -->
    <el-card class="alerts-card" shadow="never">
      <div class="table-header">
        <h3>系统告警</h3>
        <el-button type="success" @click="refreshAlertList" icon="el-icon-refresh">刷新</el-button>
      </div>
      
      <el-table :data="alertList" v-loading="alertLoading" stripe border>
        <el-table-column prop="alert_id" label="告警ID" ></el-table-column>
        <el-table-column prop="order_id" label="订单ID" ></el-table-column>
        <el-table-column prop="alert_type" label="告警类型" >
          <template slot-scope="scope">
            <el-tag :type="getAlertTypeColor(scope.row.alert_type)">
              {{ getAlertTypeText(scope.row.alert_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="severity" label="严重程度" width="100">
          <template slot-scope="scope">
            <el-tag :type="getSeverityColor(scope.row.severity)">
              {{ getSeverityText(scope.row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="告警消息" show-overflow-tooltip></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getAlertStatusColor(scope.row.status)">
              {{ getAlertStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assigned_admin" label="处理人员" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="160">
          <template slot-scope="scope">
            {{ formatTimestamp(scope.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作"  fixed="right">
          <template slot-scope="scope">
            <el-button 
              type="text" 
              @click="acknowledgeAlert(scope.row)"
              v-if="scope.row.status === 'Active'">
              确认
            </el-button>
            <el-button 
              type="text" 
              @click="resolveAlert(scope.row)"
              v-if="scope.row.status !== 'Resolved'">
              解决
            </el-button>
            <el-button type="text" @click="viewAlertDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 流程详情对话框 -->
    <el-dialog title="流程实例详情" :visible.sync="processDetailVisible" width="900px" class="process-detail-dialog">
      <div v-if="selectedProcess" class="process-detail-content">
        <!-- 基本信息 -->
        <div class="detail-section">
          <div class="section-title">
            <i class="el-icon-info"></i>
            <span>基本信息</span>
          </div>
          <div class="detail-table">
            <div class="detail-row">
              <div class="detail-label">实例ID</div>
              <div class="detail-value">{{ selectedProcess.instance_id }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">订单ID</div>
              <div class="detail-value">{{ selectedProcess.order_id }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">模板ID</div>
              <div class="detail-value">{{ selectedProcess.template_id }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">当前步骤</div>
              <div class="detail-value step-name">{{ selectedProcess.current_step }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">步骤序号</div>
              <div class="detail-value">
                <el-tag type="info" size="small">第 {{ selectedProcess.current_sequence }} 步</el-tag>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">流程状态</div>
              <div class="detail-value">
                <el-tag :type="getProcessStatusType(selectedProcess.status)" size="medium">
              {{ getProcessStatusText(selectedProcess.status) }}
            </el-tag>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">分配人员</div>
              <div class="detail-value">
                <i class="el-icon-user" v-if="selectedProcess.assigned_staff"></i>
                {{ selectedProcess.assigned_staff || '未分配' }}
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">创建时间</div>
              <div class="detail-value">
                <i class="el-icon-time"></i>
                {{ formatTimestamp(selectedProcess.create_time) }}
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">更新时间</div>
              <div class="detail-value">
                <i class="el-icon-refresh"></i>
                {{ formatTimestamp(selectedProcess.update_time) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 进度信息 -->
        <div class="detail-section">
          <div class="section-title">
            <i class="el-icon-data-line"></i>
            <span>进度信息</span>
          </div>
          <div class="progress-wrapper">
            <div class="progress-bar-section">
              <span class="progress-label">整体进度</span>
              <el-progress 
                :percentage="getProcessProgress(selectedProcess)" 
                :status="getProgressStatus(selectedProcess)"
                :stroke-width="10">
              </el-progress>
            </div>
            <div class="progress-stats-grid">
              <div class="stat-box">
                <div class="stat-label">当前步骤</div>
                <div class="stat-value">{{ selectedProcess.current_sequence || 0 }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">预计总步骤</div>
                <div class="stat-value">10</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">完成率</div>
                <div class="stat-value">{{ getProcessProgress(selectedProcess) }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 步骤历史对话框 -->
    <el-dialog title="步骤历史" :visible.sync="stepHistoryVisible" width="900px" class="step-history-dialog">
      <div class="step-history-wrapper">
        <div 
          v-for="(step, index) in stepHistory"
          :key="index"
          class="step-item"
          :class="'step-status-' + step.status">
          
          <!-- 步骤头部 -->
          <div class="step-item-header">
            <div class="step-title-row">
              <span class="step-name">{{ step.step }}</span>
              <span class="step-sequence">序号: {{ step.sequence }}</span>
            </div>
            <el-tag :type="getStepStatusType(step.status)" size="small">
                {{ getStepStatusText(step.status) }}
              </el-tag>
            </div>
            
          <!-- 步骤内容 -->
          <div class="step-item-content">
            <!-- 操作信息 -->
            <div class="step-info-line">
              <span class="info-label">操作人员:</span>
              <span class="info-text">{{ step.operator_name || step.operator_id || '系统' }}</span>
              <span class="info-label">操作类型:</span>
              <span class="info-text">{{ getOperatorTypeText(step.operator_type) }}</span>
              </div>
              
            <!-- 时间信息 -->
            <div class="step-time-line">
                <el-tag size="small" type="info">
                预计: {{ step.estimated_days || 1 }}天
                </el-tag>
                <el-tag v-if="step.start_time && step.end_time" size="small" :type="getActualTimeTagType(step.estimated_days, getActualDays(step.start_time, step.end_time))">
                实际: {{ getActualDays(step.start_time, step.end_time) }}天
                </el-tag>
                <el-tag v-if="step.start_time && !step.end_time && step.status === 'InProgress'" size="small" type="warning">
                已用: {{ getElapsedDays(step.start_time) }}天
                </el-tag>
              </div>
              
            <!-- 时间详情 -->
            <div class="step-time-detail">
              <div v-if="step.start_time" class="time-item">
                <span class="time-label">开始时间:</span>
                <span class="time-text">{{ formatTimestamp(step.start_time) }}</span>
              </div>
              <div v-if="step.end_time" class="time-item">
                <span class="time-label">完成时间:</span>
                <span class="time-text">{{ formatTimestamp(step.end_time) }}</span>
              </div>
              </div>
              
            <!-- 处理备注 -->
            <div v-if="step.remarks" class="step-remarks">
              <span class="remarks-label">处理备注:</span>
              <span class="remarks-text">{{ step.remarks }}</span>
            </div>
            
            <!-- 附件 -->
              <div v-if="step.attachments && step.attachments.length > 0" class="step-attachments">
              <span class="attachments-label">附件:</span>
              <el-tag v-for="file in step.attachments" :key="file" size="mini">
                {{ file }}
                </el-tag>
              </div>
            </div>
          
          <!-- 时间戳 -->
          <div class="step-timestamp">
            {{ formatTimestamp(step.complete_time || step.start_time) }}
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 告警详情对话框 -->
    <el-dialog title="告警详情" :visible.sync="alertDetailVisible" width="800px" class="alert-detail-dialog">
      <div v-if="selectedAlert" class="alert-detail-content">
        <!-- 告警信息 -->
        <div class="detail-section">
          <div class="section-title">
            <i class="el-icon-warning"></i>
            <span>告警信息</span>
          </div>
          <div class="detail-table">
            <div class="detail-row">
              <div class="detail-label">告警ID</div>
              <div class="detail-value">{{ selectedAlert.alert_id }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">订单ID</div>
              <div class="detail-value">{{ selectedAlert.order_id }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">实例ID</div>
              <div class="detail-value">{{ selectedAlert.instance_id || '无' }}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">告警类型</div>
              <div class="detail-value">
                <el-tag :type="getAlertTypeColor(selectedAlert.alert_type)" size="medium">
                  <i :class="getAlertTypeIcon(selectedAlert.alert_type)"></i>
              {{ getAlertTypeText(selectedAlert.alert_type) }}
            </el-tag>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">严重程度</div>
              <div class="detail-value">
                <el-tag :type="getSeverityColor(selectedAlert.severity)" size="medium">
                  <i :class="getSeverityIcon(selectedAlert.severity)"></i>
              {{ getSeverityText(selectedAlert.severity) }}
            </el-tag>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">告警状态</div>
              <div class="detail-value">
                <el-tag :type="getAlertStatusColor(selectedAlert.status)" size="medium">
                  <i :class="getAlertStatusIcon(selectedAlert.status)"></i>
              {{ getAlertStatusText(selectedAlert.status) }}
            </el-tag>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">处理人员</div>
              <div class="detail-value">
                <i class="el-icon-user" v-if="selectedAlert.resolved_by"></i>
                {{ selectedAlert.resolved_by || '未处理' }}
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">创建时间</div>
              <div class="detail-value">
                <i class="el-icon-time"></i>
                {{ formatTimestamp(selectedAlert.create_time) }}
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-label">解决时间</div>
              <div class="detail-value">
                <i class="el-icon-circle-check" v-if="selectedAlert.resolve_time"></i>
                <i class="el-icon-close" v-else></i>
            {{ selectedAlert.resolve_time ? formatTimestamp(selectedAlert.resolve_time) : '未解决' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 告警消息 -->
        <div class="detail-section">
          <div class="section-title">
            <i class="el-icon-chat-dot-square"></i>
            <span>告警消息</span>
          </div>
          <div class="alert-message-box">
            {{ selectedAlert.message }}
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'ProcessMonitoring',
  data() {
    return {
      processLoading: false,
      alertLoading: false,
      overview: {
        active_processes: 0,
        overdue_tasks: 0,
        pending_approval: 0,
        exception_alerts: 0
      },
      filterForm: {
        status: '',
        alert_type: '',
        severity: '',
        assigned_staff: ''
      },
      processList: [],
      alertList: [],
      processPagination: {
        current_page: 1,
        page_size: 10,
        total: 0
      },
      selectedProcess: null,
      selectedAlert: null,
      stepHistory: [],
      processDetailVisible: false,
      stepHistoryVisible: false,
      alertDetailVisible: false
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    async initData() {
      try {
        await this.loadOverviewData()
        await this.$nextTick()
        await this.loadProcessList()
        await this.$nextTick()
        await this.loadAlertList()
      } catch (error) {
        console.error('初始化数据失败:', error)
      }
    },
    async loadOverviewData() {
      try {
        const response = await this.$request('serviceFlow', 'monitoring-overview', {})
        if (response.code == 1 && response.data) {
        this.overview = {
            active_processes: response.data.active_processes || 0,
            overdue_tasks: response.data.overdue_tasks || 0,
            pending_approval: response.data.pending_approval || 0,
            exception_alerts: response.data.exception_alerts || 0
          }
        } else {
          // 接口失败时使用默认值
          this.overview = {
            active_processes: 0,
            overdue_tasks: 0,
            pending_approval: 0,
            exception_alerts: 0
          }
        }
      } catch (error) {
        console.error('加载概览数据失败:', error)
        // 发生错误时使用默认值
        this.overview = {
          active_processes: 0,
          overdue_tasks: 0,
          pending_approval: 0,
          exception_alerts: 0
        }
      }
    },
    async loadProcessList() {
      try {
        this.processLoading = true
        const params = {
          ...this.filterForm,
          current_page: this.processPagination.current_page,
          page_size: this.processPagination.page_size
        }
        
        const response = await this.$request('serviceFlow', 'process-instance-list', params)
        if (response.code == 1 && response.data) {
          this.processList = response.data.list || []
          this.processPagination.total = response.data.total || 0
        } else {
          this.processList = []
          this.processPagination.total = 0
          this.$message.error(response.msg || '获取流程列表失败')
        }
      } catch (error) {
        this.processList = []
        this.processPagination.total = 0
        console.error('加载流程列表失败:', error)
        // 不显示错误消息，避免404等网络错误影响用户体验
      } finally {
        this.processLoading = false
      }
    },
    async loadAlertList() {
      try {
        this.alertLoading = true
        const response = await this.$request('serviceFlow', 'process-alerts', this.filterForm)
        if (response.code == 1) {
          this.alertList = response.data || []
        } else {
          this.alertList = []
          this.$message.error(response.msg || '获取告警列表失败')
        }
      } catch (error) {
        this.alertList = []
        console.error('加载告警列表失败:', error)
        // 不显示错误消息，避免404等网络错误影响用户体验
      } finally {
        this.alertLoading = false
      }
    },
    handleFilter() {
      this.processPagination.current_page = 1
      this.loadProcessList()
      this.loadAlertList()
    },
    resetFilter() {
      this.filterForm = {
        status: '',
        alert_type: '',
        severity: '',
        assigned_staff: ''
      }
      this.handleFilter()
    },
    refreshProcessList() {
      this.loadProcessList()
    },
    refreshAlertList() {
      this.loadAlertList()
    },
    handleProcessSizeChange(size) {
      this.processPagination.page_size = size
      this.loadProcessList()
    },
    handleProcessCurrentChange(page) {
      this.processPagination.current_page = page
      this.loadProcessList()
    },
    async viewProcessDetail(process) {
      try {
        const response = await this.$request('serviceFlow', 'process-instance-detail', { instance_id: process.instance_id })
        if (response.code == 1) {
          this.selectedProcess = response.data
          this.processDetailVisible = true
        } else {
          this.$message.error(response.msg || '获取流程详情失败')
        }
      } catch (error) {
        console.error('获取流程详情失败:', error)
        this.$message.error('获取流程详情失败')
      }
    },
    async viewStepHistory(process) {
      try {
        const response = await this.$request('serviceFlow', 'step-history', { instance_id: process.instance_id })
        if (response.code == 1) {
          this.stepHistory = response.data || []
          this.stepHistoryVisible = true
        } else {
          this.$message.error(response.msg || '获取步骤历史失败')
        }
      } catch (error) {
        console.error('获取步骤历史失败:', error)
        this.$message.error('获取步骤历史失败')
      }
    },
    async acknowledgeAlert(alert) {
      try {
        const response = await this.$request('serviceFlow', 'acknowledge-alert', { alert_id: alert.alert_id })
        if (response.code == 1) {
          this.$message.success('告警已确认')
          this.loadAlertList()
        } else {
          this.$message.error(response.msg || '确认告警失败')
        }
      } catch (error) {
        console.error('确认告警失败:', error)
        this.$message.error('确认告警失败')
      }
    },
    async resolveAlert(alert) {
      try {
        const response = await this.$request('serviceFlow', 'resolve-alert', { alert_id: alert.alert_id })
        if (response.code == 1) {
          this.$message.success('告警已解决')
          this.loadAlertList()
        } else {
          this.$message.error(response.msg || '解决告警失败')
        }
      } catch (error) {
        console.error('解决告警失败:', error)
        this.$message.error('解决告警失败')
      }
    },
    viewAlertDetail(alert) {
      this.selectedAlert = alert
      this.alertDetailVisible = true
    },
    getProcessProgress(process) {
      // 根据当前步骤序号计算进度，假设总步骤数为10
      const totalSteps = 10
      const currentSequence = process && process.current_sequence ? process.current_sequence : 0
      return Math.round((currentSequence / totalSteps) * 100)
    },
    getProgressStatus(process) {
      if (process.status === 'Completed') return 'success'
      if (process.status === 'Cancelled') return 'exception'
      return null
    },
    getProcessStatusType(status) {
      const statusMap = {
        'NotStarted': 'info',
        'InProgress': 'warning',
        'Completed': 'success',
        'Cancelled': 'danger'
      }
      return statusMap[status] || ''
    },
    getProcessStatusText(status) {
      const statusMap = {
        'NotStarted': '未开始',
        'InProgress': '进行中',
        'Completed': '已完成',
        'Cancelled': '已取消'
      }
      return statusMap[status] || status
    },
    getStepStatusType(status) {
      const typeMap = {
        'NotStarted': 'info',
        'Pending': 'info',
        'InProgress': 'warning',
        'Completed': 'success',
        'Cancelled': 'danger',
        'Overdue': 'danger',
        'Skipped': 'danger'
      }
      return typeMap[status] || 'info'
    },
    getStepStatusText(status) {
      const textMap = {
        'NotStarted': '未开始',
        'Pending': '待处理',
        'InProgress': '进行中',
        'Completed': '已完成',
        'Cancelled': '已取消',
        'Overdue': '已超期',
        'Skipped': '已跳过'
      }
      return textMap[status] || status
    },
    getOperatorTypeText(type) {
      const typeMap = {
        'admin': '管理员',
        'system': '系统',
        'user': '用户',
        'enterprise': '企业用户',
        'service_provider': '服务提供商'
      }
      return typeMap[type] || type || '系统'
    },
    getAlertTypeColor(type) {
      const colorMap = {
        'Overdue': 'danger',
        'StepDelay': 'warning',
        'ClientFeedback': 'info',
        'SystemError': 'danger'
      }
      return colorMap[type] || ''
    },
    getAlertTypeText(type) {
      const textMap = {
        'Overdue': '超时',
        'StepDelay': '步骤延迟',
        'ClientFeedback': '客户反馈',
        'SystemError': '系统错误'
      }
      return textMap[type] || type
    },
    getSeverityColor(severity) {
      const colorMap = {
        'Low': 'info',
        'Medium': 'warning',
        'High': 'danger',
        'Critical': 'danger'
      }
      return colorMap[severity] || ''
    },
    getSeverityText(severity) {
      const textMap = {
        'Low': '低',
        'Medium': '中',
        'High': '高',
        'Critical': '严重'
      }
      return textMap[severity] || severity
    },
    getAlertStatusColor(status) {
      const colorMap = {
        'Active': 'danger',
        'Acknowledged': 'warning',
        'Resolved': 'success'
      }
      return colorMap[status] || ''
    },
    getAlertStatusText(status) {
      const textMap = {
        'Active': '活跃',
        'Acknowledged': '已确认',
        'Resolved': '已解决'
      }
      return textMap[status] || status
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return ''
      // 处理时间戳，确保是毫秒级
      const time = timestamp > 1000000000000 ? timestamp : timestamp * 1000
      const date = new Date(time)
      return date.toLocaleString('zh-CN')
    },
    getActualDays(startTime, endTime) {
      if (!startTime || !endTime) return 0
      
      // 确保时间戳是毫秒级
      const start = startTime > 1000000000000 ? startTime : startTime * 1000
      const end = endTime > 1000000000000 ? endTime : endTime * 1000
      
      const diffMs = end - start
      const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
      return Math.max(1, diffDays) // 至少显示1天
    },
    getElapsedDays(startTime) {
      if (!startTime) return 0
      
      // 确保时间戳是毫秒级
      const start = startTime > 1000000000000 ? startTime : startTime * 1000
      const now = Date.now()
      
      const diffMs = now - start
      const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
      return Math.max(1, diffDays) // 至少显示1天
    },
    getActualTimeTagType(estimatedDays, actualDays) {
      if (!estimatedDays || !actualDays) return 'info'
      
      if (actualDays <= estimatedDays) {
        return 'success' // 按时或提前完成
      } else if (actualDays <= estimatedDays * 1.2) {
        return 'warning' // 轻微延期（20%以内）
      } else {
        return 'danger' // 严重延期
      }
    },
    getAlertTypeIcon(type) {
      const iconMap = {
        'Overdue': 'el-icon-time',
        'StepDelay': 'el-icon-loading',
        'ClientFeedback': 'el-icon-chat-dot-square',
        'SystemError': 'el-icon-warning'
      }
      return iconMap[type] || 'el-icon-info'
    },
    getSeverityIcon(severity) {
      const iconMap = {
        'Low': 'el-icon-info',
        'Medium': 'el-icon-warning',
        'High': 'el-icon-warning-outline',
        'Critical': 'el-icon-circle-close'
      }
      return iconMap[severity] || 'el-icon-info'
    },
    getAlertStatusIcon(status) {
      const iconMap = {
        'Active': 'el-icon-warning',
        'Acknowledged': 'el-icon-check',
        'Resolved': 'el-icon-circle-check'
      }
      return iconMap[status] || 'el-icon-info'
    }
  }
}
</script>

<style scoped>
.process-monitoring {
  padding: 0px;
}

.monitoring-overview {
  margin-bottom: 10px;
}

.overview-card {
  height: 120px;
}

.card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.card-content .icon {
  font-size: 40px;
  margin-right: 10px;
  width: 60px;
  text-align: center;
}

.card-content .info h3 {
  margin: 0;
  font-size: 28px;
  font-weight: bold;
}

.card-content .info p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 14px;
}

.active-processes .icon {
  color: #67c23a;
}

.overdue-tasks .icon {
  color: #f56c6c;
}

.pending-approval .icon {
  color: #e6a23c;
}

.exception-alerts .icon {
  color: #f56c6c;
}

.filter-card, .monitoring-table-card, .alerts-card {
  margin-bottom: 10px;
}

.filter-form .el-form-item {
  margin-bottom: 10px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.table-header h3 {
  margin: 0;
  color: #303133;
}

.pagination-wrapper {
  text-align: right;
  margin-top: 10px;
}

/* 步骤历史弹窗样式 */
.step-history-dialog .el-dialog__body {
  padding: 20px;
  background: #f5f7fa;
}

.step-history-wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.step-item {
  background: white;
  border: 1px solid #e4e7ed;
  padding: 15px;
  position: relative;
}

.step-item.step-status-Overdue {
  background: #f0f9ff;
}

/* 步骤头部 */
.step-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.step-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.step-sequence {
  font-size: 12px;
  color: #909399;
  background: #f0f2f5;
  padding: 2px 8px;
}

/* 步骤内容 */
.step-item-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 操作信息行 */
.step-info-line {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.info-label {
  color: #909399;
  font-weight: 600;
}

.info-text {
  color: #303133;
}

/* 时间标签行 */
.step-time-line {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 时间详情 */
.step-time-detail {
  display: flex;
  gap: 20px;
  padding: 8px 0;
  font-size: 13px;
}

.time-item {
  display: flex;
  gap: 5px;
}

.time-label {
  color: #909399;
  font-weight: 600;
}

.time-text {
  color: #606266;
}

/* 处理备注 */
.step-remarks {
  padding: 8px;
  background: #f0f9ff;
  font-size: 13px;
  display: flex;
  gap: 8px;
}

.remarks-label {
  color: #909399;
  font-weight: 600;
  flex-shrink: 0;
}

.remarks-text {
  color: #606266;
  line-height: 1.5;
}

/* 附件 */
.step-attachments {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
}

.attachments-label {
  color: #909399;
  font-weight: 600;
}

/* 时间戳 */
.step-timestamp {
  position: absolute;
  top: 15px;
  right: 80px;
  font-size: 12px;
  color: #909399;
}

/* 详情弹窗样式 */
.process-detail-dialog .el-dialog__body,
.alert-detail-dialog .el-dialog__body {
  padding: 20px;
  background: #f5f7fa;
}

.process-detail-content,
.alert-detail-content {
  overflow: visible;
}

.detail-section {
  background: white;
  border: 1px solid #e4e7ed;
  padding: 20px;
  margin-bottom: 15px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.section-title i {
  margin-right: 8px;
  font-size: 18px;
  color: #409eff;
}

.detail-table {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.detail-row {
  display: flex;
  align-items: center;
  min-height: 45px;
  border-bottom: 1px solid #f0f0f0;
  padding: 10px 0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  width: 120px;
  flex-shrink: 0;
  font-weight: 600;
  color: #606266;
  font-size: 14px;
  padding-right: 20px;
}

.detail-value {
  flex: 1;
  color: #303133;
  font-size: 14px;
  word-break: break-all;
}

.detail-value i {
  margin-right: 5px;
  color: #909399;
}

.step-name {
  color: #409eff;
  font-weight: 600;
}

/* 进度信息样式 */
.progress-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-bar-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-label {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.progress-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.stat-box {
  background: #f8f9fa;
  padding: 20px;
  text-align: center;
  border: 1px solid #e4e7ed;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
}

/* 告警消息框样式 */
.alert-message-box {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  padding: 15px;
  color: #303133;
  line-height: 1.6;
  font-size: 14px;
  min-height: 60px;
}
</style>