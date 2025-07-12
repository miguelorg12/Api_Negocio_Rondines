import { Router } from "express";
import * as userController from "../controllers/user.controller"
import { createUserValidator } from "../utils/validators/user.validator";

const router = Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', createUserValidator,userController.createUser);

export default router;