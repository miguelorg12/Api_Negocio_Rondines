import { Router } from "express";
import { CheckpointRecordController } from "@controllers/checkpoint_record.controller";
import {
  createCheckpointRecordValidator,
  updateCheckpointRecordValidator,
  getCheckpointRecordValidator,
  deleteCheckpointRecordValidator,
  listCheckpointRecordsValidator,
  getCheckpointRecordsByBranchValidator,
  getCheckpointRecordsByPatrolAssignmentValidator,
} from "@validators/checkpoint_record.validator";
import 
const router = Router();
const checkpointRecordController = new CheckpointRecordController();

/**
 * @swagger
 * /api/v1/checkpoint-records:
 *   post:
 *     summary: Crear un nuevo registro de checkpoint
 *     tags: [CheckpointRecords]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckpointRecordCreateRequest'
 *     responses:
 *       201:
 *         description: Registro de checkpoint creado exitosamente
 *       400:
 *         description: Error en la validación de datos
 */
router.post("/", createCheckpointRecordValidator, checkpointRecordController.create.bind(checkpointRecordController));

/**
 * @swagger
 * /api/v1/checkpoint-records:
 *   get:
 *     summary: Obtener todos los registros de checkpoint
 *     tags: [CheckpointRecords]
 *     parameters:
 *       - in: query
 *         name: patrol_assignment_id
 *         schema:
 *           type: integer
 *         description: ID de la asignación de patrulla
 *       - in: query
 *         name: checkpoint_id
 *         schema:
 *           type: integer
 *         description: ID del checkpoint
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, missed, late]
 *         description: Estado del registro
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha desde
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha hasta
 *     responses:
 *       200:
 *         description: Lista de registros de checkpoint obtenida exitosamente
 *       400:
 *         description: Error en la validación de datos
 */
router.get("/", listCheckpointRecordsValidator, checkpointRecordController.findAll.bind(checkpointRecordController));

/**
 * @swagger
 * /api/v1/checkpoint-records/branch/{branchId}:
 *   get:
 *     summary: Obtener todos los registros de checkpoint por sucursal
 *     tags: [CheckpointRecords]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Lista de registros de checkpoint por sucursal obtenida exitosamente
 *       400:
 *         description: Error en la validación de datos
 */
router.get("/branch/:branchId", getCheckpointRecordsByBranchValidator, checkpointRecordController.findAllByBranchId.bind(checkpointRecordController));

/**
 * @swagger
 * /api/v1/checkpoint-records/assignment/{patrolAssignmentId}:
 *   get:
 *     summary: Obtener todos los registros de checkpoint por asignación de patrulla
 *     tags: [CheckpointRecords]
 *     parameters:
 *       - in: path
 *         name: patrolAssignmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignación de patrulla
 *     responses:
 *       200:
 *         description: Lista de registros de checkpoint por asignación obtenida exitosamente
 *       400:
 *         description: Error en la validación de datos
 */
router.get("/assignment/:patrolAssignmentId", getCheckpointRecordsByPatrolAssignmentValidator, checkpointRecordController.findAllByPatrolAssignmentId.bind(checkpointRecordController));

/**
 * @swagger
 * /api/v1/checkpoint-records/{id}/full:
 *   get:
 *     summary: Obtener un registro de checkpoint con información completa por ID
 *     tags: [CheckpointRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro de checkpoint
 *     responses:
 *       200:
 *         description: Registro de checkpoint con información completa obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CheckpointRecordResponse'
 *       404:
 *         description: Registro de checkpoint no encontrado
 */
router.get("/:id/full", getCheckpointRecordValidator, checkpointRecordController.findByIdWithFullInfo.bind(checkpointRecordController));

/**
 * @swagger
 * /api/v1/checkpoint-records/{id}:
 *   get:
 *     summary: Obtener un registro de checkpoint por ID
 *     tags: [CheckpointRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro de checkpoint
 *     responses:
 *       200:
 *         description: Registro de checkpoint encontrado exitosamente
 *       404:
 *         description: Registro de checkpoint no encontrado
 */
router.get("/:id", getCheckpointRecordValidator, checkpointRecordController.findById.bind(checkpointRecordController));

/**
 * @swagger
 * /api/v1/checkpoint-records/{id}:
 *   put:
 *     summary: Actualizar un registro de checkpoint
 *     tags: [CheckpointRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro de checkpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckpointRecordUpdateRequest'
 *     responses:
 *       200:
 *         description: Registro de checkpoint actualizado exitosamente
 *       400:
 *         description: Error en la validación de datos
 *       404:
 *         description: Registro de checkpoint no encontrado
 */
router.put("/:id", updateCheckpointRecordValidator, checkpointRecordController.update.bind(checkpointRecordController));

/**
 * @swagger
 * /api/v1/checkpoint-records/{id}:
 *   delete:
 *     summary: Eliminar un registro de checkpoint
 *     tags: [CheckpointRecords]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro de checkpoint
 *     responses:
 *       200:
 *         description: Registro de checkpoint eliminado exitosamente
 *       404:
 *         description: Registro de checkpoint no encontrado
 */
router.delete("/:id", deleteCheckpointRecordValidator, checkpointRecordController.delete.bind(checkpointRecordController));

export default router;
