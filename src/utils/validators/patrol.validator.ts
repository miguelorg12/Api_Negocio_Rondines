import { body } from "express-validator";
import { AppDataSource } from "@configs/data-source";
import { Branch } from "@interfaces/entity/branch.entity";

export const createPatrolValidator = [
  body("name")
    .notEmpty()
    .withMessage("El nombre de la ronda es obligatorio")
    .isIn(["ronda_matutina", "ronda_vespertina", "ronda_nocturna"])
    .withMessage("Nombre de ronda inválido"),
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
  body("plan_name")
    .optional()
    .isString()
    .withMessage("El nombre del plano debe ser una cadena de texto"),
];

export const updatePatrolValidator = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("El nombre de la ronda es obligatorio")
    .isIn(["ronda_matutina", "ronda_vespertina", "ronda_nocturna"])
    .withMessage("Nombre de ronda inválido"),
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
  body("plan_name")
    .optional()
    .isString()
    .withMessage("El nombre del plano debe ser una cadena de texto"),
];
