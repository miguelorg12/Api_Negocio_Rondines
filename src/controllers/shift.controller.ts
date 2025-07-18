import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { ShiftService } from "@services/shift.service";
import { ShiftDto } from "@interfaces/dto/shift.dto";

const shiftService = new ShiftService();

export const getAllShifts = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const shifts = await shiftService.getAll();
  return res.status(200).json({
    message: "Turnos obtenidos correctamente",
    shifts,
  });
};

export const createShift = async (
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
  const shiftData: ShiftDto = req.body;
  const newShift = await shiftService.create(shiftData);
  return res
    .status(201)
    .json({ message: "Turno creado correctamente", shift: newShift });
};

export const getShiftById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const shiftId = parseInt(req.params.id);
  const shift = await shiftService.getById(shiftId);
  if (!shift) {
    return res.status(404).json({ message: "Turno no encontrado" });
  }
  return res.status(200).json({ message: "Turno encontrado", shift });
};

export const updateShift = async (
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
  const shiftId = parseInt(req.params.id);
  const shiftData: ShiftDto = req.body;
  const shift = await shiftService.getById(shiftId);
  if (!shift) {
    return res.status(404).json({ message: "Turno no encontrado" });
  }
  const updatedShift = await shiftService.update(shiftId, shiftData);
  return res.status(200).json({
    message: "Turno actualizado correctamente",
    shift: updatedShift,
  });
};

export const deleteShift = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const shiftId = parseInt(req.params.id);
  let shift = await shiftService.getById(shiftId);
  if (!shift) {
    return res.status(404).json({ message: "Turno no encontrado" });
  }
  shift = await shiftService.delete(shiftId);
  return res
    .status(200)
    .json({ message: "Turno eliminado correctamente", shift });
};
