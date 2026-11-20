import { Router } from 'express';
import { HomepageService } from './service';
import { 
  httpSuccess,  
  handleException,
  validate,
  http400Error
} from '../../common/common';
import { getLang } from '../../lang';
import * as form from './form';
import { articleForm, articleUpdateForm } from './form';

const router = Router();

// ==================== 轮播图管理 ====================
/**
 * 创建轮播图
 */
router.post('/createBanner', validate(form.bannerForm), async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const data = {
      ...req.body,
      enterprise_id: req["entity_id"]
    };
    const result = await service.createBanner(data);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => httpSuccess(res, null, getLang("failure")),
      server_error: () => httpSuccess(res, null, getLang("server_error")),
      default: () => httpSuccess(res, null, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "createBanner");
  }
});

/**
 * 更新轮播图
 */
router.post('/updateBanner', validate(form.bannerUpdateForm), async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const id = parseInt(req.body.id);
    const enterpriseId = req["entity_id"];
    const result = await service.updateBanner({ id, ...req.body, enterprise_id: enterpriseId });
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => httpSuccess(res, null, getLang("failure")),
      server_error: () => httpSuccess(res, null, getLang("server_error")),
      default: () => httpSuccess(res, null, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "updateBanner");
  }
});

/**
 * 删除轮播图
 */
router.post('/deleteBanner', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const id = parseInt(req.body.id);
    const enterpriseId = req["entity_id"];
    const result = await service.deleteBanner(id,enterpriseId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => httpSuccess(res, null, getLang("failure")),
      server_error: () => httpSuccess(res, null, getLang("server_error")),
      default: () => httpSuccess(res, null, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "deleteBanner");
  }
});

/**
 * 获取轮播图列表
 */
router.post('/getBanners', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const enterpriseId = parseInt(req.body.enterprise_id);
    const result = await service.getBanners(enterpriseId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getBanners");
  }
});

// ==================== 关于我们管理 ====================

/**
 * 创建或更新关于我们
 */
router.post('/upsertAbout', validate(form.aboutForm), async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const data = {
      ...req.body,
      enterprise_id: req["entity_id"]
    };
    const result = await service.upsertAbout(data);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "saveAbout");
  }
});
/**
 * 获取关于我们
 */
router.post('/getAbout', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const enterpriseId = parseInt(req.body.enterpriseId);
    const result = await service.getAboutByEnterpriseId(enterpriseId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getAbout");
  }
});

// ==================== 联系信息管理 ====================
/**
 * 创建或更新联系信息
 */
router.post('/upsertContact', validate(form.contactForm), async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const data = {
      ...req.body,
      enterprise_id: req["entity_id"]
    };
    const result = await service.upsertContact(data);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "saveContact");
  }
});
/**
 * 获取联系信息
 */
router.post('/getContact', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const enterpriseId = parseInt(req.body.enterpriseId);
    const result = await service.getContactByEnterpriseId(enterpriseId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getContact");
  }
});

// ==================== 产品管理 ====================
/**
 * 创建产品
 */
router.post('/createProduct', validate(form.productForm), async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const data = {
      ...req.body,
      enterprise_id: req["entity_id"]
    };
    const result = await service.createProduct(data);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "createProduct");
  }
});
/**
 * 更新产品
 */
router.post('/updateProduct', validate(form.productUpdateForm), async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const id = parseInt(req.body.id);
    const result = await service.updateProduct(id, req.body);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "updateProduct");
  }
});
/**
 * 删除产品
 */
router.post('/deleteProduct', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const id = parseInt(req.body.id);
    const enterpriseId = req["entity_id"];
    const result = await service.deleteProduct(id,enterpriseId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "deleteProduct");
  }
});
/**
 * 获取产品列表
 */
router.post('/getProducts', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const params = {
      page: parseInt(req.body.page) || 1,
      page_size: parseInt(req.body.page_size) || 10,
      enterprise_id: req.body.enterprise_id ? parseInt(req.body.enterprise_id) : undefined,
      category_id: req.body.category_id,
      status: req.body.status,
      is_featured: req.body.is_featured !== undefined ? req.body.is_featured === true : undefined,
      keyword: req.body.keyword
    };
    const result = await service.getProducts(params);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getProducts");
  }
});
/**
 * 获取产品详情
 */
router.post('/getProduct', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const id = parseInt(req.body.id);
    const result = await service.getProductById(id);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getProductDetail");
  }
});

// ==================== 文章管理 ====================

/**
 * 创建文章
 */
router.post('/createArticle', validate(articleForm), async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const data = {
      ...req.body,
      enterprise_id: req["entity_id"]
    };
    const result = await service.createArticle(data);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "createArticle");
  }
});

/**
 * 更新文章
 */
router.post('/updateArticle', validate(articleUpdateForm), async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const id = parseInt(req.body.id);
   
    const result = await service.updateArticle(id, req.body);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "updateArticle");
  }
});

/**
 * 删除文章（软删除）
 */
router.post('/deleteArticle', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const id = parseInt(req.body.id);
    const result = await service.deleteArticle(id);
    const handlerMap = {
      ok: () => httpSuccess(res, null, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "deleteArticle");
  }
});

/**
 * 获取文章详情
 */
router.post('/getArticle', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const id = parseInt(req.body.id);
    const result = await service.getArticleById(id);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      not_found: () => http400Error(res, getLang("not_found")),
      err: () => http400Error(res, getLang("failure")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getArticle");
  }
});

/**
 * 获取文章列表
 */
router.post('/getArticles', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const params = {
      page: parseInt(req.body.page) || 1,
      page_size: parseInt(req.body.page_size) || 10,
      enterprise_id: req.body.enterprise_id ? parseInt(req.body.enterprise_id) : undefined,
      category_id: req.body.category_id,
      is_published: req.body.is_published|| undefined,
      keyword: req.body.keyword
    }; 
    const result = await service.getArticles(params);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      server_error: () => http400Error(res, getLang("server_error")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getArticles");
  }
});

// ==================== 案例管理 ====================
/**
 * 创建案例
 */
router.post('/createCase', validate(form.caseForm), async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const data = {
      ...req.body,
      enterprise_id: req["entity_id"]
    };
    const result = await service.createCase(data);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "createCase");
  }
});
/**
 * 更新案例
 */
router.post('/updateCase', validate(form.caseUpdateForm), async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const id = parseInt(req.body.id);
    const result = await service.updateCase(id, req.body);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "updateCase");
  }
});
/**
 * 删除案例
 */
router.post('/deleteCase', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const id = parseInt(req.body.id);
    const enterpriseId = req["entity_id"];
    const result = await service.deleteCase(id, enterpriseId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "deleteCase");
  }
});
/**
 * 获取案例列表
 */
router.post('/getCases', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const params = {
      page: parseInt(req.body.page) || 1,
      page_size: parseInt(req.body.page_size) || 10,
      enterprise_id: req.body.enterprise_id ? parseInt(req.body.enterprise_id) : undefined,
      category_id: req.body.category_id,
      status: req.body.status,
      is_featured: req.body.is_featured !== undefined ? req.body.is_featured === true : undefined,
      is_published: req.body.is_published|| undefined,
      keyword: req.body.keyword
    };
    const result = await service.getCases(params);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getCases");
  }
});
/**
 * 获取案例详情
 */
router.post('/getCase', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const id = parseInt(req.body.id);
    const result = await service.getCaseById(id);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getCaseDetail");
  }
});

// ==================== 主页设置管理 ====================
/**
 * 创建或更新主页设置
 */
router.post('/upsertSettings', validate(form.settingsForm), async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const data = {
      ...req.body,
      enterprise_id: req["entity_id"]
    };
    const result = await service.upsertSettings(data);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "saveSettings");
  }
});
/**
 * 获取主页设置
 */
router.post('/getSettings', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const enterpriseId = parseInt(req.body.enterpriseId);
    const result = await service.getSettingsByEnterpriseId(enterpriseId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getSettings");
  }
});

// ==================== 分类管理 ====================
/**
 * 创建分类
 */
router.post('/createCategory', validate(form.categoryForm), async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const data = {
      ...req.body,
      enterprise_id: req["entity_id"]
    };
    const result = await service.createCategory(data);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "createCategory");
  }
});

/**
 * 更新分类
 */
router.post('/updateCategory', validate(form.categoryUpdateForm), async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const id = parseInt(req.body.id);
    const result = await service.updateCategory(id, req.body);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "updateCategory");
  }
});

/**
 * 删除分类
 */
router.post('/deleteCategory', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const id = parseInt(req.body.id);
    const enterpriseId = req["entity_id"];
    const result = await service.deleteCategory(id,enterpriseId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "deleteCategory");
  }
});

/**
 * 获取分类列表
 */
router.post('/getCategories', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const params = {
      enterprise_id: req.body.enterprise_id ? parseInt(req.body.enterprise_id) : req["entity_id"],
      type: req.body.type,
      status: req.body.status
    };
    const result = await service.getCategories(params);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getCategories");
  }
});

/**
 * 获取单个分类
 */
router.post('/getCategory', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const id = parseInt(req.body.id);
    const result = await service.getCategoryById(id);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getCategory");
  }
});

// ==================== 获取完整企业主页数据 ====================
/**
 * 获取企业主页完整数据
 */
router.post('/getHomepage', async (req, res) => {
  try {
    const service = new HomepageService(req["token"]);
    const enterpriseId = parseInt(req.body.enterpriseId);
    const result = await service.getHomepage(enterpriseId);
    const handlerMap = {
      ok: () => httpSuccess(res, result.data, getLang("success")),
      err: () => http400Error(res, getLang("failure")),
      default: () => http400Error(res, getLang("server_error")),
    };
    return (handlerMap[result.msg] || handlerMap["default"])();
  } catch (error) {
    return handleException(res, error, "getHomepage");
  }
});

export default router; 