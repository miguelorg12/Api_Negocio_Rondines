import { body } from "express-validator";
import { AppDataSource } from "@configs/data-source";
import { User } from "@interfaces/entity/user.entity";
import { Patrol } from "@interfaces/entity/patrol.entity";
import { Shift } from "@interfaces/entity/shift.entity";

export const PatrolAssignmentValidator = [
  body("user_id")
    .exists()
    .withMessage("El ID del usuario es requerido")
    .bail()
    .isInt()
    .withMessage("El ID del usuario debe ser un número entero")
    .custom(async (value) => {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: value } });
      if (!user) {
        throw new Error("Usuario no encontrado");
      }
      return true;
    }),
  body("patrol_id")
    .exists()
    .withMessage("El ID de la ronda es requerido")
    .bail()
    .isInt()
    .withMessage("El ID de la ronda debe ser un número entero")
    .custom(async (value) => {
      const patrolRepository = AppDataSource.getRepository(Patrol);
      const patrol = await patrolRepository.findOne({ where: { id: value } });
      if (!patrol) {
        throw new Error("Ronda no encontrada");
      }
      return true;
    }),
  body("shift_id")
    .exists()
    .withMessage("El ID del turno es requerido")
    .bail()
    .isInt()
    .withMessage("El ID del turno debe ser un número entero")
    .custom(async (value) => {
      const shiftRepository = AppDataSource.getRepository(Shift);
      const shift = await shiftRepository.findOne({ where: { id: value } });
      if (!shift) {
        throw new Error("Turno no encontrado");
      }
      return true;
    }),
  body("date")
    .exists()
    .withMessage("La fecha es requerida")
    .bail()
    .isISO8601()
    .withMessage("La fecha debe ser una fecha válida en formato ISO 8601"),
];

export const PatrolAssignmentUpdateValidator = [
  body("user_id")
    .optional()
    .isInt()
    .withMessage("El ID del usuario debe ser un número entero")
    .custom(async (value) => {
      if (value) {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: value } });
        if (!user) {
          throw new Error("Usuario no encontrado");
        }
      }
      return true;
    }),
  body("patrol_id")
    .optional()
    .isInt()
    .withMessage("El ID de la ronda debe ser un número entero")
    .custom(async (value) => {
      if (value) {
        const patrolRepository = AppDataSource.getRepository(Patrol);
        const patrol = await patrolRepository.findOne({
          where: { id: value },
        });
        if (!patrol) {
          throw new Error("Ronda no encontrada");
        }
      }
      return true;
    }),
  body("shift_id")
    .optional()
    .isInt()
    .withMessage("El ID del turno debe ser un número entero")
    .custom(async (value) => {
      if (value) {
        const shiftRepository = AppDataSource.getRepository(Shift);
        const shift = await shiftRepository.findOne({ where: { id: value } });
        if (!shift) {
          throw new Error("Turno no encontrado");
        }
      }
      return true;
    }),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("La fecha debe ser una fecha válida en formato ISO 8601"),
];
