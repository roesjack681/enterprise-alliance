import { Request, Response } from "express";
import { EntityInfoService } from "./service";
import {
  httpSuccess,
  http400Error,
  handleException,
} from "../../common/common";
import { entityInfoModel } from "./proto";
import { ROLES } from "../app/proto";
import { getLang } from "../../lang";
import { redisPool } from '../../storage/redisPool';

// ======================== 企业认证信息相关接口 ========================

/**
 * 协会审核企业认证资料
 */
export const entityInfoReview = async (req: Request, res: Response) => {
    try {
        if (ROLES.ASSOCIATION !== req["role_id"]) {
            return http400Error(res, getLang("unauthorized"));
        }
        const service = new EntityInfoService({ token: req["token"] });
        let entity_id: number = req.body.id;
        const result = await service.review(entity_id);
        const handlerMap = {
            ok: () => httpSuccess(res, result.data, getLang("success")),
            not_found: () => http400Error(res, getLang("not_found")),
            err: () => http400Error(res, getLang("failure")),
            server_error: () => http400Error(res, getLang("server_error")),
            default: () => http400Error(res, getLang("server_error")),
        };
        // 注意：此处原代码未调用 handlerMap，建议补全
        return (handlerMap[result.msg] || handlerMap["default"])();
    } catch (error: any) {
        return handleException(res, error, "entityInfoAudit");
    }
};

/**
 * 新增企业认证信息（防重复提交）
 */
export const entityInfoAdd = async (req: Request, res: Response) => {
    try {
        let key = "entityInfoAdd::" + req["entity_id"];
        let redis = await redisPool.acquire();
        try {
            if ((await redis.exists(key)) == 0) {
                await redis.setex(key, 2, "1");
                return httpSuccess(res, {}, "提交成功");
            } else {
                return httpSuccess(res, {}, "请勿重复提交");
            }
        } finally {
            await redisPool.release(redis);
        }
    } catch (error) {
        return handleException(res, error, "entityAdd");
    }
};

export const supplement = async (req: Request, res: Response) => {
  let redis = await redisPool.acquire();
  try {
    let key = "entityInfoAdd::" + req["entity_id"];
    if ((await redis.exists(key)) == 0) {
      await redis.setex(key, 2, "1");
      const service = new EntityInfoService({ token: req["token"] });
      let entity_id: number = req["entity_id"];
      let province: number = req.body.province;
      let city: number = req.body.city;
      let town: number = req.body.town;
      let street: number = req.body.street;
      let name: string = req.body.name;
      let descp: string = req.body.descp;
      let company_number: string = req.body.company_number;
      let company_present_name: string = req.body.company_present_name;
      let company_present_id_number: string = req.body.company_present_id_number;
      let company_present_mobile: string = req.body.company_present_mobile;
      let company_id_pic: string = req.body.company_id_pic;
      let company_present_id_up_pic: string = req.body.company_present_id_up_pic;
      let company_present_id_down_pic: string = req.body.company_present_id_down_pic;
      let company_other_files: string = req.body.company_other_files;
      const data: entityInfoModel = {
        entity_id,
        province,
        city,
        town,
        street,
        name,
        descp,
        company_number,
        company_present_name,
        company_present_id_number,
        company_present_mobile,
        company_id_pic,
        company_present_id_up_pic,
        company_present_id_down_pic,
        company_other_files,
      };

      const result = await service.supplementInfo(data);
      const handlerMap = {
        ok: () => httpSuccess(res, result.data, getLang("add_success")),
        err: () => http400Error(res, getLang("failure")),
        default: () => http400Error(res, getLang("server_error")),
      };
      return (handlerMap[result.msg] || handlerMap["default"])();
    } else {
      return httpSuccess(res, {}, "请勿重复提交");
    }
  } catch (error) {
    return handleException(res, error, "entityAdd");
  } finally {
    await redisPool.release(redis);
  }
};
export const entityInfoUpdate = async (req: Request, res: Response) => {
  try {
    const service = new EntityInfoService({ token: req["token"] });
    let entity_id: number = req["entity_id"];
    let province: number = req.body.province;
    let city: number = req.body.city;
    let town: number = req.body.town;
    let street: number = req.body.street;
    let name: string = req.body.name;
    let descp: string = req.body.descp;
    let company_number: string = req.body.company_number;
    let role: number = req.body.role;
    let company_present_name: string = req.body.company_present_name;
    let company_present_id_number: string = req.body.company_present_id_number;
    let company_present_mobile: string = req.body.company_present_mobile;
    let company_id_pic: string = req.body.company_id_pic;
    let company_present_id_up_pic: string = req.body.company_present_id_up_pic;
    let company_present_id_down_pic: string =
      req.body.company_present_id_down_pic;
    let company_other_files: string = req.body.company_other_files;
    const data: entityInfoModel = {
      entity_id,
      province,
      city,
      town,
      street,
      name,
      descp,
      company_number,
      role,
      company_present_name,
      company_present_id_number,
      company_present_mobile,
      company_id_pic,
      company_present_id_up_pic,
      company_present_id_down_pic,
      company_other_files,
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

//获取个人企业认证资料详情
//协会获取企业信息
//服务商根据企业类型推送
//条件查询企业
export const entityInfoDetail = async (req: Request, res: Response) => {
  try {
    const service = new EntityInfoService({ token: req["token"] });
    let user_id: number = req.body.user_id;
    const result = await service.detail(user_id);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      not_found: () => http400Error(res, getLang("no_data")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "entityDetail");
  }
};

export const entityInfoDel = async (req: Request, res: Response) => {
   //console.log(req.body);
  try {
    const service = new EntityInfoService({ token: req["token"] });
    let entity_id: number = req["entity_id"];
    const result = await service.del(entity_id);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      not_found: () => http400Error(res, getLang("no_data")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "entityDetail");
  }
};
export const entityInfoList = async (req: Request, res: Response) => {
  try {
    const service = new EntityInfoService({ token: req["token"] });
    let user_id: number = req["entity_id"];
    const result = await service.listall(user_id);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      not_found: () => http400Error(res, getLang("no_data")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "entityList");
  }
};
export const entityInfoListPage = async (req: Request, res: Response) => {
  try {
    const service = new EntityInfoService({ token: req["token"] });
    let user_id: number = req["entity_id"];
    let currentPage = req.body.current_page;
    let pageSize = req.body.page_size;
    const result = await service.listPage(user_id, currentPage, pageSize);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      not_found: () => http400Error(res, getLang("no_data")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "entityList");
  }
};

export const entityInfoUpdateTag = async (req: Request, res: Response) => {
  try {
    const service = new EntityInfoService({ token: req["token"] });
    let entity_id: number = req["entity_id"];
    let tags: string = req.body.tags;
    const result = await service.updateTag(entity_id, tags);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "entityUpdateTag");
  }
};
export const entityInfoQueryTag = async (req: Request, res: Response) => {
  try {
    const service = new EntityInfoService({ token: req["token"] });
    let entity_id: number = req["entity_id"];
    const result = await service.queryTag(entity_id);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "entityQueryTag");
  }
};

export const entityInfoUpdatePersonalInfo = async (
  req: Request,
  res: Response
) => {
  try {
    const service = new EntityInfoService({ token: req["token"] });
    let entity_id: number = req["entity_id"];
    let logo: string = req.body.logo;
    let address: string = req.body.address;
    let team_photos: string = req.body.team_photos;
    let tags: string = req.body.tags;
    let name: string = req.body.name;
    let company_present_mobile: string = req.body.company_present_mobile;
    let descp: string = req.body.descp;
    let result = await service.updatePersonalInfo(
      entity_id,
      logo,
      address,
      team_photos,
      tags,
      name,
      company_present_mobile,
      descp
    );
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "entityInfoUpdatePersonalInfo");
  }
};

//获取热门企业
export const queryHotEntity=async (req:Request , res : Response)=>{
  try {
    const service = new EntityInfoService({ token: req["token"] });
    const page=req.body.page
    const page_size=req.body.page_size
    console.log(page,page_size)
    const result = await service.queryHotEntity(page,page_size);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      not_found: () => http400Error(res, getLang("no_data")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "entityDetail");
  }
}

export const queryEntityList=async (req: Request, res: Response) => {
  try {
    const service = new EntityInfoService({ token: req["token"] });
    const page=req.body.page
    const page_size=req.body.page_size
    const role=req.body.role
    const result = await service.queryEntityList(page,page_size,role);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      not_found: () => http400Error(res, getLang("no_data")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error: any) {
    return handleException(res, error, "entityDetail");
  }}
