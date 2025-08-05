import { Router } from "express";
import * as guardController from "../controllers/guard.controller";
import {
  createGuardsValidator,
  updateGuardValidator,
} from "../utils/validators/guard.validator";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /guards/branch/{branchId}:
 *   get:
 *     summary: Obtener guardias por sucursal
 *     tags: [Guardias]
 *     description: Retorna una lista de todos los guardias asignados a una sucursal específica
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Lista de guardias obtenida exitosamente por sucursal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Guardias obtenidos correctamente por sucursal"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GuardResponse'
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/branch/:branchId",
  authenticateToken,
  guardController.getGuardsByBranch
);

/**
 * @swagger
 * /guards/patrols/assigned/{id}:
 *   get:
 *     summary: Obtener patrullas asignadas a un guardia
 *     tags: [Guardias]
 *     description: Retorna todas las patrullas asignadas a un guardia específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del guardia
 *     responses:
 *       200:
 *         description: Patrullas asignadas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rondines asignados al guardia obtenidos correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GuardPatrolAssignment'
 *       404:
 *         description: No se encontraron patrullas asignadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No se encontraron rondines asignados"
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/patrols/assigned/:id",
  authenticateToken,
  guardController.patrolsAssignedToGuard
);

/**
 * @swagger
 * /guards:
 *   get:
 *     summary: Obtener todos los guardias
 *     tags: [Guardias]
 *     description: Retorna una lista de todos los guardias en el sistema
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de guardias obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Guardias obtenidos correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       curp:
 *                         type: string
 *       401:
 *         description: Token de acceso requerido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Access token required"
 *                 message:
 *                   type: string
 *                   example: "Debe proporcionar un token de acceso"
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", authenticateToken, guardController.getAllGuards);

/**
 * @swagger
 * /guards/{id}:
 *   get:
 *     summary: Obtener guardia por ID
 *     tags: [Guardias]
 *     description: Retorna un guardia específico por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del guardia
 *     responses:
 *       200:
 *         description: Guardia encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Guardia encontrado"
 *                 guard:
 *                   $ref: '#/components/schemas/GuardResponse'
 *       404:
 *         description: Guardia no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Guardia no encontrado"
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", authenticateToken, guardController.getGuardById);

/**
 * @swagger
 * /guards:
 *   post:
 *     summary: Crear un nuevo guardia
 *     tags: [Guardias]
 *     description: Crea un nuevo guardia en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GuardCreateRequest'
 *     responses:
 *       201:
 *         description: Guardia creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Guardia creado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/GuardResponse'
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
  createGuardsValidator,
  guardController.createGuard
);

/**
 * @swagger
 * /guards/{id}:
 *   put:
 *     summary: Actualizar guardia
 *     tags: [Guardias]
 *     description: Actualiza un guardia existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del guardia a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del guardia
 *               last_name:
 *                 type: string
 *                 description: Apellido del guardia
 *               curp:
 *                 type: string
 *                 description: CURP del guardia
 *               email:
 *                 type: string
 *                 description: Email del guardia
 *               password:
 *                 type: string
 *                 description: Contraseña del guardia
 *               role_id:
 *                 type: integer
 *                 description: ID del rol
 *               active:
 *                 type: boolean
 *                 description: Estado activo del guardia
 *               biometric:
 *                 type: string
 *                 description: Datos biométricos
 *               branch_id:
 *                 type: integer
 *                 description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Guardia actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Guardia actualizado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/GuardResponse'
 *       404:
 *         description: Guardia no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Guardia no encontrado"
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
  updateGuardValidator,
  guardController.updateGuard
);

/**
 * @swagger
 * /guards/{id}:
 *   delete:
 *     summary: Eliminar/Activar guardia
 *     tags: [Guardias]
 *     description: Cambia el estado activo de un guardia (activar/desactivar)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del guardia a eliminar/activar
 *     responses:
 *       200:
 *         description: Estado del guardia cambiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Guardia eliminado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/GuardResponse'
 *       404:
 *         description: Guardia no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Guardia no encontrado"
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", authenticateToken, guardController.deleteGuard);

export default router;
