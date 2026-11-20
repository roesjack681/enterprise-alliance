import { entityInfoModel } from "./proto";
import { rpcPost } from "../../common/common";
import { ResponseData, TokenData, rpcResult } from "../app/proto";
import { redisPool } from '../../storage/redisPool';
import { log } from "console";
import { logger } from "../../middles/logger";

export interface IEntityInfoService<TokenData> {
  supplementInfo(data: entityInfoModel): Promise<ResponseData>;
  update(data: entityInfoModel): Promise<ResponseData>;
  del(entityId: number): Promise<ResponseData>;
  detail(entityId: number): Promise<ResponseData>;
  listall(userId: number): Promise<ResponseData>;
  listPage(
    userId: number,
    currentPage: number,
    pageSize: number
  ): Promise<ResponseData>;
  review(entityId: number): Promise<ResponseData>;
}

// ======================== 企业认证信息服务相关 ========================

export class EntityInfoService implements IEntityInfoService<TokenData> {

    protected token: string;
    constructor(tokenData: TokenData) {
        this.token = tokenData.token;
    }

    /**
     * 协会审核企业认证资料
     */
    async review(entityId: number): Promise<ResponseData> {
        try {
            const sql = `UPDATE entities SET review_status = 1 WHERE id = ?;`;
            const params = [entityId];
            const res = <rpcResult>(
                await rpcPost("/update", { sql, params }, this.token)
            );
            return res.code === 0
                ? { msg: "ok", data: null }
                : { msg: "err", data: null };
        } catch (error) {
            return { msg: "server_error", data: null };
        }
    }

    async supplementInfo(data: entityInfoModel): Promise<ResponseData> {
        try {
            const fields = [
                "province",
                "city",
                "town",
                "street",
                "name",
                "descp",
                "company_number",
                "company_present_name",
                "company_present_id_number",
                "company_present_mobile",
                "company_id_pic",
                "company_present_id_up_pic",
                "company_present_id_down_pic",
                "company_other_files",
            ];
            const setClause = fields.map((field) => `${field} = ?`).join(", ");
            const sql = `UPDATE entity_detail_info SET ${setClause} WHERE entity_id = ?`;

            const params = fields
                .map((key) => (data as any)[key])
                .concat(data.entity_id); // 将 entity_id 作为最后一个参数用于 WHERE 条件

            const res = <rpcResult>(
                await rpcPost("/update", { sql, params }, this.token)
            );
            if (res.code === 0) {
                //更新entities表中地点名字
                const sql = `UPDATE entities SET province = ?,city = ?,town = ?,street = ? ,nickname = ? ,review_status=1 WHERE id = ?`;
                const params = [data.province,data.city,data.town,data.street,data.name,data.entity_id];
                const res = <rpcResult>(
                    await rpcPost("/update", { sql, params }, this.token)
                );
                console.log(res)
                if (res.code === 0) {
                    try {
                        if (data.descp) {
                            await rpcPost("/save-search", { words: data.descp, words_from: 1, words_type: 1, obj_id: data.entity_id }, this.token);
                        }
                    } catch (e) {}
                    return { msg: "ok", data: null };
                }else{
                    return { msg: "err", data: null };
                }
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            return { msg: "server_error", data: null };
        }
    }

    async update(data: entityInfoModel): Promise<ResponseData> {
        try {
            const fields = [
                "entity_id",
                "province",
                "city",
                "town",
                "street",
                "name",
                "descp",
                "company_number",
                "company_present_name",
                "company_present_id_number",
                "company_present_mobile",
                "company_id_pic",
                "company_present_id_up_pic",
                "company_present_id_down_pic",
                "company_other_files",
            ];
            const setClause = fields.map((field) => `${field} = ?`).join(", ");
            const sql = `UPDATE entity_detail_info SET ${setClause} WHERE entity_id = ?`;
            const params = fields
                .map((key) => (data as any)[key])
                .concat(data.entity_id);
            const res = <rpcResult>(
                await rpcPost("/update", { sql, params }, this.token)
            );
            if (res.code === 0) {
                try {
                    if ((data as any).descp) {
                        await rpcPost("/save-search", { words: (data as any).descp, words_from: 1, words_type: 1, obj_id: (data as any).entity_id }, this.token);
                    }
                } catch (e) {}
                return { msg: "ok", data: null };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            return { msg: "server_error", data: null };
        }
    }

    async del(entityId: number): Promise<ResponseData> {
        try {
            const sql = `UPDATE entity_detail_info SET status = 0 WHERE entity_id = ?`;
            const params = [entityId];
            const res = <rpcResult>(
                await rpcPost("/update", { sql, params }, this.token)
            );
            if (res.code === 0) {
                return { msg: "ok", data: null };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            return { msg: "server_error", data: null };
        }
    }

    //获取个人企业认证资料详情
    //协会获取企业信息
    //服务商根据企业类型推送
    //条件查询企业
    async detail(entityId: number): Promise<ResponseData> {
        let redis = await redisPool.acquire();
        try {
            const key = "entity_detail_info::" + entityId;
            const data = await redis.get(key);
            if (data != null) {
                return { msg: "ok", data: JSON.parse(data.toString()) };
            }
            const sql =
                "SELECT id,status,entity_id,province,city,town,street,name,descp,company_number,role,company_present_name,company_present_id_number,company_present_mobile,company_id_pic,company_present_id_up_pic,company_present_id_down_pic,company_other_files,create_time,logo,address,team_photos FROM entity_detail_info WHERE entity_id = ? LIMIT 1; ";
            const params = [entityId];

            const res = <rpcResult>(
                await rpcPost("/select", { sql, params }, this.token)
            );
            if (res.code === 0) {
                const data: entityInfoModel[] = JSON.parse(res.data.result);
                if (data.length === 0) {
                    return { msg: "not_found", data: null };
                }

                // logger.info("entity_detail_info::" + entityId, data[0]);
                const sql="select id,starts,follows,nice_comments,credits,tags from entity_tags_info where entity_id=?"
                const params=[entityId]
                const restagsinfo=<rpcResult>(await rpcPost("/select",{sql,params},this.token))
                if(restagsinfo.code===0){
                    data[0].tags=JSON.parse(restagsinfo.data.result)
                    try {
                        await redis.set(key, JSON.stringify(data[0]));
                        await redis.expire(key, 6);
                    } catch (redisError) {
                        // Redis 操作失败不影响主流程
                         //console.error("Redis operation failed:", redisError);
                    }
                    return { msg: "ok", data: data[0] };        
                }else{
                    return { msg: "err", data: null };
                }

            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            return { msg: "server_error", data: null };
        } finally {
            await redisPool.release(redis);
        }
    }

    async listall(userId: number): Promise<ResponseData> {
        try {
            const sql = `SELECT id,status,entity_id,province,city,town,street,name,descp,company_number,role,company_present_name,company_present_id_number,company_present_mobile,company_id_pic,company_present_id_up_pic,company_present_id_down_pic,company_other_files,create_time FROM entity_detail_info WHERE user_id = ? AND status = 1 ORDER BY id DESC;`;
            const params = [userId];
            const res = <rpcResult>(
                await rpcPost("/select", { sql, params }, this.token)
            );

            if (res.code === 0) {
                const data: entityInfoModel[] = JSON.parse(res.data.result);
                if (!Array.isArray(data) || data.length === 0) {
                    return { msg: "not_found", data: null };
                }
                return { msg: "ok", data: data };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            return { msg: "server_error", data: null };
        }
    }

    async listPage(
        userId: number,
        currentPage: number = 1,
        pageSize: number = 10
    ): Promise<ResponseData> {
        try {
            // 验证分页参数
            const validCurrentPage = Math.max(1, parseInt(currentPage?.toString() || '1'));
            const validPageSize = Math.max(1, Math.min(100, parseInt(pageSize?.toString() || '10')));
            const offset = (validCurrentPage - 1) * validPageSize;
            const sql = `SELECT id,status,entity_id,province,city,town,street,name,descp,company_number,role,company_present_name,company_present_id_number,company_present_mobile,company_id_pic,company_present_id_up_pic,company_present_id_down_pic,company_other_files,create_time FROM entity_detail_info WHERE user_id = ? AND status = 1 ORDER BY id DESC LIMIT ?,?;`;
            const params = [userId, offset, validPageSize];
            const res = <rpcResult>(
                await rpcPost("/select", { sql, params }, this.token)
            );
            if (res.code === 0) {
                const data: entityInfoModel[] = JSON.parse(res.data.result);
                if (!Array.isArray(data) || data.length === 0) {
                    return { msg: "not_found", data: null };
                }
                return { msg: "ok", data: data };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            return { msg: "server_error", data: null };
        }
    }

    async updateTag(entity_id: number, tags: string): Promise<ResponseData> {
        try {
            const sql = `UPDATE entity_tags_info SET tags = ? WHERE entity_id = ?`;
            const params = [tags, entity_id];
            const res = <rpcResult>(
                await rpcPost("/update", { sql, params }, this.token)
            );
            if (res.code === 0) {
                try {
                    if (tags) {
                        await rpcPost("/save-search", { words: tags, words_from: 2, words_type: 1, obj_id: entity_id }, this.token);
                    }
                } catch (e) {}
                return { msg: "ok", data: null };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            return { msg: "server_error", data: null };
        }
    }

    async queryTag(entity_id: number): Promise<ResponseData> {
        let redis = await redisPool.acquire();
        try {
            const key = "entity_tags_info::" + entity_id;
            const data = await redis.get(key);
            if (data != null) {
                return { msg: "ok", data: JSON.parse(data.toString()) };
            }
            const sql = `SELECT tags,credits,nice_comments,follows,starts,entity_id,id FROM entity_tags_info WHERE entity_id = ? LIMIT 1;`;
            const params = [entity_id];
            const res = <rpcResult>(
                await rpcPost("/select", { sql, params }, this.token)
            );
            if (res.code === 0) {
                const resultData = JSON.parse(res.data.result);
                try {
                    await redis.set(key, JSON.stringify(resultData[0]));
                    await redis.expire(key, 6 * 10);
                } catch (redisError) {
                    // Redis 操作失败不影响主流程
                     //console.error("Redis operation failed:", redisError);
                }
                return { msg: "ok", data: resultData };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            return { msg: "server_error", data: null };
        } finally {
            await redisPool.release(redis);
        }
    }

    async updatePersonalInfo(
        entity_id: number,
        logo: string,
        address: string,
        team_photos: string,
        tags: string,
        name: string,
        company_present_mobile: string,
        descp: string
    ): Promise<ResponseData> {
        try {
            const sql = `UPDATE entity_detail_info SET logo = ?,address = ?,team_photos = ?,name = ?,company_present_mobile = ?,descp = ? WHERE entity_id = ?`;
            const params = [
                logo,
                address,
                team_photos,
                name,
                company_present_mobile,
                descp,
                entity_id,
            ];
            const res = <rpcResult>(
                await rpcPost("/update", { sql, params }, this.token)
            );
            if (res.code === 0) {
                const sql = `UPDATE entity_tags_info SET tags = ? WHERE entity_id = ?`;
                const params = [tags, entity_id];
                const resTags = <rpcResult>(
                    await rpcPost("/update", { sql, params }, this.token)
                );
                if (resTags.code === 0) {
                    try {
                        if (descp) {
                            await rpcPost("/save-search", { words: descp, words_from: 1, words_type: 1, obj_id: entity_id }, this.token);
                        }
                        if (tags) {
                            await rpcPost("/save-search", { words: tags, words_from: 2, words_type: 1, obj_id: entity_id }, this.token);
                        }
                    } catch (e) {}
                    return { msg: "ok", data: null };
                }
                return { msg: "err", data: null };
            }
            return { msg: "err", data: null };
        } catch (error) {
            return { msg: "server_error", data: null };
        }
    }

    async queryHotEntity(page?: number, page_size?: number) {
        let redis = await redisPool.acquire();
        try {
            const key = "queryHotEntity::role" + (page !== undefined && page_size !== undefined ? `::${page}::${page_size}` : "");
            const data = await redis.get(key);
            if (data != null) {
                return { msg: "ok", data: JSON.parse(data.toString()) };
            }
            let sql = "SELECT id,status,entity_id,province,city,town,street,name,descp,logo,address,role FROM entity_detail_info WHERE is_hot=1";
            const params: (string|number)[] = [];
            if (page !== undefined && page_size !== undefined && page > 0 && page_size > 0) {
                const offset = Math.floor((page - 1) * page_size);
                const limit = Math.floor(page_size);
                sql += ` LIMIT ${offset}, ${limit}`;
            }
            //console.log('SQL:', sql, 'PARAMS:', params);
            const res = <rpcResult>(
                await rpcPost("/select", { sql, params }, this.token)
            );
            //console.log(res,"res")
            if (res.code === 0) {
                const data: entityInfoModel[] = JSON.parse(res.data.result);
                if (data.length === 0) {
                    return { msg: "not_found", data: null };
                }
                for(let i=0;i<data.length;i++){
                    const sql="select id,starts,follows,nice_comments,credits,tags from entity_tags_info where entity_id=?"
                    const params=[data[i].entity_id]
                    const restagsinfo=<rpcResult>(await rpcPost("/select",{sql,params},this.token))
                    if(restagsinfo.code===0){
                        data[i].tags=JSON.parse(restagsinfo.data.result)
                    }
                }
                try {
                    await redis.set(key, JSON.stringify(data));
                    await redis.expire(key, 6);
                } catch (redisError) {
                    // Redis 操作失败不影响主流程
                }
                return { msg: "ok", data: data };
    
            } else {
                // 返回详细错误信息
                return { msg: res.msg || "err", data: null };
            }
        } catch (error) {
            // 返回详细错误信息
            return { msg: error?.message || "server_error", data: null };
        } finally {
            await redisPool.release(redis);
        }
    }
    async queryEntityList(page?: number, page_size?: number, role?: number) {
        //let redis = await redisPool.acquire();
        try {
            //const key = "queryEntityInfo::role" + (page !== undefined && page_size !== undefined && role !== undefined ? `::${page}::${page_size}::${role}` : "");
            // const data = await redis.get(key);
            // if (data != null) {
            //     return { msg: "ok", data: JSON.parse(data.toString()) };
            // }
            let sql = "SELECT id,status,entity_id,province,city,town,street,name,descp,logo,address,role FROM entity_detail_info";
            const params: (string|number)[] = [];
            let whereAdded = false;
            if (role !== undefined) {
                sql += " WHERE role = ?";
                params.push(role);
                whereAdded = true;
            }
            if (page !== undefined && page_size !== undefined && page > 0 && page_size > 0) {
                const offset = Math.floor((page - 1) * page_size);
                const limit = Math.floor(page_size);
                sql += ` LIMIT ${offset}, ${limit}`;
            }
            const res = <rpcResult>(
                await rpcPost("/select", { sql, params }, this.token)
            ); 
            if (res.code === 0) {
                const data: entityInfoModel[] = JSON.parse(res.data.result);
                if (data.length === 0) {
                    return { msg: "not_found", data: null };
                }
                for(let i=0;i<data.length;i++){
                    const sql="select id,starts,follows,nice_comments,credits,tags from entity_tags_info where entity_id=?"
                    const params=[data[i].entity_id]
                    const restagsinfo=<rpcResult>(await rpcPost("/select",{sql,params},this.token))
                    if(restagsinfo.code===0){
                        data[i].tags=JSON.parse(restagsinfo.data.result)
                    }
                }
                // try {
                //     await redis.set(key, JSON.stringify(data));
                //     await redis.expire(key, 6);
                // } catch (redisError) {
                //     // Redis 操作失败不影响主流程
                // }
                return { msg: "ok", data: data };
            } else {
                return { msg: res.msg || "err", data: null };
            }
        } catch (error) {
            return { msg: error?.message || "server_error", data: null };
        } 
    }
}
