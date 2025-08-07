# Funcionalidad de Checkpoint Records

## Descripción

Cuando se crea una `PatrolAssignment` (asignación de patrulla), automáticamente se generan los `CheckpointRecord` correspondientes para todos los checkpoints configurados en esa patrulla.

## Cómo funciona

### 1. **Creación automática de Checkpoint Records**

Cuando se crea una asignación de patrulla:

```typescript
// Ejemplo de creación de PatrolAssignment
POST /api/v1/patrol-assignments
{
  "user_id": 1,
  "patrol_id": 1,
  "shift_id": 1,
  "date": "2024-01-15T00:00:00.000Z"
}
```

**Lo que sucede automáticamente:**

1. Se crea la `PatrolAssignment`
2. Se crea el `PatrolRecord` asociado
3. **Se obtienen todos los `PatrolRoutePoint` de la patrulla ordenados por `order`**
4. **Se calculan las horas de verificación distribuidas uniformemente durante el turno**
5. **Se crean los `CheckpointRecord` para cada checkpoint**

### 2. **Cálculo de horas de verificación**

Las horas se distribuyen uniformemente durante el turno según la configuración del proyecto:

- **Turno matutino**: 07:00 - 17:00 (10 horas)
- **Turno vespertino**: 17:00 - 23:00 (6 horas)  
- **Turno nocturno**: 23:00 - 06:00 (7 horas)

**Ejemplo con 4 checkpoints en turno matutino (07:00-17:00):**
- Checkpoint 1: 09:00
- Checkpoint 2: 11:00
- Checkpoint 3: 13:00
- Checkpoint 4: 15:00

**Ejemplo con 3 checkpoints en turno vespertino (17:00-23:00):**
- Checkpoint 1: 18:30
- Checkpoint 2: 20:00
- Checkpoint 3: 21:30

### 3. **Estructura de datos**

```typescript
// CheckpointRecord generado automáticamente
{
  id: 1,
  patrol_assignment_id: 1,
  checkpoint_id: 1,
  status: "pending", // Estado inicial
  check_time: "2024-01-15T07:30:00.000Z", // Hora programada
  real_check: null, // Se llena cuando el guardia pasa por el checkpoint
  created_at: "2024-01-15T00:00:00.000Z",
  updated_at: "2024-01-15T00:00:00.000Z"
}
```

### 4. **Estados de Checkpoint Record**

- **`pending`**: Pendiente de verificación
- **`completed`**: Verificado correctamente
- **`missed`**: No se verificó en el tiempo
- **`late`**: Verificado pero fuera de tiempo

### 5. **Eliminación automática**

Cuando se elimina una `PatrolAssignment`:
- Se eliminan automáticamente todos los `CheckpointRecord` asociados
- Se eliminan los `PatrolRecord` asociados
- Se hace soft delete de la asignación

## Endpoints disponibles

### Crear Checkpoint Record manualmente
```
POST /api/v1/checkpoint-records
{
  "patrol_assignment_id": 1,
  "checkpoint_id": 1,
  "check_time": "2024-01-15T07:30:00.000Z"
}
```

### Obtener Checkpoint Records
```
GET /api/v1/checkpoint-records
GET /api/v1/checkpoint-records?patrol_assignment_id=1
GET /api/v1/checkpoint-records?status=completed
```

### Actualizar Checkpoint Record
```
PUT /api/v1/checkpoint-records/1
{
  "status": "completed",
  "real_check": "2024-01-15T07:35:00.000Z"
}
```

## Flujo completo

1. **Configurar patrulla con checkpoints** (PatrolRoutePoint)
2. **Crear asignación de patrulla** → Se generan automáticamente los CheckpointRecord
3. **Guardia realiza la ronda** → Se actualizan los CheckpointRecord con real_check
4. **Sistema verifica cumplimiento** → Se actualiza el status según el tiempo

## Ventajas

- ✅ **Automático**: No requiere configuración manual
- ✅ **Flexible**: Se adapta a cualquier número de checkpoints
- ✅ **Trazable**: Registra hora programada vs hora real
- ✅ **Reportable**: Permite generar reportes de eficiencia
- ✅ **Escalable**: Funciona con múltiples turnos y patrullas
