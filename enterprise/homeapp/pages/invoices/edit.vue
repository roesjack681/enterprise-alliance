<template>
  <view class="invoice-edit-page">
    <!-- 表单卡片 -->
    <view class="form-card">
      <u-form
        :model="formData"
        ref="uForm"
        :rules="rules"
        error-type="toast"
      >
        <!-- 发票抬头 -->
        <u-form-item 
          label="发票抬头" 
          prop="title" 
          required
          label-width="140"
        >
          <u-input 
            v-model="formData.title" 
            placeholder="请输入发票抬头"
            maxlength="200"
            :clearable="true"
            border="none"
          ></u-input>
        </u-form-item>

        <!-- 纳税人识别号 -->
        <u-form-item 
          label="纳税人识别号" 
          prop="tax_number" 
          required
          label-width="140"
        >
          <u-input 
            v-model="formData.tax_number" 
            placeholder="请输入纳税人识别号"
            maxlength="30"
            :clearable="true"
            border="none"
          ></u-input>
        </u-form-item>

        <!-- 发票类型 -->
        <u-form-item 
          label="发票类型" 
          prop="invoice_type" 
          required
          label-width="140"
          @click="showInvoiceTypePicker = true"
        >
          <u-input 
            :value="invoiceTypeName" 
            placeholder="请选择发票类型"
            :disabled="false"
            suffix-icon="arrow-right"
            :clearable="false"
            border="none"
            :custom-style="{ textAlign: 'right', backgroundColor: 'transparent' }"
            suffix-icon-style="color: #c0c4cc"
            readonly
          ></u-input>
        </u-form-item>

        <!-- 公司地址 -->
        <u-form-item 
          label="公司地址" 
          prop="company_address" 
          label-width="140"
        >
          <u-input 
            v-model="formData.company_address" 
            placeholder="请输入公司地址（选填）"
            maxlength="255"
            :clearable="true"
            border="none"
          ></u-input>
        </u-form-item>

        <!-- 公司电话 -->
        <u-form-item 
          label="公司电话" 
          prop="company_phone" 
          label-width="140"
        >
          <u-input 
            v-model="formData.company_phone" 
            placeholder="请输入公司电话（选填）"
            maxlength="20"
            :clearable="true"
            border="none"
          ></u-input>
        </u-form-item>

        <!-- 开户银行 -->
        <u-form-item 
          label="开户银行" 
          prop="bank_name" 
          label-width="140"
        >
          <u-input 
            v-model="formData.bank_name" 
            placeholder="请输入开户银行（选填）"
            maxlength="100"
            :clearable="true"
            border="none"
          ></u-input>
        </u-form-item>

        <!-- 银行账号 -->
        <u-form-item 
          label="银行账号" 
          prop="bank_account" 
          label-width="140"
        >
          <u-input 
            v-model="formData.bank_account" 
            placeholder="请输入银行账号（选填）"
            maxlength="50"
            :clearable="true"
            border="none"
          ></u-input>
        </u-form-item>

        <!-- 设为默认 -->
        <u-form-item 
          label="设为默认" 
          prop="is_default" 
          label-width="140"
        >
          <u-switch 
            v-model="formData.is_default" 
            active-value="1" 
            inactive-value="0"
            size="40"
            :custom-style="{ activeColor: '#3D6AFF' }"
          ></u-switch>
        </u-form-item>
      </u-form>
    </view>

    <!-- 提示信息 -->
    <view class="tips-card">
      <view class="tips-title">
        <u-icon name="info-circle" size="32rpx" color="#3D6AFF"></u-icon>
        <text>填写说明</text>
      </view>
      <view class="tips-content">
        <text>• 发票抬头和纳税人识别号为必填项</text>
        <text>• 增值税专用发票需要填写完整的企业信息</text>
        <text>• 设为默认发票后，下单时会自动选择此发票</text>
        <text>• 每个账户只能有一个默认发票</text>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <u-button 
        type="default" 
        shape="circle" 
        size="large"
        @click="goBack"
        class="cancel-btn"
      >
        取消
      </u-button>
      <u-button 
        type="primary" 
        shape="circle" 
        size="large"
        :loading="submitting"
        @click="submitForm"
        :custom-style="{ backgroundColor: '#3D6AFF', borderColor: '#3D6AFF' }"
        class="submit-btn"
      >
        {{ isEdit ? '保存' : '创建' }}
      </u-button>
    </view>

    <!-- 发票类型选择器 -->
    <u-picker 
      :show="showInvoiceTypePicker" 
      :columns="invoiceTypeColumns" 
      keyName="label"
      @confirm="onInvoiceTypeConfirm" 
      @cancel="showInvoiceTypePicker = false"
      @close="showInvoiceTypePicker = false"
      confirmText="确认"
      cancelText="取消"
    ></u-picker>
  </view>
</template>

<script>
import { createInvoice, updateInvoice, getInvoiceDetail } from '@/utils/api'

export default {
  data() {
    return {
      isEdit: false,
      invoiceId: null,
      fromSelect: false, // 是否从选择页面进入
      submitting: false,
      showInvoiceTypePicker: false,
      formData: {
        title: '',
        tax_number: '',
        invoice_type: 1,
        company_address: '',
        company_phone: '',
        bank_name: '',
        bank_account: '',
        is_default: '0'
      },
      rules: {
        title: [
          {
            required: true,
            message: '请输入发票抬头',
            trigger: ['blur', 'change']
          },
          {
            max: 200,
            message: '发票抬头长度不能超过200个字符',
            trigger: ['blur', 'change']
          }
        ],
        tax_number: [
          {
            required: true,
            message: '请输入纳税人识别号',
            trigger: ['blur', 'change']
          },
          {
            max: 30,
            message: '纳税人识别号长度不能超过30个字符',
            trigger: ['blur', 'change']
          }
        ],
        invoice_type: [
          {
            required: true,
            message: '请选择发票类型',
            trigger: ['blur', 'change'],
            validator: (rule, value, callback) => {
              if (!value || (value !== 1 && value !== 2)) {
                callback(new Error('请选择发票类型'))
              } else {
                callback()
              }
            }
          }
        ],
        company_address: [
          {
            max: 255,
            message: '公司地址长度不能超过255个字符',
            trigger: ['blur', 'change']
          }
        ],
        company_phone: [
          {
            max: 20,
            message: '公司电话长度不能超过20个字符',
            trigger: ['blur', 'change']
          }
        ],
        bank_name: [
          {
            max: 100,
            message: '开户银行长度不能超过100个字符',
            trigger: ['blur', 'change']
          }
        ],
        bank_account: [
          {
            max: 50,
            message: '银行账号长度不能超过50个字符',
            trigger: ['blur', 'change']
          }
        ]
      },
      invoiceTypeColumns: [[
        { label: '普通发票', value: 1 },
        { label: '增值税专用发票', value: 2 }
      ]]
    }
  },
  computed: {
    invoiceTypeName() {
      const type = this.invoiceTypeColumns[0].find(item => item.value === this.formData.invoice_type)
      return type ? type.label : ''
    }
  },
  onLoad(options) {
    if (options.id) {
      this.isEdit = true
      this.invoiceId = options.id
      this.loadInvoiceDetail()
    }
    
    // 检查是否从选择页面进入
    if (options.fromSelect) {
      this.fromSelect = true
    }
    
    // 设置导航栏标题
    uni.setNavigationBarTitle({
      title: this.isEdit ? '编辑发票' : '添加发票'
    })
  },
  methods: {
    // 加载发票详情
    async loadInvoiceDetail() {
      try {
        const response = await getInvoiceDetail({ id: this.invoiceId })
        
        if (response.code === 0) {
          const data = response.data
          this.formData = {
            title: data.title,
            tax_number: data.tax_number,
            invoice_type: data.invoice_type,
            company_address: data.company_address || '',
            company_phone: data.company_phone || '',
            bank_name: data.bank_name || '',
            bank_account: data.bank_account || '',
            is_default: data.is_default.toString()
          }
        } else {
          this.$u.toast(response.msg || '获取发票详情失败')
          // 暂时注释掉自动返回，允许用户手动返回
          // this.goBack()
        }
      } catch (error) {
        console.error('获取发票详情失败:', error)
        this.$u.toast('网络错误，请重试')
        // 暂时注释掉自动返回，允许用户手动返回
        // this.goBack()
      }
    },

    // 发票类型选择确认
    onInvoiceTypeConfirm(value) {
      this.formData.invoice_type = value.value[0].value
      this.showInvoiceTypePicker = false
      
      // 手动触发表单验证
      this.$nextTick(() => {
        this.$refs.uForm.validateField('invoice_type')
      })
    },

    // 提交表单
    async submitForm() {
      // 表单验证
      try {
        const valid = await this.$refs.uForm.validate()
        if (!valid) {
          return
        }
      } catch (errors) {
        // 验证失败，errors是验证错误数组
        if (Array.isArray(errors) && errors.length > 0) {
          // 显示第一个错误信息
          this.$u.toast(errors[0].message)
        }
        return
      }

      this.submitting = true

      try {
        const submitData = {
          ...this.formData,
          invoice_type: Number(this.formData.invoice_type),
          is_default: Number(this.formData.is_default)
        }

        let response
        if (this.isEdit) {
          response = await updateInvoice({
            id: this.invoiceId,
            ...submitData
          })
        } else {
          response = await createInvoice(submitData)
        }

        if (response.code === 0) {
          this.$u.toast(this.isEdit ? '保存成功' : '创建成功')
          setTimeout(() => {
            this.goBack()
          }, 1500)
        } else {
          this.$u.toast(response.msg || '操作失败')
        }
      } catch (error) {
        console.error('提交表单失败:', error)
        this.$u.toast('网络错误，请重试')
      } finally {
        this.submitting = false
      }
    },

    // 返回上一页
    goBack() {
      if (this.fromSelect) {
        // 如果是从选择页面进入，返回选择页面
        uni.navigateBack()
      } else {
        // 否则返回列表页面
        uni.navigateBack()
      }
    }
  }
}
</script>

<style scoped>
.invoice-edit-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 140rpx;
}

.form-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.tips-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.tips-title {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #303133;
}

.tips-title text {
  margin-left: 8rpx;
}

.tips-content {
  font-size: 26rpx;
  color: #606266;
  line-height: 1.6;
}

.tips-content text {
  display: block;
  margin-bottom: 8rpx;
}

.tips-content text:last-child {
  margin-bottom: 0;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  z-index: 10;
  border-top: 1rpx solid #eee;
}

/deep/ .cancel-btn {
  width: 200rpx !important;
  margin-right: 24rpx;
  height: 88rpx !important;
}

/deep/ .submit-btn {
  flex: 1;
  height: 88rpx !important;
}

/* 表单项样式优化 */
/deep/ .u-form-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

/deep/ .u-form-item:last-child {
  border-bottom: none;
}

/deep/ .u-form-item__label {
  color: #303133;
  font-weight: 500;
  font-size: 28rpx;
}

/deep/ .u-input__content {
  background-color: transparent !important;
  border: none;
  padding: 0;
  font-size: 28rpx;
  display: flex;
  align-items: center;
}

/deep/ .u-input__content--disabled {
  background-color: transparent !important;
}

/deep/ .u-input[readonly] .u-input__content {
  background-color: transparent !important;
}

/deep/ .u-input__content__field-wrapper {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/deep/ .u-input__content__field-wrapper__field {
  text-align: right;
  color: #303133;
  width: 100%;
  min-width: 0;
}

/deep/ .u-input__content__field-wrapper__field::placeholder {
  color: #c0c4cc;
  font-size: 26rpx;
}

/deep/ .u-input__content__suffix-icon {
  color: #c0c4cc !important;
  margin-left: 8rpx;
  font-size: 24rpx;
}

/deep/ .u-switch {
  transform: scale(0.9);
}
</style>