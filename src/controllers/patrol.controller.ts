import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { PatrolService } from "@services/patrol.service";
import {
  PatrolDto,
  PartialPatrolDto,
  PatrolAssigmentDto,
} from "@interfaces/dto/patrol.dto";
import { CreatePatrolWithRoutePointsDto } from "@interfaces/dto/patrol_route_point.dto";

const patrolService = new PatrolService();

export const getAllPatrols = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const patrols = await patrolService.getAll();
  return res.status(200).json({
    message: "Rondas obtenidas correctamente",
    data: patrols,
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
    .json({ message: "Ronda creada correctamente", data: newPatrol });
};

export const getPatrolById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const patrol = await patrolService.getById(parseInt(id));
  if (!patrol) {
    return res.status(404).json({ message: "Ronda no encontrada" });
  }
  return res.status(200).json({
    message: "Ronda obtenida correctamente",
    data: patrol,
  });
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
  const { id } = req.params;
  const patrolData: PartialPatrolDto = req.body;
  const updatedPatrol = await patrolService.update(parseInt(id), patrolData);
  if (!updatedPatrol) {
    return res.status(404).json({ message: "Ronda no encontrada" });
  }
  return res.status(200).json({
    message: "Ronda actualizada correctamente",
    data: updatedPatrol,
  });
};

export const deletePatrol = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const deletedPatrol = await patrolService.delete(parseInt(id));
  if (!deletedPatrol) {
    return res.status(404).json({ message: "Ronda no encontrada" });
  }
  return res.status(200).json({
    message: "Ronda eliminada correctamente",
    data: deletedPatrol,
  });
};

export const createPatrolAndAssigment = async (
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
  const patrolData: PatrolAssigmentDto = req.body;
  const newPatrol = await patrolService.createPatrolAndAssigment(patrolData);
  return res.status(201).json({
    message: "Ronda creada y asignada correctamente",
    data: newPatrol,
  });
};

export const getPatrolsByBranchId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const patrols = await patrolService.getPatrolsByBranchId(parseInt(id));
  return res.status(200).json({
    message: "Rondas obtenidas correctamente",
    data: patrols,
  });
};

export const getAvailablePatrolsByBranchId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const patrols = await patrolService.getAvailablePatrolsByBranchId(
    parseInt(id)
  );
  return res.status(200).json({
    message: "Rondas disponibles obtenidas correctamente",
    data: patrols,
  });
};

export const createPatrolWithRoutePoints = async (
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
  
  const patrolData: CreatePatrolWithRoutePointsDto = req.body;
  const newPatrol = await patrolService.createPatrolWithRoutePoints(patrolData);
  
  return res.status(201).json({
    message: "Ronda creada con puntos de ruta correctamente",
    data: newPatrol,
  });
};
