import { Router } from "express";
import * as checkpointController from "../controllers/checkpoint.controller";
import {
  createCheckpointValidator,
  updateCheckpointValidator,
} from "../utils/validators/checkpoint.validator";

const router = Router();
router.get("/", checkpointController.getAllCheckpoints);
router.post(
  "/",
  createCheckpointValidator,
  checkpointController.createCheckpoint
);
router.get("/:id", checkpointController.getCheckpointById);
router.put(
  "/:id",
  updateCheckpointValidator,
  checkpointController.updateCheckpoint
);
router.delete("/:id", checkpointController.deleteCheckpoint);

export default router;
