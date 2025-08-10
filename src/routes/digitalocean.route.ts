import { Router } from "express";
import { DigitalOceanController } from "@controllers/digitalocean.controller";

const router = Router();
const digitalOceanController = new DigitalOceanController();

/**
 * @swagger
 * /api/digitalocean/esp32-config:
 *   get:
 *     summary: Lista todos los archivos de configuración del ESP32 disponibles
 *     tags: [Digital Ocean]
 *     responses:
 *       200:
 *         description: Lista de archivos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalFiles:
 *                       type: number
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           filename:
 *                             type: string
 *                           fullPath:
 *                             type: string
 *                           downloadUrl:
 *                             type: string
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/esp32-config",
  digitalOceanController.listESP32ConfigFiles.bind(digitalOceanController)
);

/**
 * @swagger
 * /api/digitalocean/esp32-config/{filename}:
 *   get:
 *     summary: Obtiene información y URL de descarga de un archivo de configuración específico
 *     tags: [Digital Ocean]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del archivo de configuración
 *     responses:
 *       200:
 *         description: Información del archivo obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     downloadUrl:
 *                       type: string
 *                     expiresIn:
 *                       type: string
 *                     filePath:
 *                       type: string
 *       400:
 *         description: Nombre de archivo requerido
 *       404:
 *         description: Archivo no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/esp32-config/:filename",
  digitalOceanController.getESP32ConfigFile.bind(digitalOceanController)
);

/**
 * @swagger
 * /api/digitalocean/esp32-config/{filename}/download:
 *   get:
 *         summary: Descarga directa de un archivo de configuración
 *         tags: [Digital Ocean]
 *         parameters:
 *           - in: path
 *             name: filename
 *             required: true
 *             schema:
 *               type: string
 *             description: Nombre del archivo de configuración a descargar
 *         responses:
 *           302:
 *             description: Redirección a la URL de descarga
 *           400:
 *             description: Nombre de archivo requerido
 *           404:
 *             description: Archivo no encontrado
 *           500:
 *             description: Error interno del servidor
 */
router.get(
  "/esp32-config/:filename/download",
  digitalOceanController.downloadESP32ConfigFile.bind(digitalOceanController)
);

router.get(
  "/esp32-config/:filename/content",
  digitalOceanController.getESP32ConfigFileContent.bind(digitalOceanController)
);

export default router;
