/**
 * Socket工具类 - 支持用户认证
 * 提供Socket连接管理和消息处理的基础功能
 */

import io from '@hyoga/uni-socket.io';
class SocketManager {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.eventHandlers = new Map();
    this.initializing = false; // 防止重复初始化
    this.lastReconnectTime = 0; // 记录上次重连时间
    this.reconnectTimer = null; // 重连定时器
  }

  /**
   * 获取认证参数
   */
  getAuthParams() {
    const token = uni.getStorageSync('token');
    
    if (!token) {
      console.warn('token不存在，无法建立Socket连接');
      return null;
    }

    return {
      token: token
    };
  }

  /**
   * 初始化Socket连接（带认证）
   */
  init() {
    if (this.initializing || (this.socket && this.connected)) {
      return;
    }

    if (this.socket) {
      this.disconnect();
    }

    this.initializing = true;
    const authParams = this.getAuthParams();
    if (!authParams) {
      this.initializing = false;
      return;
    }

    setTimeout(() => {
      this.createConnection(authParams);
    }, 500);
  }

  /**
   * 创建Socket连接
   */
  createConnection(authParams) {
    const baseUrl = this.getSocketBaseUrl();
    const socketUrl = `${baseUrl}?token=${encodeURIComponent(authParams.token)}`;

    this.socket = io(socketUrl, {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
      transports: ['websocket'],
      upgrade: false,
      forceNew: true,
      query: authParams
    });

    this.socket.on('connect', () => {
      this.connected = true;
      this.initializing = false;
      this.emit('socket_connected');
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      this.initializing = false;
      this.emit('socket_disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      this.initializing = false;
      this.emit('socket_error', error);
    });

    this.socket.on('error', (error) => {
      this.initializing = false;
      this.emit('socket_error', error);
    });

    // 监听聊天相关事件
    this.socket.on('newMessage', (data) => {
      this.emit('chat_message', data);
    });

    this.socket.on('user_joined', (data) => {
      this.emit('user_joined', data);
    });

    this.socket.on('user_left', (data) => {
      this.emit('user_left', data);
    });

    // 监听所有消息
    this.socket.on('message', (data) => {
      this.handleMessage(data);
    });
  }

  /**
   * 获取Socket基础URL
   */
  getSocketBaseUrl() {
	return "/";
    //return "http://115.190.133.216:3009"  //小程序socket通信地址
  }

  /**
   * 处理接收到的消息
   */
  handleMessage(message) {
    let eventType, data;
    
    if (typeof message === 'object' && message.type) {
      eventType = message.type;
      data = message.data || message;
    } else {
      data = message;
      eventType = data.type || 'default';
    }
    
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Socket事件处理错误:', error);
        }
      });
    }
  }

  /**
   * 发送消息
   */
  send(eventType, data) {
    if (this.socket && this.connected) {
      this.socket.emit(eventType, data);
    }
  }

  /**
   * 加入聊天室
   */
  joinRoom(roomId) {
    if (this.socket && this.connected) {
      this.socket.emit('joinRoom', roomId);
    }
  }

  /**
   * 离开聊天室
   */
  leaveRoom(roomId) {
    if (this.socket && this.connected) {
      this.socket.emit('leaveRoom', roomId);
    }
  }

  /**
   * 发送聊天消息
   */
  sendChatMessage(roomId, message) {
    if (this.socket && this.connected) {
      const messageData = {
        roomId: roomId,
        content: message.content,
        type: message.type
      }
      
      // 添加链接消息的额外字段
      if (message.link_title) {
        messageData.link_title = message.link_title
      }
      if (message.link_desc) {
        messageData.link_desc = message.link_desc
      }
      
      // 添加自定义消息的额外字段
      if (message.type === 'custom') {
        messageData.custom_title = message.custom_title
        messageData.custom_desc = message.custom_desc
        messageData.custom_img = message.custom_img
        messageData.custom_link = message.custom_link
      }
      
      this.socket.emit('sendMessage', messageData);
    }
  }

  /**
   * 监听事件
   */
  on(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(handler);
  }

  /**
   * 取消监听事件
   */
  off(eventType, handler) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 清除所有事件监听器
   */
  clearAllListeners() {
    this.eventHandlers.clear();
  }

  /**
   * 触发事件
   */
  emit(eventType, data) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Socket事件处理错误:', error);
        }
      });
    }
  }

  /**
   * 检查连接状态
   */
  isConnected() {
    return this.connected;
  }

  /**
   * 重新连接（带频率限制）
   */
  reconnect() {
    const now = Date.now();
    if (this.lastReconnectTime && now - this.lastReconnectTime < 10000) {
      return;
    }
    
    this.lastReconnectTime = now;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.disconnect();
    
    this.reconnectTimer = setTimeout(() => {
      this.init();
      this.reconnectTimer = null;
    }, 2000);
  }

  /**
   * 登录后重新初始化连接
   * 用于用户登录成功后重新建立socket连接
   */
  reinitAfterLogin() {
    this.disconnect();
    this.initializing = false;
    this.init();
  }

  /**
   * 检查是否需要重新连接（带频率限制）
   * 用于检查token是否有效，如果无效则断开连接
   */
  checkConnectionStatus() {
    const token = uni.getStorageSync('token');
    
    if (!token && this.connected) {
      this.disconnect();
      return;
    }
    
    if (token && !this.connected && !this.initializing) {
      const now = Date.now();
      if (!this.lastReconnectTime || now - this.lastReconnectTime > 10000) {
        this.lastReconnectTime = now;
        this.init();
      }
    }
  }

  /**
   * 断开连接（完全清理）
   */
  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.initializing = false;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

// 创建单例实例
const socket = new SocketManager();

export default socket; 