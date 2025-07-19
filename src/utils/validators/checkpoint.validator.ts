import { body } from "express-validator";
import { AppDataSource } from "@configs/data-source";
import { Branch } from "@interfaces/entity/branch.entity";

export const createCheckpointValidator = [
  body("name")
    .notEmpty()
    .withMessage("El nombre del checkpoint es obligatorio"),
  body("branch_id")
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
  body("nfc_uid")
    .optional()
    .isString()
    .withMessage("El UID NFC debe ser una cadena de texto"),
  body("x")
    .notEmpty()
    .withMessage("La coordenada X es obligatoria")
    .isNumeric()
    .withMessage("La coordenada X debe ser un número"),
  body("y")
    .notEmpty()
    .withMessage("La coordenada Y es obligatoria")
    .isNumeric()
    .withMessage("La coordenada Y debe ser un número"),
];

export const updateCheckpointValidator = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("El nombre del checkpoint es obligatorio"),
  body("branch_id")
    .optional()
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
  body("nfc_uid")
    .optional()
    .isString()
    .withMessage("El UID NFC debe ser una cadena de texto"),
  body("x")
    .optional()
    .isNumeric()
    .withMessage("La coordenada X debe ser un número"),
  body("y")
    .optional()
    .isNumeric()
    .withMessage("La coordenada Y debe ser un número"),
];
