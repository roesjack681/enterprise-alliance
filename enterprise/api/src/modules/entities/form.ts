import { body } from "express-validator";

export const loginForm = [body("username").notEmpty(), body("pwd").notEmpty()];
export const changePasswordForm = [
  body("oldPwd").notEmpty(),
  body("newPwd").notEmpty(),
];
export const addForm = [
  body("status").isInt(),
  body("username").notEmpty(),
  body("password").notEmpty(),
  body("email").isEmail(),
  body("salt").notEmpty(),
  body("openid").notEmpty(),
  body("nickname").notEmpty(),
  body("role").isInt(),
  body("province").isInt(),
  body("city").isInt(),
  body("town").isInt(),
  body("street").isInt(),
  body("create_time").isInt(),
  body("last_login_time").isInt(),
];

// 发送短信验证码的表单验证
export const sendSmsForm = [
  body("mobile").isMobilePhone('zh-CN'),
];

// 注册表单验证（包含短信验证码）
export const registerForm = [
  body("role_type").isInt(),
  // body("username").notEmpty(),
  body("password").isLength({ min: 6 }),
  body("mobile").isMobilePhone('zh-CN'),
  body("smsCode").isLength({ min: 6, max: 6 }),
];
export const changeInfoForm = [
  body("province").isInt(),
  body("city").isInt(),
  body("town").isInt(),
  body("street").isInt(),
];
export const updateForm = [
  body("id").isInt(),
  body("status").isInt(),
  body("username").notEmpty(),
  body("password").notEmpty(),
  body("email").isEmail(),
  body("salt").notEmpty(),
  body("openid").notEmpty(),
  body("nickname").notEmpty(),
  body("role").isInt(),
  body("province").isInt(),
  body("city").isInt(),
  body("town").isInt(),
  body("street").isInt(),
  body("create_time").isInt(),
  body("last_login_time").isInt(),
];
export const delForm = [body("id").isInt()];
export const detailForm = [body("id").isInt()];
export const listForm = [
  body("current_page").isInt({ min: 1 }),
  body("page_size").isInt({ min: 5 }),
];
     export const Enterprise = [
  body("name").notEmpty(),
    body("role_type").isInt(),
  body("province").isInt(),
  body("city").isInt(),
  body("district").isInt(),
  body("town").isInt(),
  body("password").notEmpty(),
  body("mobile").notEmpty(),
];

export const loginByCodeForm = [
  body("username").notEmpty(),
  body("smsCode").isLength({ min: 6, max: 6 }),
];

export const findPasswordForm = [
  body("username").notEmpty(),
  body("smsCode").isLength({ min: 6, max: 6 }),
  body("newPwd").isLength({ min: 6 }),
];
