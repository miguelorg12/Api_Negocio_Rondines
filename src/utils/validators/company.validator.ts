import { body } from "express-validator";
import { AppDataSource } from "@configs/data-source";
import { Company } from "@interfaces/entity/company.entity";

export const createCompanyValidator = [
  body("name")
    .notEmpty()
    .withMessage("El nombre de la empresa es obligatorio")
    .isLength({ max: 255 })
    .withMessage("El nombre no puede exceder los 255 caracteres"),
  body("email")
    .isEmail()
    .withMessage("Email inválido")
    .custom(async (email: string) => {
      const companyRepo = AppDataSource.getRepository(Company);
      const company = await companyRepo.findOne({ where: { email } });
      if (company) {
        throw new Error("El email ya está en uso");
      }
      return true;
    }),
  body("phone")
    .notEmpty()
    .withMessage("El teléfono es obligatorio")
    .isLength({ max: 10 })
    .withMessage("El teléfono no puede exceder los 10 caracteres"),
  body("address")
    .notEmpty()
    .withMessage("La dirección es obligatoria")
    .isLength({ max: 255 })
    .withMessage("La dirección no puede exceder los 255 caracteres"),
];

export const updateCompanyValidator = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("El nombre de la empresa es obligatorio")
    .isLength({ max: 255 })
    .withMessage("El nombre no puede exceder los 255 caracteres"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email inválido")
    .custom(async (email: string, { req }) => {
      const companyRepo = AppDataSource.getRepository(Company);
      const company = await companyRepo.findOne({
        where: { email },
      });
      if (company) {
        throw new Error("El email ya está en uso");
      }
      return true;
    }),
  body("phone")
    .optional()
    .isLength({ max: 10 })
    .withMessage("El teléfono no puede exceder los 10 caracteres"),
];
