import { Request, Response } from "express";
import { MarketService } from "./service";
import {
  httpSuccess,
  http400Error,
  handleException,
} from "../../common/common";
import { getLang } from "../../lang";

// ======================== 经纪人相关接口 ========================

/**
 * 获取经纪人统计数据
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const brokerId = req["entity_id"];
    const result = await service.getStats(brokerId);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      query_error: () => http400Error(res, getLang("query_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getStats");
  }
};

/**
 * 更新经纪人统计数据
 */
export const updateStats = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const brokerId = req["entity_id"];
    const result = await service.updateStats(brokerId);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      update_error: () => http400Error(res, getLang("update_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "updateStats");
  }
};

/**
 * 添加客户
 */
export const addGuest = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const data = {
      broker_id: req["entity_id"],
      entity_id: req.body.entity_id,
      enterprise_name: '',
      logo: '',
      contact_person: '',
      contact_phone: '',
      contact_email: '',
      status: 0,
      tags: '[]',
      remark: '',
      success_rate: 0,
      follow_up_count: 0,
      last_contact_time: 0,
      next_contact_time: 0,
      total_orders: 0,
      total_amount: 0,
      province: 0,
      city: 0,
      create_time: Math.floor(Date.now() / 1000),
      update_time: Math.floor(Date.now() / 1000)
    };
    const result = await service.addGuest(data); 
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      entity_not_found: () => http400Error(res, "企业不存在，请检查企业ID"),
      already_exists: () => http400Error(res, "该企业已经是您的客户"),
      insert_error: () => http400Error(res, getLang("insert_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "addGuest");
  }
};



/**
 * 获取客户详情
 */
export const getGuestDetail = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const result = await service.getGuestDetail(req.body.id, req["entity_id"]);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      not_found: () => http400Error(res, getLang("not_found")),
      query_error: () => http400Error(res, getLang("query_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getGuestDetail");
  }
};

/**
 * 获取客户列表
 */
export const getGuestList = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const result = await service.getGuestList(req["entity_id"], req.body);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      query_error: () => http400Error(res, getLang("query_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getGuestList");
  }
};

/**
 * 添加需求跟进
 */
export const addNeed = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const data = { 
      broker_id: req["entity_id"],
      demand_id: req.body.demand_id
    };
    const result = await service.addNeed(data);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      demand_not_found: () => http400Error(res, "需求不存在，请检查需求ID"),
      already_following: () => http400Error(res, "您已经在跟进该需求"),
      already_exists: () => http400Error(res, "该需求已存在"),
      insert_error: () => http400Error(res, getLang("insert_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "addNeed");
  }
};

/**
 * 更新需求跟进
 */
export const updateNeed = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const data = { ...req.body, broker_id: req["entity_id"] };
    const result = await service.updateNeed(data);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      no_fields_to_update: () => http400Error(res, getLang("no_fields_to_update")),
      update_error: () => http400Error(res, getLang("update_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "updateNeed");
  }
};



/**
 * 获取需求跟进详情
 */
export const getNeedDetail = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const result = await service.getNeedDetail(req.body.id, req["entity_id"]);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      not_found: () => http400Error(res, getLang("not_found")),
      query_error: () => http400Error(res, getLang("query_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getNeedDetail");
  }
};

/**
 * 获取需求跟进列表
 */
export const getNeedList = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const result = await service.getNeedList(req["entity_id"], req.body);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      query_error: () => http400Error(res, getLang("query_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getNeedList");
  }
};

/**
 * 添加待办事项
 */
export const addTask = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const data = { ...req.body, broker_id: req["entity_id"] };
    const result = await service.addTask(data);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      insert_error: () => http400Error(res, getLang("insert_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "addTask");
  }
};

/**
 * 更新待办事项
 */
export const updateTask = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const data = { ...req.body, broker_id: req["entity_id"] };
    const result = await service.updateTask(data);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      no_fields_to_update: () => http400Error(res, getLang("no_fields_to_update")),
      update_error: () => http400Error(res, getLang("update_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "updateTask");
  }
};



/**
 * 获取待办事项详情
 */
export const getTaskDetail = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const result = await service.getTaskDetail(req.body.id, req["entity_id"]);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      not_found: () => http400Error(res, getLang("not_found")),
      query_error: () => http400Error(res, getLang("query_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getTaskDetail");
  }
};

/**
 * 获取待办事项列表
 */
export const getTaskList = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const result = await service.getTaskList(req["entity_id"], req.body);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      query_error: () => http400Error(res, getLang("query_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getTaskList");
  }
};

/**
 * 获取操作历史列表
 */
export const getHistoryList = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const result = await service.getHistoryList(req["entity_id"], req.body);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      query_error: () => http400Error(res, getLang("query_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getHistoryList");
  }
};

/**
 * 获取收入趋势数据
 */
export const getIncomeTrend = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const result = await service.getIncomeTrend(req["entity_id"], req.body);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      query_error: () => http400Error(res, getLang("query_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getIncomeTrend");
  }
};

// ======================= 旧版兼容接口 =======================

/**
 * 获取经纪人联系记录列表 (兼容旧版)
 */
export const getBrokerContacts = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    // 映射到新的客户列表接口
    const result = await service.getGuestList(req["entity_id"], req.body);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      query_error: () => http400Error(res, getLang("query_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getBrokerContacts");
  }
};



/**
 * 获取客户标签 (兼容旧版)
 */
export const getCustomerTags = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    
    // 获取所有客户的标签
    const result = await service.getGuestList(req["entity_id"], { page: 1, page_size: 1000 });
    
    if (result.msg === "ok") {
      const allTags = [];
      const tagMap = new Map();
      
      result.data.list.forEach(guest => {
        if (guest.tags) {
          try {
            const tags = JSON.parse(guest.tags);
            tags.forEach(tag => {
              if (!tagMap.has(tag.name)) {
                tagMap.set(tag.name, {
                  id: tagMap.size + 1,
                  tag: tag.name,
                  color: tag.color || '#1890ff',
                  count: 1
                });
              } else {
                tagMap.get(tag.name).count++;
              }
            });
          } catch (e) {
            // 忽略解析错误
          }
        }
      });
      
      const tags = Array.from(tagMap.values());
      return httpSuccess(res, tags, getLang("success"));
    } else {
      return http400Error(res, getLang("query_error"));
    }
  } catch (error) {
    return handleException(res, error, "getCustomerTags");
  }
};

/**
 * 联系企业 (兼容旧版)
 */
export const contactEnterprise = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    
    // 创建或更新客户关系
    const data = {
      broker_id: req["entity_id"],
      entity_id: req.body.entity_id,
      enterprise_name: '',
      logo: '', // 企业logo
      contact_person: '',
      contact_phone: '',
      contact_email: '',
      status: 0, // 0-待沟通
      tags: '[]',
      remark: req.body.remark || '',
      success_rate: 0,
      follow_up_count: 0,
      last_contact_time: 0,
      next_contact_time: 0,
      total_orders: 0,
      total_amount: 0,
      province: 0,
      city: 0,
      create_time: Math.floor(Date.now() / 1000),
      update_time: Math.floor(Date.now() / 1000)
    };
    
    const result = await service.addGuest(data);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      insert_error: () => http400Error(res, getLang("insert_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "contactEnterprise");
  }
};

/**
 * 获取团队列表
 */
export const teamList = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const { page, page_size, keyword } = req.body;
    
    // 从token中获取entity_id
    const entity_id = req["entity_id"]; 
    const params = {
      page: page || 1,
      page_size: page_size || 20,
      keyword: keyword || ''
    };
    
    const result = await service.getTeamList(entity_id, params);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      database_error: () => http400Error(res, getLang("database_error")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "teamList");
  }
};

/**
 * 更新团队成员标签
 */
export const updateTeamMemberTags = async (req: Request, res: Response) => {
  try {
    const service = new MarketService(req["token"]);
    const { target_entity_id, tags } = req.body;
    
    // 从token中获取entity_id
    const entity_id = req["entity_id"];
    if (!entity_id) {
      return http400Error(res, getLang("invalid_token"));
    }
    
    // 解析 JSON 字符串格式的 tags
    let parsedTags = [];
    try {
      parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);
    } catch (error) {
      return http400Error(res, "标签数据格式错误");
    }
    
    const params = {
      target_entity_id: parseInt(target_entity_id),
      tags: parsedTags
    };
    
    const result = await service.updateTeamMemberTags(entity_id, params);
    
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      too_many_tags: () => http400Error(res, "标签数量不能超过5个"),
      invalid_tag_name: () => http400Error(res, "标签名称不能为空且不能超过10个字符"),
      invalid_tag_format: () => http400Error(res, "标签数据格式错误"),
      relation_not_found: () => http400Error(res, "团队关系不存在"),
      database_error: () => http400Error(res, getLang("database_error")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, result.msg || getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "updateTeamMemberTags");
  }
};