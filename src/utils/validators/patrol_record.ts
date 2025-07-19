import { body } from "express-validator";
import { AppDataSource } from "@configs/data-source";
import { Patrol } from "@interfaces/entity/patrol.entity";
import { User } from "@interfaces/entity/user.entity";

export const patrolRecordValidator = [
  body("patrol_id")
    .notEmpty()
    .withMessage("El ID de la patrulla es requerido")
    .isInt()
    .withMessage("El ID de la patrulla debe ser un número entero")
    .bail()
    .custom(async (value) => {
      const patrolRepository = AppDataSource.getRepository(Patrol);
      const patrol = await patrolRepository.findOne({ where: { id: value } });
      if (!patrol) {
        throw new Error("Patrulla no encontrada");
      }
      return true;
    }),

  body("user_id")
    .notEmpty()
    .withMessage("El ID del usuario es requerido")
    .isInt()
    .withMessage("El ID del usuario debe ser un número entero")
    .bail()
    .custom(async (value) => {
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: value } });
      if (!user) {
        throw new Error("Usuario no encontrado");
      }
      return true;
    }),

  body("date")
    .notEmpty()
    .withMessage("La fecha es requerida")
    .isDate()
    .withMessage("La fecha debe ser una fecha válida"),

  body("actual_start")
    .notEmpty()
    .withMessage("La hora de inicio es requerida")
    .isDate()
    .withMessage("La hora de inicio debe ser una fecha válida"),

  body("actual_end")
    .isDate()
    .withMessage("La hora de fin debe ser una fecha válida"),

  body("status")
    .notEmpty()
    .withMessage("El estado es requerido")
    .isIn(["completado", "cancelado", "pendiente", "en_progreso"])
    .withMessage(
      "El estado debe ser uno de los siguientes: completado, cancelado, pendiente, en_progreso"
    ),
];
