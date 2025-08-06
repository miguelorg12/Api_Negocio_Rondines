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
      // Crear conexión con Arduino
      const port = new SerialPort({
        path: process.env.ARDUINO_PORT || "COM5",
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
      throw new Error("Error iniciando comunicación con Arduino");
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
      } else if (message.includes("Huella no encontrada")) {
        // 🎯 NUEVO: Para validación
        eventData = {
          type: "verify_error",
          message: "Huella no reconocida. Intente nuevamente.",
          status: "error",
        };
        session.status = "error";
      } else if (message.includes("Error")) {
        eventData = {
          type: "error",
          message: "Error durante el proceso",
          status: "error",
        };
        session.status = "error";
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
    });
  }

  cleanupSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.port.close();
      session.clients.forEach((client) => {
        if (client.end) {
          client.end();
        }
      });
      this.activeSessions.delete(sessionId);
    }
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
}
