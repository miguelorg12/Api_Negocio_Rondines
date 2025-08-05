import { Router } from "express";
import * as shiftValidationController from "../controllers/shift_validation.controller";
import { shiftValidationValidator } from "../utils/validators/shift_validation.validator";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /shift-validation:
 *   post:
 *     summary: Validar turno con huella dactilar
 *     tags: [Validación de Turno]
 *     description: Valida el turno de un usuario mediante su huella dactilar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShiftValidationRequest'
 *     responses:
 *       200:
 *         description: Validación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftValidationResponse'
 *       400:
 *         description: Error en la validación del turno
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftValidationResponse'
 *       422:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/",
  authenticateToken,
  shiftValidationValidator,
  shiftValidationController.validateShift
);

export default router;
