# Sistema de Registro Biométrico

Este sistema permite registrar huellas dactilares de usuarios en tiempo real usando un dispositivo Arduino con sensor biométrico.

## Características

- **Comunicación en tiempo real** con dispositivo Arduino
- **Server-Sent Events (SSE)** para transmisión de eventos
- **Gestión de sesiones** para múltiples registros simultáneos
- **Integración con base de datos** para guardar IDs biométricos
- **Interfaz web de ejemplo** para pruebas

## Configuración

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# Configuración del Arduino
ARDUINO_PORT=COM5          # Puerto serial del Arduino (Windows: COM5, Linux: /dev/ttyUSB0)
ARDUINO_BAUDRATE=9600      # Velocidad de comunicación
```

### 2. Instalación de Dependencias

```bash
npm install
```

### 3. Hardware Requerido

- Arduino con sensor biométrico (ej: R307, GT-511C3)
- Cable USB para conexión serial

## Endpoints Disponibles

### 1. Iniciar Registro Biométrico

```http
POST /api/v1/biometric/start-registration
Content-Type: application/json

{
  "user_id": 123,
  "action": "enroll"
}
```

**Respuesta:**

```json
{
  "message": "Registro biométrico iniciado",
  "session_id": "session_1703123456789_123"
}
```

### 2. Stream de Eventos (SSE)

```http
GET /api/v1/biometric/stream/{sessionId}
```

**Eventos recibidos:**

```json
{
  "type": "waiting_first",
  "message": "Coloque el dedo en el sensor para la primera lectura...",
  "status": "waiting_first"
}
```

### 3. Obtener Estado de Sesión

```http
GET /api/v1/biometric/status/{sessionId}
```

**Respuesta:**

```json
{
  "message": "Estado de sesión obtenido",
  "data": {
    "status": "completed",
    "biometric_id": 42
  }
}
```

### 4. Completar Registro

```http
POST /api/v1/biometric/complete/{sessionId}
Content-Type: application/json

{
  "biometric_id": 42
}
```

### 5. Cancelar Registro

```http
POST /api/v1/biometric/cancel/{sessionId}
```

## Flujo de Registro

1. **Iniciar**: Llama a `start-registration` con el ID del usuario
2. **Conectar**: El sistema se conecta al Arduino
3. **Primera lectura**: Usuario coloca el dedo en el sensor
4. **Retirar**: Usuario retira el dedo del sensor
5. **Segunda lectura**: Usuario coloca el mismo dedo nuevamente
6. **Confirmación**: El Arduino confirma el registro exitoso
7. **Completar**: Llama a `complete` para guardar en la base de datos

## Uso desde Frontend

### JavaScript/HTML

```javascript
// 1. Iniciar registro
const response = await fetch('/api/v1/biometric/start-registration', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id: 123 })
});

const { session_id } = await response.json();

// 2. Conectar al stream de eventos
const eventSource = new EventSource(`/api/v1/biometric/stream/${session_id}`);

eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Evento:', data);

  if (data.type === 'success') {
    // Completar registro
    await fetch(`/api/v1/biometric/complete/${session_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ biometric_id: data.biometric_id })
    });
  }
};
```

### React

```jsx
import { useState, useEffect } from "react";

function BiometricRegistration({ userId }) {
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState("");
  const [events, setEvents] = useState([]);

  const startRegistration = async () => {
    const response = await fetch("/api/v1/biometric/start-registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });

    const { session_id } = await response.json();
    setSessionId(session_id);

    // Conectar al stream
    const eventSource = new EventSource(
      `/api/v1/biometric/stream/${session_id}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEvents((prev) => [...prev, data]);
      setStatus(data.message);

      if (data.type === "success") {
        completeRegistration(data.biometric_id);
      }
    };
  };

  return (
    <div>
      <button onClick={startRegistration}>Iniciar Registro</button>
      <div>Estado: {status}</div>
      <div>
        {events.map((event, index) => (
          <div key={index} className={`event ${event.type}`}>
            {event.message}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Código Arduino

El Arduino debe enviar estos mensajes al puerto serial:

```cpp
void setup() {
  Serial.begin(9600);
  // Inicializar sensor biométrico
}

void loop() {
  // Leer comandos del serial
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');

    if (command == "enroll") {
      Serial.println("Sensor conectado");
      Serial.println("Esperando dedo");
      // Proceso de registro...
      Serial.println("Retira el dedo");
      Serial.println("Coloca el mismo dedo");
      Serial.println("Huella guardada exitosamente");
      Serial.println("Huella registrada con ID:42");
    }
  }
}
```

## Manejo de Errores

- **Dispositivo no conectado**: Verifica el puerto serial
- **Error de comunicación**: Revisa la velocidad de baudios
- **Sesión no encontrada**: La sesión expiró o fue cancelada
- **Usuario no encontrado**: Verifica que el ID de usuario existe

## Seguridad

- Las sesiones se limpian automáticamente al completar o cancelar
- Los IDs biométricos se almacenan de forma segura en la base de datos
- Validación de usuarios antes de iniciar registro

## Pruebas

1. Abre `biometric-example.html` en tu navegador
2. Ingresa un ID de usuario válido
3. Conecta el Arduino al puerto configurado
4. Sigue las instrucciones en pantalla

## Notas Importantes

- Asegúrate de que el Arduino esté conectado antes de iniciar el registro
- El puerto serial puede variar según el sistema operativo
- En Linux, puede necesitar permisos para acceder al puerto serial
- El sistema maneja múltiples sesiones simultáneas
