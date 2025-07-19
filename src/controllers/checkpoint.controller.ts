import { Response, Request } from "express";
import { validationResult } from "express-validator";
import { CheckpointService } from "@services/checkpoint.service";
import {
  CheckPointDto,
  PartialCheckPointDto,
} from "@interfaces/dto/checkpoint.dto";

const checkpointService = new CheckpointService();

export const getAllCheckpoints = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const checkpoints = await checkpointService.findAll();
  return res.status(200).json({
    message: "Puntos de control obtenidos correctamente",
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
  const checkpointData: CheckPointDto = req.body;
  const newCheckpoint = await checkpointService.create(checkpointData);
  return res.status(201).json({
    message: "Punto de control creado correctamente",
    data: newCheckpoint,
  });
};

export const getCheckpointById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const checkpointId = parseInt(req.params.id);
  const checkpoint = await checkpointService.findById(checkpointId);
  if (!checkpoint) {
    return res.status(404).json({ message: "Punto de control no encontrado" });
  }
  return res
    .status(200)
    .json({ message: "Punto de control encontrado", data: checkpoint });
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
  const checkpointId = parseInt(req.params.id);
  const checkpointData: PartialCheckPointDto = req.body;
  const updatedCheckpoint = await checkpointService.update(
    checkpointId,
    checkpointData
  );
  if (!updatedCheckpoint) {
    return res.status(404).json({ message: "Punto de control no encontrado" });
  }
  return res.status(200).json({
    message: "Punto de control actualizado correctamente",
    data: updatedCheckpoint,
  });
};

export const deleteCheckpoint = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const checkpointId = parseInt(req.params.id);
  const deletedCheckpoint = await checkpointService.delete(checkpointId);
  if (!deletedCheckpoint) {
    return res.status(404).json({ message: "Punto de control no encontrado" });
  }
  return res.status(200).json({
    message: "Punto de control eliminado correctamente",
    data: deletedCheckpoint,
  });
};
