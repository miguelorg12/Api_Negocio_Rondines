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

      // Configurar listeners del Arduino
      this.setupArduinoListeners(sessionId, port, parser);

      // Enviar acción al Arduino
      setTimeout(() => {
        port.write(Buffer.from(action + "\n", "utf-8"));
        setTimeout(() => {
          port.write(Buffer.from(user_id.toString() + "\n", "utf-8"));
        }, 1000);
      }, 3000);

      return { session_id: sessionId };
    } catch (error) {
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
      console.log("Arduino:", message);

      let eventData: any = null;

      // Mapear mensajes del Arduino a eventos
      if (message.includes("Sensor conectado")) {
        eventData = {
          type: "connection",
          message: "Dispositivo conectado correctamente",
          status: "connected",
        };
        session.status = "waiting";
      } else if (message.includes("Esperando dedo")) {
        eventData = {
          type: "waiting_first",
          message: "Coloque el dedo en el sensor para la primera lectura...",
          status: "waiting_first",
        };
      } else if (message.includes("Retira el dedo")) {
        eventData = {
          type: "first_complete",
          message: "Primera lectura completada. Retire el dedo del sensor",
          status: "first_complete",
        };
      } else if (message.includes("Coloca el mismo dedo")) {
        eventData = {
          type: "waiting_second",
          message: "Coloque el mismo dedo nuevamente para confirmar...",
          status: "waiting_second",
        };
      } else if (message.includes("Huella guardada exitosamente")) {
        eventData = {
          type: "processing",
          message: "Procesando y guardando huella...",
          status: "processing",
        };
      } else if (message.includes("Huella registrada con ID:")) {
        const biometricId = parseInt(message.match(/(\d+)/)?.[1] || "0");
        session.biometric_id = biometricId;
        eventData = {
          type: "success",
          message: "¡Huella registrada exitosamente!",
          biometric_id: biometricId,
          status: "completed",
        };
        session.status = "completed";
      } else if (message.includes("Error")) {
        eventData = {
          type: "error",
          message: "Error durante el registro de huella",
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
      console.error("Error en puerto serial:", error);
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
}
