import { Request, Response, NextFunction } from "express";

/**
 * Middleware para verificar que el usuario tiene rol Viewer
 * Viewer tiene acceso de solo lectura a la información
 */
export const requireViewer = (
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
  if (userRole !== "Viewer") {
    return res.status(403).json({
      error: "Viewer access required",
      message: "Se requiere acceso de Viewer",
    });
  }

  next();
};

/**
 * Middleware para verificar que el usuario es Viewer o rol superior
 * Permite acceso a Viewer, Guard, BranchAdmin, CompanyAdmin y SuperAdmin
 */
export const requireViewerOrHigher = (
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
  const allowedRoles = [
    "Viewer",
    "Guard",
    "BranchAdmin",
    "CompanyAdmin",
    "SuperAdmin",
  ];

  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      error: "Viewer or higher access required",
      message: "Se requiere acceso de Viewer o superior",
    });
  }

  next();
};
