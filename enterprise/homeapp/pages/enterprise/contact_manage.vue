<template>
  <view class="page">
    <!-- 导航栏 -->
    <u-navbar 
      title="编辑联系信息" 
      :border-bottom="true"
      :background="{ backgroundColor: '#ffffff' }"
      :title-style="{ color: '#333333', fontSize: '32rpx', fontWeight: 'bold' }"
      left-icon="arrow-left"
      @leftClick="goBack"
    />
    
    <!-- 主要内容区域 -->
    <view class="content">
      
      <!-- 联系方式卡片 -->
      <view class="card-container">
        <view class="card">
          <view class="card-title">联系方式</view>
          <!-- 联系人 -->
          <view class="form-item">
            <view class="label">联系人</view>
            <u-input 
              v-model="formData.contactPerson" 
              placeholder="请输入联系人"
              :border="false"
              :custom-style="inputStyle"
            />
          </view>
          
          <!-- 联系电话 -->
          <view class="form-item">
            <view class="label">联系电话</view>
            <u-input 
              v-model="formData.phone" 
              placeholder="请输入联系电话"
              :border="false"
              :custom-style="inputStyle"
            />
          </view>
          
          <!-- 电子邮箱 -->
          <view class="form-item">
            <view class="label">电子邮箱</view>
            <u-input 
              v-model="formData.email" 
              placeholder="请输入电子邮箱"
              :border="false"
              :custom-style="inputStyle"
            />
          </view>
          
          <!-- 公司网址 -->
          <view class="form-item">
            <view class="label">公司网址</view>
            <u-input 
              v-model="formData.website" 
              placeholder="请输入公司网址"
              :border="false"
              :custom-style="inputStyle"
            />
          </view>
          
          <!-- 工作时间 -->
          <view class="form-item">
            <view class="label">工作时间</view>
            <u-input 
              v-model="formData.workTime" 
              placeholder="请输入工作时间，如周一至周五 9:00-18:00"
              :border="false"
              :custom-style="inputStyle"
            />
          </view>
          <!-- 微信号 -->
          <view class="form-item">
            <view class="label">微信号</view>
            <u-input 
              v-model="formData.wechat" 
              placeholder="请输入微信号"
              :border="false"
              :custom-style="inputStyle"
            />
          </view>
          <!-- QQ号 -->
          <view class="form-item">
            <view class="label">QQ号</view>
            <u-input 
              v-model="formData.qq" 
              placeholder="请输入QQ号"
              :border="false"
              :custom-style="inputStyle"
            />
          </view>
        </view>
      </view>
      
      <!-- 公司地址卡片 -->
      <view class="card-container">
        <view class="card">
          <view class="card-title">公司地址</view>
          
          <!-- 详细地址 -->
          <view class="form-item">
            <view class="label">详细地址</view>
            <u-input 
              v-model="formData.address" 
              placeholder="请输入详细地址"
              :border="false"
              :custom-style="inputStyle"
            />
          </view>
          

        </view>
      </view>
    </view>
    
    <!-- 底部保存按钮 -->
    <view class="footer">
      <u-button 
        type="primary" 
        :custom-style="saveButtonStyle"
        @click="saveInfo"
        :loading="loading"
      >
        保存修改
      </u-button>
    </view>
  </view>
</template>

<script>
import { getContact, upsertContact } from '@/utils/api.js';

export default {
  name: 'EditContactInfo',
  data() {
    return {
      userInfo: {},
      enterpriseId: 0,
      loading: false,
      
      formData: {
        contactPerson: '', // 新增联系人
        phone: '',
        email: '',
        website: '',
        wechat: '', // 新增微信号
        qq: '',     // 新增QQ号
        workTime: '',
        address: ''
      },
      
      provinceList: ['北京市', '上海市', '广东省', '江苏省', '浙江省'],
      cityList: ['北京市', '朝阳区', '海淀区', '西城区', '东城区'],
      districtList: ['朝阳区', '海淀区', '西城区', '东城区', '丰台区'],
      
      markers: [],
      
      // 样式配置
      inputStyle: {
        backgroundColor: '#F8F9FA',
        borderRadius: '16rpx',
        padding: '24rpx',
        fontSize: '28rpx',
        color: '#333333'
      },
      
      textareaStyle: {
        backgroundColor: '#F8F9FA',
        borderRadius: '16rpx',
        padding: '24rpx',
        fontSize: '28rpx',
        color: '#333333',
        minHeight: '200rpx'
      },
      
      saveButtonStyle: {
        backgroundColor: '#3D6AFF',
        borderRadius: '16rpx',
        fontSize: '32rpx',
        fontWeight: 'bold',
        height: '88rpx'
      }
    }
  },
  created() {
    this.userInfo = uni.getStorageSync('$userinfo');
    this.enterpriseId = this.userInfo?.id || null;
    this.fetchContact();
  },
  
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 上传logo
    uploadLogo() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.formData.companyLogo = res.tempFilePaths[0]
        },
        fail: (err) => {
          console.log('选择图片失败:', err)
        }
      })
    },
    
    // 选择省份
    selectProvince(e) {
      this.formData.province = this.provinceList[e.value]
      this.showProvince = false
    },
    
    // 选择城市
    selectCity(e) {
      this.formData.city = this.cityList[e.value]
      this.showCity = false
    },
    
    // 选择区县
    selectDistrict(e) {
      this.formData.district = this.districtList[e.value]
      this.showDistrict = false
    },

    async fetchContact() {
      this.loading = true;
      try {
        const res = await getContact({ enterpriseId: this.enterpriseId });
        if (res.code === 0 && res.data) {
          this.formData = {
            contactPerson: res.data.contact_person || '',
            phone: res.data.phone || '',
            email: res.data.email || '',
            website: res.data.website || '',
            wechat: res.data.wechat || '',
            qq: res.data.qq || '',
            workTime: res.data.work_time || '',
            address: res.data.address || ''
          }
        }
      } finally {
        this.loading = false;
      }
    },
    
    // 保存信息
    async saveInfo() {
      this.loading = true
      
      try {
        // 表单验证
        if (!this.formData.phone) {
          uni.showToast({
            title: '请输入联系电话',
            icon: 'none'
          })
          return
        }
        
        const payload = {
          contact_person: this.formData.contactPerson,
          phone: this.formData.phone,
          email: this.formData.email,
          website: this.formData.website,
          wechat: this.formData.wechat,
          qq: this.formData.qq,
          work_time: this.formData.workTime,
          address: this.formData.address
        };
        const res = await upsertContact(payload);
        if (res.code === 0) {
          uni.showToast({ title: '保存成功', icon: 'success' });
          setTimeout(() => uni.navigateBack(), 1500);
        } else {
          uni.showToast({ title: res.msg || '保存失败', icon: 'none' });
        }
        
      } catch (error) {
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  background-color: #F5F6FA;
  min-height: 100vh;
  padding-bottom: 140rpx;
}

.content {
  padding: 20rpx;
}

.card-container {
  margin-bottom: 20rpx;
}

.card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 32rpx;
}

.form-item {
  margin-bottom: 32rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

// Logo上传样式
.logo-upload {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo-container {
  position: relative;
}

.logo-preview {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  background-color: #F8F9FA;
  border: 2rpx solid #E5E7EB;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #3D6AFF;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #3D6AFF;
}

.upload-btn {
  margin-left: 24rpx;
  background-color: #F8F9FA;
  border-radius: 16rpx;
  padding: 16rpx 32rpx;
  border: 2rpx solid #E5E7EB;
  transition: all 0.3s;
  
  &:active {
    background-color: #E5E7EB;
    transform: scale(0.98);
  }
}

.upload-text {
  font-size: 28rpx;
  color: #666666;
  font-weight: 500;
}

// 地区选择器样式
.location-selectors {
  display: flex;
  gap: 20rpx;
}

.picker-item {
  flex: 1;
  background-color: #F8F9FA;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.picker-text {
  font-size: 28rpx;
  color: #333333;
}

// 底部按钮样式
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 26rpx 40rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
}

// 深度样式覆盖
::v-deep .u-textarea {
  background-color: #F8F9FA !important;
  border-radius: 16rpx !important;
  
  .u-textarea__wrapper {
    background-color: #F8F9FA !important;
    border-radius: 16rpx !important;
    padding: 24rpx !important;
  }
  
  .u-textarea__wrapper__textarea {
    font-size: 28rpx !important;
    color: #333333 !important;
    min-height: 200rpx !important;
  }
  
  .u-textarea__wrapper__placeholder {
    color: #999999 !important;
  }
  
  .u-textarea__wrapper__count {
    color: #999999 !important;
    font-size: 24rpx !important;
  }
}

::v-deep .u-navbar__content__title {
  font-weight: bold !important;
}

::v-deep .u-button--primary {
  background: linear-gradient(135deg, #3D6AFF 0%, #5B7CFF 100%) !important;
}
</style>