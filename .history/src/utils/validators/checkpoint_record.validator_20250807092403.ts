import { body, param, query } from "express-validator";
import { validateRequest } from "./index";

export const createCheckpointRecordValidator = [
  body("patrol_assignment_id")
    .isInt({ min: 1 })
    .withMessage("El ID de la asignación de patrulla es obligatorio y debe ser un número entero positivo"),
  
  body("checkpoint_id")
    .isInt({ min: 1 })
    .withMessage("El ID del checkpoint es obligatorio y debe ser un número entero positivo"),
  
  body("check_time")
    .isISO8601()
    .withMessage("La hora de verificación debe ser una fecha válida en formato ISO"),
  
  validateRequest,
];

export const updateCheckpointRecordValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID del registro de checkpoint es obligatorio y debe ser un número entero positivo"),
  
  body("status")
    .optional()
    .isIn(["pending", "completed", "missed", "late"])
    .withMessage("El estado debe ser uno de: pending, completed, missed, late"),
  
  body("real_check")
    .optional()
    .isISO8601()
    .withMessage("La hora real de verificación debe ser una fecha válida en formato ISO"),
  
  validateRequest,
];

export const getCheckpointRecordValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID del registro de checkpoint es obligatorio y debe ser un número entero positivo"),
  
  validateRequest,
];

export const deleteCheckpointRecordValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("El ID del registro de checkpoint es obligatorio y debe ser un número entero positivo"),
  
  validateRequest,
];

export const listCheckpointRecordsValidator = [
  query("patrol_assignment_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID de la asignación de patrulla debe ser un número entero positivo"),
  
  query("checkpoint_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El ID del checkpoint debe ser un número entero positivo"),
  
  query("status")
    .optional()
    .isIn(["pending", "completed", "missed", "late"])
    .withMessage("El estado debe ser uno de: pending, completed, missed, late"),
  
  query("date_from")
    .optional()
    .isISO8601()
    .withMessage("La fecha desde debe ser una fecha válida en formato ISO"),
  
  query("date_to")
    .optional()
    .isISO8601()
    .withMessage("La fecha hasta debe ser una fecha válida en formato ISO"),
  
  validateRequest,
];
