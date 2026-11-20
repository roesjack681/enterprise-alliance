<template>
  <view class="settings-page">
    <view class="settings-card">
      <u-cell-group :border="false">
		<u-cell title="编辑资料" isLink @click="goTo('/pages/my/editUser')">
		  <template #icon>
		    <view class="icon-wrap">
		      <u-icon name="account" :size="40" color="#606266" />
		    </view>
		  </template>
		</u-cell>
        <u-cell title="修改密码" isLink @click="goTo('/pages/my/changePassword')">
          <template #icon>
            <view class="icon-wrap">
              <u-icon name="lock" :size="40" color="#606266" />
            </view>
          </template>
        </u-cell>

        <!-- <u-cell title="修改邮箱" isLink :border="false" @click="goTo('/pages/my/changeEmail')">
          <template #icon>
            <view class="icon-wrap">
              <u-icon name="email" :size="40" color="#606266" />
            </view>
          </template>
        </u-cell> -->
		<u-cell title="编辑企业资料" isLink @click="goTo('/pages/entity/edit')">
		  <template #icon>
		    <view class="icon-wrap">
		      <u-icon name="account-fill" :size="40" color="#606266" />
		    </view>
		  </template>
		</u-cell>
		<u-cell title="发票管理" isLink @click="goTo('/pages/invoices/select')">
		  <template #icon>
		    <view class="icon-wrap">
		      <u-icon name="file-text" :size="40" color="#606266" />
		    </view>
		  </template>
		</u-cell> 
	  </u-cell-group>
	</view>
	 
	<!-- 其他设置 -->
	<view class="settings-card" style="margin-top: 30rpx;">
		<u-cell-group :border="false">
		
        <u-cell title="关于我们" isLink @click="goTo('/pages/about')">
          <template #icon>
            <view class="icon-wrap">
              <u-icon name="info-circle" :size="40" color="#606266" />
            </view>
          </template>
        </u-cell> 
		
        <u-cell title="联系我们" isLink @click="goTo('/pages/contact')">
          <template #icon>
            <view class="icon-wrap">
              <u-icon name="kefu-ermai" :size="40" color="#606266" />
            </view>
          </template>
        </u-cell>
		<u-cell title="隐私政策" isLink @click="goTo('/pages/privacy')">
		  <template #icon>
		    <view class="icon-wrap">
		      <u-icon name="file-text" :size="40" color="#606266" />
		    </view>
		  </template>
		</u-cell>
		<u-cell @click="languageShow = true" title="多语言设置" :isLink="false" :border="false">
		  <template #icon>
		    <view class="icon-wrap">
		      <u-icon name="setting" :size="40" color="#606266" />
		    </view>
		  </template>
		  <template #value>
		    <text class="version-text">{{curlang}}</text>
		  </template>
		</u-cell>        
      </u-cell-group>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-wrap">
      <u-button  shape="circle" @click="logout" style="font-weight: 600;">
       退出登录
      </u-button>
    </view>
	<u-picker :show="languageShow" :columns="langs" keyName="label" @confirm="languageChange" @cancel="languageShow = false" @close="languageShow = false" :confirmText="$t('common.confirmText')" :cancelText="$t('common.cancelText')"></u-picker>
		
  </view>
</template>

<script>
export default {
	data() {
		return {
		  userInfo: null,
		  langs: [[
		  	{ label: '中文-简体', id: 'zh_CN' },
		  	// { label: '中文-繁体', id: 'zh_TW' },
		  	// { label: 'English', id: 'en_US' },
		  	// { label: '日本語', id: 'ja_JP' },
		  	// { label: '한국어', id: 'ko_KR' },					
		  ]],
		  curlang:'中文-简体',
		  languageShow: false,
		};
  },
  onLoad() {  	
	const lang=uni.getStorageSync("language");
	this.curlang=this.getLangLabelById(lang) 
  },
  methods: {
    goTo(url) {
      uni.navigateTo({ url });
    },
	// 语言设置
	languageChange (cur) {
		this.$C.setLanguage(cur.value[0].id);
		this.curlang=cur.value[0].label
		this.languageShow = false;
	},
	getLangLabelById(id) {
		const langs=this.langs[0];
		const lang = langs.find(item => item.id === id);
		return lang ? lang.label : '中文-简体';
	},
    logout() {
      uni.showModal({
        title:'退出登录',
        confirmText: '确认',
        success: res => {
          if (res.confirm) {
            this.$store.commit('logout')
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.settings-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding:24rpx;
}

.settings-card { 
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
  
}

.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  margin-right: 12rpx;
}

.version-text {
  font-size: 26rpx;
  color: #909399;
}

.logout-wrap {
  margin-top: 60rpx;
  padding: 0 40rpx;
}
</style>
