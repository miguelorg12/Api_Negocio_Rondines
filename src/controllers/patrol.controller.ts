import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { PatrolService } from "@services/patrol.service";
import {
  PatrolDto,
  PartialPatrolDto,
  PatrolAssigmentDto,
  PatrolWithPlanImageDto,
} from "@interfaces/dto/patrol.dto";

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

export const createPatrolWithPlanImage = async (
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

    const file = req.file as Express.Multer.File;
    const { name, frequency, branch_id, plan_name, active } = req.body;

    // Validar campos requeridos
    if (!name || !frequency || !branch_id) {
      return res.status(400).json({
        error: "name, frequency y branch_id son requeridos",
      });
    }

    // Validar archivo si se proporcionó
    if (file) {
      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          error: "Solo se permiten archivos de imagen",
        });
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return res.status(400).json({
          error: "El archivo es demasiado grande. Máximo 5MB",
        });
      }

      if (!plan_name) {
        return res.status(400).json({
          error: "plan_name es requerido cuando se sube una imagen",
        });
      }
    }

    const patrolData: PatrolWithPlanImageDto = {
      name,
      frequency,
      branch_id: parseInt(branch_id),
      active: active === "true",
      plan_name,
    };

    const newPatrol = await patrolService.createWithPlanImage(patrolData, file);

    return res.status(201).json({
      message: "Ronda creada correctamente con plano",
      data: newPatrol,
    });
  } catch (error) {
    console.error("Error al crear patrol con imagen:", error);
    return res.status(500).json({ error: "Error al crear patrol con imagen" });
  }
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
  return res.status(200).json({ message: "Ronda encontrada", data: patrol });
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
    data: updatedPatrol,
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
    message: "Ronda y asignación creadas correctamente",
    data: newPatrol,
  });
};

export const getPatrolsByBranchId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const branch_id = req.params.id;
  const patrols = await patrolService.getPatrolsByBranchId(parseInt(branch_id));
  return res.status(200).json({
    message: "Rondas obtenidas correctamente",
    data: patrols,
  });
};

export const deletePlan = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { planId } = req.params;
    await patrolService.deletePlan(parseInt(planId));

    return res.status(200).json({
      message: "Plan eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar plan:", error);
    return res.status(500).json({ error: "Error al eliminar plan" });
  }
};
