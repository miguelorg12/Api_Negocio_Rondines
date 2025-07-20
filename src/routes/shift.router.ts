import { Router } from "express";
import * as shiftController from "../controllers/shift.controller";
import {
  createShiftValidator,
  updateShiftValidator,
} from "../utils/validators/shift.validator";

const router = Router();

/**
 * @openapi
 * /shifts:
 *   get:
 *     summary: Obtener todos los turnos
 *     tags:
 *       - Shifts
 *     responses:
 *       200:
 *         description: Lista de turnos obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shift'
 */
router.get("/", shiftController.getAllShifts);
/**
 * @openapi
 * /shifts:
 *   post:
 *     summary: Crear un nuevo turno
 *     tags:
 *       - Shifts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - start_time
 *               - end_time
 *             properties:
 *               name:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: time
 *               end_time:
 *                 type: string
 *                 format: time
 *     responses:
 *       201:
 *         description: Turno creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Shift'
 *       422:
 *         description: Error en la validación de datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
router.post("/", createShiftValidator, shiftController.createShift);
/**
 * @openapi
 * /shifts/{id}:
 *   get:
 *     summary: Obtener un turno por ID
 *     tags:
 *       - Shifts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Turno encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 shift:
 *                   $ref: '#/components/schemas/Shift'
 *       404:
 *         description: Turno no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/:id", shiftController.getShiftById);
/**
 * @openapi
 * /shifts/{id}:
 *   put:
 *     summary: Actualizar un turno por ID
 *     tags:
 *       - Shifts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - start_time
 *               - end_time
 *             properties:
 *               name:
 *                 type: string
 *               start_time:
 *                 type: string
 *                 format: time
 *               end_time:
 *                 type: string
 *                 format: time
 *     responses:
 *       200:
 *         description: Turno actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Shift'
 *       404:
 *         description: Turno no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       422:
 *         description: Error en la validación de datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
router.put("/:id", updateShiftValidator, shiftController.updateShift);
/**
 * @openapi
 * /shifts/{id}:
 *   delete:
 *     summary: Eliminar un turno por ID
 *     tags:
 *       - Shifts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Turno eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Shift'
 *       404:
 *         description: Turno no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete("/:id", shiftController.deleteShift);

export default router;
