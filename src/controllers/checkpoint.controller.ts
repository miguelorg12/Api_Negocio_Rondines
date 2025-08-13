import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { CheckpointService } from "@services/checkpoint.service";
import {
  CheckpointDto,
  PartialCheckpointDto,
} from "@interfaces/dto/checkpoint.dto";
import { instanceToPlain } from "class-transformer";
import { firebaseService } from "@services/firebase.service";
import { AppDataSource } from "@configs/data-source";
import { User } from "@entities/user.entity";

const checkpointService = new CheckpointService();
const userRepository = AppDataSource.getRepository(User);

const sendNotificationToUser = async (userId: number, title: string, body: string) => {
  try {
    const user = await userRepository.findOne({ where: { id: userId } });
    if (user && user.device_token) {
      await firebaseService.sendNotification(user.device_token, title, body);
    }
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error);
  }
};

export const getAllCheckpoints = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const checkpoints = await checkpointService.getAll();
  return res.status(200).json({
    message: "Checkpoints obtenidos correctamente",
    data: checkpoints,
  });
};

export const getCheckpointById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const checkpoint = await checkpointService.getById(parseInt(id));
  if (!checkpoint) {
    return res.status(404).json({ message: "Checkpoint no encontrado" });
  }
  return res.status(200).json({
    message: "Checkpoint obtenido correctamente",
    data: checkpoint,
  });
};

export const getCheckpointsByBranchId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { branchId } = req.params;
  const checkpoints = await checkpointService.getByBranchId(parseInt(branchId));
  return res.status(200).json({
    message: "Checkpoints obtenidos correctamente",
    data: checkpoints,
  });
};

export const getCheckpointsByNetworkId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { networkId } = req.params;
  const checkpoints = await checkpointService.getByNetworkId(
    parseInt(networkId)
  );
  return res.status(200).json({
    message: "Checkpoints obtenidos correctamente",
    data: checkpoints,
  });
};

export const createCheckpoint = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Error en la validación de datos",
      errors: errors.array(),
    });
  }

  const checkpointData: CheckpointDto = req.body;
  const newCheckpoint = await checkpointService.create(checkpointData);
  return res.status(201).json({
    message: "Checkpoint creado correctamente",
    data: newCheckpoint,
  });
};

export const updateCheckpoint = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Error en la validación de datos",
      errors: errors.array(),
    });
  }

  const { id } = req.params;
  const checkpointData: PartialCheckpointDto = req.body;
  const updatedCheckpoint = await checkpointService.update(
    parseInt(id),
    checkpointData
  );
  if (!updatedCheckpoint) {
    return res.status(404).json({ message: "Checkpoint no encontrado" });
  }
  return res.status(200).json({
    message: "Checkpoint actualizado correctamente",
    data: updatedCheckpoint,
  });
};

export const deleteCheckpoint = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const deletedCheckpoint = await checkpointService.delete(parseInt(id));
  if (!deletedCheckpoint) {
    return res.status(404).json({ message: "Checkpoint no encontrado" });
  }
  return res.status(200).json({
    message: "Checkpoint eliminado correctamente",
    data: deletedCheckpoint,
  });
};

export const markCheckpointPatrol = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { user_id, checkpoint_id } = req.body;

  try {
    // 1. Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Error en la validación de datos",
        errors: errors.array(),
      });
    }

    // 2. Extraer datos del body (movido arriba)

    // 3. Validar datos requeridos
    if (!user_id || !checkpoint_id) {
      return res.status(400).json({
        message: "user_id y checkpoint_id son requeridos",
      });
    }

    // 4. Validar tipos de datos
    if (typeof user_id !== "number" || typeof checkpoint_id !== "number") {
      const message = "user_id y checkpoint_id deben ser números";
      if (user_id) {
        await sendNotificationToUser(user_id, "Error de Validación", message);
      }
      return res.status(400).json({
        message,
      });
    }

    // 5. Llamar al servicio
    const result = await checkpointService.markChekpointPatrol(
      user_id,
      checkpoint_id
    );

    // 6. Respuesta exitosa
    await sendNotificationToUser(user_id, "Checkpoint Marcado", result.message);
    return res.status(200).json({
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error("Error marcando checkpoint:", error);

    if (error instanceof Error) {
      if (error.message.includes("El usuario no tiene un turno en progreso")) {
        const message = "No tienes un turno activo para hoy";
        await sendNotificationToUser(user_id, "Error de Turno", message);
        return res.status(404).json({
          message,
          error: error.message,
        });
      }

      if (error.message.includes("El checkpoint especificado no existe")) {
        const message = "Checkpoint no encontrado";
        await sendNotificationToUser(user_id, "Error de Checkpoint", message);
        return res.status(404).json({
          message,
          error: error.message,
        });
      }

      if (
        error.message.includes(
          "El checkpoint no pertenece a una sucursal asignada"
        )
      ) {
        const message = "No tienes permisos para este checkpoint";
        await sendNotificationToUser(user_id, "Error de Permisos", message);
        return res.status(403).json({
          message,
          error: error.message,
        });
      }

      if (error.message.includes("El checkpoint no está en la ruta asignada")) {
        const message = "Este checkpoint no está en tu ruta asignada";
        await sendNotificationToUser(user_id, "Error de Ruta", message);
        return res.status(400).json({
          message,
          error: error.message,
        });
      }

      if (error.message.includes("Debe completar el checkpoint")) {
        const message = "Debe completar los checkpoints en orden";
        await sendNotificationToUser(user_id, "Error de Orden", message);
        return res.status(400).json({
          message,
          error: error.message,
        });
      }

      if (error.message.includes("No se encontró el registro de checkpoint")) {
        const message =
          "No se encontró el registro de checkpoint para esta asignación";
        await sendNotificationToUser(user_id, "Error de Registro", message);
        return res.status(404).json({
          message,
          error: error.message,
        });
      }

      if (
        error.message.includes("Este checkpoint ya fue marcado anteriormente")
      ) {
        const message = "Este checkpoint ya fue marcado anteriormente";
        await sendNotificationToUser(user_id, "Error de Marcación", message);
        return res.status(400).json({
          message,
          error: error.message,
        });
      }
    }

    const finalMessage = "Error interno del servidor";
    if (user_id) {
      await sendNotificationToUser(user_id, "Error de Marcación", error instanceof Error ? error.message : "Error desconocido",);
    }
    return res.status(500).json({
      message: finalMessage,
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
