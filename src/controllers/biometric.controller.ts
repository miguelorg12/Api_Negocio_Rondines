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

  const session = biometricService.getSession(sessionId);
  if (!session) {
    res.status(404).json({ error: "Sesión no encontrada" });
    return;
  }

  // Configurar SSE
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
      message: "Conectado al stream de eventos",
      status: "connected",
    })}\n\n`
  );

  // Limpiar cuando se cierre la conexión
  req.on("close", () => {
    biometricService.removeClientFromSession(sessionId, res);
  });

  req.on("error", () => {
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
