import { Sequelize } from "sequelize";
import { config } from "../config/config"; 
import mysql2 = require('mysql2');

export const sequelize = new Sequelize(config.MYSQL_DB, config.MYSQL_USER, config.MYSQL_PASSWORD, {
    host: config.MYSQL_HOST,
    dialect: "mysql",
    dialectModule: mysql2, // Needed to fix sequelize issues with WebPack
    pool: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 30000, // 延长空闲时间到30秒
        evict: 60000, // 每60秒检测一次空闲连接 
    },    
    logging: false
});

// 定期发送心跳查询，保持连接活跃
setInterval(async () => {
    try {
        await sequelize.query('SELECT 1');
    } catch (err) {
        // 心跳查询失败，静默处理
    }
}, 30000); // 每30秒执行一次心跳查询