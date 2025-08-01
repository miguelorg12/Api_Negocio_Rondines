# Debugging del Sistema Biométrico

## Problema Identificado

El sistema biométrico no está enviando correctamente los comandos al Arduino. Según la documentación, el flujo correcto debería ser:

1. Recibir `{ user_id: 123, action: "enroll" }`
2. Convertir `"enroll"` a acción `2` para el Arduino
3. Enviar `2\n` al puerto serie
4. Luego enviar `123\n` (el user_id)

## Correcciones Implementadas

### 1. Mapeo de Acciones

Se agregó un mapeo correcto de acciones:

```typescript
const actionMap: { [key: string]: number } = {
  enroll: 2,
  verify: 1,
  delete: 3,
};
```

### 2. Logging Detallado

Se agregaron console.log para debugging en:

- Controlador: Para ver qué datos llegan
- Servicio: Para ver qué se envía al Arduino
- Listeners: Para ver las respuestas del Arduino

### 3. Endpoint de Prueba

Se creó `/biometric/test-connection` para verificar:

- Puertos disponibles
- Configuración de variables de entorno
- Estado de la conexión

## Pasos para Debugging

### Paso 1: Verificar Configuración

```bash
GET /biometric/test-connection
```

Esto te mostrará:

- Puerto configurado
- Baudrate configurado
- Puertos disponibles en el sistema

### Paso 2: Probar Registro

```bash
POST /biometric/start-registration
Content-Type: application/json

{
  "user_id": 123,
  "action": "enroll"
}
```

### Paso 3: Revisar Logs

En la consola del servidor deberías ver:

```
=== CONTROLLER DEBUG ===
Request body: { user_id: 123, action: 'enroll' }
user_id: 123
action: enroll
========================

=== DEBUG BIOMETRIC ===
Action recibida: enroll
Action mapeada a número: 2
User ID: 123
Enviando al Arduino: 2\n
Luego enviando: 123\n
========================

Enviando acción al Arduino: 2
Enviando user_id al Arduino: 123
```

### Paso 4: Verificar Respuestas del Arduino

Deberías ver en la consola:

```
=== ARDUINO RESPONSE ===
Mensaje recibido: [respuesta del Arduino]
Session ID: session_1234567890_123
=========================
```

## Posibles Problemas

### 1. Puerto Incorrecto

- Verificar que `ARDUINO_PORT` en `.env` apunte al puerto correcto
- Usar el endpoint de test para ver puertos disponibles

### 2. Baudrate Incorrecto

- Verificar que `ARDUINO_BAUDRATE` coincida con el Arduino
- Por defecto es 9600

### 3. Arduino No Responde

- Verificar que el Arduino esté conectado
- Verificar que el código del Arduino esté cargado
- Verificar que el Arduino esté esperando los comandos

### 4. Timing Issues

- Los delays actuales son 3s + 1s
- Si es necesario, ajustar en el servicio

## Variables de Entorno Requeridas

```env
ARDUINO_PORT=COM5
ARDUINO_BAUDRATE=9600
```

## Comandos de Prueba

### Test de Conexión

```bash
curl -X GET http://localhost:3000/biometric/test-connection
```

### Iniciar Registro

```bash
curl -X POST http://localhost:3000/biometric/start-registration \
  -H "Content-Type: application/json" \
  -d '{"user_id": 123, "action": "enroll"}'
```

### Ver Estado de Sesión

```bash
curl -X GET http://localhost:3000/biometric/status/{session_id}
```

## Flujo Correcto Esperado

1. **Frontend envía**: `{ user_id: 123, action: "enroll" }`
2. **Backend mapea**: `"enroll"` → `2`
3. **Backend envía al Arduino**: `2\n`
4. **Backend envía al Arduino**: `123\n`
5. **Arduino responde**: Mensajes de estado
6. **Backend transmite**: Eventos al frontend via SSE

## Logs a Buscar

### Logs Correctos

```
=== CONTROLLER DEBUG ===
Request body: { user_id: 123, action: 'enroll' }
user_id: 123
action: enroll
========================

=== DEBUG BIOMETRIC ===
Action recibida: enroll
Action mapeada a número: 2
User ID: 123
Enviando al Arduino: 2\n
Luego enviando: 123\n
========================

Enviando acción al Arduino: 2
Enviando user_id al Arduino: 123

=== ARDUINO RESPONSE ===
Mensaje recibido: Sensor conectado
Session ID: session_1234567890_123
=========================
```

### Logs de Error Comunes

```
=== ARDUINO ERROR ===
Error en puerto serial: [Error details]
Session ID: session_1234567890_123
=====================
```

## Solución de Problemas

### Si no hay respuesta del Arduino:

1. Verificar puerto con `/test-connection`
2. Verificar que Arduino esté conectado
3. Verificar código del Arduino
4. Verificar baudrate

### Si hay error de puerto:

1. Cambiar `ARDUINO_PORT` en `.env`
2. Reiniciar servidor
3. Probar con `/test-connection`

### Si el mapeo no funciona:

1. Verificar que `action` llegue como string
2. Verificar el mapeo en el servicio
3. Revisar logs del controlador
