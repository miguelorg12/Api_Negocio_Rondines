# 🔧 Detección Dinámica de Puertos COM - API Biométrica

## 📋 Resumen de Cambios

Se ha implementado la funcionalidad para que la API biométrica detecte dinámicamente cualquier puerto COM disponible, en lugar de usar solo el puerto COM5 hardcodeado. Esto resuelve el problema de "Access denied" y permite que la API funcione con cualquier puerto COM disponible.

## 🚀 Nuevas Funcionalidades

### 1. Detección Automática de Puertos COM
- **Método**: `startRegistration()` en `BiometricService`
- **Funcionalidad**: Detecta automáticamente todos los puertos COM disponibles
- **Selección**: Usa el primer puerto disponible o un puerto preferido si está configurado en variables de entorno
- **Compatibilidad**: Funciona en Windows (COM), Linux (tty) y macOS (tty)

### 2. Listado de Puertos Disponibles
- **Endpoint**: `GET /api/v1/biometric/debug/ports`
- **Funcionalidad**: Lista todos los puertos COM disponibles con información detallada
- **Información**: Incluye fabricante, número de serie, ID Plug & Play, etc.

### 3. Información del Puerto Actual
- **Endpoint**: `GET /api/v1/biometric/debug/port-info/{sessionId}`
- **Funcionalidad**: Obtiene información del puerto que está usando una sesión específica
- **Estado**: Muestra si el puerto está abierto o cerrado

### 4. Limpieza Automática de Sesiones
- **Funcionalidad**: Las sesiones se limpian automáticamente después de completarse o en caso de error
- **Triggers**: 
  - Huella registrada exitosamente (3 segundos)
  - Huella validada exitosamente (3 segundos)
  - Error en el proceso (3 segundos)
  - Arduino listo para siguiente comando (1 segundo)
  - Error de puerto serial (2 segundos)

### 5. Limpieza Forzada de Sesiones
- **Endpoint**: `POST /api/v1/biometric/debug/force-cleanup`
- **Funcionalidad**: Fuerza la limpieza de todas las sesiones activas
- **Uso**: Útil para debugging y recuperación de puertos bloqueados

## 🔧 Implementación Técnica

### Servicio (`BiometricService`)

#### Método `startRegistration()`
```typescript
// Detectar puertos COM disponibles dinámicamente
const availablePorts = await SerialPort.list();
const comPorts = availablePorts.filter(port => 
  port.path.toLowerCase().includes('com') || 
  port.path.toLowerCase().includes('tty')
);

// Seleccionar puerto preferido o primer disponible
const preferredPort = process.env.ARDUINO_PORT;
let selectedPort = comPorts[0];

if (preferredPort) {
  const preferred = comPorts.find(p => p.path.toLowerCase() === preferredPort.toLowerCase());
  if (preferred) {
    selectedPort = preferred;
  }
}
```

#### Método `listAvailablePorts()`
```typescript
async listAvailablePorts(): Promise<Array<{
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  pnpId?: string;
  locationId?: string;
  productId?: string;
  vendorId?: string;
}>> {
  const availablePorts = await SerialPort.list();
  const comPorts = availablePorts.filter(port => 
    port.path.toLowerCase().includes('com') || 
    port.path.toLowerCase().includes('tty')
  );
  return comPorts.map(port => ({ /* mapeo de propiedades */ }));
}
```

#### Método `cleanupSession()`
```typescript
cleanupSession(sessionId: string): void {
  // Cerrar puerto serial de forma segura
  if (session.port && session.port.isOpen) {
    session.port.close((err) => {
      if (err) console.error("Error cerrando puerto serial:", err);
      else console.log("Puerto serial cerrado correctamente");
    });
  }
  
  // Cerrar conexiones SSE y limpiar sesión
  // ... implementación completa
}
```

### Controladores

#### `listAvailablePorts`
```typescript
export const listAvailablePorts = async (req: Request, res: Response) => {
  const ports = await biometricService.listAvailablePorts();
  return res.status(200).json({
    message: "Puertos COM disponibles obtenidos",
    data: { total_ports: ports.length, ports, timestamp: new Date().toISOString() }
  });
};
```

#### `forceCleanupAllSessions`
```typescript
export const forceCleanupAllSessions = async (req: Request, res: Response) => {
  biometricService.forceCleanupAllSessions();
  return res.status(200).json({
    message: "Limpieza forzada de todas las sesiones completada",
    data: { active_sessions_after: biometricService.getActiveSessionsCount() }
  });
};
```

### Rutas

#### Nuevas Rutas de Debug
```typescript
// Listar puertos disponibles
router.get("/debug/ports", listAvailablePorts);

// Información del puerto de una sesión
router.get("/debug/port-info/:sessionId", getCurrentPortInfo);

// Limpieza forzada de sesiones
router.post("/debug/force-cleanup", forceCleanupAllSessions);
```

## 📊 Endpoints Disponibles

### Debug y Monitoreo
- `GET /api/v1/biometric/debug/ports` - Listar puertos COM disponibles
- `GET /api/v1/biometric/debug/port-info/{sessionId}` - Info del puerto de una sesión
- `GET /api/v1/biometric/debug/sessions` - Listar sesiones activas
- `POST /api/v1/biometric/debug/force-cleanup` - Limpiar todas las sesiones

### Operaciones Biométricas
- `POST /api/v1/biometric/start-registration` - Iniciar registro/validación
- `GET /api/v1/biometric/stream/{sessionId}` - Stream de eventos SSE
- `GET /api/v1/biometric/status/{sessionId}` - Estado de la sesión
- `POST /api/v1/biometric/complete/{sessionId}` - Completar registro
- `POST /api/v1/biometric/cancel/{sessionId}` - Cancelar sesión

## 🔍 Variables de Entorno

### Configuración de Puerto
```bash
# Puerto preferido (opcional)
ARDUINO_PORT=COM5

# Velocidad de baudios (opcional, default: 9600)
ARDUINO_BAUDRATE=9600
```

### Comportamiento
- Si `ARDUINO_PORT` está configurado y disponible, se usa ese puerto
- Si no está configurado o no está disponible, se usa el primer puerto COM disponible
- La API siempre detecta dinámicamente los puertos disponibles

## 🚨 Solución al Problema Original

### Problema Identificado
- **Error**: `[Error: Opening COM5: Access denied]`
- **Causa**: Puertos seriales bloqueados por sesiones no cerradas correctamente
- **Síntoma**: API "ciclada" e incapaz de procesar nuevas peticiones

### Solución Implementada
1. **Detección Dinámica**: La API detecta automáticamente puertos disponibles
2. **Limpieza Automática**: Las sesiones se limpian automáticamente al completarse
3. **Manejo de Errores**: Limpieza automática en caso de errores de puerto
4. **Recuperación Manual**: Endpoint para limpieza forzada de todas las sesiones

## 🧪 Testing

### Verificar Puertos Disponibles
```bash
curl -X GET "http://localhost:3000/api/v1/biometric/debug/ports"
```

### Verificar Sesiones Activas
```bash
curl -X GET "http://localhost:3000/api/v1/biometric/debug/sessions"
```

### Limpieza Forzada
```bash
curl -X POST "http://localhost:3000/api/v1/biometric/debug/force-cleanup"
```

### Iniciar Registro Biométrico
```bash
curl -X POST "http://localhost:3000/api/v1/biometric/start-registration" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 123, "action": "enroll"}'
```

## 📝 Logs de Debug

La implementación incluye logs detallados para debugging:

```
=== DETECTANDO PUERTOS COM DISPONIBLES ===
Puertos disponibles: [Array]
Puertos COM/TTY filtrados: [Array]
Puerto seleccionado: COM5
==========================================

=== AUTO CLEANUP ===
Limpiando sesión automáticamente: session_1234567890_123
=====================

=== CLEANUP SESSION ===
Session ID: session_1234567890_123
Active sessions before cleanup: 1
Puerto serial cerrado correctamente
Sesión eliminada del mapa
Active sessions after cleanup: 0
=======================
```

## 🔮 Beneficios de la Implementación

1. **Flexibilidad**: Funciona con cualquier puerto COM disponible
2. **Robustez**: Manejo automático de limpieza de sesiones
3. **Debugging**: Endpoints y logs detallados para troubleshooting
4. **Recuperación**: Mecanismos automáticos y manuales de recuperación
5. **Compatibilidad**: Funciona en Windows, Linux y macOS
6. **Configurabilidad**: Soporte para puertos preferidos via variables de entorno

## ⚠️ Consideraciones

1. **Permisos**: Asegúrate de que la aplicación tenga permisos para acceder a puertos seriales
2. **Drivers**: Verifica que los drivers del Arduino estén instalados correctamente
3. **Puertos Múltiples**: Si tienes múltiples dispositivos Arduino, la API seleccionará el primero disponible
4. **Variables de Entorno**: Configura `ARDUINO_PORT` si quieres usar un puerto específico

## 🎯 Próximos Pasos

1. **Testing**: Probar con diferentes puertos COM
2. **Monitoreo**: Verificar que las sesiones se limpien automáticamente
3. **Performance**: Monitorear el rendimiento con múltiples dispositivos
4. **Documentación**: Actualizar la documentación de la API
