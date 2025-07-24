import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import {
  CreateUserDto,
  PartialCreateUserDto,
} from "../interfaces/dto/user.dto";
import { validationResult } from "express-validator";

const userService = new UserService();

export const getAllUsers = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const users = await userService.findAll();
  return res.status(200).json({
    message: "Usuarios obtenidos correctamente",
    data: users,
  });
};

export const createUser = async (
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
  const userData: CreateUserDto = req.body;
  const newUser = await userService.create(userData);
  return res
    .status(201)
    .json({ message: "Usuario creado correctamente", data: newUser });
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = parseInt(req.params.id);
  const user = await userService.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  return res.status(200).json({ message: "Usuario encontrado", user });
};

export const updateUser = async (
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
  const userId = parseInt(req.params.id);
  const userData: PartialCreateUserDto = req.body;

  const user = await userService.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  const updatedUser = await userService.update(userId, userData);

  return res.status(200).json({
    message: "Usuario actualizado correctamente",
    data: updatedUser,
  });
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = parseInt(req.params.id);
  let user = await userService.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  user = await userService.delete(userId);

  return res
    .status(200)
    .json({ message: "Usuario eliminado correctamente", data: user });
};

export const getAllGuards = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const guards = await userService.findAllGuards();
  return res.status(200).json({
    message: "Guardias obtenidos correctamente",
    data: guards,
  });
};
export const getGuardById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const guardId = parseInt(req.params.id);
  const guard = await userService.findGuardById(guardId);
  if (!guard) {
    return res.status(404).json({ message: "Guardia no encontrado" });
  }
  return res.status(200).json({ message: "Guardia encontrado", guard });
};
