import { Router } from "express";
import {
  startShiftValidationBiometric,
  completeShiftValidationBiometric,
  streamShiftValidationBiometric,
  getShiftValidationBiometricStatus,
  cancelShiftValidationBiometric,
} from "../controllers/shift_validation_biometric.controller";
import { authenticateToken } from "../middleware/auth.middleware";
const router = Router();

// Ruta para iniciar validación biométrica
router.post("/start", authenticateToken, startShiftValidationBiometric);

// Ruta para completar validación biométrica
router.post(
  "/complete/:sessionId",
  authenticateToken,
  completeShiftValidationBiometric
);

// Ruta para stream de eventos biométricos
router.get(
  "/stream/:sessionId",
  authenticateToken,
  streamShiftValidationBiometric
);

// Ruta para obtener estado de sesión
router.get(
  "/status/:sessionId",
  authenticateToken,
  getShiftValidationBiometricStatus
);

// Ruta para cancelar validación
router.post(
  "/cancel/:sessionId",
  authenticateToken,
  cancelShiftValidationBiometric
);

export default router;
