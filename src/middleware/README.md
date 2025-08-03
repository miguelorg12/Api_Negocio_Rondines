# Middlewares de Autenticación y Autorización

Este directorio contiene todos los middlewares relacionados con autenticación y autorización por roles.

## Estructura de Archivos

- `auth.middleware.ts` - Middleware base de autenticación JWT
- `super-admin.middleware.ts` - Middlewares específicos para SuperAdmin
- `company-admin.middleware.ts` - Middlewares específicos para CompanyAdmin
- `branch-admin.middleware.ts` - Middlewares específicos para BranchAdmin
- `guard.middleware.ts` - Middlewares específicos para Guard
- `viewer.middleware.ts` - Middlewares específicos para Viewer
- `role-middleware.ts` - Exportaciones centralizadas y middlewares genéricos

## Jerarquía de Roles

```
SuperAdmin (5) > CompanyAdmin (4) > BranchAdmin (3) > Guard (2) > Viewer (1)
```

## Middlewares Disponibles

### Autenticación Base

- `authenticateToken` - Verifica el token JWT y carga el usuario
- `requireRole(roles)` - Verifica que el usuario tenga uno de los roles especificados
- `requireBranchAccess(branchId)` - Verifica acceso a una sucursal específica

### Middlewares Específicos por Rol

#### SuperAdmin

- `requireSuperAdmin` - Solo SuperAdmin

#### CompanyAdmin

- `requireCompanyAdmin` - Solo CompanyAdmin
- `requireCompanyAdminOrSuper` - CompanyAdmin o SuperAdmin

#### BranchAdmin

- `requireBranchAdmin` - Solo BranchAdmin
- `requireBranchAdminOrHigher` - BranchAdmin, CompanyAdmin o SuperAdmin

#### Guard

- `requireGuard` - Solo Guard
- `requireGuardOrHigher` - Guard, BranchAdmin, CompanyAdmin o SuperAdmin

#### Viewer

- `requireViewer` - Solo Viewer
- `requireViewerOrHigher` - Viewer, Guard, BranchAdmin, CompanyAdmin o SuperAdmin

### Middlewares Genéricos

#### requireAnyRole(roles)

```typescript
// Permite acceso a múltiples roles específicos
requireAnyRole(["Guard", "BranchAdmin"]);
```

#### requireMinimumRole(minimumRole)

```typescript
// Permite acceso a un rol mínimo o superior
requireMinimumRole("BranchAdmin"); // Permite BranchAdmin, CompanyAdmin, SuperAdmin
```

## Uso en Rutas

### Importación

```typescript
import {
  authenticateToken,
  requireSuperAdmin,
  requireCompanyAdminOrSuper,
  requireGuardOrHigher,
  requireAnyRole,
  requireMinimumRole,
} from "@middleware/role-middleware";
```

### Ejemplos de Uso

#### Ruta solo para SuperAdmin

```typescript
router.get(
  "/admin-only",
  authenticateToken,
  requireSuperAdmin,
  controllerFunction
);
```

#### Ruta para CompanyAdmin o SuperAdmin

```typescript
router.post(
  "/company-management",
  authenticateToken,
  requireCompanyAdminOrSuper,
  controllerFunction
);
```

#### Ruta para Guard o superior

```typescript
router.get(
  "/patrol-records",
  authenticateToken,
  requireGuardOrHigher,
  controllerFunction
);
```

#### Ruta con múltiples roles específicos

```typescript
router.put(
  "/update-settings",
  authenticateToken,
  requireAnyRole(["BranchAdmin", "CompanyAdmin"]),
  controllerFunction
);
```

#### Ruta con rol mínimo

```typescript
router.delete(
  "/delete-company",
  authenticateToken,
  requireMinimumRole("CompanyAdmin"),
  controllerFunction
);
```

## Orden de Aplicación

1. **Siempre aplicar `authenticateToken` primero** - Verifica el token y carga el usuario
2. **Luego aplicar el middleware de autorización** - Verifica permisos según el rol

```typescript
router.get(
  "/example",
  authenticateToken, // 1. Autenticar
  requireGuardOrHigher, // 2. Autorizar
  controllerFunction // 3. Ejecutar controlador
);
```

## Respuestas de Error

### 401 - No autenticado

```json
{
  "error": "Authentication required",
  "message": "Autenticación requerida"
}
```

### 403 - Sin permisos

```json
{
  "error": "Guard or higher access required",
  "message": "Se requiere acceso de Guard o superior"
}
```

## Consideraciones de Seguridad

1. **Siempre usar `authenticateToken`** antes de cualquier middleware de autorización
2. **Verificar permisos en el controlador** para operaciones críticas
3. **Usar el middleware más restrictivo** posible para cada ruta
4. **Considerar el contexto** de la operación (sucursal, empresa, etc.)
5. **Validar datos de entrada** independientemente de la autorización
