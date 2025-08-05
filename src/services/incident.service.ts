import { Repository, LessThan, MoreThanOrEqual } from "typeorm";
import { Incident } from "@entities/incident.entity";
import { IncidentImage } from "@entities/incident_image.entity";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as path from "path";
import * as crypto from "crypto";

export class IncidentService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    private incidentRepository: Repository<Incident>,
    private incidentImageRepository: Repository<IncidentImage>
  ) {
    // Configurar cliente de DigitalOcean Spaces
    this.s3Client = new S3Client({
      endpoint: process.env.DO_SPACES_ENDPOINT,
      region: process.env.DO_SPACES_REGION || "nyc3",
      credentials: {
        accessKeyId: process.env.DO_SPACES_KEY!,
        secretAccessKey: process.env.DO_SPACES_SECRET!,
      },
    });
    this.bucketName = process.env.DO_SPACES_BUCKET!;
  }

  /**
   * Crear incidente con imágenes
   */
  async createIncidentWithImages(
    incidentData: {
      description: string;
      status: string;
      severity: string;
      user_id: number;
      checkpoint_id?: number;
      branch_id?: number;
    },
    files: Express.Multer.File[]
  ): Promise<Incident> {
    // Validar límite de imágenes (máximo 3)
    if (files.length > 3) {
      throw new Error("Máximo 3 imágenes permitidas por incidente");
    }

    // Crear el incidente
    const incident = this.incidentRepository.create({
      description: incidentData.description,
      status: incidentData.status,
      severity: incidentData.severity,
      user: { id: incidentData.user_id },
      branch: incidentData.branch_id
        ? { id: incidentData.branch_id }
        : undefined,
      checkpoint: incidentData.checkpoint_id
        ? { id: incidentData.checkpoint_id }
        : undefined,
    });

    const savedIncident = await this.incidentRepository.save(incident);

    // Subir imágenes si se proporcionaron
    if (files.length > 0) {
      await this.uploadImagesForIncident(savedIncident.id, files);
    }

    // Retornar el incidente con sus imágenes
    return await this.getIncidentWithImages(savedIncident.id);
  }

  /**
   * Subir imágenes para un incidente existente
   */
  async uploadImagesForIncident(
    incidentId: number,
    files: Express.Multer.File[]
  ): Promise<IncidentImage[]> {
    // Verificar límite de imágenes existentes
    const existingImages = await this.incidentImageRepository.count({
      where: { incident: { id: incidentId } },
    });

    if (existingImages + files.length > 3) {
      throw new Error("Máximo 3 imágenes permitidas por incidente");
    }

    const uploadedImages: IncidentImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const order = existingImages + i + 1;

      // Generar nombre único para el archivo
      const fileExtension = path.extname(file.originalname);
      const fileName = `incidents/${incidentId}/${crypto.randomUUID()}${fileExtension}`;

      // Subir archivo a DigitalOcean Spaces
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      });

      await this.s3Client.send(uploadCommand);

      // Construir URL pública
      const imageUrl = `https://${
        this.bucketName
      }.${process.env.DO_SPACES_ENDPOINT?.replace("https://", "")}/${fileName}`;

      // Guardar en base de datos
      const incidentImage = this.incidentImageRepository.create({
        image_url: imageUrl,
        original_name: file.originalname,
        mime_type: file.mimetype,
        file_size: file.size,
        spaces_key: fileName,
        order,
        incident: { id: incidentId },
      });

      const savedImage = await this.incidentImageRepository.save(incidentImage);
      uploadedImages.push(savedImage);
    }

    return uploadedImages;
  }

  /**
   * Obtener incidente con sus imágenes
   */
  async getIncidentWithImages(incidentId: number): Promise<Incident> {
    const incident = await this.incidentRepository.findOne({
      where: { id: incidentId },
      relations: ["images", "user", "checkpoint", "branch"],
    });

    if (!incident) {
      throw new Error("Incidente no encontrado");
    }

    return incident;
  }

  /**
   * Obtener todos los incidentes con sus imágenes
   */
  async getAllIncidentsWithImages(): Promise<Incident[]> {
    return await this.incidentRepository.find({
      relations: ["images", "user", "branch", "checkpoint"],
      order: { created_at: "DESC" },
    });
  }

  /**
   * Actualizar incidente
   */
  async updateIncident(
    incidentId: number,
    updateData: {
      description?: string;
      status?: string;
      severity?: string;
      checkpoint_id?: number;
      branch_id?: number;
    }
  ): Promise<Incident> {
    const incident = await this.incidentRepository.findOne({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new Error("Incidente no encontrado");
    }

    // Actualizar campos
    if (updateData.description) incident.description = updateData.description;
    if (updateData.status) incident.status = updateData.status;
    if (updateData.severity) incident.severity = updateData.severity;

    if (updateData.branch_id !== undefined) {
      incident.branch = updateData.branch_id
        ? ({ id: updateData.branch_id } as any)
        : null;
    }

    if (updateData.checkpoint_id !== undefined) {
      incident.checkpoint = updateData.checkpoint_id
        ? ({ id: updateData.checkpoint_id } as any)
        : null;
    }

    await this.incidentRepository.save(incident);
    return await this.getIncidentWithImages(incidentId);
  }

  /**
   * Eliminar incidente y sus imágenes
   */
  async deleteIncident(incidentId: number): Promise<void> {
    const incident = await this.incidentRepository.findOne({
      where: { id: incidentId },
      relations: ["images"],
    });

    if (!incident) {
      throw new Error("Incidente no encontrado");
    }

    // Eliminar imágenes de DigitalOcean Spaces
    for (const image of incident.images) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: image.spaces_key,
      });
      await this.s3Client.send(deleteCommand);
    }

    // Eliminar incidente (las imágenes se eliminan automáticamente por CASCADE)
    await this.incidentRepository.remove(incident);
  }

  /**
   * Eliminar imagen específica de un incidente
   */
  async deleteIncidentImage(imageId: number): Promise<void> {
    const image = await this.incidentImageRepository.findOne({
      where: { id: imageId },
      relations: ["incident"],
    });

    if (!image) {
      throw new Error("Imagen no encontrada");
    }

    // Eliminar de DigitalOcean Spaces
    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: image.spaces_key,
    });

    await this.s3Client.send(deleteCommand);

    // Eliminar de base de datos
    await this.incidentImageRepository.remove(image);

    // Reordenar las imágenes restantes
    await this.reorderImages(image.incident.id);
  }

  /**
   * Reordenar imágenes después de eliminar una
   */
  private async reorderImages(incidentId: number): Promise<void> {
    const images = await this.incidentImageRepository.find({
      where: { incident: { id: incidentId } },
      order: { order: "ASC" },
    });

    for (let i = 0; i < images.length; i++) {
      images[i].order = i + 1;
      await this.incidentImageRepository.save(images[i]);
    }
  }

  /**
   * Generar URL de subida firmada para imágenes adicionales
   */
  async generateUploadUrl(
    incidentId: number,
    fileName: string,
    contentType: string
  ): Promise<string> {
    const fileExtension = path.extname(fileName);
    const key = `incidents/${incidentId}/${crypto.randomUUID()}${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      ACL: "public-read",
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hora
  }

  /**
   * Obtener estadísticas de incidentes por empresa
   */
  async getIncidentStatsByCompany(
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    const query = `
      SELECT 
        c.id as company_id,
        c.name as company_name,
        COUNT(i.id) as total_incidents,
        COUNT(DISTINCT b.id) as branches_count
      FROM companies c
      LEFT JOIN branches b ON b.company_id = c.id
      LEFT JOIN incidents i ON i.branch_id = b.id 
        AND i.created_at >= $1 
        AND i.created_at <= $2
      WHERE c.deleted_at IS NULL
      GROUP BY c.id, c.name
      HAVING COUNT(i.id) > 0
      ORDER BY total_incidents DESC
    `;

    return await this.incidentRepository.query(query, [startDate, endDate]);
  }

  /**
   * Obtener estadísticas de incidentes por sucursal
   */
  async getIncidentStatsByBranch(
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    const query = `
      SELECT 
        b.id as branch_id,
        b.name as branch_name,
        c.name as company_name,
        COUNT(i.id) as total_incidents
      FROM branches b
      LEFT JOIN companies c ON c.id = b.company_id
      LEFT JOIN incidents i ON i.branch_id = b.id 
        AND i.created_at >= $1 
        AND i.created_at <= $2
      WHERE b.deleted_at IS NULL AND c.deleted_at IS NULL
      GROUP BY b.id, b.name, c.name
      HAVING COUNT(i.id) > 0
      ORDER BY total_incidents DESC
    `;

    return await this.incidentRepository.query(query, [startDate, endDate]);
  }

  /**
   * Obtener estadísticas generales de incidentes
   */
  async getGeneralIncidentStats(startDate: Date, endDate: Date): Promise<any> {
    const totalIncidents = await this.incidentRepository
      .createQueryBuilder("incident")
      .where("incident.created_at >= :startDate", { startDate })
      .andWhere("incident.created_at <= :endDate", { endDate })
      .getCount();

    const incidentsByStatus = await this.incidentRepository
      .createQueryBuilder("incident")
      .select("incident.status", "status")
      .addSelect("COUNT(*)", "count")
      .where("incident.created_at >= :startDate", { startDate })
      .andWhere("incident.created_at <= :endDate", { endDate })
      .groupBy("incident.status")
      .getRawMany();

    const incidentsBySeverity = await this.incidentRepository
      .createQueryBuilder("incident")
      .select("incident.severity", "severity")
      .addSelect("COUNT(*)", "count")
      .where("incident.created_at >= :startDate", { startDate })
      .andWhere("incident.created_at <= :endDate", { endDate })
      .groupBy("incident.severity")
      .getRawMany();

    return {
      total_incidents: totalIncidents,
      by_status: incidentsByStatus,
      by_severity: incidentsBySeverity,
    };
  }

  /**
   * Obtener incidentes por branch_id
   */
  async getIncidentsByBranchId(branchId: number): Promise<Incident[]> {
    return await this.incidentRepository.find({
      where: { branch: { id: branchId } },
      relations: ["images", "user", "branch"],
      order: { created_at: "DESC" },
      select: {
        id: true,
        description: true,
        status: true,
        severity: true,
        created_at: true,
        images: {
          image_url: true,
        },
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
    });
  }

  /**
   * Obtener incidentes anteriores a la fecha de hoy por usuario
   */
  async getPreviousIncidentsByUserId(userId: number): Promise<Incident[]> {
    // Crear fecha de hoy en UTC
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0,
        0
      )
    );

    return await this.incidentRepository.find({
      where: {
        user: { id: userId },
        created_at: LessThan(todayUTC),
      },
      relations: ["images", "user", "branch"],
      order: { created_at: "DESC" },
      select: {
        id: true,
        description: true,
        status: true,
        severity: true,
        created_at: true,
        updated_at: true,
        images: {
          id: true,
          image_url: true,
          original_name: true,
          order: true,
        },
        user: {
          id: true,
          name: true,
          email: true,
        },
        branch: {
          id: true,
          name: true,
        },
      },
    });
  }

  /**
   * Obtener incidentes del día de hoy por usuario
   */
  async getTodayIncidentsByUserId(userId: number): Promise<Incident[]> {
    // Crear fechas en UTC
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0,
        0
      )
    );
    const tomorrowUTC = new Date(
      Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
        0,
        0,
        0,
        0
      )
    );

    return await this.incidentRepository.find({
      where: {
        user: { id: userId },
        created_at: MoreThanOrEqual(todayUTC) && LessThan(tomorrowUTC),
      },
      relations: ["images", "user", "branch"],
      order: { created_at: "DESC" },
      select: {
        id: true,
        description: true,
        status: true,
        severity: true,
        created_at: true,
        updated_at: true,
        images: {
          id: true,
          image_url: true,
          original_name: true,
          order: true,
        },
        user: {
          id: true,
          name: true,
          email: true,
        },
        branch: {
          id: true,
          name: true,
        },
      },
    });
  }
}
