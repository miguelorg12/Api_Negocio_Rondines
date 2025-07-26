import { Router } from "express";
import * as userController from "../controllers/user.controller";
import {
  createUserValidator,
  updateUserValidator,
} from "../utils/validators/user.validator";

const router = Router();
router.get("/", userController.getAllUsers);
router.get("/guards", userController.getAllGuards);
router.get("/guards/:id", userController.getGuardById);
router.get("/:id", userController.getUserById);

router.post("/", createUserValidator, userController.createUser);
router.put("/:id", updateUserValidator, userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
