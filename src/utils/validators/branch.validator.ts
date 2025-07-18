import { body } from "express-validator";
import { AppDataSource } from "@configs/data-source";
import { Branch } from "@interfaces/entity/branch.entity";
import { Company } from "@interfaces/entity/company.entity";
import { User } from "@interfaces/entity/user.entity";

export const createBranchValidator = [
  body("name")
    .notEmpty()
    .withMessage("El nombre de la sucursal es obligatorio")
    .isString()
    .withMessage("El nombre de la sucursal debe ser una cadena de texto"),
  body("address")
    .notEmpty()
    .withMessage("La dirección de la sucursal es obligatoria")
    .isString()
    .withMessage("La dirección de la sucursal debe ser una cadena de texto"),
  body("company_id")
    .notEmpty()
    .withMessage("El ID de la empresa es obligatorio")
    .isInt()
    .withMessage("El ID de la empresa debe ser un número")
    .custom(async (companyId: number) => {
      const companyRepo = AppDataSource.getRepository(Company);
      const company = await companyRepo.findOne({ where: { id: companyId } });
      if (!company) {
        throw new Error("La empresa especificada no existe");
      }
      return true;
    }),
  body("user_id")
    .notEmpty()
    .withMessage("El ID del usuario es obligatorio")
    .isInt()
    .withMessage("El ID del usuario debe ser un número")
    .custom(async (userId: number) => {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error("El usuario especificado no existe");
      }
      return true;
    }),
];

export const updateBranchValidator = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("El nombre de la sucursal es obligatorio")
    .isString()
    .withMessage("El nombre de la sucursal debe ser una cadena de texto"),
  body("address")
    .optional()
    .notEmpty()
    .withMessage("La dirección de la sucursal es obligatoria")
    .isString()
    .withMessage("La dirección de la sucursal debe ser una cadena de texto"),
  body("company_id")
    .optional()
    .notEmpty()
    .withMessage("El ID de la empresa es obligatorio")
    .isInt()
    .withMessage("El ID de la empresa debe ser un número")
    .custom(async (companyId: number) => {
      const companyRepo = AppDataSource.getRepository(Company);
      const company = await companyRepo.findOne({ where: { id: companyId } });
      console.log(company);
      if (!company) {
        throw new Error("La empresa especificada no existe");
      }
      return true;
    }),
  body("user_id")
    .optional()
    .notEmpty()
    .withMessage("El ID del usuario es obligatorio")
    .isInt()
    .withMessage("El ID del usuario debe ser un número")
    .custom(async (userId: number) => {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: userId } });
      console.log(user);
      if (!user) {
        throw new Error("El usuario especificado no existe");
      }
      return true;
    }),
];
