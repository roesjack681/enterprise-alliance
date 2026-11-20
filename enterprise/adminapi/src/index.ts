import express = require("express")
import cors=require('cors')
import bodyParser = require('body-parser');
import { Request, Response } from "express";

import { validate } from "./common/common";

import { CheckLangAndToken } from "./middles/middle";
//import { logger, httpLogger } from './middles/logger';
import * as appApi from "./modules/app/api";
//token
//admin
import * as adminApi from "./modules/admin/api";
import * as adminForm from "./modules/admin/form";
import * as rolesApi from "./modules/roles/api";
import * as rolesForm from "./modules/roles/form";
import * as categoryApi from "./modules/category/api";
import * as categoryForm from "./modules/category/form";
import * as articleApi from "./modules/article/api";
import * as articleForm from "./modules/article/form";

//服务流程管理模块
import * as serviceFlowApi from "./modules/serviceFlow/api";
import * as serviceFlowForm from "./modules/serviceFlow/form";

//订单管理模块
import * as orderApi from "./modules/order/api";
import * as orderForm from "./modules/order/form";

//系统配置模块
import * as syssetApi from "./modules/sysset/api";
import * as syssetForm from "./modules/sysset/form";

//userplan

const app = express()
const port = 9800 
app.use(cors()) //允许所有跨域
app.use(express.urlencoded({ extended: true }))
app.use(CheckLangAndToken)
// 解析 application/json 类型的请求体
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
//app.use(httpLogger);
app.get('/', async (req:Request, res:Response) => {
    res.send('Hello World!')
})


//admin
app.post("/admin/login",validate(adminForm.loginForm),async (req: Request,res: Response) => await adminApi.login(req,res))
app.post("/admin/get",validate(adminForm.userInfoForm),async (req: Request,res: Response) => await adminApi.adminDetail(req,res))
app.post("/admin/refresh-token",validate(adminForm.refreshTokenForm),async (req: Request,res: Response) => await adminApi.refreshToken(req,res))
app.post("/admin/add",validate(adminForm.addForm),async (req: Request,res: Response) => await adminApi.adminAdd(req,res))
app.post("/admin/update",validate(adminForm.updateForm),async (req: Request,res: Response) => await adminApi.adminUpdate(req,res))
app.post("/admin/del",validate(adminForm.delForm),async (req: Request,res: Response) => await adminApi.adminDel(req,res))
app.post("/admin/list",async (req: Request,res: Response) => await adminApi.adminList(req,res))
app.post("/admin/setStatus",async (req: Request,res: Response) => await adminApi.setStatus(req,res))
//roles
app.post("/roles/add",validate(rolesForm.addForm),async (req: Request,res: Response) => await rolesApi.rolesAdd(req,res))
app.post("/roles/get",validate(rolesForm.detailForm),async (req: Request,res: Response) => await rolesApi.rolesDetail(req,res))
app.post("/roles/update",validate(rolesForm.updateForm),async (req: Request,res: Response) => await rolesApi.rolesUpdate(req,res))
app.post("/roles/del",validate(rolesForm.delForm),async (req: Request,res: Response) => await rolesApi.rolesDel(req,res))
app.post("/roles/list",async (req: Request,res: Response) => await rolesApi.rolesList(req,res))

//category
app.post("/category/add",validate(categoryForm.addForm),async (req: Request,res: Response) => await categoryApi.categoryAdd(req,res))
app.post("/category/update",validate(categoryForm.updateForm),async (req: Request,res: Response) => await categoryApi.categoryUpdate(req,res))
app.post("/category/del",validate(categoryForm.delForm),async (req: Request,res: Response) => await categoryApi.categoryDel(req,res))
app.post("/category/detail",validate(categoryForm.detailForm),async (req: Request,res: Response) => await categoryApi.categoryDetail(req,res))
app.post("/category/list",async (req: Request,res: Response) => await categoryApi.categoryList(req,res))
//app.post("/category/listPage",validate(categoryForm.listForm),async (req: Request,res: Response) => await categoryApi.categoryListPage(req,res))
app.post("/category/setStatus",validate(categoryForm.setStatusForm),async (req: Request,res: Response) => await categoryApi.setStatus(req,res))
// app.post("/category/parents",async (req: Request,res: Response) => await categoryApi.getParentCategories(req,res))
// app.post("/category/children",async (req: Request,res: Response) => await categoryApi.getChildCategories(req,res))
// app.post("/category/tree",async (req: Request,res: Response) => await categoryApi.getCategoryTree(req,res))
// app.post("/category/activeTree",async (req: Request,res: Response) => await categoryApi.getActiveCategoryTree(req,res))

//article
app.post("/article/getCategoryList",async (req: Request,res: Response) => await articleApi.getCategoryList(req,res))
app.post("/article/setCategory",validate(articleForm.setCategoryForm),async (req: Request,res: Response) => await articleApi.setCategory(req,res))
app.post("/article/setCategoryStatus",validate(articleForm.setCategoryStatusForm),async (req: Request,res: Response) => await articleApi.setCategoryStatus(req,res))
app.post("/article/deleteCategory",validate(articleForm.deleteCategoryForm),async (req: Request,res: Response) => await articleApi.deleteCategory(req,res))
app.post("/article/getList",async (req: Request,res: Response) => await articleApi.getList(req,res))
app.post("/article/addArticle",validate(articleForm.addArticleForm),async (req: Request,res: Response) => await articleApi.addArticle(req,res))
app.post("/article/updateArticle",validate(articleForm.updateArticleForm),async (req: Request,res: Response) => await articleApi.updateArticle(req,res))
app.post("/article/setStatus",validate(articleForm.setStatusForm),async (req: Request,res: Response) => await articleApi.setStatus(req,res))
app.post("/article/deleteArticle",validate(articleForm.deleteArticleForm),async (req: Request,res: Response) => await articleApi.deleteArticle(req,res))

//app
app.post("/app/provinces",async (req: Request,res: Response) => await appApi.areaList(req,res))
app.post("/app/category",async (req: Request,res: Response) => await appApi.categoryList(req,res))
app.post("/app/statistics",async (req: Request,res: Response) => await appApi.getStatistics(req,res))
app.post("/app/pushmsg",async (req: Request,res: Response) => await appApi.pushMsg(req,res)) //推送消息到微信公众号

/** 服务流程管理模块（管理后台） **/
//获取工作台统计数据
app.post("/serviceFlow/workbench-statistics", async (req: Request, res: Response) => await serviceFlowApi.getWorkbenchStatistics(req, res))
//获取流程监控概览统计数据
app.post("/serviceFlow/monitoring-overview", async (req: Request, res: Response) => await serviceFlowApi.getMonitoringOverview(req, res))
//查询订单列表（管理后台）
app.post("/serviceFlow/admin-query-order-list", validate(serviceFlowForm.queryOrderListForm), async (req: Request, res: Response) => await serviceFlowApi.queryOrderList(req, res))
//获取订单详情（管理后台）
app.post("/serviceFlow/admin-order-detail", validate(serviceFlowForm.getOrderDetailForm), async (req: Request, res: Response) => await serviceFlowApi.getOrderDetail(req, res))
//获取下一步骤信息
app.post("/serviceFlow/get-next-step", validate(serviceFlowForm.getOrderDetailForm), async (req: Request, res: Response) => await serviceFlowApi.getNextStep(req, res))
//管理员推进流程
app.post("/serviceFlow/admin-advance-process", validate(serviceFlowForm.advanceProcessForm), async (req: Request, res: Response) => await serviceFlowApi.advanceProcess(req, res))
//分配任务
app.post("/serviceFlow/assign-tasks", validate(serviceFlowForm.assignTasksForm), async (req: Request, res: Response) => await serviceFlowApi.assignTasks(req, res))
//批量操作
app.post("/serviceFlow/batch-operation", validate(serviceFlowForm.batchOperationForm), async (req: Request, res: Response) => await serviceFlowApi.batchOperation(req, res))
//创建流程模板
app.post("/serviceFlow/create-template", validate(serviceFlowForm.createTemplateForm), async (req: Request, res: Response) => await serviceFlowApi.createTemplate(req, res))
//更新流程模板
app.post("/serviceFlow/update-template", validate(serviceFlowForm.updateTemplateForm), async (req: Request, res: Response) => await serviceFlowApi.updateTemplate(req, res))
//删除流程模板
app.post("/serviceFlow/delete-template", validate(serviceFlowForm.deleteTemplateForm), async (req: Request, res: Response) => await serviceFlowApi.deleteTemplate(req, res))
//获取流程模板列表
app.post("/serviceFlow/template-list", async (req: Request, res: Response) => await serviceFlowApi.queryTemplates(req, res))
//查询流程模板
app.post("/serviceFlow/query-templates", validate(serviceFlowForm.queryTemplatesForm), async (req: Request, res: Response) => await serviceFlowApi.queryTemplates(req, res))
//获取流程实例列表  
app.post("/serviceFlow/process-instance-list", async (req: Request, res: Response) => await serviceFlowApi.queryProcessInstances(req, res))
//获取流程实例详情
app.post("/serviceFlow/process-instance-detail", async (req: Request, res: Response) => await serviceFlowApi.getProcessInstanceDetail(req, res))
//获取步骤历史
app.post("/serviceFlow/step-history", async (req: Request, res: Response) => await serviceFlowApi.getStepHistory(req, res))
//获取流程告警列表
app.post("/serviceFlow/process-alerts", async (req: Request, res: Response) => await serviceFlowApi.queryAlerts(req, res))
//确认告警
app.post("/serviceFlow/acknowledge-alert", async (req: Request, res: Response) => await serviceFlowApi.acknowledgeAlert(req, res))
//解决告警
app.post("/serviceFlow/resolve-alert", async (req: Request, res: Response) => await serviceFlowApi.resolveAlert(req, res))
//获取服务分类列表（用于流程模板配置）
app.post("/serviceFlow/category-list", async (req: Request, res: Response) => await serviceFlowApi.getCategoryList(req, res))
//设置订单优先级
app.post("/serviceFlow/set-order-priority", validate(serviceFlowForm.setOrderPriorityForm), async (req: Request, res: Response) => await serviceFlowApi.setOrderPriority(req, res))
//添加订单备注
app.post("/serviceFlow/add-order-remarks", validate(serviceFlowForm.addOrderRemarksForm), async (req: Request, res: Response) => await serviceFlowApi.addOrderRemarks(req, res))
//查询告警
app.post("/serviceFlow/query-alerts", validate(serviceFlowForm.queryAlertsForm), async (req: Request, res: Response) => await serviceFlowApi.queryAlerts(req, res))
//解决告警
app.post("/serviceFlow/resolve-alert", validate(serviceFlowForm.resolveAlertForm), async (req: Request, res: Response) => await serviceFlowApi.resolveAlert(req, res))
//获取订单统计
app.post("/serviceFlow/order-statistics", validate(serviceFlowForm.getOrderStatisticsForm), async (req: Request, res: Response) => await serviceFlowApi.getOrderStatistics(req, res))
 
// 通用支付订单管理接口
//获取支付订单列表（兼容前端接口）
app.post("/order/getList", validate(orderForm.queryOrderListForm), async (req: Request, res: Response) => await orderApi.queryOrderList(req, res))
//导出支付订单Excel
app.post("/order/exportOrderExcel", validate(orderForm.exportOrderExcelForm), async (req: Request, res: Response) => await orderApi.exportOrderExcel(req, res))
//确认收款（将订单状态更新为已支付，触发业务订单创建）
app.post("/order/confirmPayment", validate(orderForm.processPaymentForm), async (req: Request, res: Response) => await orderApi.processPayment(req, res))
//确认订单处理（业务处理）
app.post("/order/confirmProcess", validate(orderForm.confirmOrderProcessForm), async (req: Request, res: Response) => await orderApi.confirmOrderProcess(req, res))
//处理退款
app.post("/order/processRefund", validate(orderForm.processRefundForm), async (req: Request, res: Response) => await orderApi.processRefund(req, res))
//手动取消订单
app.post("/order/cancelOrder", validate(orderForm.cancelOrderForm), async (req: Request, res: Response) => await orderApi.cancelOrder(req, res))

// 系统配置模块
//按IDs获取系统配置（单个或多个）
app.post("/admin/getSysSet", validate(syssetForm.getByIdsForm), async (req: Request, res: Response) => await syssetApi.getByIds(req, res))
//更新系统配置
app.post("/admin/updateSysSet", validate(syssetForm.updateSysSetForm), async (req: Request, res: Response) => await syssetApi.updateSysSet(req, res))



// app.use((err, req: Request, res: Response, next) => {
//     console.error(err.stack); // 打印错误堆栈
//     res.status(500).json({
//         message: 'Internal Server Error',
//         error: err.message // 返回错误信息
//     });
// });

//启动服务
app.listen(port, async () => {
    //await init_db()  
    console.log(`Example app listening on port ${port}`)
})