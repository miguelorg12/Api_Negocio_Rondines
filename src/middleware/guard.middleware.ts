import { Request, Response, NextFunction } from "express";

/**
 * Middleware para verificar que el usuario tiene rol Guard
 * Guard tiene acceso limitado a funcionalidades específicas
 */
export const requireGuard = (
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
  if (userRole !== "Guard") {
    return res.status(403).json({
      error: "Guard access required",
      message: "Se requiere acceso de Guard",
    });
  }

  next();
};

/**
 * Middleware para verificar que el usuario es Guard o rol superior
 * Permite acceso a Guard, BranchAdmin, CompanyAdmin y SuperAdmin
 */
export const requireGuardOrHigher = (
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
  const allowedRoles = ["Guard", "BranchAdmin", "CompanyAdmin", "SuperAdmin"];

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      error: "Guard or higher access required",
      message: "Se requiere acceso de Guard o superior",
    });
  }

  next();
};
