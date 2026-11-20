import Redis, { Redis as RedisType } from 'ioredis';
import { config } from '../config/config';

let redisInstance: RedisType;

const getRedis = (): RedisType => {
    if (!redisInstance) {
        redisInstance = new Redis({
            host: config.REDIS_ADDR,
            port: config.REDIS_PORT,
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            retryStrategy: (times) => Math.min(times * 50, 2000),
        });

        redisInstance.on('connect', () => {
            console.log('✅ Redis (ioredis) 连接成功');
        });

        redisInstance.on('error', (err) => {
            console.error('Redis (ioredis) 错误', err);
        });
    }
    return redisInstance;
};

// // 如有极特殊需求才用 node-redis v4，默认全项目只用 ioredis
// import { createClient } from 'redis';
// let redisClient;
// const getNodeRedis = () => {
//     if (!redisClient) {
//         redisClient = createClient({
//             socket: {
//                 host: config.REDIS_ADDR,
//                 port: config.REDIS_PORT,
//                 reconnectStrategy: (retries) => 100
//             },
//         });
//         redisClient.on('connect', () => {
//             console.log('✅ Redis (node-redis) 连接成功');
//         });
//         redisClient.on('error', (err) => {
//             console.error('Redis (node-redis) 错误', err);
//         });
//         redisClient.connect().catch(err => {
//             console.error('连接Redis失败', err);
//         });
//     }
//     return redisClient;
// };

export { getRedis };