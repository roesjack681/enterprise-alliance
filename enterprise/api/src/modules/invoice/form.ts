import { body } from "express-validator";

// 发票信息创建表单验证
export const createInvoiceForm = [
  body("title").notEmpty().isLength({ max: 100 }),
  body("tax_number").notEmpty().isLength({ max: 30 }),
  body("invoice_type").isInt({ min: 1, max: 2 }),
  body("company_address").optional().isLength({ max: 255 }),
  body("company_phone").optional().isLength({ max: 20 }),
  body("bank_name").optional().isLength({ max: 100 }),
  body("bank_account").optional().isLength({ max: 50 }),
  body("is_default").optional().isInt({ min: 0, max: 1 }),
];

// 发票信息更新表单验证
export const updateInvoiceForm = [
  body("id").isInt({ min: 1 }),
  body("title").optional().isLength({ max: 100 }),
  body("tax_number").optional().isLength({ max: 30 }),
  body("invoice_type").optional().isInt({ min: 1, max: 2 }),
  body("company_address").optional().isLength({ max: 255 }),
  body("company_phone").optional().isLength({ max: 20 }),
  body("bank_name").optional().isLength({ max: 100 }),
  body("bank_account").optional().isLength({ max: 50 }),
  body("is_default").optional().isInt({ min: 0, max: 1 }),
];

// 发票列表查询表单验证
export const invoiceQueryForm = [
  body("page").isInt({ min: 1 }),
  body("page_size").isInt({ min: 1, max: 100 }),
  body("invoice_type").optional().isInt({ min: 1, max: 2 }),
  body("keyword").optional().isLength({ max: 100 }),
  body("status").optional().isInt({ min: 0, max: 1 }),
];

// 删除发票表单验证
export const deleteInvoiceForm = [
  body("id").isInt({ min: 1 }),
];

// 设置默认发票表单验证
export const setDefaultInvoiceForm = [
  body("id").isInt({ min: 1 }),
];

// 获取发票详情表单验证
export const invoiceDetailForm = [
  body("id").isInt({ min: 1 }),
];