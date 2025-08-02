import { Request, Response } from "express";
import { BiometricService } from "../services/biometric.service";
import { ShiftValidationService } from "../services/shift_validation.service";

const biometricService = new BiometricService();
const shiftValidationService = new ShiftValidationService();

/**
 * @swagger
 * /shift-validation/biometric/start:
 *   post:
 *     summary: Iniciar validación biométrica de turno
 *     tags: [Shift Validation]
 *     description: Inicia el proceso de validación biométrica para un turno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - timestamp
 *             properties:
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora del intento de validación
 *                 example: "2025-08-01T14:30:00.000Z"
 *     responses:
 *       200:
 *         description: Validación biométrica iniciada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Validación biométrica iniciada"
 *                 session_id:
 *                   type: string
 *                   description: ID de la sesión para seguir el proceso
 *                 stream_url:
 *                   type: string
 *                   description: URL para el stream de eventos
 *                 complete_url:
 *                   type: string
 *                   description: URL para completar la validación
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
export const startShiftValidationBiometric = async (
  req: Request,
  res: Response
) => {
  try {
    const { timestamp } = req.body;

    if (!timestamp) {
      return res.status(400).json({
        success: false,
        message: "El timestamp es requerido",
      });
    }

    // Iniciar sesión biométrica para verificación
    const { session_id } = await biometricService.startRegistration(
      0,
      "verify"
    );

    res.json({
      success: true,
      message: "Validación biométrica iniciada",
      session_id,
      stream_url: `/api/v1/shift-validation/biometric/stream/${session_id}`,
      complete_url: `/api/v1/shift-validation/biometric/complete/${session_id}`,
      timestamp,
    });
  } catch (error) {
    console.error("Error iniciando validación biométrica:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

/**
 * @swagger
 * /shift-validation/biometric/complete/{sessionId}:
 *   post:
 *     summary: Completar validación biométrica de turno
 *     tags: [Shift Validation]
 *     description: Completa la validación biométrica usando el ID obtenido de la huella
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la sesión biométrica
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - biometric_id
 *               - timestamp
 *             properties:
 *               biometric_id:
 *                 type: integer
 *                 description: ID biométrico obtenido de la huella
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora del intento de validación
 *     responses:
 *       200:
 *         description: Validación completada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 *                 patrolRecord:
 *                   type: object
 *                 shift:
 *                   type: object
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Sesión no encontrada
 *       500:
 *         description: Error interno del servidor
 */
export const completeShiftValidationBiometric = async (
  req: Request,
  res: Response
) => {
  try {
    const { sessionId } = req.params;
    const { biometric_id, timestamp } = req.body;

    if (!biometric_id || !timestamp) {
      return res.status(400).json({
        success: false,
        message: "biometric_id y timestamp son requeridos",
      });
    }

    // Obtener estado de la sesión
    const sessionStatus = biometricService.getSessionStatus(sessionId);
    if (!sessionStatus) {
      return res.status(404).json({
        success: false,
        message: "Sesión biométrica no encontrada",
      });
    }

    if (sessionStatus.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "La sesión biométrica aún no está completada",
      });
    }

    // Validar turno con el biometric obtenido
    const validationResult = await shiftValidationService.validateShift({
      biometric: biometric_id,
      timestamp: timestamp,
    });

    // Limpiar sesión biométrica
    biometricService.cleanupSession(sessionId);

    res.json(validationResult);
  } catch (error) {
    console.error("Error completando validación biométrica:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

/**
 * @swagger
 * /shift-validation/biometric/stream/{sessionId}:
 *   get:
 *     summary: Stream de eventos biométricos para validación
 *     tags: [Shift Validation]
 *     description: Endpoint para Server-Sent Events que transmite eventos en tiempo real del proceso biométrico
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la sesión biométrica
 *     responses:
 *       200:
 *         description: Stream de eventos iniciado
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: "data: {\"type\":\"waiting_first\",\"message\":\"Coloque el dedo en el sensor...\",\"status\":\"waiting_first\"}\n\n"
 *       404:
 *         description: Sesión no encontrada
 */
export const streamShiftValidationBiometric = async (
  req: Request,
  res: Response
) => {
  try {
    const { sessionId } = req.params;

    const session = biometricService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Sesión biométrica no encontrada",
      });
    }

    // Configurar headers para Server-Sent Events
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    // Agregar cliente a la sesión
    biometricService.addClientToSession(sessionId, res);

    // Enviar evento inicial
    res.write(
      `data: ${JSON.stringify({
        type: "connected",
        message: "Conectado al stream de validación biométrica",
        status: "connected",
      })}\n\n`
    );

    // Manejar desconexión del cliente
    req.on("close", () => {
      biometricService.removeClientFromSession(sessionId, res);
    });
  } catch (error) {
    console.error("Error en stream biométrico:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

/**
 * @swagger
 * /shift-validation/biometric/status/{sessionId}:
 *   get:
 *     summary: Obtener estado de sesión biométrica de validación
 *     tags: [Shift Validation]
 *     description: Obtiene el estado actual de una sesión biométrica de validación
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la sesión biométrica
 *     responses:
 *       200:
 *         description: Estado de sesión obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [connecting, waiting, processing, completed, error]
 *                     biometric_id:
 *                       type: integer
 *                       description: ID biométrico obtenido (solo si completed)
 *       404:
 *         description: Sesión no encontrada
 */
export const getShiftValidationBiometricStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { sessionId } = req.params;

    const sessionStatus = biometricService.getSessionStatus(sessionId);
    if (!sessionStatus) {
      return res.status(404).json({
        success: false,
        message: "Sesión biométrica no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Estado de sesión obtenido",
      data: sessionStatus,
    });
  } catch (error) {
    console.error("Error obteniendo estado biométrico:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

/**
 * @swagger
 * /shift-validation/biometric/cancel/{sessionId}:
 *   post:
 *     summary: Cancelar validación biométrica de turno
 *     tags: [Shift Validation]
 *     description: Cancela una sesión de validación biométrica en curso
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la sesión biométrica
 *     responses:
 *       200:
 *         description: Validación biométrica cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Validación biométrica cancelada"
 *       404:
 *         description: Sesión no encontrada
 */
export const cancelShiftValidationBiometric = async (
  req: Request,
  res: Response
) => {
  try {
    const { sessionId } = req.params;

    const session = biometricService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Sesión biométrica no encontrada",
      });
    }

    // Limpiar sesión
    biometricService.cleanupSession(sessionId);

    res.json({
      success: true,
      message: "Validación biométrica cancelada",
    });
  } catch (error) {
    console.error("Error cancelando validación biométrica:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};
