import { Router } from "express";
import * as checkpointController from "../controllers/checkpoint.controller";
import {
  createCheckpointValidator,
  updateCheckpointValidator,
} from "../utils/validators/checkpoint.validator";

const router = Router();

/**
 * @openapi
 * /checkpoints:
 *   get:
 *     summary: Obtener todos los checkpoints
 *     tags:
 *       - Checkpoints
 *     responses:
 *       200:
 *         description: Lista de checkpoints obtenida correctamente
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
 *                     $ref: '#/components/schemas/Checkpoint'
 */
router.get("/", checkpointController.getAllCheckpoints);
/**
 * @openapi
 * /checkpoints:
 *   post:
 *     summary: Crear un nuevo checkpoint
 *     tags:
 *       - Checkpoints
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckpointCreateRequest'
 *     responses:
 *       201:
 *         description: Checkpoint creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Checkpoint'
 *       422:
 *         description: Error en la validación de datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
router.post(
  "/",
  createCheckpointValidator,
  checkpointController.createCheckpoint
);
/**
 * @openapi
 * /checkpoints/{id}:
 *   get:
 *     summary: Obtener un checkpoint por ID
 *     tags:
 *       - Checkpoints
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Checkpoint encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Checkpoint'
 *       404:
 *         description: Checkpoint no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/:id", checkpointController.getCheckpointById);
/**
 * @openapi
 * /checkpoints/{id}:
 *   put:
 *     summary: Actualizar un checkpoint por ID
 *     tags:
 *       - Checkpoints
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
 *             $ref: '#/components/schemas/CheckpointCreateRequest'
 *     responses:
 *       200:
 *         description: Checkpoint actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Checkpoint'
 *       404:
 *         description: Checkpoint no encontrado
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
router.put(
  "/:id",
  updateCheckpointValidator,
  checkpointController.updateCheckpoint
);
/**
 * @openapi
 * /checkpoints/{id}:
 *   delete:
 *     summary: Eliminar un checkpoint por ID
 *     tags:
 *       - Checkpoints
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Checkpoint eliminado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Checkpoint'
 *       404:
 *         description: Checkpoint no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete("/:id", checkpointController.deleteCheckpoint);

export default router;
