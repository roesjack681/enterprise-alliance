<template>
  <view class="login-container">
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 顶部logo区域 -->
    <view class="header-section">
      <view class="logo-container">
        <image class="logo-bg" src="/static/logo.png"></image>
      </view>
      <view class="app-title">企业联盟</view>
      <view class="app-desc">连接企业，共创未来</view>
    </view>

    <!-- 登录方式切换 -->
    <view class="login-tabs">
		<view
		  class="tab-item" 
		  :class="{ active: activeTab === 'account' }"
		  @click="switchTab('account')"
		>
		  账号登录
		</view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'quick' }"
        @click="switchTab('quick')"
      >
        快捷登录
      </view>
      
    </view>

    <!-- 登录表单 -->
    <view class="form-container">
      <!-- 快捷登录 -->
      <view v-if="activeTab === 'quick'" class="form-content">
        <!-- 手机号输入 -->
        <view class="input-group">
          <u-icon name="account" color="#C0C0C0" size="40"></u-icon>
          <input 
            class="input-field" 
            type="number"
            placeholder="请输入手机号" 
            v-model="phoneForm.mobile"
            maxlength="11"
          />
        </view>

        <!-- 验证码输入 -->
        <view class="input-group">
          <u-icon name="lock" color="#C0C0C0" size="40"></u-icon>
          <input 
            class="input-field" 
            placeholder="请输入验证码" 
            v-model="phoneForm.code"
            maxlength="6"
          />
          <view 
            class="code-btn" 
            :class="{ disabled: codeDisabled }"
            @click="sendCode"
          >
            {{ codeText }}
          </view>
        </view>

        <!-- 登录按钮 -->
        <button 
          class="login-btn cu-btn bg-blue lg round"
          @click="phoneLogin"
          :disabled="!canPhoneLogin"
        >
          登录
        </button>

        <!-- 底部链接 -->
        <view class="footer-links">
          <text class="link-text" @click="forgotPassword">忘记密码?</text>
          <text class="link-text text-blue" @click="register">注册账号</text>
        </view>
      </view>

      <!-- 账号登录 -->
      <view v-else class="form-content">
        <!-- 用户名输入 -->
        <view class="input-group">
          <u-icon name="account" color="#C0C0C0" size="40"></u-icon>
          <input 
            class="input-field" 
            placeholder="请输入用户名/手机号" 
            v-model="accountForm.username"
          />
        </view>

        <!-- 密码输入 -->
        <view class="input-group">
          <u-icon name="lock" color="#C0C0C0" size="40"></u-icon>
          <input 
            class="input-field" 
            :password="!showPassword"
            placeholder="请输入密码" 
            v-model="accountForm.password"
          />
          <u-icon 
            :name="showPassword ? 'eye-off' : 'eye'" 
            color="#C0C0C0" 
            size="40"
            @click="togglePassword"
          ></u-icon>
        </view>

        <!-- 登录按钮 -->
        <button 
          class="login-btn cu-btn bg-blue lg round"
          @click="accountLogin"
          :disabled="!canAccountLogin"
        >
          登录
        </button>

        <!-- 底部链接 -->
        <view class="footer-links">
          <text class="link-text" @click="forgotPassword">忘记密码?</text>
          <text class="link-text text-blue" @click="register">注册账号</text>
        </view>
      </view>
    </view>

    <!-- 协议说明 -->
    <view class="agreement-text">
      登录即代表同意 
      <text class="text-blue" @click="showUserAgreement">《用户协议》</text> 
      和 
      <text class="text-blue" @click="showPrivacyPolicy">《隐私政策》</text>
    </view>
  </view>
</template>

<script>
	import { login, loginByCode, sendSmsCode } from '@/utils/api';
	import socket from '@/utils/socket.js';
export default {
  data() {
    return {
      statusBarHeight: 0,
      activeTab: 'account', // quick: 快捷登录, account: 账号登录
      showPassword: false,
      codeDisabled: false,
      codeText: '获取验证码',
      countdown: 60,
      // 手机登录表单
      phoneForm: {
        mobile: '',
        code: ''
      },
      // 账号登录表单
      accountForm: {
        username: '',
        password: ''
      }
    }
  },
  computed: {
    // 手机登录是否可用
    canPhoneLogin() {
      return this.phoneForm.mobile.length === 11 && this.phoneForm.code.length >= 4
    },
    // 账号登录是否可用
    canAccountLogin() {
      return this.accountForm.username.length > 0 && this.accountForm.password.length > 0
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
    
    // 切换登录方式
    switchTab(tab) {
      this.activeTab = tab
    },
    
    // 切换密码显示
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    
    // 发送验证码
    async sendCode() {
      if (this.codeDisabled) return
      
      if (!this.phoneForm.mobile) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return
      }
      
      if (!/^1[3-9]\d{9}$/.test(this.phoneForm.mobile)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      
      try {
        // 调用发送验证码接口
        const res = await sendSmsCode({ mobile: this.phoneForm.mobile, type: '2' })
        
        if (res) {
          uni.showToast({
            title: '验证码已发送',
            icon: 'success'
          })
          
          // 开始倒计时
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
    
    // 手机号登录
    async phoneLogin() {
      if (!this.canPhoneLogin) return
      
      try {
        uni.showLoading({ title: '登录中...' })
        
        // 调用验证码登录接口
        const data = {
          username: this.phoneForm.mobile,
          smsCode: this.phoneForm.code
        }
        
        loginByCode(data).then(res => {
          if (res.code === 0) {
            this.loginSuccessCallBack(res.data)
          } else {
            uni.showToast({
              title: res.msg || '登录失败',
              icon: 'none'
            })
          }
          uni.hideLoading()
        }).catch(error => {
          console.error('验证码登录错误:', error)
          uni.hideLoading()
          uni.showToast({
            title: error.data?.msg || '网络错误，请稍后重试',
            icon: 'none'
          })
        })
        
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        })
      }
    },
    loginSuccessCallBack(data){
    	uni.showToast({
    	  title: '登录成功',
    	  icon: 'success'
    	})
    	this.$store.commit('setToken', {token:data.token});
    	
    	// 登录成功后重新初始化socket连接
    	socket.reinitAfterLogin();
    	
    	setTimeout(()=>{ 
    		uni.reLaunch({
    			url:"/pages/my/my"
    		});
    	}, 1000)
    },
    // 账号密码登录
    async accountLogin() { 
      if (!this.canAccountLogin) return
      
      try {
        uni.showLoading({ title: '登录中...' })
        
        // 调用登录接口
		const data={
			username:this.accountForm.username,					
			pwd:this.accountForm.password
		} 		
		login(data).then(res => { 
			if (res.code===0) {				
				this.loginSuccessCallBack(res.data);
			}else{
				uni.showToast({
				  title: res.msg || '登录失败',
				  icon: 'none'
				})
			}
			uni.hideLoading()
		}).catch(error => {
			console.error('登录错误:', error);
			uni.hideLoading();
			uni.showToast({
				title: error.data?.msg || '网络错误，请稍后重试',
				icon: 'none'
			});
		});  
        
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        })
      }
    },
    
    // 忘记密码
    forgotPassword() {
      uni.navigateTo({
        url: '/pages/user/forgotPassword'
      })
    },
    
    // 注册账号
    register() {
      uni.navigateTo({
        url: '/pages/user/register'
      })
    },
    
    // 显示用户协议
    showUserAgreement() {
      uni.navigateTo({
        url: '/pages/agreement/user'
      })
    },
    
    // 显示隐私政策
    showPrivacyPolicy() {
      uni.navigateTo({
        url: '/pages/agreement/privacy'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/* 页面容器 */
.login-container {
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

/* 顶部logo区域 */
.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 80rpx;
}

.logo-container {
  margin-bottom: 40rpx;
}

.logo-bg {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
}

.app-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
}

.app-desc {
  font-size: 28rpx;
  color: #999999;
}

/* 登录方式切换 */
.login-tabs {
  display: flex;
  margin-bottom: 60rpx;
  position: relative;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 32rpx;
  color: #999999;
  position: relative;
  transition: all 0.3s ease;
  
  &.active {
    color: #409EFF;
    font-weight: 500;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background: #409EFF;
      border-radius: 2rpx;
    }
  }
}

/* 表单容器 */
.form-container {
  margin-bottom: 60rpx;
  
}

.form-content {
  animation: fadeIn 0.3s ease;
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
.input-group:focus-within {
 border: none;
   outline: none;
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

/* 登录按钮 */
.login-btn {
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
  justify-content: space-between;
  align-items: center;
  margin-top: 32rpx;
  margin-bottom: 0;
}

.link-text {
  font-size: 28rpx;
  color: #999999;
  
  &.text-blue {
    color: #4285f4;
  }
}

/* 协议说明 */
.agreement-text {
  font-size: 24rpx;
  color: #999999;
  text-align: center;
  margin-bottom: 40rpx;
  line-height: 1.5;
  margin-top:auto;
  .text-blue {
    color: #409EFF;
  }
}

/* 底部指示器 */
.bottom-indicator {
  width: 280rpx;
  height: 8rpx;
  background: #333333;
  border-radius: 4rpx;
  margin: 0 auto 40rpx;
}

/* 响应式适配 */
@media (max-width: 375px) {
  .login-container {
    padding: 0 32rpx;
  }
  
  .role-list {
    .role-item {
      min-width: 160rpx;
      padding: 24rpx 12rpx;
    }
  }
}
</style>