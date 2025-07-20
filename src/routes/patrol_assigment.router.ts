import { Router } from "express";
import {
  PatrolAssignmentValidator,
  PatrolAssignmentUpdateValidator,
} from "@utils/validators/patrol_assigment.validator";
import * as PatrolAssignmentController from "@controllers/patrol_assigment.controller";

const router = Router();

/**
 * @openapi
 * /patrol_assignments:
 *   get:
 *     summary: Obtener todas las asignaciones de rondas
 *     tags:
 *       - PatrolAssignments
 *     responses:
 *       200:
 *         description: Lista de asignaciones obtenida correctamente
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
 *                     $ref: '#/components/schemas/PatrolAssignment'
 */
router.get("/", PatrolAssignmentController.getAllPatrolAssignments);
/**
 * @openapi
 * /patrol_assignments:
 *   post:
 *     summary: Crear una nueva asignación de ronda
 *     tags:
 *       - PatrolAssignments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PatrolAssignmentCreateRequest'
 *     responses:
 *       201:
 *         description: Asignación creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PatrolAssignment'
 *       422:
 *         description: Error en la validación de datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
router.post(
  "/",
  PatrolAssignmentValidator,
  PatrolAssignmentController.createPatrolAssignment
);
/**
 * @openapi
 * /patrol_assignments/{id}:
 *   get:
 *     summary: Obtener una asignación de ronda por ID
 *     tags:
 *       - PatrolAssignments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Asignación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PatrolAssignment'
 *       404:
 *         description: Asignación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/:id", PatrolAssignmentController.getPatrolAssignmentById);
/**
 * @openapi
 * /patrol_assignments/{id}:
 *   put:
 *     summary: Actualizar una asignación de ronda por ID
 *     tags:
 *       - PatrolAssignments
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
 *             $ref: '#/components/schemas/PatrolAssignmentCreateRequest'
 *     responses:
 *       200:
 *         description: Asignación actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PatrolAssignment'
 *       404:
 *         description: Asignación no encontrada
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
  PatrolAssignmentUpdateValidator,
  PatrolAssignmentController.updatePatrolAssignment
);
/**
 * @openapi
 * /patrol_assignments/{id}:
 *   delete:
 *     summary: Eliminar una asignación de ronda por ID
 *     tags:
 *       - PatrolAssignments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Asignación eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PatrolAssignment'
 *       404:
 *         description: Asignación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.delete("/:id", PatrolAssignmentController.deletePatrolAssignment);
export default router;
