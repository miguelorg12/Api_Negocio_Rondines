import { Router } from "express";
import * as userController from "../controllers/user.controller";
import {
  createUserValidator,
  updateUserValidator,
} from "../utils/validators/user.validator";

const router = Router();

router.get("/", userController.getAllUsers);
router.post("/", createUserValidator, userController.createUser);
router.get("/:id", userController.getUserById);
router.put("/:id", updateUserValidator, userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
