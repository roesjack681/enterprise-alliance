<template>
  <div class="service-dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stats-card total-orders" shadow="never">
          <div class="card-content">
            <div class="icon">
              <i class="el-icon-s-order"></i>
            </div>
            <div class="info">
              <h3>{{ statistics.total_orders }}</h3>
              <p>总订单数</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card pending-orders" shadow="never">
          <div class="card-content">
            <div class="icon">
              <i class="el-icon-time"></i>
            </div>
            <div class="info">
              <h3>{{ statistics.pending_orders }}</h3>
              <p>待处理订单</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card active-orders" shadow="never">
          <div class="card-content">
            <div class="icon">
              <i class="el-icon-loading"></i>
            </div>
            <div class="info">
              <h3>{{ statistics.active_orders }}</h3>
              <p>进行中订单</p>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card completed-orders" shadow="never">
          <div class="card-content">
            <div class="icon">
              <i class="el-icon-circle-check"></i>
            </div>
            <div class="info">
              <h3>{{ statistics.completed_orders }}</h3>
              <p>已完成订单</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 告警提醒 -->
    <el-row :gutter="20" class="alert-section">
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header">
            <span>超时任务提醒</span>
            <el-badge :value="statistics.overdue_tasks" class="item" v-if="statistics.overdue_tasks > 0">
              <i class="el-icon-warning-outline"></i>
            </el-badge>
          </div>
          <div class="alert-content">
            <div v-if="statistics.overdue_tasks > 0" class="overdue-alert">
              <i class="el-icon-warning"></i>
              <span>有 {{ statistics.overdue_tasks }} 个任务已超时，请及时处理</span>
              <el-button type="text" @click="viewOverdueTasks">查看详情</el-button>
            </div>
            <div v-else class="no-alert">
              <i class="el-icon-success"></i>
              <span>暂无超时任务</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header">
            <span>待审批事项</span>
            <el-badge :value="statistics.pending_approvals" class="item" v-if="statistics.pending_approvals > 0">
              <i class="el-icon-document"></i>
            </el-badge>
          </div>
          <div class="alert-content">
            <div v-if="statistics.pending_approvals > 0" class="pending-alert">
              <i class="el-icon-document"></i>
              <span>有 {{ statistics.pending_approvals }} 个事项待审批</span>
              <el-button type="text" @click="viewPendingApprovals">查看详情</el-button>
            </div>
            <div v-else class="no-alert">
              <i class="el-icon-success"></i>
              <span>暂无待审批事项</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 完成情况统计 -->
    <el-row :gutter="20" class="completion-stats">
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header">
            <span>今日完成情况</span>
          </div>
          <div class="completion-content">
            <div class="completion-number">{{ statistics.today_completed }}</div>
            <div class="completion-label">今日已完成订单</div>
            <el-progress 
              :percentage="getTodayCompletionRate()" 
              :color="getProgressColor(getTodayCompletionRate())"
              :stroke-width="8">
            </el-progress>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header">
            <span>本月完成情况</span>
          </div>
          <div class="completion-content">
            <div class="completion-number">{{ statistics.month_completed }}</div>
            <div class="completion-label">本月已完成订单</div>
            <el-progress 
              :percentage="getMonthCompletionRate()" 
              :color="getProgressColor(getMonthCompletionRate())"
              :stroke-width="8">
            </el-progress>
          </div>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script>

export default {
  name: 'ServiceFlowDashboard',
  data() {
    return {
      loading: false,
      statistics: {
        total_orders: 0,
        pending_orders: 0,
        active_orders: 0,
        completed_orders: 0,
        overdue_tasks: 0,
        pending_approvals: 0,
        today_completed: 0,
        month_completed: 0
      }
    }
  },
  mounted() {
    this.loadStatistics()
  },
  methods: {
    async loadStatistics() {
      try {
        this.loading = true
        const response = await this.$request('serviceFlow', 'workbench-statistics')
        if (response && response.code == 1 && response.data) {
          this.statistics = {
            total_orders: response.data.total_orders || 0,
            pending_orders: response.data.pending_orders || 0,
            active_orders: response.data.active_orders || 0,
            completed_orders: response.data.completed_orders || 0,
            overdue_tasks: response.data.overdue_tasks || 0,
            pending_approvals: response.data.pending_approvals || 0,
            today_completed: response.data.today_completed || 0,
            month_completed: response.data.month_completed || 0
          }
        } else {
          // API不存在或返回错误时使用模拟数据
          this.statistics = {
            total_orders: 0,
            pending_orders: 0,
            active_orders: 0,
            completed_orders: 0,
            overdue_tasks: 0,
            pending_approvals: 0,
            today_completed: 0,
            month_completed: 0
          }
          console.warn('获取统计数据失败: API接口不存在或返回格式错误')
        }
      } catch (error) {
        // 网络错误时使用默认值，不影响页面显示
        this.statistics = {
          total_orders: 0,
          pending_orders: 0,
          active_orders: 0,
          completed_orders: 0,
          overdue_tasks: 0,
          pending_approvals: 0,
          today_completed: 0,
          month_completed: 0
        }
        console.error('加载统计数据失败:', error)
      } finally {
        this.loading = false
      }
    },
    getTodayCompletionRate() {
      const totalOrders = this.statistics && this.statistics.total_orders ? this.statistics.total_orders : 0
      const todayCompleted = this.statistics && this.statistics.today_completed ? this.statistics.today_completed : 0
      if (totalOrders === 0) return 0
      return Math.round((todayCompleted / totalOrders) * 100)
    },
    getMonthCompletionRate() {
      const totalOrders = this.statistics && this.statistics.total_orders ? this.statistics.total_orders : 0
      const monthCompleted = this.statistics && this.statistics.month_completed ? this.statistics.month_completed : 0
      if (totalOrders === 0) return 0
      return Math.round((monthCompleted / totalOrders) * 100)
    },
    getProgressColor(percentage) {
      if (percentage < 30) return '#f56c6c'
      if (percentage < 70) return '#e6a23c'
      return '#67c23a'
    },
    viewOverdueTasks() {
      this.$router.push({
        name: 'serviceFlow-monitoring',
        query: { filter: 'overdue' }
      })
    },
    viewPendingApprovals() {
      this.$router.push({
        name: 'serviceFlow-order',
        query: { filter: 'pending_approval' }
      })
    }
  }
}
</script>

<style scoped>
.service-dashboard {
  padding: 0px;
}

.stats-cards {
  margin-bottom: 10px;
}

.stats-card {
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

.total-orders .icon {
  color: #409eff;
}

.pending-orders .icon {
  color: #e6a23c;
}

.active-orders .icon {
  color: #67c23a;
}

.completed-orders .icon {
  color: #909399;
}

.alert-section {
  margin-bottom: 10px;
}

.alert-content {
  padding: 20px 0;
  text-align: center;
}

.overdue-alert, .pending-alert {
  color: #e6a23c;
}

.overdue-alert i, .pending-alert i {
  font-size: 24px;
  margin-right: 10px;
}

.no-alert {
  color: #67c23a;
}

.no-alert i {
  font-size: 24px;
  margin-right: 10px;
}

.completion-stats {
  margin-bottom: 10px;
}

.completion-content {
  text-align: center;
  padding: 20px 0;
}

.completion-number {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.completion-label {
  color: #666;
  margin-bottom: 10px;
}

.el-badge {
  margin-left: 10px;
}
</style>