import { Router } from "express";
import * as guardController from "../controllers/guard.controller";
import {
  createGuardsValidator,
  updateGuardValidator,
} from "../utils/validators/guard.validator";

const router = Router();

router.get("/branch/:branchId", guardController.getGuardsByBranch);
router.get("/patrols/assigned/:id", guardController.patrolsAssignedToGuard);
router.get("/", guardController.getAllGuards);
router.get("/:id", guardController.getGuardById);
router.post("/", createGuardsValidator, guardController.createGuard);
router.put("/:id", updateGuardValidator, guardController.updateGuard);
router.delete("/:id", guardController.deleteGuard);

export default router;
