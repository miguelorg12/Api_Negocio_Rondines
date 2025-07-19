import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { PlanService } from "@services/plan.service";
import { CreatePlanDto, PartialCreatePlanDto } from "@interfaces/dto/plan.dto";

const planService = new PlanService();

export const getAllPlans = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const plans = await planService.findAll();
  return res.status(200).json({
    message: "Planes obtenidos correctamente",
    data: plans,
  });
};

export const createPlan = async (
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
  const planData: CreatePlanDto = req.body;
  const newPlan = await planService.create(planData);
  return res
    .status(201)
    .json({ message: "Plan creado correctamente", data: newPlan });
};

export const getPlanById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const planId = parseInt(req.params.id);
  const plan = await planService.findById(planId);
  if (!plan) {
    return res.status(404).json({ message: "Plan no encontrado" });
  }
  return res.status(200).json({ message: "Plan encontrado", data: plan });
};

export const updatePlan = async (
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
  const planId = parseInt(req.params.id);
  const planData: PartialCreatePlanDto = req.body;
  const updatedPlan = await planService.update(planId, planData);
  if (!updatedPlan) {
    return res.status(404).json({ message: "Plan no encontrado" });
  }
  return res
    .status(200)
    .json({ message: "Plan actualizado correctamente", data: updatedPlan });
};

export const deletePlan = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const planId = parseInt(req.params.id);
  const deletedPlan = await planService.delete(planId);
  if (!deletedPlan) {
    return res.status(404).json({ message: "Plan no encontrado" });
  }
  return res.status(200).json({
    message: "Plan eliminado correctamente",
    data: deletedPlan,
  });
};
