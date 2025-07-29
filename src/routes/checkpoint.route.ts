import { Router } from "express";
import * as checkpointController from "../controllers/checkpoint.controller";
import {
  createCheckpointValidator,
  updateCheckpointValidator,
} from "../utils/validators/checkpoint.validator";

const router = Router();

/**
 * @swagger
 * /checkpoints:
 *   get:
 *     summary: Obtener todos los puntos de control
 *     tags: [Puntos de Control]
 *     description: Retorna una lista de todos los puntos de control en el sistema
 *     responses:
 *       200:
 *         description: Lista de puntos de control obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Puntos de control obtenidos correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Checkpoint'
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", checkpointController.getAllCheckpoints);

/**
 * @swagger
 * /checkpoints:
 *   post:
 *     summary: Crear un nuevo punto de control
 *     tags: [Puntos de Control]
 *     description: Crea un nuevo punto de control en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckpointCreateRequest'
 *     responses:
 *       201:
 *         description: Punto de control creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Punto de control creado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Checkpoint'
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
  createCheckpointValidator,
  checkpointController.createCheckpoint
);

/**
 * @swagger
 * /checkpoints/{id}:
 *   get:
 *     summary: Obtener punto de control por ID
 *     tags: [Puntos de Control]
 *     description: Retorna un punto de control específico por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del punto de control
 *     responses:
 *       200:
 *         description: Punto de control encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Punto de control encontrado"
 *                 data:
 *                   $ref: '#/components/schemas/Checkpoint'
 *       404:
 *         description: Punto de control no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Punto de control no encontrado"
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", checkpointController.getCheckpointById);

/**
 * @swagger
 * /checkpoints/{id}:
 *   put:
 *     summary: Actualizar punto de control
 *     tags: [Puntos de Control]
 *     description: Actualiza la información de un punto de control existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del punto de control
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckpointCreateRequest'
 *     responses:
 *       200:
 *         description: Punto de control actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Punto de control actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Checkpoint'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Datos de entrada inválidos"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Punto de control no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Punto de control no encontrado"
 *       500:
 *         description: Error interno del servidor
 */
router.put(
  "/:id",
  updateCheckpointValidator,
  checkpointController.updateCheckpoint
);

/**
 * @swagger
 * /checkpoints/{id}:
 *   delete:
 *     summary: Eliminar punto de control
 *     tags: [Puntos de Control]
 *     description: Elimina lógicamente un punto de control (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del punto de control
 *     responses:
 *       200:
 *         description: Punto de control eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Punto de control eliminado exitosamente"
 *       404:
 *         description: Punto de control no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Punto de control no encontrado"
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", checkpointController.deleteCheckpoint);

export default router;
