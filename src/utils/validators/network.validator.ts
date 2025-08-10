import { body } from "express-validator";
import { AppDataSource } from "@configs/data-source";
import { Branch } from "@interfaces/entity/branch.entity";

export const createNetworkValidator = [
  body("ssid")
    .notEmpty()
    .withMessage("El SSID es obligatorio")
    .isString()
    .withMessage("El SSID debe ser una cadena de texto")
    .isLength({ max: 255 })
    .withMessage("El SSID no puede exceder 255 caracteres"),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isString()
    .withMessage("La contraseña debe ser una cadena de texto")
    .isLength({ max: 255 })
    .withMessage("La contraseña no puede exceder 255 caracteres"),
  body("branch_id")
    .notEmpty()
    .withMessage("El ID de la sucursal es obligatorio")
    .isInt()
    .withMessage("El ID de la sucursal debe ser un número")
    .custom(async (branchId: number) => {
      const branchRepo = AppDataSource.getRepository(Branch);
      const branch = await branchRepo.findOne({ where: { id: branchId } });
      if (!branch) {
        throw new Error("La sucursal especificada no existe");
      }
      return true;
    }),
];

export const updateNetworkValidator = [
  body("ssid")
    .optional()
    .notEmpty()
    .withMessage("El SSID es obligatorio")
    .isString()
    .withMessage("El SSID debe ser una cadena de texto")
    .isLength({ max: 255 })
    .withMessage("El SSID no puede exceder 255 caracteres"),
  body("password")
    .optional()
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isString()
    .withMessage("La contraseña debe ser una cadena de texto")
    .isLength({ max: 255 })
    .withMessage("La contraseña no puede exceder 255 caracteres"),
  body("branch_id")
    .optional()
    .notEmpty()
    .withMessage("El ID de la sucursal es obligatorio")
    .isInt()
    .withMessage("El ID de la sucursal debe ser un número")
    .custom(async (branchId: number) => {
      const branchRepo = AppDataSource.getRepository(Branch);
      const branch = await branchRepo.findOne({ where: { id: branchId } });
      if (!branch) {
        throw new Error("La sucursal especificada no existe");
      }
      return true;
    }),
];
