import e, { Request, Response } from "express";
import { UserService } from "../services/user.service";
import {
  CreateUserDto,
  PartialCreateUserDto,
} from "../interfaces/dto/user.dto";
import { validationResult } from "express-validator";
import { instanceToPlain } from "class-transformer";

const userService = new UserService();

export const getAllUsers = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const users = await userService.findAll();
  return res.status(200).json({
    message: "Usuarios obtenidos correctamente",
    data: instanceToPlain(users),
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
  return res.status(201).json({
    message: "Usuario creado correctamente",
    data: instanceToPlain(newUser),
  });
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
  return res
    .status(200)
    .json({ message: "Usuario encontrado", user: instanceToPlain(user) });
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
    data: instanceToPlain(updatedUser),
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

  return res.status(200).json({
    message: "Usuario eliminado correctamente",
    data: instanceToPlain(user),
  });
};

export const saveBiometricId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = parseInt(req.params.id);
  const { biometric } = req.body;

  if (typeof biometric !== "number") {
    return res.status(422).json({
      message: "El ID biométrico debe ser un número",
    });
  }

  const user = await userService.saveBiometricId(userId, biometric);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  return res.status(200).json({
    message: "ID biométrico guardado correctamente",
    data: instanceToPlain(user),
  });
};

export const verifyBiometric = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { biometric } = req.body;

  if (typeof biometric !== "number") {
    return res.status(422).json({
      message: "El ID biométrico debe ser un número",
    });
  }

  const user = await userService.verifyBiometric(biometric);
  if (!user) {
    return res
      .status(404)
      .json({ message: "Usuario no encontrado o ID biométrico incorrecto" });
  }

  return res.status(200).json({
    message: "ID biométrico verificado correctamente",
    data: instanceToPlain(user),
  });
};

export const getUsersBySpecificRoles = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const users = await userService.getUsersBySpecificRoles();

    return res.status(200).json({
      message: "Usuarios obtenidos correctamente",
      data: instanceToPlain(users),
    });
  } catch (error) {
    console.error("Error al obtener usuarios por roles específicos:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};
