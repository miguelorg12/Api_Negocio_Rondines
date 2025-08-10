import { Request, Response } from "express";
import { DigitalOceanService } from "@services/digitalocean.service";

export class DigitalOceanController {
  private digitalOceanService: DigitalOceanService;

  constructor() {
    this.digitalOceanService = new DigitalOceanService();
  }

  /**
   * Obtiene un archivo de configuración específico del ESP32
   * GET /api/digitalocean/esp32-config/:filename
   */
  async getESP32ConfigFile(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.params;

      if (!filename) {
        res.status(400).json({
          success: false,
          message: "Nombre de archivo requerido",
        });
        return;
      }

      // Construir la ruta completa del archivo
      const filePath = `ESP32CONF/${filename}`;

      // Verificar si el archivo existe
      const fileExists = await this.digitalOceanService.fileExists(filePath);

      if (!fileExists) {
        res.status(404).json({
          success: false,
          message: `Archivo ${filename} no encontrado en la carpeta ESP32CONF`,
        });
        return;
      }

      // Obtener URL firmada para descargar el archivo
      const downloadUrl = await this.digitalOceanService.getESP32ConfigFile(
        filePath
      );

      res.status(200).json({
        success: true,
        data: {
          filename,
          downloadUrl,
          expiresIn: "1 hora",
          filePath,
        },
      });
    } catch (error) {
      console.error("Error en getESP32ConfigFile:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  /**
   * Lista todos los archivos de configuración disponibles del ESP32
   * GET /api/digitalocean/esp32-config
   */
  async listESP32ConfigFiles(req: Request, res: Response): Promise<void> {
    try {
      const files = await this.digitalOceanService.listESP32ConfigFiles();

      res.status(200).json({
        success: true,
        data: {
          totalFiles: files.length,
          files: files.map((filename) => ({
            filename,
            fullPath: `ESP32CONF/${filename}`,
            downloadUrl: `/api/digitalocean/esp32-config/${filename}`,
          })),
        },
      });
    } catch (error) {
      console.error("Error en listESP32ConfigFiles:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  /**
   * Descarga directa de un archivo de configuración
   * GET /api/digitalocean/esp32-config/:filename/download
   */
  async downloadESP32ConfigFile(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.params;
      const filePath = `ESP32CONF/${filename}`;

      // Verificar que el archivo existe
      const exists = await this.digitalOceanService.fileExists(filePath);
      if (!exists) {
        res.status(404).json({
          success: false,
          message: "Archivo no encontrado",
        });
        return;
      }

      // Generar URL firmada y redirigir
      const signedUrl = await this.digitalOceanService.getESP32ConfigFile(
        filePath
      );
      res.redirect(signedUrl);
    } catch (error) {
      console.error("Error en downloadESP32ConfigFile:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  async getESP32ConfigFileContent(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.params;
      const filePath = `ESP32CONF/${filename}`;

      // Verificar que el archivo existe
      const exists = await this.digitalOceanService.fileExists(filePath);
      if (!exists) {
        res.status(404).json({
          success: false,
          message: "Archivo no encontrado",
        });
        return;
      }

      // Obtener el contenido del archivo
      const fileContent =
        await this.digitalOceanService.getESP32ConfigFileContent(filePath);

      // Configurar headers para archivo binario
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Content-Length", fileContent.length.toString());

      // Enviar el contenido del archivo directamente
      res.send(fileContent);
    } catch (error) {
      console.error("Error en getESP32ConfigFileContent:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
}
