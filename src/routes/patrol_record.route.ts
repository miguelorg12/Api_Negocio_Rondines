import express from "express";
import {
  getAllPatrolRecords,
  createPatrolRecord,
  getPatrolRecordById,
  updatePatrolRecord,
  deletePatrolRecord,
  getCompletedPatrolRecords,
  getPendingPatrolRecords,
  getInProgressPatrolRecords,
  getCurrentPatrolRecord,
} from "@controllers/patrol_record.controller";
import { validationResult } from "express-validator";

const router = express.Router();

// Middleware to handle validation errors
const validateRequest = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @swagger
 * /api/v1/patrol-records:
 *   get:
 *     summary: Obtener todos los patrol records
 *     tags: [PatrolRecords]
 *     responses:
 *       200:
 *         description: Lista de patrol records
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
 *                     $ref: '#/components/schemas/PatrolRecord'
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", getAllPatrolRecords);

/**
 * @swagger
 * /api/v1/patrol-records:
 *   post:
 *     summary: Crear un nuevo patrol record
 *     tags: [PatrolRecords]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - patrol_assignment_id
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha del patrol record
 *               actual_start:
 *                 type: string
 *                 format: date-time
 *                 description: Hora de inicio real (opcional)
 *               actual_end:
 *                 type: string
 *                 format: date-time
 *                 description: Hora de fin real (opcional)
 *               status:
 *                 type: string
 *                 enum: [completado, pendiente, cancelado, en_progreso]
 *                 description: Estado del patrol record
 *               patrol_assignment_id:
 *                 type: integer
 *                 description: ID de la asignación de patrulla
 *     responses:
 *       201:
 *         description: Patrol record creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PatrolRecord'
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */
router.post("/", createPatrolRecord);

/**
 * @swagger
 * /api/v1/patrol-records/{id}:
 *   get:
 *     summary: Obtener un patrol record por ID
 *     tags: [PatrolRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del patrol record
 *     responses:
 *       200:
 *         description: Patrol record encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PatrolRecord'
 *       404:
 *         description: Patrol record no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", getPatrolRecordById);

/**
 * @swagger
 * /api/v1/patrol-records/{id}:
 *   put:
 *     summary: Actualizar un patrol record
 *     tags: [PatrolRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del patrol record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               actual_start:
 *                 type: string
 *                 format: date-time
 *               actual_end:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [completado, pendiente, cancelado, en_progreso]
 *     responses:
 *       200:
 *         description: Patrol record actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PatrolRecord'
 *       404:
 *         description: Patrol record no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put("/:id", updatePatrolRecord);

/**
 * @swagger
 * /api/v1/patrol-records/{id}:
 *   delete:
 *     summary: Eliminar un patrol record (marcar como cancelado)
 *     tags: [PatrolRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del patrol record
 *     responses:
 *       200:
 *         description: Patrol record eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PatrolRecord'
 *       404:
 *         description: Patrol record no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", deletePatrolRecord);

/**
 * @swagger
 * /api/v1/patrol-records/completed/{user_id}:
 *   get:
 *     summary: Obtener patrol records completados por user_id
 *     tags: [PatrolRecords]
 *     description: Obtiene todos los patrol records con estado "completado" para un guardia específico
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario/guardia
 *     responses:
 *       200:
 *         description: Patrol records completados obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Patrol records completados obtenidos correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PatrolRecord'
 *       400:
 *         description: user_id debe ser un número válido
 *       500:
 *         description: Error interno del servidor
 */
router.get("/completed/:user_id", getCompletedPatrolRecords);

/**
 * @swagger
 * /api/v1/patrol-records/pending/{user_id}:
 *   get:
 *     summary: Obtener patrol records pendientes por user_id
 *     tags: [PatrolRecords]
 *     description: Obtiene todos los patrol records con estado "pendiente" para un guardia específico
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario/guardia
 *     responses:
 *       200:
 *         description: Patrol records pendientes obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Patrol records pendientes obtenidos correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PatrolRecord'
 *       400:
 *         description: user_id debe ser un número válido
 *       500:
 *         description: Error interno del servidor
 */
router.get("/pending/:user_id", getPendingPatrolRecords);

/**
 * @swagger
 * /api/v1/patrol-records/in-progress/{user_id}:
 *   get:
 *     summary: Obtener patrol records en progreso por user_id
 *     tags: [PatrolRecords]
 *     description: Obtiene todos los patrol records con estado "en_progreso" para un guardia específico
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario/guardia
 *     responses:
 *       200:
 *         description: Patrol records en progreso obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Patrol records en progreso obtenidos correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PatrolRecord'
 *       400:
 *         description: user_id debe ser un número válido
 *       500:
 *         description: Error interno del servidor
 */
router.get("/in-progress/:user_id", getInProgressPatrolRecords);

/**
 * @swagger
 * /api/v1/patrol-records/current/{user_id}:
 *   get:
 *     summary: Obtener la ronda actual del usuario del día de hoy
 *     tags: [PatrolRecords]
 *     description: Obtiene el patrol record del día de hoy con estado "en_progreso" para un usuario específico, incluyendo el plan de la ronda
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario/guardia
 *     responses:
 *       200:
 *         description: Ronda actual obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ronda actual obtenida correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID del patrol record
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha del patrol record
 *                     status:
 *                       type: string
 *                       enum: [en_progreso]
 *                       description: Estado del patrol record
 *                     actual_start:
 *                       type: string
 *                       format: date-time
 *                       description: Hora de inicio real
 *                     actual_end:
 *                       type: string
 *                       format: date-time
 *                       description: Hora de fin real
 *                     patrolAssignment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: ID de la asignación
 *                         date:
 *                           type: string
 *                           format: date-time
 *                           description: Fecha de la asignación
 *                         patrol:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               description: ID del patrol
 *                             name:
 *                               type: string
 *                               description: Nombre del patrol
 *                             frequency:
 *                               type: string
 *                               description: Frecuencia del patrol
 *                             plans:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                     description: ID del plan
 *                                   name:
 *                                     type: string
 *                                     description: Nombre del plan
 *                                   image_url:
 *                                     type: string
 *                                     description: URL de la imagen del plan
 *                         shift:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               description: ID del turno
 *                             name:
 *                               type: string
 *                               description: Nombre del turno
 *                             start_time:
 *                               type: string
 *                               description: Hora de inicio del turno
 *                             end_time:
 *                               type: string
 *                               description: Hora de fin del turno
 *                         user:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               description: ID del usuario
 *                             name:
 *                               type: string
 *                               description: Nombre del usuario
 *                             last_name:
 *                               type: string
 *                               description: Apellido del usuario
 *       400:
 *         description: user_id debe ser un número válido
 *       404:
 *         description: No se encontró una ronda en progreso para el día de hoy
 *       500:
 *         description: Error interno del servidor
 */
router.get("/current/:user_id", getCurrentPatrolRecord);

export default router;
