# 🕐 Shift Validation Service - Guía de Testing

## 📋 Descripción General

El servicio de **Shift Validation** permite a los guardias iniciar y terminar sus turnos usando su ID biométrico. El servicio valida:

- ✅ Si el usuario existe y tiene asignación para la fecha
- ✅ Si puede iniciar/terminar según el estado actual del turno
- ✅ Si está dentro del horario permitido del shift

## 🎯 Endpoint

```
POST /api/v1/shift-validation
```

## 📝 Request Body

```json
{
  "biometric": 1001,
  "timestamp": "2025-08-01T14:30:00.000Z"
}
```

### Parámetros:

- **biometric**: ID biométrico del usuario (número)
- **timestamp**: Fecha y hora del intento (ISO string)

## 🗄️ Datos de Prueba Disponibles

### 👥 Usuarios con Biometric

| Usuario | Biometric | Nombre            | Estado                    |
| ------- | --------- | ----------------- | ------------------------- |
| 1001    | 1001      | Juan Pérez        | En progreso (hoy)         |
| 1002    | 1002      | María García      | Completado (hoy)          |
| 1003    | 1003      | Carlos López      | Pendiente (hoy)           |
| 1004    | 1004      | Ana Martínez      | Sin asignación (hoy)      |
| 1005    | 1005      | Roberto Hernández | Completado (ayer)         |
| 1006    | 1006      | Laura Rodríguez   | Pendiente (mañana)        |
| 1007    | 1007      | Miguel Sánchez    | Pendiente (mañana)        |
| 1008    | 1008      | Patricia Flores   | Pendiente (pasado mañana) |

### ⏰ Shifts Disponibles

| Shift      | Horario       | Descripción        |
| ---------- | ------------- | ------------------ |
| matutino   | 00:00 - 08:00 | Turno de madrugada |
| vespertino | 08:00 - 16:00 | Turno de día       |
| nocturno   | 16:00 - 00:00 | Turno de noche     |

### 📅 Fechas de Asignación

- **Hoy**: 1 de Agosto 2025
- **Mañana**: 2 de Agosto 2025
- **Ayer**: 31 de Julio 2025
- **Pasado mañana**: 3 de Agosto 2025

## 🧪 Casos de Prueba

### 1️⃣ **Usuario 1001 (Juan) - Turno Matutino en Progreso**

**Request:**

```json
POST /api/v1/shift-validation
{
  "biometric": 1001,
  "timestamp": "2025-08-01T14:30:00.000Z"
}
```

**Respuesta Esperada:**

```json
{
  "success": true,
  "message": "Turno finalizado correctamente",
  "status": "completado",
  "patrolRecord": {
    "id": "id_del_record",
    "date": "2025-08-01T00:00:00.000Z",
    "actual_start": "2025-08-01T06:00:00.000Z",
    "actual_end": "2025-08-01T14:30:00.000Z",
    "status": "completado"
  },
  "shift": {
    "id": "id_del_shift",
    "name": "matutino"
  }
}
```

**Explicación:** Ya tiene un record "en_progreso" para hoy, y 14:30 está después del horario de fin del turno matutino (08:00), por lo que puede terminar.

---

### 2️⃣ **Usuario 1002 (María) - Turno Vespertino Completado**

**Request:**

```json
POST /api/v1/shift-validation
{
  "biometric": 1002,
  "timestamp": "2025-08-01T14:30:00.000Z"
}
```

**Respuesta Esperada:**

```json
{
  "success": false,
  "message": "Ya completaste tu turno para hoy",
  "status": "completado",
  "patrolRecord": {
    "id": "id_del_record",
    "date": "2025-08-01T00:00:00.000Z",
    "actual_start": "2025-08-01T14:00:00.000Z",
    "actual_end": "2025-08-01T22:00:00.000Z",
    "status": "completado"
  },
  "shift": {
    "id": "id_del_shift",
    "name": "vespertino"
  }
}
```

**Explicación:** Ya tiene un record "completado" para hoy, no puede hacer nada más.

---

### 3️⃣ **Usuario 1003 (Carlos) - Turno Nocturno Pendiente**

**Request:**

```json
POST /api/v1/shift-validation
{
  "biometric": 1003,
  "timestamp": "2025-08-01T22:30:00.000Z"
}
```

**Respuesta Esperada:**

```json
{
  "success": true,
  "message": "Turno iniciado correctamente",
  "status": "en_progreso",
  "patrolRecord": {
    "id": "id_del_record",
    "date": "2025-08-01T00:00:00.000Z",
    "actual_start": "2025-08-01T22:30:00.000Z",
    "status": "en_progreso"
  },
  "shift": {
    "id": "id_del_shift",
    "name": "nocturno"
  }
}
```

**Explicación:** Tiene un record "pendiente" para hoy, y 22:30 está dentro del horario del turno nocturno (16:00-00:00), por lo que puede iniciar.

---

### 4️⃣ **Usuario 1004 (Ana) - Sin Asignación para Hoy**

**Request:**

```json
POST /api/v1/shift-validation
{
  "biometric": 1004,
  "timestamp": "2025-08-01T14:30:00.000Z"
}
```

**Respuesta Esperada:**

```json
{
  "success": false,
  "message": "No tienes asignado un turno para hoy",
  "data": {
    "patrolRecord": null,
    "shift": null
  }
}
```

**Explicación:** No tiene asignación para la fecha del timestamp (hoy).

---

### 5️⃣ **Usuario 1005 (Roberto) - Turno Completado Ayer**

**Request:**

```json
POST /api/v1/shift-validation
{
  "biometric": 1005,
  "timestamp": "2025-07-31T14:30:00.000Z"
}
```

**Respuesta Esperada:**

```json
{
  "success": false,
  "message": "Ya completaste tu turno para hoy",
  "status": "completado",
  "patrolRecord": {
    "id": "id_del_record",
    "date": "2025-07-31T00:00:00.000Z",
    "actual_start": "2025-07-31T08:00:00.000Z",
    "actual_end": "2025-07-31T16:00:00.000Z",
    "status": "completado"
  },
  "shift": {
    "id": "id_del_shift",
    "name": "vespertino"
  }
}
```

**Explicación:** Su asignación es para ayer y ya está completada.

---

### 6️⃣ **Usuario 1006 (Laura) - Turno para Mañana**

**Request:**

```json
POST /api/v1/shift-validation
{
  "biometric": 1006,
  "timestamp": "2025-08-02T14:30:00.000Z"
}
```

**Respuesta Esperada:**

```json
{
  "success": true,
  "message": "Turno iniciado correctamente",
  "status": "en_progreso",
  "patrolRecord": {
    "id": "id_del_record",
    "date": "2025-08-02T00:00:00.000Z",
    "actual_start": "2025-08-02T14:30:00.000Z",
    "status": "en_progreso"
  },
  "shift": {
    "id": "id_del_shift",
    "name": "matutino"
  }
}
```

**Explicación:** Tiene asignación para mañana con record "pendiente", puede iniciar.

---

### 7️⃣ **Usuario 1007 (Miguel) - Turno para Mañana**

**Request:**

```json
POST /api/v1/shift-validation
{
  "biometric": 1007,
  "timestamp": "2025-08-02T14:30:00.000Z"
}
```

**Respuesta Esperada:**

```json
{
  "success": true,
  "message": "Turno iniciado correctamente",
  "status": "en_progreso",
  "patrolRecord": {
    "id": "id_del_record",
    "date": "2025-08-02T00:00:00.000Z",
    "actual_start": "2025-08-02T14:30:00.000Z",
    "status": "en_progreso"
  },
  "shift": {
    "id": "id_del_shift",
    "name": "vespertino"
  }
}
```

**Explicación:** Tiene asignación para mañana con record "pendiente", puede iniciar.

---

### 8️⃣ **Usuario 1008 (Patricia) - Turno para Pasado Mañana**

**Request:**

```json
POST /api/v1/shift-validation
{
  "biometric": 1008,
  "timestamp": "2025-08-03T14:30:00.000Z"
}
```

**Respuesta Esperada:**

```json
{
  "success": true,
  "message": "Turno iniciado correctamente",
  "status": "en_progreso",
  "patrolRecord": {
    "id": "id_del_record",
    "date": "2025-08-03T00:00:00.000Z",
    "actual_start": "2025-08-03T14:30:00.000Z",
    "status": "en_progreso"
  },
  "shift": {
    "id": "id_del_shift",
    "name": "matutino"
  }
}
```

**Explicación:** Tiene asignación para pasado mañana con record "pendiente", puede iniciar.

## 🔄 Estados de Patrol Records

### Estados Posibles:

- **pendiente**: Puede iniciar si está dentro del horario del shift
- **en_progreso**: Puede terminar si está después del horario de fin
- **completado**: No puede hacer nada más

### Lógica de Validación:

1. **Sin record existente:**

   - ✅ Puede iniciar si está dentro del horario del shift
   - ❌ No puede iniciar si es muy temprano

2. **Record "pendiente":**

   - ✅ Puede iniciar si está dentro del horario del shift
   - ❌ No puede iniciar si es muy temprano

3. **Record "en_progreso":**

   - ✅ Puede terminar si está después del horario de fin
   - ❌ No puede terminar si aún no es hora

4. **Record "completado":**
   - ❌ No puede hacer nada más

## 🚀 Cómo Ejecutar las Pruebas

### 1. Preparar el entorno:

```bash
# Ejecutar seeders para crear datos de prueba
npm run seed

# Iniciar el servidor
npm run dev
```

### 2. Usar Postman o curl:

```bash
# Ejemplo con curl
curl -X POST http://localhost:3000/api/v1/shift-validation \
  -H "Content-Type: application/json" \
  -d '{
    "biometric": 1001,
    "timestamp": "2025-08-01T14:30:00.000Z"
  }'
```

### 3. Verificar respuestas:

- ✅ **success: true** = Operación exitosa
- ❌ **success: false** = Error o restricción

## 📊 Resumen de Casos de Prueba

| Usuario         | Biometric | Fecha         | Estado Inicial | Acción   | Resultado Esperado |
| --------------- | --------- | ------------- | -------------- | -------- | ------------------ |
| 1001 (Juan)     | 1001      | Hoy           | En progreso    | Terminar | ✅ Éxito           |
| 1002 (María)    | 1002      | Hoy           | Completado     | Ninguna  | ❌ Error           |
| 1003 (Carlos)   | 1003      | Hoy           | Pendiente      | Iniciar  | ✅ Éxito           |
| 1004 (Ana)      | 1004      | Hoy           | Sin asignación | Ninguna  | ❌ Error           |
| 1005 (Roberto)  | 1005      | Ayer          | Completado     | Ninguna  | ❌ Error           |
| 1006 (Laura)    | 1006      | Mañana        | Pendiente      | Iniciar  | ✅ Éxito           |
| 1007 (Miguel)   | 1007      | Mañana        | Pendiente      | Iniciar  | ✅ Éxito           |
| 1008 (Patricia) | 1008      | Pasado mañana | Pendiente      | Iniciar  | ✅ Éxito           |

## 🔧 Troubleshooting

### Problemas Comunes:

1. **"No tienes asignado un turno para hoy"**

   - Verificar que la fecha del timestamp coincida con la asignación
   - Verificar que el usuario tenga biometric correcto

2. **"Aún no es hora de iniciar el turno"**

   - Verificar que el timestamp esté dentro del horario del shift
   - Los horarios están en UTC

3. **"Tu turno está en progreso"**

   - El turno ya está iniciado, esperar hasta el horario de fin

4. **"Ya completaste tu turno para hoy"**
   - El turno ya está completado, no puede hacer más acciones

### Debug:

```bash
# Verificar datos en la base de datos
npm run debug:shift-data
```

## 📝 Notas Importantes

- ⏰ **Horarios en UTC**: Todos los horarios se manejan en UTC
- 📅 **Fechas dinámicas**: Los seeders crean fechas basadas en la fecha actual
- 🔄 **Estados**: Los records pueden cambiar de "pendiente" → "en_progreso" → "completado"
- ✅ **Validaciones**: El servicio valida usuario, asignación, horario y estado

---

**Última actualización:** Agosto 2025
**Versión del servicio:** 1.0.0
