import { Router } from "express";
import * as userController from "../controllers/user.controller";
import {
  createUserValidator,
  updateUserValidator,
} from "../utils/validators/user.validator";

const router = Router();

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Obtiene todos los usuarios
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Usuarios obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserAllResponse'
 */
router.get("/", userController.getAllUsers);
router.post("/", createUserValidator, userController.createUser);
router.get("/:id", userController.getUserById);
router.put("/:id", updateUserValidator, userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
