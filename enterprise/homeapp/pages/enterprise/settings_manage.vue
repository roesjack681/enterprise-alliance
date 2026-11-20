<template>
  <view class="container">
    
    <!-- 内容区域 -->
    <view class="content" v-if="!loading">
      <!-- 基本信息 -->
      <view class="section">
        <view class="info-card">
          <view class="card-title">基本信息</view>
          <view class="info-row">
            <text class="info-label">企业</text>
            <text class="info-value">{{ userInfo.id || '--' }}</text>
          </view>
          <view class="info-row">
            <text class="info-desc">创建时间：{{ formatDate(settings.created_at) }}</text>
          </view>
          <view class="info-row">
            <text class="info-desc">更新时间：{{ formatDate(settings.updated_at) }}</text>
          </view>
        </view>
      </view>

      <!-- 模块显示设置 -->
      <view class="section">
        <view class="settings-card">
          <view class="card-title">模块显示设置</view>
          <view class="setting-item" v-for="(item, index) in displaySettings" :key="index">
            <text class="setting-label">{{ item.label }}</text>
            <u-switch
              v-model="item.value"
              :active-color="'#3D6AFF'"
              :inactive-color="'#E4E7ED'"
              size="50"
              @change="onSwitchChange(item, index)"
            ></u-switch>
          </view>
        </view>
      </view>

      <!-- SEO设置 -->
      <view class="section">
        <view class="seo-card">
          <view class="card-title">SEO设置</view>
          <view class="form-item">
            <view class="label">标题</view>
            <u-input
              v-model="seoData.title"
              placeholder="请输入SEO标题"
              border="none"
              :custom-style="inputStyle"
            />
          </view> 
          <view class="form-item">
            <view class="label">关键词</view>
            <u-input
              v-model="seoData.keywords"
              placeholder="请输入SEO关键词，多个用逗号分隔"
              border="none"
              :custom-style="inputStyle"
            />
          </view>
          <view class="form-item">
            <view class="label">描述</view> 
            <u--textarea height="200"
              v-model="seoData.description" 
              placeholder="请输入SEO描述"
              border="none"
              :custom-style="textareaStyle"
            />
          </view>
        </view>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view class="loading-container" v-if="loading">
      <u-loading-icon mode="spinner" size="40"></u-loading-icon>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 底部保存按钮 -->
    <view class="bottom-btn-container" v-if="!loading">
      <u-button
        :custom-style="saveButtonStyle"
        :loading="saveLoading"
        @click="saveSettings"
      >
        保存设置
      </u-button>
    </view>
  </view>
</template>

<script>
import { upsertSettings, getSettings } from '@/utils/api.js';

export default {
  name: 'EnterpriseSettings',
  data() {
    return {
      userInfo: {},
      settings: {
        id: 0,
        enterprise_id: 0,
        show_banner: true,
        show_about: true,
        show_products: true,
        show_articles: true,
        show_cases: true,
        show_contact: true,
        seo_title: '',
        seo_description: '',
        seo_keywords: '',
        created_at: 0,
        updated_at: 0
      },
      displaySettings: [
        { key: 'show_banner', label: '是否显示轮播图', value: true },
        { key: 'show_about', label: '是否显示关于我们', value: true },
        { key: 'show_products', label: '是否显示产品', value: true },
        { key: 'show_articles', label: '是否显示文章', value: true },
        { key: 'show_cases', label: '是否显示案例', value: true },
        { key: 'show_contact', label: '是否显示联系信息', value: true }
      ],
      seoData: {
        title: '',
        description: '',
        keywords: ''
      },
      saveLoading: false,
      loading: false,
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
        color: '#fff',
        borderRadius: '12rpx',
        height: '88rpx',
        fontSize: '32rpx',
        fontWeight: '500'
      }
    }
  },
  onLoad() {
    this.userInfo = uni.getStorageSync('$userinfo');
    this.loadSettings();
  },
  methods: {
    async loadSettings() {
      this.loading = true;
      try {
        const res = await getSettings({ enterpriseId: this.userInfo.id });
        if (res && res.code === 0 && res.data) {
          this.settings = res.data;
          this.updateDisplaySettings();
          this.updateSeoData();
        } else {
          // 如果没有设置数据，使用默认值
          this.settings = {
            id: 0,
            enterprise_id: this.userInfo.id,
            show_banner: true,
            show_about: true,
            show_products: true,
            show_articles: true,
            show_cases: true,
            show_contact: true,
            seo_title: '',
            seo_description: '',
            seo_keywords: '',
            created_at: 0,
            updated_at: 0
          };
          this.updateDisplaySettings();
          this.updateSeoData();
        }
      } catch (error) {
        console.error('加载设置失败:', error);
        uni.showToast({ title: '加载设置失败', icon: 'none' });
      } finally {
        this.loading = false;
      }
    },
    updateDisplaySettings() {
      this.displaySettings.forEach(item => {
        item.value = this.settings[item.key] === 1 || this.settings[item.key] === true;
      });
    },
    updateSeoData() {
      this.seoData = {
        title: this.settings.seo_title || '',
        description: this.settings.seo_description || '',
        keywords: this.settings.seo_keywords || ''
      };
    },
    onSwitchChange(item, index) {
      console.log('切换状态:', item.label, item.value);
      // 更新settings对象
      this.settings[item.key] = item.value;
    },
    async saveSettings() {
      if (this.saveLoading) return;
      
      this.saveLoading = true;
      try {
        // 构建保存数据
        const saveData = {
          enterprise_id: this.userInfo.id,
          show_banner: this.displaySettings.find(item => item.key === 'show_banner').value,
          show_about: this.displaySettings.find(item => item.key === 'show_about').value,
          show_products: this.displaySettings.find(item => item.key === 'show_products').value,
          show_articles: this.displaySettings.find(item => item.key === 'show_articles').value,
          show_cases: this.displaySettings.find(item => item.key === 'show_cases').value,
          show_contact: this.displaySettings.find(item => item.key === 'show_contact').value,
          seo_title: this.seoData.title,
          seo_description: this.seoData.description,
          seo_keywords: this.seoData.keywords
        };

        const res = await upsertSettings(saveData);
        if (res && res.code === 0) {
          uni.showToast({ title: '保存成功', icon: 'success' });
          // 重新加载设置
          await this.loadSettings();
        } else {
          uni.showToast({ title: res?.msg || '保存失败', icon: 'none' });
        }
      } catch (error) {
        console.error('保存设置失败:', error);
        uni.showToast({ title: '保存失败', icon: 'none' });
      } finally {
        this.saveLoading = false;
      }
    },
    formatDate(timestamp) {
      if (!timestamp) return '--';
      const date = new Date(timestamp * 1000);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #F5F6FA;
}

.nav-right {
  .save-btn {
    color: #3D6AFF;
    font-size: 28rpx;
    font-weight: 500;
  }
}

.content {
  padding: 0 32rpx 140rpx 32rpx; /* 底部增加padding为按钮留空间 */
  margin-top: 32rpx;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  
  .loading-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: #999;
  }
}

.bottom-btn-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32rpx;
  background: #fff;
  border-top: 1rpx solid #F0F0F0;
  z-index: 999;
}

.section {
  margin-bottom: 40rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 32rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.info-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  
  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .info-label {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
    }
    
    .info-value {
      font-size: 28rpx;
      color: #999;
      margin-left: auto;
    }
    
    .info-desc {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.settings-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  
  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    border-bottom: 1rpx solid #F0F0F0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .setting-label {
      font-size: 28rpx;
      color: #333;
    }
  }
}

.seo-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  
  .form-item {
    margin-bottom: 32rpx;
    .label {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 16rpx;
  font-weight: 500;
}
    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 16rpx;
    }
  }
  
  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    margin-bottom: 0;
    
    .setting-label {
      font-size: 28rpx;
      color: #333;
    }
  }
}

// 深度选择器样式调整
::v-deep .u-input {
  .u-input__content {
    .u-input__content__field-wrapper {
      .u-input__content__field-wrapper__field {
        font-size: 28rpx !important;
      }
    }
  }
}

::v-deep .u-switch {
  transform: scale(0.8);
}

::v-deep .u-navbar {
  .u-navbar__content {
    .u-navbar__content__left {
      .u-icon {
        font-size: 36rpx !important;
      }
    }
  }
}
</style>