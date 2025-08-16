import { Response, Request } from "express";
import { PatrolRecordService } from "@services/patrol_record.service";
import { validationResult } from "express-validator";
import {
  PatrolRecordDto,
  PartialPatrolRecordDto,
} from "@interfaces/dto/patrol_record.dto";

const patroRecordlService = new PatrolRecordService();

export const getAllPatrolRecords = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const patrolRecords = await patroRecordlService.getAll();
  return res.status(200).json({
    message: "Rutas obtenidas correctamente",
    data: patrolRecords,
  });
};

export const createPatrolRecord = async (
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
  const patrolRecordData: PatrolRecordDto = req.body;
  const newPatrolRecord = await patroRecordlService.create(patrolRecordData);
  return res.status(201).json({
    message: "Registro de ruta creado correctamente",
    data: newPatrolRecord,
  });
};

export const getPatrolRecordById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const patrolRecordId = parseInt(req.params.id);
  const patrolRecord = await patroRecordlService.findById(patrolRecordId);
  if (!patrolRecord) {
    return res.status(404).json({ message: "Registro de ruta no encontrado" });
  }
  return res.status(200).json({
    message: "Registro de ruta encontrado",
    data: patrolRecord,
  });
};

export const updatePatrolRecord = async (
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
  const patrolRecordId = parseInt(req.params.id);
  const patrolRecordData: PartialPatrolRecordDto = req.body;
  const updatedPatrolRecord = await patroRecordlService.update(
    patrolRecordId,
    patrolRecordData
  );
  if (!updatedPatrolRecord) {
    return res.status(404).json({ message: "Registro de ruta no encontrado" });
  }
  return res.status(200).json({
    message: "Registro de ruta actualizado correctamente",
    data: updatedPatrolRecord,
  });
};

export const deletePatrolRecord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const patrolRecordId = parseInt(req.params.id);
  const deletedPatrolRecord = await patroRecordlService.delete(patrolRecordId);
  if (!deletedPatrolRecord) {
    return res.status(404).json({ message: "Registro de ruta no encontrado" });
  }
  return res.status(200).json({
    message: "Registro de ruta eliminado correctamente",
    data: deletedPatrolRecord,
  });
};

/**
 * Obtener patrol records completados por user_id
 */
export const getCompletedPatrolRecords = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { user_id } = req.params;

    if (!user_id || isNaN(parseInt(user_id))) {
      return res.status(400).json({
        message: "user_id debe ser un número válido",
      });
    }

    const patrolRecords = await patroRecordlService.getCompletedPatrolRecords(
      parseInt(user_id)
    );

    return res.status(200).json({
      message: "Patrol records completados obtenidos correctamente",
      data: patrolRecords,
    });
  } catch (error) {
    console.error("Error al obtener patrol records completados:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

/**
 * Obtener patrol records pendientes por user_id
 */
export const getPendingPatrolRecords = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { user_id } = req.params;

    if (!user_id || isNaN(parseInt(user_id))) {
      return res.status(400).json({
        message: "user_id debe ser un número válido",
      });
    }

    const patrolRecords = await patroRecordlService.getPendingPatrolRecords(
      parseInt(user_id)
    );

    return res.status(200).json({
      message: "Patrol records pendientes obtenidos correctamente",
      data: patrolRecords,
    });
  } catch (error) {
    console.error("Error al obtener patrol records pendientes:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

/**
 * Obtener patrol records en progreso por user_id
 */
export const getInProgressPatrolRecords = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { user_id } = req.params;

    if (!user_id || isNaN(parseInt(user_id))) {
      return res.status(400).json({
        message: "user_id debe ser un número válido",
      });
    }

    const patrolRecords = await patroRecordlService.getInProgressPatrolRecords(
      parseInt(user_id)
    );

    return res.status(200).json({
      message: "Patrol records en progreso obtenidos correctamente",
      data: patrolRecords,
    });
  } catch (error) {
    console.error("Error al obtener patrol records en progreso:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

/**
 * Obtener la ronda actual del usuario del día de hoy que esté en progreso
 */
export const getCurrentPatrolRecord = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { user_id } = req.params;

    if (!user_id || isNaN(parseInt(user_id))) {
      return res.status(400).json({
        message: "user_id debe ser un número válido",
      });
    }

    const patrolRecord = await patroRecordlService.getCurrentPatrolRecord(
      parseInt(user_id)
    );

    if (!patrolRecord) {
      return res.status(404).json({
        message: "No se encontró una ronda en progreso para el día de hoy",
      });
    }

    return res.status(200).json({
      message: "Ronda actual obtenida correctamente",
      data: patrolRecord,
    });
  } catch (error) {
    console.error("Error al obtener la ronda actual:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

/**
 * Obtener todas las asignaciones del usuario para el día de hoy
 */
export const getUserAssignmentsForToday = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = parseInt(req.params.user_id);

  if (isNaN(userId)) {
    return res.status(400).json({
      message: "user_id debe ser un número válido",
    });
  }

  try {
    const userAssignments =
      await patroRecordlService.getUserAssignmentsForToday(userId);

    return res.status(200).json({
      message: "Asignaciones del usuario obtenidas correctamente",
      data: userAssignments,
    });
  } catch (error) {
    console.error("Error al obtener asignaciones del usuario:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};
