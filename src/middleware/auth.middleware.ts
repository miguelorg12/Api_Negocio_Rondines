import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "@configs/data-source";
import { User } from "@interfaces/entity/user.entity";

const JWT_SECRET = process.env.JWT_SECRET;

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: "Access token required",
        message: "Debe proporcionar un token de acceso",
      });
    }

    if (!JWT_SECRET) {
      return res.status(500).json({
        error: "JWT secret not configured",
        message: "Error de configuración del servidor",
      });
    }

    // Verificar el token JWT
    const decoded: any = jwt.verify(token, JWT_SECRET);

    // Buscar el usuario en la base de datos
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.sub },
      relations: ["role", "branch", "branches"],
      select: {
        id: true,
        name: true,
        last_name: true,
        curp: true,
        email: true,
        active: true,
        biometric: true,
        created_at: true,
        updated_at: true,
        role: {
          id: true,
          name: true,
        },
        branch: {
          id: true,
          name: true,
        },
        branches: {
          id: true,
          name: true,
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "User not found",
        message: "Usuario no encontrado",
      });
    }

    if (!user.active) {
      return res.status(401).json({
        error: "User inactive",
        message: "Usuario inactivo",
      });
    }

    // Agregar el usuario al request
    req.user = {
      ...user,
      ownedBranches: user.branch,
      assignedBranches: user.branches,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: "Token expired",
        message: "Token expirado",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: "Invalid token",
        message: "Token inválido",
      });
    }

    return res.status(500).json({
      error: "Authentication error",
      message: "Error de autenticación",
    });
  }
};

// Middleware opcional para roles específicos
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Autenticación requerida",
      });
    }

    const userRole = req.user.role?.name;
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        message: "Permisos insuficientes",
      });
    }

    next();
  };
};

// Middleware para verificar si el usuario tiene acceso a una sucursal específica
export const requireBranchAccess = (branchId: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Autenticación requerida",
      });
    }

    const userBranches = [
      ...(req.user.ownedBranches ? [req.user.ownedBranches] : []),
      ...(req.user.assignedBranches || []),
    ];

    const hasAccess = userBranches.some((branch) => branch.id === branchId);

    if (!hasAccess) {
      return res.status(403).json({
        error: "Branch access denied",
        message: "Sin acceso a esta sucursal",
      });
    }

    next();
  };
};
