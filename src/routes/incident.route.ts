import express from "express";
import multer from "multer";
import { IncidentController } from "@controllers/incident.controller";
import { createIncidentValidator } from "@utils/validators/incident.validator";
import { validationResult } from "express-validator";

const router = express.Router();
const controller = new IncidentController();

// Middleware to handle validation errors
const validateRequest = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos de imagen"));
    }
  },
});

/**
 * @swagger
 * /api/v1/incidents:
 *   post:
 *     summary: Crear un nuevo incidente con imágenes
 *     tags: [Incidents]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - status
 *               - severity
 *               - user_id
 *             properties:
 *               description:
 *                 type: string
 *                 description: Descripción del incidente
 *               status:
 *                 type: string
 *                 enum: [reportado, en_revision, resuelto, descartado]
 *                 description: Estado del incidente
 *               severity:
 *                 type: string
 *                 enum: [baja, media, alta, critica]
 *                 description: Severidad del incidente
 *               user_id:
 *                 type: integer
 *                 description: ID del usuario que reporta el incidente
 *               checkpoint_id:
 *                 type: integer
 *                 description: ID del checkpoint (opcional)
 *               branch_id:
 *                 type: integer
 *                 description: ID de la sucursal (opcional)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Imágenes del incidente (máximo 3)
 *     responses:
 *       201:
 *         description: Incidente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Incident'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/",
  upload.array("images", 3),
  createIncidentValidator,
  validateRequest,
  controller.createIncident.bind(controller)
);

/**
 * @swagger
 * /api/v1/incidents:
 *   get:
 *     summary: Obtener todos los incidentes
 *     tags: [Incidents]
 *     responses:
 *       200:
 *         description: Lista de incidentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Incident'
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", controller.getAllIncidents.bind(controller));

/**
 * @swagger
 * /api/v1/incidents/{id}:
 *   get:
 *     summary: Obtener un incidente por ID
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del incidente
 *     responses:
 *       200:
 *         description: Incidente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Incident'
 *       404:
 *         description: Incidente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", controller.getIncidentById.bind(controller));

/**
 * @swagger
 * /api/v1/incidents/{id}:
 *   put:
 *     summary: Actualizar un incidente
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del incidente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [reportado, en_revision, resuelto, descartado]
 *               severity:
 *                 type: string
 *                 enum: [baja, media, alta, critica]
 *               checkpoint_id:
 *                 type: integer
 *               branch_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Incidente actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Incident'
 *       404:
 *         description: Incidente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put("/:id", controller.updateIncident.bind(controller));

/**
 * @swagger
 * /api/v1/incidents/{id}:
 *   delete:
 *     summary: Eliminar un incidente
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del incidente
 *     responses:
 *       200:
 *         description: Incidente eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Incidente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id", controller.deleteIncident.bind(controller));

/**
 * @swagger
 * /api/v1/incidents/{id}/images:
 *   post:
 *     summary: Agregar imágenes a un incidente existente
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del incidente
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Imágenes a agregar (máximo 3 total)
 *     responses:
 *       201:
 *         description: Imágenes agregadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/IncidentImage'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Incidente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  "/:id/images",
  upload.array("images", 3),
  controller.addImagesToIncident.bind(controller)
);

/**
 * @swagger
 * /api/v1/incidents/images/{imageId}:
 *   delete:
 *     summary: Eliminar una imagen específica de un incidente
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la imagen
 *     responses:
 *       200:
 *         description: Imagen eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Imagen no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete(
  "/images/:imageId",
  controller.deleteIncidentImage.bind(controller)
);

/**
 * @swagger
 * /api/v1/incidents/{id}/upload-url:
 *   post:
 *     summary: Generar URL de subida firmada para imágenes
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del incidente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - contentType
 *             properties:
 *               fileName:
 *                 type: string
 *                 description: Nombre del archivo
 *               contentType:
 *                 type: string
 *                 description: Tipo MIME del archivo
 *     responses:
 *       200:
 *         description: URL de subida generada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uploadUrl:
 *                   type: string
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */
router.post("/:id/upload-url", controller.generateUploadUrl.bind(controller));

/**
 * @swagger
 * /api/v1/incidents/branch/{branchId}:
 *   get:
 *     summary: Obtener incidentes por branch_id
 *     tags: [Incidents]
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Lista de incidentes de la sucursal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Incident'
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  "/branch/:branchId",
  controller.getIncidentsByBranchId.bind(controller)
);

export default router;
