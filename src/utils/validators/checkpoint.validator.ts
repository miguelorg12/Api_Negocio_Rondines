import { body } from "express-validator";
import { AppDataSource } from "@configs/data-source";
import { Branch } from "@entities/branch.entity";

export const CheckpointValidator = [
  body("name")
    .exists()
    .withMessage("El nombre del checkpoint es requerido")
    .bail()
    .isLength({ min: 1, max: 255 })
    .withMessage("El nombre debe tener entre 1 y 255 caracteres"),
  body("branch_id")
    .exists()
    .withMessage("El ID de la sucursal es requerido")
    .bail()
    .isInt()
    .withMessage("El ID de la sucursal debe ser un número entero")
    .custom(async (value) => {
      const branchRepository = AppDataSource.getRepository(Branch);
      const branch = await branchRepository.findOne({ where: { id: value } });
      if (!branch) {
        throw new Error("Sucursal no encontrada");
      }
      return true;
    }),
];

export const CheckpointUpdateValidator = [
  body("name")
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage("El nombre debe tener entre 1 y 255 caracteres"),
  body("branch_id")
    .optional()
    .isInt()
    .withMessage("El ID de la sucursal debe ser un número entero")
    .custom(async (value) => {
      if (value) {
        const branchRepository = AppDataSource.getRepository(Branch);
        const branch = await branchRepository.findOne({ where: { id: value } });
        if (!branch) {
          throw new Error("Sucursal no encontrada");
        }
      }
      return true;
    }),
];
