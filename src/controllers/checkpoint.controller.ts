import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { CheckpointService } from "@services/checkpoint.service";
import {
  CheckpointDto,
  PartialCheckpointDto,
} from "@interfaces/dto/checkpoint.dto";

const checkpointService = new CheckpointService();

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
  try {
    // 1. Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Error en la validación de datos",
        errors: errors.array(),
      });
    }

    // 2. Extraer datos del body
    const { user_id, nfc_uid, checkpoint_id } = req.body;

    // 3. Validar datos requeridos
    if (!user_id || !nfc_uid || !checkpoint_id) {
      return res.status(400).json({
        message: "user_id, nfc_uid y checkpoint_id son requeridos",
      });
    }

    // 4. Validar tipos de datos
    if (
      typeof user_id !== "number" ||
      typeof nfc_uid !== "string" ||
      typeof checkpoint_id !== "number"
    ) {
      return res.status(400).json({
        message:
          "user_id y checkpoint_id deben ser números, nfc_uid debe ser string",
      });
    }

    // 5. Llamar al servicio
    const result = await checkpointService.markChekpointPatrol(
      user_id,
      nfc_uid,
      checkpoint_id
    );

    // 6. Respuesta exitosa
    return res.status(200).json({
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error("Error marcando checkpoint:", error);

    if (error instanceof Error) {
      if (error.message.includes("El usuario no tiene un turno en progreso")) {
        return res.status(404).json({
          message: "No tienes un turno activo para hoy",
          error: error.message,
        });
      }

      if (error.message.includes("El checkpoint especificado no existe")) {
        return res.status(404).json({
          message: "Checkpoint no encontrado",
          error: error.message,
        });
      }

      if (
        error.message.includes(
          "El checkpoint no pertenece a una sucursal asignada"
        )
      ) {
        return res.status(403).json({
          message: "No tienes permisos para este checkpoint",
          error: error.message,
        });
      }

      if (error.message.includes("El checkpoint no está en la ruta asignada")) {
        return res.status(400).json({
          message: "Este checkpoint no está en tu ruta asignada",
          error: error.message,
        });
      }

      if (error.message.includes("Debe completar el checkpoint")) {
        return res.status(400).json({
          message: "Debe completar los checkpoints en orden",
          error: error.message,
        });
      }

      if (error.message.includes("No se encontró el registro de checkpoint")) {
        return res.status(404).json({
          message:
            "No se encontró el registro de checkpoint para esta asignación",
          error: error.message,
        });
      }

      if (
        error.message.includes("Este checkpoint ya fue marcado anteriormente")
      ) {
        return res.status(400).json({
          message: "Este checkpoint ya fue marcado anteriormente",
          error: error.message,
        });
      }
    }

    return res.status(500).json({
      message: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
