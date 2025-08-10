import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";

interface BiometricSession {
  port: SerialPort;
  parser: ReadlineParser;
  user_id: number;
  clients: any[];
  status: "connecting" | "waiting" | "processing" | "completed" | "error";
  biometric_id?: number;
}

export class BiometricService {
  private activeSessions: Map<string, BiometricSession> = new Map();

  async startRegistration(
    user_id: number,
    action: string = "enroll"
  ): Promise<{ session_id: string }> {
    const sessionId = `session_${Date.now()}_${user_id}`;

    console.log("=== START REGISTRATION DEBUG ===");
    console.log("Creating session with ID:", sessionId);
    console.log("User ID:", user_id);
    console.log("Action:", action);
    console.log("Active sessions before:", this.activeSessions.size);
    console.log("=================================");

    try {
      console.log("=== DETECTANDO PUERTOS COM DISPONIBLES ===");
      const availablePorts = await SerialPort.list();
      console.log(
        "Puertos disponibles:",
        availablePorts.map((p) => ({
          path: p.path,
          manufacturer: p.manufacturer,
          vendorId: p.vendorId,
          productId: p.productId,
          pnpId: p.pnpId,
          friendlyName: (p as any).friendlyName,
        }))
      );

      // Elegir mejor puerto: preferir ARDUINO_PORT, luego CH340 (VID 1A86, PID 7523), evitar Bluetooth
      const selectedPort = await this.findBestArduinoPort(availablePorts);
      console.log("Puerto seleccionado:", selectedPort.path);
      console.log("Información del puerto:", {
        manufacturer: selectedPort.manufacturer,
        vendorId: selectedPort.vendorId,
        productId: selectedPort.productId,
        pnpId: selectedPort.pnpId,
      });
      console.log("==========================================");

      // Crear conexión con Arduino usando el puerto detectado
      const port = new SerialPort({
        path: selectedPort.path,
        baudRate: parseInt(process.env.ARDUINO_BAUDRATE || "9600"),
      });

      const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

      // Almacenar sesión
      this.activeSessions.set(sessionId, {
        port,
        parser,
        user_id,
        clients: [],
        status: "connecting",
      });

      console.log("Session stored successfully");
      console.log("Active sessions after:", this.activeSessions.size);
      console.log("Session IDs:", Array.from(this.activeSessions.keys()));

      // Configurar listeners del Arduino
      this.setupArduinoListeners(sessionId, port, parser);

      // Mapear acción a número para Arduino
      const actionMap: { [key: string]: number } = {
        enroll: 2,
        verify: 1,
        delete: 3,
      };

      const actionNumber = actionMap[action] || 2; // Default a enroll si no se encuentra

      console.log("=== DEBUG BIOMETRIC ===");
      console.log("Action recibida:", action);
      console.log("Action mapeada a número:", actionNumber);
      console.log("User ID:", user_id);
      console.log("Puerto usado:", selectedPort.path);
      console.log("Enviando al Arduino:", `${actionNumber}\\n`);
      console.log("Luego enviando:", `${user_id}\\n`);
      console.log("========================");

      // Enviar acción al Arduino
      setTimeout(() => {
        console.log("Enviando acción al Arduino:", actionNumber);
        port.write(Buffer.from(actionNumber.toString() + "\n", "utf-8"));

        setTimeout(() => {
          console.log("Enviando user_id al Arduino:", user_id);
          port.write(Buffer.from(user_id.toString() + "\n", "utf-8"));
        }, 1000);
      }, 3000);

      console.log("=== SESSION READY ===");
      console.log("Session ID ready for SSE:", sessionId);
      console.log("Session exists:", this.activeSessions.has(sessionId));
      console.log("=====================");

      return { session_id: sessionId };
    } catch (error) {
      console.error("Error en startRegistration:", error);
      throw new Error(`Error iniciando comunicación con Arduino: ${error.message}`);
    }
  }

  getSession(sessionId: string): BiometricSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  addClientToSession(sessionId: string, client: any): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.clients.push(client);
    return true;
  }

  removeClientFromSession(sessionId: string, client: any): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.clients = session.clients.filter((c) => c !== client);
    }
  }

  private setupArduinoListeners(
    sessionId: string,
    port: SerialPort,
    parser: ReadlineParser
  ): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    parser.on("data", (line: string) => {
      const message = line.trim();
      console.log("=== ARDUINO RESPONSE ===");
      console.log("Mensaje recibido:", message);
      console.log("Session ID:", sessionId);
      console.log("=========================");

      let eventData: any = null;

      // 🎯 CORRECCIÓN: Manejar tanto registro como validación
      if (message.includes("Sensor conectado")) {
        eventData = {
          type: "connection",
          message: "Dispositivo conectado correctamente",
          status: "connected",
        };
        session.status = "waiting";
      } else if (message.includes("Esperando dedo")) {
        // 🎯 Para validación, solo necesitamos una lectura
        if (session.user_id === 0) {
          // Es validación
          eventData = {
            type: "waiting_verify",
            message: "Coloque el dedo en el sensor para validar...",
            status: "waiting_verify",
          };
        } else {
          // Es registro
          eventData = {
            type: "waiting_first",
            message: "Coloque el dedo en el sensor para la primera lectura...",
            status: "waiting_first",
          };
        }
      } else if (message.includes("Retira el dedo")) {
        if (session.user_id === 0) {
          // Validación: procesar huella encontrada
          eventData = {
            type: "processing",
            message: "Procesando huella...",
            status: "processing",
          };
        } else {
          // Registro: primera lectura completada
          eventData = {
            type: "first_complete",
            message: "Primera lectura completada. Retire el dedo del sensor",
            status: "first_complete",
          };
        }
      } else if (message.includes("Coloca el mismo dedo")) {
        // Solo para registro
        eventData = {
          type: "waiting_second",
          message: "Coloque el mismo dedo nuevamente para confirmar...",
          status: "waiting_second",
        };
      } else if (message.includes("Huella guardada exitosamente")) {
        // Solo para registro
        eventData = {
          type: "processing",
          message: "Procesando y guardando huella...",
          status: "processing",
        };
      } else if (message.includes("Huella registrada con ID:")) {
        // Solo para registro
        const biometricId = parseInt(message.match(/(\d+)/)?.[1] || "0");
        session.biometric_id = biometricId;
        eventData = {
          type: "success",
          message: "¡Huella registrada exitosamente!",
          biometric_id: biometricId,
          status: "completed",
        };
        session.status = "completed";
        // 🔧 CORRECCIÓN: Limpiar sesión automáticamente después de 3 segundos
        setTimeout(() => {
          console.log("=== AUTO CLEANUP ===");
          console.log("Limpiando sesión automáticamente:", sessionId);
          console.log("=====================");
          this.cleanupSession(sessionId);
        }, 3000);
      } else if (message.includes("Huella encontrada con ID:")) {
        // 🎯 NUEVO: Para validación
        const biometricId = parseInt(message.match(/(\d+)/)?.[1] || "0");
        session.biometric_id = biometricId;
        eventData = {
          type: "verify_success",
          message: "¡Huella validada exitosamente!",
          biometric_id: biometricId,
          status: "completed",
        };
        session.status = "completed";
        // 🔧 CORRECCIÓN: Limpiar sesión automáticamente después de 3 segundos
        setTimeout(() => {
          console.log("=== AUTO CLEANUP ===");
          console.log("Limpiando sesión automáticamente:", sessionId);
          console.log("=====================");
          this.cleanupSession(sessionId);
        }, 3000);
      } else if (message.includes("Huella no encontrada")) {
        // 🎯 NUEVO: Para validación
        eventData = {
          type: "verify_error",
          message: "Huella no reconocida. Intente nuevamente.",
          status: "error",
        };
        session.status = "error";
        // 🔧 CORRECCIÓN: Limpiar sesión automáticamente después de 3 segundos en caso de error
        setTimeout(() => {
          console.log("=== AUTO CLEANUP ERROR ===");
          console.log("Limpiando sesión automáticamente por error:", sessionId);
          console.log("==========================");
          this.cleanupSession(sessionId);
        }, 3000);
      } else if (message.includes("Error")) {
        eventData = {
          type: "error",
          message: "Error durante el proceso",
          status: "error",
        };
        session.status = "error";
        // 🔧 CORRECCIÓN: Limpiar sesión automáticamente después de 3 segundos en caso de error
        setTimeout(() => {
          console.log("=== AUTO CLEANUP ERROR ===");
          console.log("Limpiando sesión automáticamente por error:", sessionId);
          console.log("==========================");
          this.cleanupSession(sessionId);
        }, 3000);
      } else if (message.includes("Proceso completado") || message.includes("Listo para el siguiente comando")) {
        // 🔧 CORRECCIÓN: Manejar mensaje final del Arduino
        eventData = {
          type: "ready",
          message: "Dispositivo listo para nueva operación",
          status: "ready",
        };
        // Limpiar sesión inmediatamente cuando Arduino indica que está listo
        setTimeout(() => {
          console.log("=== AUTO CLEANUP READY ===");
          console.log("Limpiando sesión automáticamente (Arduino listo):", sessionId);
          console.log("==========================");
          this.cleanupSession(sessionId);
        }, 1000);
      }

      // Enviar a todos los clientes de esta sesión
      if (eventData && session) {
        session.clients.forEach((client) => {
          if (client.write) {
            client.write(`data: ${JSON.stringify(eventData)}\n\n`);
          }
        });
      }
    });

    port.on("error", (error) => {
      console.error("=== ARDUINO ERROR ===");
      console.error("Error en puerto serial:", error);
      console.error("Session ID:", sessionId);
      console.error("=====================");

      const errorEvent = {
        type: "error",
        message: "Error de conexión con el dispositivo",
        status: "error",
      };
      session.status = "error";
      session.clients.forEach((client) => {
        if (client.write) {
          client.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
        }
      });

      // 🔧 CORRECCIÓN CRÍTICA: Limpiar sesión automáticamente en caso de error de puerto
      setTimeout(() => {
        console.log("=== AUTO CLEANUP PORT ERROR ===");
        console.log("Limpiando sesión automáticamente por error de puerto:", sessionId);
        console.log("=================================");
        this.cleanupSession(sessionId);
      }, 2000);
    });
  }

  cleanupSession(sessionId: string): void {
    console.log("=== CLEANUP SESSION ===");
    console.log("Session ID:", sessionId);
    console.log("Active sessions before cleanup:", this.activeSessions.size);

    const session = this.activeSessions.get(sessionId);
    if (session) {
      try {
        // Cerrar puerto serial de forma segura
        if (session.port && session.port.isOpen) {
          session.port.close((err) => {
            if (err) {
              console.error("Error cerrando puerto serial:", err);
            } else {
              console.log("Puerto serial cerrado correctamente");
            }
          });
        }

        // Cerrar todas las conexiones SSE
        session.clients.forEach((client) => {
          try {
            if (client.write) {
              client.write(`data: ${JSON.stringify({
                type: "session_closed",
                message: "Sesión cerrada",
                status: "closed"
              })}\n\n`);
            }
            if (client.end) {
              client.end();
            }
          } catch (error) {
            console.error("Error cerrando cliente SSE:", error);
          }
        });

        // Eliminar sesión del mapa
        this.activeSessions.delete(sessionId);
        console.log("Sesión eliminada del mapa");
        console.log("Active sessions after cleanup:", this.activeSessions.size);

      } catch (error) {
        console.error("Error durante cleanup de sesión:", error);
        // Forzar eliminación de la sesión incluso si hay errores
        this.activeSessions.delete(sessionId);
      }
    } else {
      console.log("Sesión no encontrada para cleanup");
    }
    console.log("=======================");
  }

  getSessionStatus(
    sessionId: string
  ): { status: string; biometric_id?: number } | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      status: session.status,
      biometric_id: session.biometric_id,
    };
  }

  getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  getActiveSessionIds(): string[] {
    return Array.from(this.activeSessions.keys());
  }

  // 🔧 MÉTODO: Forzar limpieza de todas las sesiones
  forceCleanupAllSessions(): void {
    console.log("=== FORCE CLEANUP ALL SESSIONS ===");
    console.log("Sesiones activas antes de limpieza forzada:", this.activeSessions.size);

    const sessionIds = Array.from(this.activeSessions.keys());
    sessionIds.forEach(sessionId => {
      console.log("Forzando limpieza de sesión:", sessionId);
      this.cleanupSession(sessionId);
    });

    console.log("Sesiones activas después de limpieza forzada:", this.activeSessions.size);
    console.log("=============================================");
  }

  // 🔧 NUEVO MÉTODO: Listar todos los puertos COM disponibles
  async listAvailablePorts(): Promise<Array<{
    path: string;
    manufacturer?: string;
    serialNumber?: string;
    pnpId?: string;
    locationId?: string;
    productId?: string;
    vendorId?: string;
  }>> {
    try {
      console.log("=== LISTANDO PUERTOS DISPONIBLES ===");
      const availablePorts = await SerialPort.list();
      
      // Filtrar solo puertos COM (Windows) o tty (Linux/Mac)
      const comPorts = availablePorts.filter(port => 
        port.path.toLowerCase().includes('com') || 
        port.path.toLowerCase().includes('tty')
      );
      
      console.log("Total de puertos encontrados:", availablePorts.length);
      console.log("Puertos COM/TTY filtrados:", comPorts.length);
      
      // Mapear solo la información relevante
      const portInfo = comPorts.map(port => ({
        path: port.path,
        manufacturer: port.manufacturer,
        serialNumber: port.serialNumber,
        pnpId: port.pnpId,
        locationId: port.locationId,
        productId: port.productId,
        vendorId: port.vendorId
      }));
      
      console.log("Información de puertos COM:", portInfo);
      console.log("=====================================");
      
      return portInfo;
    } catch (error) {
      console.error("Error listando puertos disponibles:", error);
      throw new Error(`Error listando puertos: ${error.message}`);
    }
  }

  // 🔧 NUEVO MÉTODO: Obtener información del puerto actual en uso
  getCurrentPortInfo(sessionId: string): { path: string; status: string } | null {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.port) {
      return null;
    }
    
    return {
      path: session.port.path,
      status: session.port.isOpen ? "open" : "closed"
    };
  }

  // Helpers para detección de puerto Arduino
  private isBluetoothPort(port: any): boolean {
    const text = `${port.manufacturer || ""} ${port.pnpId || ""} ${(port as any).friendlyName || ""}`.toLowerCase();
    return text.includes("bluetooth") || text.includes("bthenum");
  }

  private extractComNumber(path: string | undefined): number {
    if (!path) return -1;
    const match = path.toUpperCase().match(/COM(\d+)/);
    return match ? parseInt(match[1], 10) : -1;
  }

  private async findBestArduinoPort(ports: Array<any>): Promise<any> {
    if (!ports || ports.length === 0) {
      throw new Error("No se encontraron puertos en el sistema");
    }

    const preferredPath = process.env.ARDUINO_PORT;

    // 1) Intentar puerto preferido si está configurado
    if (preferredPath) {
      const preferred = ports.find(
        (p) => p.path && p.path.toLowerCase() === preferredPath.toLowerCase()
      );
      if (preferred) {
        console.log("Usando puerto preferido por variable de entorno:", preferred.path);
        return preferred;
      }
      console.log("Puerto preferido no encontrado entre puertos listados, continuando con autodetección...");
    }

    // 2) Filtrar puertos no Bluetooth
    const nonBluetooth = ports.filter((p) => !this.isBluetoothPort(p));

    // 3) Buscar por VID/PID de CH340 (VID=1A86, PID=7523)
    const isCH340 = (p: any) =>
      (p.vendorId || "").toUpperCase() === "1A86" && (p.productId || "").toUpperCase() === "7523";

    const ch340Candidates = nonBluetooth.filter(isCH340);
    if (ch340Candidates.length > 0) {
      // Si hay varios, elegir el de mayor COM number
      const best = ch340Candidates.sort(
        (a, b) => this.extractComNumber(b.path) - this.extractComNumber(a.path)
      )[0];
      console.log("Detectado CH340 por VID/PID, seleccionando:", best.path);
      return best;
    }

    // 4) Heurística: manufacturer típico de CH340
    const ch340ByManufacturer = nonBluetooth.filter((p) =>
      `${p.manufacturer || ""}`.toLowerCase().includes("wch") ||
      `${(p as any).friendlyName || ""}`.toLowerCase().includes("ch340")
    );
    if (ch340ByManufacturer.length > 0) {
      const best = ch340ByManufacturer.sort(
        (a, b) => this.extractComNumber(b.path) - this.extractComNumber(a.path)
      )[0];
      console.log("Detectado CH340 por fabricante/nombre, seleccionando:", best.path);
      return best;
    }

    // 5) Último recurso: elegir el COM más alto no Bluetooth
    const comSorted = nonBluetooth
      .filter((p) => /com/i.test(p.path || ""))
      .sort((a, b) => this.extractComNumber(b.path) - this.extractComNumber(a.path));

    if (comSorted.length > 0) {
      console.log("Seleccionando mayor COM no Bluetooth (fallback):", comSorted[0].path);
      return comSorted[0];
    }

    // 6) Si no hay, elegir cualquiera
    console.log("No se pudo filtrar, seleccionando primer puerto listado:");
    return ports[0];
  }
}
