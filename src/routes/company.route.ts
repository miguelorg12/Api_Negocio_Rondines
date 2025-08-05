import { Router } from "express";
import * as companyController from "../controllers/company.controller";
import {
  createCompanyValidator,
  updateCompanyValidator,
} from "../utils/validators/company.validator";
import { authenticateToken } from "../middleware/auth.middleware";
const router = Router();

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Obtener todas las compañías
 *     tags: [Compañías]
 *     description: Retorna una lista de todas las compañías en el sistema
 *     responses:
 *       200:
 *         description: Lista de compañías obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Empresas obtenidas correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Company'
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", authenticateToken, companyController.getAllCompanies);

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Crear una nueva compañía
 *     tags: [Compañías]
 *     description: Crea una nueva compañía en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompanyCreateRequest'
 *     responses:
 *       201:
 *         description: Compañía creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Empresa creada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Company'
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
  createCompanyValidator,
  companyController.createCompany
);

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Obtener compañía por ID
 *     tags: [Compañías]
 *     description: Retorna una compañía específica por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la compañía
 *     responses:
 *       200:
 *         description: Compañía encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Empresa encontrada"
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *       404:
 *         description: Compañía no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Empresa no encontrada"
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", authenticateToken, companyController.getCompanyById);

/**
 * @swagger
 * /companies/{id}:
 *   put:
 *     summary: Actualizar compañía
 *     tags: [Compañías]
 *     description: Actualiza una compañía existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la compañía a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la compañía
 *               email:
 *                 type: string
 *                 description: Email de la compañía
 *               phone:
 *                 type: string
 *                 description: Teléfono de la compañía
 *     responses:
 *       200:
 *         description: Compañía actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Empresa actualizada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *       404:
 *         description: Compañía no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Empresa no encontrada"
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
  updateCompanyValidator,
  companyController.updateCompany
);

/**
 * @swagger
 * /companies/{id}:
 *   delete:
 *     summary: Eliminar compañía
 *     tags: [Compañías]
 *     description: Elimina una compañía del sistema (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la compañía a eliminar
 *     responses:
 *       200:
 *         description: Compañía eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Empresa eliminada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *       404:
 *         description: Compañía no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Empresa no encontrada"
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", authenticateToken, companyController.deleteCompany);

export default router;
