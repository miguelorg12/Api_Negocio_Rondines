import { Request, Response, NextFunction } from "express";

/**
 * Middleware para verificar que el usuario tiene rol CompanyAdmin
 * CompanyAdmin tiene acceso a todas las sucursales de su empresa
 */
export const requireCompanyAdmin = (
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
  if (userRole !== "CompanyAdmin") {
    return res.status(403).json({
      error: "CompanyAdmin access required",
      message: "Se requiere acceso de CompanyAdmin",
    });
  }

  next();
};

/**
 * Middleware para verificar que el usuario es CompanyAdmin o SuperAdmin
 * Permite acceso a CompanyAdmin y SuperAdmin
 */
export const requireCompanyAdminOrSuper = (
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
  if (userRole !== "CompanyAdmin" && userRole !== "SuperAdmin") {
    return res.status(403).json({
      error: "CompanyAdmin or SuperAdmin access required",
      message: "Se requiere acceso de CompanyAdmin o SuperAdmin",
    });
  }

  next();
};
