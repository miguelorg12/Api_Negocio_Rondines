import { Router } from "express";
import {
  createPatrolValidator,
  updatePatrolValidator,
} from "@utils/validators/patrol.validator";
import {
  getAllPatrols,
  createPatrol,
  getPatrolById,
  updatePatrol,
  deletePatrol,
} from "@controllers/patrol.controller";

const router = Router();
router.get("/", getAllPatrols);
router.post("/", createPatrolValidator, createPatrol);
router.get("/:id", getPatrolById);
router.put("/:id", updatePatrolValidator, updatePatrol);
router.delete("/:id", deletePatrol);

export default router;
