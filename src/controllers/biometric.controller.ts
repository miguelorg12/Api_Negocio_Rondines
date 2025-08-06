import { Request, Response } from "express";
import { BiometricService } from "../services/biometric.service";
import { UserService } from "../services/user.service";

const biometricService = new BiometricService();
const userService = new UserService();

export const startBiometricRegistration = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { user_id, action = "enroll" } = req.body;

    console.log("=== CONTROLLER DEBUG ===");
    console.log("Request body:", req.body);
    console.log("user_id:", user_id);
    console.log("action:", action);
    console.log("========================");

    if (!user_id) {
      return res.status(400).json({
        error: "user_id es requerido",
      });
    }

    // Verificar que el usuario existe
    const user = await userService.findById(user_id);
    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    console.log("Usuario encontrado:", user.name);
    const result = await biometricService.startRegistration(user_id, action);

    return res.status(200).json({
      message: "Registro biométrico iniciado",
      session_id: result.session_id,
    });
  } catch (error) {
    console.error("Error iniciando registro biométrico:", error);
    return res.status(500).json({
      error: "Error iniciando comunicación con el dispositivo biométrico",
    });
  }
};

export const streamBiometricEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sessionId } = req.params;

  console.log("=== SSE CONNECTION DEBUG ===");
  console.log("Session ID:", sessionId);
  console.log("Request headers:", req.headers);
  console.log("===========================");

  const session = biometricService.getSession(sessionId);
  if (!session) {
    console.log("Sesión no encontrada:", sessionId);
    res.status(404).json({ error: "Sesión no encontrada" });
    return;
  }

  console.log("Sesión encontrada, configurando SSE...");

  // Configurar headers específicos para SSE y CORS
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Cache-Control, Content-Type");
  res.setHeader("Access-Control-Expose-Headers", "Cache-Control, Content-Type");
  res.setHeader("X-Accel-Buffering", "no"); // Importante para nginx

  // Deshabilitar timeouts
  req.setTimeout(0);
  res.setTimeout(0);

  // Enviar heartbeat cada 30 segundos para mantener la conexión
  const heartbeat = setInterval(() => {
    if (!res.destroyed) {
      res.write(": heartbeat\n\n");
    }
  }, 30000);

  // Agregar cliente a la sesión
  biometricService.addClientToSession(sessionId, res);

  // Enviar evento inicial
  res.write(
    `data: ${JSON.stringify({
      type: "connected",
      message: "Conectado al stream de eventos",
      status: "connected",
      session_id: sessionId,
    })}\n\n`
  );

  console.log("Cliente agregado a la sesión, conexión establecida");

  // Limpiar cuando se cierre la conexión
  req.on("close", () => {
    console.log("Conexión SSE cerrada para sesión:", sessionId);
    clearInterval(heartbeat);
    biometricService.removeClientFromSession(sessionId, res);
  });

  req.on("error", (error) => {
    console.error("Error en conexión SSE:", error);
    clearInterval(heartbeat);
    biometricService.removeClientFromSession(sessionId, res);
  });

  res.on("error", (error) => {
    console.error("Error en respuesta SSE:", error);
    clearInterval(heartbeat);
    biometricService.removeClientFromSession(sessionId, res);
  });
};

export const getBiometricSessionStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { sessionId } = req.params;

  const status = biometricService.getSessionStatus(sessionId);
  if (!status) {
    return res.status(404).json({
      error: "Sesión no encontrada",
    });
  }

  return res.status(200).json({
    message: "Estado de sesión obtenido",
    data: status,
  });
};

export const completeBiometricRegistration = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { sessionId } = req.params;
    const { biometric_id } = req.body;

    const session = biometricService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: "Sesión no encontrada",
      });
    }

    if (!biometric_id) {
      return res.status(400).json({
        error: "biometric_id es requerido",
      });
    }

    // Guardar el ID biométrico en el usuario
    const updatedUser = await userService.saveBiometricId(
      session.user_id,
      biometric_id
    );
    if (!updatedUser) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    // Limpiar la sesión
    biometricService.cleanupSession(sessionId);

    return res.status(200).json({
      message: "Registro biométrico completado exitosamente",
      data: {
        user_id: session.user_id,
        biometric_id: biometric_id,
      },
    });
  } catch (error) {
    console.error("Error completando registro biométrico:", error);
    return res.status(500).json({
      error: "Error completando registro biométrico",
    });
  }
};

export const cancelBiometricRegistration = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { sessionId } = req.params;

  const session = biometricService.getSession(sessionId);
  if (!session) {
    return res.status(404).json({
      error: "Sesión no encontrada",
    });
  }

  // Limpiar la sesión
  biometricService.cleanupSession(sessionId);

  return res.status(200).json({
    message: "Registro biométrico cancelado",
  });
};

export const testArduinoConnection = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    console.log("=== TESTING ARDUINO CONNECTION ===");
    console.log("ARDUINO_PORT:", process.env.ARDUINO_PORT || "COM5");
    console.log("ARDUINO_BAUDRATE:", process.env.ARDUINO_BAUDRATE || "9600");

    const { SerialPort } = await import("serialport");

    // Listar puertos disponibles
    const ports = await SerialPort.list();
    console.log(
      "Puertos disponibles:",
      ports.map((p) => ({ path: p.path, manufacturer: p.manufacturer }))
    );

    return res.status(200).json({
      message: "Información de conexión Arduino",
      data: {
        configured_port: process.env.ARDUINO_PORT || "COM5",
        configured_baudrate: process.env.ARDUINO_BAUDRATE || "9600",
        available_ports: ports.map((p) => ({
          path: p.path,
          manufacturer: p.manufacturer,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error testing Arduino connection:", error);
    return res.status(500).json({
      error: "Error probando conexión Arduino",
      details: error.message,
    });
  }
};
