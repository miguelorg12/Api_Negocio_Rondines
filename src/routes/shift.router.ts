import { Router } from "express";
import * as shiftController from "../controllers/shift.controller";
import {
  createShiftValidator,
  updateShiftValidator,
} from "../utils/validators/shift.validator";
import { authenticateToken } from "../middleware/auth.middleware";
const router = Router();

/**
 * @swagger
 * /shifts:
 *   get:
 *     summary: Obtener todos los turnos
 *     tags: [Turnos]
 *     description: Retorna una lista de todos los turnos en el sistema
 *     responses:
 *       200:
 *         description: Lista de turnos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Turnos obtenidos correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shift'
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", authenticateToken, shiftController.getAllShifts);

/**
 * @swagger
 * /shifts/branch/{branchId}:
 *   get:
 *     summary: Obtener turnos por sucursal
 *     tags: [Turnos]
 *     description: Retorna una lista de todos los turnos de una sucursal específica
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Lista de turnos de la sucursal obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Turnos de la sucursal obtenidos correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shift'
 *       400:
 *         description: ID de sucursal inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/branch/:branchId",
  authenticateToken,
  shiftController.getShiftsByBranchId
);

/**
 * @swagger
 * /shifts:
 *   post:
 *     summary: Crear un nuevo turno
 *     tags: [Turnos]
 *     description: Crea un nuevo turno en el sistema
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
 *               - branch_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del turno
 *               start_time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: "07:00"
 *                 description: Hora de inicio del turno en formato HH:MM (24 horas)
 *               end_time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: "15:00"
 *                 description: Hora de fin del turno en formato HH:MM (24 horas)
 *               branch_id:
 *                 type: integer
 *                 description: ID de la sucursal a la que pertenece el turno
 *     responses:
 *       201:
 *         description: Turno creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Turno creado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Shift'
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
  createShiftValidator,
  shiftController.createShift
);

/**
 * @swagger
 * /shifts/{id}:
 *   get:
 *     summary: Obtener turno por ID
 *     tags: [Turnos]
 *     description: Retorna un turno específico por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno
 *     responses:
 *       200:
 *         description: Turno encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Turno encontrado"
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
 *                   example: "Turno no encontrado"
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", authenticateToken, shiftController.getShiftById);

/**
 * @swagger
 * /shifts/{id}:
 *   put:
 *     summary: Actualizar turno
 *     tags: [Turnos]
 *     description: Actualiza un turno existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del turno
 *               start_time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: "07:00"
 *                 description: Hora de inicio del turno en formato HH:MM (24 horas)
 *               end_time:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 example: "15:00"
 *                 description: Hora de fin del turno en formato HH:MM (24 horas)
 *               branch_id:
 *                 type: integer
 *                 description: ID de la sucursal a la que pertenece el turno
 *     responses:
 *       200:
 *         description: Turno actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Turno actualizado correctamente"
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
 *                   example: "Turno no encontrado"
 *       422:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Error interno del servidor
 */
router.put(
  "/:id",
  authenticateToken,
  updateShiftValidator,
  shiftController.updateShift
);

/**
 * @swagger
 * /shifts/{id}:
 *   delete:
 *     summary: Eliminar turno
 *     tags: [Turnos]
 *     description: Elimina un turno del sistema (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno a eliminar
 *     responses:
 *       200:
 *         description: Turno eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Turno eliminado correctamente"
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
 *                   example: "Turno no encontrado"
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", authenticateToken, shiftController.deleteShift);

export default router;
