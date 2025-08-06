import { validationResult } from "express-validator";
import { Request, Response } from "express";
import { PatrolAssignmentService } from "@services/patrol_assigment.service";
import {
  PatrolAssignmentDto,
  PartialPatrolAssignmentDto,
  UpdateRouteWithCheckpointsDto,
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

  try {
    const patrolAssignmentData: PatrolAssignmentDto = req.body;
    const newPatrolAssignment = await patrolAssignmentService.create(
      patrolAssignmentData
    );

    return res.status(201).json({
      message: "Asignación de ronda creada correctamente",
      data: newPatrolAssignment,
    });
  } catch (error) {
    console.error("Error al crear asignación de ronda:", error);

    // Manejar el error específico de asignación duplicada
    if (
      error instanceof Error &&
      error.message.includes("ya tiene una asignación")
    ) {
      return res.status(409).json({
        message: "No se puede crear la asignación",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
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

export const updateRouteWithCheckpoints = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Error en la validación de datos",
        errors: errors.array(),
      });
    }

    const assignmentId = parseInt(req.params.id);
    const updateData: UpdateRouteWithCheckpointsDto = req.body;

    // Validar que al menos un campo se esté actualizando
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "Debe proporcionar al menos un campo para actualizar",
      });
    }

    const updatedAssignment =
      await patrolAssignmentService.updateRouteWithCheckpoints(
        assignmentId,
        updateData
      );

    return res.status(200).json({
      message: "Ruta actualizada correctamente",
      data: updatedAssignment,
    });
  } catch (error) {
    console.error("Error al actualizar ruta:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Error al actualizar ruta",
    });
  }
};

export const deleteRouteWithCheckpoints = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const assignmentId = parseInt(req.params.id);

    const deletedAssignment =
      await patrolAssignmentService.deleteRouteWithCheckpoints(assignmentId);

    return res.status(200).json({
      message: "Ruta eliminada correctamente",
      data: deletedAssignment,
    });
  } catch (error) {
    console.error("Error al eliminar ruta:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error al eliminar ruta",
    });
  }
};

export const deletePatrolAssignment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const patrolAssignmentId = parseInt(req.params.id);
  let patrolAssigment = await patrolAssignmentService.getById(
    patrolAssignmentId
  );
  if (!patrolAssigment) {
    return res.status(404).json({
      message: "Asignación de ronda no encontrada",
    });
  }
  patrolAssigment = await patrolAssignmentService.delete(patrolAssignmentId);
  return res.status(200).json({
    message: "Asignación de ronda eliminada correctamente",
    data: patrolAssigment,
  });
};
