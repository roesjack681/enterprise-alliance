import { rpcPost } from '../../common/common';
import { ResponseData, TokenData, rpcResult } from "../app/proto";
import { MeiliService } from "../../middles/meilisearch";
import { 
  Banner, 
  About, 
  Contact, 
  Product, 
  Article, 
  Case, 
  Settings,
  CreateBannerReq,
  UpdateBannerReq,
  CreateProductReq,
  CreateArticleReq,
  CreateCaseReq,
  QueryParams,
  PageResult,
  CreateCategoryReq,
  UpdateCategoryReq,
  UpdateArticleReq
} from './proto';

export interface IHomepageService {
  createBanner(data: any): Promise<ResponseData>;
  updateBanner(data: any): Promise<ResponseData>;
  deleteBanner(id: number, enterpriseId: number): Promise<ResponseData>;
  getBanners(enterpriseId: number): Promise<ResponseData>;
  getBannerById(id: number): Promise<ResponseData>;
  upsertAbout(data: any): Promise<ResponseData>;
  createAbout(data: any): Promise<ResponseData>;
  updateAbout(data: any): Promise<ResponseData>;
  getAboutByEnterpriseId(enterpriseId: number): Promise<ResponseData>;
  getAboutById(id: number): Promise<ResponseData>;
  upsertContact(data: any): Promise<ResponseData>;
  createContact(data: any): Promise<ResponseData>;
  updateContact(data: any): Promise<ResponseData>;
  getContactByEnterpriseId(enterpriseId: number): Promise<ResponseData>;
  getContactById(id: number): Promise<ResponseData>;
  createProduct(data: any): Promise<ResponseData>;
  updateProduct(id: number, data: any): Promise<ResponseData>;
  deleteProduct(id: number,enterpriseId:number): Promise<ResponseData>;
  getProducts(params: any): Promise<ResponseData>;
  getProductById(id: number): Promise<ResponseData>;
  createArticle(data: any): Promise<ResponseData>;
  updateArticle(id: number, data: any): Promise<ResponseData>;
  deleteArticle(id: number): Promise<ResponseData>;
  getArticles(params: any): Promise<ResponseData>;
  getArticleById(id: number): Promise<ResponseData>;
  createCase(data: any): Promise<ResponseData>;
  updateCase(id: number, data: any): Promise<ResponseData>;
  deleteCase(id: number, enterpriseId: number): Promise<ResponseData>;
  getCases(params: any): Promise<ResponseData>;
  getCaseById(id: number): Promise<ResponseData>;
  upsertSettings(data: any): Promise<ResponseData>;
  createSettings(data: any): Promise<ResponseData>;
  updateSettings(data: any): Promise<ResponseData>;
  getSettingsByEnterpriseId(enterpriseId: number): Promise<ResponseData>;
  getSettingsById(id: number): Promise<ResponseData>;
  getHomepage(enterpriseId: number): Promise<ResponseData>;
  createCategory(data: CreateCategoryReq): Promise<ResponseData>;
  updateCategory(id: number, data: UpdateCategoryReq): Promise<ResponseData>;
  deleteCategory(id: number,enterpriseId:number): Promise<ResponseData>;
  getCategories(params: { enterprise_id?: number; type?: string; status?: number }): Promise<ResponseData>;
  getCategoryById(id: number): Promise<ResponseData>;
}

export class HomepageService implements IHomepageService {
  protected token: string;
  constructor(tokenData: string) {
    this.token = tokenData;
  }

  // ==================== 轮播图管理 ====================
  
  /**
   * 创建轮播图
   */
  async createBanner(data: CreateBannerReq): Promise<ResponseData> {
    const sql = `INSERT INTO enterprise_banners (enterprise_id, title, image_url, link_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)`;
    try {
      const result: rpcResult = await rpcPost("/insert", {
        sql,
        params: [
          data.enterprise_id,
          data.title,
          data.image_url,
          data.link_url || null,
          data.sort_order || 0,
          data.is_active !== false ? 1 : 0
        ]
      }, this.token);
      if (result && result.code === 0) {       
        return { msg: "ok", data: null};
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新轮播图
   */
  async updateBanner(data: UpdateBannerReq): Promise<ResponseData> {
    const updateFields = [];
    const params = [];

    if (data.title !== undefined) {
      updateFields.push('title = ?');
      params.push(data.title);
    }
    if (data.image_url !== undefined) {
      updateFields.push('image_url = ?');
      params.push(data.image_url);
    }
    if (data.link_url !== undefined) {
      updateFields.push('link_url = ?');
      params.push(data.link_url);
    }
    if (data.sort_order !== undefined) {
      updateFields.push('sort_order = ?');
      params.push(data.sort_order);
    }
    if (data.is_active !== undefined) {
      updateFields.push('is_active = ?');
      params.push(data.is_active ? 1 : 0);
    }

    params.push(data.id);
    params.push(data.enterprise_id);

    const sql = `UPDATE enterprise_banners SET ${updateFields.join(', ')} WHERE id = ? AND enterprise_id = ?`;
    try {
      const result: rpcResult = await rpcPost("/update", { sql, params }, this.token); 
      if (result && result.code === 0) {
        return { msg: "ok", data: { id: data.id } };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 删除轮播图
   */
  async deleteBanner(id: number,enterpriseId: number): Promise<ResponseData> {
    const sql = 'UPDATE enterprise_banners SET status=0 WHERE id = ? AND enterprise_id = ?';
    try {
      const result: rpcResult = await rpcPost("/update", { sql, params: [id,enterpriseId] }, this.token);
      if (result && result.code === 0) {
        return { msg: "ok", data: null};
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取轮播图列表
   */
  async getBanners(enterpriseId: number): Promise<ResponseData> {
    const sql = `SELECT id, enterprise_id, title, image_url, link_url, sort_order, is_active FROM enterprise_banners WHERE enterprise_id = ? AND is_active = 1 AND status = 1 ORDER BY id DESC`;
    const result: rpcResult = await rpcPost("/select", { sql, params: [enterpriseId] }, this.token);  
    if (result.code === 0) {
      return { msg: "ok", data: JSON.parse(result.data.result) };
    }
    return { msg: "err", data: null };
  }

  /**
   * 根据ID获取轮播图
   */
  async getBannerById(id: number): Promise<ResponseData> {
    const sql = 'SELECT id, enterprise_id, title, image_url, link_url, sort_order, is_active, status FROM enterprise_banners WHERE id = ?';
    const result: rpcResult = await rpcPost("/select", { sql, params: [id] }, this.token);
    
    if (result.code === 0) {
      const data = JSON.parse(result.data.result);
      return { msg: "ok", data: data[0] };
    }
    return { msg: "err", data: null };
  }

  // ==================== 关于我们管理 ====================
  
  /**
   * 创建或更新关于我们
   */
  async upsertAbout(data: Partial<About>): Promise<ResponseData> {
    const existing = await this.getAboutByEnterpriseId(data.enterprise_id); 
    if (existing.msg === "ok" && existing.data) {
      return this.updateAbout(data);
    } else {
      return this.createAbout(data);
    }
  }

  /**
   * 创建关于我们
   */
  async createAbout(data: Partial<About>): Promise<ResponseData> {
    const sql = `INSERT INTO enterprise_about (enterprise_id, company_name, \`description\`,\`history\`, team_intro, logo_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    try {

      const result: rpcResult = await rpcPost("/insert", {
        sql,
        params: [
          data.enterprise_id,
          data.company_name,
          data.description,         
          data.history,
          data.team_intro,
          data.logo_url,         
          Math.floor(+new Date / 1000),
          Math.floor(+new Date / 1000)
        ]
      }, this.token); 
      if (result.code === 0) {
       
        return { msg: "ok", data: null };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新关于我们
   */
  async updateAbout(data: Partial<About>): Promise<ResponseData> {
    const updateFields = [];
    const params = [];

    if (data.company_name !== undefined) {
      updateFields.push('company_name = ?');
      params.push(data.company_name);
    }
    if (data.description !== undefined) {
      updateFields.push('`description` = ?');
      params.push(data.description);
    }
    if (data.vision !== undefined) {
      updateFields.push('vision = ?');
      params.push(data.vision);
    }
    if (data.mission !== undefined) {
      updateFields.push('mission = ?');
      params.push(data.mission);
    }
    if (data.values !== undefined) {
      updateFields.push('`values` = ?');
      params.push(data.values);
    }
    if (data.history !== undefined) {
      updateFields.push('`history` = ?');
      params.push(data.history);
    }
    if (data.team_intro !== undefined) {
      updateFields.push('team_intro = ?');
      params.push(data.team_intro);
    }
    if (data.logo_url !== undefined) {
      updateFields.push('logo_url = ?');
      params.push(data.logo_url);
    }
    if (data.cover_image !== undefined) {
      updateFields.push('cover_image = ?');
      params.push(data.cover_image);
    }
    if (data.contact_info !== undefined) {
      updateFields.push('contact_info = ?');
      params.push(JSON.stringify(data.contact_info));
    }

    updateFields.push('updated_at = '+Math.floor(+new Date / 1000));
    params.push(data.enterprise_id);

    const sql = `UPDATE enterprise_about SET ${updateFields.join(', ')} WHERE enterprise_id = ?`;
    try {
      const result: rpcResult = await rpcPost("/update", { sql, params }, this.token);
      if (result.code === 0) {
        const about = await this.getAboutByEnterpriseId(data.enterprise_id);
        return { msg: "ok", data: about };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 根据企业ID获取关于我们
   */
  async getAboutByEnterpriseId(enterpriseId: number): Promise<ResponseData> {
    const sql = 'SELECT id, enterprise_id, company_name, `description`, vision, mission, `values`, `history`, team_intro, logo_url, cover_image, contact_info, created_at, updated_at FROM enterprise_about WHERE enterprise_id = ?';
    try {
      const result: rpcResult = await rpcPost("/select", { sql, params: [enterpriseId] }, this.token);     
      if (result.code === 0) {
        const data = JSON.parse(result.data.result);        
        return { msg: "ok", data:data&&data[0]||null };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 根据ID获取关于我们
   */
  async getAboutById(id: number): Promise<ResponseData> {
    const sql = 'SELECT id, enterprise_id, company_name, `description`, vision, mission, `values`, `history`, team_intro, logo_url, cover_image, contact_info, created_at, updated_at FROM enterprise_about WHERE id = ?';
    try {
      const result: rpcResult = await rpcPost("/select", { sql, params: [id] }, this.token);
      if (result.code === 0) {
        const data = JSON.parse(result.data.result);
        return { msg: "ok", data: data[0] };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  // ==================== 联系信息管理 ====================
  
  /**
   * 创建或更新联系信息
   */
  async upsertContact(data: Partial<Contact>): Promise<ResponseData> {
    const existing = await this.getContactByEnterpriseId(data.enterprise_id);
    
    if (existing.msg === "ok") {
      return this.updateContact(data);
    } else {
      return this.createContact(data);
    }
  }

  /**
   * 创建联系信息
   */
  async createContact(data: Partial<Contact>): Promise<ResponseData> {
    const sql = `INSERT INTO enterprise_contact (enterprise_id, contact_person, phone, email, address, wechat, qq, website, longitude, latitude, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;
    try {
      const result: rpcResult = await rpcPost("/insert", {
        sql,
        params: [
          data.enterprise_id,
          data.contact_person,
          data.phone,
          data.email,
          data.address,
          data.wechat,
          data.qq,
          data.website,
          data.longitude||0,
          data.latitude||0,
          Math.floor(+new Date / 1000),
          Math.floor(+new Date / 1000)
        ]
      }, this.token);
      if (result.code === 0) {
        const insertId = JSON.parse(result.data.result).lastId;
        const contact = await this.getContactById(insertId);
        return { msg: "ok", data: contact };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新联系信息
   */
  async updateContact(data: Partial<Contact>): Promise<ResponseData> {
    const updateFields = [];
    const params = [];

    if (data.contact_person !== undefined) {
      updateFields.push('contact_person = ?');
      params.push(data.contact_person);
    }
    if (data.phone !== undefined) {
      updateFields.push('phone = ?');
      params.push(data.phone);
    }
    if (data.email !== undefined) {
      updateFields.push('email = ?');
      params.push(data.email);
    }
    if (data.address !== undefined) {
      updateFields.push('address = ?');
      params.push(data.address);
    }
    if (data.wechat !== undefined) {
      updateFields.push('wechat = ?');
      params.push(data.wechat);
    }
    if (data.qq !== undefined) {
      updateFields.push('qq = ?');
      params.push(data.qq);
    }
    if (data.website !== undefined) {
      updateFields.push('website = ?');
      params.push(data.website);
    }
    if (data.work_time !== undefined) {
      updateFields.push('work_time = ?');
      params.push(data.work_time);
    }
    if (data.longitude !== undefined) {
      updateFields.push('longitude = ?');
      params.push(data.longitude);
    }
    if (data.latitude !== undefined) {
      updateFields.push('latitude = ?');
      params.push(data.latitude);
    }

    updateFields.push('updated_at ='+Math.floor(+new Date / 1000));
    params.push(data.enterprise_id);

    const sql = `UPDATE enterprise_contact SET ${updateFields.join(', ')} WHERE enterprise_id = ?`;
    try {
      const result: rpcResult = await rpcPost("/update", { sql, params }, this.token);
      if (result.code === 0) {
        const contact = await this.getContactByEnterpriseId(data.enterprise_id);
        return { msg: "ok", data: contact };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 根据企业ID获取联系信息
   */
  async getContactByEnterpriseId(enterpriseId: number): Promise<ResponseData> {
    const sql = 'SELECT id, enterprise_id, contact_person, phone, email, address, wechat, qq, website, work_time, longitude, latitude, created_at, updated_at FROM enterprise_contact WHERE enterprise_id = ?';
    try {
      const result: rpcResult = await rpcPost("/select", { sql, params: [enterpriseId] }, this.token);
      if (result.code === 0) {
        const data = JSON.parse(result.data.result);
        return { msg: "ok", data: data[0] };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 根据ID获取联系信息
   */
  async getContactById(id: number): Promise<ResponseData> {
    const sql = 'SELECT id, enterprise_id, contact_person, phone, email, address, wechat, qq, website, work_time, longitude, latitude, created_at, updated_at FROM enterprise_contact WHERE id = ?';
    try {
      const result: rpcResult = await rpcPost("/select", { sql, params: [id] }, this.token);
      if (result.code === 0) {
        const data = JSON.parse(result.data.result);
        return { msg: "ok", data: data[0] };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  // ==================== 产品管理 ====================
  
  /**
   * 创建产品
   */
  async createProduct(data: CreateProductReq): Promise<ResponseData> {
    const sql = `INSERT INTO enterprise_products (enterprise_id, name, \`description\`, category_id, price, image_urls, features, thumb, is_featured, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    try {
      const result: rpcResult = await rpcPost("/insert", {
        sql,
        params: [
          data.enterprise_id,
          data.name,
          data.description,
          data.category_id,
          data.price,
          data.image_urls,
          data.features,
          data.thumb,         
          data.is_featured ? 1 : 0,
          data.status !== false ? 1 : 0,
          Math.floor(+new Date / 1000),
          Math.floor(+new Date / 1000)
        ]
      }, this.token);     
      if (result.code === 0) {
        //meilisearch
        const meilisearch = new MeiliService('product');
        meilisearch.addDocuments([{
          id: result.data.lastId,
          title: data.name,
          description: data.description,
          category_id: data.category_id,
          thumb:data.thumb
        }]);
        await meilisearch.setSearchableFields(['title', 'description']);
        
        return { msg: "ok", data: null };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新产品
   */
  async updateProduct(id: number, data: Partial<CreateProductReq>): Promise<ResponseData> {
    const updateFields = [];
    const params = [];

    if (data.name !== undefined) {
      updateFields.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      updateFields.push('`description` = ?');
      params.push(data.description);
    }
    if (data.category_id !== undefined) {
      updateFields.push('category_id = ?');
      params.push(data.category_id);
    }
    if (data.price !== undefined) {
      updateFields.push('price = ?');
      params.push(data.price);
    }
    if (data.image_urls !== undefined) {
      updateFields.push('image_urls = ?');
      params.push(data.image_urls);
    }
    if (data.features !== undefined) {
      updateFields.push('features = ?');
      params.push(data.features);
    }
    if (data.thumb !== undefined) {
      updateFields.push('thumb = ?');
      params.push(data.thumb);
    }
   
    if (data.is_featured !== undefined) {
      updateFields.push('is_featured = ?');
      params.push(data.is_featured ? 1 : 0);
    }
    if (data.status !== undefined) {
      updateFields.push('status = ?');
      params.push(data.status ? 1 : 0);
    }

    updateFields.push('updated_at ='+Math.floor(+new Date / 1000));
    params.push(id);

    const sql = `UPDATE enterprise_products SET ${updateFields.join(', ')} WHERE id = ?`;
    try {
      const result: rpcResult = await rpcPost("/update", { sql, params }, this.token);
      if (result.code === 0) {
        //meilisearch
        const meilisearch = new MeiliService('product');
        meilisearch.updateDocuments([{
          id: id,
          title: data.name,
          description: data.description,
          category_id: data.category_id,
          thumb:data.thumb
        }]);
        await meilisearch.setSearchableFields(['title', 'description']);
        
        const product = await this.getProductById(id);
        return { msg: "ok", data: product };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 删除产品
   */
  async deleteProduct(id: number,enterpriseId:number): Promise<ResponseData> {
    const sql = 'UPDATE enterprise_products SET status=0 WHERE id = ? and enterprise_id=?';
    try {
      const result: rpcResult = await rpcPost("/update", { sql, params: [id,enterpriseId] }, this.token);
      if (result.code === 0 ) {
        return { msg: "ok", data:null};
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取产品列表
   */
  async getProducts(params: QueryParams): Promise<ResponseData> {
    let sql = 'SELECT id,enterprise_id,name,category_id,price,features,thumb,created_at FROM enterprise_products WHERE status=1';
    const queryParams = [];
    const conditions = [];

    if (params.enterprise_id) {
      conditions.push('enterprise_id = ?');
      queryParams.push(params.enterprise_id);
    }
    if (params.category_id) {
      conditions.push('category_id = ?');
      queryParams.push(params.category_id);
    }
    if (params.status !== undefined) {
      conditions.push('status = ?');
      queryParams.push(params.status);
    }
    if (params.is_featured !== undefined) {
      conditions.push('is_featured = ?');
      queryParams.push(params.is_featured ? 1 : 0);
    }
    if (params.keyword) {
      conditions.push('(name LIKE ? OR `description` LIKE ?)');
      queryParams.push(`%${params.keyword}%`, `%${params.keyword}%`);
    }

    if (conditions.length > 0) {
      sql += ' AND ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    // 获取总数
    const countSql = sql.replace('SELECT id,enterprise_id,name,category_id,price,features,thumb,created_at', 'SELECT COUNT(id) as total');
    const countResult: rpcResult = await rpcPost("/select", { sql: countSql, params: queryParams }, this.token);
    const total = countResult.code === 0 ? JSON.parse(countResult.data.result)[0].total : 0;

    // 分页
    const page = params.page || 1;
    const pageSize = params.page_size || 10;
    const offset = (page - 1) * pageSize;
    sql += ` LIMIT ${pageSize} OFFSET ${offset}`;

    const result: rpcResult = await rpcPost("/select", { sql, params: queryParams }, this.token);
    
    if (result.code === 0) {
      const data = JSON.parse(result.data.result);
      return {
        msg: "ok",
        data: {
          data,
          total,
          page,
          page_size: pageSize,
          total_pages: Math.ceil(total / pageSize)
        }
      };
    }
    return { msg: "err", data: null };
  }

  /**
   * 根据ID获取产品
   */
  async getProductById(id: number): Promise<ResponseData> {
    const sql = 'SELECT id, enterprise_id, name, `description`, category_id, price, image_urls, features, thumb, is_featured, status, created_at, updated_at FROM enterprise_products WHERE id = ?';
    const result: rpcResult = await rpcPost("/select", { sql, params: [id] }, this.token);
    
    if (result.code === 0) {
      const data = JSON.parse(result.data.result);
      return { msg: "ok", data: data[0] };
    }
    return { msg: "err", data: null };
  }

  // ==================== 文章管理 ====================

  /**
   * 创建文章
   */
  async createArticle(data: CreateArticleReq): Promise<ResponseData> {
    data.is_published = data.is_published == 'true' ? true : false;
    
    const sql = `INSERT INTO enterprise_articles (enterprise_id, title, content, summary, cover_image, category_id, tags, author, view_count, is_published, published_at, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 1, ?, ?)`;
    const now = Math.floor(Date.now() / 1000);
    try {
      const result: rpcResult = await rpcPost("/insert", {
        sql,
        params: [
          data.enterprise_id,
          data.title,
          data.content,
          data.summary || '',
          data.cover_image || '',
          data.category_id || 0,
          JSON.stringify(data.tags || []),
          data.author || '',
          data.is_published ? 1 : 0,
          data.published_at || now,
          Math.floor(+new Date / 1000),
          Math.floor(+new Date / 1000)
        ]
      }, this.token);
      if (result.code === 0) {
        //meilisearch
        const meilisearch = new MeiliService('articles');
        meilisearch.addDocuments([{
          id: result.data.lastId,
          title: data.title,
          description: data.summary,
        }]);
        await meilisearch.setSearchableFields(['title', 'description']);
        
        return { msg: "ok", data: null };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新文章
   */
  async updateArticle(id: number, data: UpdateArticleReq): Promise<ResponseData> {
    const updateFields = [];
    const params = [];
    data.is_published = data.is_published == 'true' ? true : false;
    
    if (data.title !== undefined) { updateFields.push('title = ?'); params.push(data.title); }
    if (data.content !== undefined) { updateFields.push('content = ?'); params.push(data.content); }
    if (data.summary !== undefined) { updateFields.push('summary = ?'); params.push(data.summary); }
    if (data.cover_image !== undefined) { updateFields.push('cover_image = ?'); params.push(data.cover_image); }
    if (data.category_id !== undefined) { updateFields.push('category_id = ?'); params.push(data.category_id); }
    if (data.tags !== undefined) { updateFields.push('tags = ?'); params.push(JSON.stringify(data.tags)); }
    if (data.author !== undefined) { updateFields.push('author = ?'); params.push(data.author); }
    if (data.is_published !== undefined) { updateFields.push('is_published = ?'); params.push(data.is_published ? 1 : 0); }
    if (data.published_at !== undefined) { updateFields.push('published_at = ?'); params.push(data.published_at); }
    updateFields.push('updated_at = ?'); params.push(Math.floor(Date.now() / 1000));
    params.push(id);
    const sql = `UPDATE enterprise_articles SET ${updateFields.join(', ')} WHERE id = ? AND status = 1`;
    try {
      
      const result: rpcResult = await rpcPost("/update", { sql, params }, this.token);
      if (result.code === 0) {
        //meilisearch
        const meilisearch = new MeiliService('articles');
        meilisearch.updateDocuments([{
          id: id,
          title: data.title,
          description: data.summary,
        }]);
        await meilisearch.setSearchableFields(['title', 'description']);
        
        return { msg: "ok", data: null };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 软删除文章
   */
  async deleteArticle(id: number): Promise<ResponseData> {
    const sql = `UPDATE enterprise_articles SET status = 0, updated_at = ? WHERE id = ? AND status = 1`;
    const params = [Math.floor(Date.now() / 1000), id];
    try {
      const result: rpcResult = await rpcPost("/update", { sql, params }, this.token);
      if (result.code === 0) {
        return { msg: "ok", data: null };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取文章详情
   */
  async getArticleById(id: number): Promise<ResponseData> {
    const sql = 'SELECT id, enterprise_id, title, content, summary, cover_image, category_id, tags, author, view_count, is_published, published_at, status, created_at, updated_at FROM enterprise_articles WHERE id = ? AND status = 1';
    try {
      const result: rpcResult = await rpcPost("/select", { sql, params: [id] }, this.token);
      if (result.code === 0) {
        const data = JSON.parse(result.data.result);
        if (data.length > 0) {
          this.incrementArticleViewCount(id);
          const article = data[0]; 
          return { msg: "ok", data: article };
        }
        return { msg: "not_found", data: null };
      }
      return { msg: "err", data: null };
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }
   /**
   * 关键词搜索需求
   * meilisearch,返回ids数组
   */ 
   async searchKeyword(keyword: string,type:string): Promise<any[]> {
    try {
      const meilisearch = new MeiliService(type);
      const result = await meilisearch.search(keyword); 
      return result.hits.map((item: any) => item.id);
    } catch (error: any) {
      return [];
    }
  }
  /**
   * 获取文章列表（分页、搜索、分类、is_published、status=1）
   */
  async getArticles(params: any): Promise<ResponseData> {
    let sql = 'SELECT id, enterprise_id, (select name from entity_detail_info where entity_id=enterprise_id)as enterprise_name, title, content, summary, cover_image, category_id, tags, author, view_count, is_published, published_at, status, created_at, updated_at FROM enterprise_articles WHERE status = 1';
    const queryParams = [];
    if (params.enterprise_id) { sql += ' AND enterprise_id = ?'; queryParams.push(params.enterprise_id); }
    if (params.category_id) { sql += ' AND category_id = ?'; queryParams.push(params.category_id); }
    if (params.is_published !== undefined) { sql += ' AND is_published = ?'; queryParams.push(params.is_published=='1' ? 1 : 0); }
    //if (params.keyword) { sql += ' AND (title LIKE ? OR content LIKE ?)'; queryParams.push(`%${params.keyword}%`, `%${params.keyword}%`); }
    if (params.keyword) { 
      const ids = await this.searchKeyword(params.keyword,'articles');
      if(ids.length>0){
        sql += ` AND id IN (${ids.map(() => '?').join(',')})`;
        queryParams.push(...ids);
      }
    }
    // 获取总数
    const countSql = sql.replace('SELECT id, enterprise_id, title, content, summary, cover_image, category_id, tags, author, view_count, is_published, published_at, status, created_at, updated_at', 'SELECT COUNT(id) as total');
    const countResult: rpcResult = await rpcPost("/select", { sql: countSql, params: queryParams }, this.token);
    let total = 0;
    if (countResult.code === 0 && countResult.data?.result) {
      const parsed = JSON.parse(countResult.data.result);
      if (Array.isArray(parsed) && parsed.length > 0) {
        total = parsed[0]?.total ?? 0;
      }
    }
    // 分页
    const page = params.page || 1;
    const pageSize = params.page_size || 10;
    const offset = (page - 1) * pageSize;
    sql += ` LIMIT ${pageSize} OFFSET ${offset}`;
 
    try {
      const result: rpcResult = await rpcPost("/select", { sql, params: queryParams }, this.token); 
      if (result.code === 0) {
        const data = JSON.parse(result.data.result);
        return {
          msg: "ok",
          data: {
            data,
            total,
            page,
            page_size: pageSize,
            total_pages: Math.ceil(total / pageSize)
          }
        };
      }
      return { msg: "err", data: null };
    } catch (error) {
      console.error(error);
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 增加文章浏览量
   */
  async incrementArticleViewCount(id: number): Promise<void> {
    const sql = 'UPDATE enterprise_articles SET view_count = view_count + 1 WHERE id = ?';
    await rpcPost("/update", { sql, params: [id] }, this.token);
  }

  // ==================== 案例管理 ====================
  
  /**
   * 创建案例
   */
  async createCase(data: CreateCaseReq): Promise<ResponseData> {
    data.is_published = data.is_published == 'true' ? true : false;
    
    const sql = `INSERT INTO enterprise_cases (enterprise_id, title, \`description\`, content, cover_image, image_urls, video_url, category_id, is_featured, is_published, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    try {
      const result: rpcResult = await rpcPost("/insert", {
        sql,
        params: [
          data.enterprise_id,
          data.title,
          data.description,
          data.content,
          data.cover_image || '',
          data.image_urls || '[]',
          data.video_url || '',
          data.category_id || 0,
          data.is_featured ? 1 : 0,
          data.is_published ? 1 : 0,
          data.status !== false ? 1 : 0,
          Math.floor(+new Date / 1000),
          Math.floor(+new Date / 1000)
        ]
      }, this.token);
     
      if (result.code === 0) {
        //meilisearch
        const meilisearch = new MeiliService('case');
        meilisearch.addDocuments([{
          id: result.data.lastId,
          title: data.title,
          description: data.description,
        }]);
        await meilisearch.setSearchableFields(['title', 'description']);
      
        return { msg: "ok", data: null };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新案例
   */
  async updateCase(id: number, data: Partial<CreateCaseReq>): Promise<ResponseData> {
    data.is_published = data.is_published == 'true' ? true : false;
    
    const updateFields = [];
    const params = [];

    if (data.title !== undefined) {
      updateFields.push('title = ?');
      params.push(data.title);
    }
    if (data.description !== undefined) {
      updateFields.push('`description` = ?');
      params.push(data.description);
    }
    if (data.content !== undefined) {
      updateFields.push('content = ?');
      params.push(data.content);
    }
    if (data.cover_image !== undefined) {
      updateFields.push('cover_image = ?');
      params.push(data.cover_image);
    }
    if (data.image_urls !== undefined) {
      updateFields.push('image_urls = ?');
      params.push(data.image_urls);
    }
    if (data.video_url !== undefined) {
      updateFields.push('video_url = ?');
      params.push(data.video_url);
    }
    if (data.category_id !== undefined) {
      updateFields.push('category_id = ?');
      params.push(data.category_id);
    }
    if (data.is_featured !== undefined) {
      updateFields.push('is_featured = ?');
      params.push(data.is_featured ? 1 : 0);
    }
    if (data.is_published !== undefined) {
      updateFields.push('is_published = ?');
      params.push(data.is_published ? 1 : 0);
    }
    if (data.status !== undefined) {
      updateFields.push('status = ?');
      params.push(data.status ? 1 : 0);
    }

    updateFields.push('updated_at ='+Math.floor(+new Date / 1000));
    params.push(id);

    const sql = `UPDATE enterprise_cases SET ${updateFields.join(', ')} WHERE id = ?`;
    try {
      const result: rpcResult = await rpcPost("/update", { sql, params }, this.token);
      if (result.code === 0) {
        //meilisearch
        const meilisearch = new MeiliService('case');
        meilisearch.updateDocuments([{
          id: id,
          title: data.title,
          description: data.description,
        }]);
        await meilisearch.setSearchableFields(['title', 'description']);
        await meilisearch.setFilterableFields(['category_id']);
        
        return { msg: "ok", data: null };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 删除案例
   */
  async deleteCase(id: number, enterpriseId: number): Promise<ResponseData> {
    const sql = 'UPDATE enterprise_cases SET status=0 WHERE id = ? AND enterprise_id = ?';
    try {
      const result: rpcResult = await rpcPost("/update", { sql, params: [id, enterpriseId] }, this.token);
      if (result.code === 0) {
        return { msg: "ok", data: null };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取案例列表
   */
  async getCases(params: QueryParams): Promise<ResponseData> {
    
    let sql = 'SELECT id, enterprise_id, title, `description`, content, cover_image, image_urls, video_url, category_id, is_featured, is_published, status, created_at, updated_at FROM enterprise_cases WHERE status = 1';
    const queryParams = [];
    const conditions = [];

    if (params.enterprise_id) {
      conditions.push('enterprise_id = ?');
      queryParams.push(params.enterprise_id);
    }
    if (params.category_id) {
      conditions.push('category_id = ?');
      queryParams.push(params.category_id);
    }
    if (params.status !== undefined) {
      conditions.push('status = ?');
      queryParams.push(params.status);
    }
    if (params.is_published !== undefined) {
      conditions.push('is_published = ?');
      queryParams.push(params.is_published);
    }
    if (params.keyword) {
      conditions.push('(title LIKE ? OR `description` LIKE ?)');
      queryParams.push(`%${params.keyword}%`, `%${params.keyword}%`);
    }

    if (conditions.length > 0) {
      sql += ' AND ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    // 获取总数
    const countSql = sql.replace('SELECT id, enterprise_id, title, `description`, content, cover_image, image_urls, video_url, category_id, is_featured, is_published, status, created_at, updated_at', 'SELECT COUNT(id) as total');
    const countResult: rpcResult = await rpcPost("/select", { sql: countSql, params: queryParams }, this.token);
    const total = countResult.code === 0 ? JSON.parse(countResult.data.result)[0].total : 0;

    // 分页
    const page = params.page || 1;
    const pageSize = params.page_size || 10;
    const offset = (page - 1) * pageSize;
    sql += ` LIMIT ${pageSize} OFFSET ${offset}`;

    const result: rpcResult = await rpcPost("/select", { sql, params: queryParams }, this.token);
    
    if (result.code === 0) {
      const data = JSON.parse(result.data.result);
      return {
        msg: "ok",
        data: {
          data,
          total,
          page,
          page_size: pageSize,
          total_pages: Math.ceil(total / pageSize)
        }
      };
    }
    return { msg: "err", data: null };
  }

  /**
   * 根据ID获取案例
   */
  async getCaseById(id: number): Promise<ResponseData> {
    const sql = 'SELECT id, enterprise_id, title, `description`, content, cover_image, image_urls, video_url, category_id, is_featured, is_published, status, created_at, updated_at FROM enterprise_cases WHERE id = ? AND status = 1';
    const result: rpcResult = await rpcPost("/select", { sql, params: [id] }, this.token);
    
    if (result.code === 0) {
      const data = JSON.parse(result.data.result);
      return { msg: "ok", data: data[0] };
    }
    return { msg: "err", data: null };
  }

  // ==================== 主页设置管理 ====================
  
  /**
   * 创建或更新主页设置
   */
  async upsertSettings(data: Partial<Settings>): Promise<ResponseData> {
    const existing = await this.getSettingsByEnterpriseId(data.enterprise_id);
    
    if (existing.msg === "ok") {
      return this.updateSettings(data);
    } else {
      return this.createSettings(data);
    }
  }

  /**
   * 创建主页设置
   */
  async createSettings(data: Partial<Settings>): Promise<ResponseData> {
    const sql = `INSERT INTO enterprise_settings (enterprise_id, show_banner, show_about, show_products, show_articles, show_cases, show_contact, seo_title, seo_description, seo_keywords, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    try {
      const result: rpcResult = await rpcPost("/insert", {
        sql,
        params: [
          data.enterprise_id,
          data.show_banner !== undefined ? (data.show_banner=='true' ? 1 : 0) : 1,
          data.show_about !== undefined ? (data.show_about=='true' ? 1 : 0) : 1,
          data.show_products !== undefined ? (data.show_products=='true' ? 1 : 0) : 1,
          data.show_articles !== undefined ? (data.show_articles=='true' ? 1 : 0) : 1,
          data.show_cases !== undefined ? (data.show_cases=='true' ? 1 : 0) : 1,
          data.show_contact !== undefined ? (data.show_contact=='true' ? 1 : 0) : 1,
          data.seo_title || '',
          data.seo_description || '',
          data.seo_keywords || '',
          Math.floor(+new Date / 1000),
          Math.floor(+new Date / 1000)
        ]
      }, this.token);
      if (result.code === 0) {         
        return { msg: "ok", data: null };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新主页设置
   */
  async updateSettings(data: Partial<Settings>): Promise<ResponseData> {
    const updateFields = [];
    const params = [];

    if (data.show_banner !== undefined) {
      updateFields.push('show_banner = ?');
      params.push(data.show_banner=='true' ? 1 : 0);
    }
    if (data.show_about !== undefined) {
      updateFields.push('show_about = ?');
      params.push(data.show_about=='true' ? 1 : 0);
    }
    if (data.show_products !== undefined) {
      updateFields.push('show_products = ?');
      params.push(data.show_products=='true' ? 1 : 0);
    }
    if (data.show_articles !== undefined) {
      updateFields.push('show_articles = ?');
      params.push(data.show_articles=='true' ? 1 : 0);
    }
    if (data.show_cases !== undefined) {
      updateFields.push('show_cases = ?');
      params.push(data.show_cases=='true' ? 1 : 0);
    }
    if (data.show_contact !== undefined) {
      updateFields.push('show_contact = ?');
      params.push(data.show_contact=='true' ? 1 : 0);
    }
    if (data.seo_title !== undefined) {
      updateFields.push('seo_title = ?');
      params.push(data.seo_title);
    }
    if (data.seo_description !== undefined) {
      updateFields.push('seo_description = ?');
      params.push(data.seo_description);
    }
    if (data.seo_keywords !== undefined) {
      updateFields.push('seo_keywords = ?');
      params.push(data.seo_keywords);
    }

    updateFields.push('updated_at = ?');
    params.push(Math.floor(+new Date / 1000));
    params.push(data.enterprise_id);

    const sql = `UPDATE enterprise_settings SET ${updateFields.join(', ')} WHERE enterprise_id = ?`;
    try {
      const result: rpcResult = await rpcPost("/update", { sql, params }, this.token);
      if (result.code === 0) { 
        return { msg: "ok", data: null };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 根据企业ID获取主页设置
   */
  async getSettingsByEnterpriseId(enterpriseId: number): Promise<ResponseData> {
    const sql = 'SELECT id, enterprise_id, show_banner, show_about, show_products, show_articles, show_cases, show_contact, seo_title, seo_description, seo_keywords, created_at, updated_at FROM enterprise_settings WHERE enterprise_id = ?';
    try {
      const result: rpcResult = await rpcPost("/select", { sql, params: [enterpriseId] }, this.token); 
      if (result.code === 0) {
        const data = JSON.parse(result.data.result);
        return { msg: "ok", data: data[0] };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 根据ID获取主页设置
   */
  async getSettingsById(id: number): Promise<ResponseData> {
    const sql = 'SELECT id, enterprise_id, show_banner, show_about, show_products, show_articles, show_cases, show_contact, seo_title, seo_description, seo_keywords, created_at, updated_at FROM enterprise_settings WHERE id = ?';
    try {
      const result: rpcResult = await rpcPost("/select", { sql, params: [id] }, this.token);
      if (result.code === 0) {
        const data = JSON.parse(result.data.result);
        return { msg: "ok", data: data[0] };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  // ==================== 分类管理 ====================

  /**
   * 创建分类
   */
  async createCategory(data: CreateCategoryReq): Promise<ResponseData> {
    const sql = `INSERT INTO enterprise_category (enterprise_id, name, type, sort_order, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    try {
      const now = Math.floor(+new Date() / 1000);
      const result: rpcResult = await rpcPost("/insert", {
        sql,
        params: [
          data.enterprise_id,
          data.name,
          data.type,
          data.sort_order || 0,
          data.status !== undefined ? data.status : 1,
          Math.floor(+new Date / 1000),
          Math.floor(+new Date / 1000)
        ]
      }, this.token);
      if (result.code === 0) {       
        return { msg: "ok", data: null };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 更新分类
   */
  async updateCategory(id: number, data: UpdateCategoryReq): Promise<ResponseData> {
    const updateFields = [];
    const params = [];
    if (data.name !== undefined) {
      updateFields.push('name = ?');
      params.push(data.name);
    }
    if (data.type !== undefined) {
      updateFields.push('type = ?');
      params.push(data.type);
    }
    if (data.sort_order !== undefined) {
      updateFields.push('sort_order = ?');
      params.push(data.sort_order);
    }
    if (data.status !== undefined) {
      updateFields.push('status = ?');
      params.push(data.status);
    }
    updateFields.push('updated_at = ?');
    params.push(Math.floor(+new Date() / 1000));
    params.push(id);
    const sql = `UPDATE enterprise_category SET ${updateFields.join(', ')} WHERE id = ?`;
    try {
      const result: rpcResult = await rpcPost("/update", { sql, params }, this.token);
      if (result.code === 0) {
        const category = await this.getCategoryById(id);
        return { msg: "ok", data: category };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 删除分类（逻辑删除）
   */
  async deleteCategory(id: number,enterpriseId:number): Promise<ResponseData> {
    const sql = 'UPDATE enterprise_category SET status = 0 WHERE id = ? and enterprise_id=?';
    try {
      const result: rpcResult = await rpcPost("/update", { sql, params: [id,enterpriseId] }, this.token);
      if (result.code === 0) {
        return { msg: "ok", data: { id } };
      } else {
        return { msg: "err", data: null };
      }
    } catch (error) {
      return { msg: "server_error", data: null };
    }
  }

  /**
   * 获取分类列表
   */
  async getCategories(params: { enterprise_id?: number; type?: string; status?: number }): Promise<ResponseData> {
    let sql = 'SELECT id, enterprise_id, name, type, sort_order, status, created_at, updated_at FROM enterprise_category WHERE status=1';
    const queryParams = [];
    if (params.enterprise_id) {
      sql += ' AND enterprise_id = ?';
      queryParams.push(params.enterprise_id);
    }
    if (params.type) {
      sql += ' AND type = ?';
      queryParams.push(params.type);
    }
    if (params.status !== undefined) {
      sql += ' AND status = ?';
      queryParams.push(params.status);
    } 
    sql += ' ORDER BY sort_order ASC, id ASC';
    const result: rpcResult = await rpcPost("/select", { sql, params: queryParams }, this.token);
    if (result.code === 0) {
      const data = JSON.parse(result.data.result);
      return { msg: "ok", data };
    }
    return { msg: "err", data: null };
  }

  /**
   * 根据ID获取分类
   */
  async getCategoryById(id: number): Promise<ResponseData> {
    const sql = 'SELECT id, enterprise_id, name, type, sort_order, status, created_at, updated_at FROM enterprise_category WHERE id = ?';
    const result: rpcResult = await rpcPost("/select", { sql, params: [id] }, this.token);
    if (result.code === 0) {
      const data = JSON.parse(result.data.result);
      return { msg: "ok", data: data[0] };
    }
    return { msg: "err", data: null };
  }

  // ==================== 获取完整企业主页数据 ====================
  
  /**
   * 获取企业主页完整数据
   */
  async getHomepage(enterpriseId: number): Promise<ResponseData> {
    const [banners, about, contact, products, articles, cases, settings] = await Promise.all([
      this.getBanners(enterpriseId),
      this.getAboutByEnterpriseId(enterpriseId),
      this.getContactByEnterpriseId(enterpriseId),
      this.getProducts({ enterprise_id: enterpriseId, page: 1, page_size: 6 }),
      this.getArticles({ enterprise_id: enterpriseId, page: 1, page_size: 6 }),
      this.getCases({ enterprise_id: enterpriseId, page: 1, page_size: 6 }),
      this.getSettingsByEnterpriseId(enterpriseId)
    ]);

    return {
      msg: "ok",
      data: {
        banners: banners.data,
        about: about.data,
        contact: contact.data,
        products: products.data,
        articles: articles.data,
        cases: cases.data,
        settings: settings.data
      }
    };
  }
} 