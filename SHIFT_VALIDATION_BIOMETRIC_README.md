# 🖐️ Shift Validation Biométrico - Guía Completa

## 📋 Descripción General

El sistema de **Validación Biométrica de Turnos** permite a los guardias iniciar y terminar sus turnos usando su huella dactilar. Este sistema integra:

- ✅ **Sensores biométricos** (Arduino + sensor de huellas)
- ✅ **Comunicación serial** en tiempo real
- ✅ **Server-Sent Events** para actualizaciones en vivo
- ✅ **Validación de turnos** con lógica de negocio completa

## 🎯 Endpoints Disponibles

### **1. Iniciar Validación Biométrica**
```
POST /api/v1/shift-validation/biometric/start
```

**Request:**
```json
{
  "timestamp": "2025-08-01T14:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Validación biométrica iniciada",
  "session_id": "session_1754097934885_0",
  "stream_url": "/api/v1/shift-validation/biometric/stream/session_1754097934885_0",
  "complete_url": "/api/v1/shift-validation/biometric/complete/session_1754097934885_0",
  "timestamp": "2025-08-01T14:30:00.000Z"
}
```

### **2. Stream de Eventos (SSE)**
```
GET /api/v1/shift-validation/biometric/stream/{sessionId}
```

**Eventos disponibles:**
```json
// Conexión establecida
{
  "type": "connected",
  "message": "Conectado al stream de validación biométrica",
  "status": "connected"
}

// Esperando huella
{
  "type": "waiting_first",
  "message": "Coloque el dedo en el sensor para la primera lectura...",
  "status": "waiting_first"
}

// Primera lectura completada
{
  "type": "first_complete",
  "message": "Primera lectura completada. Retire el dedo del sensor",
  "status": "first_complete"
}

// Esperando segunda huella
{
  "type": "waiting_second",
  "message": "Coloque el mismo dedo nuevamente para confirmar...",
  "status": "waiting_second"
}

// Procesando
{
  "type": "processing",
  "message": "Procesando y guardando huella...",
  "status": "processing"
}

// Éxito
{
  "type": "success",
  "message": "¡Huella registrada exitosamente!",
  "biometric_id": 1001,
  "status": "completed"
}

// Error
{
  "type": "error",
  "message": "Error durante el registro de huella",
  "status": "error"
}
```

### **3. Completar Validación**
```
POST /api/v1/shift-validation/biometric/complete/{sessionId}
```

**Request:**
```json
{
  "biometric_id": 1001,
  "timestamp": "2025-08-01T14:30:00.000Z"
}
```

**Response (Éxito):**
```json
{
  "success": true,
  "message": "Turno iniciado correctamente",
  "status": "en_progreso",
  "patrolRecord": {
    "id": "id_del_record",
    "date": "2025-08-01T00:00:00.000Z",
    "actual_start": "2025-08-01T14:30:00.000Z",
    "status": "en_progreso"
  },
  "shift": {
    "id": "id_del_shift",
    "name": "matutino"
  }
}
```

### **4. Obtener Estado de Sesión**
```
GET /api/v1/shift-validation/biometric/status/{sessionId}
```

**Response:**
```json
{
  "success": true,
  "message": "Estado de sesión obtenido",
  "data": {
    "status": "completed",
    "biometric_id": 1001
  }
}
```

### **5. Cancelar Validación**
```
POST /api/v1/shift-validation/biometric/cancel/{sessionId}
```

**Response:**
```json
{
  "success": true,
  "message": "Validación biométrica cancelada"
}
```

## 🔄 Flujo Completo de Validación

### **Paso 1: Iniciar Sesión**
```bash
curl -X POST http://localhost:3000/api/v1/shift-validation/biometric/start \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-08-01T14:30:00.000Z"
  }'
```

### **Paso 2: Conectar al Stream**
```javascript
// En el frontend
const eventSource = new EventSource('/api/v1/shift-validation/biometric/stream/session_123');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Evento biométrico:', data);
  
  if (data.status === 'completed') {
    // Proceder a completar validación
    completeValidation(data.biometric_id);
  }
};
```

### **Paso 3: Completar Validación**
```bash
curl -X POST http://localhost:3000/api/v1/shift-validation/biometric/complete/session_123 \
  -H "Content-Type: application/json" \
  -d '{
    "biometric_id": 1001,
    "timestamp": "2025-08-01T14:30:00.000Z"
  }'
```

## 🛠️ Configuración del Hardware

### **Requisitos:**
- Arduino con sensor de huellas dactilares
- Cable USB para comunicación serial
- Puerto COM configurado

### **Variables de Entorno:**
```env
ARDUINO_PORT=COM5
ARDUINO_BAUDRATE=9600
```

### **Código Arduino (Ejemplo):**
```cpp
#include <Adafruit_Fingerprint.h>

void setup() {
  Serial.begin(9600);
  // Configuración del sensor
}

void loop() {
  if (Serial.available()) {
    int action = Serial.parseInt();
    int userId = Serial.parseInt();
    
    if (action == 1) { // verify
      verifyFingerprint();
    }
  }
}

void verifyFingerprint() {
  Serial.println("Esperando dedo");
  // Lógica de verificación
  int biometricId = getFingerprintID();
  Serial.println("Huella registrada con ID: " + String(biometricId));
}
```

## 🧪 Casos de Prueba

### **Caso 1: Usuario Válido con Turno Pendiente**
1. Iniciar sesión biométrica
2. Usuario coloca huella
3. Sistema obtiene biometric_id = 1003
4. Validar turno con timestamp correcto
5. **Resultado:** Turno iniciado exitosamente

### **Caso 2: Usuario sin Asignación**
1. Iniciar sesión biométrica
2. Usuario coloca huella
3. Sistema obtiene biometric_id = 9999 (no existe)
4. Validar turno
5. **Resultado:** "Usuario no encontrado"

### **Caso 3: Usuario con Turno Completado**
1. Iniciar sesión biométrica
2. Usuario coloca huella
3. Sistema obtiene biometric_id = 1002
4. Validar turno
5. **Resultado:** "Ya completaste tu turno para hoy"

## 🔧 Troubleshooting

### **Problemas Comunes:**

1. **"Error de conexión con Arduino"**
   - Verificar puerto COM
   - Verificar cable USB
   - Verificar baudrate

2. **"Sesión biométrica no encontrada"**
   - Verificar session_id
   - Verificar que la sesión no haya expirado

3. **"La sesión biométrica aún no está completada"**
   - Esperar a que el usuario complete el proceso
   - Verificar estado en `/status/{sessionId}`

### **Debug:**
```bash
# Verificar conexión Arduino
curl http://localhost:3000/api/v1/biometric/test-connection

# Verificar estado de sesión
curl http://localhost:3000/api/v1/shift-validation/biometric/status/session_123
```

## 📊 Diferencias con Validación Manual

| Aspecto | Validación Manual | Validación Biométrica |
|---------|------------------|----------------------|
| **Seguridad** | Baja (solo número) | Alta (huella física) |
| **Complejidad** | Simple | Compleja (hardware) |
| **Tiempo Real** | No | Sí (SSE) |
| **Pruebas** | Fácil | Requiere hardware |
| **Producción** | No recomendado | Recomendado |

## 🚀 Implementación en Frontend

### **Ejemplo con JavaScript:**
```javascript
class BiometricShiftValidator {
  constructor() {
    this.sessionId = null;
    this.eventSource = null;
  }

  async startValidation(timestamp) {
    const response = await fetch('/api/v1/shift-validation/biometric/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp })
    });
    
    const data = await response.json();
    this.sessionId = data.session_id;
    
    // Conectar al stream
    this.connectToStream();
    
    return data;
  }

  connectToStream() {
    this.eventSource = new EventSource(`/api/v1/shift-validation/biometric/stream/${this.sessionId}`);
    
    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleBiometricEvent(data);
    };
  }

  async handleBiometricEvent(event) {
    if (event.status === 'completed') {
      await this.completeValidation(event.biometric_id);
    }
  }

  async completeValidation(biometricId) {
    const response = await fetch(`/api/v1/shift-validation/biometric/complete/${this.sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        biometric_id: biometricId,
        timestamp: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    this.handleValidationResult(result);
  }

  handleValidationResult(result) {
    if (result.success) {
      console.log('✅ Turno validado:', result.message);
    } else {
      console.log('❌ Error:', result.message);
    }
  }
}

// Uso
const validator = new BiometricShiftValidator();
validator.startValidation('2025-08-01T14:30:00.000Z');
```

## 📝 Notas Importantes

- ⚡ **Tiempo Real:** Los eventos se transmiten en tiempo real via SSE
- 🔒 **Seguridad:** Validación física de huella dactilar
- 🧹 **Limpieza:** Las sesiones se limpian automáticamente
- 📱 **Frontend:** Requiere manejo de eventos en tiempo real
- 🔧 **Hardware:** Depende de Arduino y sensor biométrico

---

**Última actualización:** Agosto 2025
**Versión:** 1.0.0
**Compatibilidad:** Arduino + Sensor de Huellas 