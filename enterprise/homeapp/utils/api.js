const http = uni.$u.http;
// 小程序不支持代理转发，需要直接使用服务器地址
//let BaseUrl = 'http://115.190.133.216:3009'; // 开发环境
let BaseUrl = '/api'; // 生产环境
//统一搜索api
export const search = (data) => http.post(`${BaseUrl}/entity/search`, data);

//协会管理企业、服务商接口
export const addEntity = (data) => http.post(`${BaseUrl}/transaction/addentity`, data);
export const getEntityList = (data) => http.post(`${BaseUrl}/transaction/query-enterprise-list`, data);
export const getTopEntityList = (data) => http.post(`${BaseUrl}/transaction/query-enterprise-list-num`, data);
export const getStatistics = (data) => http.post(`${BaseUrl}/transaction/get-statistics`, data);
//认证：认证资料，审核,
export const authEntity = (data) => http.post(`${BaseUrl}/entityInfo/add`, data)
export const getEntityInfo = (data) => http.post(`${BaseUrl}/entityInfo/detail`, data)
export const reviewEntity = (data) => http.post(`${BaseUrl}/transaction/review-enterprise`, data)
export const getReview = (data) => http.post(`${BaseUrl}/transaction/query-enterprise-detail`, data)
export const getHotEntList=(data)=>http.post(`${BaseUrl}/entityInfo/query-hot-entity`,data)
export const getEntityInfoList=(data)=>http.post(`${BaseUrl}/entityInfo/query-entity-list`,data) //公开获取实体列表

//首页配置接口
export const getHomeConfig = (data) => http.post(`${BaseUrl}/home/config`, data) //获取首页配置（轮播图、活动等）
//服务商相关接口
export const getCategory = (data) => http.post(`${BaseUrl}/service/query-type`, data)
export const getTags = (data) => http.post(`${BaseUrl}/service/query-type-tag`, data)
export const updateEntity = (data) => http.post(`${BaseUrl}/entityInfo/update-personal-info`, data)
// 获取签到钱包余额
export const getSignInBalance = () => http.get(`${BaseUrl}/get_user_balance`);

//服务产品接口
export const createServiceProduct = (data) => http.post(`${BaseUrl}/product/create`, data)
export const updateServiceProduct = (data) => http.post(`${BaseUrl}/product/update`, data)
export const deleteServiceProduct = (data) => http.post(`${BaseUrl}/product/delete`, data)
export const getServiceProductDetail = (data) => http.post(`${BaseUrl}/product/detail`, data)
export const getServiceProductList = (data) => http.post(`${BaseUrl}/product/list`, data)
export const getMyServiceProducts = (data) => http.post(`${BaseUrl}/product/my-list`, data)
export const getAssociationServiceProductList = (data) => http.post(`${BaseUrl}/product/transaction-list`, data)
export const toggleServiceStatus = (data) => http.post(`${BaseUrl}/product/toggle-status`, data)
export const auditServiceProduct = (data) => http.post(`${BaseUrl}/product/audit`, data)
export const getServiceProductCategory = (data) => http.post(`${BaseUrl}/product/query-category`, data)

// 判断App是否需要更新
export const isUpDataApp = () => http.get(`${BaseUrl}/get_app_latest`);
// 用户登录 Login
export const login = data => http.post(`${BaseUrl}/entity/login`, data);
// 验证码登录
export const loginByCode = data => http.post(`${BaseUrl}/entity/login-by-code`, data);
// 用户注册 Register
export const register = data => http.post(`${BaseUrl}/entity/register`, data);
// 用户忘记密码 ForgotPassword
export const forgotPassword = data => http.post(`${BaseUrl}/entity/find-password`, data);
// 发送邮箱验证码
export const sendSmsCode = data => http.post(`${BaseUrl}/entity/send-sms`, data);
// 获取用户信息
export const getUserInfo = data => http.post(`${BaseUrl}/entity/get_user_info`, { ...data });
// 修改用户信息
export const changeUserInfo = (data) => http.post(`${BaseUrl}/entity/change_user_info`, data);
// 修改密码
export const changePassword = (data) => http.post(`${BaseUrl}/entity/change_password`, data);
// 修改邮箱
export const changeEmail = (data) => http.post(`${BaseUrl}/change_email`, data);
// 刷新token
export const updateToken = () => http.post(`${BaseUrl}/entity/refush-token`);
//获取我的分享链接小程序
export const getLink = (data) => http.post(`${BaseUrl}/weixin/getLink`, data)
//获取我的分享码小程序
export const getMiniQrcode = (data) => http.post(`${BaseUrl}/weixin/getMiniQrcode`, data)

//获取省市区,前端也有地址库
export const getProvinceList = () => http.post(`${BaseUrl}/province/list-province`);
export const getCityList = (data) => http.post(`${BaseUrl}/province/list-city`, data);
export const getAreaList = (data) => http.post(`${BaseUrl}/province/list-district`, data);
export const getTownList = (data) => http.post(`${BaseUrl}/province/list-town`, data);

// 消息中心相关接口
// 聊天相关接口
export const createGroupRoom = (data) => http.post(`${BaseUrl}/chat/room/create_group`, data);
export const createPrivateRoom = (data) => http.post(`${BaseUrl}/chat/room/create_private`, data);
export const getRoomList = (data) => http.post(`${BaseUrl}/chat/room/list`, data);
export const getRoomDetail = (data) => http.post(`${BaseUrl}/chat/room/detail`, data);
export const inviteToRoom = (data) => http.post(`${BaseUrl}/chat/room/invite`, data);
export const kickFromRoom = (data) => http.post(`${BaseUrl}/chat/room/kick`, data);
// 群管理相关接口
export const updateRoomInfo = (data) => http.post(`${BaseUrl}/chat/room/update`, data);
export const transferRoomOwner = (data) => http.post(`${BaseUrl}/chat/room/transfer-owner`, data);
export const setRoomAdmin = (data) => http.post(`${BaseUrl}/chat/room/set-admin`, data);
export const removeRoomAdmin = (data) => http.post(`${BaseUrl}/chat/room/remove-admin`, data);
export const leaveRoom = (data) => http.post(`${BaseUrl}/chat/room/leave`, data);
export const dissolveRoom = (data) => http.post(`${BaseUrl}/chat/room/dissolve`, data);
export const getMessageHistory = (data) => http.post(`${BaseUrl}/chat/message/history`, data);
export const markUserRoomAsRead = (data) => http.post(`${BaseUrl}/chat/user-room/mark-read`, data);

// 获取当前用户的全部私聊（不分页）
export const getUserPrivateChats = () => http.post(`${BaseUrl}/chat/room/private-chats`, {});
// 获取当前用户的全部群聊（不分页）
export const getUserGroupChats = () => http.post(`${BaseUrl}/chat/room/group-chats`, {});
// 系统通知相关接口
export const createSystemNotification = (data) => http.post(`${BaseUrl}/message/system-notification/create`, data);
export const getSystemNotificationList = (data) => http.post(`${BaseUrl}/message/system-notification/list`, data);
export const markSystemNotificationRead = (data) => http.post(`${BaseUrl}/message/system-notification/read`, data);

// 文章相关接口
export const getArticleCategories = () => http.post(`${BaseUrl}/article/categories`, {});
export const getArticleList = (data) => http.post(`${BaseUrl}/article/list`, data);

// 审核记录接口
export const getAuditRecordList = () => http.post(`${BaseUrl}/audit/list`, {});

// 业务通知相关接口
export const createBusinessNotification = (data) => http.post(`${BaseUrl}/message/business-notification/create`, data);
export const getBusinessNotificationList = (data) => http.post(`${BaseUrl}/message/business-notification/list`, data);
export const markBusinessNotificationRead = (data) => http.post(`${BaseUrl}/message/business-notification/read`, data);

// 问题咨询相关接口
export const createConsultation = (data) => http.post(`${BaseUrl}/message/consultation/create`, data);
export const getConsultationList = (data) => http.post(`${BaseUrl}/message/consultation/list`, data);
export const getConsultationDetail = (data) => http.post(`${BaseUrl}/message/consultation/detail`, data);
export const replyConsultation = (data) => http.post(`${BaseUrl}/message/consultation/reply`, data);
export const closeConsultation = (data) => http.post(`${BaseUrl}/message/consultation/close`, data);

// 统计相关接口
export const getUnreadCount = () => http.post(`${BaseUrl}/message/unread-count`);

// 通讯录相关接口
export const getUserList = (data) => http.post(`${BaseUrl}/contacts/user-list`, data);
export const getGroupList = (data) => http.post(`${BaseUrl}/chat/room/group-chats`, data);
export const createChatRoom = (data) => http.post(`${BaseUrl}/chat/room/create_private`, data);

//企业主页相关接口
export const createBanner = (data) => http.post(`${BaseUrl}/homepage/createBanner`, data);
export const updateBanner = (data) => http.post(`${BaseUrl}/homepage/updateBanner`, data);
export const getBanners = (data) => http.post(`${BaseUrl}/homepage/getBanners`, data);
export const deleteBanner = (data) => http.post(`${BaseUrl}/homepage/deleteBanner`, data);
export const getAbout = (data) => http.post(`${BaseUrl}/homepage/getAbout`, data);
export const upsertAbout = (data) => http.post(`${BaseUrl}/homepage/upsertAbout`, data);
export const getContact = (data) => http.post(`${BaseUrl}/homepage/getContact`, data);
export const upsertContact = (data) => http.post(`${BaseUrl}/homepage/upsertContact`, data);
export const createProduct = (data) => http.post(`${BaseUrl}/homepage/createProduct`, data);
export const updateProduct = (data) => http.post(`${BaseUrl}/homepage/updateProduct`, data);
export const deleteProduct = (data) => http.post(`${BaseUrl}/homepage/deleteProduct`, data);
export const getProductList = (data) => http.post(`${BaseUrl}/homepage/getProducts`, data);
export const getProductDetail = (data) => http.post(`${BaseUrl}/homepage/getProduct`, data);
// 企业主页分类管理接口
export const createCategory = (data) => http.post(`${BaseUrl}/homepage/createCategory`, data);
export const updateCategory = (data) => http.post(`${BaseUrl}/homepage/updateCategory`, data);
export const deleteCategory = (data) => http.post(`${BaseUrl}/homepage/deleteCategory`, data);
export const getHomePageCategory = (data) => http.post(`${BaseUrl}/homepage/getCategories`, data);
export const createArticle = (data) => http.post(`${BaseUrl}/homepage/createArticle`, data);
export const updateArticle = (data) => http.post(`${BaseUrl}/homepage/updateArticle`, data);
export const deleteArticle = (data) => http.post(`${BaseUrl}/homepage/deleteArticle`, data);
export const getArticle = (data) => http.post(`${BaseUrl}/homepage/getArticle`, data);
export const getHomepageArticleList = (data) => http.post(`${BaseUrl}/homepage/getArticles`, data);
export const createCase = (data) => http.post(`${BaseUrl}/homepage/createCase`, data);
export const updateCase = (data) => http.post(`${BaseUrl}/homepage/updateCase`, data);
export const deleteCase = (data) => http.post(`${BaseUrl}/homepage/deleteCase`, data);
export const getCase = (data) => http.post(`${BaseUrl}/homepage/getCase`, data);
export const getCaseList = (data) => http.post(`${BaseUrl}/homepage/getCases`, data);
// 企业主页设置相关接口
export const upsertSettings = (data) => http.post(`${BaseUrl}/homepage/upsertSettings`, data);
export const getSettings = (data) => http.post(`${BaseUrl}/homepage/getSettings`, data);
// 获取完整企业主页数据
export const getHomepage = (data) => http.post(`${BaseUrl}/homepage/getHomepage`, data);

// ========== 服务流程管理相关接口 ==========
// 创建服务订单
export const createServiceOrder = (data) => http.post(`${BaseUrl}/serviceFlow/create-order`, data);
// 查询订单列表
export const getServiceOrderList = (data) => http.post(`${BaseUrl}/serviceFlow/query-order-list`, data);
// 获取订单详情
export const getServiceOrderDetail = (data) => http.post(`${BaseUrl}/serviceFlow/order-detail`, data);
// 推进流程
export const advanceServiceProcess = (data) => http.post(`${BaseUrl}/serviceFlow/advance-process`, data);
// 取消订单
export const cancelServiceOrder = (data) => http.post(`${BaseUrl}/serviceFlow/cancel-order`, data);
// 暂停/恢复订单
export const pauseResumeServiceOrder = (data) => http.post(`${BaseUrl}/serviceFlow/pause-resume-order`, data);
// 获取流程模板
export const getServiceProcessTemplate = (data) => http.post(`${BaseUrl}/serviceFlow/get-process-template`, data);

// ========== 需求大厅相关接口 ==========
// 创建需求
export const createDemand = (data) => http.post(`${BaseUrl}/demand/create`, data);
// 更新需求
export const updateDemand = (data) => http.post(`${BaseUrl}/demand/update`, data);
// 删除需求
export const deleteDemand = (data) => http.post(`${BaseUrl}/demand/delete`, data);
// 获取需求详情
export const getDemandDetail = (data) => http.post(`${BaseUrl}/demand/detail`, data);
// 获取需求列表
export const getDemandList = (data) => http.post(`${BaseUrl}/demand/list`, data);
// 获取我的需求列表
export const getMyDemandList = (data) => http.post(`${BaseUrl}/demand/my-list`, data);
// 获取我的需求详情
export const getMyDemandDetail = (data) => http.post(`${BaseUrl}/demand/my-detail`, data);
// 更新需求状态
export const updateDemandStatus = (data) => http.post(`${BaseUrl}/demand/update-status`, data);

// ========== 经纪人功能模块相关接口 ==========
// 统计相关
export const getBrokerStats = (data) => http.post(`${BaseUrl}/market/stats`, data);
export const updateBrokerStats = (data) => http.post(`${BaseUrl}/market/update-stats`, data);

// 客户管理相关
export const addMarketGuest = (data) => http.post(`${BaseUrl}/market/add-guest`, data);
export const updateMarketGuest = (data) => http.post(`${BaseUrl}/market/update-guest`, data);
export const deleteMarketGuest = (data) => http.post(`${BaseUrl}/market/delete-guest`, data);
export const getMarketGuestDetail = (data) => http.post(`${BaseUrl}/market/guest-detail`, data);
export const getMarketGuestList = (data) => http.post(`${BaseUrl}/market/guest-list`, data);

// 需求跟进相关
export const addMarketNeed = (data) => http.post(`${BaseUrl}/market/add-need`, data);
export const updateMarketNeed = (data) => http.post(`${BaseUrl}/market/update-need`, data);
export const deleteMarketNeed = (data) => http.post(`${BaseUrl}/market/delete-need`, data);
export const getMarketNeedDetail = (data) => http.post(`${BaseUrl}/market/need-detail`, data);
export const getMarketNeedList = (data) => http.post(`${BaseUrl}/market/need-list`, data);

// 待办事项相关
export const addMarketTask = (data) => http.post(`${BaseUrl}/market/add-task`, data);
export const updateMarketTask = (data) => http.post(`${BaseUrl}/market/update-task`, data);
export const deleteMarketTask = (data) => http.post(`${BaseUrl}/market/delete-task`, data);
export const getMarketTaskDetail = (data) => http.post(`${BaseUrl}/market/task-detail`, data);
export const getMarketTaskList = (data) => http.post(`${BaseUrl}/market/task-list`, data);

// 操作历史相关
export const getMarketHistory = (data) => http.post(`${BaseUrl}/market/history-list`, data);

// 团队管理相关
export const getMyTeamList = (data) => http.post(`${BaseUrl}/market/team-list`, data);
export const updateTeamMemberTags = (data) => http.post(`${BaseUrl}/market/update-team-member-tags`, data);

// 收入趋势数据接口
export const getIncomeTrend = (data) => http.post(`${BaseUrl}/market/income-trend`, data);

// 旧版兼容接口
export const contactEnterprise = (data) => http.post(`${BaseUrl}/market/contact-enterprise`, data);
export const updateContact = (data) => http.post(`${BaseUrl}/market/update-contact`, data);
export const getBrokerContacts = (data) => http.post(`${BaseUrl}/market/broker-contacts`, data);
export const addCustomerTag = (data) => http.post(`${BaseUrl}/market/add-customer-tag`, data);
export const removeCustomerTag = (data) => http.post(`${BaseUrl}/market/remove-customer-tag`, data);
export const getCustomerTags = (data) => http.post(`${BaseUrl}/market/customer-tags`, data);

// ========== 订单管理相关接口 ==========
// 创建订单
export const createOrder = (data) => http.post(`${BaseUrl}/order/create`, data);
// 根据订单号获取订单信息
export const getOrderByNo = (data) => http.post(`${BaseUrl}/order/by-no`, data);

// 更新订单支付方式
export const updateOrderPaymentMethod = (data) => http.post(`${BaseUrl}/order/update-payment-method`, data);
// 获取订单详情
export const getOrderDetail = (data) => http.post(`${BaseUrl}/order/detail`, data);
// 获取订单列表
export const getOrderList = (data) => http.post(`${BaseUrl}/order/list`, data);
// 更新订单状态
export const updateOrderStatus = (data) => http.post(`${BaseUrl}/order/update-status`, data);
// 取消订单
export const cancelOrder = (data) => http.post(`${BaseUrl}/order/cancel`, data);

// ========== 服务商订单管理相关接口 ==========
// 获取服务商订单统计
export const getProviderOrderStats = (data) => http.post(`${BaseUrl}/order/provider/stats`, data);
// 获取服务商订单列表
export const getProviderOrderList = (data) => http.post(`${BaseUrl}/order/provider/list`, data);
// 获取服务跟踪数据（使用服务流程查询订单列表接口）
export const getServiceTrackingData = (data) => http.post(`${BaseUrl}/serviceFlow/query-order-list`, data);

// ========== 支付相关接口 ==========
// 微信统一下单（创建支付订单）
export const weixinUnifiedOrder = (data) => http.post(`${BaseUrl}/weixin/unified-order`, data);
// 微信获取支付Token
export const getWeixinPayToken = (data) => http.post(`${BaseUrl}/weixin/getPayToken`, data);
// 主动查询微信支付状态
export const manualCheckPayment = (data) => http.post(`${BaseUrl}/weixin/manual-check-payment`, data);

// ========== 发票管理相关接口 ==========
// 创建发票信息
export const createInvoice = (data) => http.post(`${BaseUrl}/invoice/create`, data);
// 更新发票信息
export const updateInvoice = (data) => http.post(`${BaseUrl}/invoice/update`, data);
// 删除发票信息
export const deleteInvoice = (data) => http.post(`${BaseUrl}/invoice/delete`, data);
// 获取发票详情
export const getInvoiceDetail = (data) => http.post(`${BaseUrl}/invoice/detail`, data);
// 获取发票列表
export const getInvoiceList = (data) => http.post(`${BaseUrl}/invoice/list`, data);
// 设置默认发票
export const setDefaultInvoice = (data) => http.post(`${BaseUrl}/invoice/set-default`, data);
// 获取默认发票
export const getDefaultInvoice = (data) => http.post(`${BaseUrl}/invoice/get-default`, data);