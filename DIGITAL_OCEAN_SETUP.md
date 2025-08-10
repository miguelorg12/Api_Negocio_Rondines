## Rutas Disponibles

### 1. Listar archivos de configuración ESP32

```
GET /api/digitalocean/esp32-config
```

**Respuesta:**

```json
{
  "success": true,
  "data": ["sketch_aug9a.ino.merged.bin", "otro_archivo.bin"]
}
```

### 2. Obtener información de un archivo específico

```
GET /api/digitalocean/esp32-config/:filename
```

**Ejemplo:** `GET /api/digitalocean/esp32-config/sketch_aug9a.ino.merged.bin`

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "filename": "sketch_aug9a.ino.merged.bin",
    "filePath": "ESP32CONF/sketch_aug9a.ino.merged.bin",
    "signedUrl": "https://bucket.nyc3.digitaloceanspaces.com/ESP32CONF/sketch_aug9a.ino.merged.bin?X-Amz-Algorithm=...",
    "expiresIn": 3600
  }
}
```

### 3. Descargar archivo (redirección)

```
GET /api/digitalocean/esp32-config/:filename/download
```

**Ejemplo:** `GET /api/digitalocean/esp32-config/sketch_aug9a.ino.merged.bin/download`

**Respuesta:** Redirección directa al archivo para descarga.

### 4. Obtener contenido del archivo directamente ⭐ NUEVO

```
GET /api/digitalocean/esp32-config/:filename/content
```

**Ejemplo:** `GET /api/digitalocean/esp32-config/sketch_aug9a.ino.merged.bin/content`

**Respuesta:** El contenido binario del archivo directamente en el body de la respuesta HTTP.

**Headers de respuesta:**

```
Content-Type: application/octet-stream
Content-Disposition: inline; filename="sketch_aug9a.ino.merged.bin"
Content-Length: [tamaño_del_archivo]
```

**Uso:** Esta ruta es ideal para que el frontend pueda cargar directamente el archivo al ESP32 sin necesidad de descargarlo primero.

## Ejemplos de Uso en el Frontend

### JavaScript/TypeScript

#### 1. Listar archivos disponibles

```typescript
const listFiles = async () => {
  try {
    const response = await fetch("/api/digitalocean/esp32-config");
    const result = await response.json();

    if (result.success) {
      console.log("Archivos disponibles:", result.data);
    }
  } catch (error) {
    console.error("Error al listar archivos:", error);
  }
};
```

#### 2. Obtener información de un archivo

```typescript
const getFileInfo = async (filename: string) => {
  try {
    const response = await fetch(`/api/digitalocean/esp32-config/${filename}`);
    const result = await response.json();

    if (result.success) {
      console.log("URL firmada:", result.data.signedUrl);
      console.log("Expira en:", result.data.expiresIn, "segundos");
    }
  } catch (error) {
    console.error("Error al obtener información del archivo:", error);
  }
};
```

#### 3. Descargar archivo (redirección)

```typescript
const downloadFile = (filename: string) => {
  // Redirige directamente al archivo para descarga
  window.location.href = `/api/digitalocean/esp32-config/${filename}/download`;
};
```

#### 4. Obtener contenido del archivo directamente ⭐ NUEVO

```typescript
const getFileContent = async (filename: string) => {
  try {
    const response = await fetch(
      `/api/digitalocean/esp32-config/${filename}/content`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Obtener el contenido como ArrayBuffer (ideal para archivos binarios)
    const arrayBuffer = await response.arrayBuffer();

    // Convertir a Uint8Array para manipulación
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log("Tamaño del archivo:", uint8Array.length, "bytes");

    // Aquí puedes usar uint8Array directamente para cargar al ESP32
    // Por ejemplo, enviarlo por Web Serial API o Web Bluetooth

    return uint8Array;
  } catch (error) {
    console.error("Error al obtener contenido del archivo:", error);
  }
};

// Ejemplo de uso con ESP32 Web Serial API
const uploadToESP32 = async (filename: string) => {
  try {
    // Obtener el contenido del archivo
    const fileContent = await getFileContent(filename);

    if (!fileContent) {
      throw new Error("No se pudo obtener el contenido del archivo");
    }

    // Conectar al ESP32 por Web Serial
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });

    const writer = port.writable.getWriter();

    // Enviar el contenido del archivo al ESP32
    await writer.write(fileContent);

    console.log("Archivo enviado exitosamente al ESP32");

    writer.releaseLock();
    await port.close();
  } catch (error) {
    console.error("Error al cargar archivo al ESP32:", error);
  }
};
```

### cURL

#### 1. Listar archivos

```bash
curl -X GET "http://localhost:3000/api/digitalocean/esp32-config"
```

#### 2. Obtener información de archivo

```bash
curl -X GET "http://localhost:3000/api/digitalocean/esp32-config/sketch_aug9a.ino.merged.bin"
```

#### 3. Descargar archivo

```bash
curl -L "http://localhost:3000/api/digitalocean/esp32-config/sketch_aug9a.ino.merged.bin/download" -o archivo_descargado.bin
```

#### 4. Obtener contenido directamente ⭐ NUEVO

```bash
curl -X GET "http://localhost:3000/api/digitalocean/esp32-config/sketch_aug9a.ino.merged.bin/content" -o archivo_contenido.bin
```
