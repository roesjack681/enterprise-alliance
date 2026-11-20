module.exports = {
  apps: [{
    name: 'enterprise-admin-api',
    script: 'app-adminapi.min.js',
    interpreter: 'node',
    env: {
      NODE_ENV: 'production',
      PORT: 9007 // 设置端口号，与config.HOST_PORT一致
    },
    watch: true, // 监听文件变化自动重启
    ignore_watch: ['node_modules', 'logs'], // 忽略监听的目录
    instances: '1', // 根据CPU核心数启动多个实例
    exec_mode: 'cluster', // 集群模式
    error_file: './logs/err.log', // 错误日志路径
    out_file: './logs/out.log', // 输出日志路径
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
};