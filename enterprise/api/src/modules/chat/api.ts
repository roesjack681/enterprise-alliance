import { Router, Request, Response } from 'express';
import { ChatService } from './service';
// import { UnreadCountMigration } from './migration';
import { validate } from '../../common/common';
import { httpSuccess, http400Error, handleException } from '../../common/common';
import { getLang } from '../../lang';
import { 
    createGroupRoomValidation, 
    getMessageHistoryValidation,
    createUserRoomValidation,
    getUserRoomsValidation,
    getUserRoomDetailValidation,
    updateUserRoomValidation,
    deleteUserRoomValidation,
    markUserRoomAsReadValidation,
    getUserRoomsListValidation
} from './form';

export const createChatRouter = (chatService: ChatService): Router => {
    const router = Router();

    // ====== 测试接口 ======
    router.get('/test/ping', async (req, res) => {
        try {
            return httpSuccess(res, Date.now(), getLang('success'));
        } catch (e) {
            return http400Error(res, getLang('server_error'));
        }
    });

    // ====== POST 测试接口 ======
    router.post('/test/post', async (req, res) => {
        try {
            return httpSuccess(res, Date.now(), getLang('success'));
        } catch (e) {
            return http400Error(res, getLang('server_error'));
        }
    });

    /**
     * 创建群聊房间
     */
    router.post('/room/create_group', validate(createGroupRoomValidation), async (req: Request, res: Response) => {
        try {
            const ownerId = req["entity_id"];
            const token = req["token"];
            const { room_name, member_ids, avatar, desc } = req.body;
            if (!ownerId || !token) {
                return http400Error(res, getLang('unauthorized'));
            }
            const membids:number[]=member_ids.split(',')
            const result = await chatService.createGroupRoom(ownerId, room_name, membids, token, avatar, desc);
            const handlerMap = {
                ok: () => httpSuccess(res, result.data, getLang('success')),
                not_found: () => http400Error(res, getLang('not_found')),
                forbidden: () => http400Error(res, getLang('forbidden')),
                err: () => http400Error(res, getLang('failure')),
                server_error: () => http400Error(res, getLang('server_error')),
                default: () => http400Error(res, getLang('server_error')),
            };
            return (handlerMap[result.msg] || handlerMap["default"])();
        } catch (error) {
            return handleException(res, error, 'CreateGroupRoom');
        }
    });

    /**
     * 创建私聊房间
     */
    router.post('/room/create_private', async (req: Request, res: Response) => {
        try {
            const userId1 = req["entity_id"];
            const token = req["token"];
            const { user_id2 } = req.body;
            if (!userId1 || !token) {
                return http400Error(res, getLang('unauthorized'));
            }
            const result = await chatService.createPrivateRoom(userId1, user_id2, token);
            const handlerMap = {
                ok: () => httpSuccess(res, result.data, getLang('success')),
                not_found: () => http400Error(res, getLang('not_found')),
                forbidden: () => http400Error(res, getLang('forbidden')),
                err: () => http400Error(res, getLang('failure')),
                server_error: () => http400Error(res, getLang('server_error')),
                default: () => http400Error(res, getLang('server_error')),
            };
            return (handlerMap[result.msg] || handlerMap["default"])();
        } catch (error) {
            return handleException(res, error, 'CreatePrivateRoom');
        }
    });




    /**
     * 获取房间的历史消息 (分页)
     */
    router.post('/message/history', validate(getMessageHistoryValidation), async (req: Request, res: Response) => {
        try {
            const userId = req["entity_id"];
            const token = req["token"];
            const { room_id, page, page_size } = req.body;
            if (!userId || !token) {
                return http400Error(res, getLang('unauthorized'));
            }
            const isMember = await chatService.isRoomMember(userId, Number(room_id), token);
            if (!isMember) {
                return http400Error(res, getLang('forbidden'));
            }
            const result = await chatService.getMessageHistory(room_id, userId, page, page_size, token);
            const handlerMap = {
                ok: () => httpSuccess(res, result.data, getLang('success')),
                not_found: () => http400Error(res, getLang('not_found')),
                forbidden: () => http400Error(res, getLang('forbidden')),
                err: () => http400Error(res, getLang('failure')),
                server_error: () => http400Error(res, getLang('server_error')),
                default: () => http400Error(res, getLang('server_error')),
            };
            return (handlerMap[result.msg] || handlerMap["default"])();
        } catch (error) {
            return handleException(res, error, 'GetMessageHistory');
        }
    });

    /**
     * 获取当前用户的房间列表（支持分页）
     */
    router.post('/room/list', validate(getUserRoomsListValidation), async (req: Request, res: Response) => {
        try {
            const userId = req["entity_id"];
            const token = req["token"];
            const { page = 1, page_size = 20 } = req.body;
            if (!userId || !token) {
                return http400Error(res, getLang('unauthorized'));
            }
            const result = await chatService.getUserRooms(userId, token, Number(page), Number(page_size));
            const handlerMap = {
                ok: () => httpSuccess(res, result.data, getLang('success')),
                not_found: () => http400Error(res, getLang('not_found')),
                forbidden: () => http400Error(res, getLang('forbidden')),
                err: () => http400Error(res, getLang('failure')),
                server_error: () => http400Error(res, getLang('server_error')),
                default: () => http400Error(res, getLang('server_error')),
            };
            return (handlerMap[result.msg] || handlerMap["default"])();
        } catch (error) {
            return handleException(res, error, 'GetUserRooms');
        }
    });

    /**
     * 获取当前用户的全部私聊（不分页）
     */
    router.post('/room/private-chats', async (req: Request, res: Response) => {
        try {
            const userId = req["entity_id"];
            const token = req["token"];
            if (!userId || !token) {
                return http400Error(res, getLang('unauthorized'));
            }
            const result = await chatService.getUserPrivateChats(userId, token);
            const handlerMap = {
                ok: () => httpSuccess(res, result.data, getLang('success')),
                not_found: () => http400Error(res, getLang('not_found')),
                forbidden: () => http400Error(res, getLang('forbidden')),
                err: () => http400Error(res, getLang('failure')),
                server_error: () => http400Error(res, getLang('server_error')),
                default: () => http400Error(res, getLang('server_error')),
            };
            return (handlerMap[result.msg] || handlerMap["default"])();
        } catch (error) {
            return handleException(res, error, 'GetUserPrivateChats');
        }
    });

    /**
     * 获取当前用户的全部群聊（不分页）
     */
    router.post('/room/group-chats', async (req: Request, res: Response) => {
        try {
            const userId = req["entity_id"];
            const token = req["token"];
            if (!userId || !token) {
                return http400Error(res, getLang('unauthorized'));
            }
            const result = await chatService.getUserGroupChats(userId, token);
            const handlerMap = {
                ok: () => httpSuccess(res, result.data, getLang('success')),
                not_found: () => http400Error(res, getLang('not_found')),
                forbidden: () => http400Error(res, getLang('forbidden')),
                err: () => http400Error(res, getLang('failure')),
                server_error: () => http400Error(res, getLang('server_error')),
                default: () => http400Error(res, getLang('server_error')),
            };
            return (handlerMap[result.msg] || handlerMap["default"])();
        } catch (error) {
            return handleException(res, error, 'GetUserGroupChats');
        }
    });

    /**
     * 获取房间详情（包括成员列表）
     */
    router.post('/room/detail', async (req: Request, res: Response) => {
        try {
            const userId = req["entity_id"];
            const token = req["token"];
            const { room_id } = req.body;
            if (!userId || !token) {
                return http400Error(res, getLang('unauthorized'));
            }
            if (!room_id) {
                return http400Error(res, getLang('validation_error'));
            }
            const isMember = await chatService.isRoomMember(userId, Number(room_id), token);
            if (!isMember) {
                return http400Error(res, getLang('forbidden'));
            }
            // console.log(isMember)
            const result = await chatService.getRoomWithMembers(Number(room_id), userId, token);
            const handlerMap = {
                ok: () => httpSuccess(res, result.data, getLang('success')),
                not_found: () => http400Error(res, getLang('not_found')),
                forbidden: () => http400Error(res, getLang('forbidden')),
                err: () => http400Error(res, getLang('failure')),
                server_error: () => http400Error(res, getLang('server_error')),
                default: () => http400Error(res, getLang('server_error')),
            };
            return (handlerMap[result.msg] || handlerMap["default"])();
        } catch (error) {
            return handleException(res, error, 'GetRoomDetail');
        }
    });

    /**
     * 邀请用户加入群聊
     */
    router.post('/room/invite', async (req: Request, res: Response) => {
        try {
            const inviterId = req["entity_id"];
            const token = req["token"];
            const { invite_code	, invitee_ids } = req.body;
             
            let inviteeids=[invitee_ids]
            if (!invite_code|| !Array.isArray(inviteeids) || inviteeids.length === 0) {
                return http400Error(res, getLang('validation_error'));
            }
            //通过邀请码查询群房间信息
            const roomInfo = await chatService.getRoomInfoByInviteCode(invite_code,token);
           
            if (roomInfo.msg !== 'ok') {
                return http400Error(res, getLang('not_found'));
            }
            const roomId = roomInfo.data[0].id; 

            const result = await chatService.inviteToGroupRoom(inviterId, roomId, inviteeids, token);
            const handlerMap = {
                ok: () => httpSuccess(res, result.data, getLang('success')),
                not_found: () => http400Error(res, getLang('not_found')),
                forbidden: () => http400Error(res, getLang('forbidden')),
                err: () => http400Error(res, getLang('failure')),
                server_error: () => http400Error(res, getLang('server_error')),
                default: () => http400Error(res, getLang('server_error')),
            };
            return (handlerMap[result.msg] || handlerMap["default"])();
        } catch (error) {
            return handleException(res, error, 'InviteToGroup');
        }
    });

    /**
     * 从群聊中踢出成员
     */
    router.post('/room/kick', async (req: Request, res: Response) => {
        try {
            const kickerId = req["entity_id"];
            const token = req["token"];
            const { room_id, kickee_id } = req.body;
            if (!kickerId || !token) {
                return http400Error(res, getLang('unauthorized'));
            }
            if (!room_id || !kickee_id) {
                return http400Error(res, getLang('validation_error'));
            }
            // if (kickerId == Number(kickee_id)) {
            //     return http400Error(res, getLang('bad_request') + ' Cannot kick yourself.');
            // }
            const result = await chatService.kickFromGroupRoom(kickerId, Number(room_id), Number(kickee_id), token);
            const handlerMap = {
                ok: () => httpSuccess(res, result.data, getLang('success')),
                not_found: () => http400Error(res, getLang('not_found')),
                forbidden: () => http400Error(res, getLang('forbidden')),
                err: () => http400Error(res, getLang('failure')),
                server_error: () => http400Error(res, getLang('server_error')),
                default: () => http400Error(res, getLang('server_error')),
            };
            return (handlerMap[result.msg] || handlerMap["default"])();
        } catch (error) {
            return handleException(res, error, 'KickFromGroup');
        }
    });

    // ======================== 用户房间关联相关接口 ========================

    /**
     * 创建用户房间关联
     */
    router.post('/user-room/create', validate(createUserRoomValidation), async (req: Request, res: Response) => {
        try {
            const { user_id, room_id, room_name, room_avatar, is_pinned, is_muted } = req.body;
            const token = req["token"];
            const result = await chatService.createUserRoom({ user_id, room_id, room_name, room_avatar, is_pinned, is_muted }, token);
            const handlerMap = {
                ok: () => httpSuccess(res, result.data, getLang('success')),
                already_exists: () => http400Error(res, getLang('already_exists')),
                err: () => http400Error(res, getLang('failure')),
                server_error: () => http400Error(res, getLang('server_error')),
                default: () => http400Error(res, getLang('server_error')),
            };
            return (handlerMap[result.msg] || handlerMap["default"])();
        } catch (error) {
            return handleException(res, error, 'CreateUserRoom');
        }
    });

    /**
     * 获取用户房间列表
     */
    router.post('/user-room/list', validate(getUserRoomsValidation), async (req: Request, res: Response) => {
        try {
            console.log(req.body)
            const { user_id, room_id, is_pinned, is_deleted, page, page_size } = req.body;
            const token = req["token"];
            const result = await chatService.getUserRoomList({ 
                user_id, 
                room_id, 
                is_pinned, 
                is_deleted, 
                page: page || 1, 
                page_size: page_size || 20 
            }, token);
            const handlerMap = {
                ok: () => httpSuccess(res, result.data, getLang('success')),
                err: () => http400Error(res, getLang('failure')),
                server_error: () => http400Error(res, getLang('server_error')),
                default: () => http400Error(res, getLang('server_error')),
            };
            return (handlerMap[result.msg] || handlerMap["default"])();
        } catch (error) {
            return handleException(res, error, 'GetUserRooms');
        }
    });

    /**
     * 获取用户房间详情
     */
    router.post('/user-room/detail', validate(getUserRoomDetailValidation), async (req: Request, res: Response) => {
        try {
            const { user_id, room_id } = req.body;
            const token = req["token"];
            const result = await chatService.getUserRoomDetail(user_id, room_id, token);
            const handlerMap = {
                ok: () => httpSuccess(res, result.data, getLang('success')),
                not_found: () => http400Error(res, getLang('not_found')),
                err: () => http400Error(res, getLang('failure')),
                server_error: () => http400Error(res, getLang('server_error')),
                default: () => http400Error(res, getLang('server_error')),
            };
            return (handlerMap[result.msg] || handlerMap["default"])();
        } catch (error) {
            return handleException(res, error, 'GetUserRoomDetail');
        }
    });

    /**
     * 更新用户房间关联
     */
    router.post('/room/update', validate(updateUserRoomValidation), async (req: Request, res: Response) => {
        try {
            
            const {  room_id, room_name, avatar, descp, is_muted,  } = req.body;
            const user_id=req['entity_id']
            const token = req["token"];
            const result = await chatService.updateUserRoom(user_id, room_id, { 
                room_name, 
                avatar,  
                is_muted, 
                descp, 
            }, token);
            const handlerMap = {
                ok: () => httpSuccess(res, result.data, getLang('success')),
                err: () => http400Error(res, getLang('failure')),
                server_error: () => http400Error(res, getLang('server_error')),
                default: () => http400Error(res, getLang('server_error')),
            };
            return (handlerMap[result.msg] || handlerMap["default"])();
        } catch (error) {
            return handleException(res, error, 'UpdateUserRoom');
        }
    });

    /**
     * 删除用户房间关联
     */
    router.post('/user-room/delete', validate(deleteUserRoomValidation), async (req: Request, res: Response) => {
        try {
            const { user_id, room_id } = req.body;
            const token = req["token"];
            const result = await chatService.deleteUserRoom(user_id, room_id, token);
            const handlerMap = {
                ok: () => httpSuccess(res, result.data, getLang('success')),
                err: () => http400Error(res, getLang('failure')),
                server_error: () => http400Error(res, getLang('server_error')),
                default: () => http400Error(res, getLang('server_error')),
            };
            return (handlerMap[result.msg] || handlerMap["default"])();
        } catch (error) {
            return handleException(res, error, 'DeleteUserRoom');
        }
    });

    /**
     * 标记用户房间为已读
     */
    router.post('/user-room/mark-read', validate(markUserRoomAsReadValidation), async (req: Request, res: Response) => {
        try {
            const { user_id, room_id } = req.body;
            const token = req["token"];
            const result = await chatService.markUserRoomAsRead(user_id, room_id, token);
            const handlerMap = {
                ok: () => httpSuccess(res, result.data, getLang('success')),
                err: () => http400Error(res, getLang('failure')),
                server_error: () => http400Error(res, getLang('server_error')),
                default: () => http400Error(res, getLang('server_error')),
            };
            return (handlerMap[result.msg] || handlerMap["default"])();
        } catch (error) {
            return handleException(res, error, 'MarkUserRoomAsRead');
        }
    });

    // ======================== 房间未读消息计数管理接口 ========================

    /**
     * 获取房间内所有用户的未读消息数（用于调试和监控）
     */
    router.post('/room/unread-counts', async (req: Request, res: Response) => {
        try {
            const { room_id } = req.body;
            const token = req["token"];
            
            if (!room_id) {
                return http400Error(res, getLang('validation_error'));
            }

            const unreadCounts = await chatService.getRoomUnreadCounts(Number(room_id));
            return httpSuccess(res, { room_id, unread_counts: unreadCounts }, getLang('success'));
        } catch (error) {
            return handleException(res, error, 'GetRoomUnreadCounts');
        }
    });

    /**
     * 强制同步房间未读消息数到MySQL（用于手动同步）
     */
    router.post('/room/sync-unread-counts', async (req: Request, res: Response) => {
        try {
            const { room_id } = req.body;
            const token = req["token"];
            
            if (!room_id) {
                return http400Error(res, getLang('validation_error'));
            }

            const result = await chatService.forceSyncUnreadCountsToMySQL(Number(room_id), token);
            const handlerMap = {
                ok: () => httpSuccess(res, result.data, getLang('success')),
                err: () => http400Error(res, getLang('failure')),
                server_error: () => http400Error(res, getLang('server_error')),
                default: () => http400Error(res, getLang('server_error')),
            };
            return (handlerMap[result.msg] || handlerMap["default"])();
        } catch (error) {
            return handleException(res, error, 'ForceSyncUnreadCounts');
        }
    });


    return router;
}; 