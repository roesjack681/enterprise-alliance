import { body } from "express-validator";

// ==================== 轮播图验证 ====================

export const bannerForm = [
  body("title").notEmpty().isLength({ max: 100 }),
  body("image_url").notEmpty().isURL(),
  // body("link_url").optional().isURL(),
  // body("sort_order").optional().isInt({ min: 0 }),
  // body("status").optional().isInt({ min: 0, max: 1 }),
];

export const bannerUpdateForm = [
  body("id").isInt({ min: 1 }),
  body("title").optional().isLength({ max: 100 }),
  body("image_url").optional().isURL(),
  //body("link_url").optional(),
  //body("sort_order").optional().isInt({ min: 0 }),  
];

// ==================== 关于我们验证 ====================

export const aboutForm = [
  body("company_name").notEmpty().isLength({ max: 100 }),
  body("description").notEmpty().isLength({ max: 2000 }),
  body("logo_url").optional().isURL(),
];

// ==================== 联系信息验证 ====================

export const contactForm = [
  body("contact_person").notEmpty().isLength({ max: 50 }),
  body("phone").notEmpty().matches(/^1[3-9]\d{9}$/),
  body("email").optional().isEmail(),
  body("address").notEmpty().isLength({ max: 200 }),
  body("wechat").optional().isLength({ max: 50 }),
  body("qq").optional().isLength({ max: 20 }),
  body("website").optional().isURL(),
  // body("longitude").optional().isFloat({ min: -180, max: 180 }),
  // body("latitude").optional().isFloat({ min: -90, max: 90 }),
];

// ==================== 产品验证 ====================

export const productForm = [
  body("name").notEmpty().isLength({ max: 100 }),
  body("description").notEmpty(),
  body("category_id").isInt({ min: 1 }), // 分类ID
  body("price").optional().isFloat({ min: 0 }),
  body("image_urls").isString(),
  body("features").isString().isLength({ max: 500 }),
  body("thumb").isString().isLength({ max: 300 }), // 产品主图
  // body("specifications").optional().isLength({ max: 1000 }),
  // body("is_featured").optional().isBoolean(),
  // body("status").optional().isInt({ min: 0, max: 1 }),
];

export const productUpdateForm = [
  body("id").isInt({ min: 1 }),
  body("name").notEmpty().isLength({ max: 100 }),
  body("description").notEmpty(),
  body("category_id").isInt({ min: 1 }), // 分类ID
  body("price").optional().isFloat({ min: 0 }),
  body("image_urls").isString(),
  body("features").isString().isLength({ max: 500 }),
  body("thumb").isString().isLength({ max: 300 }), // 产品主图
  // body("specifications").optional().isLength({ max: 1000 }),
  // body("is_featured").optional().isBoolean(),
  // body("status").optional().isInt({ min: 0, max: 1 }),
];

// ==================== 文章验证 ====================

export const articleForm = [
  body("title").notEmpty().isLength({ max: 255 }),
  body("content").notEmpty(),
  body("summary").optional().isLength({ max: 500 }),
  body("cover_image").optional().isString(),
  body("category_id").optional().isInt(),
  // body("tags").optional().isArray(),
  body("author").optional().isString(),
  body("is_published").isString(),
  //body("published_at").optional().isInt(),
];

export const articleUpdateForm = [
  body("id").isInt({ min: 1 }),
  body("title").optional().isLength({ max: 255 }),
  body("content").optional(),
  body("summary").optional().isLength({ max: 500 }),
  body("cover_image").optional().isString(),
  body("category_id").optional().isInt(),
 // body("tags").optional().isArray(),
  body("author").optional().isString(),
  body("is_published").optional().isBoolean(),
  //body("published_at").optional().isString(),
];

// ==================== 案例验证 ====================

export const caseForm = [
  body("title").notEmpty().isLength({ max: 255 }),
  body("description").notEmpty(),
  body("content").notEmpty(),
  body("cover_image").optional().isString(),
  body("image_urls").optional().isString(),
  body("video_url").optional().isString(),
  body("category_id").optional().isInt({ min: 1 }), // 分类ID
  body("is_featured").optional().isBoolean(),
  body("is_published").optional().isBoolean(),
  body("status").optional().isInt({ min: 0, max: 1 }),
];

export const caseUpdateForm = [
  body("id").isInt({ min: 1 }),
  body("title").optional().isLength({ max: 255 }),
  body("description").optional(),
  body("content").optional(),
  body("cover_image").optional().isString(),
  body("image_urls").optional().isString(),
  body("video_url").optional().isString(),
  body("category_id").optional().isInt({ min: 1 }), // 分类ID
  body("is_featured").optional().isBoolean(),
  body("is_published").optional().isBoolean(),
  body("status").optional().isInt({ min: 0, max: 1 }),
];

// ==================== 主页设置验证 ====================

export const settingsForm = [
  body("show_banner").optional().isBoolean(),
  body("show_about").optional().isBoolean(),
  body("show_products").optional().isBoolean(),
  body("show_articles").optional().isBoolean(),
  body("show_cases").optional().isBoolean(),
  body("show_contact").optional().isBoolean(),
  body("seo_title").optional().isLength({ max: 255 }),
  body("seo_description").optional().isLength({ max: 500 }),
  body("seo_keywords").optional().isLength({ max: 500 }),
];

// ==================== 分类验证 ====================
export const categoryForm = [
  body("name").notEmpty().isLength({ max: 100 }), // 分类名称
  body("type").notEmpty().isIn(["product", "article", "case"]), // 分类类型
  // body("sort_order").optional().isInt({ min: 0 }), // 排序
  // body("status").optional().isInt({ min: 0, max: 1 }), // 状态
];

export const categoryUpdateForm = [
  body("id").isInt({ min: 1 }), // 分类ID
  body("name").optional().isLength({ max: 100 }), // 分类名称
  body("type").optional().isIn(["product", "article", "case"]), // 分类类型
  // body("sort_order").optional().isInt({ min: 0 }), // 排序
  // body("status").optional().isInt({ min: 0, max: 1 }), // 状态
];

// ==================== 通用查询验证 ====================

export const queryForm = [
  body("page").optional().isInt({ min: 1 }),
  body("page_size").optional().isInt({ min: 1, max: 100 }),
  body("keyword").optional().isLength({ max: 100 }),
  body("category_id").optional().isInt({ min: 1 }), // 分类ID
  body("status").optional().isInt({ min: 0, max: 1 }),
  body("is_featured").optional().isBoolean(),
];

export const idForm = [
  body("id").isInt({ min: 1 }),
];

export const enterpriseIdForm = [
  body("enterprise_id").isInt({ min: 1 }),
]; 