import { AppDataSource } from "@configs/data-source";
import { Patrol } from "@interfaces/entity/patrol.entity";
import { Plan } from "@interfaces/entity/plan.entity";
import {
  PatrolDto,
  PartialPatrolDto,
  PatrolAssigmentDto,
  PatrolWithPlanImageDto,
} from "@interfaces/dto/patrol.dto";
import { Repository } from "typeorm";
import { PlanService } from "@services/plan.service";
import { PatrolRecordService } from "@services/patrol_record.service";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import * as path from "path";
import * as crypto from "crypto";

export class PatrolService {
  private patrolRepository: Repository<Patrol>;
  private planRepository: Repository<Plan>;
  private planService: PlanService;
  private patrolRecordService: PatrolRecordService;
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.patrolRepository = AppDataSource.getRepository(Patrol);
    this.planRepository = AppDataSource.getRepository(Plan);
    this.planService = new PlanService();
    this.patrolRecordService = new PatrolRecordService();

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

  async create(patrolDto: PatrolDto): Promise<Patrol> {
    let patrol = this.patrolRepository.create(patrolDto);
    return await this.patrolRepository.save(patrolDto);
  }

  async createWithPlanImage(
    patrolData: PatrolWithPlanImageDto,
    planFile?: Express.Multer.File
  ): Promise<Patrol> {
    // Crear el patrol
    const patrol = this.patrolRepository.create({
      name: patrolData.name,
      frequency: patrolData.frequency,
      active: patrolData.active ?? true,
      branch: { id: patrolData.branch_id },
    });

    const savedPatrol = await this.patrolRepository.save(patrol);

    // Si se proporcionó una imagen del plan, subirla y crear el plan
    if (planFile && patrolData.plan_name) {
      await this.uploadPlanImage(
        savedPatrol.id,
        planFile,
        patrolData.plan_name
      );
    }

    return await this.getPatrolWithPlans(savedPatrol.id);
  }

  /**
   * Subir imagen del plan a DigitalOcean Spaces
   */
  async uploadPlanImage(
    patrolId: number,
    file: Express.Multer.File,
    planName: string
  ): Promise<Plan> {
    // Generar nombre único para el archivo
    const fileExtension = path.extname(file.originalname);
    const fileName = `plans/${patrolId}/${crypto.randomUUID()}${fileExtension}`;

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
    const endpoint =
      process.env.DO_SPACES_ENDPOINT?.replace("https://", "") || "";
    const imageUrl = `https://${this.bucketName}.${endpoint}/${fileName}`;

    // Crear el plan en base de datos
    const plan = this.planRepository.create({
      name: planName,
      image_url: imageUrl,
      original_name: file.originalname,
      mime_type: file.mimetype,
      file_size: file.size,
      spaces_key: fileName,
      patrol: { id: patrolId },
    });

    return await this.planRepository.save(plan);
  }

  /**
   * Obtener patrol con sus planes
   */
  async getPatrolWithPlans(patrolId: number): Promise<Patrol> {
    const patrol = await this.patrolRepository.findOne({
      where: { id: patrolId },
      relations: ["branch"],
    });

    if (!patrol) {
      throw new Error("Patrol no encontrado");
    }

    // Cargar planes por separado para evitar conflictos
    const plans = await this.planRepository.find({
      where: { patrol: { id: patrolId } },
    });

    patrol.plans = plans;

    return patrol;
  }

  async getAll(): Promise<Patrol[]> {
    return await this.patrolRepository.find({
      relations: ["plans", "branch"],
    });
  }

  async getById(id: number): Promise<Patrol | null> {
    const patrol = await this.patrolRepository.findOne({
      where: { id },
      relations: ["branch"],
    });

    if (patrol) {
      // Cargar planes por separado
      const plans = await this.planRepository.find({
        where: { patrol: { id } },
      });
      patrol.plans = plans;
    }

    return patrol;
  }

  async getPatrolsByBranchId(id: number) {
    return await this.patrolRepository.find({
      where: { branch: { id } },
      relations: {
        patrolAssignments: {
          shift: true,
        },
        plans: true,
      },
      select: {
        id: true,
        name: true,
        frequency: true,
        active: true,
        patrolAssignments: {
          id: true,
          date: true,
          shift: {
            id: true,
            name: true,
            start_time: true,
            end_time: true,
            created_at: true,
          },
        },
        plans: {
          id: true,
          name: true,
          image_url: true,
        },
      },
    });
  }

  async update(
    id: number,
    patrolDto: PartialPatrolDto
  ): Promise<Patrol | null> {
    const patrol = await this.getById(id);
    if (!patrol) {
      throw new Error("Ronda no encontrada");
    }
    await this.patrolRepository.update(id, patrolDto);
    return this.getById(id);
  }

  async updateWithPlanImage(
    id: number,
    patrolData: PatrolWithPlanImageDto,
    planFile?: Express.Multer.File
  ): Promise<Patrol> {
    // Verificar que el patrol existe
    const existingPatrol = await this.getById(id);
    if (!existingPatrol) {
      throw new Error("Ronda no encontrada");
    }

    // Actualizar datos básicos del patrol
    const updateData: PartialPatrolDto = {
      name: patrolData.name,
      frequency: patrolData.frequency,
      active: patrolData.active,
      branch_id: patrolData.branch_id,
    };

    await this.patrolRepository.update(id, updateData);

    // Si se proporcionó una imagen del plan, subirla y crear el plan
    if (planFile && patrolData.plan_name) {
      await this.uploadPlanImage(id, planFile, patrolData.plan_name);
    }

    return await this.getPatrolWithPlans(id);
  }

  async delete(id: number): Promise<Patrol | null> {
    const patrol = await this.getById(id);
    if (!patrol) {
      throw new Error("Ronda no encontrada");
    }
    await this.patrolRepository.update(id, {
      active: patrol.active ? false : true,
    });
    return this.getById(id);
  }

  async createPatrolAndAssigment(
    patrolDto: PatrolAssigmentDto
  ): Promise<Patrol> {
    let patrol = this.patrolRepository.create(patrolDto);
    patrol = await this.patrolRepository.save(patrolDto);

    // Crear el registro de patrol (sin user_id y patrol_id ya que no existen en la entidad)
    this.patrolRecordService.create({
      date: new Date(),
      status: "pendiente",
    });

    return patrol;
  }

  /**
   * Eliminar plan y su imagen de DigitalOcean Spaces
   */
  async deletePlan(planId: number): Promise<void> {
    const plan = await this.planRepository.findOne({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error("Plan no encontrado");
    }

    // Eliminar de DigitalOcean Spaces
    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: plan.spaces_key,
    });

    await this.s3Client.send(deleteCommand);

    // Eliminar de base de datos
    await this.planRepository.remove(plan);
  }
}
