import { Router } from "express";
import {
  startBiometricRegistration,
  streamBiometricEvents,
  getBiometricSessionStatus,
  completeBiometricRegistration,
  cancelBiometricRegistration,
  testArduinoConnection,
  debugActiveSessions,
  listAvailablePorts,
  getCurrentPortInfo,
  forceCleanupAllSessions,
} from "../controllers/biometric.controller";

const router = Router();

/**
 * @swagger
 * /biometric/start-registration:
 *   post:
 *     summary: Iniciar registro biométrico
 *     tags: [Biométrico]
 *     description: Inicia el proceso de registro biométrico para un usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario para registrar
 *               action:
 *                 type: string
 *                 default: "enroll"
 *                 description: Acción a realizar (enroll, verify, etc.)
 *     responses:
 *       200:
 *         description: Registro biométrico iniciado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Registro biométrico iniciado"
 *                 session_id:
 *                   type: string
 *                   description: ID de la sesión para seguir el proceso
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post("/start-registration", startBiometricRegistration);

/**
 * @swagger
 * /biometric/stream/{sessionId}:
 *   get:
 *     summary: Stream de eventos biométricos
 *     tags: [Biométrico]
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
router.get("/stream/:sessionId", streamBiometricEvents);

/**
 * @swagger
 * /biometric/status/{sessionId}:
 *   get:
 *     summary: Obtener estado de sesión biométrica
 *     tags: [Biométrico]
 *     description: Obtiene el estado actual de una sesión biométrica
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
 *                 message:
 *                   type: string
 *                   example: "Estado de sesión obtenido"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [connecting, waiting, processing, completed, error]
 *                     biometric_id:
 *                       type: integer
 *                       description: ID biométrico asignado (solo si completed)
 *       404:
 *         description: Sesión no encontrada
 */
router.get("/status/:sessionId", getBiometricSessionStatus);

/**
 * @swagger
 * /biometric/complete/{sessionId}:
 *   post:
 *     summary: Completar registro biométrico
 *     tags: [Biométrico]
 *     description: Completa el registro biométrico guardando el ID en la base de datos
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
 *             properties:
 *               biometric_id:
 *                 type: integer
 *                 description: ID biométrico asignado por el dispositivo
 *     responses:
 *       200:
 *         description: Registro biométrico completado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Registro biométrico completado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                     biometric_id:
 *                       type: integer
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Sesión o usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post("/complete/:sessionId", completeBiometricRegistration);

/**
 * @swagger
 * /biometric/cancel/{sessionId}:
 *   post:
 *     summary: Cancelar registro biométrico
 *     tags: [Biométrico]
 *     description: Cancela una sesión de registro biométrico en curso
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la sesión biométrica
 *     responses:
 *       200:
 *         description: Registro biométrico cancelado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Registro biométrico cancelado"
 *       404:
 *         description: Sesión no encontrada
 */
router.post("/cancel/:sessionId", cancelBiometricRegistration);

/**
 * @swagger
 * /biometric/debug/force-cleanup:
 *   post:
 *     summary: Debug - Forzar limpieza de todas las sesiones
 *     tags: [Biométrico]
 *     description: Endpoint de debug para forzar la limpieza de todas las sesiones biométricas activas
 *     responses:
 *       200:
 *         description: Limpieza forzada completada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Limpieza forzada de todas las sesiones completada"
 *                 data:
 *                   type: object
 *                   properties:
 *                     active_sessions_after:
 *                       type: integer
 *                       description: Número de sesiones activas después de la limpieza
 *       500:
 *         description: Error interno del servidor
 */
router.post("/debug/force-cleanup", forceCleanupAllSessions);

/**
 * @swagger
 * /biometric/debug/sessions:
 *   get:
 *     summary: Debug - Listar sesiones activas
 *     tags: [Biométrico]
 *     description: Endpoint de debug para listar todas las sesiones biométricas activas
 *     responses:
 *       200:
 *         description: Lista de sesiones activas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sesiones activas obtenidas"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_sessions:
 *                       type: integer
 *                       description: Número total de sesiones activas
 *                     session_ids:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Lista de IDs de sesiones activas
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           session_id:
 *                             type: string
 *                           user_id:
 *                             type: integer
 *                           status:
 *                             type: string
 *                           clients_count:
 *                             type: integer
 *       500:
 *         description: Error interno del servidor
 */
router.get("/debug/sessions", debugActiveSessions);

/**
 * @swagger
 * /biometric/debug/ports:
 *   get:
 *     summary: Debug - Listar puertos COM disponibles
 *     tags: [Biométrico]
 *     description: Endpoint de debug para listar todos los puertos COM disponibles en el sistema
 *     responses:
 *       200:
 *         description: Lista de puertos COM obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Puertos COM disponibles obtenidos"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_ports:
 *                       type: integer
 *                       description: Número total de puertos COM disponibles
 *                     ports:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           path:
 *                             type: string
 *                             description: Ruta del puerto (ej: COM5, COM6)
 *                           manufacturer:
 *                             type: string
 *                             description: Fabricante del dispositivo
 *                           serialNumber:
 *                             type: string
 *                             description: Número de serie del dispositivo
 *                           pnpId:
 *                             type: string
 *                             description: ID Plug and Play del dispositivo
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp de cuando se obtuvo la información
 *       500:
 *         description: Error interno del servidor
 */
router.get("/debug/ports", listAvailablePorts);

/**
 * @swagger
 * /biometric/debug/port-info/{sessionId}:
 *   get:
 *     summary: Debug - Obtener información del puerto de una sesión
 *     tags: [Biométrico]
 *     description: Endpoint de debug para obtener información del puerto COM que está usando una sesión específica
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la sesión biométrica
 *     responses:
 *       200:
 *         description: Información del puerto obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Información del puerto obtenida"
 *                 data:
 *                   type: object
 *                   properties:
 *                     session_id:
 *                       type: string
 *                       description: ID de la sesión
 *                     port_info:
 *                       type: object
 *                       properties:
 *                         path:
 *                           type: string
 *                           description: Ruta del puerto (ej: COM5)
 *                         status:
 *                           type: string
 *                           description: Estado del puerto (open/closed)
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp de cuando se obtuvo la información
 *       400:
 *         description: sessionId no proporcionado
 *       404:
 *         description: Sesión no encontrada o sin puerto activo
 *       500:
 *         description: Error interno del servidor
 */
router.get("/debug/port-info/:sessionId", getCurrentPortInfo);

export default router;
