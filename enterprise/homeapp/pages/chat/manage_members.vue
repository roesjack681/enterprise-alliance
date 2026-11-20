<template>
  <view class="manage-members-container">
    <!-- 搜索栏 -->
    <view class="search-container">
      <u-search
        v-model="searchKeyword"
        placeholder="搜索成员"
        :show-action="false"
        :custom-style="searchStyle"
        @search="onSearch"
        @input="onSearchInput"
      ></u-search>
    </view>

    <!-- 统计信息 -->
    <view class="stats-section">
      <view class="stats-item">
        <text class="stats-label">群成员</text>
        <text class="stats-value">{{ memberList.length }}人</text>
      </view>
      <view class="stats-item">
        <text class="stats-label">管理员</text>
        <text class="stats-value">{{ adminCount }}人</text>
      </view>
    </view>

    <!-- 成员列表 -->
    <view class="member-list">
      <view 
        v-for="member in filteredMembers" 
        :key="member.id"
        class="member-item"
        @click="showMemberActions(member)"
      >
        <view class="member-avatar">
          <image 
            v-if="member.avatar" 
            :src="member.avatar" 
            class="avatar-img" 
            mode="aspectFill"
          ></image>
          <view v-else class="default-avatar">
            <text class="avatar-text">{{ getUserInitial(member.nickname) }}</text>
          </view>
          <view v-if="member.role === 'owner'" class="role-badge owner">群主</view>
          <view v-else-if="member.role === 'admin'" class="role-badge admin">管理员</view>
        </view>
        
        <view class="member-info">
          <text class="member-name">{{ member.nickname || '未知用户' }}</text>
          <text class="member-id">ID: {{ member.id }}</text>
          <text v-if="member.join_time" class="member-time">
            {{ $C.formatDateSmart(member.join_time) }} 加入
          </text>
        </view>
        
        <view class="member-actions">
          <u-icon 
            v-if="canManageMember(member)" 
            name="more-dot-fill" 
            color="#999" 
            size="32"
          ></u-icon>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="filteredMembers.length === 0" class="empty-state">
      <image src="/static/icon/empty.png" class="empty-icon" mode="aspectFit"></image>
      <text class="empty-text">没有找到相关成员</text>
    </view> 
    <!-- 成员操作弹窗 -->
    <u-popup 
      :show="showActionPopup" 
      mode="bottom" 
      :border-radius="20"
      :safe-area-inset-bottom="true"
      @close="closeActionPopup"
    >
      <view class="action-popup">
        <view class="popup-header">
          <view class="selected-member-info">
            <view class="selected-member-avatar">
              <image 
                v-if="selectedMember.avatar" 
                :src="selectedMember.avatar" 
                class="avatar-img" 
                mode="aspectFill"
              ></image>
              <view v-else class="default-avatar">
                <text class="avatar-text">{{ getUserInitial(selectedMember.nickname) }}</text>
              </view>
            </view>
            <view class="selected-member-details">
              <text class="selected-member-name">{{ selectedMember.nickname || '未知用户' }}</text>
              <text class="selected-member-role">{{ getRoleText(selectedMember.role) }}</text>
            </view>
          </view>
          <u-icon name="close" color="#999" size="40" @click="closeActionPopup"></u-icon>
        </view>
        
        <view class="popup-actions">
        
          
          <!-- 踢出群聊 -->
          <view 
            v-if="canKickMember(selectedMember)"
            class="action-item danger-action" 
            @click="kickMember(selectedMember)"
          >
            <u-icon name="close" color="#ff4757" size="40"></u-icon>
            <text class="action-text danger-text">踢出群聊</text>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import { getRoomDetail, setRoomAdmin, kickFromRoom } from '@/utils/api.js';

export default {
  data() {
    return {
      roomId: '',
      memberList: [],
      filteredMembers: [],
      searchKeyword: '',
      currentUserId: 0,
      owner_id:0,
      currentUserRole: '',
      showActionPopup: false,
      selectedMember: {},
      searchStyle: {
        backgroundColor: '#F5F6FA',
        borderRadius: '12rpx'
      }
    }
  },
  computed: {
    adminCount() {
      return this.memberList.filter(m => m.role === 'admin' || m.role === 'owner').length;
    }
  },
  onLoad(options) {
    this.roomId = options.room_id || '';
    if (this.roomId) {
      this.loadMembers();
    }
    this.getCurrentUser();
  },
  methods: {
    // 获取当前用户信息
    getCurrentUser() {
      const userInfo =uni.getStorageSync('$userinfo') || {};
      this.currentUserId = Number(userInfo.id);
    },

    // 加载成员列表
    async loadMembers() {
      try {
        uni.showLoading({ title: '加载中...' });
        const res = await getRoomDetail({ room_id: this.roomId });
        if (res.code === 0 && res.data) {
          this.owner_id	=res.data.owner_id
          this.memberList = res.data.members || [];
          this.filteredMembers = [...this.memberList];
          
          // 获取当前用户角色
          const currentMember = this.memberList.find(m => m.id === this.currentUserId);
          this.currentUserRole = currentMember ? currentMember.role : '';
          
          // 设置导航栏标题
          uni.setNavigationBarTitle({
            title: `群成员管理 (${this.memberList.length})`
          });
        }
      } catch (error) {
        console.error('加载成员列表失败:', error);
        uni.showToast({
          title: '加载成员列表失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },

    // 获取用户名首字母
    getUserInitial(name) {
      if (!name) return '?';
      return name.charAt(0).toUpperCase();
    },

    // 获取角色文本
    getRoleText(role) {
      const roleMap = {
        'owner': '群主',
        'admin': '管理员',
        'member': '普通成员'
      };
      return roleMap[role] || '普通成员';
    },

    // 搜索输入
    onSearchInput(value) {
      this.searchKeyword = value;
      this.filterMembers();
    },

    // 搜索
    onSearch(value) {
      this.searchKeyword = value;
      this.filterMembers();
    },

    // 过滤成员
    filterMembers() {
      if (!this.searchKeyword.trim()) {
        this.filteredMembers = [...this.memberList];
      } else {
        const keyword = this.searchKeyword.toLowerCase();
        this.filteredMembers = this.memberList.filter(member => {
          return (member.nickname && member.nickname.toLowerCase().includes(keyword)) ||
                 String(member.id).includes(keyword);
        });
      }
    },

    // 显示成员操作
    showMemberActions(member) {
      if (!this.canManageMember(member)) {
        return;
      }
      this.selectedMember = member;
      this.showActionPopup = true;
      
    },

    // 关闭操作弹窗
    closeActionPopup() {
      this.showActionPopup = false;
      this.selectedMember = {};
    },

    // 判断是否可以管理成员
    canManageMember(member) {
      // 自己不能管理自己
      if (member.id == this.currentUserId) return false;
       
      // 只有群主可以管理成员
      if (this.currentUserId == this.owner_id) return true; 
      
      return false;
    },

    // 判断是否可以踢出成员
    canKickMember(member) {
      // 只有群主可以踢出成员，且不能踢出自己
      if (this.currentUserId == this.owner_id && member.id != this.currentUserId) {
        return true;
      }
      return false;
    },

    // 判断是否可以设置管理员
    canSetAdmin(member) {
      return this.currentUserRole === 'owner' && member.role === 'member';
    },

    // 判断是否可以取消管理员
    canRemoveAdmin(member) {
      return this.currentUserRole === 'owner' && member.role === 'admin';
    },

    // 判断是否可以转让群主
    canTransferOwner(member) {
      return this.currentUserRole === 'owner' && member.role !== 'owner';
    },

    // 判断是否可以踢出成员
    canKickMember(member) {
      if (member.role === 'owner') return false;
      if (this.currentUserRole === 'owner') return true;
      if (this.currentUserRole === 'admin' && member.role === 'member') return true;
      return false;
    },

    // 设置管理员
    async setAdmin(member) {
      try {
        const res = await setRoomAdmin({
          room_id: this.roomId,
          user_id: member.id
        });

        if (res.code === 0) {
          uni.showToast({
            title: '设置成功',
            icon: 'success'
          });
          
          // 更新本地数据
          const memberIndex = this.memberList.findIndex(m => m.id === member.id);
          if (memberIndex !== -1) {
            this.memberList[memberIndex].role = 'admin';
          }
          this.filterMembers();
          this.closeActionPopup();
        } else {
          uni.showToast({
            title: res.msg || '设置失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('设置管理员失败:', error);
        uni.showToast({
          title: '设置失败',
          icon: 'none'
        });
      }
    }, 
    // 踢出成员
    kickMember(member) {
      uni.showModal({
        title: '踢出群聊',
        content: `确定要将"${member.nickname}"踢出群聊吗？`,
        confirmColor: '#ff4757',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await kickFromRoom({
                room_id: this.roomId,
                kickee_id: member.id
              });

              if (result.code === 0) {
                uni.showToast({
                  title: '已踢出群聊',
                  icon: 'success'
                });
                
                // 从列表中移除该成员
                this.memberList = this.memberList.filter(m => m.id !== member.id);
                this.filterMembers();
                this.closeActionPopup();
                
                // 更新标题
                uni.setNavigationBarTitle({
                  title: `群成员管理 (${this.memberList.length})`
                });
              } else {
                uni.showToast({
                  title: result.msg || '踢出失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              console.error('踢出成员失败:', error);
              uni.showToast({
                title: '踢出失败',
                icon: 'none'
              });
            }
          }
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.manage-members-container {
  min-height: 100vh;
  background-color: #f5f6fa;
}

/* 搜索容器 */
.search-container {
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
	background-color: #fff;
}

/* 自定义搜索框样式 */
.search-container ::v-deep .u-search {
	.u-search__content {
		height: 80rpx !important;
		border-radius: 40rpx !important;
		
		border: none !important;
		
		.u-search__input {
			font-size: 30rpx !important;
			color: #333 !important;
		}
		
		.u-search__input-placeholder {
			font-size: 30rpx !important;
			color: #999 !important;
		}
	}
	
	.u-icon {
		font-size: 32rpx !important;
		color: #999 !important;
	}
}

/* 统计信息 */
.stats-section {
  background-color: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-around;

  .stats-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .stats-label {
      font-size: 26rpx;
      color: #999;
      margin-bottom: 8rpx;
    }

    .stats-value {
      font-size: 36rpx;
      font-weight: 500;
      color: #333;
    }
  }
}

/* 成员列表 */
.member-list {
  background-color: #fff;

  .member-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background-color: #f8f9fa;
    }

    .member-avatar {
      width: 100rpx;
      height: 100rpx;
      position: relative;
      margin-right: 24rpx;

      .avatar-img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }

      .default-avatar {
        width: 100%;
        height: 100%;
        background-color: #3D6AFF;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        .avatar-text {
          color: #fff;
          font-size: 32rpx;
          font-weight: 500;
        }
      }

      .role-badge {
        position: absolute;
        bottom: -5rpx;
        right: -5rpx;
        padding: 4rpx 8rpx;
        border-radius: 20rpx;
        font-size: 20rpx;
        color: #fff;
        
        &.owner {
          background-color: #ff6b35;
        }
        
        &.admin {
          background-color: #3D6AFF;
        }
      }
    }

    .member-info {
      flex: 1;
      display: flex;
      flex-direction: column;

      .member-name {
        font-size: 32rpx;
        color: #333;
        font-weight: 500;
        margin-bottom: 8rpx;
      }

      .member-id {
        font-size: 26rpx;
        color: #999;
        margin-bottom: 4rpx;
      }

      .member-time {
        font-size: 24rpx;
        color: #ccc;
      }
    }

    .member-actions {
      padding: 10rpx;
    }
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;

  .empty-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 40rpx;
    opacity: 0.3;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

/* 操作弹窗 */
.action-popup {
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 40rpx 30rpx 20rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .selected-member-info {
      display: flex;
      align-items: center;

      .selected-member-avatar {
        width: 80rpx;
        height: 80rpx;
        margin-right: 20rpx;

        .avatar-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }

        .default-avatar {
          width: 100%;
          height: 100%;
          background-color: #3D6AFF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          .avatar-text {
            color: #fff;
            font-size: 28rpx;
            font-weight: 500;
          }
        }
      }

      .selected-member-details {
        display: flex;
        flex-direction: column;

        .selected-member-name {
          font-size: 32rpx;
          color: #333;
          font-weight: 500;
          margin-bottom: 8rpx;
        }

        .selected-member-role {
          font-size: 26rpx;
          color: #999;
        }
      }
    }
  }

  .popup-actions {
    padding: 20rpx 0;

    .action-item {
      display: flex;
      align-items: center;
      padding: 30rpx;

      &:active {
        background-color: #f8f9fa;
      }

      .action-text {
        font-size: 30rpx;
        color: #333;
        margin-left: 20rpx;
      }

      &.danger-action {
        .action-text.danger-text {
          color: #ff4757;
        }
      }
    }
  }
}
</style>