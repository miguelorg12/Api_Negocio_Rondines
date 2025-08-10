import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as dotenv from "dotenv";

dotenv.config();

export class DigitalOceanService {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;
  private endpoint: string;

  constructor() {
    this.bucketName = process.env.DO_SPACES_BUCKET || "";
    this.region = process.env.DO_SPACES_REGION || "nyc3";
    this.endpoint = `https://${this.region}.digitaloceanspaces.com`;

    this.s3Client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: process.env.DO_SPACES_KEY || "",
        secretAccessKey: process.env.DO_SPACES_SECRET || "",
      },
      forcePathStyle: false,
    });
  }

  /**
   * Obtiene un archivo de configuración del ESP32 desde Digital Ocean Spaces
   * @param filePath - Ruta del archivo en el bucket (ej: "ESP32CONF/sketch_aug9a.ino.merged.bin")
   * @returns URL firmada para descargar el archivo
   */
  async getESP32ConfigFile(filePath: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: filePath,
      });
      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600, // 1 hora
      });
      return signedUrl;
    } catch (error) {
      console.error("Error al obtener archivo de Digital Ocean:", error);
      throw new Error(`No se pudo obtener el archivo: ${filePath}`);
    }
  }

  async getESP32ConfigFileContent(filePath: string): Promise<Buffer> {
    try {
      console.log(`[DigitalOcean] Descargando archivo: ${filePath}`);

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: filePath,
      });
      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error("El archivo está vacío o no se pudo leer");
      }

      console.log(
        `[DigitalOcean] Content-Length del S3: ${response.ContentLength} bytes`
      );
      console.log(
        `[DigitalOcean] Content-Type del S3: ${response.ContentType}`
      );

      // Usar el método nativo de AWS SDK para convertir a Buffer
      if (
        response.Body &&
        typeof response.Body === "object" &&
        "on" in response.Body
      ) {
        // Es un stream de Node.js
        console.log(`[DigitalOcean] Usando stream de Node.js`);
        return new Promise((resolve, reject) => {
          const chunks: Buffer[] = [];
          (response.Body as any).on("data", (chunk: Buffer) => {
            console.log(`[DigitalOcean] Chunk recibido: ${chunk.length} bytes`);
            chunks.push(chunk);
          });
          (response.Body as any).on("end", () => {
            const finalBuffer = Buffer.concat(chunks);
            console.log(
              `[DigitalOcean] Buffer final: ${finalBuffer.length} bytes`
            );
            resolve(finalBuffer);
          });
          (response.Body as any).on("error", reject);
        });
      } else {
        // Intentar con transformToWebStream como fallback
        console.log(`[DigitalOcean] Usando transformToWebStream`);
        const chunks: Uint8Array[] = [];
        const reader = response.Body.transformToWebStream().getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          console.log(
            `[DigitalOcean] Chunk web recibido: ${value.length} bytes`
          );
          chunks.push(value);
        }

        const finalBuffer = Buffer.concat(chunks);
        console.log(
          `[DigitalOcean] Buffer final web: ${finalBuffer.length} bytes`
        );
        return finalBuffer;
      }
    } catch (error) {
      console.error(
        "Error al obtener contenido del archivo de Digital Ocean:",
        error
      );
      throw new Error(
        `No se pudo obtener el contenido del archivo: ${filePath}`
      );
    }
  }

  /**
   * Lista archivos disponibles en la carpeta ESP32CONF
   * @returns Lista de archivos de configuración disponibles
   */
  async listESP32ConfigFiles(): Promise<string[]> {
    try {
      const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: "ESP32CONF/",
        MaxKeys: 100,
      });

      const response = await this.s3Client.send(command);

      if (!response.Contents) {
        return [];
      }

      return response.Contents.map((obj) => obj.Key)
        .filter((key) => key && key.endsWith(".bin"))
        .map((key) => key!.replace("ESP32CONF/", ""));
    } catch (error) {
      console.error("Error al listar archivos de configuración:", error);
      throw new Error("No se pudieron listar los archivos de configuración");
    }
  }

  /**
   * Verifica si existe un archivo específico
   * @param filePath - Ruta del archivo a verificar
   * @returns true si el archivo existe, false en caso contrario
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const { HeadObjectCommand } = await import("@aws-sdk/client-s3");
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: filePath,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }
}
