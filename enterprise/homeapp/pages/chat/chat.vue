<template>
  <view class="chat-container">
    <u-navbar
            :title="roomName" 
            :safeAreaInsetTop="true"
            :autoBack="false"
        >
        <template slot="left">
            <view 
                class="u-nav-slot"
                @click="goBack"
            >
                <u-icon
                    name="arrow-left"
                    size="34"
                    color="#333"
                ></u-icon>
            </view>
        </template>
        <template slot="right">
            <view 
                v-if="roomInfo && roomInfo.room_type == 2"
                class="u-nav-slot"
                @click="handleNavbarRightClick"
            >
                <u-icon
                    name="setting"
                    size="36"
                    color="#333"
                ></u-icon>
            </view>
        </template>
        </u-navbar>
    <!-- 聊天消息区域 -->
    <scroll-view 
      class="chat-messages"     
      scroll-y="true" 
      :upper-threshold="50"
      @scrolltoupper="onScrollToUpper"
      :scroll-top="scrollTop"
    >
      <!-- 加载更多状态 -->
      <view class="loading-more" v-if="loadingMore">
        <u-loading-icon mode="spinner" size="32"></u-loading-icon>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 消息列表 -->
      <view class="message-list">
        <view 
          v-for="(message, index) in messageList" 
            :key="index"
          :id="'msg-' + message.id"
          class="message-item"
          :class="{ 'message-mine': message.is_mine, 'message-other': !message.is_mine }"
        >
          <!-- 时间分割线 -->
          <view v-if="showTimeDivider(index)" class="time-divider">
            <text class="time-text">{{ $C.formatDateSmart(message.created_at) }}</text>
          </view>

          <!-- 消息内容 -->
          <view class="message-content">
            <!-- 头像 -->
            <view class="message-avatar">
              <image 
                v-if="message.sender_avatar" 
                :src="message.sender_avatar" 
                class="avatar-img" 
                mode="aspectFill"
              ></image>
              <view v-else class="default-avatar">
                <image src="/static/icon/m1.png" class="default-icon"></image>
              </view>
            </view>

            <!-- 消息气泡 -->
            <view class="message-bubble">
              <!-- 文字消息 -->
              <view v-if="message.type === 'text'" class="text-message">
                <text class="message-text" :class="{ 'link-text': isLink(message.content) }" @click="handleLinkClick(message.content)">
                  {{ isLink(message.content) ? truncateUrl(message.content) : message.content }}
                </text>
              </view>

              <!-- 图片消息 -->
              <view v-else-if="message.type === 'image'" class="image-message">
                <image 
                  :src="message.content" 
                  class="message-image" 
                  mode="aspectFill"
                  @click="previewImage(message.content)"
                  @load="onImageLoad"
                  @error="onImageError"
                ></image>
                <view v-if="message.loading" class="image-loading">
                  <u-loading-icon mode="spinner" size="24"></u-loading-icon>
                </view>
              </view>

              <!-- 链接消息 -->
              <view v-else-if="message.type === 'link'" class="link-message">
                <view class="link-card" @click="openLink(message.content)">
                  <view class="link-info">
                    <text class="link-title">{{ message.link_title || '链接' }}</text>
                    <text class="link-desc">{{ truncateText(message.link_desc || message.content, 25) }}</text>
                    <text class="link-url">{{ truncateUrl(message.content) }}</text>
                  </view>
                  <view class="link-icon">
                    <u-icon name="link" size="32" :color="message.is_mine ? '#fff' : '#3D6AFF'"></u-icon>
                  </view>
                </view>
              </view>

              <!-- 自定义消息 -->
              <view v-else-if="message.type === 'custom'" class="custom-message">
                <view class="custom-card" @click="handleCustomMessageClick(message)">
                  <image 
                    v-if="message.custom_img" 
                    :src="message.custom_img" 
                    class="custom-image" 
                    mode="aspectFill"
                  ></image>
                  <view class="custom-info">
                    <text class="custom-title">{{ message.custom_title || '服务信息' }}</text>
                    <text class="custom-desc">{{ message.custom_desc || '' }}</text>
                  </view>
                  <view class="custom-arrow">
                    <u-icon name="arrow-right" size="24" :color="message.is_mine ? '#fff' : '#3D6AFF'"></u-icon>
                  </view>
                </view>
              </view>

              <!-- 发送状态 -->
              <view class="message-status">
                <u-icon 
                  v-if="message.status === 'sending'" 
                  name="loading" 
                  size="24" 
                  color="#999"
                ></u-icon>
                <u-icon 
                  v-else-if="message.status === 'failed'" 
                  name="close" 
                  size="24" 
                  color="#FF4D4F"
                  @click="resendMessage(message)"
                ></u-icon>
                <text v-else class="message-time">{{ $C.formatDateSmart(message.created_at) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 浮动服务按钮 -->
    <view v-if="serviceInfo" class="floating-service-btn" @click="sendServiceMessage">
      <image :src="serviceInfo.img" class="service-btn-image" mode="aspectFill"></image>
    </view>

    <!-- 输入区域 -->
    <view class="chat-input">
      <!-- 输入框 -->
      <view class="input-container">
        <view class="input-box">
          <u-input
            v-model="inputText"
            placeholder="输入消息..."
            :custom-style="inputStyle"
            :maxlength="500"
            @confirm="sendTextMessage"
            @input="onInputChange"
          ></u-input>
        </view>
        
        <!-- 功能按钮 -->
        <view class="input-actions">
          <!-- 图片按钮 -->
          <view class="action-btn" @click="chooseImage">
            <u-icon name="photo" size="48" color="#3D6AFF"></u-icon>
          </view>
          
          <!-- 发送按钮 -->
          <view 
            class="send-btn" 
            :class="{ 'send-btn-active': inputText.trim() }"
            @click="sendTextMessage"
          > 
            <text class="send-btn-text">发送</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getMessageHistory, 
  getRoomDetail 
} from '@/utils/api'
import { uploadFileInChunks } from '@/utils/upload'
import socket from '@/utils/socket'

export default {
  data() {
    return {
      // 消息列表
      messageList: [],
      
      // 输入相关
      inputText: '',
      inputStyle: {
        backgroundColor: '#F5F6FA',
        borderRadius: '24rpx',
        padding: '12rpx 16rpx',
        fontSize: '28rpx',
        color: '#333'
      },
      

      
      // 加载状态
      loading: false,
      loadingMore: false,
      
      // 分页
      page: 1,
      pageSize: 20,
      hasMore: true,
      roomInfo:{},
      // 聊天室ID
      roomId: '',
      roomName: '',
      userMap: {}, // 用户ID到用户信息的映射
      socketListenersInitialized: false, // 防止重复注册事件监听器
      hasJoinedRoom: false, // 防止重复加入房间
      scrollTop: 0, // 用于控制scroll-view的滚动位置
      serviceInfo: null // 服务信息，用于浮动按钮
    }
  },
  
  onLoad(options) {
    //#/pages/chat/chat?room_id=42&room_name=%25E6%259C%258D%25E5%258A%25A8%25E5%2592%25A8%25E8%25AF%25A2

    this.roomId = options.room_id || ''
    // this.roomName =decodeURIComponent(options.room_name) || ''
    // uni.setNavigationBarTitle({
    //   title: this.roomName
    // })
   this.initChat()
  },
  
  onUnload() {
    this.leaveChatRoom()
    // 清理事件监听器
    this.removeSocketListeners()
    // 重置标志
    this.hasJoinedRoom = false
  },
  
  async onShow() { 
    await this.getRoomInfo()

    this.loadMessages()
    // 只监听Socket事件，不重复初始化
    this.initSocketListeners()
    // 加载服务信息
    this.loadServiceInfo()
  },
  
  methods: {
    // 初始化聊天
    initChat() {
      if (!this.roomId) {
        uni.showToast({
          title: '聊天室ID不能为空',
          icon: 'none'
        })
        return
      }
      //this.getRoomInfo()
      // loadMessages() 现在在 getRoomInfo() 中调用，不需要重复调用
    },
    //获取room信息和用户信息
    async getRoomInfo() {
      const res = await getRoomDetail({ room_id: this.roomId })
      if (res.code === 0) {
        this.roomInfo = res.data 
        if(this.roomInfo.room_type==2){
          this.roomName=this.roomInfo.room_name+`(${this.roomInfo.members.length})`
        }else{ 
          //roomName=对方昵称 
          this.roomInfo.members.forEach(member => {
            if (member.id !== this.getCurrentUserId()) {
              this.roomName = member.nickname
              return
            }
          })
        }
        uni.setNavigationBarTitle({
          title: this.roomName
        })
   
        
        // 处理用户信息，创建用户映射
        this.processUserInfo(res.data.members || [])
        
        // 获取房间信息后加载消息
        this.loadMessages()
      }
    },
    
    // 处理用户信息，创建用户ID到用户信息的映射
    processUserInfo(members) {
      this.userMap = {}
      members.forEach(member => {
        this.userMap[member.id] = {
          id: member.id,
          nickname: member.nickname,
          avatar: member.avatar,
          role: member.role
        }
      })
    },
    
    // 根据用户ID获取用户信息
    getUserInfo(userId) {
      const userInfo = this.userMap[userId]
      if (userInfo) {
        return userInfo
      }
      
      // 如果用户信息不存在，返回默认信息
      //console.warn(`用户信息不存在: ${userId}, userMap:`, this.userMap)
      return {
        id: userId,
        nickname: '用户' + userId,
        avatar: '',
        role: 'member'
      }
    },
    
    // 获取当前用户信息
    getCurrentUserInfo() {
      const currentUserId = this.getCurrentUserId()
      return this.getUserInfo(currentUserId)
    },
    
    // 加载消息历史
    async loadMessages() {
      if (this.loading || !this.hasMore) return
      
      this.loading = true
      try {
        const res = await getMessageHistory({
          room_id: this.roomId,
          page: this.page,
          page_size: this.pageSize
        })
        
        if (res.code === 0) {
          const messages = (res.data.messages || []).reverse()

          const totalPages = res.data.total_pages || 1
          
          // 处理消息数据，使用房间信息中的用户数据
          const processedMessages = messages.map(msg => {
            const userInfo = this.getUserInfo(msg.sender_id)
            const processedMsg = {
              ...msg,
              id: msg.msg_id || msg.id || Date.now().toString(),
              is_mine: msg.sender_id === this.getCurrentUserId(),
              status: 'sent',
              loading: false,
              sender_nickname: userInfo.nickname,
              sender_avatar: userInfo.avatar,
              created_at: msg.created_at || new Date().toISOString()
            }
            
            // 处理自定义消息
            if (msg.type === 'custom') {
              try {
                const customData = JSON.parse(msg.content)
                processedMsg.custom_title = customData.title
                processedMsg.custom_desc = customData.desc
                processedMsg.custom_img = customData.img
                processedMsg.custom_link = customData.link
              } catch (error) {
                console.error('解析自定义消息失败:', error)
              }
            }
            
            return processedMsg
          })
          
          if (this.page === 1) {
            // 初始加载，直接设置消息列表
            this.messageList = processedMessages
            // 滚动到底部显示最新消息
            this.$nextTick(() => {
              this.scrollToBottom()
            })
          } else {
            // 加载更多历史消息，插入到前面
            this.messageList.unshift(...processedMessages)
          }
          
          // 判断是否还有更多消息：当前页码小于总页数
          this.hasMore = this.page < totalPages
          this.page++
        }
      } catch (error) {
        console.error('加载消息失败:', error)
        uni.showToast({
          title: '加载消息失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 加载更多消息
    async loadMoreMessages() {
      if (this.loadingMore || !this.hasMore) {
        return
      }
      
      this.loadingMore = true
      try {
        const res = await getMessageHistory({
          room_id: this.roomId,
          page: this.page,
          page_size: this.pageSize
        })
        
        if (res.code === 0) {
          const messages = res.data.messages || []
          const totalPages = res.data.total_pages || 1
          
          if (messages.length === 0) {
            // 没有更多消息了
            this.hasMore = false
            return
          }
          
          // 处理消息数据，使用房间信息中的用户数据
          const processedMessages = messages.map(msg => {
            const userInfo = this.getUserInfo(msg.sender_id)
            const processedMsg = {
              ...msg,
              id: msg.msg_id || msg.id || Date.now().toString(),
              is_mine: msg.sender_id === this.getCurrentUserId(),
              status: 'sent',
              loading: false,
              sender_nickname: userInfo.nickname,
              sender_avatar: userInfo.avatar,
              created_at: msg.created_at || new Date().toISOString()
            }
            
            // 处理自定义消息
            if (msg.type === 'custom') {
              try {
                const customData = JSON.parse(msg.content)
                processedMsg.custom_title = customData.title
                processedMsg.custom_desc = customData.desc
                processedMsg.custom_img = customData.img
                processedMsg.custom_link = customData.link
              } catch (error) {
                console.error('解析自定义消息失败:', error)
              }
            }
            
            return processedMsg
          })
          
          // 将新消息插入到列表前面
          this.messageList.unshift(...processedMessages)
          
          // 判断是否还有更多消息：当前页码小于总页数
          this.hasMore = this.page < totalPages
          this.page++
        }
      } catch (error) {
        console.error('加载更多消息失败:', error)
        uni.showToast({
          title: '加载更多消息失败',
          icon: 'none'
        })
      } finally {
        this.loadingMore = false
      }
    },
    
    // 发送文字消息
    async sendTextMessage() {
      const text = this.inputText.trim()
      if (!text) return
      
      // 检查是否为链接
      const isLinkMessage = this.isLink(text)
      const messageType = isLinkMessage ? 'link' : 'text'
      
      // 获取当前用户信息
      const currentUserInfo = this.getCurrentUserInfo()
      
      // 创建消息对象（临时，用于发送）
      const message = {
        id: Date.now().toString(),
        type: messageType,
        content: text,
        is_mine: true,
        status: 'sending',
        created_at: new Date().toISOString(),
        sender_id: this.getCurrentUserId(),
        sender_nickname: currentUserInfo.nickname,
        sender_avatar: currentUserInfo.avatar,
        avatar: currentUserInfo.avatar,
        link_title: isLinkMessage ? this.extractLinkTitle(text) : '',
        link_desc: isLinkMessage ? this.extractLinkDesc(text) : ''
      }
      
      // 清空输入框
      this.inputText = ''
      
      // 只通过Socket发送消息，不直接添加到消息列表
      const socketSent = this.sendMessageViaSocket(message)
      
      if (!socketSent) {
        uni.showToast({
          title: '发送失败，请检查网络连接',
          icon: 'none'
        })
      } else {
        // 发送成功后清理浮动按钮
        this.clearServiceButton()
      }
    },
    
    // 选择图片
    chooseImage() {
      const that = this
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: function(res) {
          const tempFilePaths = res.tempFilePaths
          const file = res.tempFiles[0]
          
          // 显示上传进度
          uni.showLoading({ title: '上传中...' })
          
          uploadFileInChunks(file, {
            onProgress: (percent) => {
              uni.showLoading({ title: `上传中 ${percent}%` })
            }
          }).then(res => {
            console.log('上传完成:', res)
            uni.hideLoading()
            
            if (res.code === 200) {
              // 获取当前用户信息
              const currentUserInfo = that.getCurrentUserInfo()
              
              // 创建消息对象
              const message = {
                id: Date.now().toString(),
                type: 'image',
                content: res.filePath,
                is_mine: true,
                status: 'sending',
                created_at: new Date().toISOString(),
                sender_id: that.getCurrentUserId(),
                sender_nickname: currentUserInfo.nickname,
                sender_avatar: currentUserInfo.avatar,
                avatar: currentUserInfo.avatar
              }
              
              // 通过Socket发送消息
              const socketSent = that.sendMessageViaSocket(message)
              
              if (!socketSent) {
                uni.showToast({
                  title: '发送失败，请检查网络连接',
                  icon: 'none'
                })
              } else {
                // 发送成功后清理浮动按钮
                that.clearServiceButton()
              }
            } else {
              uni.showToast({
                title: '图片上传失败',
                icon: 'none'
              })
            }
          }).catch(err => {
            console.error('上传失败:', err)
            uni.hideLoading()
            uni.showToast({
              title: '图片上传失败',
              icon: 'none'
            })
          })
        }
      })
    },
    
    // 重新发送消息
    async resendMessage(message) {
      // 只通过Socket发送消息，不直接添加到消息列表
      const socketSent = this.sendMessageViaSocket(message)
      
      if (!socketSent) {
        uni.showToast({
          title: '发送失败，请检查网络连接',
          icon: 'none'
        })
      } else {
        // 发送成功后清理浮动按钮
        this.clearServiceButton()
      }
    },
    
    // 预览图片
    previewImage(url) {
      const urls = this.messageList
        .filter(msg => msg.type === 'image')
        .map(msg => msg.content)
      
      uni.previewImage({
        current: url,
        urls: urls
      })
    },
    
    // 打开链接
    openLink(url) {
      if (this.isValidUrl(url)) {
        // #ifdef H5
        window.open(url, '_blank')
        // #endif
        
        // #ifdef MP-WEIXIN
        uni.navigateTo({
          url: `/pages/webview/webview?url=${encodeURIComponent(url)}`
        })
        // #endif
        
        // #ifdef APP-PLUS
        plus.runtime.openURL(url)
        // #endif
      } else {
        uni.showToast({
          title: '无效的链接',
          icon: 'none'
        })
      }
    },
    
    // 处理链接点击
    handleLinkClick(text) {
      if (this.isLink(text)) {
        this.openLink(text)
      }
    },
    
    // 判断是否为链接
    isLink(text) {
      const urlPattern = /^(https?:\/\/|www\.)[^\s]+/
      return urlPattern.test(text)
    },
    
    // 验证URL有效性
    isValidUrl(url) {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    },
    
    // 提取链接标题
    extractLinkTitle(url) {
      return '链接'
    },
    
    // 提取链接描述
    extractLinkDesc(url) {
      return url
    },

    // 截断文本，显示省略号
    truncateText(text, maxLength) {
      if (!text || typeof text !== 'string') {
        return '';
      }
      if (text.length <= maxLength) {
        return text;
      }
      return text.substring(0, maxLength) + '...';
    },

    // 截断URL，显示省略号
    truncateUrl(url) {
      if (!url || url.length <= 20) {
        return url;
      }
      
      // 如果是URL，尝试保留协议和域名部分
      if (this.isLink(url)) {
        try {
          const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
          const protocol = urlObj.protocol;
          const hostname = urlObj.hostname;
          const pathname = urlObj.pathname;
          const search = urlObj.search;
          
          // 计算协议和域名的长度
          const baseLength = protocol.length + hostname.length + 3; // +3 for "://"
          
          // 如果基础部分已经超过20个字符，直接截断
          if (baseLength >= 20) {
            return url.substring(0, 17) + '...';
          }
          
          // 计算剩余可用长度
          const remainingLength = 20 - baseLength - 3; // -3 for "..."
          
          if (remainingLength <= 0) {
            return `${protocol}//${hostname}...`;
          }
          
          // 截断路径部分
          const fullPath = pathname + search;
          if (fullPath.length <= remainingLength) {
            return url;
          }
          
          return `${protocol}//${hostname}${fullPath.substring(0, remainingLength)}...`;
        } catch (error) {
          // 如果URL解析失败，使用简单截断
          return url.substring(0, 17) + '...';
        }
      }
      
      // 非URL文本，直接截断
      return url.substring(0, 17) + '...';
    },
    
    // 显示时间分割线
    showTimeDivider(index) {
      if (index === 0) return true
      
      const currentMsg = this.messageList[index]
      const prevMsg = this.messageList[index - 1]
      
      if (!currentMsg.created_at || !prevMsg.created_at) return false
      
      const currentTime = new Date(currentMsg.created_at)
      const prevTime = new Date(prevMsg.created_at)
      
      // 检查日期是否有效
      if (isNaN(currentTime.getTime()) || isNaN(prevTime.getTime())) {
        return false
      }
      
      return (currentTime - prevTime) > 5 * 60 * 1000 // 5分钟间隔
    },
    
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        // 设置一个足够大的值来滚动到底部
        this.scrollTop = 999999
      })
    },
    
    // 输入变化
    onInputChange(value) {
      this.inputText = value
    },
    
    // 图片加载完成
    onImageLoad() {
      // 图片加载完成后的处理
    },
    
    // 图片加载失败
    onImageError() {
      uni.showToast({
        title: '图片加载失败',
        icon: 'none'
      })
    },
    

    
    // 获取当前用户ID
    getCurrentUserId() {
      const userInfo = uni.getStorageSync('$userinfo')
      return userInfo ? userInfo.id : ''
    },
    
    // Socket相关方法 - 只监听事件，不初始化连接
    initSocketListeners() {
      if (this.socketListenersInitialized) {
        return
      }

      // 如果Socket已连接，直接加入聊天室
      if (socket.isConnected()) {
        this.joinChatRoom()
      }
      
      socket.on('socket_connected', () => {
        console.log('Socket连接成功，加入聊天室')
        this.joinChatRoom()
      })
      
      socket.on('socket_disconnected', (data) => {
        console.log('Socket连接断开:', data)
        uni.showToast({
          title: '连接已断开，正在重连...',
          icon: 'none'
        })
      })
      
      socket.on('socket_error', (error) => {
        console.error('Socket连接错误:', error)
        uni.showToast({
          title: '连接错误，请检查网络',
          icon: 'none'
        })
      })
      
      socket.on('chat_message', (data) => {
        //console.log('收到实时消息:', data)
        this.handleRealTimeMessage(data)
      })
      
      socket.on('user_joined', (data) => {
        console.log('用户加入:', data)
        this.handleUserJoined(data)
      })
      
      socket.on('user_left', (data) => {
        console.log('用户离开:', data)
        this.handleUserLeft(data)
      })
      this.socketListenersInitialized = true
    },
    
    // 清理事件监听器
    removeSocketListeners() {
      // 清空所有事件监听器
      if (this.socketListenersInitialized) {
        socket.clearAllListeners()
        this.socketListenersInitialized = false
      }
    },
    
    // 加入聊天室
    joinChatRoom() {
      if (this.roomId && socket.isConnected() && !this.hasJoinedRoom) {
        socket.joinRoom(this.roomId)
        this.hasJoinedRoom = true
        //console.log('加入聊天室:', this.roomId)
      }
    },
    
    // 离开聊天室
    leaveChatRoom() {
      if (this.roomId && socket.isConnected() && this.hasJoinedRoom) {
        socket.leaveRoom(this.roomId)
        this.hasJoinedRoom = false
        //console.log('离开聊天室:', this.roomId)
      }
    },
    
    // 处理实时消息
    handleRealTimeMessage(data) {
      if (data.room_id !== this.roomId) {
        return
      }
      
      // 获取发送者信息
      const userInfo = this.getUserInfo(data.sender_id)
      
      const message = {
        id: data.msg_id || data.message_id || Date.now().toString(),
        type: data.type || 'text',
        content: data.content,
        is_mine: data.sender_id === this.getCurrentUserId(),
        status: 'sent',
        created_at: data.created_at || new Date().toISOString(),
        sender_id: data.sender_id,
        sender_nickname: userInfo.nickname,
        sender_avatar: userInfo.avatar,
        avatar: userInfo.avatar,
        link_title: data.link_title,
        link_desc: data.link_desc
      }
      
      // 处理自定义消息
      if (data.type === 'custom') {
        try {
          const customData = JSON.parse(data.content)
          message.custom_title = customData.title
          message.custom_desc = customData.desc
          message.custom_img = customData.img
          message.custom_link = customData.link
        } catch (error) {
          console.error('解析自定义消息失败:', error)
        }
      }
      
      this.messageList.push(message)
      
      this.$nextTick(() => {
        this.scrollToBottom()
      })
      
      // 播放消息提示音（只播放非自己发送的消息）
      if (message.sender_id !== this.getCurrentUserId()) {
        this.playMessageSound()
      }
    },
    
    // 处理用户加入
    handleUserJoined(data) {
      if (data.room_id === this.roomId && data.user_id !== this.getCurrentUserId()) {
        const userInfo = this.getUserInfo(data.user_id)
        uni.showToast({
          title: `${userInfo.nickname || '用户'} 加入了聊天`,
          icon: 'none',
          duration: 2000
        })
      }
    },
    
    // 处理用户离开
    handleUserLeft(data) {
      if (data.room_id === this.roomId && data.user_id !== this.getCurrentUserId()) {
        const userInfo = this.getUserInfo(data.user_id)
        uni.showToast({
          title: `${userInfo.nickname || '用户'} 离开了聊天`,
          icon: 'none',
          duration: 2000
        })
      }
    },
    
    // 播放消息提示音
    playMessageSound() {
      // #ifdef APP-PLUS
      try {
        const innerAudioContext = uni.createInnerAudioContext()
        innerAudioContext.src = '/static/audio/message.mp3'
        innerAudioContext.play()
      } catch (error) {
        console.error('创建音频上下文失败:', error)
      }
      // #endif
      
      // #ifdef H5
      try {
        const innerAudioContext = uni.createInnerAudioContext()
        innerAudioContext.src = '/static/audio/message.mp3'
        innerAudioContext.onError(() => {
          this.playH5Audio()
        })
        innerAudioContext.play()
      } catch (error) {
        this.playH5Audio()
      }
      // #endif
      
      // #ifdef MP-WEIXIN
      try {
        const innerAudioContext = uni.createInnerAudioContext()
        innerAudioContext.src = '/static/audio/message.mp3'
        innerAudioContext.onError((res) => {
          if (res.errMsg && res.errMsg.includes('file not found')) {
            const innerAudioContext2 = uni.createInnerAudioContext()
            innerAudioContext2.src = 'https://mp-7711da53-2e34-409c-806c-959edfd3af6c.cdn.bspapp.com/cloudstorage/message.mp3'
            innerAudioContext2.play()
          }
        })
        innerAudioContext.play()
      } catch (error) {
        console.error('创建音频上下文失败:', error)
      }
      // #endif
    },

    // H5环境下的备用音频播放方法
    playH5Audio() {
      try {
        const audio = new Audio('/static/audio/message.mp3')
        audio.volume = 0.5
        audio.play().catch(() => {})
      } catch (error) {
        console.error('创建原生Audio失败:', error)
      }
    },
    
    // 通过Socket发送消息
    sendMessageViaSocket(message) {
      if (socket.isConnected()) {
        socket.sendChatMessage(this.roomId, message)
        return true
      } else {
        console.warn('Socket未连接，无法发送消息')
        return false
      }
    },

    // 滚动到顶部事件
    onScrollToUpper() {
      //console.log('触发滚动到顶部事件 - scrolltoupper')
      // 检查是否正在加载或已经没有更多消息
      if (this.loadingMore || !this.hasMore) {
        return
      }
      this.loadMoreMessages()
    },

    // 加载服务信息
    loadServiceInfo() {
      try {
        const serviceInfo = uni.getStorageSync('chat_service_info')
        if (serviceInfo) {
          this.serviceInfo = serviceInfo
        }
      } catch (error) {
        console.error('加载服务信息失败:', error)
      }
    },

    // 发送服务消息
    sendServiceMessage() {
      if (!this.serviceInfo) {
        uni.showToast({
          title: '服务信息不存在',
          icon: 'none'
        })
        return
      }

      // 获取当前用户信息
      const currentUserInfo = this.getCurrentUserInfo()
      
      // 创建自定义消息对象
      const message = {
        id: Date.now().toString(),
        type: 'custom',
        content: JSON.stringify(this.serviceInfo),
        is_mine: true,
        status: 'sending',
        created_at: new Date().toISOString(),
        sender_id: this.getCurrentUserId(),
        sender_nickname: currentUserInfo.nickname,
        sender_avatar: currentUserInfo.avatar,
        avatar: currentUserInfo.avatar,
        custom_title: this.serviceInfo.title,
        custom_desc: this.serviceInfo.desc,
        custom_img: this.serviceInfo.img,
        custom_link: this.serviceInfo.link
      }
      
      // 通过Socket发送消息
      const socketSent = this.sendMessageViaSocket(message)
      
      if (!socketSent) {
        uni.showToast({
          title: '发送失败，请检查网络连接',
          icon: 'none'
        })
      } else {
        // 发送成功后清除缓存
        this.clearServiceButton()
      }
    },

    // 处理自定义消息点击
    handleCustomMessageClick(message) {
      if (message.custom_link) {
        uni.navigateTo({
          url: message.custom_link
        })
      }
    },

    // 清理浮动服务按钮
    clearServiceButton() {
      uni.removeStorageSync('chat_service_info')
      this.serviceInfo = null
    },

    // 返回按钮点击事件
    goBack() { 
      uni.navigateBack();
    }, 

    // 导航栏右侧按钮点击事件
    handleNavbarRightClick() {
      // 如果是群聊，跳转到群设置页面
      if (this.roomInfo && this.roomInfo.room_type == 2) {
        uni.navigateTo({
          url: `/pages/chat/group_set?room_id=${this.roomId}`
        });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-container {
  min-height:95vh;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #F5F6FA;
  position: relative;
}

/* 导航栏自定义内容样式 */
.u-nav-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10rpx;
  cursor: pointer;
  
  &:active {
    opacity: 0.6;
  }
}

.chat-messages {
  height: 95vh; 
  padding-bottom: 100rpx; /* 为浮动输入框留出空间 */
  
  /* 兼容性处理 - 不同平台的底部间距 */
  /* #ifdef H5 */
  padding-bottom: 100rpx;
  /* #endif */
  
  /* #ifdef MP-WEIXIN */
  padding-bottom: 100rpx;
  /* #endif */
  
  /* #ifdef APP-PLUS */
  padding-bottom: 100rpx;
  /* #endif */
  
  .loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32rpx;
    
    .loading-text {
      font-size: 24rpx;
      color: #999;
      margin-left: 16rpx;
    }
  }
  
  .message-list {
    padding: 32rpx;
    .message-item {
      margin-bottom: 32rpx;
      
      .time-divider {
        display: flex;
        justify-content: center;
        margin: 32rpx 0;
        
        .time-text {
          font-size: 24rpx;
          color: #999;
          background-color: #F0F0F0;
          padding: 8rpx 24rpx;
          border-radius: 24rpx;
        }
      }
      
      .message-content {
        display: flex;
        align-items: flex-start;
        
        .message-avatar {
          width: 80rpx;
          height: 80rpx;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 24rpx;
          
          .avatar-img,
          .default-avatar {
            width: 100%;
            height: 100%;
            
            .default-icon {
              width: 100%;
              height: 100%;
            }
          }
        }
        
        .message-bubble {
          flex: 1;
          max-width: 70%;
          
          .text-message {
            background-color: #fff;
            padding: 24rpx 32rpx;
            border-radius: 24rpx;
            margin-bottom: 16rpx;
            max-width: 100%;
            overflow: hidden;
            
            .message-text {
              font-size: 28rpx;
              color: #333;
              line-height: 1.5;
              word-break: break-all;
              word-wrap: break-word;
              max-width: 100%;
              
              &.link-text {
                color: #3D6AFF;
                text-decoration: underline;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                display: block;
                max-width: 100%;
              }
            }
          }
          
          .image-message {
            position: relative;
            margin-bottom: 16rpx;
            
            .message-image {
              max-width: 100%;
              max-height: 400rpx;
              border-radius: 16rpx;
            }
            
            .image-loading {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background-color: rgba(0, 0, 0, 0.5);
              border-radius: 16rpx;
              padding: 32rpx;
            }
          }
          
          .link-message {
            margin-bottom: 16rpx;
            
            .link-card {
              background-color: #fff;
              border-radius: 16rpx;
              padding: 24rpx;
              display: flex;
              align-items: center;
              border: 2rpx solid #F0F0F0;
              max-width: 100%;
              overflow: hidden;
              
              .link-info {
                flex: 1;
                min-width: 0; /* 确保flex子元素可以收缩 */
                
                .link-title {
                  font-size: 28rpx;
                  font-weight: 500;
                  color: #333;
                  margin-bottom: 8rpx;
                  display: block;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
                
                .link-desc {
                  font-size: 24rpx;
                  color: #666;
                  margin-bottom: 8rpx;
                  display: block;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
                
                .link-url {
                  font-size: 22rpx;
                  color: #3D6AFF;
                  display: block;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                }
              }
              
              .link-icon {
                margin-left: 24rpx;
                flex-shrink: 0; /* 防止图标被压缩 */
              }
            }
          }
          
          .message-status {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-top: 8rpx;
            
            .message-time {
              font-size: 22rpx;
              color: #999;
            }
          }
        }
      }
      
      &.message-mine {
        .message-content {
          flex-direction: row-reverse;
          
          .message-avatar {
            margin-right: 0;
            margin-left: 24rpx;
          }
          
          .message-bubble {
            .text-message {
              background-color: #3D6AFF;
              
              .message-text {
                color: #fff;
                
                &.link-text {
                  color: #fff;
                  text-decoration: underline;
                }
              }
            }
            
            .link-message {
              .link-card {
                background-color: #3D6AFF;
                border-color: #3D6AFF;
                
                .link-info {
                  .link-title {
                    color: #fff !important;
                  }
                  
                  .link-desc {
                    color: #fff !important;
                  }
                  
                  .link-url {
                    color: #E6F3FF !important;
                  }
                }
                
                .link-icon {
                  color: #fff;
                }
              }
            }
          }
        }
      }
    }
  }
}

.chat-input {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  border-top: 2rpx solid #F0F0F0;
  padding: 12rpx 32rpx;
  padding-bottom: calc(12rpx + env(safe-area-inset-bottom)); /* 适配安全区域 */
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  z-index: 999;
  
  /* 兼容性处理 */
  /* #ifdef H5 */
  padding-bottom: 12rpx;
  /* #endif */
  
  /* #ifdef MP-WEIXIN */
  padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
  /* #endif */
  
  /* #ifdef APP-PLUS */
  padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
  /* #endif */
  
  .input-container {
    display: flex;
    align-items: center;
    
    .input-box {
      flex: 1;
      margin-right: 24rpx;
    }
    
    .input-actions {
      display: flex;
      align-items: center;
      
      .action-btn {
        width: 80rpx;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16rpx;
      }
      
      .send-btn {
        min-width: 120rpx;
        height: 72rpx;
        border-radius: 36rpx;
        background-color: #F0F0F0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
        padding: 0 24rpx;
        
        .send-btn-text {
          font-size: 28rpx;
          color: #999;
          font-weight: 500;
        }
        
        &.send-btn-active {
          background-color: #3D6AFF;
          
          .send-btn-text {
            color: #fff;
          }
        }
      }
    }
  }
}

/* 浮动服务按钮 */
.floating-service-btn {
  position: fixed;
  bottom: 120rpx;
  right: 32rpx;
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 8rpx 32rpx rgba(61, 106, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 998;
  border: 4rpx solid #3D6AFF;
  
  .service-btn-image {
    width: 100%;
    height: 100%;
    border-radius: 12rpx;
  }
  
  &:active {
    transform: scale(0.95);
  }
}

/* 自定义消息样式 */
.custom-message {
  margin-bottom: 16rpx;
  
  .custom-card {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    display: flex;
    align-items: center;
    border: 2rpx solid #F0F0F0;
    max-width: 100%;
    overflow: hidden;
    
    .custom-image {
      width: 120rpx;
      height: 120rpx;
      border-radius: 12rpx;
      margin-right: 24rpx;
      flex-shrink: 0;
    }
    
    .custom-info {
      flex: 1;
      min-width: 0;
      
      .custom-title {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 8rpx;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .custom-desc {
        font-size: 24rpx;
        color: #666;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1.4;
      }
    }
    
    .custom-arrow {
      margin-left: 16rpx;
      flex-shrink: 0;
    }
  }
}

/* 我的自定义消息样式 */
.message-mine {
  .custom-message {
    .custom-card {
      background-color: #3D6AFF;
      border-color: #3D6AFF;
      
      .custom-info {
        .custom-title {
          color: #fff !important;
        }
        
        .custom-desc {
          color: #E6F3FF !important;
        }
      }
      
      .custom-arrow {
        color: #fff;
      }
    }
  }
}
</style>
