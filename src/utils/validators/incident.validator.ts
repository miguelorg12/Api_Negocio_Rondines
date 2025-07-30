import { body } from "express-validator";

export const createIncidentValidator = [
  body("description")
    .notEmpty()
    .withMessage("La descripción es requerida")
    .isLength({ min: 10, max: 1000 })
    .withMessage("La descripción debe tener entre 10 y 1000 caracteres"),

  body("status")
    .notEmpty()
    .withMessage("El estado es requerido")
    .isIn(["reportado", "en_revision", "resuelto", "descartado"])
    .withMessage(
      "El estado debe ser uno de: reportado, en_revision, resuelto, descartado"
    ),

  body("severity")
    .notEmpty()
    .withMessage("La severidad es requerida")
    .isIn(["baja", "media", "alta", "critica"])
    .withMessage("La severidad debe ser una de: baja, media, alta, critica"),

  body("user_id")
    .notEmpty()
    .withMessage("El ID del usuario es requerido")
    .toInt()
    .isInt({ min: 1 })
    .withMessage("El ID del usuario debe ser un número entero positivo"),

  body("checkpoint_id")
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("El ID del checkpoint debe ser un número entero positivo"),

  body("branch_id")
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("El ID de la sucursal debe ser un número entero positivo"),
];

export const updateIncidentValidator = [
  body("description")
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage("La descripción debe tener entre 10 y 1000 caracteres"),

  body("status")
    .optional()
    .isIn(["reportado", "en_revision", "resuelto", "descartado"])
    .withMessage(
      "El estado debe ser uno de: reportado, en_revision, resuelto, descartado"
    ),

  body("severity")
    .optional()
    .isIn(["baja", "media", "alta", "critica"])
    .withMessage("La severidad debe ser una de: baja, media, alta, critica"),

  body("checkpoint_id")
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("El ID del checkpoint debe ser un número entero positivo"),
  body("branch_id")
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("El ID de la sucursal debe ser un número entero positivo"),
];
