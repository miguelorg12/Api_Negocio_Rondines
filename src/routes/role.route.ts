import { Router } from "express";
import * as roleController from "../controllers/role.controller";
import {
  createRoleValidator,
  updateRoleValidator,
} from "../utils/validators/role.validator";

const router = Router();

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Obtener todos los roles
 *     tags: [Roles]
 *     description: Retorna una lista de todos los roles en el sistema
 *     responses:
 *       200:
 *         description: Lista de roles obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Roles obtenidos correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Role'
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", roleController.getAllRoles);

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Crear un nuevo rol
 *     tags: [Roles]
 *     description: Crea un nuevo rol en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del rol
 *     responses:
 *       201:
 *         description: Rol creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rol creado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       422:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Error interno del servidor
 */
router.post("/", createRoleValidator, roleController.createRole);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Obtener rol por ID
 *     tags: [Roles]
 *     description: Retorna un rol específico por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol
 *     responses:
 *       200:
 *         description: Rol encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rol encontrado"
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       404:
 *         description: Rol no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rol no encontrado"
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", roleController.getRoleById);

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Actualizar rol
 *     tags: [Roles]
 *     description: Actualiza un rol existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del rol
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rol actualizado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       404:
 *         description: Rol no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rol no encontrado"
 *       422:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Error interno del servidor
 */
router.put("/:id", updateRoleValidator, roleController.updateRole);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Eliminar rol
 *     tags: [Roles]
 *     description: Elimina un rol del sistema (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol a eliminar
 *     responses:
 *       200:
 *         description: Rol eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rol eliminado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       404:
 *         description: Rol no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rol no encontrado"
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", roleController.deleteRole);

export default router;
