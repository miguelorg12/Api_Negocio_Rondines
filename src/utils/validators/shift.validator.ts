import { body } from "express-validator";

export const createShiftValidator = [
  body("name").notEmpty().withMessage("El nombre del turno es obligatorio"),
  body("start_time")
    .notEmpty()
    .withMessage("La hora de inicio es obligatoria")
    .isISO8601()
    .withMessage(
      "La hora de inicio debe ser una fecha válida en formato ISO 8601"
    ),
  body("end_time")
    .notEmpty()
    .withMessage("La hora de fin es obligatoria")
    .isISO8601()
    .withMessage(
      "La hora de fin debe ser una fecha válida en formato ISO 8601"
    ),
];
export const updateShiftValidator = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("El nombre del turno es obligatorio"),
  body("start_time")
    .optional()
    .isISO8601()
    .withMessage(
      "La hora de inicio debe ser una fecha válida en formato ISO 8601"
    ),
  body("end_time")
    .optional()
    .isISO8601()
    .withMessage(
      "La hora de fin debe ser una fecha válida en formato ISO 8601"
    ),
];
