import { Request, Response, NextFunction } from "express";

/**
 * Middleware para verificar que el usuario tiene rol SuperAdmin
 * SuperAdmin tiene acceso completo a todo el sistema
 */
export const requireSuperAdmin = (
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
  if (userRole !== "SuperAdmin") {
    return res.status(403).json({
      error: "SuperAdmin access required",
      message: "Se requiere acceso de SuperAdmin",
    });
  }

  next();
};
