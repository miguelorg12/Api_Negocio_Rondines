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
  createPatrolAndAssigment,
} from "@controllers/patrol.controller";

const router = Router();

router.get("/", getAllPatrols);

router.post("/", createPatrolValidator, createPatrol);

//this route is for creating a patrol and assigning it to a user
//it uses the createPatrolAndAssigment function from the controller
router.post(
  "/create-and-assign",
  createPatrolValidator,
  createPatrolAndAssigment
);

router.get("/:id", getPatrolById);

router.put("/:id", updatePatrolValidator, updatePatrol);

router.delete("/:id", deletePatrol);

export default router;
