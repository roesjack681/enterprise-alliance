<template>
  <view class="forgot-container">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 忘记密码表单 -->
    <view class="form-container">
      <view class="form-content">
        <view class="form-title">重置密码</view>
        
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

        <!-- 新密码输入 -->
        <view class="input-group">
          <u-icon name="lock" color="#C0C0C0" size="40"></u-icon>
          <input 
            class="input-field" 
            :password="!showPassword"
            placeholder="请输入新密码" 
            v-model="password"
          />
          <u-icon 
            :name="showPassword ? 'eye-off' : 'eye'" 
            color="#C0C0C0" 
            size="40"
            @click="togglePassword"
          ></u-icon>
        </view>

        <!-- 重置按钮 -->
        <button 
          class="reset-btn cu-btn bg-blue lg round"
          @click="submit"
          :disabled="!canReset"
        >
          重置密码
        </button>

        <!-- 底部链接 -->
        <view class="footer-links">
          <text class="link-text">记起密码了？</text>
          <text class="link-text text-blue" @click="gologin">立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {checkStr,msg} from '@/utils/util'
import { sendSmsCode, forgotPassword } from '@/utils/api.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      username: '', // 手机号
      password: '', // 新密码
      verCode: '', // 验证码
      showPassword: false,
      codeDisabled: false,
      codeText: '获取验证码',
      countdown: 60,
      isRotate: false
    }
  },
  computed: {
    // 重置是否可用
    canReset() {
      return this.username.length > 0 && 
             this.password.length >= 6 && 
             this.verCode.length === 6
    }
  },
  onLoad() {
    this.getSystemInfo()
  },
  methods: {
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
        const res = await sendSmsCode({mobile: this.username, type: '1'})
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
    
    // 重置密码
    async submit() {
      if (!this.canReset) return
      
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
        uni.showLoading({ title: '重置中...' })
        
        const data = {
          username: username,
          smsCode: verCode,
          newPwd: password
        }
        
        const res = await forgotPassword(data)
        if (res) {
          uni.hideLoading()
          uni.showToast({
            title: '密码重置成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            this.gologin()
          }, 1500)
        }
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '重置失败',
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
.forgot-container {
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

/* 忘记密码表单 */
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

/* 重置按钮 */
.reset-btn {
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
  .forgot-container {
    padding: 0 32rpx;
  }
}
</style>
