import { body } from "express-validator";

// 服务产品相关表单验证
export const serviceProductForm = [
  body("title").notEmpty().isLength({ max: 100 }),
  body("description").notEmpty(),
  body("category_id").isInt({ min: 1 }),
  body("sub_category_id").isInt({ min: 1 }),
  body("price").isFloat({ min: 0 }),
  body("price_type").isInt({ min: 1, max: 2 }),
  body("unit").notEmpty(),
  body("province").isInt({ min: 1 }),
  body("city").isInt({ min: 1 }),
  body("district").isInt({ min: 1 }),
  body("address").notEmpty(),
  // body("contact_name").notEmpty(),
  // body("contact_phone").notEmpty(),
  // body("service_area").notEmpty(),
  // body("service_time").notEmpty(),
];

export const serviceProductUpdateForm = [
  body("id").isInt({ min: 1 }),
  body("title").optional().isLength({ max: 100 }),
  body("description").optional().isLength({ max: 2000 }),
  body("price").optional().isFloat({ min: 0 }),
  body("price_type").optional().isInt({ min: 1, max: 2 }),
  body("unit").optional().notEmpty(),
  body("address").optional().notEmpty(),
  body("contact_name").optional().notEmpty(),
  body("contact_phone").optional().notEmpty(),
  body("service_area").optional().notEmpty(),
  body("service_time").optional().notEmpty(),
];

export const serviceProductQueryForm = [
  body("page").isInt({ min: 1 }),
  body("page_size").isInt({ min: 1, max: 100 }),
  body("category_id").optional().isInt({ min: 1 }),
  body("sub_category_id").optional().isInt({ min: 1 }),
  body("province").optional().isInt({ min: 1 }),
  body("city").optional().isInt({ min: 1 }),
  body("district").optional().isInt({ min: 1 }),
  body("price_min").optional().isFloat({ min: 0 }),
  body("price_max").optional().isFloat({ min: 0 }),
  body("price_type").optional().isInt({ min: 1, max: 2 }),
  body("status").optional().isInt({ min: 0, max: 3 }),
  body("sort_by")
    .optional()
    .isIn(["create_time", "price", "view_count", "favorite_count"]),
  body("sort_order").optional().isIn(["asc", "desc"]),
];

export const serviceAuditForm = [
  body("service_id").isInt({ min: 1 }),
  body("status").isInt({ min: 0, max: 4 }),
  body("remark").optional().isLength({ max: 500 }),
];

export const serviceFavoriteForm = [
  body("service_id").isInt({ min: 1 }),
  body("action").isIn(["add", "remove"]),
];

export const servicetypeForm = [
  body("entity_id"),
];

export const serviceIdForm = [body("id").isInt({ min: 1 })];
