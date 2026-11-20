import { body } from "express-validator";

export const addForm = [
  body("province").isInt(),
  body("city").isInt(),
  body("town").isInt(),
  body("street").isInt(),
  body("name").notEmpty(),
  body("descp").notEmpty(),
  body("company_number").notEmpty(),
  body("company_present_name").notEmpty(),
  body("company_present_id_number").notEmpty(),
  body("company_present_mobile").notEmpty(),
  body("company_id_pic").notEmpty(),
  body("company_present_id_up_pic").notEmpty(),
  body("company_present_id_down_pic").notEmpty(),
  body("company_other_files").notEmpty(),
];
export const updateForm = [
  body("province").isInt(),
  body("city").isInt(),
  body("town").isInt(),
  body("street").isInt(),
  body("name").notEmpty(),
  body("descp").notEmpty(),
  body("company_number").notEmpty(),
  body("role").isInt(),
  body("company_present_name").notEmpty(),
  body("company_present_id_number").notEmpty(),
  body("company_present_mobile").notEmpty(),
  body("company_id_pic").notEmpty(),
  body("company_present_id_up_pic").notEmpty(),
  body("company_present_id_down_pic").notEmpty(),
  body("company_other_files").notEmpty(),
];
export const delForm = [body("id").isInt()];
export const detailForm = [body("id").isInt()];
export const listForm = [
  body("current_page").isInt({ min: 1 }),
  body("page_size").isInt({ min: 10 }),
];
export const updatePersonalInfoForm = [
  body("logo").notEmpty(),
  body("address").notEmpty(),
  body("team_photos").notEmpty(),
  body("name").notEmpty(),
  body("company_present_mobile").notEmpty(),
  body("descp").notEmpty(),
  body("tags").notEmpty(),
];
