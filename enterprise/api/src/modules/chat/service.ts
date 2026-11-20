import { createAdapter } from "@socket.io/redis-adapter";
import Redis from 'ioredis';
import { Server as SocketIOServer, Socket } from 'socket.io';
import mongoose, { Schema, Document } from 'mongoose';
import { getRedis } from '../../storage/redis';
import { ResponseData, rpcResult, TokenData } from '../app/proto';
import { MongoBase, BaseDoc } from '../../storage/mongodb';
import { rpcPost } from '../../common/common';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config/config';
import { redisPool } from '../../storage/redisPool';
import {
  UserRoomQueryModel,
  CreateUserRoomModel,
  UpdateUserRoomModel,
} from './proto';

// MongoDB 消息模型定义 
interface IChatMessage extends Document {
  msg_id: string;
  room_id: string;
  sender_id: number;
  type: string; // text/image/file
  content: string;
  title: string;
  mentions?: number[];
  reply_to?: string;
  is_revoked: boolean;
  read_by: number[];
  created_at: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
    msg_id: { type: String, required: true, unique: true, index: true },
    room_id: { type: String, required: true, index: true },
    sender_id: { type: Number, required: true },
    type: { type: String, required: true, default: 'text' },
    content: { type: String, required: true },
    mentions: { type: [Number] },
    reply_to: { type: String },
    is_revoked: { type: Boolean, default: false },
    read_by: { type: [Number] },
    created_at: { type: Date, default: Date.now },
});

// 为每个房间创建一个动态的 Collection
const getMessageModel = (roomId: string) => {
    return mongoose.model<IChatMessage>(`room_messages_${roomId}`, chatMessageSchema);
};

// 定义 Redis Key 的命名规范
const RedisKey = {
    // 用户维度
    userOnline: (uid: number) => `user:${uid}:online`,
    userRooms: (uid: number) => `user:${uid}:rooms`,
    userSockets: (uid: number) => `user:${uid}:sockets`,
    userInfo: (uid: number) => `user:${uid}:info`, // 新增：用户详细信息缓存
    
    // 房间维度
    roomUsers: (rid: number) => `room:${rid}:users`,
    roomUserDetails: (rid: number) => `room:${rid}:user_details`, // 新增：房间用户详细信息
    roomUserUnreadCount: (rid: number) => `room:${rid}:user_unread_count`, // 房间内每个用户的未读计数
    roomOnlineStatus: (rid: number) => `room:${rid}:online_status`,
    roomMessages: (rid: number) => `room:${rid}:messages`,
    roomMeta: (rid: number) => `room:${rid}:meta`,
    roomActiveCount: (rid: number) => `room:${rid}:active_count`,
    roomMutedUsers: (rid: number) => `room:${rid}:muted_users`,

    // 队列和锁
    queueReloadUserCache: 'queue:reload_user_cache',
    lockRoomLoad: (rid: number) => `lock:room:${rid}:load`,
};

// 定义用户详情接口
interface IMemberDetail {
    id: number;
    nickname: string;
    avatar: string;
    role?: string;
}

export class ChatService {
    private io: SocketIOServer;
    // private onlineUsers: Map<string, number>; // socket.id -> userId
    private chatMessageModel: MongoBase<IChatMessage & BaseDoc>;

    constructor(io: SocketIOServer) {
        this.io = io;
        // this.onlineUsers = new Map();

        // pub/sub client 用独立 new Redis()，不再用 duplicate
        const pubClient = new Redis({ host: config.REDIS_ADDR, port: config.REDIS_PORT });
        const subClient = new Redis({ host: config.REDIS_ADDR, port: config.REDIS_PORT });
        this.io.adapter(createAdapter(pubClient, subClient));

        this.initializeSocketListeners();
        this.initializeQueueWorker();
        this.initializeMessageQueueProcessor(); // 初始化消息队列处理器
    }

    /**
     * 初始化 Socket.IO 事件监听
     */
    private initializeSocketListeners() {
        this.io.on('connection', async (socket) => {
            // console.log('socket connection', socket.id);
            let userId: number | null = null;
            let token: string | null = null;

            const authData = await this.authenticateUser(socket);
            if (authData) {
                userId = authData.userId;
                token = authData.token;
                await this.handleUserOnline(userId, socket.id, token);
            }

            // 心跳处理
            socket.on('heartbeat', async () => {
                if (userId) {
                    const redis = await redisPool.acquire();
                    try {
                        await redis.expire(RedisKey.userOnline(userId), 60);
                    } finally {
                        await redisPool.release(redis);
                    }
                }
            });

            socket.on('sendMessage', async (data: { roomId: string; content: string; type?: string; replyTo?: string; mentions?: number[] }) => {
                if (userId && token) {
                    // Pass the token to handleSendMessage
                    await this.handleSendMessage(socket, userId, data, token);
                }
            });

            socket.on('joinRoom', (roomId) => {
                if (userId && token) {
                    this.handleJoinRoom(socket, roomId, userId, token);
                }
            });

            socket.on('leaveRoom', (roomId) => {
                if (userId) {
                    this.handleLeaveRoom(socket, roomId, userId);
                }
            });

            socket.on('disconnect', () => {
               // console.log('用户下线:', userId, 'socket.id:', socket.id);
                if (userId) {
                    this.handleUserOffline(userId, socket.id, token);
                    // this.onlineUsers.delete(socket.id);
                }
            });
        });
    }

    /**
     * 模拟用户认证
     * 在真实场景中，这里应该解析 JWT token
     * 现在它返回 userId 和 token
     */
    private async authenticateUser(socket: Socket): Promise<{ userId: number,token: string} | null> {
        const token =<string> socket.handshake.query.token;
        let result = await rpcPost('/auth/parse-token', { token },token);
        if (result.code == 0){ 
            return { userId:  result["data"]["id"],token: token}; 
        } 
        socket.disconnect();
        return null;
    }

    /**
     * 初始化队列处理器
     * 用于处理用户上线后的缓存预热等任务
     */
    private initializeQueueWorker() {
        const processQueue = async () => {
            while (true) {
                try {
                    const redis = await redisPool.acquire();
                    let task;
                    try {
                        task = await redis.blpop(RedisKey.queueReloadUserCache, 0);
                    } finally {
                        await redisPool.release(redis);
                    }
                    if (task) {
                        // task 是一个数组 [queueName, value]
                        const userId = task[1];
                        await this.loadUserCache(userId, 'system_internal_token');
                    }
                } catch (error) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        };
        processQueue();
    }
    

    /**
     * 处理用户上线
     * @param userId 
     * @param socketId 
     */
    public async handleUserOnline(userId: number, socketId: string, token: string) {
        // 1. 将 socket.id 添加到用户的 socket 集合
        const redis = await redisPool.acquire();
        try {
            await redis.sadd(RedisKey.userSockets(userId), socketId);
        } finally {
            await redisPool.release(redis);
        }
        // 2. 设置用户在线状态，并设置60秒过期，由心跳续期
        const redis2 = await redisPool.acquire();
        try {
            await redis2.set(RedisKey.userOnline(userId), 1, 'EX', 60);
        } finally {
            await redisPool.release(redis2);
        }

        // 3. 将用户加入其所有房间的 Socket.IO Room
        const roomIds = await this.getUserRoomsFromDB(userId, token); // Pass token here
        for (const roomId of roomIds) {
            await this.io.in(socketId).socketsJoin(String(roomId));
            // 4. 更新房间的在线状态和人数
            const redis3 = await redisPool.acquire();
            try {
                await redis3.hset(RedisKey.roomOnlineStatus(roomId), String(userId), 1);
            } finally {
                await redisPool.release(redis3);
            }
            const redis4 = await redisPool.acquire();
            try {
                await redis4.incr(RedisKey.roomActiveCount(roomId));
            } finally {
                await redisPool.release(redis4);
            }
        }
        
        // 5. 缓存用户详细信息到所有相关房间
        try {
            // 获取用户详细信息
            const userInfo = await this.getUserDetails(userId, token);
            if (userInfo) {
                // 更新所有相关房间的用户详情缓存
                for (const roomId of roomIds) {
                    await this.updateRoomUserDetailsCache(roomId, token);
                }
            }
        } catch (error) {
            console.error('Failed to cache user details on online:', error);
        }
        
        // 6. 推送上线任务到队列，进行缓存预热
        const redis5 = await redisPool.acquire();
        try {
            await redis5.lpush(RedisKey.queueReloadUserCache, String(userId));
        } finally {
            await redisPool.release(redis5);
        }
    }

    /**
     * 获取用户所在的所有房间ID（优先从缓存获取）
     */
    private async getUserRoomsFromDB(userId: number, token: string): Promise<number[]> {
        // 1. 优先从Redis缓存获取
        const redis = await redisPool.acquire();
        let roomIds: number[] = [];
        try {
            const roomIdsStr = await redis.smembers(RedisKey.userRooms(userId));
            roomIds = roomIdsStr.map(id => parseInt(id, 10));
            
            // 如果缓存中有数据，直接返回
            if (roomIds.length > 0) {
                return roomIds;
            }
        } finally {
            await redisPool.release(redis);
        }

        // 2. 缓存未命中，从数据库查询
        const dbRoomIds: number[] = [];
        for (let i = 0; i < 10; i++) {
            const sql = `SELECT room_id FROM chat_room_user_${i} WHERE is_kicked=0 and user_id = ?`;
            try {
                const res = await rpcPost("/select", { sql, params: [userId] }, token);
                if (res.code === 0 && res.data.result !== 'null') {
                    const results = JSON.parse(res.data.result);
                    dbRoomIds.push(...results.map((r: { room_id: number }) => r.room_id));
                }
            } catch (error) {
                // 忽略单个分表的错误
            }
        }

        // 3. 将查询结果缓存到Redis
        if (dbRoomIds.length > 0) {
            const redis2 = await redisPool.acquire();
            try {
                await redis2.sadd(RedisKey.userRooms(userId), ...dbRoomIds.map(r => String(r)));
                // 设置缓存过期时间（1小时）
                await redis2.expire(RedisKey.userRooms(userId), 3600);
            } finally {
                await redisPool.release(redis2);
            }
        }

        return dbRoomIds;
    }

    /**
     * 加载用户缓存（由 Worker 调用）
     */
    public async loadUserCache(userId: string, token: string) {
        const userIdNum = parseInt(userId, 10);
        // 此处调用没有 token，依赖于 rpcPost 底层服务能够处理来自内部服务的可信请求
        // getUserRoomsFromDB 现在已经包含了缓存逻辑，无需重复缓存
        await this.getUserRoomsFromDB(userIdNum, token);
    }
    
    /**
     * 处理用户下线
     * @param userId 
     * @param socketId 
     */
    public async handleUserOffline(userId: number, socketId: string, token: string) {
        // // 1. 从用户的 socket 集合中移除
        // const redis = await redisPool.acquire();
        // try {
        //     await redis.srem(RedisKey.userSockets(userId), socketId);
        // } finally {
        //     await redisPool.release(redis);
        // }

        // // 2. 检查用户是否还有其他在线的 socket
        // const redis2 = await redisPool.acquire();
        // let remainingSockets;
        // try {
        //     remainingSockets = await redis2.scard(RedisKey.userSockets(userId));
        // } finally {
        //     await redisPool.release(redis2);
        // }

        // 3. 如果没有其他在线 socket，则标记为离线
        // if (remainingSockets === 0) {
            // const redis3 = await redisPool.acquire();
            // try {
            //     await redis3.del(RedisKey.userOnline(userId));
            // } finally {
            //     await redisPool.release(redis3);
            // }

            // 4. 更新所有相关房间的在线状态和人数
            const roomIds = await this.getUserRoomsFromRedis(userId);
            for (const roomId of roomIds) {
                const redis4 = await redisPool.acquire();
                // console.log('准备删除用户:', userId, '从房间:', roomId);
                // console.log('Redis键:', RedisKey.roomOnlineStatus(roomId));
                try {
                    const result = await redis4.hset(RedisKey.roomOnlineStatus(roomId), String(userId), 0);
                    // 减少房间活跃人数
                    await redis4.decr(RedisKey.roomActiveCount(roomId));
                } catch (error) {
                    // console.error('删除失败:', error);
                } finally {
                    await redisPool.release(redis4);
                }
                const redis5 = await redisPool.acquire();
                try {
                    // 5. 检查房间在线状态键中所有值是否全为0来判断是否还有活跃用户
                    const allValues = await redis5.hvals(RedisKey.roomOnlineStatus(roomId));
                    const allZero = allValues.length === 0 || allValues.every(value => value === '0');
                    if (allZero) {
                        //console.log('房间所有用户状态值全为0，说明没有活跃用户，保存最后一条消息信息到数据库',token);
                        // 如果房间所有用户状态值全为0，说明没有活跃用户，保存最后一条消息信息到数据库
                        await this.saveLastMessageToRoom(roomId, token);
                    }
                } finally {
                    await redisPool.release(redis5);
                }
            }
                        //先把redis中此用户user前缀的全部删除
                        const redis3 = await redisPool.acquire();
                        try {
                            // 使用 SCAN 命令查找所有以 user:${userId}: 开头的键
                            let cursor = '0';
                            const pattern = `user:${userId}:*`;
                            do {
                                const result = await redis3.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
                                cursor = result[0];
                                const keys = result[1];
                                
                                // 删除找到的键
                                if (keys.length > 0) {
                                    await redis3.del(...keys);
                                    // console.log(`删除用户 ${userId} 的键:`, keys);
                                }
                            } while (cursor !== '0');
                        } finally {
                            await redisPool.release(redis3);
                        }
        // }

    }

    /**
     * 从 Redis 缓存获取用户所在的所有房间ID
     */
    private async getUserRoomsFromRedis(userId: number): Promise<number[]> {
        const redis = await redisPool.acquire();
        try {
            const roomIdsStr = await redis.smembers(RedisKey.userRooms(userId));
            return roomIdsStr.map(id => parseInt(id, 10));
        } finally {
            await redisPool.release(redis);
        }
    }

    /**
     * 缓存房间相关信息
     * @param roomId 房间ID
     * @param memberIds 成员ID列表
     * @param roomInfo 房间信息
     */
    private async cacheRoomInfo(roomId: number, memberIds: number[], roomInfo: any): Promise<void> {
        const redis = await redisPool.acquire();
        try {
            // 缓存房间用户信息
            await redis.sadd(RedisKey.roomUsers(roomId), ...memberIds.map(String));
            
            // 缓存用户房间信息
            for (const userId of memberIds) {
                await redis.sadd(RedisKey.userRooms(userId), String(roomId));
            }
            
            // 缓存房间元信息 - 使用兼容性写法
            for (const [key, value] of Object.entries(roomInfo)) {
                if (typeof key === 'string' && (typeof value === 'string' || typeof value === 'number')) {
                    await redis.hset(RedisKey.roomMeta(roomId), key, value);
                }
            }
            
            // 初始化房间在线状态和活跃人数
            const onlineStatus: Record<string, number> = {};
            memberIds.forEach(userId => { onlineStatus[userId] = 0; });
            for (const [userId, status] of Object.entries(onlineStatus)) {
                await redis.hset(RedisKey.roomOnlineStatus(roomId), userId, status);
            }
            await redis.set(RedisKey.roomActiveCount(roomId), 0);

            // 初始化房间未读消息计数缓存
            await this.initializeRoomUnreadCountCache(roomId, memberIds);
        } finally {
            await redisPool.release(redis);
        }
    }

    /**
     * 初始化房间未读消息计数缓存
     * @param roomId 房间ID
     * @param memberIds 成员ID列表
     */
    private async initializeRoomUnreadCountCache(roomId: number, memberIds: number[]): Promise<void> {
        try {
            const redis = await redisPool.acquire();
            try {
                // 检查是否已经初始化过
                const exists = await redis.exists(RedisKey.roomUserUnreadCount(roomId));
                if (exists) {
                    return; // 已经初始化过，不需要重复初始化
                }

                // 从MySQL批量获取用户的未读消息数
                const unreadCounts = await this.getBatchUnreadCountsFromMySQL(roomId, memberIds);
                
                // 批量设置到Redis缓存
                if (Object.keys(unreadCounts).length > 0) {
                    const pipeline = redis.pipeline();
                    Object.entries(unreadCounts).forEach(([userId, count]) => {
                        if (count > 0) {
                            pipeline.hset(RedisKey.roomUserUnreadCount(roomId), userId, count);
                        }
                    });
                    await pipeline.exec();
                }
            } finally {
                await redisPool.release(redis);
            }
        } catch (error) {
            console.error(`Failed to initialize room unread count cache for room ${roomId}:`, error);
        }
    }

    /**
     * 从MySQL批量获取用户的未读消息数
     * @param roomId 房间ID
     * @param memberIds 成员ID列表
     * @returns 用户未读消息数映射
     */
    private async getBatchUnreadCountsFromMySQL(roomId: number, memberIds: number[]): Promise<Record<string, number>> {
        const unreadCounts: Record<string, number> = {};
        
        try {
            // 按用户ID分表分组
            const userGroups = new Map<number, number[]>();
            memberIds.forEach(userId => {
                const tableIndex = userId % 10;
                if (!userGroups.has(tableIndex)) {
                    userGroups.set(tableIndex, []);
                }
                userGroups.get(tableIndex)!.push(userId);
            });

            // 批量查询每个分表
            const queryPromises = Array.from(userGroups.entries()).map(async ([tableIndex, userIds]) => {
                const sql = `SELECT user_id, unread_count FROM chat_user_room_${tableIndex} WHERE room_id = ? AND user_id IN (?) AND is_deleted = 0`;
                const res = await rpcPost('/select', { sql, params: [roomId, userIds] }, 'system_internal_token');
                
                if (res.code === 0 && res.data.result !== 'null') {
                    const results = JSON.parse(res.data.result);
                    results.forEach((row: { user_id: number; unread_count: number }) => {
                        if (row.unread_count > 0) {
                            unreadCounts[String(row.user_id)] = row.unread_count;
                        }
                    });
                }
            });

            await Promise.all(queryPromises);
        } catch (error) {
            console.error(`Failed to get batch unread counts from MySQL for room ${roomId}:`, error);
        }

        return unreadCounts;
    }

    /**
     * 获取房间内所有用户的未读消息数（用于调试和监控）
     * @param roomId 房间ID
     * @returns 用户未读消息数映射
     */
    public async getRoomUnreadCounts(roomId: number): Promise<Record<string, number>> {
        try {
            const redis = await redisPool.acquire();
            try {
                const unreadCounts = await redis.hgetall(RedisKey.roomUserUnreadCount(roomId));
                const result: Record<string, number> = {};
                
                Object.entries(unreadCounts).forEach(([userId, count]) => {
                    const countNum = Number(count);
                    if (countNum > 0) {
                        result[userId] = countNum;
                    }
                });
                
                return result;
            } finally {
                await redisPool.release(redis);
            }
        } catch (error) {
            console.error(`Failed to get room unread counts for room ${roomId}:`, error);
            return {};
        }
    }

    /**
     * 强制同步房间未读消息数到MySQL（用于手动同步）
     * @param roomId 房间ID
     * @param token 认证token
     */
    public async forceSyncUnreadCountsToMySQL(roomId: number, token: string): Promise<ResponseData> {
        try {
            await this.batchUpdateUnreadCountsToMySQL(roomId, token);
            return { msg: 'ok', data: { success: true } };
        } catch (error) {
            console.error(`Failed to force sync unread counts for room ${roomId}:`, error);
            return { msg: 'err', data: { message: 'Failed to sync unread counts' } };
        }
    }

    /**
     * 发送消息 - 使用队列处理模式
     * @param socket 
     * @param userId 
     * @param data 
     */
    public async handleSendMessage(socket: Socket, userId: number, data: { roomId: string; content: string; type?: string; replyTo?: string; mentions?: number[] }, token: string) {
        const { roomId, content } = data;

        try {
            // 1. 快速权限校验
            const isMember = await this.quickValidateMember(userId, Number(roomId));
            if (!isMember) {
                socket.emit('error', { message: 'You are not a member of this room.' });
                return;
            }

            // 2. 生成消息ID
            const msgId = new mongoose.Types.ObjectId().toHexString();
            
            // 3. 构造消息对象
            const message: Partial<IChatMessage> = {
                msg_id: msgId,
                room_id: roomId,
                sender_id: userId,
                content: content,
                type: data.type || 'text',
                reply_to: data.replyTo,
                mentions: data.mentions,
                is_revoked: false,
                read_by: [userId], // 发送者默认已读
                created_at: new Date(),
            };

            // 4. 立即广播消息给房间成员（包括发送者）
            this.io.to(roomId).emit('newMessage', message);
            
            // 5. 将消息放入队列（异步，不等待）
            this.addMessageToQueue(message, token).catch(error => {
                // 记录错误但不影响用户响应
                // console.error('Failed to add message to queue:', error);

            });

        } catch (error) {
            socket.emit('error', { message: 'Failed to send message.' });
        }
    }

    /**
     * 快速验证用户是否是房间成员
     */
    private async quickValidateMember(userId: number, roomId: number): Promise<boolean> {
        const redis = await redisPool.acquire();
        try {
            const result = await redis.sismember(RedisKey.roomUsers(roomId), userId);
            return result === 1;
        } finally {
            await redisPool.release(redis);
        }
    }

    /**
     * 将消息添加到队列
     */
    private async addMessageToQueue(message: Partial<IChatMessage>, token: string) {
        const redis = await redisPool.acquire();
        try {
            const queueItem = {
                message,
                token,
                timestamp: Date.now()
            };
            await redis.lpush('chat_message_queue', JSON.stringify(queueItem));
        } finally {
            await redisPool.release(redis);
        }
    }

    /**
     * 初始化消息队列处理器
     */
    private initializeMessageQueueProcessor() {
        // 启动后台处理器，每100ms处理一次队列
        setInterval(async () => {
            await this.processMessageQueue();
        }, 100);
    }

    /**
     * 处理消息队列
     */
    private async processMessageQueue() {
        const redis = await redisPool.acquire();
        try {
            // 批量获取消息（一次处理10条）
            const messages = [];
            for (let i = 0; i < 10; i++) {
                const item = await redis.rpop('chat_message_queue');
                if (!item) break;
                messages.push(JSON.parse(item));
            }

            if (messages.length === 0) return;

            // 批量处理消息
            await this.batchProcessMessages(messages);
            
        } finally {
            await redisPool.release(redis);
        }
    }

    /**
     * 批量处理消息
     */
    private async batchProcessMessages(queueItems: any[]) {
        // 按房间分组，批量处理
        const roomGroups = new Map();
        
        for (const item of queueItems) {
            const roomId = item.message.room_id;
            if (!roomGroups.has(roomId)) {
                roomGroups.set(roomId, []);
            }
            roomGroups.get(roomId).push(item);
        }

        // 并行处理不同房间的消息
        const promises = Array.from(roomGroups.entries()).map(([roomId, items]) => 
            this.processRoomMessages(roomId, items)
        );
        
        await Promise.all(promises);
    }

    /**
     * 处理单个房间的消息
     */
    private async processRoomMessages(roomId: string, items: any[]) {
        try {
            // 1. 批量插入MongoDB
            const MessageModel = getMessageModel(roomId);
            const messages = items.map(item => item.message);
            await MessageModel.insertMany(messages);

            // 2. 批量更新Redis缓存
            const redis = await redisPool.acquire();
            try {
                const pipeline = redis.pipeline();
                
                // 批量添加到消息列表（新消息添加到列表头部，保持最新消息在前的顺序）
                for (const message of messages) {
                    pipeline.lpush(RedisKey.roomMessages(Number(roomId)), JSON.stringify(message));
                }
                // 限制每个房间在Redis中缓存的消息最多20条
                pipeline.ltrim(RedisKey.roomMessages(Number(roomId)), 0, 19);
                
                // 3. 更新房间meta中的最后一条消息信息
                const lastMessage = messages[messages.length - 1]; // 获取最新的消息
                
                // 根据消息类型格式化最后一条消息内容
                let formattedContent = lastMessage.content;
                if (lastMessage.type === 'image') {
                    formattedContent = '[图片]';
                } else if (lastMessage.type === 'video') {
                    formattedContent = '[视频]';
                } else if (lastMessage.type === 'file') {
                    formattedContent = '[文件]';
                } else if (lastMessage.type === 'link') {
                    formattedContent = '[链接]';
                } else if (lastMessage.type === 'audio') {
                    formattedContent = '[语音]';
                }else if (lastMessage.type === 'custom') {
                    formattedContent = lastMessage.title;
                }
                
                // 兼容性写法：分别设置每个字段，避免版本兼容性问题
                pipeline.hset(RedisKey.roomMeta(Number(roomId)), 'last_message_content', formattedContent);
                pipeline.hset(RedisKey.roomMeta(Number(roomId)), 'last_message_time', lastMessage.created_at);
                
                // 或者使用 hmset（更兼容，但已废弃）
                // pipeline.hmset(RedisKey.roomMeta(Number(roomId)), {
                //     last_message_content: formattedContent,
                //     last_message_time: lastMessage.created_at
                // });
                
                const results = await pipeline.exec();
                // console.log('Redis pipeline execution results:', results);
            } catch (redisError) {
                // console.error('Redis operation failed:', redisError);
                throw redisError;
            } finally {
                await redisPool.release(redis);
            }

            // 4. 批量更新未读数
            await this.batchUpdateUnreadCounts(roomId, messages, items[0].token);
            
        } catch (error) {
            // 处理失败的消息可以重新入队或记录日志
            console.error(`Failed to process messages for room ${roomId}:`, error);
            // 可以选择将失败的消息重新入队
            await this.requeueFailedMessages(items);
        }
    }

    /**
     * 批量更新未读数
     */
    private async batchUpdateUnreadCounts(roomId: string, messages: Partial<IChatMessage>[], token: string) {
        if (messages.length === 0) return;
        const redis = await redisPool.acquire();
        try {
            const roomMembers = await redis.smembers(RedisKey.roomUsers(Number(roomId)));
            const pipeline = redis.pipeline();
            // 为每个消息的发送者之外的所有成员增加未读数
            for (const message of messages) {
                const senderId = message.sender_id;
                for (const memberId of roomMembers) {
                    if (Number(memberId) !== senderId) {
                        // 1. 更新Redis缓存 - 使用房间维度的存储
                        pipeline.hincrby(RedisKey.roomUserUnreadCount(Number(roomId)), String(memberId), 1);
                    }
                }
            }
            
            await pipeline.exec();
        } finally {
            await redisPool.release(redis);
        }
    }

    /**
     * 重新入队失败的消息
     */
    private async requeueFailedMessages(items: any[]) {
        const redis = await redisPool.acquire();
        try {
            const pipeline = redis.pipeline();
            for (const item of items) {
                pipeline.lpush('chat_message_queue', JSON.stringify(item));
            }
            await pipeline.exec();
        } finally {
            await redisPool.release(redis);
        }
    }

    /**
     * 从群聊中踢出成员
     */
    public async kickFromGroupRoom(kickerId: number, roomId: number, kickeeId: number, token: string): Promise<ResponseData> {
        try {
            // console.log(`KickFromGroupRoom: kickerId=${kickerId}, roomId=${roomId}, kickeeId=${kickeeId}`);
            
            // 1. 权限校验：查询群主信息
            const roomSql = `SELECT owner_id FROM chat_room WHERE id = ?`;
            const roomRes = await rpcPost("/select", { sql: roomSql, params: [roomId] }, token);
            
            if (roomRes.code !== 0 || roomRes.data.result === 'null') {
                return { msg: 'not_found', data: { message: 'Room not found.' } };
            }
            
            const roomInfo = JSON.parse(roomRes.data.result)[0];
            const ownerId = roomInfo.owner_id;
            
            // 权限判断：
            // 1. 如果是群主，可以踢出任何人
            // 2. 如果 kickerId === kickeeId，代表自己退出群聊，也允许
             
            if (kickerId !== ownerId && kickerId !== kickeeId) {
                return { msg: 'forbidden', data: { message: 'You do not have permission to kick this user.' } };
            }
            
            // 验证被踢用户是否在群内
            const tableIndex = roomId % 10;
            const memberCheckSql = `SELECT user_id FROM chat_room_user_${tableIndex} WHERE is_kicked=0 and room_id = ? AND user_id = ?`;
            const memberRes = await rpcPost("/select", { sql: memberCheckSql, params: [roomId, kickeeId] }, token);
            
            if (memberRes.code !== 0 || memberRes.data.result === 'null' || JSON.parse(memberRes.data.result).length === 0) {
                return { msg: 'not_found', data: { message: 'User to be kicked is not in the room.' } };
            }
            // 2. 更新数据库中的is_kicked字段
            const updateSql = `UPDATE chat_room_user_${tableIndex} SET is_kicked = 1 WHERE room_id = ? AND user_id = ?`;
            const updateRes = await rpcPost('/update', { sql: updateSql, params: [roomId, kickeeId] }, token);
            if (updateRes.code !== 0) {
                 return { msg: 'err', data: 'Failed to update member status in DB.' };
            }
            // 3. 更新缓存
            const redis = await redisPool.acquire();
            try {
                await redis.srem(RedisKey.roomUsers(roomId), kickeeId);
                await redis.srem(RedisKey.userRooms(kickeeId), roomId);
            } finally {
                await redisPool.release(redis);
            }

            // 4. 更新房间用户详情缓存
            try {
                await this.updateRoomUserDetailsCache(roomId, token);
            } catch (error) {
                // console.error('Failed to update room user details cache after kick:', error);
            }
            
            // 5. 通知被踢出的用户
            const redis3 = await redisPool.acquire();
            let socketIds;
            try {
                socketIds = await redis3.smembers(RedisKey.userSockets(kickeeId));
            } finally {
                await redisPool.release(redis3);
            }
            if (socketIds.length > 0) {
                this.io.to(socketIds).emit('kickedFromRoom', { roomId });
                // 让用户离开该房间的 socket room
                this.io.in(socketIds).socketsLeave(String(roomId));
            }
            
            return { msg: 'ok', data: { kicked_user_id: kickeeId } };

        } catch (error) {
           
            return { msg: 'server_error', data: null };
        }
    }
    public async getRoomInfoByInviteCode(invite_code: string,token:string): Promise<ResponseData> {
        try {
            const sql = `SELECT id FROM chat_room WHERE room_number = ?`;
            const res = await rpcPost('/select', { sql, params: [invite_code] }, token);
            if (res.code === 0 && res.data.result !== 'null') {
                return { msg: 'ok', data: JSON.parse(res.data.result) };
            }
            return { msg: 'not_found', data: null };
        }
        catch (error) {
            return { msg: 'server_error', data: null };
        }
    }
    /**
     * 邀请用户加入群聊
     */
    public async inviteToGroupRoom(inviterId: number, roomId: number, inviteeIds: number[], token: string): Promise<ResponseData> {
        try {
            // 1. 权限校验：检查邀请者是否是群主或管理员
            const tableIndex = roomId % 10;
            // const inviterRoleSql = `SELECT role FROM chat_room_user_${tableIndex} WHERE room_id = ? AND user_id = ?`;
            // const roleRes = await rpcPost("/select", { sql: inviterRoleSql, params: [roomId, inviterId] }, token);
            // console.log(roleRes,inviterRoleSql,1111111111)
            // if (roleRes.code !== 0 || roleRes.data.result === 'null') {
            //     return { msg: 'forbidden', data: { message: 'You are not a member of this room.' } };
            // }
            // const role = JSON.parse(roleRes.data.result)[0].role;
            // if (role !== 'owner' && role !== 'admin') {
            //     return { msg: 'forbidden', data: { message: 'Only owner or admin can invite users.' } };
            // }

            // 2. 过滤掉已经是成员的用户
            const redis = await redisPool.acquire();
            let existingMembers;
            try {
                existingMembers = (await redis.smembers(RedisKey.roomUsers(roomId))).map(Number);
            } finally {
                await redisPool.release(redis);
            }
            const newMemberIds = inviteeIds.filter(id => !existingMembers.includes(id));
            if (newMemberIds.length === 0) {
                return { msg: 'ok', data: { message: 'All users are already members.' } };
            }
           
            // 3. 处理新成员加入（考虑被踢用户重新加入的情况）
            for (const userId of newMemberIds) {
                // 先检查用户是否曾经在群内但被踢出
                const checkKickedSql = `SELECT id, is_kicked FROM chat_room_user_${tableIndex} WHERE room_id = ? AND user_id = ?`;
                const kickedRes = await rpcPost('/select', { sql: checkKickedSql, params: [roomId, userId] }, token);
                
                if (kickedRes.code === 0 && kickedRes.data.result !== 'null') {
                    const existingRecords = JSON.parse(kickedRes.data.result);
                    if (existingRecords.length > 0) {
                        // 用户记录已存在，重置 is_kicked 状态
                        const resetSql = `UPDATE chat_room_user_${tableIndex} SET is_kicked = 0, role = 'member' WHERE room_id = ? AND user_id = ?`;
                        const resetRes = await rpcPost('/update', { sql: resetSql, params: [roomId, userId] }, token);
                        if (resetRes.code !== 0) {
                            return { msg: 'err', data: resetRes };
                        }
                        continue; // 继续处理下一个用户
                    }
                }
                
                // 用户从未加入过群，插入新记录
                const insertSql = `INSERT INTO chat_room_user_${tableIndex} (room_id, user_id, role, is_kicked) VALUES (?, ?, ?, 0)`;
                const insertRes = await rpcPost('/insert', { sql: insertSql, params: [roomId, userId, 'member'] }, token);
                if (insertRes.code !== 0) {
                    return { msg: 'err', data: insertRes };
                }
            }
            
            // 4. 更新 Redis 缓存
            const redis4 = await redisPool.acquire();
            try {
                await redis4.sadd(RedisKey.roomUsers(roomId), ...newMemberIds.map(String));
                for (const userId of newMemberIds) {
                    await redis4.sadd(RedisKey.userRooms(userId), String(roomId));
                    const redis5 = await redisPool.acquire();
                    let socketIds;
                    try {
                        socketIds = await redis5.smembers(RedisKey.userSockets(userId));
                    } finally {
                        await redisPool.release(redis5);
                    }
                    if (socketIds.length > 0) {
                        const roomInfo = await this.getRoomInfo(roomId, token);
                        this.io.to(socketIds).emit('invitedToRoom', roomInfo);
                        this.io.in(socketIds).socketsJoin(String(roomId));
                    }
                }
            } finally {
                await redisPool.release(redis4);
            }

            // 5. 更新房间用户详情缓存
            try {
                await this.updateRoomUserDetailsCache(roomId, token);
            } catch (error) {
                console.error('Failed to update room user details cache after invite:', error);
            }

            return { msg: 'ok', data: { added_members: newMemberIds } };
            
        } catch (error) {
            return { msg: 'server_error', data: null };
        }
    }

    /**
     * 获取单个房间及其成员的详细信息
     */
    public async getRoomWithMembers(roomId: number, userId: number, token: string): Promise<ResponseData> {
        try {
            const roomInfo = await this.getRoomInfo(roomId, token);
            if (!roomInfo) {
                return { msg: 'not_found', data: { message: 'Room not found.' } };
            }

            let memberIds: number[] = [];
            // const redis6 = await redisPool.acquire();
            // try {
            //     memberIds = (await redis6.smembers(RedisKey.roomUsers(roomId))).map(Number);
            // } finally {
            //     await redisPool.release(redis6);
            // }
            // if (memberIds.length === 0) {
                const tableIndex = roomId % 10;
                const sql = `SELECT user_id FROM chat_room_user_${tableIndex} WHERE is_kicked=0 and room_id = ?`;
                const res = await rpcPost("/select", { sql, params: [roomId] }, token);
                if (res.code === 0 && res.data.result !== 'null') {
                    memberIds = JSON.parse(res.data.result).map((r: { user_id: number }) => r.user_id);
                    if (memberIds.length > 0) {
                        // 使用统一的缓存方法
                        await this.cacheRoomInfo(roomId, memberIds, roomInfo);
                    }
                }
            // }
            
            // 查询成员的详细信息
            let membersDetails: IMemberDetail[] = [];
            if (memberIds.length > 0) {
                // 优先从缓存获取房间用户详情
                const redis = await redisPool.acquire();
                let cachedUserDetails;
                try {
                    cachedUserDetails = await redis.get(RedisKey.roomUserDetails(roomId));
                } finally {
                    await redisPool.release(redis);
                }
                
                if (cachedUserDetails) {
                    try {
                        membersDetails = JSON.parse(cachedUserDetails);
                    } catch (error) {
                        console.error('Failed to parse cached user details:', error);
                        membersDetails = [];
                    }
                }
                
                // 如果缓存中没有或解析失败，从数据库获取并缓存
                if (membersDetails.length === 0) {
                    // 批量获取用户详情
                    const userDetailsMap = await this.getBatchUserDetails(memberIds, token);
                    
                    // 查询用户在房间中的角色
                    const tableIndex = roomId % 10;
                    const rolesSql = `SELECT user_id, role FROM chat_room_user_${tableIndex} WHERE is_kicked=0 and room_id = ? AND user_id IN (?)`;
                    const rolesRes = await rpcPost('/select', { sql: rolesSql, params: [roomId, memberIds] }, token);
                    let rolesMap = new Map();
                    if (rolesRes.code === 0 && rolesRes.data.result !== 'null') {
                        const roles = JSON.parse(rolesRes.data.result);
                        rolesMap = new Map(roles.map((r: { user_id: number; role: string }) => [r.user_id, r.role]));
                    }
                    
                    // 合并用户信息和角色信息
                    membersDetails = memberIds.map(id => {
                        const userInfo = userDetailsMap.get(id) || { id, nickname: `User ${id}`, avatar: '' };
                        const role = rolesMap.get(id) || 'member';
                        return { ...userInfo, role };
                    });
                    
                    // 缓存房间用户详情
                    const redis2 = await redisPool.acquire();
                    try {
                        await redis2.setex(RedisKey.roomUserDetails(roomId), 36000, JSON.stringify(membersDetails));
                    } finally {
                        await redisPool.release(redis2);
                    }
                }
            }

            roomInfo.members = membersDetails;
            
            // 当用户获取房间详情时，自动标记为已读
            await this.markUserRoomAsRead(userId, roomId, token);
            
            return { msg: 'ok', data: roomInfo };

        } catch (error) {
            return { msg: 'server_error', data: null };
        }
    }


    /**
     * 获取用户的所有房间列表（支持分页）
     */
    public async getUserRooms(userId: number, token: string, page: number = 1, pageSize: number = 20): Promise<ResponseData> {
        try {
            const redis = await redisPool.acquire();
            let roomIds: number[] = [];
            let roomIdsStr: string[] = [];
            try {
                roomIdsStr = await redis.smembers(RedisKey.userRooms(userId));
            } finally {
                await redisPool.release(redis);
            }
            roomIds = roomIdsStr.map(Number);
            if (roomIds.length === 0) {
                // 缓存未命中，从数据库加载
                // getUserRoomsFromDB 现在已经包含了缓存逻辑，无需重复缓存
                roomIds = await this.getUserRoomsFromDB(userId, token);
            } 
            // 计算分页
            const total = roomIds.length;
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedRoomIds = roomIds.slice(startIndex, endIndex);

            const roomsData = [];
            for (const roomId of paginatedRoomIds) {
                const roomInfo = await this.getRoomInfo(roomId, token);
                if (roomInfo) {
                    // 获取房间成员信息
                    let memberIds: number[] = [];
                    const redis3 = await redisPool.acquire();
                    try {
                        memberIds = (await redis3.smembers(RedisKey.roomUsers(roomId))).map(Number);
                    } finally {
                        await redisPool.release(redis3);
                    }
                    
                    if (memberIds.length === 0) {
                        const tableIndex = roomId % 10;
                        const sql = `SELECT user_id FROM chat_room_user_${tableIndex} WHERE is_kicked=0 and room_id = ?`;
                        const res = await rpcPost("/select", { sql, params: [roomId] }, token);
                        if (res.code === 0 && res.data.result !== 'null') {
                            memberIds = JSON.parse(res.data.result).map((r: { user_id: number }) => r.user_id);
                        }
                    }

                    // 获取成员详细信息（只包含名字和头像）
                    let members = [];
                    if (memberIds.length > 0 &&roomInfo.room_type==1) {
                        const userDetailsMap = await this.getBatchUserDetails(memberIds, token);
                        members = memberIds.map(id => {
                            const userInfo = userDetailsMap.get(id) || { id, nickname: `User ${id}`, avatar: '' };
                            return {
                                id: userInfo.id,
                                nickname: userInfo.nickname,
                                avatar: userInfo.avatar
                            };
                        });
                    }

                    // 获取当前用户在该房间的未读消息数
                    const unreadCount = await this.getUserRoomUnreadCount(userId, roomId, token);
                    
                    // 添加成员信息和未读消息数到房间数据
                    roomInfo.members =roomInfo.room_type==1?members:memberIds;
                    roomInfo.unread_count = unreadCount;
                    roomsData.push(roomInfo);
                }
            }

            return { 
                msg: 'ok', 
                data: {
                    rooms: roomsData,
                    page,
                    page_size: pageSize,
                    total,
                    total_pages: Math.ceil(total / pageSize)
                }
            };

        } catch (error) {
            return { msg: 'server_error', data: null };
        }
    }

    /**
     * 获取用户的全部私聊（不分页）
     * @param userId 用户ID
     * @param token 认证token
     */
    public async getUserPrivateChats(userId: number, token: string): Promise<ResponseData> {
        try {
            const redis = await redisPool.acquire();
            let roomIds: number[] = [];
            let roomIdsStr: string[] = [];
            try {
                roomIdsStr = await redis.smembers(RedisKey.userRooms(userId));
            } finally {
                await redisPool.release(redis);
            }
            roomIds = roomIdsStr.map(Number);
            if (roomIds.length === 0) {
                // 缓存未命中，从数据库加载
                roomIds = await this.getUserRoomsFromDB(userId, token);
            }

            const privateChats = [];
            for (const roomId of roomIds) {
                const roomInfo = await this.getRoomInfo(roomId, token);
                if (roomInfo && roomInfo.room_type == 1) { // 只获取私聊 (room_type = 1)
                    // 获取房间成员信息
                    let memberIds: number[] = [];
                    const redis3 = await redisPool.acquire();
                    try {
                        memberIds = (await redis3.smembers(RedisKey.roomUsers(roomId))).map(Number);
                    } finally {
                        await redisPool.release(redis3);
                    }
                    
                    if (memberIds.length === 0) {
                        const tableIndex = roomId % 10;
                        const sql = `SELECT user_id FROM chat_room_user_${tableIndex} WHERE is_kicked=0 and room_id = ?`;
                        const res = await rpcPost("/select", { sql, params: [roomId] }, token);
                        if (res.code === 0 && res.data.result !== 'null') {
                            memberIds = JSON.parse(res.data.result).map((r: { user_id: number }) => r.user_id);
                        }
                    }

                    // 获取成员详细信息（只包含名字和头像）
                    let members = [];
                    if (memberIds.length > 0) {
                        const userDetailsMap = await this.getBatchUserDetails(memberIds, token);
                        members = memberIds.map(id => {
                            const userInfo = userDetailsMap.get(id) || { id, nickname: `User ${id}`, avatar: '' };
                            return {
                                id: userInfo.id,
                                nickname: userInfo.nickname,
                                avatar: userInfo.avatar
                            };
                        });
                    }

                    // 获取当前用户在该房间的未读消息数
                    const unreadCount = await this.getUserRoomUnreadCount(userId, roomId, token);
                    
                    // 添加成员信息和未读消息数到房间数据
                    roomInfo.members = members;
                    roomInfo.unread_count = unreadCount;
                    privateChats.push(roomInfo);
                }
            }

            return { 
                msg: 'ok', 
                data: {
                    private_chats: privateChats,
                    total: privateChats.length
                }
            };

        } catch (error) {
            console.error('getUserPrivateChats error:', error);
            return { msg: 'server_error', data: null };
        }
    }

    /**
     * 获取用户的全部群聊（不分页）
     * @param userId 用户ID
     * @param token 认证token
     */
    public async getUserGroupChats(userId: number, token: string): Promise<ResponseData> {
        try {
            const redis = await redisPool.acquire();
            let roomIds: number[] = [];
            let roomIdsStr: string[] = [];
            try {
                roomIdsStr = await redis.smembers(RedisKey.userRooms(userId));
            } finally {
                await redisPool.release(redis);
            }
            roomIds = roomIdsStr.map(Number);
            if (roomIds.length === 0) {
                // 缓存未命中，从数据库加载
                roomIds = await this.getUserRoomsFromDB(userId, token);
            }

            const groupChats = [];
            for (const roomId of roomIds) {
                const roomInfo = await this.getRoomInfo(roomId, token);
                if (roomInfo && roomInfo.room_type == 2) { // 只获取群聊 (room_type = 2)
                    // 获取房间成员信息
                    let memberIds: number[] = [];
                    const redis3 = await redisPool.acquire();
                    try {
                        memberIds = (await redis3.smembers(RedisKey.roomUsers(roomId))).map(Number);
                    } finally {
                        await redisPool.release(redis3);
                    }
                    
                    if (memberIds.length === 0) {
                        const tableIndex = roomId % 10;
                        const sql = `SELECT user_id FROM chat_room_user_${tableIndex} WHERE is_kicked=0 and room_id = ?`;
                        const res = await rpcPost("/select", { sql, params: [roomId] }, token);
                        if (res.code === 0 && res.data.result !== 'null') {
                            memberIds = JSON.parse(res.data.result).map((r: { user_id: number }) => r.user_id);
                        }
                    }

                    // // 获取成员详细信息（只包含名字和头像）
                    // let members = [];
                    // if (memberIds.length > 0) {
                    //     const userDetailsMap = await this.getBatchUserDetails(memberIds, token);
                    //     members = memberIds.map(id => {
                    //         const userInfo = userDetailsMap.get(id) || { id, nickname: `User ${id}`, avatar: '' };
                    //         return {
                    //             id: userInfo.id,
                    //             nickname: userInfo.nickname,
                    //             avatar: userInfo.avatar
                    //         };
                    //     });
                    // }

                    // 获取当前用户在该房间的未读消息数
                    const unreadCount = await this.getUserRoomUnreadCount(userId, roomId, token);
                    
                    // 添加成员信息和未读消息数到房间数据
                    roomInfo.members = memberIds;
                    roomInfo.unread_count = unreadCount;
                    groupChats.push(roomInfo);
                }
            }

            return { 
                msg: 'ok', 
                data: {
                    group_chats: groupChats,
                    total: groupChats.length
                }
            };

        } catch (error) {
            console.error('getUserGroupChats error:', error);
            return { msg: 'server_error', data: null };
        }
    }

    /**
     * 获取单个房间的详细信息
     */
    public async getRoomInfo(roomId: number, token: string,is_cached:boolean=true): Promise<any | null> {
        const redis = await redisPool.acquire();
        try {
            const roomMetaCached = await redis.hgetall(RedisKey.roomMeta(roomId));
            // console.log(roomMetaCached);
            // console.log(Object.keys(roomMetaCached).length);
            // console.log(roomId)
            if (Object.keys(roomMetaCached).length > 0 && is_cached) {
                return roomMetaCached;
            }
            // 2. 查数据库
            try {
                const sql = 'SELECT id, room_name, room_type,avatar,descp,room_number,is_muted, owner_id, last_message_content, last_message_time FROM chat_room WHERE id = ?';
                const res = await rpcPost('/select', { sql, params: [roomId] }, token);
              
                if (res.code === 0 && res.data.result !== 'null') {
                    const roomInfo = JSON.parse(res.data.result)[0];
                    if (roomInfo) {
                        //console.log(roomInfo);
                        // 回写到 Redis - 使用兼容性写法
                        for (const [key, value] of Object.entries(roomInfo)) {
                            if (typeof key === 'string' && (typeof value === 'string' || typeof value === 'number')) {
                                await redis.hset(RedisKey.roomMeta(roomId), key, value);
                            }
                        }
                        //console.log(await redis.hgetall(RedisKey.roomMeta(roomId)));
                        
                        // 将最多20条历史消息加载到redis里
                        await this.loadHistoryMessagesToRedis(roomId);

                        return roomInfo;
                    }
                }
                return null;
            } catch (error) {
                return null;
            }
        } finally {
            await redisPool.release(redis);
        }
    }

    /**
     * 检查用户是否是房间成员
     */
    public async isRoomMember(userId: number, roomId: number, token: string): Promise<boolean> {
        // 1. 优先查 Redis 缓存
        const redis = await redisPool.acquire();
        let isMemberCached;
        try {
            isMemberCached = await redis.sismember(RedisKey.roomUsers(roomId), userId);
        } finally {
            await redisPool.release(redis);
        }
        if (isMemberCached) {
            return true;
        }

        // 2. 缓存未命中，查询数据库
        try {
            const tableIndex = roomId % 10;
            const sql = `SELECT id FROM chat_room_user_${tableIndex} WHERE is_kicked=0 and room_id = ? AND user_id = ?`;
            const res = await rpcPost("/select", { sql, params: [roomId, userId] }, token);
            
            if (res.code === 0 && res.data.result !== 'null') {
                const results = JSON.parse(res.data.result);
                if (results.length > 0) {
                    // 如果在数据库中找到了，回写到 Redis 缓存
                    const redis2 = await redisPool.acquire();
                    try {
                        await redis2.sadd(RedisKey.roomUsers(roomId), userId);
                    } finally {
                        await redisPool.release(redis2);
                    }
                    return true;
                }
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * 获取历史消息 (分页)
     * 优先从Redis缓存获取，缓存不足时从MongoDB补充
     */
    public async getMessageHistory(roomId: string, userId: number, page: number = 1, pageSize: number = 20, token: string): Promise<ResponseData> {
        try {
            // 验证用户是否是房间成员
            const isMember = await this.quickValidateMember(userId, Number(roomId));
            if (!isMember) {
                return { msg: 'forbidden', data: { message: 'You are not a member of this room.' } };
            }

            const redis = await redisPool.acquire();
            let messages: any[] = [];
            let totalMessages = 0;
            const MessageModel = getMessageModel(roomId);

            try {
                // 1. 首先尝试从Redis缓存获取消息
                const cachedMessages = await redis.lrange(RedisKey.roomMessages(Number(roomId)), 0, -1);
               
                if (cachedMessages.length > 0) {
                    // 解析Redis中的消息
                    const parsedMessages = cachedMessages.map(msg => JSON.parse(msg));
                    
                    // 计算分页
                    const startIndex = (page - 1) * pageSize;
                    const endIndex = startIndex + pageSize;
                    
                    // 从缓存中获取指定页的消息
                    messages = parsedMessages.slice(startIndex, endIndex);
                    // totalMessages = parsedMessages.length;
                    totalMessages = await MessageModel.countDocuments();


                    // 如果缓存中的消息足够，直接返回
                    if (messages.length === pageSize || (page == 1 && messages.length > 0)) {

                        
                        const data = {
                            messages: messages, // Redis中的消息已经是正确顺序（最旧在前，最新在后）
                            total: totalMessages,
                            page,
                            page_size: pageSize,
                            total_pages: Math.ceil(totalMessages / pageSize),
                            source: 'cache' // 标识数据来源
                        };

                        
                        // 当用户获取消息历史时，自动标记为已读
                        await this.markUserRoomAsRead(userId, Number(roomId), token);
                        
                        return { msg: 'ok', data };
                    }
                }
            } finally {
                await redisPool.release(redis);
            }
            
            // 2. 如果Redis缓存不足或为空，从MongoDB获取
            const skip = (page - 1) * pageSize;
            
            messages = await MessageModel.find()
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(pageSize)
                .lean(); // 使用 lean() 提高查询性能

            totalMessages = await MessageModel.countDocuments();
            

            
            const data = {
                messages: messages, // 将消息按时间正序返回给前端（最旧在前，最新在后）
                total: totalMessages,
                page,
                page_size: pageSize,
                total_pages: Math.ceil(totalMessages / pageSize),
                source: 'database' // 标识数据来源
            };


            // 当用户获取消息历史时，自动标记为已读
            await this.markUserRoomAsRead(userId, Number(roomId), token);

            return { msg: 'ok', data };

        } catch (error) {
            return { msg: 'server_error', data: null };
        }
    }

    // getRoomId(userId1: number, userId2: number): number {
    //     const sortedUserIds = [userId1, userId2].sort((a, b) => a - b);
    //     const privateRoomIdentifier = `private_${sortedUserIds[0]}_${sortedUserIds[1]}`;
    //     return privateRoomIdentifier;
    // }

    /**
     * 创建私聊房间
     */
    public async createPrivateRoom(userId1: number, userId2: number, token: string): Promise<ResponseData> {
        // 1. 生成一个固定的房间标识，确保两个用户之间的私聊房间是唯一的
        const sortedUserIds = [userId1, userId2].sort((a, b) => a - b);
        const privateRoomIdentifier = `${sortedUserIds[0]}_${sortedUserIds[1]}`;

        // 2. 用room_number检查房间是否已存在 
        let existingRoom = null;

        const checkSql = `select id from chat_room where room_number = ?`;
        const checkRes = await rpcPost('/select', { sql: checkSql, params: [privateRoomIdentifier] }, token);
        if (checkRes.code === 0 && checkRes.data.result !== 'null' && JSON.parse(checkRes.data.result).length > 0) {
            existingRoom = JSON.parse(checkRes.data.result)[0];
        }


        if (existingRoom) {
            return { msg: 'ok', data: { room_id: existingRoom.id, is_new: false } };
        }

        // 3. 如果不存在，创建新房间（先插 chat_room，再插 chat_room_user, 最后插 chat_user_room）
        try {
            const sqlRoom = 'INSERT INTO chat_room (room_type, room_name, room_number, owner_id) VALUES (?, ?, ?, ?)';
            // const roomNumber = Math.floor(Math.random() * 1000000); // 生成随机房间号
            const paramsRoom = [1,`用户${userId1}和用户${userId2}的聊天`, privateRoomIdentifier, userId1];
            const resRoom = await rpcPost('/insert', { sql: sqlRoom, params: paramsRoom }, token);
            if (resRoom.code !== 0) {
                return { msg: 'err', data: resRoom };
            }
            // 获取插入的房间ID
            const sqlGetId = "SELECT id FROM chat_room WHERE room_number = ?";
            const resGetId = await rpcPost('/select', { sql: sqlGetId, params: [privateRoomIdentifier.toString()] }, token);
            let newRoomId = JSON.parse(resGetId.data?.result)[0].id;
            for (const userId of sortedUserIds) {
                const sqlUser = `INSERT INTO chat_room_user_${newRoomId % 10} (room_id, user_id) VALUES (?, ?)`;
                const paramsUser = [newRoomId, userId];
                const resUser = await rpcPost('/insert', { sql: sqlUser, params: paramsUser }, token);
                if (resUser.code !== 0) {
                    return { msg: 'err', data: resUser };
                }
            }
            //在用户房间表中插入一条记录
            for (const userId of sortedUserIds) {
            const sqlUserRoom = `INSERT INTO chat_user_room_${userId % 10} (user_id, room_id, room_name, room_avatar, is_pinned, is_muted, unread_count, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const paramsUserRoom = [userId, newRoomId, `用户${userId1}和用户${userId2}的聊天`, '', false, false, 0, false];
            const resUserRoom = await rpcPost('/insert', { sql: sqlUserRoom, params: paramsUserRoom }, token);
            if (resUserRoom.code !== 0) {
                return { msg: 'err', data: resUserRoom };
            }
        }

            // 4. 缓存房间用户详情和房间用户列表
            try {
                await this.updateRoomUserDetailsCache(newRoomId, token);
                
                // 缓存房间用户列表到Redis
                const redis = await redisPool.acquire();
                try {
                    await redis.sadd(RedisKey.roomUsers(newRoomId), ...sortedUserIds.map(String));
                } finally {
                    await redisPool.release(redis);
                }

                // 初始化房间未读消息计数缓存
                await this.initializeRoomUnreadCountCache(newRoomId, sortedUserIds);
            } catch (error) {
                console.error('Failed to cache room user details on creation:', error);
            }

            // 5. 让在线用户立即加入新房间的 Socket.IO room，并推送通知
            for (const userId of sortedUserIds) {
                const redis8 = await redisPool.acquire();
                let socketIds;
                try {
                    socketIds = await redis8.smembers(RedisKey.userSockets(userId));
                } finally {
                    await redisPool.release(redis8);
                }
                for (const socketId of socketIds) {
                    this.io.in(socketId).socketsJoin(String(newRoomId));
                }
                if (socketIds.length > 0) {
                    this.io.to(socketIds).emit('roomCreated', { roomId: newRoomId });
                }
            }

            return { msg: 'ok', data: { room_id: newRoomId, is_new: true } };
        } catch (error) {
            return { msg: 'server_error', data: null };
        }
    }
    
    /**
     * 生成群号：字母+数字，6位，保证唯一性
     * 使用时间戳+随机数的方式，基本可以保证唯一性，无需查数据库
     */
    async createGroupNumber(): Promise<string> {
        // 方案1：时间戳 + 随机数（推荐，几乎不会重复）
        const timestamp = Date.now().toString(36); // 转36进制，更短
        const random = Math.random().toString(36).substring(2, 6); // 4位随机字符
        let groupNumber = (timestamp + random).substring(0, 6).toUpperCase();
        
        // 确保是6位，不足的用随机字符补齐
        while (groupNumber.length < 6) {
            groupNumber += Math.random().toString(36).substring(2, 3).toUpperCase();
        }
        
        return groupNumber;
    }

    /**
     * 生成群号（带数据库重复检查版本）
     * 如果需要绝对保证唯一性，可以使用这个版本
     */
    async createGroupNumberWithCheck(token: string): Promise<string> {
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            // 生成候选群号
            const timestamp = Date.now().toString(36);
            const random = Math.random().toString(36).substring(2, 4);
            let candidate = (timestamp + random).substring(0, 6).toUpperCase();
            
            // 确保是6位
            while (candidate.length < 6) {
                candidate += Math.random().toString(36).substring(2, 3).toUpperCase();
            }
            
            // 检查数据库是否存在
            try {
                const checkSql = 'SELECT id FROM chat_room WHERE room_number = ?';
                const checkRes = await rpcPost('/select', { sql: checkSql, params: [candidate] }, token);
                
                if (checkRes.code === 0 && (checkRes.data.result === 'null' || JSON.parse(checkRes.data.result).length === 0)) {
                    // 不存在，可以使用
                    return candidate;
                }
            } catch (error) {
                console.error('检查群号重复失败:', error);
            }
            
            attempts++;
        }
        
        // 如果10次都重复，使用UUID方式
        return this.generateUniqueGroupNumber();
    }

    /**
     * 使用UUID生成绝对唯一的群号
     */
    private generateUniqueGroupNumber(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // 添加时间戳确保唯一性
        const timestamp = Date.now().toString().slice(-2);
        return (result.substring(0, 4) + timestamp).substring(0, 6);
    }
    /**
     * 创建群聊房间
     */
    public async createGroupRoom(ownerId: number, roomName: string, memberIds: number[], token: string, avatar?: string, descp?: string): Promise<ResponseData> {
        if (!memberIds.includes(ownerId)) {
            memberIds.push(ownerId);
        }
        try {
           
            const sqlRoom = "INSERT INTO chat_room (room_name, room_type, owner_id, room_number, avatar, `descp`) VALUES (?, ?, ?, ?, ?, ?)";
            const roomNumber = await this.createGroupNumber()
            const paramsRoom = [roomName, 2, ownerId, roomNumber, avatar || null, descp || null];
            const resRoom = await rpcPost("/insert", { sql: sqlRoom, params: paramsRoom }, token);
            if (resRoom.code !== 0) {
                return { msg: "err", data: resRoom };
            }
            let newRoomId = resRoom.data?.result?.lastId;
            if (!newRoomId) {
                const sqlFind = "SELECT id FROM chat_room WHERE room_name = ? AND owner_id = ? ORDER BY id DESC LIMIT 1";
                const resFind = await rpcPost("/select", { sql: sqlFind, params: [roomName, ownerId] }, token);
                if (resFind.code === 0 && resFind.data && resFind.data.result && resFind.data.result !== 'null') {
                    newRoomId = JSON.parse(resFind.data.result)[0].id;
                } else {
                    return { msg: "err", data: resFind };
                }
            }

            await Promise.all(memberIds.map(userId => {
                const sqlUser = `INSERT INTO chat_room_user_${newRoomId % 10} (room_id, user_id, role) VALUES (?, ?, ?)`;
                const paramsUser = [newRoomId, userId, userId === ownerId ? "owner" : "member"];
                return rpcPost("/insert", { sql: sqlUser, params: paramsUser }, token);
            }));

            // 缓存房间用户详情和房间用户列表
            try {
                await this.updateRoomUserDetailsCache(newRoomId, token);
                
                // 缓存房间用户列表到Redis
                const redis = await redisPool.acquire();
                try {
                    await redis.sadd(RedisKey.roomUsers(newRoomId), ...memberIds.map(String));
                } finally {
                    await redisPool.release(redis);
                }

                // 初始化房间未读消息计数缓存
                await this.initializeRoomUnreadCountCache(newRoomId, memberIds);
            } catch (error) {
                console.error('Failed to cache room user details on group creation:', error);
            }

            await Promise.all(memberIds.map(async userId => {
                const redisTmp = await redisPool.acquire();
                try {
                    let socketIds: any[] = [];
                    let tSmembers = 0, tJoin = 0, tEmit = 0;
                    try {
                        // const t1 = Date.now();
                        const result = await redisTmp.smembers(RedisKey.userSockets(userId));
                        // tSmembers = Date.now() - t1;
                        if (Array.isArray(result)) {
                            socketIds = result;
                        } else {
                            socketIds = [];
                        }
                    } catch (e) {
                        socketIds = [];
                    }
                    for (const socketId of socketIds) {
                        const tJoinStart = Date.now();
                        //this.io.in(socketId).socketsJoin(String(newRoomId));
                        const socket = this.io.of('/').sockets.get(socketId);
                        if (socket) {
                            socket.join(String(newRoomId));
                        }
                        tJoin += Date.now() - tJoinStart;
                    }
                    if (socketIds.length > 0) {
                        const tEmitStart = Date.now();
                        this.io.to(socketIds).emit('roomCreated', { roomId: newRoomId });
                        tEmit += Date.now() - tEmitStart;
                    }
                } finally {
                    await redisPool.release(redisTmp);
                }
            }));

            return { msg: "ok", data: { room_id: newRoomId } };
        } catch (error) {
            return { msg: 'server_error', data: error instanceof Error ? error.message : error };
        }
    }

    // ======================== 用户房间关联相关方法 ========================

    // 创建用户房间关联
    async createUserRoom(data: CreateUserRoomModel, token: string): Promise<ResponseData> {
        try {
            // 检查是否已存在
            const checkSql = `SELECT id FROM chat_user_room_${data.user_id % 10} WHERE user_id = ? AND room_id = ? AND is_deleted = 0`;
            const checkRes = await rpcPost('/select', { sql: checkSql, params: [data.user_id, data.room_id] }, token);
            
            if (checkRes.code === 0 && checkRes.data.result !== 'null' && JSON.parse(checkRes.data.result).length > 0) {
                return { msg: 'already_exists', data: null };
            }

            // 插入新记录
            const insertSql = `INSERT INTO chat_user_room_${data.user_id % 10} (user_id, room_id, room_name, room_avatar, is_pinned, is_muted, unread_count, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [
                data.user_id,
                data.room_id,
                data.room_name || null,
                data.room_avatar || null,
                data.is_pinned || false,
                data.is_muted || false,
                0,
                false
            ];
            
            const insertRes = await rpcPost('/insert', { sql: insertSql, params }, token);
            if (insertRes.code !== 0) {
                return { msg: 'err', data: insertRes };
            }

            return { msg: 'ok', data: { id: insertRes.data?.result?.lastId } };
        } catch (error) {
            return { msg: 'server_error', data: null };
        }
    }

    // 获取用户房间列表
    async  getUserRoomList(query: UserRoomQueryModel, token: string): Promise<ResponseData> {
        try {
            let whereClause = 'WHERE user_id = ? AND is_deleted = 0';
            const params: any[] = [query.user_id];

            if (query.room_id) {
                whereClause += ' AND room_id = ?';
                params.push(query.room_id);
            }
            if (query.is_pinned !== undefined) {
                whereClause += ' AND is_pinned = ?';
                params.push(query.is_pinned);
            }

            // 验证分页参数
            const validPage = Math.max(1, parseInt(query.page?.toString() || '1'));
            const validPageSize = Math.max(1, Math.min(100, parseInt(query.page_size?.toString() || '10')));
            const skip = (validPage - 1) * validPageSize;
            
            // 查询总数
            const countSql = `SELECT COUNT(*) as total FROM chat_user_room_${query.user_id % 10} ${whereClause}`;
            const countRes = await rpcPost('/select', { sql: countSql, params }, token);
            const total = countRes.code === 0 ? JSON.parse(countRes.data.result)[0].total : 0;

            // 查询数据
            const selectSql = `SELECT room_id, room_name, room_avatar, is_pinned, is_muted, unread_count FROM chat_user_room_${query.user_id % 10} ${whereClause} ORDER BY is_pinned DESC, updated_at DESC LIMIT ?, ?`;
            const selectParams = [...params, skip, validPageSize];
            const selectRes = await rpcPost('/select', { sql: selectSql, params: selectParams }, token);
            
            const userRooms = selectRes.code === 0 && selectRes.data.result !== 'null' 
                ? JSON.parse(selectRes.data.result) 
                : [];

            return {
                msg: 'ok',
                data: {
                    user_rooms: userRooms,
                    total,
                    page: validPage,
                    page_size: validPageSize,
                    total_pages: Math.ceil(total / validPageSize)
                }
            };
        } catch (error) {
            return { msg: 'server_error', data: null };
        }
    }

    // 获取用户房间详情
    async getUserRoomDetail(userId: number, roomId: number, token: string): Promise<ResponseData> {
        try {
            const sql = `SELECT room_id, room_name, room_avatar, is_pinned, is_muted, unread_count FROM chat_user_room_${userId % 10} WHERE user_id = ? AND room_id = ? AND is_deleted = 0`;
            const res = await rpcPost('/select', { sql, params: [userId, roomId] }, token);
            
            if (res.code === 0 && res.data.result !== 'null') {
                const userRooms = JSON.parse(res.data.result);
                if (userRooms.length > 0) {
                    return { msg: 'ok', data: userRooms[0] };
                }
            }
            
            return { msg: 'not_found', data: null };
        } catch (error) {
            return { msg: 'server_error', data: null };
        }
    }

    // 更新用户房间信息
    async updateUserRoom(userId: number, roomId: number, data: UpdateUserRoomModel, token: string): Promise<ResponseData> {
        try {
            const updateFields: string[] = [];
            const params: any[] = [];
            
            if (data.room_name !== undefined) {
                updateFields.push('room_name = ?');
                params.push(data.room_name);
            }
            if (data.avatar !== undefined) {
                updateFields.push('avatar = ?');
                params.push(data.avatar);
            }
            
            if (data.is_muted !== undefined) {
                updateFields.push('is_muted = ?');
                params.push(data.is_muted);
            }
            if (data.descp !== undefined) {
                updateFields.push('descp = ?');
                params.push(data.descp);
            }
            
            updateFields.push('updated_at = ?');
            params.push(Math.floor(Date.now() / 1000));
            params.push(roomId,userId);

            const sql = `UPDATE chat_room SET ${updateFields.join(', ')} WHERE id = ? AND owner_id = ?`;
            const res = await rpcPost('/update', { sql, params }, token);
           
            if (res.code === 0 ) {
                await this.getRoomInfo(roomId,token,false) //更新缓存
                return { msg: 'ok', data: { success: true } };
            } else {
                return { msg: 'err', data: null };
            }
        } catch (error) {
            return { msg: 'server_error', data: null };
        }
    }

    // 删除用户房间关联
    async deleteUserRoom(userId: number, roomId: number, token: string): Promise<ResponseData> {
        try {
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const sql = `UPDATE chat_user_room_${userId % 10} SET is_deleted = 1, deleted_at = ?, updated_at = ? WHERE user_id = ? AND room_id = ?`;
            const res = await rpcPost('/update', { sql, params: [currentTimestamp, currentTimestamp, userId, roomId] }, token);

            if (res.code === 0 && res.data.result?.affectedRows > 0) {
                return { msg: 'ok', data: { success: true } };
            } else {
                return { msg: 'err', data: null };
            }
        } catch (error) {
            return { msg: 'server_error', data: null };
        }
    }

    /**
     * 获取用户房间未读消息数
     */
    async getUserRoomUnreadCount(userId: number, roomId: number, token: string): Promise<number> {
        try {
            // 1. 优先从Redis获取 - 使用房间维度的存储
            const redis = await redisPool.acquire();
            let unreadCount: number;
            try {
                const cachedCount = await redis.hget(RedisKey.roomUserUnreadCount(roomId), String(userId));
                if (cachedCount !== null) {
                    return parseInt(cachedCount);
                }
            } finally {
                await redisPool.release(redis);
            }
            
            // 2. Redis缓存未命中，从MySQL获取
            const sql = `SELECT unread_count FROM chat_user_room_${userId % 10} WHERE user_id = ? AND room_id = ? AND is_deleted = 0`;
            const res = await rpcPost('/select', { sql, params: [userId, roomId] }, token);
            
            if (res.code === 0 && res.data.result !== 'null') {
                const userRooms = JSON.parse(res.data.result);
                if (userRooms.length > 0) {
                    unreadCount = userRooms[0].unread_count || 0;
                    // 3. 回写到Redis缓存 - 使用房间维度的存储
                    const redis2 = await redisPool.acquire();
                    try {
                        await redis2.hset(RedisKey.roomUserUnreadCount(roomId), String(userId), unreadCount);
                    } finally {
                        await redisPool.release(redis2);
                    }
                    return unreadCount;
                }
            }
            return 0;
        } catch (error) {
            console.error('GetUserRoomUnreadCount error:', error);
            return 0;
        }
    }

    // 标记用户房间为已读
    async markUserRoomAsRead(userId: number, roomId: number, token: string): Promise<ResponseData> {
        try {
            // console.log('markUserRoomAsRead', userId, roomId);
            // 1. 清理redis未读消息数 - 使用房间维度的存储
            const redis = await redisPool.acquire();
            try {
                await redis.hdel(RedisKey.roomUserUnreadCount(roomId), String(userId));
            } finally {
                await redisPool.release(redis);
            }

            // 2. 更新MySQL数据库中的未读状态
            // 注意：这里我们只清零未读计数，不更新last_read_message_id，因为没有传入messageId
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const updateSql = `UPDATE chat_user_room_${userId % 10} SET unread_count = 0, updated_at = ? WHERE user_id = ? AND room_id = ?`;
           const res = await rpcPost('/update', { sql: updateSql, params: [currentTimestamp, userId, roomId] }, token);
        //    console.log('markUserRoomAsRead res' , res);

            return { msg: 'ok', data: { success: true } };
        } catch (error) {
            console.error('MarkUserRoomAsRead error:', error);
            return { msg: 'err', data: { message: 'Failed to mark as read' } };
        }
    }

    /**
     * 处理用户加入房间
     */
    private async handleJoinRoom(socket: Socket, roomId: string, userId: number, token: string) {
        try {
            // 验证用户是否是房间成员
            const isMember = await this.quickValidateMember(userId, Number(roomId));
            if (!isMember) {
                socket.emit('error', { message: 'You are not a member of this room.' });
                return;
            }

            // 检查用户是否已经在房间中
            const rooms = socket.rooms;
            if (rooms.has(roomId)) {
                // console.log(`用户 ${userId} 已经在房间 ${roomId} 中`);
                return;
            }

            // 加入房间
            socket.join(roomId);
            // console.log(`用户 ${userId} 加入房间 ${roomId}`);

            //标记已读
            await this.markUserRoomAsRead(userId, Number(roomId), token);
            // 通知房间其他成员
            socket.to(roomId).emit('user_joined', {
                room_id: roomId,
                user_id: userId,
                user_name: `用户${userId}`
            });
        } catch (error) {
            console.error('加入房间失败:', error);
            socket.emit('error', { message: 'Failed to join room.' });
        }
    }

    /**
     * 处理用户离开房间
     */
    private async handleLeaveRoom(socket: Socket, roomId: string, userId: number) {
        try {
            // 离开房间
            socket.leave(roomId);
            // console.log(`用户 ${userId} 离开房间 ${roomId}`);

            // 通知房间其他成员
            socket.to(roomId).emit('user_left', {
                room_id: roomId,
                user_id: userId,
                user_name: `用户${userId}`
            });
        } catch (error) {
            console.error('离开房间失败:', error);
        }
    }

    /**
     * 获取用户详细信息并缓存
     * @param userId 用户ID
     * @param token 认证token
     * @returns 用户详细信息
     */
    private async getUserDetails(userId: number, token: string): Promise<IMemberDetail | null> {
        try {
            // 先尝试从缓存获取
            const redis = await redisPool.acquire();
            let cachedUserInfo;
            try {
                cachedUserInfo = await redis.get(RedisKey.userInfo(userId));
            } finally {
                await redisPool.release(redis);
            }
            
            if (cachedUserInfo) {
                return JSON.parse(cachedUserInfo);
            }
            
            // 缓存未命中，从数据库获取
            const sql = `SELECT id, nickname, avatar FROM entities WHERE id = ?`;
            const res = await rpcPost('/select', { sql, params: [userId] }, token);
            
            if (res.code === 0 && res.data.result !== 'null') {
                const userData = JSON.parse(res.data.result);
                if (userData.length > 0) {
                    const userInfo: IMemberDetail = {
                        id: userData[0].id,
                        nickname: userData[0].nickname || `User ${userId}`,
                        avatar: userData[0].avatar || '',
                        role: 'member' // 默认角色，具体角色在房间中设置
                    };
                    
                    // 缓存用户信息，设置1小时过期
                    const redis2 = await redisPool.acquire();
                    try {
                        await redis2.setex(RedisKey.userInfo(userId), 3600, JSON.stringify(userInfo));
                    } finally {
                        await redisPool.release(redis2);
                    }
                    
                    return userInfo;
                }
            }
            
            return null;
        } catch (error) {
            console.error('Failed to get user details:', error);
            return null;
        }
    }

    /**
     * 批量获取用户详细信息
     * @param userIds 用户ID列表
     * @param token 认证token
     * @returns 用户详细信息Map
     */
    private async getBatchUserDetails(userIds: number[], token: string): Promise<Map<number, IMemberDetail>> {
        const userDetailsMap = new Map<number, IMemberDetail>();
        
        // 先尝试从缓存批量获取
        const redis = await redisPool.acquire();
        try {
            const pipeline = redis.pipeline();
            userIds.forEach(userId => {
                pipeline.get(RedisKey.userInfo(userId));
            });
            
            const cachedResults = await pipeline.exec();
            const uncachedUserIds: number[] = [];
            
            cachedResults?.forEach((result, index) => {
                const userId = userIds[index];
                if (result[1]) {
                    try {
                        const userInfo = JSON.parse(result[1] as string);
                        userDetailsMap.set(userId, userInfo);
                    } catch (error) {
                        uncachedUserIds.push(userId);
                    }
                } else {
                    uncachedUserIds.push(userId);
                }
            });
            
            // 对于缓存未命中的用户，批量从数据库获取
            if (uncachedUserIds.length > 0) {
                const sql = `SELECT id, nickname, avatar FROM entities WHERE id IN (?)`;
                const res = await rpcPost('/select', { sql, params: [uncachedUserIds] }, token);
                
                if (res.code === 0 && res.data.result !== 'null') {
                    const userDataList = JSON.parse(res.data.result);
                    
                    // 批量缓存新获取的用户信息
                    const cachePipeline = redis.pipeline();
                    userDataList.forEach((userData: any) => {
                        const userInfo: IMemberDetail = {
                            id: userData.id,
                            nickname: userData.nickname || `User ${userData.id}`,
                            avatar: userData.avatar || '',
                            role: 'member'
                        };
                        userDetailsMap.set(userData.id, userInfo);
                        cachePipeline.setex(RedisKey.userInfo(userData.id), 3600, JSON.stringify(userInfo));
                    });
                    
                    await cachePipeline.exec();
                }
            }
        } finally {
            await redisPool.release(redis);
        }
        
        return userDetailsMap;
    }

    /**
     * 更新用户信息缓存
     * @param userId 用户ID
     * @param token 认证token
     */
    public async updateUserInfoCache(userId: number, token: string): Promise<void> {
        try {
            // 获取最新的用户信息
            const userInfo = await this.getUserDetails(userId, token);
            if (userInfo) {
                // 获取用户所在的所有房间
                const roomIds = await this.getUserRoomsFromDB(userId, token);
                
                // 更新所有相关房间的用户详情缓存
                for (const roomId of roomIds) {
                    await this.updateRoomUserDetailsCache(roomId, token);
                }
            }
        } catch (error) {
            console.error('Failed to update user info cache:', error);
        }
    }

    /**
     * 更新房间用户详情缓存
     * @param roomId 房间ID
     * @param token 认证token
     */
    private async updateRoomUserDetailsCache(roomId: number, token: string): Promise<void> {
        try {
            // 获取房间成员
            const memberIds = await this.getRoomMemberIds(roomId, token);
            if (memberIds.length === 0) return;
            
            // 批量获取用户详情
            const userDetailsMap = await this.getBatchUserDetails(memberIds, token);
            
            // 获取用户在房间中的角色
            const tableIndex = roomId % 10;
            const rolesSql = `SELECT user_id, role FROM chat_room_user_${tableIndex} WHERE is_kicked=0 and room_id = ? AND user_id IN (?)`;
            const rolesRes = await rpcPost('/select', { sql: rolesSql, params: [roomId, memberIds] }, token);
            
            const rolesMap = new Map<number, string>();
            if (rolesRes.code === 0 && rolesRes.data.result !== 'null') {
                const roles = JSON.parse(rolesRes.data.result);
                roles.forEach((r: { user_id: number; role: string }) => {
                    rolesMap.set(r.user_id, r.role);
                });
            }
            
            // 构建完整的用户详情列表
            const userDetails: IMemberDetail[] = memberIds.map(userId => {
                const userInfo = userDetailsMap.get(userId) || {
                    id: userId,
                    nickname: `User ${userId}`,
                    avatar: '',
                    role: 'member'
                };
                return {
                    ...userInfo,
                    role: rolesMap.get(userId) || 'member'
                };
            });
            
            // 缓存房间用户详情，设置1小时过期
            const redis = await redisPool.acquire();
            try {
                await redis.setex(RedisKey.roomUserDetails(roomId), 36000, JSON.stringify(userDetails));
            } finally {
                await redisPool.release(redis);
            }
        } catch (error) {
            console.error('Failed to update room user details cache:', error);
        }
    }

    /**
     * 获取房间成员ID列表
     * @param roomId 房间ID
     * @param token 认证token
     * @returns 成员ID列表
     */
    private async getRoomMemberIds(roomId: number, token: string): Promise<number[]> {
        // 先尝试从Redis缓存获取
        const redis = await redisPool.acquire();
        let memberIds: number[] = [];
        try {
            const cachedMembers = await redis.smembers(RedisKey.roomUsers(roomId));
            memberIds = cachedMembers.map(Number);
        } finally {
            await redisPool.release(redis);
        }
        
        // 如果缓存中没有，从数据库获取
        if (memberIds.length === 0) {
            const tableIndex = roomId % 10;
            const sql = `SELECT user_id FROM chat_room_user_${tableIndex} WHERE is_kicked=0 and room_id = ?`;
            const res = await rpcPost("/select", { sql, params: [roomId] }, token);
            if (res.code === 0 && res.data.result !== 'null') {
                memberIds = JSON.parse(res.data.result).map((r: { user_id: number }) => r.user_id);
            }
        }
        
        return memberIds;
    }

    /**
     * 当房间中所有用户下线时，保存最后一条消息信息到chat_room表
     * @param roomId 房间ID
     */
    private async saveLastMessageToRoom(roomId: number, token: string): Promise<void> {
        try {
            // 1. 从MongoDB获取房间的最后一条消息
            const MessageModel = getMessageModel(String(roomId));
            const lastMessage = await MessageModel.findOne()
                .sort({ created_at: -1 })
                .lean();
            // console.log('saveLastMessageToRoom lastMessage', lastMessage);
            if (lastMessage) {
                // 格式化消息内容
                let formattedContent = lastMessage.content;
                if (lastMessage.type === 'image') {
                    formattedContent = '[图片]';
                } else if (lastMessage.type === 'video') {
                    formattedContent = '[视频]';
                } else if (lastMessage.type === 'file') {
                    formattedContent = '[文件]';
                } else if (lastMessage.type === 'link') {
                    formattedContent = '[链接]';
                } else if (lastMessage.type === 'audio') {
                    formattedContent = '[语音]';
                }else if (lastMessage.type === 'custom') {
                    formattedContent = lastMessage.title;
                }
                // 2. 更新chat_room表中的最后消息信息
                const updateSql = `UPDATE chat_room SET last_message_id = ?, last_message_content = ?, last_message_time = ? WHERE id = ?`;
                const mysqlDateTime = + new Date()/1000;
                
              const res =  await rpcPost('/update', {
                    sql: updateSql,
                    params: [
                        lastMessage.msg_id,
                        formattedContent,
                        mysqlDateTime,
                        roomId
                    ]
                }, token);
                // console.log('saveLastMessageToRoom res', res);
            } else {
                // console.log(`No messages found for room ${roomId}`);
            }

            // 3. 批量更新房间内所有用户的未读消息数到MySQL
            await this.batchUpdateUnreadCountsToMySQL(roomId, token);
        } catch (error) {
            console.error(`Failed to save last message info for room ${roomId}:`, error);
        }
    }

    /**
     * 将最多20条历史消息加载到Redis中
     * @param roomId 房间ID
     */
    private async loadHistoryMessagesToRedis(roomId: number): Promise<void> {
        try {
            const redis = await redisPool.acquire();
            try {
                // 检查Redis中是否已经有消息缓存
                const existingMessages = await redis.llen(RedisKey.roomMessages(roomId));
                if (existingMessages > 0) {
                    return; // 已经有缓存，不需要重复加载
                }

                // 从MongoDB获取最新的20条消息
                const MessageModel = getMessageModel(String(roomId));
                const messages = await MessageModel.find()
                    .sort({ created_at: -1 }) // 按创建时间倒序
                    .limit(20) // 限制20条
                    .lean(); // 使用 lean() 提高查询性能 
                if (messages.length > 0) {
                    // 将消息存储到Redis列表中（保持正确的时间顺序）
                    const pipeline = redis.pipeline();
                    // 由于messages已经是倒序（最新在前），我们使用rpush按顺序存储
                    // 这样Redis中的顺序就是：[最新, 次新, ..., 最旧]
                    messages.forEach(message => {
                        pipeline.rpush(RedisKey.roomMessages(roomId), JSON.stringify(message));
                    });
                    
                    // 限制Redis中缓存的消息最多20条
                    pipeline.ltrim(RedisKey.roomMessages(roomId), 0, 19);
                    
                    await pipeline.exec();
                    //console.log(`Loaded ${messages.length} history messages to Redis for room ${roomId}`);
                }
            } finally {
                await redisPool.release(redis);
            }
        } catch (error) {
            console.error(`Failed to load history messages to Redis for room ${roomId}:`, error);
        }
    }

    /**
     * 批量更新房间内所有用户的未读消息数到MySQL数据库
     * 只在房间用户全部下线时调用
     * @param roomId 房间ID
     * @param token 认证token
     */
    private async batchUpdateUnreadCountsToMySQL(roomId: number, token: string): Promise<void> {
        try {
            const redis = await redisPool.acquire();
            try {
                // 获取房间内所有用户的未读消息数
                const unreadCounts = await redis.hgetall(RedisKey.roomUserUnreadCount(roomId));
                
                if (Object.keys(unreadCounts).length === 0) {
                    return; // 没有未读消息需要更新
                }

                // 批量更新MySQL数据库
                const currentTimestamp = Math.floor(Date.now() / 1000); // Unix时间戳
                const updatePromises = Object.entries(unreadCounts).map(async ([userId, unreadCount]) => {
                    const userIdNum = Number(userId);
                    const unreadCountNum = Number(unreadCount);
                    
                    // 如果未读数为0，则清零MySQL中的未读数
                    if (unreadCountNum === 0) {
                        const updateSql = `UPDATE chat_user_room_${userIdNum % 10} SET unread_count = 0, updated_at = ? WHERE user_id = ? AND room_id = ?`;
                        //console.log(`执行SQL: ${updateSql}, 参数: [${currentTimestamp}, ${userIdNum}, ${roomId}]`);
                        const result = await rpcPost('/update', { sql: updateSql, params: [currentTimestamp, userIdNum, roomId] }, token);
                       // console.log(`用户${userIdNum}更新结果:`, result);
                        return result;
                    } else {
                        // 否则更新为Redis中的未读数
                        const updateSql = `UPDATE chat_user_room_${userIdNum % 10} SET unread_count = ?, updated_at = ? WHERE user_id = ? AND room_id = ?`;
                        //console.log(`执行SQL: ${updateSql}, 参数: [${unreadCountNum}, ${currentTimestamp}, ${userIdNum}, ${roomId}]`);
                        const result = await rpcPost('/update', { sql: updateSql, params: [unreadCountNum, currentTimestamp, userIdNum, roomId] }, token);
                        //console.log(`用户${userIdNum}更新结果:`, result);
                        return result;
                    }
                });

                const results = await Promise.all(updatePromises);
                //console.log(`Successfully updated unread counts for room ${roomId} to MySQL, 结果:`, results);
                
            } finally {
                await redisPool.release(redis);
            }
        } catch (error) {
            console.error(`Failed to batch update unread counts for room ${roomId}:`, error);
        }
    }
} 