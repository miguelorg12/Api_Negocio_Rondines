import { body } from "express-validator";
import { AppDataSource } from "@configs/data-source";
import { User } from "@interfaces/entity/user.entity";
import { Role } from "@interfaces/entity/role.entity";
import { Branch } from "@interfaces/entity/branch.entity";

export const createUserValidator = [
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  body("last_name").notEmpty().withMessage("El apellido es obligatorio"),
  body("curp")
    .isLength({ min: 18, max: 18 })
    .withMessage("La CURP debe tener 18 caracteres")
    .custom((curp: string) => {
      // CURP regex: 4 letras, 6 dígitos fecha, 1 letra sexo, 2 letras estado, 3 letras internas, 1 dígito verificador
      const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{2}[A-Z]{3}[0-9A-Z]\d$/;
      if (!curpRegex.test(curp)) {
        throw new Error("La CURP no es válida");
      }
      return true;
    }),
  body("email")
    .isEmail()
    .withMessage("Email inválido")
    .custom(async (email: string) => {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { email } });
      if (user) {
        throw new Error("El email ya está en uso");
      }
      return true;
    }),
  body("password")
    .isLength({ min: 8, max: 255 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .custom((password: string) => {
      const regex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/;
      if (!regex.test(password)) {
        throw new Error(
          "La contraseña debe contener al menos una letra mayúscula, un número y un caracter especial"
        );
      }
      return true;
    }),
  body("role_id")
    .isInt()
    .withMessage("El rol debe ser un número")
    .custom(async (roleId: number) => {
      const roleRepo = AppDataSource.getRepository(Role);
      const role = await roleRepo.findOne({ where: { id: roleId } });
      if (!role) {
        throw new Error("El rol especificado no existe");
      }
      return true;
    }),
  body("biometric")
    .optional()
    .isNumeric()
    .withMessage("El dato biométrico debe ser un número"),
  body("branch_id")
    .isInt()
    .withMessage("La sucursal debe ser un número")
    .custom(async (branchId: number) => {
      const branchRepo = AppDataSource.getRepository(Branch);
      const branch = await branchRepo.findOne({ where: { id: branchId } });
      if (!branch) {
        throw new Error("La sucursal especificada no existe");
      }
      return true;
    }),
];

export const updateUserValidator = [
  body("name").optional().notEmpty().withMessage("El nombre es obligatorio"),
  body("last_name")
    .optional()
    .notEmpty()
    .withMessage("El apellido es obligatorio"),
  body("curp")
    .optional()
    .isLength({ min: 18, max: 18 })
    .withMessage("La CURP debe tener 18 caracteres")
    .custom((curp: string) => {
      // CURP regex: 4 letras, 6 dígitos fecha, 1 letra sexo, 2 letras estado, 3 letras internas, 1 dígito verificador
      const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{2}[A-Z]{3}[0-9A-Z]\d$/;
      if (!curpRegex.test(curp)) {
        throw new Error("La CURP no es válida");
      }
      return true;
    }),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email inválido")
    .custom(async (email: string, { req }) => {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { email } });
      const userId = req?.params?.id ? Number(req.params.id) : undefined;

      if (user && user.id !== userId) {
        throw new Error("El email ya está en uso");
      }
      return true;
    }),
  body("password")
    .optional()
    .isLength({ min: 8, max: 255 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .custom((password: string) => {
      if (password) {
        const regex =
          /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/;
        if (!regex.test(password)) {
          throw new Error(
            "La contraseña debe contener al menos una letra mayúscula, un número y un caracter especial"
          );
        }
      }
      return true;
    }),
  body("role_id")
    .optional()
    .isInt()
    .withMessage("El rol debe ser un número")
    .custom(async (roleId: number) => {
      if (roleId) {
        const roleRepo = AppDataSource.getRepository(Role);
        const role = await roleRepo.findOne({ where: { id: roleId } });
        if (!role) {
          throw new Error("El rol especificado no existe");
        }
      }
      return true;
    }),
  body("active")
    .optional()
    .isBoolean()
    .withMessage("El estado activo debe ser un booleano"),
  body("biometric")
    .optional()
    .isNumeric()
    .withMessage("El dato biométrico debe ser un número"),
  body("branch_id")
    .optional()
    .isInt()
    .withMessage("La sucursal debe ser un número")
    .custom(async (branchId: number) => {
      const branchRepo = AppDataSource.getRepository(Branch);
      const branch = await branchRepo.findOne({ where: { id: branchId } });
      if (!branch) {
        throw new Error("La sucursal especificada no existe");
      }
      return true;
    }),
];
