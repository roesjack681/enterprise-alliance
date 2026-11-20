<template>
  <div class="template-management">
    <!-- 操作区域 -->
    <el-card class="operation-card" shadow="never">
      <el-row :gutter="10">
        <el-col :span="12">
          <el-button type="primary" @click="createTemplate" icon="el-icon-plus">
            创建流程模板
          </el-button>
          <el-button  @click="loadTemplateList" icon="el-icon-refresh">
            刷新列表
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索模板名称"
            @input="handleSearch"
            clearable>
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="selectedCategoryId"
            placeholder="选择服务分类"
            @change="handleCategoryFilter"
            clearable
            style="width: 100%">
            <el-option
              v-for="category in firstLevelCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id">
            </el-option>
          </el-select>
        </el-col>
      </el-row>
    </el-card>

    <!-- 模板列表 -->
    <el-card class="template-list-card" shadow="never">
      <el-table :data="filteredTemplateList" v-loading="loading" stripe border>
        <el-table-column prop="template_id" label="模板ID" width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="template_name" label="模板名称" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="service_id" label="服务分类" width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ getCategoryName(scope.row.service_id) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip></el-table-column>
        <el-table-column prop="steps" label="步骤数量" width="100">
          <template slot-scope="scope">
            {{ getStepsCount(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.is_active ? 'success' : 'danger'">
              {{ scope.row.is_active ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_by" label="创建者" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="160">
          <template slot-scope="scope">
            {{ formatTimestamp(scope.row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="viewTemplate(scope.row)">查看</el-button>
            <el-button type="text" @click="editTemplate(scope.row)">编辑</el-button>
            <el-button 
              type="text" 
              @click="toggleTemplateStatus(scope.row)"
              :style="{ color: scope.row.is_active ? '#f56c6c' : '#67c23a' }">
              {{ scope.row.is_active ? '禁用' : '启用' }}
            </el-button>
            <el-button type="text" @click="deleteTemplate(scope.row)" style="color: #f56c6c">删除</el-button>
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

    <!-- 模板详情/编辑对话框 -->
    <el-dialog 
      :title="dialogMode === 'create' ? '创建流程模板' : dialogMode === 'edit' ? '编辑流程模板' : '查看流程模板'" 
      :visible.sync="templateDialogVisible" 
      width="900px"
      :close-on-click-modal="false">
      
      <!-- 查看模式 -->
      <div v-if="dialogMode === 'view'" class="view-content">
        <el-row :gutter="20" class="info-row">
          <el-col :span="12">
            <div class="info-item">
              <span class="label">服务分类：</span>
              <span class="value">{{ getCategoryName(templateForm.service_id) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">模板名称：</span>
              <span class="value">{{ templateForm.template_name }}</span>
            </div>
          </el-col>
        </el-row>
        
        <div class="info-item">
          <span class="label">模板描述：</span>
          <div class="value description">{{ templateForm.description || '无描述' }}</div>
        </div>
      </div>

      <!-- 编辑模式 -->
      <el-form v-else :model="templateForm" :rules="templateRules" ref="templateForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="服务分类" prop="service_id">
              <el-select 
                v-model="templateForm.service_id" 
                placeholder="请选择服务分类"
                filterable
                style="width: 100%">
                <el-option
                  v-for="category in firstLevelCategories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板名称" prop="template_name">
              <el-input 
                v-model="templateForm.template_name" 
                placeholder="请输入模板名称">
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="模板描述">
          <el-input 
            type="textarea" 
            v-model="templateForm.description" 
            placeholder="请输入模板描述"
            :rows="3">
          </el-input>
        </el-form-item>
        
        <!-- 流程步骤 - 编辑模式 -->
        <el-form-item label="流程步骤" prop="steps">
        <div class="steps-container">
          <div 
            v-for="(step, index) in templateForm.steps" 
            :key="index" 
            class="step-item">
            
            <el-card class="step-card" shadow="never">
              <div class="step-header">
                <span class="step-number">步骤 {{ step.sequence }}</span>
                <div class="step-actions">
                  <el-button 
                    type="text" 
                    @click="moveStepUp(index)" 
                    :disabled="index === 0"
                    icon="el-icon-arrow-up">
                  </el-button>
                  <el-button 
                    type="text" 
                    @click="moveStepDown(index)" 
                    :disabled="index === templateForm.steps.length - 1"
                    icon="el-icon-arrow-down">
                  </el-button>
                  <el-button 
                    type="text" 
                    @click="removeStep(index)" 
                    style="color: #f56c6c"
                    icon="el-icon-delete">
                  </el-button>
                </div>
              </div>
              
              <el-row :gutter="10">
                <el-col :span="8">
                  <el-form-item label="步骤名称" label-width="80px">
                    <el-input 
                      v-model="step.step" 
                      placeholder="步骤名称">
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="执行角色" label-width="80px">
                    <el-select 
                      v-model="step.role" 
                      placeholder="请选择执行角色"
                      style="width: 100%">
                      <el-option label="服务商" value="service_provider"></el-option>
                      <el-option label="企业" value="enterprise"></el-option>
                      <el-option label="系统" value="system"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="预计天数" label-width="80px">
                    <el-input-number 
                      v-model="step.estimated_days" 
                      :min="1" 
                      :max="365"
                      style="width: 100%">
                    </el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item label="步骤描述" label-width="80px">
                <el-input 
                  type="textarea" 
                  v-model="step.description" 
                  placeholder="步骤描述"
                  :rows="2">
                </el-input>
              </el-form-item>
              
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-form-item label="需要审批" label-width="80px">
                    <el-switch 
                      v-model="step.approval_required" 
                      :active-value="1" 
                      :inactive-value="0">
                    </el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="自动推进" label-width="80px">
                    <el-switch 
                      v-model="step.auto_advance" 
                      :active-value="1" 
                      :inactive-value="0">
                    </el-switch>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item label="必需文件" label-width="80px">
                <el-tag
                  v-for="(file, fileIndex) in step.required_files"
                  :key="fileIndex"
                  closable
                  @close="removeRequiredFile(index, fileIndex)"
                  :disable-transitions="false"
                  style="margin-right: 10px; margin-bottom: 5px;">
                  {{ file }}
                </el-tag>
                <el-input
                  v-if="step.showFileInput"
                  v-model="step.newFileName"
                  size="small"
                  @keyup.enter.native="addRequiredFile(index)"
                  @blur="addRequiredFile(index)"
                  style="width: 150px;">
                </el-input>
                <el-button 
                  v-else
                  size="small" 
                  @click="showFileInput(index)">
                  + 添加文件
                </el-button>
              </el-form-item>
            </el-card>
          </div>
          
          <el-button 
            type="dashed" 
            @click="addStep" 
            icon="el-icon-plus"
            class="add-step-btn">
            添加步骤
          </el-button>
        </div>
        </el-form-item>
      </el-form>

      <!-- 流程步骤 - 查看模式 -->
      <div v-if="dialogMode === 'view'" class="steps-view">
        <div class="section-title">流程步骤</div>
        <div v-for="(step, index) in templateForm.steps" :key="index" class="step-view-item">
          <el-card class="step-view-card" shadow="never">
            <div class="step-view-header">
              <span class="step-number">步骤 {{ step.sequence }}</span>
              <span class="step-name">{{ step.step }}</span>
            </div>
            
            <div class="step-view-content">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="info-item">
                    <span class="label">执行角色：</span>
                    <span class="value">{{ getRoleName(step.role) }}</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="info-item">
                    <span class="label">预计天数：</span>
                    <span class="value">{{ step.estimated_days }}天</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="info-item">
                    <span class="label">需要审批：</span>
                    <span class="value">{{ step.approval_required ? '是' : '否' }}</span>
                  </div>
                </el-col>
              </el-row>
              
              <div class="info-item">
                <span class="label">自动推进：</span>
                <span class="value">{{ step.auto_advance ? '是' : '否' }}</span>
              </div>
              
              <div class="info-item">
                <span class="label">步骤描述：</span>
                <div class="value description">{{ step.description || '无描述' }}</div>
              </div>
              
              <div class="info-item" v-if="step.required_files && step.required_files.length > 0">
                <span class="label">必需文件：</span>
                <div class="value">
                  <el-tag
                    v-for="(file, fileIndex) in step.required_files"
                    :key="fileIndex"
                    size="small"
                    style="margin-right: 8px; margin-bottom: 4px;">
                    {{ file }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
      
      <div slot="footer" class="dialog-footer" v-if="dialogMode !== 'view'">
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTemplate" :loading="saving">
          {{ dialogMode === 'create' ? '创建' : '保存' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'TemplateManagement',
  data() {
    return {
      loading: false,
      saving: false,
      searchKeyword: '',
      selectedCategoryId: '',
      templateList: [],
      categoryList: [],
      searchTimer: null,
      pagination: {
        current_page: 1,
        page_size: 20,
        total: 0
      },
      templateDialogVisible: false,
      dialogMode: 'view', // view, edit, create
      templateForm: {
        template_id: '',
        service_id: '',
        template_name: '',
        description: '',
        steps: []
      },
      templateRules: {
        service_id: [
          { required: true, message: '请选择服务分类', trigger: 'change' }
        ],
        template_name: [
          { required: true, message: '请输入模板名称', trigger: 'blur' }
        ],
        steps: [
          { required: true, message: '请至少添加一个步骤', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    firstLevelCategories() {
      return (this.categoryList || []).filter(category => category.pid === 0)
    },
    filteredTemplateList() {
      return this.templateList || []
    }
  },
  async mounted() {
    await this.loadCategoryList()
    await this.loadTemplateList()    
  },
  methods: {
    async loadTemplateList() {
      try {
        this.loading = true
        const params = {
          current_page: this.pagination.current_page,
          page_size: this.pagination.page_size
        }
        
        // 添加分类筛选参数
        if (this.selectedCategoryId) {
          params.service_id = this.selectedCategoryId
        }
        
        // 添加搜索关键词参数
        if (this.searchKeyword && this.searchKeyword.trim()) {
          params.keyword = this.searchKeyword.trim()
        }
        
        const response = await this.$request('serviceFlow', 'template-list', params)
        if (response && response.code == 1 && response.data) {
          this.templateList = response.data.list || []
          this.pagination.total = response.data.total || 0
        } else {
          this.templateList = []
          this.pagination.total = 0
          if (response && response.msg) {
            this.$message.error(response.msg)
          }
        }
      } catch (error) {
        this.templateList = []
        this.pagination.total = 0
        this.$message.error('加载模板列表失败')
      } finally {
        this.loading = false
      }
    },
    async loadCategoryList() {
      try {
        const response = await this.$request('serviceFlow', 'category-list')
        if (response && response.code == 1) {
          this.categoryList = response.data || []
        } else {
          this.categoryList = []
        }
      } catch (error) {
        this.categoryList = []
      }
    },
    handleSearch() {
      if (this.searchTimer) clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.pagination.current_page = 1
        this.loadTemplateList()
      }, 500)
    },
    handleCategoryFilter() {
      this.pagination.current_page = 1
      this.loadTemplateList()
    },
    handleSizeChange(size) {
      this.pagination.page_size = size
      this.pagination.current_page = 1
      this.loadTemplateList()
    },
    handleCurrentChange(page) {
      this.pagination.current_page = page
      this.loadTemplateList()
    },
    createTemplate() {
      this.dialogMode = 'create'
      this.templateForm = {
        template_id: '',
        service_id: '',
        template_name: '',
        description: '',
        steps: []
      }
      this.templateDialogVisible = true
    },
    // 解析模板步骤数据的通用方法
    parseTemplateSteps(template) {
      let steps = []
      try {
        if (template.steps_json) {
          steps = typeof template.steps_json === 'string' 
            ? JSON.parse(template.steps_json) 
            : template.steps_json
        } else if (template.steps) {
          steps = template.steps
        }
      } catch (error) {
        steps = []
      }
      
      return Array.isArray(steps) ? steps.map(step => ({
        step: step.step || '',
        sequence: step.sequence || 0,
        role: step.role || 'service_provider',
        description: step.description || '',
        estimated_days: step.estimated_days || 1,
        required_files: step.required_files || [],
        approval_required: step.approval_required || 0,
        auto_advance: step.auto_advance || 0,
        showFileInput: false,
        newFileName: ''
      })) : []
    },
    // 设置模板表单数据的通用方法
    setTemplateForm(template) {
      this.templateForm = {
        template_id: template.template_id || '',
        service_id: template.service_id || '',
        template_name: template.template_name || '',
        description: template.description || '',
        steps: this.parseTemplateSteps(template)
      }
    },
    viewTemplate(template) {
      this.dialogMode = 'view'
      this.setTemplateForm(template)
      this.templateDialogVisible = true
    },
    editTemplate(template) {
      this.dialogMode = 'edit'
      this.setTemplateForm(template)
      this.templateDialogVisible = true
    },
    async saveTemplate() {
      try {
        await this.$refs.templateForm.validate()
        this.saving = true
        
        const templateData = {
          ...this.templateForm,
          steps: this.templateForm.steps.map((step, index) => ({
            ...step,
            sequence: index + 1,
            required_files: step.required_files || []
          }))
        }
        
        let response
        if (this.dialogMode === 'create') {
          response = await this.$request('serviceFlow', 'create-template', templateData)
        } else {
          response = await this.$request('serviceFlow', 'update-template', templateData)
        }
        
        if (response.code == 1) {
          this.$message.success(this.dialogMode === 'create' ? '创建成功' : '保存成功')
          this.templateDialogVisible = false
          this.loadTemplateList()
        } else {
          this.$message.error(response.msg || '操作失败')
        }
      } catch (error) {
        console.error('保存模板失败:', error)
        this.$message.error('保存模板失败')
      } finally {
        this.saving = false
      }
    },
    async toggleTemplateStatus(template) {
      try {
        const action = template.is_active ? '禁用' : '启用'
        await this.$confirm(`确定要${action}这个模板吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const updateData = {
          template_id: template.template_id,
          service_id: template.service_id,
          template_name: template.template_name,
          description: template.description,
          is_active: template.is_active ? 0 : 1
        }
        
        const response = await this.$request('serviceFlow', 'update-template', updateData)
        if (response.code == 1) {
          this.$message.success(`${action}成功`)
          this.loadTemplateList()
        } else {
          this.$message.error(response.msg || `${action}失败`)
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('切换模板状态失败:', error)
          this.$message.error('操作失败')
        }
      }
    },
    async deleteTemplate(template) {
      try {
        await this.$confirm('确定要删除这个模板吗？删除后不可恢复。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await this.$request('serviceFlow', 'delete-template', { template_id: template.template_id })
        if (response.code == 1) {
          this.$message.success('删除成功')
          this.loadTemplateList()
        } else {
          this.$message.error(response.msg || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除模板失败:', error)
          this.$message.error('删除失败')
        }
      }
    },
    addStep() {
      const newStep = {
        step: '',
        sequence: this.templateForm.steps.length + 1,
        role: 'service_provider', // 默认选择服务商
        description: '',
        estimated_days: 1,
        required_files: [],
        approval_required: 0,
        auto_advance: 0,
        showFileInput: false,
        newFileName: ''
      }
      this.templateForm.steps.push(newStep)
    },
    removeStep(index) {
      this.templateForm.steps.splice(index, 1)
      this.updateStepSequences()
    },
    moveStepUp(index) {
      if (index > 0) {
        const step = this.templateForm.steps.splice(index, 1)[0]
        this.templateForm.steps.splice(index - 1, 0, step)
        this.updateStepSequences()
      }
    },
    moveStepDown(index) {
      if (index < this.templateForm.steps.length - 1) {
        const step = this.templateForm.steps.splice(index, 1)[0]
        this.templateForm.steps.splice(index + 1, 0, step)
        this.updateStepSequences()
      }
    },
    updateStepSequences() {
      this.templateForm.steps.forEach((step, index) => {
        step.sequence = index + 1
      })
    },
    showFileInput(stepIndex) {
      if (this.templateForm.steps[stepIndex]) {
        this.$set(this.templateForm.steps[stepIndex], 'showFileInput', true)
        this.$nextTick(() => {
          // 聚焦到输入框
        })
      }
    },
    addRequiredFile(stepIndex) {
      const step = this.templateForm.steps[stepIndex]
      if (step && step.newFileName && step.newFileName.trim()) {
        if (!step.required_files) {
          this.$set(step, 'required_files', [])
        }
        step.required_files.push(step.newFileName.trim())
        step.newFileName = ''
      }
      if (step) {
        step.showFileInput = false
      }
    },
    removeRequiredFile(stepIndex, fileIndex) {
      if (this.templateForm.steps[stepIndex] && this.templateForm.steps[stepIndex].required_files) {
        this.templateForm.steps[stepIndex].required_files.splice(fileIndex, 1)
      }
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN')
    },
    getCategoryName(categoryId) {
      if (!categoryId) return '未选择'
      
      // 确保数据类型一致的匹配
      const category = this.categoryList.find(c => Number(c.id) === Number(categoryId))
      return category ? category.name : `未知分类(${categoryId})`
    },
    getRoleName(roleValue) {
      const roleMap = {
        'service_provider': '服务商',
        'enterprise': '企业',
        'system': '系统'
      }
      return roleMap[roleValue] || roleValue
    },
    getStepsCount(template) {
      const steps = this.parseTemplateSteps(template)
      return steps.length
    }
  }
}
</script>

<style scoped>
.template-management {
  padding: 0px;
}

.operation-card, .template-list-card {
  margin-bottom: 10px;
}

.steps-container {
  max-height: 500px;
  overflow-y: auto;
}

.step-item {
  margin-bottom: 15px;
}

.step-item.readonly .step-actions {
  display: none;
}

.step-card {
  position: relative;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.step-number {
  font-weight: bold;
  color: #409eff;
  font-size: 16px;
}

.step-actions {
  display: flex;
  gap: 5px;
}

.add-step-btn {
  width: 100%;
  height: 50px;
  border: 2px dashed #d9d9d9;
  background: #fafafa;
  color: #666;
  border-radius: 6px;
  transition: all 0.3s;
}

.add-step-btn:hover {
  border-color: #409eff;
  color: #409eff;
  background: #f0f9ff;
}

.el-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.el-form-item {
  margin-bottom: 15px;
}

.dialog-footer {
  text-align: right;
}

.pagination-wrapper {
  text-align: right;
  margin-top: 10px;
}

.form-text {
  color: #606266;
  font-size: 14px;
  line-height: 32px;
  min-height: 32px;
  display: inline-block;
}

.description-text {
  line-height: 1.5;
  min-height: 60px;
  padding: 8px 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.view-content {
  padding: 20px 0;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin: 10px 0 15px 0;
}

.info-row {
  margin-bottom: 10px;
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: flex-start;
}

.info-item .label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
  flex-shrink: 0;
  margin-right: 10px;
}

.info-item .value {
  color: #303133;
  flex: 1;
  line-height: 1.4;
}

.info-item .value.description {
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 20px;
  line-height: 1.5;
}

.steps-view {
  margin-top: 10px;
}

.step-view-item {
  margin-bottom: 15px;
}

.step-view-card {
  border-left: 3px solid #409eff;
}

.step-view-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.step-view-header .step-number {
  font-weight: bold;
  color: #409eff;
  font-size: 16px;
  margin-right: 15px;
}

.step-view-header .step-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.step-view-content .info-item {
  margin-bottom: 12px;
}
</style>