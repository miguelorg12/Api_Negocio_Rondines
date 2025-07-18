import { body } from "express-validator";

export const createRoleValidator = [
  body("name")
    .notEmpty()
    .withMessage("El nombre del rol es obligatorio")
    .isString()
    .withMessage("El nombre del rol debe ser una cadena de texto")
    .isLength({ max: 255 })
    .withMessage("El nombre del rol no puede exceder los 50 caracteres"),
];

export const updateRoleValidator = [
  body("name")
    .optional()
    .isString()
    .withMessage("El nombre del rol debe ser una cadena de texto")
    .isLength({ max: 255 })
    .withMessage("El nombre del rol no puede exceder los 50 caracteres"),
];
