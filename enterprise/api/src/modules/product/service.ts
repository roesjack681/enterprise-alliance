import {
  ServiceProductModel,
  ServiceProductQueryModel,
  ServiceProductDetailModel,
  ServiceAuditModel,
  ServiceFavoriteModel,
} from "./proto";
import { ResponseData, TokenData, rpcResult } from "../app/proto";
import { rpcPost, md5Encode } from "../../common/common";
import { config } from "../../config/config";
import { decodeJWT } from "../../common/common";
import{MeiliService} from "../../middles/meilisearch";
import { AuditService } from "../audit/service";
export interface IProductService<TokenData> {
  // 服务产品相关方法
  createServiceProduct(data: ServiceProductModel): Promise<ResponseData>;
  updateServiceProduct(data: ServiceProductModel): Promise<ResponseData>;
  deleteServiceProduct(id: number): Promise<ResponseData>;
  getServiceProductDetail(id: number, entityId?: number): Promise<ResponseData>;
  getServiceProductList(query: ServiceProductQueryModel): Promise<ResponseData>;
  getMyServiceProducts(
    entityId: number,
    query: ServiceProductQueryModel
  ): Promise<ResponseData>;
  auditServiceProduct(data: ServiceAuditModel): Promise<ResponseData>;
  toggleServiceStatus(
    id: number,
    status: number,
    entityId: number
  ): Promise<ResponseData>;
  toggleFavorite(
    serviceId: number,
    entityId: number,
    action: string
  ): Promise<ResponseData>;
  getFavoriteServices(
    entityId: number,
    query: ServiceProductQueryModel
  ): Promise<ResponseData>;
  getTransactionServiceProductList(
    query: ServiceProductQueryModel
  ): Promise<ResponseData>;
  increaseViewCount(id: number): Promise<ResponseData>;
}

// ======================== 产品服务相关 ========================

export class ProductService implements IProductService<TokenData> {

    protected token: string;
    constructor(token: string) {
        this.token = token;
    }

    /**
     * 创建服务产品
     */
    async createServiceProduct(data: ServiceProductModel) {
        try {
            const sql = `INSERT INTO service_products (title, description, category_id, sub_category_id, tags, price, price_type, unit, province, city, district, address, images, videos, service_area, service_time, qualification, status, entity_id, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [
                data.title,
                data.description,
                data.category_id,
                data.sub_category_id,
                data.tags,
                data.price,
                data.price_type,
                data.unit,
                data.province,
                data.city,
                data.district,
                data.address,
                data.images,
                data.videos,
                data.service_area || "当地",
                data.service_time || "上午9:00-12:00 下午14:00-17:00",
                data.qualification,
                data.status || 0,
                data.entity_id,
                +Date.now() / 1000,
            ];
            const res = <rpcResult>(
                await rpcPost("/insert", { params, sql }, this.token)
            );
            if (res && res.code === 0) {
                //meilisearch
                const meilisearch = new MeiliService('service_products');
                meilisearch.addDocuments([{
                  id: res.data.lastId,
                  title: data.title,
                  description: data.description, 
                  //tags: data.tags,
                }]);
                //await meilisearch.setSearchableFields(['title', 'description']);
                return { msg: "ok", data: { id: res.data } };
            } else {
                return { msg: "insert_error", data: null };
            }
        } catch (error: any) {
            return { msg: "server_error", data: null };
        }
    }

  // 更新服务产品
  async updateServiceProduct(data: ServiceProductModel) {
    try {
      const updateFields = [];
      const params = [];

      if (data.title) {
        updateFields.push("title = ?");
        params.push(data.title);
      }
      if (data.description) {
        updateFields.push("description = ?");
        params.push(data.description);
      }
      if (data.category_id) {
        updateFields.push("category_id = ?");
        params.push(data.category_id);
      }
      if (data.sub_category_id) {
        updateFields.push("sub_category_id = ?");
        params.push(data.sub_category_id);
      }
      if (data.tags) {
        updateFields.push("tags = ?");
        params.push(data.tags);
      }
      if (data.price !== undefined) {
        updateFields.push("price = ?");
        params.push(data.price);
      }
      if (data.price_type) {
        updateFields.push("price_type = ?");
        params.push(data.price_type);
      }
      if (data.unit) {
        updateFields.push("unit = ?");
        params.push(data.unit);
      }
      if (data.province) {
        updateFields.push("province = ?");
        params.push(data.province);
      }
      if (data.city) {
        updateFields.push("city = ?");
        params.push(data.city);
      }
      if (data.district) {
        updateFields.push("district = ?");
        params.push(data.district);
      }
      if (data.address) {
        updateFields.push("address = ?");
        params.push(data.address);
      }
      if (data.contact_name) {
        updateFields.push("contact_name = ?");
        params.push(data.contact_name);
      }
      if (data.contact_phone) {
        updateFields.push("contact_phone = ?");
        params.push(data.contact_phone);
      }
      if (data.contact_wechat) {
        updateFields.push("contact_wechat = ?");
        params.push(data.contact_wechat);
      }
      if (data.images) {
        updateFields.push("images = ?");
        params.push(data.images);
      }
      if (data.videos) {
        updateFields.push("videos = ?");
        params.push(data.videos);
      }
      if (data.service_area) {
        updateFields.push("service_area = ?");
        params.push(data.service_area);
      }
      if (data.service_time) {
        updateFields.push("service_time = ?");
        params.push(data.service_time);
      }
      if (data.qualification) {
        updateFields.push("qualification = ?");
        params.push(data.qualification);
      }
      if (data.status !== undefined) {
        updateFields.push("status = ?");
        params.push(data.status);
      }

      updateFields.push("update_time = " + Date.now() / 1000);
      params.push(data.id);

      const sql = `UPDATE service_products SET ${updateFields.join(", ")} WHERE id = ?`;
      const res = <rpcResult>(
        await rpcPost("/update", { params, sql }, this.token)
      );
      if (res && res.code === 0) {
        //meilisearch 需要搜索匹配及列表页需要的所有字段
        const meilisearch = new MeiliService('service_products');
        meilisearch.updateDocuments([{
          id: data.id,
          title: data.title,
          description: data.description, 
          //tags: data.tags,         
        }]);
        //await meilisearch.setSearchableFields(['title', 'description']);
        return { msg: "ok", data: { affectedRows: res.data } };
      } else {
        return { msg: "update_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  // 删除服务产品
  async deleteServiceProduct(id: number) {
    try {
      const sql = `UPDATE service_products SET status = 4 WHERE id = ?`;
      const params = [id];
      const res = <rpcResult>(
        await rpcPost("/update", { params, sql }, this.token)
      );
      if (res && res.code === 0) {
        //meilisearch
        const meilisearch = new MeiliService('service_products');
        meilisearch.deleteDocuments([id.toString()]);
        return { msg: "ok", data: { affectedRows: res.data } };
      } else {
        return { msg: "delete_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  // 获取服务产品详情
  async getServiceProductDetail(id: number, entityId?: number) {
    try {
      const sql = `SELECT id, title, description, category_id, sub_category_id, tags, price, price_type, unit, province, city, district, address, contact_name, contact_phone, contact_wechat, images, videos, service_area, service_time, qualification, status, entity_id, create_time, update_time, audit_time, audit_user_id, audit_remark, view_count, favorite_count FROM service_products WHERE id = ? AND status != 4;`;
      const params = [id];
      const res = <rpcResult>(
        await rpcPost("/select", { params, sql }, this.token)
      );
      if (res && res.code === 0) {
        const result = JSON.parse(res.data.result);
        if (result.length > 0) {
          // const serviceDetail = result[0];

          // 检查当前用户是否收藏
          // if (entityId) {
          //   const favoriteSql = `SELECT id FROM service_favorites WHERE service_id = ? AND entity_id = ?`;
          //   const favoriteRes = <rpcResult>(
          //     await rpcPost(
          //       "/select",
          //       { params: [id, entityId], sql: favoriteSql },
          //       this.token
          //     )
          //   );
          //   const favoriteResult = JSON.parse(favoriteRes.data.result);
          //   serviceDetail.is_favorite = favoriteResult.length > 0;
          // } else {
          //   serviceDetail.is_favorite = false;
          // }

          // 增加浏览次数
          await this.increaseViewCount(id);

          return { msg: "ok", data: result };
        } else {
          return { msg: "not_found", data: null };
        }
      } else {
        return { msg: "get_detail_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }
  async searchKeyword(keyword: string): Promise<any[]> {
    try {
      const meilisearch = new MeiliService('service_products');
      const result = await meilisearch.search(keyword); 
      return result.hits.map((item: any) => item.id);
    } catch (error: any) {
      return [];
    }
  }
  // 获取特定协会服务产品列表
  async getTransactionServiceProductList(query: ServiceProductQueryModel) {
    try {
      if (query.role_id !== 9) {
        return { msg: "unauthorized", data: null };
      }
      // 获取此协会下的服务商列表
      const entitySql = `SELECT id FROM entities WHERE pid = ?`;
      const entityParams = [query.entity_id];
      const entityRes = <rpcResult>(
        await rpcPost("/select", { params: entityParams, sql: entitySql }, this.token)
      );
      if (!entityRes || entityRes.code !== 0) {
        return { msg: "no_data", data: null };
      }
      const entityList = JSON.parse(entityRes.data.result);
      if (!entityList.length) {
        return { msg: "no_data", data: null };
      }
      const entityIds = entityList.map((e: any) => e.id);
      // 构建 IN 查询
      let sql = `SELECT id, title, description, category_id, sub_category_id, tags, price, price_type, unit, province, city, district, address, contact_name, contact_phone, contact_wechat, images, videos, service_area, service_time, qualification, status, entity_id, create_time, update_time, audit_time, audit_user_id, audit_remark, view_count, favorite_count FROM service_products WHERE entity_id IN (${entityIds.map(() => '?').join(',')})`;
      const params = [...entityIds];
      const conditions = [];
      if (query.status !== undefined) {
        conditions.push("status = ?");
        params.push(query.status);
      } else {
        conditions.push("status != 4");
      }
      if (query.keyword) {
        const ids = await this.searchKeyword(query.keyword);
        if(ids.length>0){
          conditions.push(`id IN (${ids.join(',')})`);
        }else{
          conditions.push("id = 0");
        } 
      }
      if (query.category_id) {
        conditions.push("category_id = ?");
        params.push(query.category_id);
      }
      if (query.sub_category_id) {
        conditions.push("sub_category_id = ?");
        params.push(query.sub_category_id);
      }
      if (query.province) {
        conditions.push("province = ?");
        params.push(query.province);
      }
      if (query.price_min !== undefined) {
        conditions.push("price >= ?");
        params.push(query.price_min);
      }
      if (query.price_max !== undefined) {
        conditions.push("price <= ?");
        params.push(query.price_max);
      }
      if (query.price_type) {
        conditions.push("price_type = ?");
        params.push(query.price_type);
      }
      if (conditions.length > 0) {
        sql += " AND " + conditions.join(" AND ");
      }
      // 排序
      const sortBy = query.sort_by || "create_time";
      const sortOrder = query.sort_order || "desc";
      sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
      // 分页
      const offset = (query.page - 1) * query.page_size;
      sql += ` LIMIT ${query.page_size} OFFSET ${offset}`;
      const res = <rpcResult>(
        await rpcPost("/select", { params, sql }, this.token)
      );
      let serviceList = [];
      if (res && res.code === 0) {
        serviceList = JSON.parse(res.data.result);
      }
      // 获取总数
      let countSql = `SELECT COUNT(id) as total FROM service_products WHERE entity_id IN (${entityIds.map(() => '?').join(',')})`;
      const countParams = [...entityIds];
      if (conditions.length > 0) {
        countSql += " AND " + conditions.join(" AND ");
        countParams.push(...params.slice(entityIds.length));
      }
      const countRes = <rpcResult>(
        await rpcPost("/select", { params: countParams, sql: countSql }, this.token)
      );
      const total = (countRes && countRes.code === 0) ? JSON.parse(countRes.data.result)[0].total : 0;
      return {
        msg: "ok",
        data: {
          entityList,
          serviceList,
          total: total,
          page: query.page,
          page_size: query.page_size,
          total_pages: Math.ceil(total / query.page_size),
        },
      };
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

// 获取服务产品列表
async getServiceProductList(query: ServiceProductQueryModel) {
  try {
    let sql = `SELECT id, title, description, category_id, sub_category_id, tags, price, price_type, unit, province, city, district, address, contact_name, contact_phone, contact_wechat, images, videos, service_area, service_time, qualification, status, entity_id, create_time, update_time, audit_time, audit_user_id, audit_remark, view_count, favorite_count FROM service_products WHERE status = 2`;

    const params: (string | number)[] = [];
    const conditions: string[] = [];

    if (query.entity_id) {
      conditions.push("entity_id = ?");
      params.push(query.entity_id);
    }
    if (query.category_id) {
      conditions.push("category_id = ?");
      params.push(query.category_id);
    }
    if (query.sub_category_id) {
      conditions.push("sub_category_id = ?");
      params.push(query.sub_category_id);
    }
    if (query.province) {
      conditions.push("province = ?");
      params.push(query.province);
    }
    if (query.keyword) {
      const ids = await this.searchKeyword(query.keyword);
      if(ids.length>0){
        conditions.push(`id IN (${ids.join(',')})`);
      }else{
        conditions.push("id = 0");
      } 
    }
    if (query.price_min !== undefined) {
      conditions.push("price >= ?");
      params.push(query.price_min);
    }
    if (query.price_max !== undefined) {
      conditions.push("price <= ?");
      params.push(query.price_max);
    }
    if (query.price_type) {
      conditions.push("price_type = ?");
      params.push(query.price_type);
    }

    if (conditions.length > 0) {
      sql += " AND " + conditions.join(" AND ");
    }

    // 排序
    const sortBy = query.sort_by || "create_time";
    const sortOrder = query.sort_order || "desc";
    sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

    // 分页
    const offset = (query.page - 1) * query.page_size;
    sql += ` LIMIT ${query.page_size} OFFSET ${offset}`;

    const res = <rpcResult>(
      await rpcPost("/select", { params, sql }, this.token)
    );
    
    if (res && res.code === 0) {
      const result = JSON.parse(res.data.result);

      // 获取总数
      let countSql = `SELECT COUNT(id) as total FROM service_products WHERE status = 2`;
      if (conditions.length > 0) {
        countSql += " AND " + conditions.join(" AND ");
      }
      const countRes = <rpcResult>(
        await rpcPost("/select", { params, sql: countSql }, this.token)
      );
      const total = JSON.parse(countRes.data.result)[0].total;

      return {
        msg: "ok",
        data: {
          list: result,
          total: total,
          page: query.page,
          page_size: query.page_size,
          total_pages: Math.ceil(total / query.page_size),
        },
      };
    } else {
      return { msg: "get_list_error", data: null };
    }
  } catch (error: any) {
    return { msg: "server_error", data: null };
  }
}

  // 获取我的服务产品
  async getMyServiceProducts(
    entityId: number,
    query: ServiceProductQueryModel
  ) {
    try {
      let sql =
        "SELECT id, title, description, category_id, sub_category_id, tags, price, price_type, unit, province, city, district, address, contact_name, contact_phone, contact_wechat, images, videos, service_area, service_time, qualification, status, entity_id, create_time, update_time, audit_time, audit_user_id, audit_remark, view_count, favorite_count FROM service_products WHERE entity_id = ?";
      const params: (string | number)[] = [entityId];
      const conditions = [];

      if (query.status !== undefined) {
        conditions.push("status = ?");
        params.push(query.status);
      }

      //meilisea
      if (query.keyword) {
        const ids = await this.searchKeyword(query.keyword);
        if(ids.length>0){
          conditions.push(`id IN (${ids.join(',')})`);
        }else{
          conditions.push("id = 0");
        } 
      }
 
      if (conditions.length > 0) {
        sql += " AND " + conditions.join(" AND ");
      }
      
      // 排序
      const sortBy = query.sort_by || "create_time";
      const sortOrder = query.sort_order || "desc";
      sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

      // 分页
      const offset = (query.page - 1) * query.page_size;
      sql += ` LIMIT ${query.page_size} OFFSET ${offset}`;

      const res = <rpcResult>(
        await rpcPost("/select", { params, sql }, this.token)
      );
      if (res && res.code === 0) {
        const result = JSON.parse(res.data.result);

        // 获取总数
        let countSql = `SELECT COUNT(id) as total FROM service_products WHERE entity_id = ?`;
        if (conditions.length > 0) {
          countSql += " AND " + conditions.join(" AND ");
        }
        const countRes = <rpcResult>(
          await rpcPost(
            "/select",
            { params: [entityId, ...params.slice(1)], sql: countSql },
            this.token
          )
        );
        const total = JSON.parse(countRes.data.result)[0].total;

        return {
          msg: "ok",
          data: {
            list: result,
            total: total,
            page: query.page,
            page_size: query.page_size,
            total_pages: Math.ceil(total / query.page_size),
          },
        };
      } else {
        return { msg: "get_my_list_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  // 审核服务产品
  async auditServiceProduct(data: ServiceAuditModel) {
    try {
      if (data.role_id !== 9) {
        return { msg: "unauthorized", data: null };
      }
      // 用 decodeJWT 获取当前用户 id 作为 associationId
      const userInfo = await decodeJWT(this.token);
      const associationId = userInfo?.id;
      if (!associationId) {
        return { msg: "unauthorized", data: null };
      }

      // 校验该服务产品是否属于当前协会下的服务商
      const checkSql = `SELECT id FROM service_products WHERE id = ? AND entity_id IN (SELECT id FROM entities WHERE pid = ?)`;
      const checkParams = [data.service_id, associationId];
      const checkRes = <rpcResult>(
        await rpcPost("/select", { params: checkParams, sql: checkSql }, this.token)
      );

      if (!checkRes || checkRes.code !== 0 || JSON.parse(checkRes.data.result).length === 0) {
        return { msg: "unauthorized", data: null };
      }
      const sql = `UPDATE service_products SET status = ?, audit_time = ?, audit_user_id = ?, audit_remark = ? WHERE id = ?`;
      const params = [
        data.status,
        Date.now() / 1000,
        data.audit_user_id,
        data.remark,
        data.service_id,
      ];
      const res = <rpcResult>(
        await rpcPost("/update", { params, sql }, this.token)
      );
      if (res && res.code === 0) {
        // 如果审核通过，保存搜索词
        if (data.status === 2) { // 假设2是审核通过状态
          try {
            // 获取产品信息
            const productSql = `SELECT title, description, tags, entity_id FROM service_products WHERE id = ?`;
            const productRes = <rpcResult>(
              await rpcPost("/select", { params: [data.service_id], sql: productSql }, this.token)
            );
            
            if (productRes && productRes.code === 0 && productRes.data.result !== 'null') {
              const productData = JSON.parse(productRes.data.result)[0];
              
              // 保存标题 (作为描述)
              if (productData.title) {
                await rpcPost("/save-search", {
                  words: productData.title,
                  words_from: 1, // 描述
                  words_type: 2, // 产品
                  obj_id: data.service_id
                }, this.token);
              }
              
              // 保存描述
              if (productData.description) {
                await rpcPost("/save-search", {
                  words: productData.description,
                  words_from: 1, // 描述
                  words_type: 2, // 产品
                  obj_id: data.service_id
                }, this.token);
              }
              
              // 保存标签
              if (productData.tags) {
                await rpcPost("/save-search", {
                  words: productData.tags,
                  words_from: 2, // 标签
                  words_type: 2, // 产品
                  obj_id: data.service_id
                }, this.token);
              }
              
              // 添加审核记录
              try {
                const auditService = new AuditService(this.token);
                const userInfo = await decodeJWT(this.token);
                
                // 获取企业名称
                const entitySql = "SELECT name FROM entity_detail_info WHERE entity_id = ? LIMIT 1";
                const entityRes = <rpcResult>(
                    await rpcPost("/select", { sql: entitySql, params: [productData.entity_id] }, this.token)
                );
                let entityName = '';
                if (entityRes.code === 0 && entityRes.data.result !== 'null') {
                    const entityData = JSON.parse(entityRes.data.result);
                    if (entityData.length > 0) {
                        entityName = entityData[0].name || '';
                    }
                }
                
                await auditService.createAuditRecord({
                    audit_type: 2,  // 服务产品
                    related_id: data.service_id,
                    entity_id: productData.entity_id,
                    entity_name: entityName,
                    title: `服务产品审核${data.status === 2 ? '通过' : '拒绝'}`,
                    content: `服务产品"${productData.title}"的审核${data.status === 2 ? '通过' : '拒绝'}`,
                    auditor_id: userInfo?.id,
                    auditor_name: entityName,
                    status: data.status === 2 ? 2 : 3,
                    remark: data.remark
                });
              } catch (auditError) {
                console.error('添加审核记录失败:', auditError);
                // 不影响主流程
              }
            }
          } catch (e) {
            // 保存搜索词失败不影响主流程
          }
        } else if (data.status === 3) {
          // 审核拒绝也添加记录
          try {
            // 获取产品信息
            const productSql = `SELECT title, entity_id FROM service_products WHERE id = ?`;
            const productRes = <rpcResult>(
              await rpcPost("/select", { params: [data.service_id], sql: productSql }, this.token)
            );
            
            if (productRes && productRes.code === 0 && productRes.data.result !== 'null') {
              const productData = JSON.parse(productRes.data.result)[0];
              
              // 添加审核记录
              const auditService = new AuditService(this.token);
              const userInfo = await decodeJWT(this.token);
              
              // 获取企业名称
              const entitySql = "SELECT name FROM entity_detail_info WHERE entity_id = ? LIMIT 1";
              const entityRes = <rpcResult>(
                  await rpcPost("/select", { sql: entitySql, params: [productData.entity_id] }, this.token)
              );
              let entityName = '';
              if (entityRes.code === 0 && entityRes.data.result !== 'null') {
                  const entityData = JSON.parse(entityRes.data.result);
                  if (entityData.length > 0) {
                      entityName = entityData[0].name || '';
                  }
              }
              
              await auditService.createAuditRecord({
                  audit_type: 2,  // 服务产品
                  related_id: data.service_id,
                  entity_id: productData.entity_id,
                  entity_name: entityName,
                  title: `服务产品审核拒绝`,
                  content: `服务产品"${productData.title}"的审核拒绝`,
                  auditor_id: userInfo?.id,
                  auditor_name: entityName,
                  status: 3,
                  remark: data.remark
              });
            }
          } catch (auditError) {
            console.error('添加审核记录失败:', auditError);
            // 不影响主流程
          }
        }
        return { msg: "ok", data: { affectedRows: res.data } };
      } else {
        return { msg: "audit_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  // 切换服务状态
  async toggleServiceStatus(id: number, status: number, entityId: number) {
    try {
      //首先查询服务是否属于当前用户
      const sql = `SELECT title FROM service_products WHERE id = ? AND entity_id = ?`;
      const params = [id, entityId];
      const res = <rpcResult>(
        await rpcPost("/select", { params, sql }, this.token)
      );
      if (res && res.code === 0) {
        const result = JSON.parse(res.data.result);
        if (result === null || result.length === 0) {
          return { msg: "unauthorized", data: null };
        } else {
          const sql = `UPDATE service_products SET status = ?, update_time = ? WHERE id = ?`;
          const params = [status, Date.now() / 1000, id];
          const res = <rpcResult>(
            await rpcPost("/update", { params, sql }, this.token)
          );
          if (res && res.code === 0) {
            return { msg: "ok", data: { affectedRows: res.data } };
          } else {
            return { msg: "toggle_status_error", data: null };
          }
        }
      } else {
        return { msg: "toggle_status_error", data: null };
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  // 收藏/取消收藏服务
  async toggleFavorite(serviceId: number, entityId: number, action: string) {
    try {
      if (action === "add") {
        // 检查是否已收藏
        const checkSql = `SELECT id FROM service_favorites WHERE service_id = ? AND entity_id = ?`;
        const checkRes = <rpcResult>(
          await rpcPost(
            "/select",
            { params: [serviceId, entityId], sql: checkSql },
            this.token
          )
        );
        const checkResult = JSON.parse(checkRes.data.result);

        if (checkResult.length > 0) {
          return { msg: "err", data: null };
        }

        // 添加收藏
        const insertSql = `INSERT INTO service_favorites (service_id, entity_id, create_time) VALUES (?, ?, NOW())`;
        const insertRes = <rpcResult>(
          await rpcPost(
            "/insert",
            { params: [serviceId, entityId], sql: insertSql },
            this.token
          )
        );

        if (insertRes && insertRes.code === 0) {
          // 更新服务收藏数
          const updateSql = `UPDATE service_products SET favorite_count = favorite_count + 1 WHERE id = ?`;
          await rpcPost(
            "/update",
            { params: [serviceId], sql: updateSql },
            this.token
          );

          return { msg: "ok", data: { id: insertRes.data } };
        } else {
          return { msg: "err", data: null };
        }
      } else {
        // 取消收藏
        const deleteSql = `DELETE FROM service_favorites WHERE service_id = ? AND entity_id = ?`;
        const deleteRes = <rpcResult>(
          await rpcPost(
            "/delete",
            { params: [serviceId, entityId], sql: deleteSql },
            this.token
          )
        );

        if (deleteRes && deleteRes.code === 0) {
          // 更新服务收藏数
          const updateSql = `UPDATE service_products SET favorite_count = favorite_count - 1 WHERE id = ? AND favorite_count > 0`;
          await rpcPost(
            "/update",
            { params: [serviceId], sql: updateSql },
            this.token
          );

          return { msg: "ok", data: { affectedRows: deleteRes.data } };
        } else {
          return { msg: "err", data: null };
        }
      }
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  // 获取收藏的服务列表
  async getFavoriteServices(entityId: number, query: ServiceProductQueryModel) {
    try {
      // 首先获取收藏记录
      const favoriteSql = `SELECT service_id, create_time FROM service_favorites WHERE entity_id = ? ORDER BY create_time DESC`;
      const offset = (query.page - 1) * query.page_size;
      const paginatedFavoriteSql = `${favoriteSql} LIMIT ${query.page_size} OFFSET ${offset}`;
      
      const favoriteRes = <rpcResult>(
        await rpcPost("/select", { params: [entityId], sql: paginatedFavoriteSql }, this.token)
      );

      if (!favoriteRes || favoriteRes.code !== 0) {
        return { msg: "get_favorite_list_error", data: null };
      }

      const favoriteList = JSON.parse(favoriteRes.data.result);
      if (!favoriteList || favoriteList.length === 0) {
        return {
          msg: "ok",
          data: {
            list: [],
            total: 0,
            page: query.page,
            page_size: query.page_size,
            total_pages: 0,
          },
        };
      }

      // 获取服务ID列表
      const serviceIds = favoriteList.map((item: any) => item.service_id);
      const placeholders = serviceIds.map(() => '?').join(',');
      
      // 查询服务产品详情
      const productSql = `SELECT id, title, description, category_id, sub_category_id, tags, price, price_type, unit, province, city, district, address, contact_name, contact_phone, contact_wechat, images, videos, service_area, service_time, qualification, status, entity_id, create_time, update_time, audit_time, audit_user_id, audit_remark, view_count, favorite_count FROM service_products WHERE id IN (${placeholders}) AND status = 2`;
      
      const productRes = <rpcResult>(
        await rpcPost("/select", { params: serviceIds, sql: productSql }, this.token)
      );

      if (!productRes || productRes.code !== 0) {
        return { msg: "get_favorite_list_error", data: null };
      }

      const productList = JSON.parse(productRes.data.result);
      
      // 合并数据，添加收藏时间
      const result = favoriteList.map((favorite: any) => {
        const product = productList.find((p: any) => p.id === favorite.service_id);
        if (product) {
          return {
            ...product,
            favorite_time: favorite.create_time
          };
        }
        return null;
      }).filter((item: any) => item !== null);

      // 获取总数
      const countSql = `SELECT COUNT(sf.id) as total FROM service_favorites sf WHERE sf.entity_id = ? AND EXISTS (SELECT 1 FROM service_products sp WHERE sp.id = sf.service_id AND sp.status = 2)`;
      const countRes = <rpcResult>(
        await rpcPost(
          "/select",
          { params: [entityId], sql: countSql },
          this.token
        )
      );
      const total = JSON.parse(countRes.data.result)[0].total;

      return {
        msg: "ok",
        data: {
          list: result,
          total: total,
          page: query.page,
          page_size: query.page_size,
          total_pages: Math.ceil(total / query.page_size),
        },
      };
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  // 增加浏览次数
  async increaseViewCount(id: number) {
    try {
      const sql = `UPDATE service_products SET view_count = view_count + 1 WHERE id = ?`;
      const params = [id];
      await rpcPost("/update", { params, sql }, this.token);
      return { msg: "ok", data: null };
    } catch (error: any) {
      return { msg: "server_error", data: null };
    }
  }

  //获取服务分类
  async getServiceCategory(entityId:number) {
    try{
        //查询分类id，相同id记为一个
        const sql = "select sub_category_id from service_products where entity_id = ? group by sub_category_id "
        const res = <rpcResult>(await rpcPost("/select",{params:[entityId],sql},this.token))
        console.log(res)
        if (res && res.code === 0 && res.data.result!= "null"){
          const categorylist = JSON.parse(res.data.result);
          const params = categorylist.map((item: any) => item.sub_category_id);
          if (params.length === 0) {
            return {msg:"no_data",data:null};
          }
          const placeholders = params.map(() => '?').join(',');
          const sql2 = `select id, name from category where id in (${placeholders})`;
          const res2 = <rpcResult>(await rpcPost("/select",{params,sql: sql2},this.token));
          console.log(res2)
          return {msg:"ok",data:JSON.parse(res2.data.result)};
        } else {
          return {msg:"no_data",data:null};
        }
    }catch{
        return {
          msg: "server_error",
          data: null,

        }
    }
}
}
