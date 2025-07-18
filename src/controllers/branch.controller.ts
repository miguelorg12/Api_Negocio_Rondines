import { BranchService } from "@services/branch.service";
import { Request, Response } from "express";
import { CreateBranchDto, PartialBranchDto } from "@interfaces/dto/branch.dto";
import { validationResult } from "express-validator";
const branchService = new BranchService();

export const getAllBranches = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const branches = await branchService.findAll();
  return res.status(200).json({
    message: "Sucursales obtenidas correctamente",
    branches,
  });
};

export const createBranch = async (
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
  const branchData: CreateBranchDto = req.body;
  const newBranch = await branchService.create(branchData);
  return res
    .status(201)
    .json({ message: "Sucursal creada correctamente", branch: newBranch });
};

export const getBranchById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const branchId = parseInt(req.params.id);
  const branch = await branchService.findById(branchId);
  if (!branch) {
    return res.status(404).json({ message: "Sucursal no encontrada" });
  }
  return res.status(200).json({ message: "Sucursal encontrada", branch });
};

export const updateBranch = async (
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
  const branchId = parseInt(req.params.id);
  const updateData: PartialBranchDto = req.body;
  const branch = await branchService.findById(branchId);
  if (!branch) {
    return res.status(404).json({ message: "Sucursal no encontrada" });
  }
  const updatedBranch = await branchService.update(branchId, updateData);
  return res.status(200).json({
    message: "Sucursal actualizada correctamente",
    branch: updatedBranch,
  });
};

export const deleteBranch = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const branchId = parseInt(req.params.id);
  const branch = await branchService.findById(branchId);
  if (!branch) {
    return res.status(404).json({ message: "Sucursal no encontrada" });
  }
  await branchService.delete(branchId);
  return res
    .status(200)
    .json({ message: "Sucursal eliminada correctamente", branch });
};
