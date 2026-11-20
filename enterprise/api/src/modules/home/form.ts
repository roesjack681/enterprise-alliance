import { body } from 'express-validator';

// 获取首页配置表单验证
export const getHomeConfigForm = [
  body("ids").custom((value) => {
    // 支持数组格式 [3, 4] 或字符串格式 "3,4"
    if (Array.isArray(value)) {
      return value.length > 0 && value.every(id => Number.isInteger(Number(id)) && Number(id) > 0);
    } else if (typeof value === 'string') {
      const ids = value.split(',').map(id => id.trim());
      return ids.length > 0 && ids.every(id => /^\d+$/.test(id) && Number(id) > 0);
    }
    return false;
  })
];