import { validationResult } from "express-validator";
import { Request, Response } from "express";
import { PatrolAssignmentService } from "@services/patrol_assigment.service";
import {
  PatrolAssignmentDto,
  PartialPatrolAssignmentDto,
} from "@interfaces/dto/patrol_assigment.dto";

const patrolAssignmentService = new PatrolAssignmentService();

export const createPatrolAssignment = async (
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

  const patrolAssignmentData: PatrolAssignmentDto = req.body;
  const newPatrolAssignment = await patrolAssignmentService.create(
    patrolAssignmentData
  );

  return res.status(201).json({
    message: "Asignación de ronda creada correctamente",
    data: newPatrolAssignment,
  });
};

export const getAllPatrolAssignments = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const patrolAssignments = await patrolAssignmentService.getAll();
  return res.status(200).json({
    message: "Asignaciones de rondas obtenidas correctamente",
    data: patrolAssignments,
  });
};

export const getPatrolAssignmentById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const patrolAssignmentId = parseInt(req.params.id);
  const patrolAssignment = await patrolAssignmentService.getById(
    patrolAssignmentId
  );

  if (!patrolAssignment) {
    return res
      .status(404)
      .json({ message: "Asignación de ronda no encontrada" });
  }

  return res.status(200).json({
    message: "Asignación de ronda encontrada",
    data: patrolAssignment,
  });
};

export const updatePatrolAssignment = async (
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
  const patrolAssignmentId = parseInt(req.params.id);
  const patrolAssignmentData: PartialPatrolAssignmentDto = req.body;
  const patrolAssigment = await patrolAssignmentService.getById(
    patrolAssignmentId
  );
  if (!patrolAssigment) {
    return res.status(404).json({
      message: "Asignación de ronda no encontrada",
    });
  }
  const updatedPatrolAssignment = await patrolAssignmentService.update(
    patrolAssignmentId,
    patrolAssignmentData
  );
  return res.status(200).json({
    message: "Asignación de ronda actualizada correctamente",
    data: updatedPatrolAssignment,
  });
};

export const deletePatrolAssignment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const patrolAssignmentId = parseInt(req.params.id);
  const patrolAssigment = await patrolAssignmentService.getById(
    patrolAssignmentId
  );
  if (!patrolAssigment) {
    return res.status(404).json({
      message: "Asignación de ronda no encontrada",
    });
  }
  await patrolAssignmentService.delete(patrolAssignmentId);
  return res.status(200).json({
    message: "Asignación de ronda eliminada correctamente",
    data: patrolAssigment,
  });
};
