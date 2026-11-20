import { body } from "express-validator";

export const cityForm = [body("provinceCode").isInt()];
export const districtForm = [
  body("provinceCode").isInt(),
  body("cityCode").isInt(),
];
export const townForm = [
  body("provinceCode").isInt(),
  body("cityCode").isInt(),
  body("areaCode").isInt(),
];
