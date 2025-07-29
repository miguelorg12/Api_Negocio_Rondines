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
  createPatrolAndAssigment,
} from "@controllers/patrol.controller";

const router = Router();

/**
 * @swagger
 * /patrols:
 *   get:
 *     summary: Obtener todas las patrullas
 *     tags: [Patrullas]
 *     description: Retorna una lista de todas las patrullas en el sistema
 *     responses:
 *       200:
 *         description: Lista de patrullas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rondas obtenidas correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Patrol'
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", getAllPatrols);

/**
 * @swagger
 * /patrols:
 *   post:
 *     summary: Crear una nueva patrulla
 *     tags: [Patrullas]
 *     description: Crea una nueva patrulla en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatrolCreateRequest'
 *     responses:
 *       201:
 *         description: Patrulla creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ronda creada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Patrol'
 *       422:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Error interno del servidor
 */
router.post("/", createPatrolValidator, createPatrol);

//this route is for creating a patrol and assigning it to a user
//it uses the createPatrolAndAssigment function from the controller
/**
 * @swagger
 * /patrols/create-and-assign:
 *   post:
 *     summary: Crear patrulla y asignar a usuario
 *     tags: [Patrullas]
 *     description: Crea una nueva patrulla y la asigna automáticamente a un usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - frequency
 *               - branch_id
 *               - user_id
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [ronda_matutina, ronda_vespertina, ronda_nocturna]
 *                 description: Tipo de ronda
 *               frequency:
 *                 type: string
 *                 enum: [diaria, semanal, mensual]
 *                 description: Frecuencia de la ronda
 *               branch_id:
 *                 type: integer
 *                 description: ID de la sucursal
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario al que se asignará la patrulla
 *               plan_id:
 *                 type: integer
 *                 nullable: true
 *                 description: ID del plan (opcional)
 *               active:
 *                 type: boolean
 *                 default: true
 *                 description: Estado activo de la patrulla
 *     responses:
 *       201:
 *         description: Patrulla creada y asignada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ronda y asignación creadas correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Patrol'
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
  "/create-and-assign",
  createPatrolValidator,
  createPatrolAndAssigment
);

/**
 * @swagger
 * /patrols/{id}:
 *   get:
 *     summary: Obtener patrulla por ID
 *     tags: [Patrullas]
 *     description: Retorna una patrulla específica por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la patrulla
 *     responses:
 *       200:
 *         description: Patrulla encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ronda encontrada"
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
 *                   example: "Ronda no encontrada"
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", getPatrolById);

/**
 * @swagger
 * /patrols/{id}:
 *   put:
 *     summary: Actualizar patrulla
 *     tags: [Patrullas]
 *     description: Actualiza una patrulla existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la patrulla a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [ronda_matutina, ronda_vespertina, ronda_nocturna]
 *                 description: Tipo de ronda
 *               frequency:
 *                 type: string
 *                 enum: [diaria, semanal, mensual]
 *                 description: Frecuencia de la ronda
 *               branch_id:
 *                 type: integer
 *                 description: ID de la sucursal
 *               plan_id:
 *                 type: integer
 *                 description: ID del plan (opcional)
 *               active:
 *                 type: boolean
 *                 description: Estado activo de la patrulla
 *     responses:
 *       200:
 *         description: Patrulla actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ronda actualizada correctamente"
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
 *                   example: "Ronda no encontrada"
 *       422:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Error interno del servidor
 */
router.put("/:id", updatePatrolValidator, updatePatrol);

/**
 * @swagger
 * /patrols/{id}:
 *   delete:
 *     summary: Eliminar/Activar patrulla
 *     tags: [Patrullas]
 *     description: Cambia el estado activo de una patrulla (activar/desactivar)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la patrulla a eliminar/activar
 *     responses:
 *       200:
 *         description: Estado de la patrulla cambiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ronda eliminada correctamente"
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
 *                   example: "Ronda no encontrada"
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", deletePatrol);

export default router;
