import { Router } from "express";
import {
  startShiftValidationBiometric,
  completeShiftValidationBiometric,
  streamShiftValidationBiometric,
  getShiftValidationBiometricStatus,
  cancelShiftValidationBiometric,
} from "../controllers/shift_validation_biometric.controller";

const router = Router();

// Ruta para iniciar validación biométrica
router.post("/start", startShiftValidationBiometric);

// Ruta para completar validación biométrica
router.post("/complete/:sessionId", completeShiftValidationBiometric);

// Ruta para stream de eventos biométricos
router.get("/stream/:sessionId", streamShiftValidationBiometric);

// Ruta para obtener estado de sesión
router.get("/status/:sessionId", getShiftValidationBiometricStatus);

// Ruta para cancelar validación
router.post("/cancel/:sessionId", cancelShiftValidationBiometric);

export default router;
