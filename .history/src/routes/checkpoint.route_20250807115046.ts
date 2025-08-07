import { Router } from "express";
import {
  getAllCheckpoints,
  getCheckpointById,
  getCheckpointsByBranchId,
  createCheckpoint,
  updateCheckpoint,
  deleteCheckpoint,
  markCheckpointPatrol,
} from "@controllers/checkpoint.controller";
import {
  CheckpointValidator,
  CheckpointUpdateValidator,
  MarkCheckpointPatrolValidator,
} from "@utils/validators/checkpoint.validator";
import { authenticateToken } from "../middleware/auth.middleware";
const router = Router();

/**
 * @swagger
 * /checkpoints:
 *   get:
 *     summary: Obtener todos los checkpoints
 *     tags: [Checkpoints]
 *     description: Retorna una lista de todos los checkpoints en el sistema
 *     responses:
 *       200:
 *         description: Lista de checkpoints obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Checkpoints obtenidos correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Checkpoint'
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", authenticateToken, getAllCheckpoints);

router.post("/mark-checkpoint", MarkCheckpointPatrolValidator, markCheckpointPatrol);
/**
 * @swagger
 * /checkpoints/{id}:
 *   get:
 *     summary: Obtener checkpoint por ID
 *     tags: [Checkpoints]
 *     description: Retorna un checkpoint específico por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del checkpoint
 *     responses:
 *       200:
 *         description: Checkpoint obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Checkpoint obtenido correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Checkpoint'
 *       404:
 *         description: Checkpoint no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", authenticateToken, getCheckpointById);

/**
 * @swagger
 * /checkpoints/branch/{branchId}:
 *   get:
 *     summary: Obtener checkpoints por sucursal
 *     tags: [Checkpoints]
 *     description: Retorna todos los checkpoints de una sucursal específica
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Checkpoints obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Checkpoints obtenidos correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Checkpoint'
 *       500:
 *         description: Error interno del servidor
 */
router.get("/branch/:branchId", authenticateToken, getCheckpointsByBranchId);

/**
 * @swagger
 * /checkpoints:
 *   post:
 *     summary: Crear un nuevo checkpoint
 *     tags: [Checkpoints]
 *     description: Crea un nuevo checkpoint en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - branch_id
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del checkpoint
 *               branch_id:
 *                 type: integer
 *                 description: ID de la sucursal
 *     responses:
 *       201:
 *         description: Checkpoint creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Checkpoint creado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Checkpoint'
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
router.post("/", authenticateToken, CheckpointValidator, createCheckpoint);

/**
 * @swagger
 * /checkpoints/{id}:
 *   put:
 *     summary: Actualizar checkpoint
 *     tags: [Checkpoints]
 *     description: Actualiza un checkpoint existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del checkpoint a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del checkpoint
 *               branch_id:
 *                 type: integer
 *                 description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Checkpoint actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Checkpoint actualizado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Checkpoint'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Checkpoint no encontrado
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
  CheckpointUpdateValidator,
  updateCheckpoint
);

/**
 * @swagger
 * /checkpoints/{id}:
 *   delete:
 *     summary: Eliminar checkpoint
 *     tags: [Checkpoints]
 *     description: Elimina un checkpoint del sistema
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del checkpoint a eliminar
 *     responses:
 *       200:
 *         description: Checkpoint eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Checkpoint eliminado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Checkpoint'
 *       404:
 *         description: Checkpoint no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", authenticateToken, deleteCheckpoint);

export default router;
