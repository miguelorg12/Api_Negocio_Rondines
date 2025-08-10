import { Router } from "express";
import * as networkController from "../controllers/network.controller";
import {
  createNetworkValidator,
  updateNetworkValidator,
} from "../utils/validators/network.validator";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /networks:
 *   get:
 *     summary: Obtener todas las redes
 *     tags: [Redes]
 *     description: Retorna una lista de todas las redes activas
 *     responses:
 *       200:
 *         description: Lista de redes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Redes obtenidas correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Network'
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", authenticateToken, networkController.getAllNetworks);

/**
 * @swagger
 * /networks:
 *   post:
 *     summary: Crear nueva red
 *     tags: [Redes]
 *     description: Crea una nueva red en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ssid
 *               - password
 *               - branch_id
 *             properties:
 *               ssid:
 *                 type: string
 *                 description: Nombre de la red WiFi
 *                 example: "MiRedWiFi"
 *               password:
 *                 type: string
 *                 description: Contraseña de la red WiFi
 *                 example: "miContraseña123"
 *               branch_id:
 *                 type: integer
 *                 description: ID de la sucursal a la que pertenece la red
 *                 example: 1
 *     responses:
 *       201:
 *         description: Red creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Red creada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Network'
 *       422:
 *         description: Error en la validación de datos
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/",
  authenticateToken,
  createNetworkValidator,
  networkController.createNetwork
);

/**
 * @swagger
 * /networks/{id}:
 *   get:
 *     summary: Obtener red por ID
 *     tags: [Redes]
 *     description: Retorna una red específica por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la red
 *     responses:
 *       200:
 *         description: Red encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Red encontrada"
 *                 data:
 *                   $ref: '#/components/schemas/Network'
 *       404:
 *         description: Red no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", authenticateToken, networkController.getNetworkById);

/**
 * @swagger
 * /networks/branch/{branchId}:
 *   get:
 *     summary: Obtener redes por sucursal
 *     tags: [Redes]
 *     description: Retorna todas las redes asociadas a una sucursal específica
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Redes de la sucursal obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Redes de la sucursal obtenidas correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Network'
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/branch/:branchId",
  authenticateToken,
  networkController.getNetworksByBranch
);

/**
 * @swagger
 * /networks/{id}:
 *   put:
 *     summary: Actualizar red
 *     tags: [Redes]
 *     description: Actualiza una red existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la red
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ssid:
 *                 type: string
 *                 description: Nombre de la red WiFi
 *                 example: "MiRedWiFiActualizada"
 *               password:
 *                 type: string
 *                 description: Contraseña de la red WiFi
 *                 example: "nuevaContraseña123"
 *               branch_id:
 *                 type: integer
 *                 description: ID de la sucursal a la que pertenece la red
 *                 example: 1
 *     responses:
 *       200:
 *         description: Red actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Red actualizada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Network'
 *       404:
 *         description: Red no encontrada
 *       422:
 *         description: Error en la validación de datos
 *       500:
 *         description: Error interno del servidor
 */
router.put(
  "/:id",
  authenticateToken,
  updateNetworkValidator,
  networkController.updateNetwork
);

/**
 * @swagger
 * /networks/{id}:
 *   delete:
 *     summary: Eliminar red
 *     tags: [Redes]
 *     description: Elimina una red del sistema (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la red
 *     responses:
 *       200:
 *         description: Red eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Red eliminada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Network'
 *       404:
 *         description: Red no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", authenticateToken, networkController.deleteNetwork);

export default router;
