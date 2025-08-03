import { Request, Response, NextFunction } from "express";

/**
 * Middleware para verificar que el usuario tiene rol BranchAdmin
 * BranchAdmin tiene acceso solo a su sucursal asignada
 */
export const requireBranchAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Autenticación requerida",
    });
  }

  const userRole = req.user.role?.name;
  if (userRole !== "BranchAdmin") {
    return res.status(403).json({
      error: "BranchAdmin access required",
      message: "Se requiere acceso de BranchAdmin",
    });
  }

  next();
};

/**
 * Middleware para verificar que el usuario es BranchAdmin, CompanyAdmin o SuperAdmin
 * Permite acceso a BranchAdmin, CompanyAdmin y SuperAdmin
 */
export const requireBranchAdminOrHigher = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Autenticación requerida",
    });
  }

  const userRole = req.user.role?.name;
  const allowedRoles = ["BranchAdmin", "CompanyAdmin", "SuperAdmin"];

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      error: "BranchAdmin or higher access required",
      message: "Se requiere acceso de BranchAdmin o superior",
    });
  }

  next();
};
