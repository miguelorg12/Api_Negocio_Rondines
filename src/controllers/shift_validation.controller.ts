import { Request, Response } from "express";
import { ShiftValidationService } from "../services/shift_validation.service";
import { ShiftValidationDto } from "../interfaces/dto/shift_validation.dto";
import { validationResult } from "express-validator";
import { instanceToPlain } from "class-transformer";

const shiftValidationService = new ShiftValidationService();

export const validateShift = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Error en la validación de datos",
      errors: errors.array(),
    });
  }

  const validationData: ShiftValidationDto = {
    biometric: parseInt(req.body.biometric),
    timestamp: new Date(req.body.timestamp),
  };

  const result = await shiftValidationService.validateShift(validationData);

  if (result.success) {
    return res.status(200).json({
      message: result.message,
      data: {
        status: result.status,
        patrolRecord: result.patrolRecord
          ? instanceToPlain(result.patrolRecord)
          : null,
        shift: result.shift ? instanceToPlain(result.shift) : null,
      },
    });
  } else {
    return res.status(400).json({
      message: result.message,
      data: {
        status: result.status,
        patrolRecord: result.patrolRecord
          ? instanceToPlain(result.patrolRecord)
          : null,
        shift: result.shift ? instanceToPlain(result.shift) : null,
      },
    });
  }
};
