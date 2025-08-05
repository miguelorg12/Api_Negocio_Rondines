import { body } from "express-validator";
import { AppDataSource } from "@configs/data-source";
import { Checkpoint } from "@interfaces/entity/checkpoint.entity";

export const createPatrolWithRoutePointsValidator = [
  // Validaciones del patrol
  body("name")
    .notEmpty()
    .withMessage("El nombre de la ronda es obligatorio")
    .isIn(["ronda_matutina", "ronda_vespertina", "ronda_nocturna"])
    .withMessage("Nombre de ronda inválido"),
  
  body("branch_id")
    .isInt()
    .withMessage("El ID de la sucursal debe ser un número")
    .custom(async (branchId: number) => {
      const branchRepo = AppDataSource.getRepository("branches");
      const branch = await branchRepo.findOne({ where: { id: branchId } });
      if (!branch) {
        throw new Error("La sucursal especificada no existe");
      }
      return true;
    }),

  // Validaciones del array de puntos de ruta
  body("route_points")
    .isArray({ min: 1 })
    .withMessage("Debe proporcionar al menos un punto de ruta"),

  // Validaciones para cada punto del array
  body("route_points.*.latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("La latitud debe ser un número válido entre -90 y 90"),

  body("route_points.*.longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("La longitud debe ser un número válido entre -180 y 180"),

  body("route_points.*.order")
    .isInt({ min: 1 })
    .withMessage("El orden debe ser un número entero mayor a 0"),

  body("route_points.*.checkpoint_id")
    .isInt()
    .withMessage("El ID del checkpoint debe ser un número")
    .custom(async (checkpointId: number) => {
      const checkpointRepo = AppDataSource.getRepository(Checkpoint);
      const checkpoint = await checkpointRepo.findOne({ where: { id: checkpointId } });
      if (!checkpoint) {
        throw new Error("El checkpoint especificado no existe");
      }
      return true;
    }),

  // Validaciones opcionales para datos de Google Maps
  body("route_points.*.google_place_id")
    .optional()
    .isString()
    .withMessage("El Google Place ID debe ser una cadena de texto"),

  body("route_points.*.address")
    .optional()
    .isString()
    .withMessage("La dirección debe ser una cadena de texto"),

  body("route_points.*.formatted_address")
    .optional()
    .isString()
    .withMessage("La dirección formateada debe ser una cadena de texto"),
]; 