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
    const { user_id, nfc_uid } = req.body;

    // 3. Validar datos requeridos
    if (!user_id || !nfc_uid) {
      return res.status(400).json({
        message: "user_id y nfc_uid son requeridos",
      });
    }

    // 4. Validar tipos de datos
    if (typeof user_id !== "number" || typeof nfc_uid !== "string") {
      return res.status(400).json({
        message: "user_id debe ser número y nfc_uid debe ser string",
      });
    }

    // 5. Llamar al servicio
    const result = await checkpointService.markChekpointPatrol(
      user_id,
      nfc_uid
    );

    // 6. Respuesta exitosa
    return res.status(200).json({
      message: "Checkpoint marcado correctamente",
      data: result,
    });
  } catch (error) {
    console.error("Error marcando checkpoint:", error);

    if (error instanceof Error) {
      if (error.message.includes("No se encontró el recorrido")) {
        return res.status(404).json({
          message: "No tienes un turno activo para hoy",
          error: error.message,
        });
      }

      if (error.message.includes("No se encontró el checkpoint")) {
        return res.status(404).json({
          message: "Checkpoint no encontrado",
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
