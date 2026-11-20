/**
 * Socket Mixin - 简化版
 * 提供Socket事件管理的混入功能
 */
import socket from '@/utils/socket.js';

export default {
  data() {
    return {
      // Socket事件处理器映射
      socketHandlers: {}
    }
  },

  methods: {
    /**
     * 监听Socket事件
     * @param {string} eventType 事件类型
     * @param {function} handler 处理函数
     */
    socketOn(eventType, handler) {
      socket.on(eventType, handler);
      // 保存处理器引用，用于清理
      if (!this.socketHandlers[eventType]) {
        this.socketHandlers[eventType] = [];
      }
      this.socketHandlers[eventType].push(handler);
    },

    /**
     * 取消监听Socket事件
     * @param {string} eventType 事件类型
     * @param {function} handler 处理函数
     */
    socketOff(eventType, handler) {
      socket.off(eventType, handler);
      // 从保存的处理器中移除
      if (this.socketHandlers[eventType]) {
        const index = this.socketHandlers[eventType].indexOf(handler);
        if (index > -1) {
          this.socketHandlers[eventType].splice(index, 1);
        }
      }
    },

    /**
     * 发送Socket消息
     * @param {string} eventType 事件类型
     * @param {object} data 消息数据
     */
    socketSend(eventType, data) {
      socket.send(eventType, data);
    },

    /**
     * 检查Socket连接状态
     * @returns {boolean}
     */
    isSocketConnected() {
      return socket.isConnected();
    },

    /**
     * 清理所有Socket监听器
     */
    clearSocketListeners() {
      Object.keys(this.socketHandlers).forEach(eventType => {
        this.socketHandlers[eventType].forEach(handler => {
          socket.off(eventType, handler);
        });
      });
      this.socketHandlers = {};
    }
  },

  onLoad() {
    // 子组件可以重写此方法来自定义Socket事件监听
  },

  onShow() {
    // 页面显示时检查Socket连接状态
    if (!socket.isConnected()) {
      console.log('页面显示时检测到Socket未连接，尝试连接');
      socket.checkConnectionStatus();
    }
  },

  onHide() {
    // 页面隐藏时不断开连接，但可以在这里做一些清理工作
    // 注意：不要在这里断开Socket连接，因为用户可能只是切换页面
  },

  onUnload() {
    // 页面卸载时清理所有Socket监听器
    this.clearSocketListeners();
    
    // 检查是否还有其他页面在使用Socket
    // 如果这是最后一个使用Socket的页面，可以考虑断开连接
    // 但通常建议保持连接，让Socket管理器自己处理
  }
} 