import { body } from "express-validator";

export const shiftValidationValidator = [
  body("biometric")
    .isNumeric()
    .withMessage("El ID biométrico debe ser un número")
    .notEmpty()
    .withMessage("El ID biométrico es obligatorio"),
  body("timestamp")
    .isISO8601()
    .withMessage("El timestamp debe ser una fecha válida en formato ISO")
    .notEmpty()
    .withMessage("El timestamp es obligatorio"),
]; 