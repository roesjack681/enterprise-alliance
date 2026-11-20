import Redis, { Redis as RedisClient } from 'ioredis';
import { createPool, Pool } from 'generic-pool';
import { config } from '../config/config';

// 创建 Redis 连接实例工厂
const factory = {
  create: async (): Promise<RedisClient> => {
    const client = new Redis({
      host: config.REDIS_ADDR,
      port: config.REDIS_PORT,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    });

    // 监听 Redis 事件
    client.on('connect', () => {
      console.log(`✅ Redis connected [${client.options.host}:${client.options.port}]`);
    });

    // client.on('ready', () => {
    //   console.log(`🎯 Redis ready [${client.options.host}:${client.options.port}]`);
    // });

    client.on('error', (err) => {
      console.error('❌ Redis error', err);
    });

    client.on('close', () => {
      console.warn('⚠️ Redis connection closed');
    });

    // client.on('reconnecting', () => {
    //   console.info('🔄 Redis reconnecting...');
    // });

    return client;
  },

  destroy: async (client: RedisClient) => {
    await client.quit();
  },
};

// 创建 Redis 连接池
const redisPool: Pool<RedisClient> = createPool(factory, {
  min: 2,
  max: 200, // 高并发支持
  idleTimeoutMillis: 30000,
  acquireTimeoutMillis: 10000,
});

// 封装 Redis 操作函数
export async function useRedis<T>(callback: (client: RedisClient) => Promise<T>): Promise<T> {
  const client = await redisPool.acquire();
  try {
    return await callback(client);
  } finally {
    await redisPool.release(client);
  }
}

// 可选：定期输出连接池状态（调试用）
// setInterval(() => {
//   console.log('📊 Redis Pool Status:', {
//     used: redisPool.borrowed,
//     idle: redisPool.available,
//     pending: redisPool.pending,
//   });
// }, 30000); // 每 30 秒打印一次

// 导出连接池（如需手动操作）
export { redisPool };
