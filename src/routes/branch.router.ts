import { Router } from "express";
import * as branchController from "../controllers/branch.controller";
import {
  createBranchValidator,
  updateBranchValidator,
} from "../utils/validators/branch.validator";
const router = Router();

router.get("/", branchController.getAllBranches);

router.post("/", createBranchValidator, branchController.createBranch);

router.get("/:id", branchController.getBranchById);

router.put("/:id", updateBranchValidator, branchController.updateBranch);

router.delete("/:id", branchController.deleteBranch);

export default router;
