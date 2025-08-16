import { body } from "express-validator";

export const createShiftValidator = [
  body("name").notEmpty().withMessage("El nombre del turno es obligatorio"),
  body("start_time")
    .notEmpty()
    .withMessage("La hora de inicio es obligatoria")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Formato de hora inválido. Use HH:MM (ej: 07:00, 15:30)"),
  body("end_time")
    .notEmpty()
    .withMessage("La hora de fin es obligatoria")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Formato de hora inválido. Use HH:MM (ej: 07:00, 15:30)"),
  body("branch_id")
    .notEmpty()
    .withMessage("El ID de la sucursal es obligatorio")
    .isInt({ min: 1 })
    .withMessage("El ID de la sucursal debe ser un número entero válido"),
];

export const updateShiftValidator = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("El nombre del turno es obligatorio"),
  body("start_time")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Formato de hora inválido. Use HH:MM (ej: 07:00, 15:30)"),
  body("end_time")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Formato de hora inválido. Use HH:MM (ej: 07:00, 15:30)"),
  body("branch_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de la sucursal debe ser un número entero válido"),
];
