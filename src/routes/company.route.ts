import { Router } from "express";
import * as companyController from "../controllers/company.controller";
import {
  createCompanyValidator,
  updateCompanyValidator,
} from "../utils/validators/company.validator";

const router = Router();

router.get("/", companyController.getAllCompanies);
router.post("/", createCompanyValidator, companyController.createCompany);
router.get("/:id", companyController.getCompanyById);
router.put("/:id", updateCompanyValidator, companyController.updateCompany);
router.delete("/:id", companyController.deleteCompany);

export default router;
