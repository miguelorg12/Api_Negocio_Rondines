// Middlewares de autenticación base
export {
  authenticateToken,
  requireRole,
  requireBranchAccess,
} from "./auth.middleware";

// Middlewares específicos por rol
export { requireSuperAdmin } from "./super-admin.middleware";
export {
  requireCompanyAdmin,
  requireCompanyAdminOrSuper,
} from "./company-admin.middleware";
export {
  requireBranchAdmin,
  requireBranchAdminOrHigher,
} from "./branch-admin.middleware";
export { requireGuard, requireGuardOrHigher } from "./guard.middleware";
export { requireViewer, requireViewerOrHigher } from "./viewer.middleware";

// Jerarquía de roles (de mayor a menor privilegio)
export const ROLE_HIERARCHY = {
  SuperAdmin: 5,
  CompanyAdmin: 4,
  BranchAdmin: 3,
  Guard: 2,
  Viewer: 1,
} as const;

// Tipos de roles disponibles
export type RoleType = keyof typeof ROLE_HIERARCHY;

/**
 * Middleware genérico para verificar múltiples roles
 * @param roles Array de roles permitidos
 */
export const requireAnyRole = (roles: RoleType[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Autenticación requerida",
      });
    }

    const userRole = req.user.role?.name;
    if (!userRole || !roles.includes(userRole as RoleType)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        message: `Se requiere uno de los siguientes roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Middleware para verificar rol mínimo
 * @param minimumRole Rol mínimo requerido
 */
export const requireMinimumRole = (minimumRole: RoleType) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Autenticación requerida",
      });
    }

    const userRole = req.user.role?.name;
    if (!userRole) {
      return res.status(403).json({
        error: "Role not found",
        message: "Rol no encontrado",
      });
    }

    const userRoleLevel = ROLE_HIERARCHY[userRole as RoleType];
    const minimumRoleLevel = ROLE_HIERARCHY[minimumRole];

    if (!userRoleLevel || userRoleLevel < minimumRoleLevel) {
      return res.status(403).json({
        error: "Insufficient role level",
        message: `Se requiere rol mínimo: ${minimumRole}`,
      });
    }

    next();
  };
};
