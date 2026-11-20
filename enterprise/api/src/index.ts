import express = require("express")
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors = require('cors')
const compression = require('compression');
import bodyParser = require('body-parser');
import { Request, Response, NextFunction } from "express"
import { validate, md5Encode, randString } from "./common/common";
//import {init_db} from "./jobs/init-db";
import { CheckLangAndToken } from "./middles/middle";
//import { encryptResponse } from './middles/encryptResponse';// 响应加密中间件
import { httpLogger } from "./middles/logger";
//导入各api模块
import * as appApi from "./modules/app/api"
import * as entitiesApi from "./modules/entities/api"
import * as entitiesForm from "./modules/entities/form"
import * as entitiesInfoApi from "./modules/entityInfo/api"
import * as entitiesInfoForm from "./modules/entityInfo/form"

//province
import * as provinceApi from "./modules/province/api"
import * as provinceForm from "./modules/province/form"

//weixin
import * as weixinApi from "./modules/weixin/api"

//产品模块
import * as productApi from "./modules/product/api"
import * as productForm from "./modules/product/form"

//聊天模块
import { createChatRouter } from "./modules/chat/api";
import { ChatService } from "./modules/chat/service";

//通知模块
import notificationRouter from "./modules/message/api";
//企业主页模块
import enterpriseHomepageRouter from "./modules/homePage/api"

import * as orderApi from "./modules/order/api";
import * as orderForm from "./modules/order/form";

//服务流程管理模块
import * as serviceFlowApi from "./modules/serviceFlow/api";
import * as serviceFlowForm from "./modules/serviceFlow/form";

//通讯录模块
import * as contactsApi from "./modules/contacts/api";
import * as contactsForm from "./modules/contacts/form";

//首页配置模块
import * as homeApi from "./modules/home/api";
import * as homeForm from "./modules/home/form";

//文章模块
import * as articleApi from "./modules/article/api";
import * as articleForm from "./modules/article/form";
import * as auditApi from "./modules/audit/api";
import * as auditForm from "./modules/audit/form";

//经纪人模块
import * as marketApi from "./modules/market/api";
import * as marketForm from "./modules/market/form";

//需求大厅模块
import * as demandApi from "./modules/demand/api";
import * as demandForm from "./modules/demand/form";

//发票管理模块
import * as invoiceApi from "./modules/invoice/api";
import * as invoiceForm from "./modules/invoice/form";

//meilisearch 初始化搜索服务运行一次即可
// import { MeiliService } from "./middles/meilisearch";
// const meilisearch = new MeiliService('service_products');
// meilisearch.createIndex('id'); //服务产品 
// const demandSearch = new MeiliService('demand');
// demandSearch.createIndex('id');//需求
// const marketSearch = new MeiliService('market');
// marketSearch.createIndex('id');//经纪人
// const articlesSearch = new MeiliService('articles');
// articlesSearch.createIndex('id');//企业文章
// const productSearch = new MeiliService('product');
// productSearch.createIndex('id');//企业产品
// const caseSearch = new MeiliService('case');
// caseSearch.createIndex('id');//企业案例

const app = express()
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const port = 3009
//请求头，允许任何域名请求 
app.use(cors(
    {
        origin: '*',  
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'x-api-key', 'lang', 'token'],
    }
)) 
//允许所有跨域
app.use(compression()); 
// 启用数据压缩
app.use(express.urlencoded({ extended: true }))
app.use(CheckLangAndToken)
// 解析 application/json 类型的请求体
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//app.use(httpLogger);  //日志输出 
//app.use(encryptResponseMiddleware);// 启用统一响应加密
app.get('/', async (req: Request, res: Response) => {
    res.send('Hello World!')
})
 
/**企业接口**/
//登录
app.post("/entity/login", validate(entitiesForm.loginForm), async (req: Request, res: Response) => await entitiesApi.login(req, res))
//获取用户信息
app.post("/entity/get_user_info", async (req: Request, res: Response) => await entitiesApi.entityDetail(req, res))
//刷新token
app.post("/entity/refush-token", async (req: Request, res: Response) => await entitiesApi.refreshToken(req, res))
//发送短信验证码
app.post("/entity/send-sms", validate(entitiesForm.sendSmsForm), async (req: Request, res: Response) => await entitiesApi.sendSmsCode(req, res))
//注册
app.post("/entity/register", validate(entitiesForm.registerForm), async (req: Request, res: Response) => await entitiesApi.entityAdd(req, res))
//修改用户信息
app.post("/entity/change_user_info", validate(entitiesForm.changeInfoForm), async (req: Request, res: Response) => await entitiesApi.changeUserInfo(req, res))
//修改密码
app.post("/entity/change_password", validate(entitiesForm.changePasswordForm), async (req: Request, res: Response) => await entitiesApi.changePassword(req, res))
//搜索
app.post("/entity/search",async (req: Request, res: Response) => await entitiesApi.entitySearch(req, res))
app.post("/entity/login-by-code", validate(entitiesForm.loginByCodeForm),  async (req: Request, res: Response) => await entitiesApi.loginByCode(req, res));
app.post("/entity/find-password",validate(entitiesForm.findPasswordForm), async (req: Request, res: Response) => await entitiesApi.findPassword(req, res));


/** 协会接口**/
//协会添加企业 
app.post("/transaction/addentity",validate(entitiesForm.Enterprise), async (req: Request, res: Response) => await entitiesApi.entityInfoAssociationAdd(req, res))
//获取所有企业列表 
app.post("/transaction/query-enterprise-list",async (req: Request,res: Response) => await entitiesApi.queryEnterpriseList(req,res))
//获取前N个企业列表
app.post("/transaction/query-enterprise-list-num",async (req: Request,res: Response) => await entitiesApi.queryEnterpriseListNum(req,res))
//协会审核企业
app.post("/transaction/review-enterprise",async (req: Request,res: Response) => await entitiesApi.reviewEnterprise(req,res))
//协会获取企业详情通过企业id
app.post("/transaction/query-enterprise-detail",async (req: Request,res: Response) => await entitiesApi.queryEnterpriseDetail(req,res))
//协会获取统计信息
app.post("/transaction/get-statistics",async (req: Request,res: Response) => await entitiesApi.getAssociationStatistics(req,res))
//手动重建path关系，禁用,管理员用于重建path关系
app.post("/transaction/update-path",async (req: Request,res: Response) => await entitiesApi.updatePath(req,res))

/** 服务商模块 */
//查询一二级分类
app.post("/service/query-type",async (req: Request,res: Response) => await entitiesApi.queryAllType(req,res))
//查询所有标签
app.post("/service/query-type-tag",async (req: Request,res: Response) => await entitiesApi.queryTypeTag(req,res))


/** 企业信息接口**/
//企业补充审核资料
app.post("/entityInfo/add", validate(entitiesInfoForm.addForm), async (req: Request, res: Response) => await entitiesInfoApi.supplement(req, res))
//获取企业信息
app.post("/entityInfo/detail", async (req: Request, res: Response) => await entitiesInfoApi.entityInfoDetail(req, res))
//修改个人企业信息
app.post("/entityInfo/update", validate(entitiesInfoForm.updateForm), async (req: Request, res: Response) => await entitiesInfoApi.entityInfoUpdate(req, res))
//企业删除
// app.post("/entityInfo/del", async (req: Request, res: Response) => await entitiesInfoApi.entityInfoDel(req, res))
//企业修改标签
app.post("/entityInfo/update-tag", async (req: Request, res: Response) => await entitiesInfoApi.entityInfoUpdateTag(req, res))
//企业查询标签
app.post("/entityInfo/query-tag", async (req: Request, res: Response) => await entitiesInfoApi.entityInfoQueryTag(req, res))
//企业编辑个人资料
app.post("/entityInfo/update-personal-info", validate(entitiesInfoForm.updatePersonalInfoForm), async (req: Request, res: Response) => await entitiesInfoApi.entityInfoUpdatePersonalInfo(req, res))
//获取热门企业
app.post("/entityInfo/query-hot-entity",async (req: Request,res: Response) => await entitiesInfoApi.queryHotEntity(req,res))
//获取企业服务商等等
app.post("/entityInfo/query-entity-list",async (req: Request,res: Response) => await entitiesInfoApi.queryEntityList(req,res))


/** 微信接口**/ 
//获取微信access_token
app.post("/weixin/getAccessToken",async (req: Request,res: Response) => await weixinApi.getAccessToken(req,res))
//获取微信宣传链接
app.post("/weixin/getLink",async (req: Request,res: Response) => await weixinApi.getLink(req,res))
//获取微信二维码 
app.post("/weixin/getMiniQrcode",async (req: Request,res: Response) => await weixinApi.getMiniQrcode(req,res))
//生成微信支付加密token
app.post("/weixin/getPayToken",async (req: Request,res: Response) => await weixinApi.getPayToken(req,res))
//手动查询支付状态
app.post("/weixin/manual-check-payment", async (req: Request, res: Response) => await weixinApi.manualCheckPayment(req, res))


/** 产品模块 **/
//创建服务产品
app.post("/product/create", validate(productForm.serviceProductForm), async (req: Request, res: Response) => await productApi.createServiceProduct(req, res))
//更新服务产品
app.post("/product/update", validate(productForm.serviceProductUpdateForm), async (req: Request, res: Response) => await productApi.updateServiceProduct(req, res))
//假装删除服务产品
app.post("/product/delete", validate(productForm.serviceIdForm), async (req: Request, res: Response) => await productApi.deleteServiceProduct(req, res))
//获取服务产品详情
app.post("/product/detail", validate(productForm.serviceIdForm), async (req: Request, res: Response) => await productApi.getServiceProductDetail(req, res))
//获取特定协会下服务产品列表
app.post("/product/transaction-list", validate(productForm.serviceProductQueryForm), async (req: Request, res: Response) => await productApi.getTransactionServiceProductList(req, res))
//获取服务产品列表
app.post("/product/list", validate(productForm.serviceProductQueryForm), async (req: Request, res: Response) => await productApi.getServiceProductList(req, res))
//获取我的服务产品
app.post("/product/my-list", validate(productForm.serviceProductQueryForm), async (req: Request, res: Response) => await productApi.getMyServiceProducts(req, res))
//审核服务产品
app.post("/product/audit", validate(productForm.serviceAuditForm), async (req: Request, res: Response) => await productApi.auditServiceProduct(req, res))
//切换服务状态
app.post("/product/toggle-status", async (req: Request, res: Response) => await productApi.toggleServiceStatus(req, res))
//收藏/取消收藏服务
app.post("/product/favorite", validate(productForm.serviceFavoriteForm), async (req: Request, res: Response) => await productApi.toggleFavorite(req, res))
//获取收藏的服务列表
app.post("/product/favorite-list", validate(productForm.serviceProductQueryForm), async (req: Request, res: Response) => await productApi.getFavoriteServices(req, res))
//服务分类
app.post("/product/query-category",validate(productForm.servicetypeForm) ,async (req: Request, res: Response) => await productApi.getServiceCategory(req, res))

/** 聊天模块 */
const chatService = new ChatService(io);
app.use("/chat", createChatRouter(chatService));

/** 通知模块 */
app.use("/message", notificationRouter)

/** 企业主页模块 */
app.use("/homepage", enterpriseHomepageRouter)

/** 订单与支付相关接口 **/
// 创建订单（缓存到Redis）
app.post("/order/create", validate(orderForm.createOrderForm), async (req: Request, res: Response) => await orderApi.createOrder(req, res));
// 确认订单（支付成功后写入数据库）
app.post("/order/confirm", validate(orderForm.confirmOrderForm), async (req: Request, res: Response) => await orderApi.confirmOrder(req, res));
// 根据订单号获取订单信息
app.post("/order/by-no", validate(orderForm.getOrderByNoForm), async (req: Request, res: Response) => await orderApi.getOrderByNo(req, res));
// 获取订单详情
app.post("/order/detail", validate(orderForm.getOrderDetailForm), async (req: Request, res: Response) => await orderApi.getOrderDetail(req, res));
// 获取订单列表
app.post("/order/list", validate(orderForm.getOrderListForm), async (req: Request, res: Response) => await orderApi.getOrderList(req, res));
// 更新订单状态
app.post("/order/update-status", validate(orderForm.updateOrderStatusForm), async (req: Request, res: Response) => await orderApi.updateOrderStatus(req, res));
// 取消订单
app.post("/order/cancel", validate(orderForm.cancelOrderForm), async (req: Request, res: Response) => await orderApi.cancelOrder(req, res));
// 获取订单日志
app.post("/order/logs", validate(orderForm.getOrderLogsForm), async (req: Request, res: Response) => await orderApi.getOrderLogs(req, res));
// 更新订单支付方式
app.post("/order/update-payment-method", validate(orderForm.updatePaymentMethodForm), async (req: Request, res: Response) => await orderApi.updatePaymentMethod(req, res));
// 处理支付成功回调
app.post("/order/payment/success", validate(orderForm.processPaymentSuccessForm), async (req: Request, res: Response) => await orderApi.processPaymentSuccess(req, res));
// 创建业务订单
app.post("/order/business/create", validate(orderForm.createBusinessOrderForm), async (req: Request, res: Response) => await orderApi.createBusinessOrder(req, res));

// 获取服务商订单统计
app.post("/order/provider/stats", validate(orderForm.getProviderOrderStatsForm), async (req: Request, res: Response) => await orderApi.getProviderOrderStats(req, res));
// 获取服务商订单列表
app.post("/order/provider/list", validate(orderForm.getProviderOrderListForm), async (req: Request, res: Response) => await orderApi.getProviderOrderList(req, res));

// 查询订单状态（兼容旧接口）
app.get("/order/status/:userOrderId", async (req: Request, res: Response) => await orderApi.getOrderStatus(req, res));
// 查询订单日志（兼容旧接口）
app.get("/order/logs/:userOrderId", async (req: Request, res: Response) => await orderApi.getOrderLogs(req, res));

// 微信支付统一下单
app.post("/weixin/unified-order", async (req: Request, res: Response) => await weixinApi.weixinUnifiedOrder(req, res));
// 微信支付回调
app.post("/weixin/pay-notify", async (req: Request, res: Response) => await weixinApi.weixinPayNotify(req, res));


app.post("/province/list-province",async (req: Request,res: Response) => await provinceApi.listProvince(req,res))
app.post("/province/list-city",validate(provinceForm.cityForm),async (req: Request,res: Response) => await provinceApi.listCity(req,res))
app.post("/province/list-district",validate(provinceForm.districtForm),async (req: Request,res: Response) => await provinceApi.listDistrict(req,res))
app.post("/province/list-town",validate(provinceForm.townForm),async (req: Request,res: Response) => await provinceApi.listTown(req,res))

/** 服务流程管理模块 **/
//创建服务订单
app.post("/serviceFlow/create-order", validate(serviceFlowForm.createOrderForm), async (req: Request, res: Response) => await serviceFlowApi.createOrder(req, res))
//查询订单列表
app.post("/serviceFlow/query-order-list", validate(serviceFlowForm.queryOrderForm), async (req: Request, res: Response) => await serviceFlowApi.queryOrderList(req, res))
//查询服务商订单列表（专用接口）
app.post("/serviceFlow/provider/orders", validate(serviceFlowForm.queryOrderForm), async (req: Request, res: Response) => await serviceFlowApi.queryProviderOrders(req, res))
//获取订单详情
app.post("/serviceFlow/order-detail", validate(serviceFlowForm.orderDetailForm), async (req: Request, res: Response) => await serviceFlowApi.getOrderDetail(req, res))
//推进流程
app.post("/serviceFlow/advance-process", validate(serviceFlowForm.advanceProcessForm), async (req: Request, res: Response) => await serviceFlowApi.advanceProcess(req, res))
//取消订单
app.post("/serviceFlow/cancel-order", validate(serviceFlowForm.cancelOrderForm), async (req: Request, res: Response) => await serviceFlowApi.cancelOrder(req, res))
//暂停/恢复订单
app.post("/serviceFlow/pause-resume-order", validate(serviceFlowForm.pauseResumeOrderForm), async (req: Request, res: Response) => await serviceFlowApi.pauseResumeOrder(req, res))
//获取流程模板
app.post("/serviceFlow/get-process-template", validate(serviceFlowForm.getProcessTemplateForm), async (req: Request, res: Response) => await serviceFlowApi.getProcessTemplate(req, res))

/** 文章模块 **/
//获取文章分类列表
app.post("/article/categories", async (req: Request, res: Response) => await articleApi.getActiveCategoryList(req, res))
//获取文章列表
app.post("/article/list", validate(articleForm.getArticleListForm), async (req: Request, res: Response) => await articleApi.getActiveArticleList(req, res))

/** 审核模块 **/
//获取审核记录列表
app.post("/audit/list", async (req: Request, res: Response) => await auditApi.getAuditList(req, res))

/** 通讯录模块 **/
//查询联系人列表
app.post("/contacts/user-list", validate(contactsForm.queryContactsForm), async (req: Request, res: Response) => await contactsApi.queryContactsList(req, res))
//搜索联系人
app.post("/contacts/search", validate(contactsForm.searchContactsForm), async (req: Request, res: Response) => await contactsApi.searchContacts(req, res))
//获取联系人详情
app.post("/contacts/detail", validate(contactsForm.contactDetailForm), async (req: Request, res: Response) => await contactsApi.getContactDetail(req, res))
//更新在线状态
app.post("/contacts/update-status", validate(contactsForm.updateOnlineStatusForm), async (req: Request, res: Response) => await contactsApi.updateOnlineStatus(req, res))
//获取联系人统计
app.post("/contacts/statistics", async (req: Request, res: Response) => await contactsApi.getContactsStatistics(req, res))

/** 经纪人功能模块 **/

// ======================== 经纪人统计数据 ========================
// 获取经纪人统计数据
app.post("/market/stats", async (req: Request, res: Response) => await marketApi.getStats(req, res))
// 更新经纪人统计数据
app.post("/market/update-stats", async (req: Request, res: Response) => await marketApi.updateStats(req, res))

// ======================== 客户管理 ========================
// 添加客户
app.post("/market/add-guest", validate(marketForm.addGuestForm), async (req: Request, res: Response) => await marketApi.addGuest(req, res))
// 更新客户信息
//app.post("/market/update-guest", validate(marketForm.updateGuestForm), async (req: Request, res: Response) => await marketApi.updateGuest(req, res))
// 删除客户
//app.post("/market/delete-guest", validate(marketForm.idForm), async (req: Request, res: Response) => await marketApi.deleteGuest(req, res))
// 获取客户详情
app.post("/market/guest-detail", validate(marketForm.idForm), async (req: Request, res: Response) => await marketApi.getGuestDetail(req, res))
// 获取客户列表
app.post("/market/guest-list", validate(marketForm.queryGuestForm), async (req: Request, res: Response) => await marketApi.getGuestList(req, res))

// ======================== 需求跟进管理 ========================
// 添加需求跟进
app.post("/market/add-need", validate(marketForm.addNeedForm), async (req: Request, res: Response) => await marketApi.addNeed(req, res))
// 更新需求跟进
app.post("/market/update-need", validate(marketForm.updateNeedForm), async (req: Request, res: Response) => await marketApi.updateNeed(req, res))
// 删除需求跟进
//app.post("/market/delete-need", validate(marketForm.idForm), async (req: Request, res: Response) => await marketApi.deleteNeed(req, res))
// 获取需求跟进详情
app.post("/market/need-detail", validate(marketForm.idForm), async (req: Request, res: Response) => await marketApi.getNeedDetail(req, res))
// 获取需求跟进列表
app.post("/market/need-list", validate(marketForm.queryNeedForm), async (req: Request, res: Response) => await marketApi.getNeedList(req, res))

// ======================== 待办事项管理 ========================
// 添加待办事项
app.post("/market/add-task", validate(marketForm.addTaskForm), async (req: Request, res: Response) => await marketApi.addTask(req, res))
// 更新待办事项
app.post("/market/update-task", validate(marketForm.updateTaskForm), async (req: Request, res: Response) => await marketApi.updateTask(req, res))
// 删除待办事项
//app.post("/market/delete-task", validate(marketForm.idForm), async (req: Request, res: Response) => await marketApi.deleteTask(req, res))
// 获取待办事项详情
app.post("/market/task-detail", validate(marketForm.idForm), async (req: Request, res: Response) => await marketApi.getTaskDetail(req, res))
// 获取待办事项列表
app.post("/market/task-list", validate(marketForm.queryTaskForm), async (req: Request, res: Response) => await marketApi.getTaskList(req, res))

// ======================== 历史记录 ========================
// 获取历史列表
app.post("/market/history-list", validate(marketForm.queryHistoryForm), async (req: Request, res: Response) => await marketApi.getHistoryList(req, res))

// ======================== 趋势数据 ========================
// 获取收入趋势数据
app.post("/market/income-trend", async (req: Request, res: Response) => await marketApi.getIncomeTrend(req, res))

// ======================== 经纪人联系管理 ========================
// 经纪人联系企业（针对某个需求）
app.post("/market/contact-enterprise", validate(marketForm.contactEnterpriseForm), async (req: Request, res: Response) => await marketApi.contactEnterprise(req, res)) 
// 更新联系状态（待沟通/已沟通/跟进中/成交）
//app.post("/market/update-contact", validate(marketForm.updateContactForm), async (req: Request, res: Response) => await marketApi.updateContact(req, res)) 
// 获取经纪人的联系记录列表
app.post("/market/broker-contacts", validate(marketForm.brokerContactsForm), async (req: Request, res: Response) => await marketApi.getBrokerContacts(req, res)) 

// ======================== 客户标签管理 ========================
// 为客户添加标签
///app.post("/market/add-customer-tag", validate(marketForm.addCustomerTagForm), async (req: Request, res: Response) => await marketApi.addCustomerTag(req, res)) 
// 移除客户标签
//app.post("/market/remove-customer-tag", validate(marketForm.removeCustomerTagForm), async (req: Request, res: Response) => await marketApi.removeCustomerTag(req, res)) 
// 获取指定客户的标签列表
app.post("/market/customer-tags", async (req: Request, res: Response) => await marketApi.getCustomerTags(req, res))

// 团队管理相关
app.post("/market/team-list", validate(marketForm.teamListForm), async (req: Request, res: Response) => await marketApi.teamList(req, res))
app.post("/market/update-team-member-tags", validate(marketForm.updateTeamMemberTagsForm), async (req: Request, res: Response) => await marketApi.updateTeamMemberTags(req, res)) 
 

/** 需求大厅模块 **/
// 创建需求
app.post("/demand/create", validate(demandForm.createDemandForm), async (req: Request, res: Response) => await demandApi.createDemand(req, res))
// 更新需求
app.post("/demand/update", validate(demandForm.updateDemandForm), async (req: Request, res: Response) => await demandApi.updateDemand(req, res))
// 删除需求
app.post("/demand/delete", validate(demandForm.demandIdForm), async (req: Request, res: Response) => await demandApi.deleteDemand(req, res))
// 获取需求详情
app.post("/demand/detail", validate(demandForm.demandDetailForm), async (req: Request, res: Response) => await demandApi.getDemandDetail(req, res))
// 获取需求列表
app.post("/demand/list", validate(demandForm.demandQueryForm), async (req: Request, res: Response) => await demandApi.getDemandList(req, res))
// 获取我的需求列表
app.post("/demand/my-list", validate(demandForm.demandQueryForm), async (req: Request, res: Response) => await demandApi.getMyDemandList(req, res))
app.post("/demand/my-detail", validate(demandForm.demandDetailForm), async (req: Request, res: Response) => await demandApi.getmyDemandDetail(req, res))
// 更新需求状态
app.post("/demand/update-status", validate(demandForm.updateDemandStatusForm), async (req: Request, res: Response) => await demandApi.updateDemandStatus(req, res))

/** 发票管理模块 **/
// 创建发票信息
app.post("/invoice/create", validate(invoiceForm.createInvoiceForm), async (req: Request, res: Response) => await invoiceApi.createInvoice(req, res))
// 更新发票信息
app.post("/invoice/update", validate(invoiceForm.updateInvoiceForm), async (req: Request, res: Response) => await invoiceApi.updateInvoice(req, res))
// 删除发票信息
app.post("/invoice/delete", validate(invoiceForm.deleteInvoiceForm), async (req: Request, res: Response) => await invoiceApi.deleteInvoice(req, res))
// 获取发票详情
app.post("/invoice/detail", validate(invoiceForm.invoiceDetailForm), async (req: Request, res: Response) => await invoiceApi.getInvoiceDetail(req, res))
// 获取发票列表
app.post("/invoice/list", validate(invoiceForm.invoiceQueryForm), async (req: Request, res: Response) => await invoiceApi.getInvoiceList(req, res))
// 设置默认发票
app.post("/invoice/set-default", validate(invoiceForm.setDefaultInvoiceForm), async (req: Request, res: Response) => await invoiceApi.setDefaultInvoice(req, res))
// 获取默认发票
app.post("/invoice/get-default", async (req: Request, res: Response) => await invoiceApi.getDefaultInvoice(req, res))

/** 首页配置模块 **/
// 获取首页配置（轮播图、活动等）
app.post("/home/config", validate(homeForm.getHomeConfigForm), async (req: Request, res: Response) => await homeApi.getHomeConfig(req, res))

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
     //console.error(err.stack); // 打印错误堆栈
    res.status(500).json({
        message: 'Internal Server Error',
        error: err.message // 返回错误信息
    });
});

//启动服务
httpServer.listen(port, async () => {
    //await init_db() 
     console.log(`api app listening on port ${port}`)
})