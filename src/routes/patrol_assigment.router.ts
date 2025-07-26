import { Router } from "express";
import {
  PatrolAssignmentValidator,
  PatrolAssignmentUpdateValidator,
} from "@utils/validators/patrol_assigment.validator";
import * as PatrolAssignmentController from "@controllers/patrol_assigment.controller";

const router = Router();

router.get("/", PatrolAssignmentController.getAllPatrolAssignments);

router.post(
  "/",
  PatrolAssignmentValidator,
  PatrolAssignmentController.createPatrolAssignment
);

router.get("/:id", PatrolAssignmentController.getPatrolAssignmentById);

router.put(
  "/:id",
  PatrolAssignmentUpdateValidator,
  PatrolAssignmentController.updatePatrolAssignment
);

router.delete("/:id", PatrolAssignmentController.deletePatrolAssignment);
export default router;
