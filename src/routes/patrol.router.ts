import { Router } from "express";
import {
  createPatrolValidator,
  updatePatrolValidator,
} from "@utils/validators/patrol.validator";
import {
  getAllPatrols,
  createPatrol,
  getPatrolById,
  updatePatrol,
  deletePatrol,
} from "@controllers/patrol.controller";

const router = Router();

/**
 * @openapi
 * /patrols:
 *   get:
 *     summary: Obtener todas las patrullas
 *     tags:
 *       - Patrols
 *     responses:
 *       200:
 *         description: Lista de patrullas obtenida correctamente
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
 *                     $ref: '#/components/schemas/Patrol'
 */
router.get("/", getAllPatrols);

/**
 * @openapi
 * /patrols:
 *   post:
 *     summary: Crear una nueva patrulla
 *     tags:
 *       - Patrols
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatrolCreateRequest'
 *     responses:
 *       201:
 *         description: Patrulla creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Patrol'
 *       422:
 *         description: Error en la validación de datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
router.post("/", createPatrolValidator, createPatrol);

/**
 * @openapi
 * /patrols/{id}:
 *   get:
 *     summary: Obtener una patrulla por ID
 *     tags:
 *       - Patrols
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patrulla encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 patrol:
 *                   $ref: '#/components/schemas/Patrol'
 *       404:
 *         description: Patrulla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/:id", getPatrolById);

/**
 * @openapi
 * /patrols/{id}:
 *   put:
 *     summary: Actualizar una patrulla por ID
 *     tags:
 *       - Patrols
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
 *             $ref: '#/components/schemas/PatrolCreateRequest'
 *     responses:
 *       200:
 *         description: Patrulla actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Patrol'
 *       404:
 *         description: Patrulla no encontrada
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
router.put("/:id", updatePatrolValidator, updatePatrol);

/**
 * @openapi
 * /patrols/{id}:
 *   delete:
 *     summary: Eliminar una patrulla por ID
 *     tags:
 *       - Patrols
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patrulla eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Patrol'
 *       404:
 *         description: Patrulla no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete("/:id", deletePatrol);

export default router;
