import mongoose, { Schema, Document } from 'mongoose';
import { MongoBase, BaseDoc } from '../../storage/mongodb';
import {
  SystemNotificationModel,
  BusinessNotificationModel,
  ConsultationModel,
  NotificationQueryModel,
  ConsultationQueryModel,
  CreateSystemNotificationModel,
  CreateBusinessNotificationModel,
  CreateConsultationModel,
  ReplyConsultationModel,
} from './proto';
import { ResponseData, JWTUserInfo } from '../app/proto';

// MongoDB Schema 定义
const systemNotificationSchema = new Schema<SystemNotificationModel & BaseDoc>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: Number, required: true },
  priority: { type: Number, required: true },
  target_users: [{ type: Number }],
  target_entities: [{ type: Number }],
  is_read: { type: Boolean, default: false },
}, { timestamps: true });

const businessNotificationSchema = new Schema<BusinessNotificationModel & BaseDoc>({
  user_id: { type: Number, required: true, index: true },
  entity_id: { type: Number },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: Number, required: true },
  related_id: { type: String },
  related_type: { type: String },
  is_read: { type: Boolean, default: false },
}, { timestamps: true });

const consultationSchema = new Schema<ConsultationModel & BaseDoc>({
  user_id: { type: Number, required: true, index: true },
  entity_id: { type: Number },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: Number, required: true },
  status: { type: Number, default: 1 },
  priority: { type: Number, required: true },
  images: [{ type: String }],
  reply_content: { type: String },
  reply_time: { type: Date },
  reply_user_id: { type: Number },
}, { timestamps: true });

export interface INotificationService {
  // 系统通知相关
  createSystemNotification(data: CreateSystemNotificationModel): Promise<ResponseData>;
  getSystemNotifications(query: NotificationQueryModel): Promise<ResponseData>;
  markSystemNotificationAsRead(notificationId: string, userId: number): Promise<ResponseData>;
  
  // 业务通知相关
  createBusinessNotification(data: CreateBusinessNotificationModel): Promise<ResponseData>;
  getBusinessNotifications(query: NotificationQueryModel): Promise<ResponseData>;
  markBusinessNotificationAsRead(notificationId: string, userId: number): Promise<ResponseData>;
  
  // 问题咨询相关
  createConsultation(data: CreateConsultationModel, userId: number): Promise<ResponseData>;
  getConsultations(query: ConsultationQueryModel): Promise<ResponseData>;
  getConsultationDetail(consultationId: string): Promise<ResponseData>;
  replyConsultation(data: ReplyConsultationModel, replyUserId: number): Promise<ResponseData>;
  closeConsultation(consultationId: string, userId: number): Promise<ResponseData>;
  
  // 统计相关
  getUnreadCount(userId: number): Promise<ResponseData>;
}

export class NotificationService implements INotificationService {
    private systemNotificationModel: MongoBase<SystemNotificationModel & BaseDoc>;
    private businessNotificationModel: MongoBase<BusinessNotificationModel & BaseDoc>;
    private consultationModel: MongoBase<ConsultationModel & BaseDoc>;

    constructor() {
        this.systemNotificationModel = new MongoBase<SystemNotificationModel & BaseDoc>(
            'system_notifications',
            systemNotificationSchema
        );
        this.businessNotificationModel = new MongoBase<BusinessNotificationModel & BaseDoc>(
            'business_notifications',
            businessNotificationSchema
        );
        this.consultationModel = new MongoBase<ConsultationModel & BaseDoc>(
            'consultations',
            consultationSchema
        );
    }

    // ======================== 系统通知相关方法 ========================
    async createSystemNotification(data: CreateSystemNotificationModel): Promise<ResponseData> {
        try {
            const notification = await this.systemNotificationModel.create(data);
            return {
                msg: 'ok',
                data: notification
            };
        } catch (error) {
            console.error('CreateSystemNotification error:', error);
            return {
                msg: 'server_error',
                data: null
            };
        }
    }

    async getSystemNotifications(query: NotificationQueryModel): Promise<ResponseData> {
        try {
            const filter: any = {};
            
            if (query.type) {
                filter.type = query.type;
            }
            if (query.is_read !== undefined) {
                filter.is_read = query.is_read;
            }
            if (query.user_id && query.user_id > 0) {
                // 如果指定了用户ID，检查该用户是否在目标用户列表中
                filter.$or = [
                    { target_users: { $exists: false } }, // 没有指定目标用户（全部用户）
                    { target_users: { $size: 0 } }, // 目标用户列表为空
                    { target_users: query.user_id } // 用户在目标用户列表中
                ];
            }

            const skip = (query.page - 1) * query.page_size;
            const notifications = await this.systemNotificationModel.find(filter, null, {
                skip,
                limit: query.page_size,
                sort: { createdAt: -1 }
            });

            const total = await this.systemNotificationModel.count(filter);

            return {
                msg: 'ok',
                data: {
                    list: notifications,
                    total,
                    page: query.page,
                    page_size: query.page_size
                }
            };
        } catch (error) {
            console.error('GetSystemNotifications error:', error);
            return {
                msg: 'server_error',
                data: null
            };
        }
    }

    async markSystemNotificationAsRead(notificationId: string, userId: number): Promise<ResponseData> {
        try {
            const notification = await this.systemNotificationModel.findOne({ _id: notificationId });
            if (!notification) {
                return {
                    msg: 'not_found',
                    data: null
                };
            }

            // 检查用户是否有权限读取此通知
            if (notification.target_users && notification.target_users.length > 0) {
                if (!notification.target_users.includes(userId)) {
                    return {
                        msg: 'not_found',
                        data: null
                    };
                }
            }

            await this.systemNotificationModel.updateOne({ _id: notificationId }, { is_read: true });
            return {
                msg: 'ok',
                data: { success: true }
            };
        } catch (error) {
            console.error('MarkSystemNotificationAsRead error:', error);
            return {
                msg: 'server_error',
                data: null
            };
        }
    }

    // ======================== 业务通知相关方法 ========================
    async createBusinessNotification(data: CreateBusinessNotificationModel): Promise<ResponseData> {
        try {
            const notification = await this.businessNotificationModel.create(data);
            return {
                msg: 'ok',
                data: notification
            };
        } catch (error) {
            console.error('CreateBusinessNotification error:', error);
            return {
                msg: 'server_error',
                data: null
            };
        }
    }

    async getBusinessNotifications(query: NotificationQueryModel): Promise<ResponseData> {
        try {
            const filter: any = { user_id: query.user_id };
            
            if (query.type) {
                filter.type = query.type;
            }
            if (query.is_read !== undefined) {
                filter.is_read = query.is_read;
            }

            const skip = (query.page - 1) * query.page_size;
            const notifications = await this.businessNotificationModel.find(filter, null, {
                skip,
                limit: query.page_size,
                sort: { createdAt: -1 }
            });

            const total = await this.businessNotificationModel.count(filter);

            return {
                msg: 'ok',
                data: {
                    list: notifications,
                    total,
                    page: query.page,
                    page_size: query.page_size
                }
            };
        } catch (error) {
            console.error('GetBusinessNotifications error:', error);
            return {
                msg: 'server_error',
                data: null
            };
        }
    }

    async markBusinessNotificationAsRead(notificationId: string, userId: number): Promise<ResponseData> {
        try {
            const notification = await this.businessNotificationModel.findOne({ _id: notificationId });
            if (!notification) {
                return {
                    msg: 'not_found',
                    data: null
                };
            }

            // 检查用户是否有权限读取此通知
            if (notification.user_id !== userId) {
                return {
                    msg: 'not_found',
                    data: null
                };
            }

            await this.businessNotificationModel.updateOne({ _id: notificationId }, { is_read: true });
            return {
                msg: 'ok',
                data: { success: true }
            };
        } catch (error) {
            console.error('MarkBusinessNotificationAsRead error:', error);
            return {
                msg: 'server_error',
                data: null
            };
        }
    }

    // ======================== 问题咨询相关方法 ========================
    async createConsultation(data: CreateConsultationModel, userId: number): Promise<ResponseData> {
        try {
            const consultation = await this.consultationModel.create({
                ...data,
                user_id: userId,
                status: 1 // 待回复
            });
            return {
                msg: 'ok',
                data: consultation
            };
        } catch (error) {
            console.error('CreateConsultation error:', error);
            return {
                msg: 'server_error',
                data: null
            };
        }
    }

    async getConsultations(query: ConsultationQueryModel): Promise<ResponseData> {
        try {
            const filter: any = {};
            
            if (query.user_id) {
                filter.user_id = query.user_id;
            }
            if (query.entity_id) {
                filter.entity_id = query.entity_id;
            }
            if (query.status) {
                filter.status = query.status;
            }
            if (query.category) {
                filter.category = query.category;
            }

            const skip = (query.page - 1) * query.page_size;
            const consultations = await this.consultationModel.find(filter, null, {
                skip,
                limit: query.page_size,
                sort: { createdAt: -1 }
            });

            const total = await this.consultationModel.count(filter);

            return {
                msg: 'ok',
                data: {
                    list: consultations,
                    total,
                    page: query.page,
                    page_size: query.page_size
                }
            };
        } catch (error) {
            console.error('GetConsultations error:', error);
            return {
                msg: 'server_error',
                data: null
            };
        }
    }

    async getConsultationDetail(consultationId: string): Promise<ResponseData> {
        try {
            const consultation = await this.consultationModel.findOne({ _id: consultationId });
            if (!consultation) {
                return {
                    msg: 'not_found',
                    data: null
                };
            }

            return {
                msg: 'ok',
                data: consultation
            };
        } catch (error) {
            console.error('GetConsultationDetail error:', error);
            return {
                msg: 'server_error',
                data: null
            };
        }
    }

    async replyConsultation(data: ReplyConsultationModel, replyUserId: number): Promise<ResponseData> {
        try {
            const consultation = await this.consultationModel.findOne({ _id: data.consultation_id });
            if (!consultation) {
                return {
                    msg: 'not_found',
                    data: null
                };
            }

            await this.consultationModel.updateOne({ _id: data.consultation_id }, {
                reply_content: data.content,
                reply_time: new Date(),
                reply_user_id: replyUserId,
                status: 2 // 已回复
            });

            return {
                msg: 'ok',
                data: { success: true }
            };
        } catch (error) {
            console.error('ReplyConsultation error:', error);
            return {
                msg: 'server_error',
                data: null
            };
        }
    }

    async closeConsultation(consultationId: string, userId: number): Promise<ResponseData> {
        try {
            const consultation = await this.consultationModel.findOne({ _id: consultationId });
            if (!consultation) {
                return {
                    msg: 'not_found',
                    data: null
                };
            }

            // 检查用户是否有权限关闭此咨询
            if (consultation.user_id !== userId) {
                return {
                    msg: 'not_found',
                    data: null
                };
            }

            await this.consultationModel.updateOne({ _id: consultationId }, {
                status: 3 // 已关闭
            });

            return {
                msg: 'ok',
                data: { success: true }
            };
        } catch (error) {
            console.error('CloseConsultation error:', error);
            return {
                msg: 'server_error',
                data: null
            };
        }
    }

    // ======================== 统计相关方法 ========================
    async getUnreadCount(userId: number): Promise<ResponseData> {
        try {
            // 获取系统通知未读数
            const systemNotificationFilter = {
                is_read: false,
                $or: [
                    { target_users: { $exists: false } },
                    { target_users: { $size: 0 } },
                    { target_users: userId }
                ]
            };
            const systemUnreadCount = await this.systemNotificationModel.count(systemNotificationFilter);

            // 获取业务通知未读数
            const businessUnreadCount = await this.businessNotificationModel.count({
                user_id: userId,
                is_read: false
            });

            return {
                msg: 'ok',
                data: {
                    system_notifications: systemUnreadCount,
                    business_notifications: businessUnreadCount,
                    total: systemUnreadCount + businessUnreadCount
                }
            };
        } catch (error) {
            console.error('GetUnreadCount error:', error);
            return {
                msg: 'server_error',
                data: null
            };
        }
    }
} 