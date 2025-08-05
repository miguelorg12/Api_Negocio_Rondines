import { Router } from "express";
import {
  PatrolAssignmentValidator,
  PatrolAssignmentUpdateValidator,
  UpdateRouteWithCheckpointsValidator,
} from "@utils/validators/patrol_assigment.validator";
import * as PatrolAssignmentController from "@controllers/patrol_assigment.controller";

const router = Router();

/**
 * @swagger
 * /patrol-assignments:
 *   get:
 *     summary: Obtener todas las asignaciones de patrulla
 *     tags: [Asignaciones de Patrulla]
 *     description: Retorna una lista de todas las asignaciones de patrulla en el sistema
 *     responses:
 *       200:
 *         description: Lista de asignaciones de patrulla obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Asignaciones de rondas obtenidas correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PatrolAssignment'
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", PatrolAssignmentController.getAllPatrolAssignments);

/**
 * @swagger
 * /patrol-assignments:
 *   post:
 *     summary: Crear una nueva asignación de patrulla
 *     tags: [Asignaciones de Patrulla]
 *     description: Crea una nueva asignación de patrulla en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatrolAssignmentCreateRequest'
 *     responses:
 *       201:
 *         description: Asignación de patrulla creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Asignación de ronda creada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/PatrolAssignment'
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
  PatrolAssignmentValidator,
  PatrolAssignmentController.createPatrolAssignment
);

/**
 * @swagger
 * /patrol-assignments/{id}:
 *   get:
 *     summary: Obtener asignación de patrulla por ID
 *     tags: [Asignaciones de Patrulla]
 *     description: Retorna una asignación de patrulla específica por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignación de patrulla
 *     responses:
 *       200:
 *         description: Asignación de patrulla encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Asignación de ronda encontrada"
 *                 data:
 *                   $ref: '#/components/schemas/PatrolAssignment'
 *       404:
 *         description: Asignación de patrulla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Asignación de ronda no encontrada"
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", PatrolAssignmentController.getPatrolAssignmentById);

/**
 * @swagger
 * /patrol-assignments/{id}:
 *   put:
 *     summary: Actualizar asignación de patrulla
 *     tags: [Asignaciones de Patrulla]
 *     description: Actualiza una asignación de patrulla existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignación de patrulla a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario asignado
 *               patrol_id:
 *                 type: integer
 *                 description: ID de la patrulla
 *               shift_id:
 *                 type: integer
 *                 description: ID del turno
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de la asignación
 *     responses:
 *       200:
 *         description: Asignación de patrulla actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Asignación de ronda actualizada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/PatrolAssignment'
 *       404:
 *         description: Asignación de patrulla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Asignación de ronda no encontrada"
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
  PatrolAssignmentUpdateValidator,
  PatrolAssignmentController.updatePatrolAssignment
);

/**
 * @swagger
 * /patrol-assignments/{id}:
 *   delete:
 *     summary: Eliminar asignación de patrulla
 *     tags: [Asignaciones de Patrulla]
 *     description: Elimina una asignación de patrulla del sistema (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignación de patrulla a eliminar
 *     responses:
 *       200:
 *         description: Asignación de patrulla eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Asignación de ronda eliminada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/PatrolAssignment'
 *       404:
 *         description: Asignación de patrulla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Asignación de ronda no encontrada"
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", PatrolAssignmentController.deletePatrolAssignment);

/**
 * @swagger
 * /patrol-assignments/{id}/route-with-checkpoints:
 *   put:
 *     summary: Actualizar asignación de ruta con checkpoints
 *     tags: [Asignaciones de Patrulla]
 *     description: Actualiza una asignación de ruta existente y sus checkpoints asociados
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignación de ruta a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario asignado (opcional)
 *               patrol_id:
 *                 type: integer
 *                 description: ID del patrol (debe tener un plan asignado) (opcional)
 *               shift_id:
 *                 type: integer
 *                 description: ID del turno (opcional)
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de la asignación (opcional)
 *               checkpoints:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - time
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Nombre del checkpoint
 *                     time:
 *                       type: string
 *                       pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$'
 *                       description: Hora del checkpoint en formato HH:MM o HH:MM:SS
 *                 description: Array de checkpoints con nombre y hora (opcional)
 *     responses:
 *       200:
 *         description: Ruta con checkpoints actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ruta con checkpoints actualizada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/PatrolAssignment'
 *       400:
 *         description: Error de validación
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
  "/:id/route-with-checkpoints",
  UpdateRouteWithCheckpointsValidator,
  PatrolAssignmentController.updateRouteWithCheckpoints
);

/**
 * @swagger
 * /patrol-assignments/{id}/route-with-checkpoints:
 *   delete:
 *     summary: Eliminar asignación de ruta con checkpoints
 *     tags: [Asignaciones de Patrulla]
 *     description: Elimina una asignación de ruta y sus checkpoints asociados del sistema
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignación de ruta a eliminar
 *     responses:
 *       200:
 *         description: Ruta con checkpoints eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ruta con checkpoints eliminada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/PatrolAssignment'
 *       404:
 *         description: Asignación de ruta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete(
  "/:id/route-with-checkpoints",
  PatrolAssignmentController.deleteRouteWithCheckpoints
);

export default router;
