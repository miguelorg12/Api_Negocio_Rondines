import { Router } from "express";
import * as shiftController from "../controllers/shift.controller";
import {
  createShiftValidator,
  updateShiftValidator,
} from "../utils/validators/shift.validator";

const router = Router();

router.get("/", shiftController.getAllShifts);

router.post("/", createShiftValidator, shiftController.createShift);

router.get("/:id", shiftController.getShiftById);

router.put("/:id", updateShiftValidator, shiftController.updateShift);

router.delete("/:id", shiftController.deleteShift);

export default router;
