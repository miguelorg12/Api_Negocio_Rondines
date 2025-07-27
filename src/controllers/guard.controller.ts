import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { GuardService } from "@services/guard.service";
import {
  CreateGuardDto,
  PartialCreateGuardDto,
} from "@interfaces/dto/guard.dto";
import { instanceToPlain } from "class-transformer";

const guardService = new GuardService();

export const getAllGuards = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const guards = await guardService.findAll();
  return res.status(200).json({
    message: "Guardias obtenidos correctamente",
    data: instanceToPlain(guards),
  });
};

export const getGuardById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const guardId = parseInt(req.params.id);
  const guard = await guardService.findById(guardId);
  if (!guard) {
    return res.status(404).json({ message: "Guardia no encontrado" });
  }
  return res
    .status(200)
    .json({ message: "Guardia encontrado", guard: instanceToPlain(guard) });
};

export const createGuard = async (
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
  const guardData: CreateGuardDto = req.body;
  const newGuard = await guardService.create(guardData);
  return res.status(201).json({
    message: "Guardia creado correctamente",
    data: instanceToPlain(newGuard),
  });
};

export const updateGuard = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const guardId = parseInt(req.params.id);
  const guard = await guardService.findById(guardId);
  if (!guard) {
    return res.status(404).json({ message: "Guardia no encontrado" });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Error en la validación de datos",
      errors: errors.array(),
    });
  }
  const guardData: PartialCreateGuardDto = req.body;
  const updatedGuard = await guardService.update(guardId, guardData);

  return res.status(200).json({
    message: "Guardia actualizado correctamente",
    data: instanceToPlain(updatedGuard),
  });
};

export const deleteGuard = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const guardId = parseInt(req.params.id);
  const guard = await guardService.findById(guardId);
  if (!guard) {
    return res.status(404).json({ message: "Guardia no encontrado" });
  }
  const deletedGuard = await guardService.delete(guardId);
  return res.status(200).json({
    message: "Guardia eliminado correctamente",
    data: instanceToPlain(deletedGuard),
  });
};

export const getGuardsByBranch = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const branchId = parseInt(req.params.branchId);
  const guards = await guardService.findByBranch(branchId);
  return res.status(200).json({
    message: "Guardias obtenidos correctamente por sucursal",
    data: instanceToPlain(guards),
  });
};
