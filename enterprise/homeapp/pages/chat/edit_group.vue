<template>
  <view class="edit-group-container">
    <!-- 群头像 -->
    <view class="section">
      <view class="section-title">群头像</view>
      <view class="avatar-section">
        <view class="group-avatar" @click="chooseAvatar">
          <image 
            v-if="groupInfo.avatar" 
            :src="groupInfo.avatar" 
            class="avatar-img" 
            mode="aspectFill"
          ></image>
          <view v-else class="default-avatar">
            <text class="avatar-text">{{ getGroupInitial() }}</text>
          </view>
          <view class="avatar-overlay">
            <u-icon name="camera" color="#fff" size="40"></u-icon>
          </view>
        </view>
        <text class="avatar-tip">点击修改群头像</text>
      </view>
    </view>

    <!-- 群名称 -->
    <view class="section">
      <view class="form-item">
        <text class="form-label">群名称</text>
        <u-input
          v-model="formData.room_name"
          placeholder="请输入群名称"
          :maxlength="20"
          :custom-style="inputStyle"
        ></u-input>
      </view>
    </view>

    <!-- 群介绍 -->
    <view class="section">
      <view class="form-item">
        <text class="form-label">群介绍</text>
        <u-textarea
          v-model="formData.descp"
          placeholder="请输入群介绍"
          :maxlength="200"
          :height="120"
          :custom-style="textareaStyle"
        ></u-textarea>
      </view>
    </view>

    <!-- 群设置 -->
    <view class="section">
      <view class="section-title">群设置</view>
      <view class="setting-list">
        <view class="setting-item">
          <text class="setting-text">全员禁言</text>
          <u-switch 
            v-model="formData.is_muted" 
            :active-color="switchActiveColor"
            @change="onMuteAllChange"
          ></u-switch>
        </view>
        <view class="setting-item">
          <text class="setting-text">邀请确认</text>
          <u-switch 
            v-model="formData.invite_confirm" 
            :active-color="switchActiveColor"
            @change="onInviteConfirmChange"
          ></u-switch>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <u-button 
        type="primary" 
        :custom-style="saveButtonStyle"
        :loading="saving"
        @click="saveGroupInfo"
      >
        保存修改
      </u-button>
    </view>

    <!-- 危险操作 -->
    <view class="section danger-section" v-if="isOwner">
      <view class="section-title">危险操作</view>
      <view class="function-list">
        <view class="function-item danger-item" @click="transferOwnership">
          <u-icon name="account-fill" color="#ff4757" size="40"></u-icon>
          <text class="function-text danger-text">转让群主</text>
          <u-icon name="arrow-right" color="#ccc" size="32"></u-icon>
        </view>
        <view class="function-item danger-item" @click="dissolveGroup">
          <u-icon name="trash" color="#ff4757" size="40"></u-icon>
          <text class="function-text danger-text">解散群聊</text>
          <u-icon name="arrow-right" color="#ccc" size="32"></u-icon>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getRoomDetail, updateRoomInfo, transferRoomOwner, dissolveRoom } from '@/utils/api.js';
import { uploadFileInChunks } from '@/utils/upload.js';

export default {
  data() {
    return {
      roomId: '',
      groupInfo: {},
      formData: {
        room_name: '',
        descp: '',
        avatar: '',
        is_muted: false,
        invite_confirm: true
      },
      currentUserId: 0,
      saving: false,
      inputStyle: {
        backgroundColor: '#F5F6FA',
        borderRadius: '12rpx',
        padding: '16rpx 20rpx',
        fontSize: '30rpx',
        border: '2rpx solid #E4E7ED'
      },
      textareaStyle: {
        backgroundColor: '#F5F6FA',
        borderRadius: '12rpx',
        padding: '16rpx 20rpx',
        fontSize: '30rpx',
        border: '2rpx solid #E4E7ED'
      },
      saveButtonStyle: {
        backgroundColor: '#3D6AFF',
        borderRadius: '12rpx',
        height: '88rpx',
        fontSize: '32rpx'
      },
      switchActiveColor: '#3D6AFF'
    }
  },
  computed: {
    isOwner() {
      if (!this.groupInfo.members) return false;
      const currentMember = this.groupInfo.members.find(m => m.id === this.currentUserId);
      return currentMember && currentMember.role === 'owner';
    }
  },
  onLoad(options) {
    this.roomId = options.room_id || '';
    if (this.roomId) {
      this.loadGroupInfo();
    }
    this.getCurrentUser();
  },
  methods: {
    // 获取当前用户信息
    getCurrentUser() {
      const userInfo =  uni.getStorageSync('$userinfo') || {};
      this.currentUserId = Number(userInfo.id);
    },

    // 加载群组信息
    async loadGroupInfo() {
      try {
        uni.showLoading({ title: '加载中...' });
        const res = await getRoomDetail({ room_id: this.roomId });
        if (res.code === 0 && res.data) {
          this.groupInfo = res.data;
          // 填充表单数据
          this.formData = {
            room_name: res.data.room_name || '',
            descp: res.data.descp || '',
            avatar: res.data.avatar || '',
            is_muted: res.data.is_muted?true:false,
            invite_confirm: res.data.invite_confirm !== false // 默认为true
          };
          
          // 设置导航栏标题
          uni.setNavigationBarTitle({
            title: '编辑群资料'
          });
        }
      } catch (error) {
        console.error('加载群组信息失败:', error);
        uni.showToast({
          title: '加载群组信息失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },

    // 获取群组名称首字母
    getGroupInitial() {
      const name = this.formData.room_name || this.groupInfo.room_name || '群';
      return name.charAt(0).toUpperCase();
    },

    // 选择群头像
    chooseAvatar() {
      const that = this;
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: function(res) {
          const file = res.tempFiles[0];
          
          // 显示上传进度
          uni.showLoading({ title: '上传中...' });
          
          uploadFileInChunks(file, {
            onProgress: (percent) => {
              uni.showLoading({ title: `上传中 ${percent}%` });
            }
          }).then(uploadRes => {
            uni.hideLoading();
            
            if (uploadRes.code === 200) {
              that.formData.avatar = uploadRes.filePath;
              uni.showToast({
                title: '头像上传成功',
                icon: 'success'
              });
            } else {
              uni.showToast({
                title: '头像上传失败',
                icon: 'none'
              });
            }
          }).catch(err => {
            console.error('头像上传失败:', err);
            uni.hideLoading();
            uni.showToast({
              title: '头像上传失败',
              icon: 'none'
            });
          });
        }
      });
    },

    // 全员禁言切换
    onMuteAllChange(value) {
      console.log('全员禁言:', value);
    },

    // 邀请确认切换
    onInviteConfirmChange(value) {
      console.log('邀请确认:', value);
    },

    // 保存群信息
    async saveGroupInfo() {
      if (!this.formData.room_name.trim()) {
        uni.showToast({
          title: '请输入群名称',
          icon: 'none'
        });
        return;
      }

      this.saving = true;
      try {
        const res = await updateRoomInfo({
          room_id: this.roomId,
          room_name: this.formData.room_name.trim(),
          descp: this.formData.descp.trim(),
          avatar: this.formData.avatar,
          is_muted: this.formData.is_muted?1:0,
          invite_confirm: this.formData.invite_confirm?1:0
        });

        if (res.code === 0) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          });
          
          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          uni.showToast({
            title: res.msg || '保存失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('保存群信息失败:', error);
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        });
      } finally {
        this.saving = false;
      }
    },

    // 转让群主
    transferOwnership() {
      uni.showModal({
        title: '转让群主',
        content: '转让群主后您将失去群管理权限，确定要继续吗？',
        success: (res) => {
          if (res.confirm) {
            // 跳转到选择新群主页面
            uni.navigateTo({
              url: `/pages/chat/transfer_owner?room_id=${this.roomId}`
            });
          }
        }
      });
    },

    // 解散群聊
    dissolveGroup() {
      uni.showModal({
        title: '解散群聊',
        content: '解散后群聊将被永久删除，所有成员将被移除，确定要解散吗？',
        confirmColor: '#ff4757',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '解散中...' });
              const result = await dissolveRoom({ room_id: this.roomId });
              
              if (result.code === 0) {
                uni.showToast({
                  title: '群聊已解散',
                  icon: 'success'
                });
                
                // 返回到聊天列表
                setTimeout(() => {
                  uni.navigateBack({
                    delta: 3 // 返回到聊天列表页面
                  });
                }, 1500);
              } else {
                uni.showToast({
                  title: result.msg || '解散失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              console.error('解散群聊失败:', error);
              uni.showToast({
                title: '解散失败',
                icon: 'none'
              });
            } finally {
              uni.hideLoading();
            }
          }
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-group-container {
  min-height: 100vh;
  background-color: #f5f6fa;
  padding-bottom: 120rpx;
}

.section {
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 30rpx;

  &:first-child {
    margin-top: 0;
  }
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 30rpx;
}

/* 头像部分 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;

  .group-avatar {
    width: 160rpx;
    height: 160rpx;
    position: relative;
    margin-bottom: 20rpx;

    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 20rpx;
    }

    .default-avatar {
      width: 100%;
      height: 100%;
      background-color: #3D6AFF;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .avatar-text {
        color: #fff;
        font-size: 64rpx;
        font-weight: 500;
      }
    }

    .avatar-overlay {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 48rpx;
      height: 48rpx;
      background-color: rgba(0, 0, 0, 0.6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .avatar-tip {
    font-size: 26rpx;
    color: #999;
  }
}

/* 表单项 */
.form-item {
  margin-bottom: 30rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .form-label {
    display: block;
    font-size: 30rpx;
    color: #333;
    margin-bottom: 20rpx;
    font-weight: 500;
  }
}

/* 设置列表 */
.setting-list {
  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .setting-text {
      font-size: 30rpx;
      color: #333;
    }
  }
}

/* 操作按钮 */
.action-buttons {
  padding: 40rpx 30rpx;
}

/* 功能列表 */
.function-list {
  .function-item {
    display: flex;
    align-items: center;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .function-text {
      flex: 1;
      font-size: 30rpx;
      color: #333;
      margin-left: 20rpx;
    }

    &.danger-item {
      .function-text.danger-text {
        color: #ff4757;
      }
    }
  }
}

/* 危险操作区域 */
.danger-section {
  margin-top: 40rpx;
}
</style>