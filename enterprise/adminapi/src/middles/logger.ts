import winston from 'winston';
import morgan from 'morgan';

// Winston 配置
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(), // 日志输出到控制台
    new winston.transports.File({ filename: 'logs/app.log' }) // 日志写入文件
  ]
});
const httpLogger = morgan(
  JSON.stringify({
    '时间': ':date[iso]',
    '客户端IP': ':remote-addr',
    '请求方法': ':method',
    '请求路径': ':url',
    'HTTP版本': ':http-version',
    '状态码': ':status',
    '响应大小(字节)': ':res[content-length]',
    '来源页面': ':referrer',
    '用户代理': ':user-agent',
    '响应时间(毫秒)': ':response-time'
  }),
  {
    stream: { write: (message) => logger.info(JSON.parse(message)) }
  }
);

export { logger, httpLogger };