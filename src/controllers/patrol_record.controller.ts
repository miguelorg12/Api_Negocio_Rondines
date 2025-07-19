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
