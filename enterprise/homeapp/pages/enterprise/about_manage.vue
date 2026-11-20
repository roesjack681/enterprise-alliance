<template>
  <view class="page">
    <!-- 顶部导航栏 -->
    <u-navbar
      :back-icon-size="40"
      :back-icon-color="'#333'"
      title="关于我们设置"
      :title-color="'#333'"
      :title-size="32"
      :bg-color="'#fff'"
      :height="88"
      :is-back="true"
      @leftClick="goBack"
    >
      <view slot="right" class="nav-right">
        <text class="preview-btn" @tap="preview">预览</text>
      </view>
    </u-navbar>

    <!-- 页面内容 -->
    <scroll-view scroll-y class="content">
      <!-- 基本信息 -->
      <view class="card-section">
        <view class="section-header">
          <text class="section-title">基本信息</text>
          <u-icon name="edit-pen" size="32" color="#999" @tap="editBasicInfo"></u-icon>
        </view>
        <view class="form-item">
          <text class="label">公司名称</text>
          <u-input
            v-model="companyName"
            placeholder="请输入公司名称"
            border="none"
            :custom-style="inputStyle"
          ></u-input>
        </view>
        <view class="form-item">
          <text class="label">公司LOGO</text>
          <view class="logo-upload">
            <image class="logo-img" :src="companyLogo" mode="aspectFit"></image>
            <text class="change-btn" @tap="changeLogo">更换</text>
          </view>
        </view>
      </view>

      <!-- 公司简介 -->
      <view class="card-section">
        <view class="section-header">
          <text class="section-title">公司简介</text>
          <u-icon name="edit-pen" size="32" color="#999" @tap="editCompanyIntro"></u-icon>
        </view>
        <view class="intro-content">
          <u--textarea
            v-model="companyIntro"
            :custom-style="textareaStyle"
            :maxlength="500"
            :auto-height="true"
            placeholder="请输入公司简介"
          />
        </view>
      </view>

      <!-- 团队成员 -->
      <view class="card-section">
        <view class="section-header">
          <text class="section-title">团队成员</text>
          <view class="add-btn" @tap="addTeamMember">
            <u-icon name="plus" size="24" color="#3D6AFF"></u-icon>
            <text class="add-text">添加</text>
          </view>
        </view>
        
        <view class="team-list">
          <view v-for="(member, index) in teamMembers" :key="index" class="team-item">
            <image class="avatar" :src="member.avatar" mode="aspectFill"></image>
            <view class="member-info">
              <text class="member-name">{{ member.name }}</text>
              <text class="member-position">{{ member.position }}</text>
            </view>
            <view class="member-actions">
              <u-icon name="edit-pen" size="36" color="#999" @tap="editTeamMemberFn(index)"></u-icon>
              <u-icon name="arrow-up" size="36" color="#999" @tap="moveMemberUp(index)"></u-icon>
              <u-icon name="arrow-down" size="36" color="#999" @tap="moveMemberDown(index)"></u-icon>
              <u-icon name="trash" size="36" color="#999" @tap="deleteMember(index)"></u-icon>
            </view>
          </view>
        </view>
      </view>
      <u-modal :show="showTeamModal" :title="teamModalTitle" @confirm="saveTeamMember" @cancel="showTeamModal=false" showCancelButton>
        <view class="slot-content">
          <view class="avatar-upload-vertical">
            <image class="avatar-preview" :src="editTeamMember.avatar || '/static/images/avatar1.jpg'" mode="aspectFill" @tap="changeEditTeamAvatar"></image>
            <text class="upload-avatar-text" @tap="changeEditTeamAvatar">上传头像</text>
          </view>
          <u--input v-model="editTeamMember.name" placeholder="姓名" />
          <u--input v-model="editTeamMember.position" placeholder="职位" />
        </view>
      </u-modal>

      <!-- 发展历史 -->
      <view class="card-section">
        <view class="section-header">
          <text class="section-title">发展历史</text>
          <view class="add-btn" @tap="addHistory">
            <u-icon name="plus" size="26" color="#3D6AFF"></u-icon>
            <text class="add-text">添加里程碑</text>
          </view>
        </view>
        
        <view class="history-list">
          <view v-for="(history, index) in historyList" :key="index" class="history-item">
            <view class="history-number">{{ index + 1 }}</view>
            <view class="history-content">
              <view class="history-year">{{ history.year }}</view>
              <view class="history-desc">{{ history.description }}</view>
            </view>
            <view class="history-actions">
              <u-icon name="edit-pen" size="36" color="#999" @tap="editHistory(index)"></u-icon>
              <u-icon name="trash" size="36" color="#999" @tap="deleteHistory(index)"></u-icon>
            </view>
          </view>
        </view>
      </view>
      <u-modal :show="showHistoryModal" :title="historyModalTitle" @confirm="saveHistory" @cancel="showHistoryModal=false" showCancelButton>
        <view class="slot-content">
          <u--input v-model="editHistoryItem.year" placeholder="年份" />
          <u--textarea v-model="editHistoryItem.description" placeholder="描述" />
        </view>
      </u-modal>

      <!-- 底部间距 -->
      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 保存按钮 -->
    <view class="save-btn-container">
      <u-button
        type="primary"
        :custom-style="saveButtonStyle"
        @tap="saveSettings"
      >
        保存全部设置
      </u-button>
    </view>
  </view>
</template>

<script>
import { getAbout, upsertAbout } from '@/utils/api.js';
import { uploadFileInChunks } from '@/utils/upload.js';
export default {
  data() {
    return {
      userInfo: {},
      companyName: '',
      companyIntro: '',
      companyLogo: '',
      teamMembers: [],
      historyList: [],
      loading: false,
      enterpriseId: 0, // 实际项目应从登录信息或store获取
      showTeamModal: false,
      showHistoryModal: false,
      teamModalTitle: '',
      historyModalTitle: '',
      editTeamMember: { name: '', position: '', avatar: '' },
      editTeamIndex: null,
      editHistoryItem: { year: '', description: '' },
      editHistoryIndex: null
    }
  }, 
  created() {
    // 假设 enterprise_id 从本地存储获取
    this.userInfo = uni.getStorageSync('$userinfo')
    this.enterpriseId = this.userInfo?.id || null
    this.fetchAbout();
  },
  computed: {
    inputStyle() {
      return {
        backgroundColor: '#f8f9fa',
        borderRadius: '12rpx',
        padding: '24rpx',
        fontSize: '28rpx',
        color: '#333'
      }
    },
    textareaStyle() {
      return {
        backgroundColor: '#f8f9fa',
        borderRadius: '12rpx',
        padding: '24rpx',
        fontSize: '28rpx',
        color: '#333',
        minHeight: '300rpx'
      }
    },
    saveButtonStyle() {
      return {
        backgroundColor: '#3D6AFF',
        borderRadius: '12rpx',
        height: '88rpx',
        fontSize: '32rpx'
      }
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    preview() {
      uni.showToast({
        title: '预览功能',
        icon: 'none'
      })
    },
    editBasicInfo() {
      console.log('编辑基本信息')
    },
    editCompanyIntro() {
      console.log('编辑公司简介')
    },
    editCompanyImage() {},
    changeLogo() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const file = res.tempFiles[0];
          uploadFileInChunks(file, {
            onProgress: (percent) => {
              uni.showLoading({ title: `上传中 ${percent}%` })
            }
          }).then(result => {
            uni.hideLoading();
            this.companyLogo = result.filePath;
          }).catch(err => {
            uni.hideLoading();
            uni.showToast({ title: '上传失败', icon: 'none' });
          });
        }
      })
    },
    async fetchAbout() {
      this.loading = true;
      try {
        const res = await getAbout({ enterpriseId: this.enterpriseId });
        if (res.code === 0 && res.data) {
          this.companyName = res.data.company_name ||this.userInfo.entityInfo.name || '';
          this.companyIntro = res.data.description ||this.userInfo.entityInfo.descp	 || '';
          this.companyLogo = res.data.logo_url ||this.userInfo.entityInfo.logo || '';
          this.teamMembers = res.data.team_intro ? JSON.parse(res.data.team_intro) : [];
          this.historyList = res.data.history ? JSON.parse(res.data.history) : [];
        }
      } finally {
        this.loading = false;
      }
    },
    addTeamMember() {
      this.editTeamMember = { name: '', position: '', avatar: '' }
      this.editTeamIndex = null
      this.teamModalTitle = '添加团队成员'
      this.showTeamModal = true
    },
    editTeamMemberFn(index) {
      this.editTeamMember = { ...this.teamMembers[index] }
      this.editTeamIndex = index
      this.teamModalTitle = '编辑团队成员'
      this.showTeamModal = true
    },
    saveTeamMember() {
      if (this.editTeamIndex === null) {
        this.teamMembers.push({ ...this.editTeamMember })
      } else {
        this.$set(this.teamMembers, this.editTeamIndex, { ...this.editTeamMember })
      }
      this.showTeamModal = false
    },
    moveMemberUp(index) {
      if (index > 0) {
        const temp = this.teamMembers[index]
        this.teamMembers.splice(index, 1)
        this.teamMembers.splice(index - 1, 0, temp)
      }
    },
    moveMemberDown(index) {
      if (index < this.teamMembers.length - 1) {
        const temp = this.teamMembers[index]
        this.teamMembers.splice(index, 1)
        this.teamMembers.splice(index + 1, 0, temp)
      }
    },
    deleteMember(index) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个团队成员吗？',
        success: (res) => {
          if (res.confirm) {
            this.teamMembers.splice(index, 1)
          }
        }
      })
    },
    addHistory() {
      this.editHistoryItem = { year: '', description: '' }
      this.editHistoryIndex = null
      this.historyModalTitle = '添加里程碑'
      this.showHistoryModal = true
    },
    editHistory(index) {
      this.editHistoryItem = { ...this.historyList[index] }
      this.editHistoryIndex = index
      this.historyModalTitle = '编辑里程碑'
      this.showHistoryModal = true
    },
    saveHistory() {
      if (this.editHistoryIndex === null) {
        this.historyList.push({ ...this.editHistoryItem })
      } else {
        this.$set(this.historyList, this.editHistoryIndex, { ...this.editHistoryItem })
      }
      this.showHistoryModal = false
    },
    deleteHistory(index) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个历史记录吗？',
        success: (res) => {
          if (res.confirm) {
            this.historyList.splice(index, 1)
          }
        }
      })
    },
    async saveSettings() {
      uni.showLoading({ title: '保存中...' });
      try {
        const payload = {
          company_name: this.companyName,
          description: this.companyIntro,
          logo_url: this.companyLogo,
          team_intro: JSON.stringify(this.teamMembers),
          history: JSON.stringify(this.historyList),
        };
        const res = await upsertAbout(payload);
        if (res.code === 0) {
          uni.showToast({ title: '保存成功', icon: 'success' });
          setTimeout(() => {
            uni.navigateBack();
          }, 1000);
        } else {
          uni.showToast({ title: res.msg || '保存失败', icon: 'none' });
        }
      } finally {
        uni.hideLoading();
      }
    },
    changeEditTeamAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const file = res.tempFiles[0];
          uploadFileInChunks(file, {
            onProgress: (percent) => {
              uni.showLoading({ title: `上传中 ${percent}%` })
            }
          }).then(result => {
            uni.hideLoading();
            this.editTeamMember.avatar = result.filePath;
          }).catch(err => {
            uni.hideLoading();
            uni.showToast({ title: '上传失败', icon: 'none' });
          });
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.nav-right {
  .preview-btn {
    color: #3D6AFF;
    font-size: 28rpx;
    padding: 10rpx 20rpx;
  }
}

.content {
  padding: 20rpx;
  padding-bottom: 200rpx;
}

.card-section {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
}

.form-item {
  margin-bottom: 32rpx;
  &:last-child {
    margin-bottom: 0;
  }
  .label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
  }
}

.logo-upload {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
  .logo-img {
    width: 60rpx;
    height: 60rpx;
    border-radius: 8rpx;
  }
  .change-btn {
    color: #3D6AFF;
    font-size: 28rpx;
  }
}

.intro-content {
  position: relative;
  
  .expand-btn {
    position: absolute;
    right: 12rpx;
    bottom: 12rpx;
    
    .expand-text {
      color: #3D6AFF;
      font-size: 24rpx;
    }
  }
}

.add-btn {
  display: flex;
  align-items: center;
  
  .add-text {
    color: #3D6AFF;
    font-size: 28rpx;
    margin-left: 8rpx;
  }
}

.team-list {
  .team-item {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 24rpx;
    }
    
    .member-info {
      flex: 1;
      
      .member-name {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .member-position {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .member-actions {
      display: flex;
      align-items: center;
      gap: 16rpx;
    }
  }
}

.history-list {
  .history-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 32rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .history-number {
      width: 48rpx;
      height: 48rpx;
      background-color: #3D6AFF;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      margin-right: 24rpx;
      margin-top: 8rpx;
      flex-shrink: 0;
    }
    
    .history-content {
      flex: 1;
      
      .history-year {
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .history-desc {
        font-size: 26rpx;
        color: #666;
        line-height: 1.6;
      }
    }
    
    .history-actions {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-top: 8rpx;
      margin-left: 16rpx;
    }
  }
}

.bottom-space {
  height: 40rpx;
}

.save-btn-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

::v-deep .u-input {
  .u-input__content {
    .u-input__content__field-wrapper {
      .u-input__content__field-wrapper__field {
        font-size: 28rpx !important;
      }
    }
  }
}
.slot-content {
  padding: 32rpx 0 0 0;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  width: 100%;
}
.slot-content .u--input,
.slot-content .u--textarea {
  background-color: #f8f9fa !important;
  border-radius: 12rpx !important;
  font-size: 28rpx !important;
  color: #333 !important;
  padding: 24rpx !important;
}
.avatar-upload-row {
  display: none;
}
.avatar-upload-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  width: 100%;
}
.avatar-preview {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #f0f0f0;
  object-fit: cover;
  margin-bottom: 12rpx;
}
.upload-avatar-text {
  color: #3D6AFF;
  font-size: 26rpx;
  text-align: center;
  cursor: pointer;
}
</style>