import { Router, Request, Response } from 'express';
import { NotificationService } from './service';
import {
  CreateSystemNotificationModel,
  CreateBusinessNotificationModel,
  CreateConsultationModel,
  ReplyConsultationModel,
  NotificationQueryModel,
  ConsultationQueryModel,
} from './proto';
import { ResponseData } from '../app/proto';
import { validate } from '../../common/common';
import { httpSuccess, http400Error, handleException } from '../../common/common';
import { getLang } from '../../lang';
import {
  createSystemNotificationValidation,
  getSystemNotificationsValidation,
  markSystemNotificationAsReadValidation,
  createBusinessNotificationValidation,
  getBusinessNotificationsValidation,
  markBusinessNotificationAsReadValidation,
  createConsultationValidation,
  getConsultationsValidation,
  getConsultationDetailValidation,
  replyConsultationValidation,
  closeConsultationValidation,
  getUnreadCountValidation,
} from './form';

const router = Router();
const notificationService = new NotificationService();

// 模拟从token中获取用户信息
function getUserInfo(req: Request): { userId: number; userType: number } {
  // 这里应该从JWT token中解析用户信息
  // 暂时使用模拟数据
  return {
    userId: parseInt(req.headers['user-id'] as string) || 1,
    userType: parseInt(req.headers['user-type'] as string) || 1
  };
}

// ======================== 系统通知相关接口 ========================
// 创建系统通知
router.post('/system-notification/create', validate(createSystemNotificationValidation), async (req: Request, res: Response) => {
  try {
    const data: CreateSystemNotificationModel = req.body;
    const result = await notificationService.createSystemNotification(data);
    const handlerMap = {
        ok: () => httpSuccess(res, result.data, getLang('success')),
        not_found: () => http400Error(res, getLang('not_found')),
        err: () => http400Error(res, getLang('failure')),
        server_error: () => http400Error(res, getLang('server_error')),
        default: () => http400Error(res, getLang('server_error')),
    };
    return (handlerMap[result.msg] || handlerMap['default'])();
  } catch (error) {
    return handleException(res, error, 'CreateSystemNotification');
  }
});

// 获取系统通知列表
router.post('/system-notification/list', validate(getSystemNotificationsValidation), async (req: Request, res: Response) => {
  try {
    const query: NotificationQueryModel = {
      user_id: req.body.user_id || 0,
      type: req.body.type,
      is_read: req.body.is_read,
      page: req.body.page || 1,
      page_size: req.body.page_size || 20,
    };
    const result = await notificationService.getSystemNotifications(query);
    const handlerMap = {
        ok: () => httpSuccess(res, result.data, getLang('success')),
        not_found: () => http400Error(res, getLang('not_found')),
        err: () => http400Error(res, getLang('failure')),
        server_error: () => http400Error(res, getLang('server_error')),
        default: () => http400Error(res, getLang('server_error')),
    };
    return (handlerMap[result.msg] || handlerMap['default'])();
  } catch (error) {
    return handleException(res, error, 'GetSystemNotifications');
  }
});

// 标记系统通知为已读
router.post('/system-notification/read', validate(markSystemNotificationAsReadValidation), async (req: Request, res: Response) => {
  try {
    const { userId } = getUserInfo(req);
    const notificationId = req.body.notification_id;
    const result = await notificationService.markSystemNotificationAsRead(notificationId, userId);
    const handlerMap = {
        ok: () => httpSuccess(res, result.data, getLang('success')),
        not_found: () => http400Error(res, getLang('not_found')),
        err: () => http400Error(res, getLang('failure')),
        server_error: () => http400Error(res, getLang('server_error')),
        default: () => http400Error(res, getLang('server_error')),
    };
    return (handlerMap[result.msg] || handlerMap['default'])();
  } catch (error) {
    return handleException(res, error, 'MarkSystemNotificationAsRead');
  }
});

// ======================== 业务通知相关接口 ========================
// 创建业务通知
router.post('/business-notification/create', validate(createBusinessNotificationValidation), async (req: Request, res: Response) => {
  try {
    const data: CreateBusinessNotificationModel = req.body;
    const result = await notificationService.createBusinessNotification(data);
    const handlerMap = {
        ok: () => httpSuccess(res, result.data, getLang('success')),
        not_found: () => http400Error(res, getLang('not_found')),
        err: () => http400Error(res, getLang('failure')),
        server_error: () => http400Error(res, getLang('server_error')),
        default: () => http400Error(res, getLang('server_error')),
    };
    return (handlerMap[result.msg] || handlerMap['default'])();
  } catch (error) {
    return handleException(res, error, 'CreateBusinessNotification');
  }
});

// 获取业务通知列表
router.post('/business-notification/list', validate(getBusinessNotificationsValidation), async (req: Request, res: Response) => {
  try {
    const { userId } = getUserInfo(req);
    const query: NotificationQueryModel = {
      user_id: userId,
      type: req.body.type,
      is_read: req.body.is_read,
      page: req.body.page || 1,
      page_size: req.body.page_size || 20,
    };
    const result = await notificationService.getBusinessNotifications(query);
    const handlerMap = {
        ok: () => httpSuccess(res, result.data, getLang('success')),
        not_found: () => http400Error(res, getLang('not_found')),
        err: () => http400Error(res, getLang('failure')),
        server_error: () => http400Error(res, getLang('server_error')),
        default: () => http400Error(res, getLang('server_error')),
    };
    return (handlerMap[result.msg] || handlerMap['default'])();
  } catch (error) {
    return handleException(res, error, 'GetBusinessNotifications');
  }
});

// 标记业务通知为已读
router.post('/business-notification/read', validate(markBusinessNotificationAsReadValidation), async (req: Request, res: Response) => {
  try {
    const { userId } = getUserInfo(req);
    const notificationId = req.body.notification_id;
    const result = await notificationService.markBusinessNotificationAsRead(notificationId, userId);
    const handlerMap = {
        ok: () => httpSuccess(res, result.data, getLang('success')),
        not_found: () => http400Error(res, getLang('not_found')),
        err: () => http400Error(res, getLang('failure')),
        server_error: () => http400Error(res, getLang('server_error')),
        default: () => http400Error(res, getLang('server_error')),
    };
    return (handlerMap[result.msg] || handlerMap['default'])();
  } catch (error) {
    return handleException(res, error, 'MarkBusinessNotificationAsRead');
  }
});

// ======================== 问题咨询相关接口 ========================
// 创建问题咨询
router.post('/consultation/create', validate(createConsultationValidation), async (req: Request, res: Response) => {
  try {
    const { userId } = getUserInfo(req);
    const data: CreateConsultationModel = req.body;
    const result = await notificationService.createConsultation(data, userId);
    const handlerMap = {
        ok: () => httpSuccess(res, result.data, getLang('success')),
        not_found: () => http400Error(res, getLang('not_found')),
        err: () => http400Error(res, getLang('failure')),
        server_error: () => http400Error(res, getLang('server_error')),
        default: () => http400Error(res, getLang('server_error')),
    };
    return (handlerMap[result.msg] || handlerMap['default'])();
  } catch (error) {
    return handleException(res, error, 'CreateConsultation');
  }
});

// 获取问题咨询列表
router.post('/consultation/list', validate(getConsultationsValidation), async (req: Request, res: Response) => {
  try {
    const query: ConsultationQueryModel = {
      user_id: req.body.user_id,
      entity_id: req.body.entity_id,
      status: req.body.status,
      category: req.body.category,
      page: req.body.page || 1,
      page_size: req.body.page_size || 20,
    };
    const result = await notificationService.getConsultations(query);
    const handlerMap = {
        ok: () => httpSuccess(res, result.data, getLang('success')),
        not_found: () => http400Error(res, getLang('not_found')),
        err: () => http400Error(res, getLang('failure')),
        server_error: () => http400Error(res, getLang('server_error')),
        default: () => http400Error(res, getLang('server_error')),
    };
    return (handlerMap[result.msg] || handlerMap['default'])();
  } catch (error) {
    return handleException(res, error, 'GetConsultations');
  }
});

// 获取问题咨询详情
router.post('/consultation/detail', validate(getConsultationDetailValidation), async (req: Request, res: Response) => {
  try {
    const consultationId = req.body.consultation_id;
    const result = await notificationService.getConsultationDetail(consultationId);
    const handlerMap = {
        ok: () => httpSuccess(res, result.data, getLang('success')),
        not_found: () => http400Error(res, getLang('not_found')),
        err: () => http400Error(res, getLang('failure')),
        server_error: () => http400Error(res, getLang('server_error')),
        default: () => http400Error(res, getLang('server_error')),
    };
    return (handlerMap[result.msg] || handlerMap['default'])();
  } catch (error) {
    return handleException(res, error, 'GetConsultationDetail');
  }
});

// 回复问题咨询
router.post('/consultation/reply', validate(replyConsultationValidation), async (req: Request, res: Response) => {
  try {
    const { userId } = getUserInfo(req);
    const data: ReplyConsultationModel = req.body;
    const result = await notificationService.replyConsultation(data, userId);
    const handlerMap = {
        ok: () => httpSuccess(res, result.data, getLang('success')),
        not_found: () => http400Error(res, getLang('not_found')),
        err: () => http400Error(res, getLang('failure')),
        server_error: () => http400Error(res, getLang('server_error')),
        default: () => http400Error(res, getLang('server_error')),
    };
    return (handlerMap[result.msg] || handlerMap['default'])();
  } catch (error) {
    return handleException(res, error, 'ReplyConsultation');
  }
});

// 关闭问题咨询
router.post('/consultation/close', validate(closeConsultationValidation), async (req: Request, res: Response) => {
  try {
    const { userId } = getUserInfo(req);
    const consultationId = req.body.consultation_id;
    const result = await notificationService.closeConsultation(consultationId, userId);
    const handlerMap = {
        ok: () => httpSuccess(res, result.data, getLang('success')),
        not_found: () => http400Error(res, getLang('not_found')),
        err: () => http400Error(res, getLang('failure')),
        server_error: () => http400Error(res, getLang('server_error')),
        default: () => http400Error(res, getLang('server_error')),
    };
    return (handlerMap[result.msg] || handlerMap['default'])();
  } catch (error) {
    return handleException(res, error, 'CloseConsultation');
  }
});

// ======================== 统计相关接口 ========================
// 获取未读消息数量
router.post('/unread-count', validate(getUnreadCountValidation), async (req: Request, res: Response) => {
  try {
    const { userId } = getUserInfo(req);
    const result = await notificationService.getUnreadCount(userId);
    const handlerMap = {
        ok: () => httpSuccess(res, result.data, getLang('success')),
        not_found: () => http400Error(res, getLang('not_found')),
        err: () => http400Error(res, getLang('failure')),
        server_error: () => http400Error(res, getLang('server_error')),
        default: () => http400Error(res, getLang('server_error')),
    };
    return (handlerMap[result.msg] || handlerMap['default'])();
  } catch (error) {
    return handleException(res, error, 'GetUnreadCount');
  }
});

export default router; 