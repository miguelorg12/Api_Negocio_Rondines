import { Response, Request } from "express";
import { validationResult } from "express-validator";
import { RoleService } from "../services/role.service";
import { CreateRoleDto } from "@interfaces/dto/role.dto";
const roleService = new RoleService();

export const getAllRoles = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const roles = await roleService.findAll();
  return res.status(200).json({
    message: "Roles obtenidos correctamente",
    data: roles,
  });
};

export const createRole = async (
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
  const roleData: CreateRoleDto = req.body;
  const newRole = await roleService.create(roleData);
  return res
    .status(201)
    .json({ message: "Rol creado correctamente", data: newRole });
};

export const getRoleById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const roleId = parseInt(req.params.id);
  const role = await roleService.findById(roleId);
  if (!role) {
    return res.status(404).json({ message: "Rol no encontrado" });
  }
  return res.status(200).json({ message: "Rol encontrado", data: role });
};

export const updateRole = async (
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
  const roleId = parseInt(req.params.id);
  const roleData: CreateRoleDto = req.body;
  let role = await roleService.findById(roleId);
  if (!role) {
    return res.status(404).json({ message: "Rol no encontrado" });
  }
  role = await roleService.update(roleId, roleData);

  return res.status(200).json({
    message: "Rol actualizado correctamente",
    data: role,
  });
};

export const deleteRole = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const roleId = parseInt(req.params.id);
  let role = await roleService.findById(roleId);
  if (!role) {
    return res.status(404).json({ message: "Rol no encontrado" });
  }
  role = await roleService.delete(roleId);

  return res.status(200).json({
    message: "Rol eliminado correctamente",
    data: role,
  });
};
