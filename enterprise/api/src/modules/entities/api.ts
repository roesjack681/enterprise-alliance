import { Request, Response } from "express";
import { EntityService } from "./service";
import { EntityInfoService } from "../entityInfo/service";
import {
  httpSuccess,
  http400Error,
  handleException,
  caesarEncrypt,
} from "../../common/common";
import { AssociationEntity, EntityModel } from "./proto";
import { getLang } from "../../lang";
import { redisPool } from '../../storage/redisPool';

// ======================== 企业相关接口 ========================

/**
 * 企业登录
 */
export const login = async (req: Request, res: Response) => {
    try {
        let username: string = req.body.username;
        let pwd: string = req.body.pwd;
        const service = new EntityService({ token: "" });
        const result = await service.login(username, pwd);
        const handlerMap = {
            ok: () => httpSuccess(res, result.data, getLang("login_success")),
            login_failed: () => http400Error(res, getLang("login_failed")),
            user_not_found: () => http400Error(res, getLang("user_not_found")),
            user_disabled: () => http400Error(res, getLang("user_disabled")),
            user_locked: () => http400Error(res, getLang("user_locked")),
            password_error: () => http400Error(res, getLang("password_error")),
            server_error: () => http400Error(res, getLang("server_error")),
            default: () => http400Error(res, getLang("server_error")),
        };
        return (handlerMap[result.msg] || handlerMap["default"])();
    } catch (error) {
        return handleException(res, error, "login");
    }
};

/**
 * 刷新Token
 */
export const refreshToken = async (req: Request, res: Response) => {
    try {
        const service = new EntityService({ token: req["token"] });
        const result = await service.refreshToken();
        const handlerMap = {
            ok: () => httpSuccess(res, result.data, getLang("success")),
            unauthorized: () => http400Error(res, getLang("unauthorized")),
            token_refresh_failed: () => http400Error(res, getLang("token_refresh_failed")),
            server_error: () => http400Error(res, getLang("server_error")),
            default: () => http400Error(res, getLang("server_error")),
        };
        return (handlerMap[result.msg] || handlerMap["default"])();
    } catch (error) {
        return handleException(res, error, "refreshToken");
    }
};

/**
 * 修改密码
 */
export const changePassword = async (req: Request, res: Response) => {
    try {
        const service = new EntityService({ token: req["token"] });
        const user_id: number = req["entity_id"];
        let oldPwd: string = req.body.oldPwd;
        let newPwd: string = req.body.newPwd;
        const result = await service.changePassword(user_id, oldPwd, newPwd);
        const handlerMap = {
            ok: () => httpSuccess(res, result.data, getLang("change_password_success")),
            password_error: () => http400Error(res, getLang("password_error")),
            password_too_short: () => http400Error(res, getLang("password_too_short")),
            user_not_found: () => http400Error(res, getLang("user_not_found")),
            update_failed: () => http400Error(res, getLang("change_password_failed")),
            server_error: () => http400Error(res, getLang("server_error")),
            default: () => http400Error(res, getLang("server_error")),
        };
        return (handlerMap[result.msg] || handlerMap["default"])();
    } catch (error) {
        return handleException(res, error, "changePassword");
    }
};

/**
 * 修改企业用户信息（防重复提交）
 */
export const changeUserInfo = async (req: Request, res: Response) => {
    try {
        let key = "changeUserInfo::" + req["entity_id"];
        let redis = await redisPool.acquire();
        try {
            if ((await redis.exists(key)) == 0) {
                await redis.setex(key, 3, "1");
                const service = new EntityService({ token: req["token"] });
                const id = req["entity_id"];
                const {
                    openid = null,
                    nickname = null,
                    avatar = null,
                    email = null,
                    role = null,
                    province = null,
                    city = null,
                    town = null,
                    street = null,
                } = req.body;
                const data: EntityModel = {
                    id,
                    openid,
                    nickname,
                    email,
                    avatar,
                    role,
                    province,
                    city,
                    town,
                    street,
                    review_status: null,
                    status: null,
                    pid: null,
                    username: null,
                    password: null,
                    salt: null,
                    mobile: null,
                    create_time: null,
                    last_login_time: null,
                    entityInfo: null,
                };
                const result = await service.updateOne(data);
                const handlerMap = {
                    ok: () => httpSuccess(res, result.data, getLang("update_success")),
                    err: () => http400Error(res, getLang("failure")),
                    default: () => http400Error(res, getLang("server_error")),
                };
                return (handlerMap[result.msg] || handlerMap["default"])();
            } else {
                return httpSuccess(res, {}, getLang("repeat_submit"));
            }
        } finally {
            await redisPool.release(redis);
        }
    } catch (error) {
        return handleException(res, error, "entityUpdate");
    }
};

/**
 * 发送短信验证码
 */
export const sendSmsCode = async (req: Request, res: Response) => {
  try {
    const { mobile } = req.body;
    
    if (!mobile) {
      return http400Error(res, getLang("mobile_required"));
    }

    const service = new EntityService({ token: req["token"] || "" });
    const result = await service.sendSmsCode(mobile);

    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("sms_send_success")),
      sms_send_failed: () => http400Error(res, result.data?.message || getLang("sms_send_failed")),
      sms_phone_invalid: () => http400Error(res, getLang("sms_phone_invalid")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("sms_send_failed")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, getLang("sms_send_failed"));
  }
};

export const loginByCode = async (req: Request, res: Response) => {
  const { username, smsCode } = req.body;
  const service = new EntityService({ token: req["token"] || "" });
  const result = await service.loginByCode(username, smsCode);

  const handlerMap = {
    ok: () => httpSuccess(res, result.data, getLang("login_success")),
    user_not_found: () => http400Error(res, getLang("user_not_found")),
    user_disabled: () => http400Error(res, getLang("user_disabled")),
    sms_code_invalid: () => http400Error(res, result.data?.message || getLang("sms_code_invalid")),
    token_error: () => http400Error(res, getLang("login_failed")),
    default: () => http400Error(res, getLang("login_failed")),
  };
  return (handlerMap[result.msg] || handlerMap["default"])();
};

export const findPassword = async (req: Request, res: Response) => {
  const { username, smsCode, newPwd } = req.body;
  const service = new EntityService({ token: req["token"] || "" });
  const result = await service.findPassword(username, smsCode, newPwd);

  const handlerMap = {
    ok: () => httpSuccess(res, result.data, getLang("change_password_success")),
    user_not_found: () => http400Error(res, getLang("user_not_found")),
    user_disabled: () => http400Error(res, getLang("user_disabled")),
    sms_code_invalid: () => http400Error(res, result.data?.message || getLang("sms_code_invalid")),
    password_error: () => http400Error(res, getLang("password_error")),
    password_too_short: () => http400Error(res, getLang("password_too_short")),
    update_failed: () => http400Error(res, getLang("change_password_failed")),
    server_error: () => http400Error(res, getLang("server_error")),
    default: () => http400Error(res, getLang("change_password_failed")),
  };
  return (handlerMap[result.msg] || handlerMap["default"])();
};

export const updatePath = async (req: Request, res: Response) => {
  const { entity_id, pid } = req.body; 
  const service = new EntityService({ token: req["token"] || "" });
  const result = await service.updatePath(entity_id, pid);
  return httpSuccess(res, result.data, getLang("success"));
};

export const entityAdd = async (req: Request, res: Response) => {
  try {
    let key = "entityAdd::" + req["entity_id"];
    let redis = await redisPool.acquire();
    try {
      if ((await redis.exists(key)) == 0) {
        await redis.setex(key, 2, "1");
        let role_type: number = Number(req.body.role_type);
        let username: string = req.body.mobile;
        let password: string = req.body.password;
        let mobile: string = req.body.mobile;
        let smsCode: string = req.body.smsCode; // 添加短信验证码字段
        let referrer: string = req.body.referrer; // 推荐人加密值
        const data: AssociationEntity & { smsCode?: string } = {
          role_type:role_type,
          username,
          password,
          mobile,
          smsCode, // 包含短信验证码
          referrer, // 推荐人加密值
          // salt,
          pid:null,
          id: null,
        };
        const service = new EntityService({ token: req["token"] });
        const result = await service.add(data);

        const handlerMap = {
          ok: () => httpSuccess(res, result.data, getLang("register_success")),
          err: () => http400Error(res, getLang("register_failed")),
          sms_code_required: () => http400Error(res, getLang("sms_code_required")),
          sms_code_invalid: () => http400Error(res, result.data?.message || getLang("sms_code_invalid")),
          user_exists: () => http400Error(res, getLang("user_exists")),
          server_error: () => http400Error(res, getLang("server_error")),
          default: () => http400Error(res, getLang("register_failed")),
        };
        return (handlerMap[result.msg] || handlerMap["default"])();
      } else {
        return http400Error(res,  getLang("repeat_submit"));
      }
    } finally {
      await redisPool.release(redis);
    }
  } catch (error) {
    return handleException(res, error, "failure");
  }
};

export const entityUpdate = async (req: Request, res: Response) => {
  try {
    const service = new EntityService({ token: req["token"] });
    let id: number = req.body.id;
    let status: number = req.body.status;
    let username: string = req.body.username;
    let password: string = req.body.password;
    let email: string = req.body.email;
    let salt: string = req.body.salt;
    let openid: string = req.body.openid;
    let nickname: string = req.body.nickname;
    let avatar: string = req.body.avatar;
    let role: number = req.body.role;
    let province: number = req.body.province;
    let city: number = req.body.city;
    let town: number = req.body.town;
    let street: number = req.body.street;
    let create_time: number = req.body.create_time;
    let last_login_time: number = req.body.last_login_time;
    const data: EntityModel = {
      id: id,
      status: status,
      username: username,
      password: password,
      email: email,
      salt: salt,
      openid: openid,
      nickname: nickname,
      avatar: avatar,
      role: role,
      province: province,
      city: city,
      town: town,
      street: street,
      create_time: create_time,
      last_login_time: last_login_time,
      pid: 0,
      review_status: 0,
      mobile: "",
      entityInfo: undefined,
    };
    const result = await service.update(data);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("update_success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "entityUpdate");
  }
};
export const entityDetail = async (req: Request, res: Response) => {
  try {
    const service = new EntityService({ token: req["token"] });
    const entityInfo_service = new EntityInfoService({ token: req["token"] });
    const id = req["entity_id"];
    const result = await service.detail(id);
    const entityInfo_result = await entityInfo_service.detail(id);
    result.data.entityInfo = entityInfo_result.data; //挂载企业信息数据
    result.data.inviteCode = caesarEncrypt(id+','+result.data.username);
    // 
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("user_get_detail_error")),
      not_found: () => http400Error(res, getLang("user_not_found")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "entityDetail");
  }
};

export const entityList = async (req: Request, res: Response) => {
  try {
    const service = new EntityService({ token: req["token"] });
    let user_id: number = req["entity_id"]; //使用token反解用户ID
    const result = await service.listall(user_id);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("get_list_error")),
      not_found: () => http400Error(res, getLang("no_data_found")),
      permission_denied: () => http400Error(res, getLang("permission_denied")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "entityList");
  }
};

export const entityListPage = async (req: Request, res: Response) => {
  try {
    const service = new EntityService({ token: req["token"] });
    let user_id: number = req["entity_id"];
    let currentPage = req.body.current_page;
    let pageSize = req.body.page_size;
    const result = await service.listPage(user_id, currentPage, pageSize);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("get_list_error")),
      not_found: () => http400Error(res, getLang("no_data_found")),
      invalid_page: () => http400Error(res, getLang("invalid_page")),
      invalid_page_size: () => http400Error(res, getLang("invalid_page_size")),
      permission_denied: () => http400Error(res, getLang("permission_denied")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "entityListPage");
  }
};

export const entitySearch = async (req: Request, res: Response) => {
  try {
    const service = new EntityService({ token: req["token"] });
    const words: string = req.body.words;
    const currentPage: number =Number(req.body.current_page) ;
    const pageSize: number =Number(req.body.page_size) ;
    const result = await service.search(words, currentPage, pageSize);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      OK: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("search_failed")),
      not_found: () => http400Error(res, getLang("no_search_results")),
      invalid_keyword: () => http400Error(res, getLang("invalid_search_keyword")),
      keyword_too_short: () => http400Error(res, getLang("search_keyword_too_short")),
      permission_denied: () => http400Error(res, getLang("permission_denied")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "entityListPage");
  }
};

export const entityInfoAssociationAdd = async (req: Request, res: Response) => {
  try {
    let key = "entityInfoAssociationAdd::" + req["entity_id"];
    let redis = await redisPool.acquire();
    try {
      if ((await redis.exists(key)) == 0) {
        await redis.setex(key, 4, "1");
        let name: string = req.body.name;
        let role_type: number = Number(req.body.role_type);
        let province: number = Number(req.body.province);
        let city: number = Number(req.body.city);
        let district: number = Number(req.body.district);
        let town: number = Number(req.body.town);
        let username: string = req.body.username;
        let password: string = req.body.password;
        let mobile: string = req.body.mobile;
        // let salt: string = req.body.salt;
        const data: AssociationEntity = {
          name,
          role_type,
          province,
          city,
          district,
          town,
          username,
          password,
          mobile,
          pid:req["entity_id"],
          // salt,
          id: null,
        };
        const service = new EntityService({ token: req["token"] });
        const result = await service.addEntity(data);

        const handlerMap = {
          ok: () => httpSuccess(res, result.data, getLang("association_add_success")),
          err: () => http400Error(res, getLang("association_add_failed")),
          user_exists: () => http400Error(res, getLang("user_exists")),
          company_exists: () => http400Error(res, getLang("company_exists")),
          mobile_exists: () => http400Error(res, getLang("mobile_exists")),
          invalid_company_name: () => http400Error(res, getLang("company_name_required")),
          invalid_role_type: () => http400Error(res, getLang("role_type_invalid")),
          invalid_address: () => http400Error(res, getLang("address_invalid")),
          default: () => http400Error(res, getLang("server_error")),
        };
        return (handlerMap[result.msg] || handlerMap["default"])();
      } else {
        return httpSuccess(res, {}, "请勿重复提交");
      }
    } finally {
      await redisPool.release(redis);
    }
  } catch (error) {
    return handleException(res, error, "failure");
  }
};

export const queryEnterpriseList = async (req: Request, res: Response) => {
  try {
    const service = new EntityService({ token: req["token"] });
    const entity_id: number = req["entity_id"];
    const role: number = Number(req.body.role);
    const result = await service.queryEntityList(entity_id, role);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      query_enterprise_failed: () => http400Error(res, getLang("query_enterprise_failed")),
      no_enterprise_found: () => http400Error(res, getLang("no_enterprise_found")),
      invalid_role: () => http400Error(res, getLang("role_invalid")),
      permission_denied: () => http400Error(res, getLang("permission_denied")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "failure");
  }
};

export const queryEnterpriseListNum = async (req: Request, res: Response) => {
  try {
    const service = new EntityService({ token: req["token"] });
    const entity_id: string = req["entity_id"];
    const role: string = req.body.role;
    const page: string = req.body.page;
    const result = await service.queryEnterpriseListNum(entity_id, role, page);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      query_count_failed: () => http400Error(res, getLang("query_count_failed")),
      no_enterprise_found: () => http400Error(res, getLang("no_enterprise_found")),
      invalid_role: () => http400Error(res, getLang("role_invalid")),
      invalid_page: () => http400Error(res, getLang("invalid_page")),
      permission_denied: () => http400Error(res, getLang("permission_denied")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "failure");
  }
};

export const reviewEnterprise = async (req: Request, res: Response) => {
  try {
    const service = new EntityService({ token: req["token"] });
    const entity_id: number = Number(req.body.entity_id);
    const review_status: number = Number(req.body.review_status);
    const remark: string = req.body.remark || '';
    const result = await service.review(entity_id, review_status, remark);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("review_success")),
      review_failed: () => http400Error(res, getLang("review_failed")),
      enterprise_not_found: () => http400Error(res, getLang("enterprise_not_found")),
      invalid_review_status: () => http400Error(res, getLang("invalid_review_status")),
      already_reviewed: () => http400Error(res, getLang("already_reviewed")),
      permission_denied: () => http400Error(res, getLang("permission_denied")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "failure");
  }
};

export const queryEnterpriseDetail = async (req: Request, res: Response) => {
  try {
    const service = new EntityService({ token: req["token"] });
    const entity_id: number = Number(req.body.entity_id);
    const result = await service.queryEnterpriseDetail(entity_id);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      get_enterprise_detail_failed: () => http400Error(res, getLang("get_enterprise_detail_failed")),
      enterprise_not_found: () => http400Error(res, getLang("enterprise_not_found")),
      permission_denied: () => http400Error(res, getLang("permission_denied")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "failure");
  }
};

//查询服务商类型
export const queryAllType = async (req: Request, res: Response) => {
  try {
    const service = new EntityService({ token: req["token"] });
    const result = await service.queryType();
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      query_type_failed: () => http400Error(res, getLang("query_type_failed")),
      no_types_found: () => http400Error(res, getLang("no_types_found")),
      permission_denied: () => http400Error(res, getLang("permission_denied")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "failure");
  }
};

export const queryTypeTag = async (req: Request, res: Response) => {
  try {
    const service = new EntityService({ token: req["token"] });
    const result = await service.queryTypeTag();
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      query_type_tag_failed: () => http400Error(res, getLang("query_type_tag_failed")),
      no_tags_found: () => http400Error(res, getLang("no_tags_found")),
      permission_denied: () => http400Error(res, getLang("permission_denied")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "failure");
  }
};

/**
 * 获取协会统计信息
 */
export const getAssociationStatistics = async (req: Request, res: Response) => {
  try {
    const service = new EntityService({ token: req["token"] });
    const associationId: number = req["entity_id"]; // 从token中获取协会ID
    
    // 验证用户是否为协会角色
    const userRole = req["role_id"];
    if (userRole !== 9) { // 9为协会角色
      return http400Error(res, getLang("permission_denied"));
    }
    
    const result = await service.getAssociationStatistics(associationId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("get_statistics_failed")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getAssociationStatistics");
  }
};
