<template>
  <view class="register-container">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 注册表单 -->
    <view class="form-container">
      <view class="form-content">
        <view class="form-title">注册账号</view>
        
        <!-- 注册类型选择 -->
        <view class="role-selector">
          <view 
            class="role-option" 
            :class="{ active: role === 8 }"
            @click="selectRole(8)"
          >
            <u-icon name="home" :color="role === 8 ? '#409EFF' : '#C0C0C0'" size="40"></u-icon>
            <text class="role-text">企业注册</text>
          </view>
          <view 
            class="role-option" 
            :class="{ active: role === 7 }"
            @click="selectRole(7)"
          >
            <u-icon name="setting" :color="role === 7 ? '#409EFF' : '#C0C0C0'" size="40"></u-icon>
            <text class="role-text">服务商注册</text>
          </view>
          <view 
            class="role-option" 
            :class="{ active: role === 10 }"
            @click="selectRole(10)"
          >
            <u-icon name="star" :color="role === 10 ? '#409EFF' : '#C0C0C0'" size="40"></u-icon>
            <text class="role-text">经纪人注册</text>
          </view>
        </view>
        
        <!-- 手机号输入 -->
        <view class="input-group">
          <u-icon name="phone" color="#C0C0C0" size="40"></u-icon>
          <input 
            class="input-field" 
            type="number"
            placeholder="请输入手机号" 
            v-model="username"
            maxlength="11"
          />
        </view>

        <!-- 密码输入 -->
        <view class="input-group">
          <u-icon name="lock" color="#C0C0C0" size="40"></u-icon>
          <input 
            class="input-field" 
            :password="!showPassword"
            placeholder="请输入密码" 
            v-model="password"
          />
          <u-icon 
            :name="showPassword ? 'eye-off' : 'eye'" 
            color="#C0C0C0" 
            size="40"
            @click="togglePassword"
          ></u-icon>
        </view>

        <!-- 验证码输入 -->
        <view class="input-group">
          <u-icon name="lock" color="#C0C0C0" size="40"></u-icon>
          <input 
            class="input-field" 
            type="number"
            placeholder="请输入验证码" 
            v-model="verCode"
            maxlength="6"
          />
          <view 
            class="code-btn" 
            :class="{ disabled: codeDisabled }"
            @click="getVerCode"
          >
            {{ codeText }}
          </view>
        </view>

        <!-- 邀请码输入 -->
        <view class="input-group">
          <u-icon name="gift" color="#C0C0C0" size="40"></u-icon>
          <input 
            class="input-field" 
            type="text" 
            disabled
            placeholder="邀请码" 
            v-model="inviteCode"
          />
        </view>

        <!-- 注册按钮 -->
        <button 
          class="register-btn cu-btn bg-blue lg round"
          @click="goRegister"
          :disabled="!canRegister"
        >
          注册
        </button>

        <!-- 底部链接 -->
        <view class="footer-links">
          <text class="link-text">已有账号？</text>
          <text class="link-text text-blue" @click="gologin">立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {checkStr,msg} from '@/utils/util'
import { sendSmsCode, register } from '@/utils/api';

export default {
  data() {
    return {
      statusBarHeight: 0,
      role: 8, // 注册类型：7-服务商，8-企业，10-经纪人，默认企业
      username: '', // 手机号
      password: '', // 密码
      verCode: '', // 验证码
      inviteCode: '', // 邀请码
      showPassword: false,
      codeDisabled: false,
      codeText: '获取验证码',
      countdown: 60,
      isRotate: false
    }
  },
  computed: {
    // 注册是否可用
    canRegister() {
      return this.username.length > 0 && 
             this.password.length >= 6 && 
             this.verCode.length === 6
    }
  },
  onLoad() {
    this.getSystemInfo()
    this.inviteCode = uni.getStorageSync('inviteCode')
  },
  methods: {
    // 选择注册类型
    selectRole(roleType) {
      this.role = roleType
    },
    
    // 获取系统信息
    getSystemInfo() {
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight || 20
    },
    
    // 切换密码显示
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    
    // 发送验证码
    async getVerCode() {
      if (this.codeDisabled) return
      
      if (!this.username) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return
      }
      
      if (!checkStr(this.username, 'phone')) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      
      try {
        const res = await sendSmsCode({mobile: this.username, type: '0'})
        if (res) {
          uni.showToast({
            title: '验证码已发送',
            icon: 'success'
          })
          this.startCountdown()
        }
      } catch (error) {
        uni.showToast({
          title: error.message || '发送失败',
          icon: 'none'
        })
      }
    },
    
    // 开始倒计时
    startCountdown() {
      this.codeDisabled = true
      this.countdown = 60
      this.codeText = `${this.countdown}s`
      
      const timer = setInterval(() => {
        this.countdown--
        this.codeText = `${this.countdown}s`
        
        if (this.countdown <= 0) {
          clearInterval(timer)
          this.codeDisabled = false
          this.codeText = '获取验证码'
        }
      }, 1000)
    },
    
    // 注册
    async goRegister() {
      if (!this.canRegister) return
      
      const {username, password, verCode} = this
      
      if (!checkStr(username, 'phone')) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      
      if (password.length < 6) {
        uni.showToast({
          title: '密码长度不能少于6位',
          icon: 'none'
        })
        return
      }
      
      if (verCode.length !== 6) {
        uni.showToast({
          title: '请输入6位验证码',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({ title: '注册中...' })
        
        const data = {
          //username: username,
          mobile: username,
          smsCode: verCode,
          password: password,
          role_type: this.role,
          referrer: this.inviteCode
        }
        
        const res = await register(data)
        if (res) {
          uni.hideLoading()
          uni.showToast({
            title: '注册成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            this.gologin()
          }, 1500)
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '注册失败',
          icon: 'none'
        })
      }
    },
    
    // 跳转到登录
    gologin() {
      uni.navigateTo({
        url: './login'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/* 页面容器 */
.register-container {
  min-height: 94vh;
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
  padding: 0 40rpx;
  display: flex;
  flex-direction: column;
}

/* 状态栏占位 */
.status-bar {
  width: 100%;
}

/* 注册表单 */
.form-container {
  margin-bottom: 60rpx;
  padding-top: 80rpx;
}

.form-content {
  animation: fadeIn 0.3s ease;
}

.form-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
  text-align: center;
  margin-bottom: 48rpx;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* 注册类型选择器 */
.role-selector {
  display: flex;
  justify-content: space-between;
  margin-bottom: 48rpx;
  gap: 16rpx;
  flex-wrap: wrap;
}

.role-option {
  flex: 1;
  min-width: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 12rpx;
  padding: 24rpx 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &.active {
    border-color: #409EFF;
    background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
    box-shadow: 0 4rpx 16rpx rgba(66, 133, 244, 0.15);
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.role-text {
  font-size: 24rpx;
  color: #666666;
  margin-top: 12rpx;
  font-weight: 500;
  text-align: center;
  
  .role-option.active & {
    color: #409EFF;
    font-weight: 600;
  }
}

/* 输入框组 */
.input-group {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 12rpx;
  padding: 0 32rpx;
  margin-bottom: 32rpx;
  height: 88rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  
  &:focus-within {
    border-color: #409EFF;
    box-shadow: 0 4rpx 16rpx rgba(66, 133, 244, 0.15);
  }
}

.input-field {
  flex: 1;
  font-size: 32rpx;
  color: #333333;
  margin-left: 24rpx;
  border: none;
  outline: none;
  
  &::placeholder {
    color: #C0C0C0;
  }
}

.code-btn {
  font-size: 28rpx;
  color: #409EFF;
  padding: 12rpx 20rpx;
  border-left: 1rpx solid #e5e5e5;
  margin-left: 20rpx;
  white-space: nowrap;
  transition: opacity 0.3s ease;
  
  &.disabled {
    color: #999999;
    opacity: 0.6;
  }
}

/* 注册按钮 */
.register-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #409EFF 0%, #1976d2 100%);
  border-radius: 12rpx;
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 500;
  box-shadow: 0 4rpx 16rpx rgba(66, 133, 244, 0.3);
  transition: all 0.3s ease;
  
  &:active {
    transform: translateY(2rpx);
  }
  
  &[disabled] {
    background: #e5e5e5;
    color: #999999;
    box-shadow: none;
  }
}

/* 底部链接 */
.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 32rpx;
  gap: 8rpx;
}

.link-text {
  font-size: 28rpx;
  color: #999999;
  
  &.text-blue {
    color: #4285f4;
  }
}

/* 响应式适配 */
@media (max-width: 375px) {
  .register-container {
    padding: 0 32rpx;
  }
}
</style>
