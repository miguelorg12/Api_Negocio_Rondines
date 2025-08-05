import { Router } from "express";
import * as branchController from "../controllers/branch.controller";
import {
  createBranchValidator,
  updateBranchValidator,
} from "../utils/validators/branch.validator";
import { authenticateToken } from "../middleware/auth.middleware";
const router = Router();

/**
 * @swagger
 * /branches:
 *   get:
 *     summary: Obtener todas las sucursales
 *     tags: [Sucursales]
 *     description: Retorna una lista de todas las sucursales activas
 *     responses:
 *       200:
 *         description: Lista de sucursales obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sucursales obtenidas correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Branch'
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", authenticateToken, branchController.getAllBranches);

/**
 * @swagger
 * /branches:
 *   post:
 *     summary: Crear nueva sucursal
 *     tags: [Sucursales]
 *     description: Crea una nueva sucursal en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BranchCreateRequest'
 *     responses:
 *       201:
 *         description: Sucursal creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sucursal creada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *       422:
 *         description: Error en la validación de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error en la validación de datos"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/",
  authenticateToken,
  createBranchValidator,
  branchController.createBranch
);

/**
 * @swagger
 * /branches/{id}:
 *   get:
 *     summary: Obtener sucursal por ID
 *     tags: [Sucursales]
 *     description: Retorna una sucursal específica por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Sucursal encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sucursal encontrada"
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *       404:
 *         description: Sucursal no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sucursal no encontrada"
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", authenticateToken, branchController.getBranchById);

/**
 * @swagger
 * /branches/{id}:
 *   put:
 *     summary: Actualizar sucursal
 *     tags: [Sucursales]
 *     description: Actualiza la información de una sucursal existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BranchCreateRequest'
 *     responses:
 *       200:
 *         description: Sucursal actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sucursal actualizada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *       404:
 *         description: Sucursal no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sucursal no encontrada"
 *       422:
 *         description: Error en la validación de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error en la validación de datos"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Error interno del servidor
 */
router.put(
  "/:id",
  authenticateToken,
  updateBranchValidator,
  branchController.updateBranch
);

/**
 * @swagger
 * /branches/{id}:
 *   delete:
 *     summary: Eliminar sucursal
 *     tags: [Sucursales]
 *     description: Elimina lógicamente una sucursal (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Sucursal eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sucursal eliminada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *       404:
 *         description: Sucursal no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sucursal no encontrada"
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", authenticateToken, branchController.deleteBranch);

export default router;
