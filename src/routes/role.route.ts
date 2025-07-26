import { Router } from "express";
import * as roleController from "../controllers/role.controller";
import {
  createRoleValidator,
  updateRoleValidator,
} from "../utils/validators/role.validator";

const router = Router();

router.get("/", roleController.getAllRoles);

router.post("/", createRoleValidator, roleController.createRole);

router.get("/:id", roleController.getRoleById);

router.put("/:id", updateRoleValidator, roleController.updateRole);

router.delete("/:id", roleController.deleteRole);

export default router;
