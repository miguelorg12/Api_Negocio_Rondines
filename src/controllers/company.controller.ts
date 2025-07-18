import { CompanyService } from "@services/company.service";
import { Request, Response } from "express";
import {
  CreateCompanyDto,
  PartialCompanyDto,
} from "@interfaces/dto/company.dto";
import { validationResult } from "express-validator";

const companyService = new CompanyService();

export const getAllCompanies = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const companies = await companyService.findAll();
  return res.status(200).json({
    message: "Empresas obtenidas correctamente",
    companies,
  });
};

export const createCompany = async (
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
  const companyData: CreateCompanyDto = req.body;
  const newCompany = await companyService.create(companyData);
  return res
    .status(201)
    .json({ message: "Empresa creada correctamente", company: newCompany });
};

export const getCompanyById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const companyId = parseInt(req.params.id);
  const company = await companyService.findById(companyId);
  if (!company) {
    return res.status(404).json({ message: "Empresa no encontrada" });
  }
  return res.status(200).json({ message: "Empresa encontrada", company });
};

export const updateCompany = async (
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
  const companyId = parseInt(req.params.id);
  const updateData: PartialCompanyDto = req.body;
  const company = await companyService.findById(companyId);
  if (!company) {
    return res.status(404).json({ message: "Empresa no encontrada" });
  }
  const updatedCompany = await companyService.update(companyId, updateData);
  return res.status(200).json({
    message: "Empresa actualizada correctamente",
    company: updatedCompany,
  });
};

export const deleteCompany = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const companyId = parseInt(req.params.id);
  const company = await companyService.findById(companyId);
  if (!company) {
    return res.status(404).json({ message: "Empresa no encontrada" });
  }
  await companyService.delete(companyId);
  return res
    .status(200)
    .json({ message: "Empresa eliminada correctamente", company });
};
