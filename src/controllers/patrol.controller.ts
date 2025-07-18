import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { PatrolService } from "@services/patrol.service";
import { PatrolDto, PartialPatrolDto } from "@interfaces/dto/patrol.dto";

const patrolService = new PatrolService();
export const getAllPatrols = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const patrols = await patrolService.getAll();
  return res.status(200).json({
    message: "Rondas obtenidas correctamente",
    patrols,
  });
};

export const createPatrol = async (
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
  const patrolData: PatrolDto = req.body;
  const newPatrol = await patrolService.create(patrolData);
  return res
    .status(201)
    .json({ message: "Ronda creada correctamente", patrol: newPatrol });
};

export const getPatrolById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const patrolId = parseInt(req.params.id);
  const patrol = await patrolService.getById(patrolId);
  if (!patrol) {
    return res.status(404).json({ message: "Ronda no encontrada" });
  }
  return res.status(200).json({ message: "Ronda encontrada", patrol });
};

export const updatePatrol = async (
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
  const patrolId = parseInt(req.params.id);
  const patrolData: PartialPatrolDto = req.body;
  const patrol = await patrolService.getById(patrolId);
  if (!patrol) {
    return res.status(404).json({ message: "Ronda no encontrada" });
  }
  const updatedPatrol = await patrolService.update(patrolId, patrolData);
  return res.status(200).json({
    message: "Ronda actualizada correctamente",
    patrol: updatedPatrol,
  });
};

export const deletePatrol = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const patrolId = parseInt(req.params.id);
  const patrol = await patrolService.getById(patrolId);
  if (!patrol) {
    return res.status(404).json({ message: "Ronda no encontrada" });
  }
  const deletedPatrol = await patrolService.delete(patrolId);
  return res.status(200).json({
    message: "Ronda eliminada correctamente",
    patrol: deletedPatrol,
  });
};
