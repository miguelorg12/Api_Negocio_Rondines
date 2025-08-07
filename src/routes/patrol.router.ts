import { Router } from "express";
import {
  createPatrolValidator,
  updatePatrolValidator,
} from "@utils/validators/patrol.validator";
import {
  createPatrolWithRoutePointsValidator,
  updatePatrolWithRoutePointsValidator,
} from "@utils/validators/patrol_route_point.validator";
import {
  getAllPatrols,
  createPatrol,
  getPatrolById,
  updatePatrol,
  deletePatrol,
  createPatrolAndAssigment,
  getPatrolsByBranchId,
  getAvailablePatrolsByBranchId,
  createPatrolWithRoutePoints,
  updatePatrolWithRoutePoints,
} from "@controllers/patrol.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/branch/:id", authenticateToken, getPatrolsByBranchId);

/**
 * @swagger
 * /patrols/branch/{id}/available:
 *   get:
 *     summary: Obtener patrullas disponibles por sucursal
 *     tags: [Patrullas]
 *     description: Retorna las patrullas de una sucursal que NO tienen asignaciones activas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Patrullas disponibles obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rondas disponibles obtenidas correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Patrol'
 *       500:
 *         description: Error interno del servidor
 */
router.get("/branch/:id/available", authenticateToken, getPatrolsByBranchId);

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
router.get("/", authenticateToken, getAllPatrols);

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
 *         description: Patrulla obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ronda obtenida correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Patrol'
 *       404:
 *         description: Patrulla no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", authenticateToken, getPatrolById);

/**
 * @swagger
 * /patrols:
 *   post:
 *     summary: Crear patrulla con puntos de ruta
 *     tags: [Patrullas]
 *     description: Crea una nueva patrulla con sus puntos de ruta asociados
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - branch_id
 *               - route_points
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [ronda_matutina, ronda_vespertina, ronda_nocturna]
 *                 description: Tipo de ronda
 *               branch_id:
 *                 type: integer
 *                 description: ID de la sucursal
 *               active:
 *                 type: boolean
 *                 default: true
 *                 description: Estado activo de la patrulla
 *               route_points:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - latitude
 *                     - longitude
 *                     - order
 *                     - checkpoint_id
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       minimum: -90
 *                       maximum: 90
 *                       description: Latitud del punto
 *                     longitude:
 *                       type: number
 *                       minimum: -180
 *                       maximum: 180
 *                       description: Longitud del punto
 *                     order:
 *                       type: integer
 *                       minimum: 1
 *                       description: Orden del punto en la ruta
 *                     checkpoint_id:
 *                       type: integer
 *                       description: ID del checkpoint asociado
 *                     google_place_id:
 *                       type: string
 *                       description: ID del lugar en Google Maps (opcional)
 *                     address:
 *                       type: string
 *                       description: Dirección del punto (opcional)
 *                     formatted_address:
 *                       type: string
 *                       description: Dirección formateada por Google Maps (opcional)
 *     responses:
 *       201:
 *         description: Patrulla creada con puntos de ruta exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ronda creada con puntos de ruta correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Patrol'
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
router.post(
  "/",
  authenticateToken,
  createPatrolWithRoutePointsValidator,
  createPatrolWithRoutePoints
);

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
 *               - branch_id
 *               - user_id
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [ronda_matutina, ronda_vespertina, ronda_nocturna]
 *                 description: Tipo de ronda
 *               branch_id:
 *                 type: integer
 *                 description: ID de la sucursal
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario al que se asignará la patrulla
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
 *                   example: "Ronda creada y asignada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Patrol'
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
router.post(
  "/create-and-assign",
  authenticateToken,
  createPatrolValidator,
  createPatrolAndAssigment
);

/**
 * @swagger
 * /patrols/{id}:
 *   put:
 *     summary: Actualizar patrulla con puntos de ruta
 *     tags: [Patrullas]
 *     description: Actualiza una patrulla existente incluyendo todos sus puntos de ruta
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
 *               branch_id:
 *                 type: integer
 *                 description: ID de la sucursal
 *               active:
 *                 type: boolean
 *                 description: Estado activo de la patrulla
 *               route_points:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       format: float
 *                       description: Latitud del punto
 *                     longitude:
 *                       type: number
 *                       format: float
 *                       description: Longitud del punto
 *                     order:
 *                       type: integer
 *                       description: Orden del punto en la ruta
 *                     checkpoint_id:
 *                       type: integer
 *                       description: ID del checkpoint asociado
 *                     google_place_id:
 *                       type: string
 *                       description: ID del lugar en Google Maps (opcional)
 *                     address:
 *                       type: string
 *                       description: Dirección del punto (opcional)
 *                     formatted_address:
 *                       type: string
 *                       description: Dirección formateada (opcional)
 *     responses:
 *       200:
 *         description: Patrulla actualizada con puntos de ruta exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ronda actualizada con puntos de ruta correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Patrol'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Patrulla no encontrada
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
  updatePatrolWithRoutePointsValidator,
  updatePatrolWithRoutePoints
);

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
router.delete("/:id", authenticateToken, deletePatrol);

export default router;
