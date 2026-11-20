import { AssociationEntity, EntityModel, loginSaltResult, AssociationStatistics } from "./proto";
import { ResponseData, TokenData, rpcResult } from "../app/proto";
import { rpcPost, md5Encode, decodeJWT } from "../../common/common";
import { redisPool } from '../../storage/redisPool';
import { generateSalt, generateUsername, Decrypt } from "../../common/aes256Encryption";
import { smsService } from "../../common/smsService";
import { AuditService } from "../audit/service";

export interface IEntityService<TokenData> {
  login(username: string, pwd: string): Promise<ResponseData>;
  refreshToken(): Promise<ResponseData>;
  changePassword(
    userId: number,
    oldPwd: string,
    newPwd: string
  ): Promise<ResponseData>;
  resetPassword(username: string, newPwd: string): Promise<ResponseData>;
  sendEmailCode(email: string): Promise<ResponseData>;
  sendSmsCode(phone: string): Promise<ResponseData>;
  add(data: AssociationEntity): Promise<ResponseData>;
  update(data: EntityModel): Promise<ResponseData>;
  detail(id: number): Promise<ResponseData>;
  listall(userId: number): Promise<ResponseData>;
  listPage(
    userId: number,
    currentPage: number,
    pageSize: number
  ): Promise<ResponseData>;
  associationTest(): Promise<ResponseData>;
  search(
    words: string,
    current_page: number,
    page_size: number
  ): Promise<ResponseData>;
  getAssociationStatistics(associationId: number): Promise<ResponseData>;
}

// ======================== 企业服务相关 ========================

export class EntityService implements IEntityService<TokenData> {
    protected token: string;
    constructor(tokenData: TokenData) {
        this.token = tokenData.token;
    }

    /**
     * 企业登录
     */
    async login(username: string, pwd: string): Promise<ResponseData> {
        try {
            // 验证输入参数
            if (!username || !pwd) {
                return { msg: "login_failed", data: { message: "用户名和密码不能为空" } };
            }

            const saltSql ="SELECT id,role,password,salt,status FROM entities WHERE username = ?";
            const saltRes = <rpcResult>(
                await rpcPost("/select", { sql: saltSql, params: [username] })
            );
            if (saltRes.code !== 0 || !saltRes.data || saltRes.data.result=='null') {
                return { msg: "user_not_found", data: null };
            }
            
            const saltData = <loginSaltResult>JSON.parse(saltRes.data.result);
            const saltDatainfo = JSON.parse(saltRes.data.result);
            
            // 检查用户状态
            if (saltDatainfo[0].status == 0) {
                return { msg: "user_disabled", data: { message: "用户已被禁用" } };
            }
            
            if (saltDatainfo[0].status == 2) {
                return { msg: "user_locked", data: { message: "用户已被锁定" } };
            }
            
            const salt = saltData[0].salt || "";
            const oldPwd = saltData[0].password;
            // 将密码和salt拼接
            let password = await md5Encode(pwd + salt);
            if (password === oldPwd) {
                const rtn = await rpcPost("/auth/role-sign-in", {
                    role: saltData[0].role,
                    id: saltData[0].id,
                });
                if (rtn.code === 0) {
                    await rpcPost(
                        "/update",
                        {
                            sql: "UPDATE entities SET last_login_time = ? WHERE id = ?",
                            params: [+Date.now() / 1000, saltData[0].id],
                        },
                        rtn.data.token
                    );
                }
                return { msg: "ok", data: rtn.data };
            } else {
                return { msg: "password_error", data: { message: "密码错误" } };
            }
        } catch (error: any) {
            console.error('Login error:', error);
            return { msg: "server_error", data: null };
        }
    }

    async refreshToken(): Promise<ResponseData> {
        try {
            if (!this.token) {
                return { msg: "unauthorized", data: { message: "Token无效" } };
            }

            const result = <rpcResult>(
                await rpcPost("/auth/refresh-token", { token: this.token }, this.token)
            );
            
            if (result.code === 0) {
                return { msg: "ok", data: result.data };
            } else {
                return { msg: "token_refresh_failed", data: { message: "Token刷新失败" } };
            }
        } catch (error: any) {
            console.error('Refresh token error:', error);
            return { msg: "server_error", data: null };
        }
    }

    //修改密码
    async changePassword(
        userId: number,
        oldPwd: string,
        newPwd: string
    ): Promise<ResponseData> {
        try {
            // 验证输入参数
            if (!oldPwd || !newPwd) {
                return { msg: "password_error", data: { message: "旧密码和新密码不能为空" } };
            }

            if (newPwd.length < 6) {
                return { msg: "password_too_short", data: { message: "新密码长度至少6位" } };
            }

            //先查数据库slat  ，pwd+salt
            const saltSql = "SELECT password,salt FROM entities WHERE id = ?";
            const saltRes = <rpcResult>(
                await rpcPost("/select", { sql: saltSql, params: [userId] }, this.token)
            );
            
            if (saltRes.code !== 0 || !saltRes.data || saltRes.data.result == 'null') {
                return { msg: "user_not_found", data: { message: "用户不存在" } };
            }
            
            const saltData = JSON.parse(saltRes.data.result);
            const salt = saltData[0].salt || "";
            //将密码和salt拼接
            let oldPassword = await md5Encode(oldPwd + salt);
            let newPassword = await md5Encode(newPwd + salt);
            
            if (oldPassword == saltData[0].password) {
                const sql = "UPDATE entities SET password = ? WHERE id = ?";
                const params = [newPassword, userId];
                const result = await rpcPost("/update", { sql, params }, this.token);
                
                if (result.code === 0) {
                    return { msg: "ok", data: null };
                } else {
                    return { msg: "update_failed", data: { message: "密码更新失败" } };
                }
            } else {
                return { msg: "password_error", data: { message: "旧密码错误" } };
            }
        } catch (error: any) {
            console.error('Change password error:', error);
            return { msg: "server_error", data: null };
        }
    }

    //用户忘记密码,找回密码
    async resetPassword(username: string, newPwd: string): Promise<ResponseData> {
        try {
            this.token="c08b2769121429cbbad37321995a663e"; //只用在注册时使用。其他地方勿用
            if (!username || !newPwd) {
                return { msg: "password_error", data: { message: "用户名和新密码不能为空" } };
            }
            if (newPwd.length < 6) {
                return { msg: "password_too_short", data: { message: "新密码长度至少6位" } };
            }

            const saltSql = "SELECT salt FROM entities WHERE username = ?;";
            const saltRes = <rpcResult>(
                await rpcPost("/select", { sql: saltSql, params: [username] })
            );
            if (saltRes.code !== 0 || !saltRes.data || !saltRes.data.result || saltRes.data.result === 'null') {
                return { msg: "user_not_found", data: { message: "用户不存在" } };
            }
            const saltData = JSON.parse(saltRes.data.result);
            if (!saltData || saltData.length === 0) {
                return { msg: "user_not_found", data: { message: "用户不存在" } };
            }
            const salt = saltData[0].salt || "";
            let newPassword = await md5Encode(newPwd + salt);
            const sql = "UPDATE entities SET password = ? WHERE  username = ?;";
            const params = [newPassword, String(username)];
            const result = await rpcPost("/update", { sql, params }, this.token);
            
            if (result.code === 0) {
                return { msg: "ok", data: null };
            } else {
                return { msg: "update_failed", data: { message: "密码重置失败", detail: result } };
            }
        } catch (error: any) {
            console.error('Reset password error:', error);
            return { msg: "server_error", data: null };
        }
    }

    //发送邮箱验证码
    async sendEmailCode(email: string): Promise<ResponseData> {
        try {
            return { msg: "err", data: null };
        } catch (error: any) {
            return { msg: "server_error", data: null };
        }
    }
    //发送手机验证码
    async sendSmsCode(phone: string): Promise<ResponseData> {
        try {
            // 验证手机号格式
            if (!phone || phone.length !== 11) {
                return { msg: "sms_phone_invalid", data: { message: "手机号格式不正确" } };
            }

            const result = await smsService.sendVerificationCode(phone);
            if (result.success) {
                return { msg: "ok", data: { message: result.message } };
            } else {
                return { msg: "sms_send_failed", data: { message: result.message } };
            }
        } catch (error: any) {
            console.error('Send SMS error:', error);
            return { msg: "server_error", data: null };
        }
    }


    //企业短信注册
    async add(data: AssociationEntity & { smsCode?: string }): Promise<ResponseData> {
        try {
            this.token="c08b2769121429cbbad37321995a663e"; //只用在注册时使用。其他地方勿用
            // 验证短信验证码
            if (!data.smsCode) {
                return { msg: "sms_code_required", data: null };
            }

            const verifyResult = await smsService.verifyCode(data.mobile, data.smsCode);
            
            if (!verifyResult.success) {
                return { msg: "sms_code_invalid", data: { message: verifyResult.message } };
            }

            // 检查用户是否已存在
            const checkSql = "SELECT id FROM entities WHERE username = ? OR mobile = ? LIMIT 1";
            const checkParams = [data.username, data.mobile];
            const checkRes = <rpcResult>(
                await rpcPost("/select", { sql: checkSql, params: checkParams }, this.token)
            );
            
            if (checkRes.code === 0 && checkRes.data.result !== 'null' && JSON.parse(checkRes.data.result).length > 0) {
                return { msg: "user_exists", data: null };
            }

            // 处理推荐人加密值
            let referrerId: number | null = null;
            if (data.referrer) {
                try {
                    // 解密推荐人信息
                    const decryptedReferrer = Decrypt(data.referrer);
                    const referrerData = JSON.parse(decryptedReferrer);
                    
                    if (referrerData.id && referrerData.username) {
                        // 验证推荐人是否存在
                        const referrerCheckSql = "SELECT id FROM entities WHERE id = ? AND username = ? LIMIT 1";
                        const referrerCheckParams = [referrerData.id, referrerData.username];
                        const referrerCheckRes = <rpcResult>(
                            await rpcPost("/select", { sql: referrerCheckSql, params: referrerCheckParams }, this.token)
                        );
                        
                        if (referrerCheckRes.code === 0 && referrerCheckRes.data.result !== 'null' && JSON.parse(referrerCheckRes.data.result).length > 0) {
                            referrerId = referrerData.id;
                        }
                    }
                } catch (error) {
                    console.error('Failed to decrypt referrer data:', error);
                    // 解密失败不影响注册流程，继续执行
                }
            }

            // 生成盐值并加密密码
            data.salt = generateSalt();
            const encryptedPassword = await md5Encode(data.password + data.salt);
            
            // 构建插入参数，包含推荐人ID
            const insertParams = [data.username, encryptedPassword, data.mobile, data.salt, data.role_type];
            let sql = "INSERT INTO entities (username, password, mobile, salt, role";
            let placeholders = "VALUES (?, ?, ?, ?, ?";
            
            // 如果有推荐人ID，添加到插入语句中
            if (referrerId !== null) {
                sql += ", pid";
                placeholders += ", ?";
                insertParams.push(referrerId);
            }else{
                //没有推荐人模块pid=1
                sql += ", pid";
                placeholders += ", 1";
            }
            //create_time
            sql += ", create_time";
            placeholders += ", ?";
            insertParams.push( Math.floor(+new Date() / 1000));
            sql += ") " + placeholders + ")";
            
            const res = <rpcResult>(
                await rpcPost("/insert", { sql, params: insertParams }, this.token)
            );
            // return
            if (res.code === 0) {
                const entityId = res.data.lastId;
                //更新path
                await this.updatePath(entityId,referrerId||1);
                // 创建用户标签信息
                const tagSql = "INSERT INTO entity_tags_info(entity_id, starts) VALUES(?, 5)";
                const tagParams = [entityId];
                await rpcPost("/insert", { sql: tagSql, params: tagParams }, this.token);
                
                // 在 entity_detail_info 表中插入基本信息
                const detailSql = "INSERT INTO entity_detail_info (entity_id, company_present_mobile,role,create_time) VALUES (?, ?,?,?)";
                const detailParams = [entityId, data.mobile,data.role_type, Math.floor(+new Date() / 1000)];
                await rpcPost("/insert", { sql: detailSql, params: detailParams }, this.token);
                
                return { msg: "ok", data: {"新用户id":entityId} };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error: any) {
            return { msg: "server_error", data: null };
        }
    }

    private generateUpdateSQL(tableName: string,data: Record<string, any>,idField: string = "id"): {sql: string;params: any[];} | null {
        const keys = Object.keys(data).filter((key) => key !== idField && data[key] !== undefined && data[key] !== null);
        if (keys.length === 0) return null;
        const setClause = keys.map((k) => `${k} = ?`).join(", ");
        const params = keys.map((k) => data[k]).concat(data[idField]);
        const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${idField} = ?`;
        return { sql, params };
    }
    async updateOne(data: EntityModel): Promise<ResponseData> {
        try {
            const updateSQL = this.generateUpdateSQL("entities", data, "id");
            if (!updateSQL) {
                return { msg: "err", data: null };
            }
            const res = <rpcResult>await rpcPost("/update", updateSQL, this.token);
            if (res.code === 0) {
                //从此次更新中找出id,nikename,avatar,role
                const userData = {
                    id: data.id,
                    nickname: data.nickname,
                    avatar: data.avatar,
                    role: data.role
                };
                //更新数据库缓存
                const userKey = `user:${data.id}:info`;
                const redis1 = await redisPool.acquire();
                await redis1.set(userKey, JSON.stringify(userData));
                await redis1.expire(userKey, 3600);
                await redisPool.release(redis1);
                return { msg: "ok", data: null };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error: any) {
            return { msg: "server_error", data: null };
        }
    }

    async update(data: EntityModel): Promise<ResponseData> {
        try {
            const fields = [
                "status",
                "username",
                "password",
                "email",
                "salt",
                "openid",
                "nickname",
                "role",
                "province",
                "city",
                "town",
                "street",
                "create_time",
                "last_login_time",
            ];
            const updateFields = fields.filter(
                (key) => (data as any)[key] !== undefined && (data as any)[key] !== null
            );
            if (updateFields.length === 0) {
                return { msg: "err", data: null };
            }
            const setClause = updateFields.map((field) => `${field} = ?`).join(", ");
            const sql = `UPDATE entities SET ${setClause} WHERE id = ?`;
            const params = updateFields
                .map((key) => (data as any)[key])
                .concat(data.id);
            const res = <rpcResult>(
                await rpcPost("/update", { sql, params }, this.token)
            );
            if (res && res.code === 0) {
                return { msg: "ok", data: null };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error: any) {
            return { msg: "server_error", data: null };
        }
    }

    async detail(id: number): Promise<ResponseData> {
        try {
            const sql =
                "SELECT id,review_status,pid,username,email,mobile,openid,nickname,avatar,role,province,city,town,street,remark FROM entities WHERE id = ? ";
            const params = [id];
            const res = <rpcResult>(
                await rpcPost("/select", { sql, params }, this.token)
            );
            if (res?.code === 0) {
                const data: EntityModel[] = JSON.parse(res.data.result);
                if (data.length === 0) {
                    return { msg: "not_found", data: null };
                }
                const sql = `SELECT tags FROM entity_tags_info WHERE entity_id = ?`;
                const tagsRes = <rpcResult>(
                    await rpcPost("/select", { sql, params: [id] }, this.token)
                );
                const tags = JSON.parse(tagsRes.data.result)[0].tags;
                data[0].tags = JSON.parse(tags);
                return {
                    msg: "ok",
                    data: data[0],
                };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error: any) {
            return { msg: "server_error", data: null };
        }
    }

    async listall(userId: number): Promise<ResponseData> {
        try {
            const sql = `SELECT id,status,username,email,salt,openid,nickname,avatar,role,province,city,town,street,create_time,last_login_time FROM entities WHERE user_id = ? AND status = 1 ORDER BY id DESC;`;
            const params = [userId];
            const res = <rpcResult>(
                await rpcPost("/select", { sql, params }, this.token)
            );
            if (res.code === 0) {
                const data: EntityModel[] = JSON.parse(res.data.result);
                if (data.length === 0) {
                    return { msg: "not_found", data: null };
                }
                return { msg: "ok", data: data };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error: any) {
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
            const sql = `SELECT id,status,username,email,salt,openid,nickname,avatar,role,province,city,town,street,create_time,last_login_time FROM entities WHERE user_id = ? AND status = 1 ORDER BY id DESC LIMIT ?,?;`;
            const params = [userId, offset, validPageSize];
            const res = <rpcResult>(
                await rpcPost("/select", { sql, params }, this.token)
            );
            if (res.code === 0) {
                const data: EntityModel[] = JSON.parse(res.data.result);
                if (data.length === 0) {
                    return { msg: "not_found", data: null };
                }
                return { msg: "ok", data: data };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error: any) {
            return { msg: "server_error", data: null };
        }
    }
    async associationTest(): Promise<ResponseData> {
        try {
        } catch (error: any) {
            return { msg: "server_error", data: null };
        }
    }
    async search(words: string, current_page: number, page_size: number) {
        try {
            // 调用搜索服务获取搜索结果
            const searchResult = await rpcPost("/search", { 
                words: words, 
                current_page: current_page, 
                page_size: page_size 
            }, this.token);
            //console.log(searchResult.data.result)
            // 检查搜索结果是否为空
            if (!searchResult.data || !searchResult.data.result || searchResult.data.result === null) {
                return { msg: "not_found", data: null };
            }

            // 搜索结果已经是解析好的数组对象
            const searchData = searchResult.data.result;
            if (!Array.isArray(searchData) || searchData.length === 0) {
                return { msg: "not_found", data: null };
            }

            // 处理搜索结果，根据 words_from, words_type, obj_id 查询详细信息
            const enrichedResults = [];

            for (const item of searchData) {
                const { words_from, words_type, obj_id } = item;
                let detailData = null;

                try {
                    // 根据 words_type 查询不同类型的数据
                    switch (words_type) {
                        case 1: // 实体 (entities)
                            detailData = await this.getEntityDetail(obj_id, words_from);
                            break;
                        case 2: // 产品 (products)
                            detailData = await this.getProductDetail(obj_id, words_from);
                            break;
                        case 3: // 新闻/文章 (news/articles)
                            detailData = await this.getArticleDetail(obj_id, words_from);
                            break;
                        default:
                            console.warn(`Unknown words_type: ${words_type}`);
                            continue;
                    }

                    if (detailData) {
                        enrichedResults.push({
                            ...item,
                            detail: detailData,
                            type_name: this.getTypeName(words_type),
                            source_name: this.getSourceName(words_from)
                        });
                    }
                } catch (detailError) {
                    console.error(`Error fetching detail for obj_id ${obj_id}:`, detailError);
                    // 即使获取详情失败，也保留基本搜索结果
                    enrichedResults.push({
                        ...item,
                        detail: null,
                        type_name: this.getTypeName(words_type),
                        source_name: this.getSourceName(words_from)
                    });
                }
            }

            return { 
                msg: "ok", 
                data: {
                    results: enrichedResults,
                    total: searchResult.data.total || enrichedResults.length,
                    current_page: current_page,
                    page_size: page_size
                }
            };
        } catch (error: any) {
            console.error('Search error:', error);
            return { msg: "server_error", data: null };
        }
    }

    // 获取实体详细信息
    private async getEntityDetail(entityId: number, wordsFrom: number): Promise<any> {
        const sql = "SELECT id, username, nickname, avatar, role, province, city, town, street FROM entities WHERE id = ? AND status = 1";
        const result = await rpcPost("/select", { sql, params: [entityId] }, this.token);
        
        if (result.code === 0 && result.data.result !== 'null') {
            const entityData = JSON.parse(result.data.result);
            if (entityData.length > 0) {
                const entity = entityData[0];
                
                // 单独查询企业详细信息
                const detailSql = "SELECT name as company_name, descp as description FROM entity_detail_info WHERE entity_id = ?";
                const detailResult = await rpcPost("/select", { sql: detailSql, params: [entityId] }, this.token);
                
                if (detailResult.code === 0 && detailResult.data.result !== 'null') {
                    const detailData = JSON.parse(detailResult.data.result);
                    if (detailData.length > 0) {
                        entity.company_name = detailData[0].company_name;
                        entity.description = detailData[0].description;
                    }
                }
                
                return {
                    ...entity,
                    entity_type: 'entity'
                };
            }
        }
        return null;
    }

    // 获取产品详细信息
    private async getProductDetail(productId: number, wordsFrom: number): Promise<any> {
        const sql = "SELECT id, title, description, price, unit, images, tags, entity_id, category_id, sub_category_id, status FROM service_products WHERE id = ? AND status = 2";
        const result = await rpcPost("/select", { sql, params: [productId] }, this.token);
        
        if (result.code === 0 && result.data.result !== 'null') {
            const productData = JSON.parse(result.data.result);
            if (productData.length > 0) {
                const product = productData[0];
                
                // 单独查询提供商信息
                const providerSql = "SELECT username as provider_name, nickname as provider_nickname FROM entities WHERE id = ?";
                const providerResult = await rpcPost("/select", { sql: providerSql, params: [product.entity_id] }, this.token);
                
                if (providerResult.code === 0 && providerResult.data.result !== 'null') {
                    const providerData = JSON.parse(providerResult.data.result);
                    if (providerData.length > 0) {
                        product.provider_name = providerData[0].provider_name;
                        product.provider_nickname = providerData[0].provider_nickname;
                    }
                }
                
                return {
                    ...product,
                    entity_type: 'product'
                };
            }
        }
        return null;
    }
    // 获取文章详细信息
    private async getArticleDetail(articleId: number, wordsFrom: number): Promise<any> {
        const sql = "SELECT id, title, content, summary, cover_image, tags, enterprise_id, category_id, author, view_count FROM enterprise_articles WHERE id = ? AND status = 1 AND is_published = 1";
        const result = await rpcPost("/select", { sql, params: [articleId] }, this.token);
        
        if (result.code === 0 && result.data.result !== 'null') {
            const articleData = JSON.parse(result.data.result);
            if (articleData.length > 0) {
                const article = articleData[0];
                
                // 单独查询发布者信息
                const publisherSql = "SELECT username as publisher_name, nickname FROM entities WHERE id = ?";
                const publisherResult = await rpcPost("/select", { sql: publisherSql, params: [article.enterprise_id] }, this.token);
                
                if (publisherResult.code === 0 && publisherResult.data.result !== 'null') {
                    const publisherData = JSON.parse(publisherResult.data.result);
                    if (publisherData.length > 0) {
                        article.publisher_name = publisherData[0].publisher_name;
                        // 注意：原来的SQL有错误，nickname重复赋值给publisher_name，这里修正
                        article.publisher_nickname = publisherData[0].nickname;
                    }
                }
                
                return {
                    ...article,
                    entity_type: 'article'
                };
            }
        }
        return null;
    }

    // 获取类型名称
    private getTypeName(wordsType: number): string {
        switch (wordsType) {
            case 1: return '实体';
            case 2: return '产品';
            case 3: return '新闻';
            default: return '未知';
        }
    }

    // 获取来源名称
    private getSourceName(wordsFrom: number): string {
        switch (wordsFrom) {
            case 1: return '描述';
            case 2: return '标签';
            case 3: return '分类';
            default: return '未知';
        }
    }
    //手动更新path关系,先从数据库查询父级path,然后更新path
    async updatePath(entity_id: number, pid: number): Promise<ResponseData> {
        try {
            const sql = "SELECT path FROM entities WHERE id = ?";
            const params = [pid];
            const res = <rpcResult>(
                await rpcPost("/select", { sql, params }, this.token)
            );
            if (res.code === 0) {
                const path = JSON.parse(res.data.result)[0].path;
                const sql = "UPDATE entities SET path = ? WHERE id = ?";
                const params = [path+","+entity_id, entity_id];
                const res2 = <rpcResult>(
                    await rpcPost("/update", { sql, params }, this.token)
                );
                
                if (res2.code === 0) {
                    //更新关系,直接将path reppost到这个方法 /transaction/make-relation
                    const rtn=await rpcPost("/transaction/make-relation", { path: path+","+entity_id }, this.token); 
                    console.log(rtn,111)
                    return { msg: "ok", data: null };
                } else {
                    return { msg: "err", data: null };
                }
               
            } else {
                return { msg: "err", data: null };
            }
        } catch (error: any) {
            return { msg: "server_error", data: null };
        }
    }
    //协会添加企业
    async addEntity(data: AssociationEntity): Promise<ResponseData> {
        try {

            // data.username = generateUsername(Number(data.salt), Number(data.mobile));
            //首先查询是否有此用户
            const sql = "SELECT id, username, status FROM entities WHERE username = ? LIMIT 1";
            const params = [data.username];
            const res = <rpcResult>(
                await rpcPost("/select", { sql, params }, this.token)
            );
            if (res.data.result.length===0||res.data.result==='null') {
            const params = data;
            data.salt = generateSalt();
            const res = <rpcResult>(
                await rpcPost("/transaction/add-entity", params, this.token)
            );
            const userid = res.data.lastId;
            if (res.code === 0) {
                //更新path
                await this.updatePath(userid,data.pid);
                //更新标签星级等
                const sql = "insert into entity_tags_info(entity_id,starts) values(?,5)";
                const params = [userid];
                await rpcPost("/insert", { sql, params }, this.token)

                return { msg: "ok", data: null };
            } else {
                return { msg: "err", data: null };
            }
            }else{
                return { msg: "user_exists", data: null };
            }
           
        } catch (error: any) {
            return { msg: "server_error", data: null };
        }
    }

    async queryEntityList(
        entity_id: number,
        role: number
    ): Promise<ResponseData> {
        let redis = await redisPool.acquire();
        try {
            // 验证输入参数
            if (!entity_id || entity_id <= 0) {
                return { msg: "query_enterprise_failed", data: { message: "企业ID无效" } };
            }

            if (!role || role < 0) {
                return { msg: "invalid_role", data: { message: "角色类型无效" } };
            }
            //去掉redis缓存，这里可能随时有更新，必须从数据库拿数据。
            // const key = "query_entity_list" + entity_id+role;
            // const data = await redis.get(key);
            // if (data) {
            //     return { msg: "ok", data: JSON.parse(data.toString()) };
            // }
            
            const entitiesSql = `SELECT id,review_status,mobile,email,avatar,nickname,province,city,district,town,street,create_time FROM entities WHERE pid = ? AND role = ?`;
            const entitiesParams = [entity_id, role];
            const entitiesRes = <rpcResult>(
                await rpcPost(
                    "/select",
                    { sql: entitiesSql, params: entitiesParams },
                    this.token
                )
            );
            //console.log(entitiesSql,entitiesParams)
            if (entitiesRes && entitiesRes.code === 0) {
                const entitiesData: AssociationEntity[] = JSON.parse(
                    entitiesRes.data.result
                );

                if (!Array.isArray(entitiesData) || entitiesData.length === 0) {
                    return { msg: "no_enterprise_found", data: { message: "未找到企业信息" } };
                }

                for (let i = 0; i < entitiesData.length; i++) {
                    const entityId = entitiesData[i].id;
                    const detailSql = `SELECT id as info_id, name FROM entity_detail_info WHERE entity_id = ? limit 1`;
                    const detailParams = [entityId];
                    const detailRes = <rpcResult>(
                        await rpcPost(
                            "/select",
                            { sql: detailSql, params: detailParams },
                            this.token
                        )
                    );

                    if (detailRes && detailRes.code === 0) {
                        const detailData = JSON.parse(detailRes.data.result);
                        if (Array.isArray(detailData) && detailData.length > 0) {
                            entitiesData[i].info_id = detailData[0].info_id;
                            entitiesData[i].name = detailData[0].name;
                        }
                    }
                }
                // await redis.expire(key, 20);
                // await redis.set(key, JSON.stringify(entitiesData));
                return { msg: "ok", data: entitiesData };
            } else {
                return { msg: "query_enterprise_failed", data: { message: "查询企业列表失败" } };
            }
        } catch (error: any) {
            console.error('Query entity list error:', error);
            return { msg: "server_error", data: null };
        } finally {
            await redisPool.release(redis);
        }
    }

    //查询前N条企业
    async queryEnterpriseListNum(
        entity_id: string,
        role: string,
        page: string
    ): Promise<ResponseData> {
        try {
            //倒序查询
            const limit = Number(page); // page 必须是数字
            const entitiesSql = `SELECT id,review_status,mobile,email,avatar,nickname,province,city,district,town,street,create_time FROM entities WHERE pid = ? AND role = ? ORDER BY id DESC LIMIT ${limit}`;
            const entitiesParams = [entity_id, role];
            const entitiesRes = <rpcResult>(
                await rpcPost(
                    "/select",
                    { sql: entitiesSql, params: entitiesParams },
                    this.token
                )
            );

            if (entitiesRes && entitiesRes.code === 0) {
                const entitiesData: (AssociationEntity & { name?: string })[] = JSON.parse(entitiesRes.data.result);
                if (entitiesData.length === 0) {
                    return { msg: "not_found", data: null };
                }
                const limitedData = entitiesData;
                for (let i = 0; i < limitedData.length; i++) {
                    const entityId = limitedData[i].id;
                    const detailSql = `SELECT id as info_id, name FROM entity_detail_info WHERE entity_id = ? limit 1`;
                    const detailParams = [entityId];
                    const detailRes = <rpcResult>(
                        await rpcPost(
                            "/select",
                            { sql: detailSql, params: detailParams },
                            this.token
                        )
                    );
                    if (detailRes && detailRes.code === 0) {
                        const detailData = JSON.parse(detailRes.data.result);
                        if (Array.isArray(detailData) && detailData.length > 0) {
                            limitedData[i].info_id = detailData[0].info_id;
                            limitedData[i].name = detailData[0].name;
                        }
                    }
                }
                return { msg: "ok", data: limitedData };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error: any) {
            return { msg: "server_error", data: null };
        }
    }

    async review(
        id: number,
        review_status: number,
        remark: string
    ): Promise<ResponseData> {
        try {
            // 验证输入参数
            if (!id || id <= 0) {
                return { msg: "enterprise_not_found", data: { message: "企业ID无效" } };
            }

            if (review_status !== 1 && review_status !== 2) {
                return { msg: "invalid_review_status", data: { message: "审核状态无效" } };
            }

            // 检查企业是否存在
            const checkSql = "SELECT id, review_status FROM entities WHERE id = ?";
            const checkRes = <rpcResult>(
                await rpcPost("/select", { sql: checkSql, params: [id] }, this.token)
            );

            if (checkRes.code !== 0 || !checkRes.data || checkRes.data.result == 'null') {
                return { msg: "enterprise_not_found", data: { message: "企业不存在" } };
            }

            const enterpriseData = JSON.parse(checkRes.data.result);
            if (enterpriseData.length === 0) {
                return { msg: "enterprise_not_found", data: { message: "企业不存在" } };
            }

            // 检查是否已经审核过
            // if (enterpriseData[0].review_status !== 0) {
            //     return { msg: "already_reviewed", data: { message: "该企业已审核" } };
            // }

            const result = await rpcPost(
                "/transaction/review-entity",
                { id, review_status, remark },
                this.token
            );
            
            if (result.code == 0) {
                // 审核成功后，添加审核记录
                try {
                    const auditService = new AuditService(this.token);
                    const userInfo = await decodeJWT(this.token);
                    
                    // 获取企业名称
                    const nameSql = "SELECT name FROM entity_detail_info WHERE entity_id = ? LIMIT 1";
                    const nameRes = <rpcResult>(
                        await rpcPost("/select", { sql: nameSql, params: [id] }, this.token)
                    );
                    let entityName = '';
                    if (nameRes.code === 0 && nameRes.data.result !== 'null') {
                        const nameData = JSON.parse(nameRes.data.result);
                        if (nameData.length > 0) {
                            entityName = nameData[0].name || '';
                        }
                    }
                    
                    await auditService.createAuditRecord({
                        audit_type: 1,  // 企业认证
                        related_id: id,
                        entity_id: id,
                        entity_name: entityName,
                        title: `企业认证审核${review_status === 1 ? '通过' : '拒绝'}`,
                        content: `企业"${entityName}"的认证审核${review_status === 1 ? '通过' : '拒绝'}`,
                        auditor_id: userInfo?.id,
                        auditor_name: entityName,
                        status: review_status === 1 ? 2 : 3,
                        remark: remark
                    });
                } catch (auditError) {
                    console.error('添加审核记录失败:', auditError);
                    // 不影响主流程
                }
                
                return { msg: "ok", data: result.data };
            } else {
                return { msg: "review_failed", data: { message: "审核失败" } };
            }
        } catch (error: any) {
            console.error('Review enterprise error:', error);
            return { msg: "server_error", data: null };
        }
    }

    async queryEnterpriseDetail(entity_id: number): Promise<ResponseData> {
        try {
            // 验证输入参数
            if (!entity_id || entity_id <= 0) {
                return { msg: "enterprise_not_found", data: { message: "企业ID无效" } };
            }

            const entitiesSql = `SELECT id,status,entity_id,province,city,district,town,street,name,descp,company_number,role,company_present_name,company_present_id_number,company_present_mobile,company_id_pic,company_present_id_up_pic,company_present_id_down_pic,company_other_files,create_time FROM entity_detail_info WHERE entity_id = ?`;
            const entitiesParams = [entity_id];
            const entitiesRes = <rpcResult>(
                await rpcPost(
                    "/select",
                    { sql: entitiesSql, params: entitiesParams },
                    this.token
                )
            );
            
            if (entitiesRes.code !== 0) {
                return { msg: "get_enterprise_detail_failed", data: { message: "获取企业详情失败" } };
            }
           
            if (entitiesRes.data.result == "null" || entitiesRes.data.result == "[]") {
                return { msg: "enterprise_not_found", data: { message: "企业不存在" } };
            }
            
            return { msg: "ok", data: JSON.parse(entitiesRes.data.result) };
        } catch (error: any) {
            console.error('Query enterprise detail error:', error);
            return { msg: "server_error", data: null };
        }
    }

    async queryType() {
        let redis = await redisPool.acquire();
        try {
            const key = "query_type";
            const data = await redis.get(key);
            if (data) {
                return { msg: "ok", data: JSON.parse(data.toString()) };
            }
            
            const sql = `select id,name,icon,sort,pid,status,remark from category`;
            const params = [];
            const res = <rpcResult>(
                await rpcPost("/select", { params, sql }, this.token)
            );
            
            if (res.code !== 0) {
                return { msg: "query_type_failed", data: { message: "查询类型失败" } };
            }
            
            const result = JSON.parse(res.data.result);
            
            if (!Array.isArray(result) || result.length === 0) {
                return { msg: "no_types_found", data: { message: "未找到类型信息" } };
            }
            
            const firstType = [];

            for (let i = 0; i < result.length; i++) {
                if (result[i].pid === 0) {
                    result[i].isExpanded = false;
                    result[i].children = result.filter(
                        (item: any) => item.pid === result[i].id
                    );
                    firstType.push(result[i]);
                }
            }
            
            if (firstType.length > 0) {
                firstType[0].isExpanded = true;
            }
            
            await redis.expire(key, 6*10);
            await redis.set(key, JSON.stringify(firstType));
            return { msg: "ok", data: firstType };
        } catch (error: any) {
            console.error('Query type error:', error);
            return { msg: "server_error", data: null };
        } finally {
            await redisPool.release(redis);
        }
    }

    async queryTypeTag() {
        let redis = await redisPool.acquire();
        try {
            const key = "query_type_tag";
            const data = await redis.get(key);
            if (data) {
                return { msg: "ok", data: JSON.parse(data.toString()) };
            }
            const sql = `select id,name,icon,pid from category where pid=0`;
            const res = <rpcResult>(
                await rpcPost("/select", { params: [], sql }, this.token)
            );
            const result = JSON.parse(res.data.result);
            if (res.code === 0) {
                for (let i = 0; i < result.length; i++) {
                    let id = result[i].id;
                    const sql = `select id,tag_name as name from category_tags where category_id = ?`;
                    const params = [id];
                    const res = <rpcResult>(
                        await rpcPost("/select", { params, sql }, this.token)
                    );
                    result[i].tags = JSON.parse(res.data.result);
                }
                await redis.expire(key, 6*10);
                await redis.set(key, JSON.stringify(result));
                return { msg: "ok", data: result };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error: any) {
            return { msg: "server_error", data: null };
        } finally {
            await redisPool.release(redis);
        }
    }

    async loginByCode(username: string, smsCode: string): Promise<ResponseData> {
        // 1. 查找用户
        const userSql = "SELECT id, mobile, status, role FROM entities WHERE username = ? LIMIT 1";
        const userRes = <rpcResult>await rpcPost("/select", { sql: userSql, params: [username] });
        if (userRes.code !== 0 || !userRes.data || userRes.data.result === 'null') {
            return { msg: "user_not_found", data: null };
        }
        const user = JSON.parse(userRes.data.result)[0];
        if (user.status !== 1) {
            return { msg: "user_disabled", data: null };
        }

        // 2. 校验验证码
        const verifyResult = await smsService.verifyCode(user.mobile, smsCode);
        if (!verifyResult.success) {
            return { msg: "sms_code_invalid", data: { message: verifyResult.message } };
        }

        // 3. 生成 token
        const rtn = await rpcPost("/auth/role-sign-in", { role: user.role, id: user.id });
        if (rtn.code !== 0) {
            return { msg: "token_error", data: null };
        }
        // 更新登录时间
        await rpcPost(
            "/update",
            {
                sql: "UPDATE entities SET last_login_time = ? WHERE id = ?",
                params: [+Date.now() / 1000, user.id],
            },
            rtn.data.token
        );
        return { msg: "ok", data: rtn.data };
    }

    async findPassword(username: string, smsCode: string, newPwd: string): Promise<ResponseData> {
      try {
        // 1. 查找用户
        const userSql = "SELECT id, mobile, status FROM entities WHERE username = ? LIMIT 1";
        const userRes = <rpcResult>await rpcPost("/select", { sql: userSql, params: [username] });
        if (userRes.code !== 0 || !userRes.data || userRes.data.result === 'null') {
          return { msg: "user_not_found", data: null };
        }
        const user = JSON.parse(userRes.data.result)[0];
        if (user.status !== 1) {
          return { msg: "user_disabled", data: null };
        }
        // 2. 校验验证码
        const verifyResult = await smsService.verifyCode(user.mobile, smsCode);
        if (!verifyResult.success) {
          return { msg: "sms_code_invalid", data: { message: verifyResult.message } };
        }
        // 3. 重置密码
        return await this.resetPassword(username, newPwd);
      } catch (error: any) {
        console.error('Find password error:', error);
        return { msg: "server_error", data: null };
      }
    }

    /**
     * 获取协会统计信息
     */
    async getAssociationStatistics(associationId: number): Promise<ResponseData> {
      try {
        // 检查缓存
        let redis = await redisPool.acquire();
        try {
          const cacheKey = `association_statistics::${associationId}`;
          const cachedData = await redis.get(cacheKey);
          if (cachedData) {
            return { msg: "ok", data: JSON.parse(cachedData.toString()) };
          }
        } finally {
          await redisPool.release(redis);
        }

        // 1. 统计已关联企业数量 (role = 8, 企业)
        const enterpriseSql = "SELECT COUNT(id) as count FROM entities WHERE pid = ? AND role = 8 AND status = 1";
        const enterpriseRes = <rpcResult>await rpcPost("/select", { sql: enterpriseSql, params: [associationId] }, this.token);
        const enterpriseCount = enterpriseRes.code === 0 ? JSON.parse(enterpriseRes.data.result)[0].count : 0;

        // 2. 统计关联服务商数量 (role = 7, 服务商)
        const providerSql = "SELECT COUNT(id) as count FROM entities WHERE pid = ? AND role = 7 AND status = 1";
        const providerRes = <rpcResult>await rpcPost("/select", { sql: providerSql, params: [associationId] }, this.token);
        const providerCount = providerRes.code === 0 ? JSON.parse(providerRes.data.result)[0].count : 0;

        // 3. 统计总产品数量
        const productSql = "SELECT COUNT(id) as count FROM service_products WHERE entity_id IN (SELECT id FROM entities WHERE pid = ? AND status = 1) AND status = 2";
        const productRes = <rpcResult>await rpcPost("/select", { sql: productSql, params: [associationId] }, this.token);
        const productCount = productRes.code === 0 ? JSON.parse(productRes.data.result)[0].count : 0;

        // 4. 统计总订单数量
        const orderSql = "SELECT COUNT(id) as count FROM orders WHERE userId IN (SELECT id FROM entities WHERE pid = ? AND status = 1)";
        const orderRes = <rpcResult>await rpcPost("/select", { sql: orderSql, params: [associationId] }, this.token);
        const orderCount = orderRes.code === 0 ? JSON.parse(orderRes.data.result)[0].count : 0;

        // 5. 统计总收入
        const revenueSql = "SELECT COALESCE(SUM(totalAmount), 0) as total FROM orders WHERE userId IN (SELECT id FROM entities WHERE pid = ? AND status = 1) AND status = 'paid'";
        const revenueRes = <rpcResult>await rpcPost("/select", { sql: revenueSql, params: [associationId] }, this.token);
        const totalRevenue = revenueRes.code === 0 ? JSON.parse(revenueRes.data.result)[0].total : 0;

        // 6. 统计本月数据
        const currentMonth = Math.floor(Date.now() / 1000);
        const monthStart = currentMonth - (30 * 24 * 60 * 60); // 30天前

        // 本月新增企业
        const monthlyEnterpriseSql = "SELECT COUNT(id) as count FROM entities WHERE pid = ? AND role = 8 AND status = 1 AND create_time >= ?";
        const monthlyEnterpriseRes = <rpcResult>await rpcPost("/select", { sql: monthlyEnterpriseSql, params: [associationId, monthStart] }, this.token);
        const monthlyEnterpriseCount = monthlyEnterpriseRes.code === 0 ? JSON.parse(monthlyEnterpriseRes.data.result)[0].count : 0;

        // 本月新增服务商
        const monthlyProviderSql = "SELECT COUNT(id) as count FROM entities WHERE pid = ? AND role = 7 AND status = 1 AND create_time >= ?";
        const monthlyProviderRes = <rpcResult>await rpcPost("/select", { sql: monthlyProviderSql, params: [associationId, monthStart] }, this.token);
        const monthlyProviderCount = monthlyProviderRes.code === 0 ? JSON.parse(monthlyProviderRes.data.result)[0].count : 0;

        // 本月新增产品
        const monthlyProductSql = "SELECT COUNT(id) as count FROM service_products WHERE entity_id IN (SELECT id FROM entities WHERE pid = ? AND status = 1) AND status = 2 AND create_time >= ?";
        const monthlyProductRes = <rpcResult>await rpcPost("/select", { sql: monthlyProductSql, params: [associationId, monthStart] }, this.token);
        const monthlyProductCount = monthlyProductRes.code === 0 ? JSON.parse(monthlyProductRes.data.result)[0].count : 0;

        // 本月收入
        const monthlyRevenueSql = "SELECT COALESCE(SUM(totalAmount), 0) as total FROM orders WHERE userId IN (SELECT id FROM entities WHERE pid = ? AND status = 1) AND status = 'paid' AND createdAt >= ?";
        const monthlyRevenueRes = <rpcResult>await rpcPost("/select", { sql: monthlyRevenueSql, params: [associationId, monthStart] }, this.token);
        const monthlyRevenue = monthlyRevenueRes.code === 0 ? JSON.parse(monthlyRevenueRes.data.result)[0].total : 0;

        // 构建统计结果
        const statistics: AssociationStatistics = {
          associated_enterprises: enterpriseCount,
          associated_providers: providerCount,
          total_cooperation_projects: productCount, // 将产品数量作为合作项目数量
          total_products: productCount,
          total_orders: orderCount,
          total_revenue: totalRevenue,
          monthly_stats: {
            new_enterprises: monthlyEnterpriseCount,
            new_providers: monthlyProviderCount,
            new_projects: monthlyProductCount,
            revenue: monthlyRevenue
          }
        };

        // 缓存结果
        redis = await redisPool.acquire();
        try {
          const cacheKey = `association_statistics::${associationId}`;
          await redis.setex(cacheKey, 300, JSON.stringify(statistics)); // 缓存5分钟
        } finally {
          await redisPool.release(redis);
        }

        return { msg: "ok", data: statistics };
      } catch (error: any) {
        console.error('Get association statistics error:', error);
        return { msg: "server_error", data: null };
      }
    }
}
