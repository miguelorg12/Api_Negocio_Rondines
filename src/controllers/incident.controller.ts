import { Request, Response } from "express";
import { IncidentService } from "@services/incident.service";
import { AppDataSource } from "@configs/data-source";
import { Incident } from "@interfaces/entity/incident.entity";
import { IncidentImage } from "@interfaces/entity/incident_image.entity";

export class IncidentController {
  private incidentService: IncidentService;

  constructor() {
    const incidentRepository = AppDataSource.getRepository(Incident);
    const incidentImageRepository = AppDataSource.getRepository(IncidentImage);
    this.incidentService = new IncidentService(
      incidentRepository,
      incidentImageRepository
    );
  }

  /**
   * Crear incidente con imágenes
   */
  async createIncident(req: Request, res: Response): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];
      const {
        description,
        status,
        severity,
        user_id,
        checkpoint_id,
        branch_id,
      } = req.body;

      // Validar campos requeridos
      if (!description || !status || !severity || !user_id) {
        res.status(400).json({
          error: "description, status, severity y user_id son requeridos",
        });
        return;
      }

      // Validar archivos si se proporcionaron
      if (files && files.length > 0) {
        for (const file of files) {
          if (!file.mimetype.startsWith("image/")) {
            res.status(400).json({
              error: "Solo se permiten archivos de imagen",
            });
            return;
          }

          const maxSize = 5 * 1024 * 1024; // 5MB
          if (file.size > maxSize) {
            res.status(400).json({
              error: "El archivo es demasiado grande. Máximo 5MB",
            });
            return;
          }
        }
      }

      const incident = await this.incidentService.createIncidentWithImages(
        {
          description,
          status,
          severity,
          user_id: parseInt(user_id),
          checkpoint_id: checkpoint_id ? parseInt(checkpoint_id) : undefined,
          branch_id: branch_id ? parseInt(branch_id) : undefined,
        },
        files || []
      );

      res.status(201).json({
        message: "Incidente creado exitosamente",
        data: incident,
      });
    } catch (error) {
      console.error("Error al crear incidente:", error);
      res.status(500).json({ error: "Error al crear incidente" });
    }
  }

  /**
   * Obtener todos los incidentes
   */
  async getAllIncidents(req: Request, res: Response): Promise<void> {
    try {
      const incidents = await this.incidentService.getAllIncidentsWithImages();

      res.status(200).json({
        data: incidents,
      });
    } catch (error) {
      console.error("Error al obtener incidentes:", error);
      res.status(500).json({ error: "Error al obtener incidentes" });
    }
  }

  /**
   * Obtener incidente por ID
   */
  async getIncidentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const incident = await this.incidentService.getIncidentWithImages(
        parseInt(id)
      );

      res.status(200).json({
        data: incident,
      });
    } catch (error) {
      console.error("Error al obtener incidente:", error);
      res.status(500).json({ error: "Error al obtener incidente" });
    }
  }

  /**
   * Actualizar incidente
   */
  async updateIncident(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { description, status, severity, checkpoint_id, branch_id } =
        req.body;

      const updateData: any = {};
      if (description) updateData.description = description;
      if (status) updateData.status = status;
      if (severity) updateData.severity = severity;
      if (checkpoint_id !== undefined) {
        updateData.checkpoint_id = checkpoint_id
          ? parseInt(checkpoint_id)
          : null;
      }
      if (branch_id !== undefined) {
        updateData.branch_id = branch_id ? parseInt(branch_id) : null;
      }

      const incident = await this.incidentService.updateIncident(
        parseInt(id),
        updateData
      );

      res.status(200).json({
        message: "Incidente actualizado exitosamente",
        data: incident,
      });
    } catch (error) {
      console.error("Error al actualizar incidente:", error);
      res.status(500).json({ error: "Error al actualizar incidente" });
    }
  }

  /**
   * Eliminar incidente
   */
  async deleteIncident(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.incidentService.deleteIncident(parseInt(id));

      res.status(200).json({
        message: "Incidente eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar incidente:", error);
      res.status(500).json({ error: "Error al eliminar incidente" });
    }
  }

  /**
   * Agregar imágenes a un incidente existente
   */
  async addImagesToIncident(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ error: "No se proporcionaron archivos" });
        return;
      }

      // Validar archivos
      for (const file of files) {
        if (!file.mimetype.startsWith("image/")) {
          res.status(400).json({
            error: "Solo se permiten archivos de imagen",
          });
          return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          res.status(400).json({
            error: "El archivo es demasiado grande. Máximo 5MB",
          });
          return;
        }
      }

      const uploadedImages = await this.incidentService.uploadImagesForIncident(
        parseInt(id),
        files
      );

      res.status(201).json({
        message: "Imágenes agregadas exitosamente",
        data: uploadedImages,
      });
    } catch (error) {
      console.error("Error al agregar imágenes:", error);
      res.status(500).json({ error: "Error al agregar imágenes" });
    }
  }

  /**
   * Eliminar imagen específica
   */
  async deleteIncidentImage(req: Request, res: Response): Promise<void> {
    try {
      const { imageId } = req.params;
      await this.incidentService.deleteIncidentImage(parseInt(imageId));

      res.status(200).json({
        message: "Imagen eliminada exitosamente",
      });
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      res.status(500).json({ error: "Error al eliminar imagen" });
    }
  }

  /**
   * Generar URL de subida firmada
   */
  async generateUploadUrl(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { fileName, contentType } = req.body;

      if (!fileName || !contentType) {
        res.status(400).json({
          error: "fileName y contentType son requeridos",
        });
        return;
      }

      const uploadUrl = await this.incidentService.generateUploadUrl(
        parseInt(id),
        fileName,
        contentType
      );

      res.status(200).json({
        uploadUrl,
      });
    } catch (error) {
      console.error("Error al generar URL de subida:", error);
      res.status(500).json({ error: "Error al generar URL de subida" });
    }
  }

  /**
   * Obtener estadísticas de incidentes por empresa
   */
  async getIncidentStatsByCompany(req: Request, res: Response): Promise<void> {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        res.status(400).json({
          error: "start_date y end_date son requeridos",
        });
        return;
      }

      const startDate = new Date(start_date as string);
      const endDate = new Date(end_date as string);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400).json({
          error: "start_date y end_date deben ser fechas válidas",
        });
        return;
      }

      const stats = await this.incidentService.getIncidentStatsByCompany(
        startDate,
        endDate
      );

      res.status(200).json({
        message: "Estadísticas de incidentes por empresa obtenidas",
        data: stats,
      });
    } catch (error) {
      console.error("Error al obtener estadísticas por empresa:", error);
      res
        .status(500)
        .json({ error: "Error al obtener estadísticas por empresa" });
    }
  }

  /**
   * Obtener estadísticas de incidentes por sucursal
   */
  async getIncidentStatsByBranch(req: Request, res: Response): Promise<void> {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        res.status(400).json({
          error: "start_date y end_date son requeridos",
        });
        return;
      }

      const startDate = new Date(start_date as string);
      const endDate = new Date(end_date as string);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400).json({
          error: "start_date y end_date deben ser fechas válidas",
        });
        return;
      }

      const stats = await this.incidentService.getIncidentStatsByBranch(
        startDate,
        endDate
      );

      res.status(200).json({
        message: "Estadísticas de incidentes por sucursal obtenidas",
        data: stats,
      });
    } catch (error) {
      console.error("Error al obtener estadísticas por sucursal:", error);
      res
        .status(500)
        .json({ error: "Error al obtener estadísticas por sucursal" });
    }
  }

  /**
   * Obtener estadísticas generales de incidentes
   */
  async getGeneralIncidentStats(req: Request, res: Response): Promise<void> {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        res.status(400).json({
          error: "start_date y end_date son requeridos",
        });
        return;
      }

      const startDate = new Date(start_date as string);
      const endDate = new Date(end_date as string);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400).json({
          error: "start_date y end_date deben ser fechas válidas",
        });
        return;
      }

      const stats = await this.incidentService.getGeneralIncidentStats(
        startDate,
        endDate
      );

      res.status(200).json({
        message: "Estadísticas generales de incidentes obtenidas",
        data: stats,
      });
    } catch (error) {
      console.error("Error al obtener estadísticas generales:", error);
      res
        .status(500)
        .json({ error: "Error al obtener estadísticas generales" });
    }
  }

  /**
   * Obtener incidentes por branch_id
   */
  async getIncidentsByBranchId(req: Request, res: Response): Promise<void> {
    try {
      const { branchId } = req.params;

      if (!branchId || isNaN(parseInt(branchId))) {
        res.status(400).json({
          error: "branchId debe ser un número válido",
        });
        return;
      }

      const incidents = await this.incidentService.getIncidentsByBranchId(
        parseInt(branchId)
      );

      res.status(200).json({
        data: incidents,
      });
    } catch (error) {
      console.error("Error al obtener incidentes por branch_id:", error);
      res
        .status(500)
        .json({ error: "Error al obtener incidentes por branch_id" });
    }
  }
}
