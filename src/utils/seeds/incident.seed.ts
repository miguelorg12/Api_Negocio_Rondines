import { AppDataSource } from "@configs/data-source";
import { Incident } from "@entities/incident.entity";
import { IncidentImage } from "@entities/incident_image.entity";
import { User } from "@entities/user.entity";
import { Branch } from "@entities/branch.entity";
import { Checkpoint } from "@entities/checkpoint.entity";
import { IncidentService } from "@services/incident.service";
import * as fs from "fs";
import * as path from "path";

export async function seedIncidents() {
  const incidentRepository = AppDataSource.getRepository(Incident);
  const incidentImageRepository = AppDataSource.getRepository(IncidentImage);
  const userRepository = AppDataSource.getRepository(User);
  const branchRepository = AppDataSource.getRepository(Branch);
  const checkpointRepository = AppDataSource.getRepository(Checkpoint);

  // Crear instancia del servicio de incidentes
  const incidentService = new IncidentService(
    incidentRepository,
    incidentImageRepository
  );

  // Obtener usuarios, branches y checkpoints existentes
  const users = await userRepository.find();
  const branches = await branchRepository.find();
  const checkpoints = await checkpointRepository.find();

  if (users.length === 0 || branches.length === 0) {
    console.log("No hay usuarios o branches para crear incidentes");
    return;
  }

  // Cargar imagen de ejemplo desde archivo local
  const sampleImageBuffer = loadSampleImage();

  const incidents = [
    {
      description: "Puerta de entrada principal dañada - cerradura rota",
      status: "pendiente",
      severity: "alta",
      user_id: users[0].id,
      branch_id: branches[0].id,
      checkpoint_id: checkpoints.length > 0 ? checkpoints[0].id : null,
      imageCount: 2,
    },
    {
      description: "Ventana rota en sala de espera - posible entrada forzada",
      status: "en_progreso",
      severity: "media",
      user_id: users[1].id,
      branch_id: branches[0].id,
      checkpoint_id: checkpoints.length > 1 ? checkpoints[1].id : null,
      imageCount: 1,
    },
    {
      description: "Luces de emergencia no funcionan en estacionamiento",
      status: "completado",
      severity: "baja",
      user_id: users[2].id,
      branch_id: branches[1].id,
      checkpoint_id: checkpoints.length > 2 ? checkpoints[2].id : null,
      imageCount: 2,
    },
    {
      description: "Cámara de seguridad desconectada en área de recepción",
      status: "pendiente",
      severity: "alta",
      user_id: users[0].id,
      branch_id: branches[1].id,
      checkpoint_id: checkpoints.length > 3 ? checkpoints[3].id : null,
      imageCount: 3,
    },
    {
      description: "Extintor vencido en pasillo principal",
      status: "completado",
      severity: "media",
      user_id: users[1].id,
      branch_id: branches[0].id,
      checkpoint_id: checkpoints.length > 4 ? checkpoints[4].id : null,
      imageCount: 1,
    },
    {
      description: "Alarma de incendio activada sin causa aparente",
      status: "en_progreso",
      severity: "alta",
      user_id: users[2].id,
      branch_id: branches[1].id,
      checkpoint_id: checkpoints.length > 5 ? checkpoints[5].id : null,
      imageCount: 2,
    },
    {
      description: "Cerradura de salida de emergencia atascada",
      status: "pendiente",
      severity: "alta",
      user_id: users[0].id,
      branch_id: branches[0].id,
      checkpoint_id: checkpoints.length > 6 ? checkpoints[6].id : null,
      imageCount: 1,
    },
    {
      description: "Ventilación de aire acondicionado con fuga de agua",
      status: "completado",
      severity: "media",
      user_id: users[1].id,
      branch_id: branches[1].id,
      checkpoint_id: checkpoints.length > 7 ? checkpoints[7].id : null,
      imageCount: 2,
    },
    {
      description: "Sistema de iluminación exterior defectuoso",
      status: "pendiente",
      severity: "baja",
      user_id: users[2].id,
      branch_id: branches[0].id,
      imageCount: 1,
    },
    {
      description: "Puerta de acceso a sótano sin seguro",
      status: "en_progreso",
      severity: "alta",
      user_id: users[0].id,
      branch_id: branches[1].id,
      imageCount: 3,
    },
    {
      description: "Detector de humo en cocina sin funcionar",
      status: "pendiente",
      severity: "alta",
      user_id: users[1].id,
      branch_id: branches[0].id,
      imageCount: 1,
    },
    {
      description: "Cerradura de oficina administrativa defectuosa",
      status: "completado",
      severity: "media",
      user_id: users[2].id,
      branch_id: branches[1].id,
      imageCount: 2,
    },
    {
      description: "Sistema de riego automático activado sin causa",
      status: "pendiente",
      severity: "baja",
      user_id: users[0].id,
      branch_id: branches[0].id,
      imageCount: 1,
    },
    {
      description: "Ventana de baño sin seguro - posible entrada",
      status: "en_progreso",
      severity: "alta",
      user_id: users[1].id,
      branch_id: branches[1].id,
      imageCount: 2,
    },
    {
      description: "Sistema de calefacción con mal funcionamiento",
      status: "completado",
      severity: "media",
      user_id: users[2].id,
      branch_id: branches[0].id,
      imageCount: 1,
    },
  ];

  for (const incidentData of incidents) {
    try {
      // Crear archivos simulados para el incidente
      const files: Express.Multer.File[] = [];
      for (let i = 0; i < incidentData.imageCount; i++) {
        const file: Express.Multer.File = {
          fieldname: "images",
          originalname: `incident_${Date.now()}_${i + 1}.jpg`,
          encoding: "7bit",
          mimetype: "image/jpeg",
          buffer: sampleImageBuffer,
          size: sampleImageBuffer.length,
        } as Express.Multer.File;

        files.push(file);
      }

      // Usar el servicio para crear el incidente con imágenes
      const incident = await incidentService.createIncidentWithImages(
        {
          description: incidentData.description,
          status: incidentData.status,
          severity: incidentData.severity,
          user_id: incidentData.user_id,
          branch_id: incidentData.branch_id,
          checkpoint_id: incidentData.checkpoint_id,
        },
        files
      );

      console.log(
        `Incidente creado: ${incident.description} con ${files.length} imágenes`
      );
    } catch (error) {
      console.error(
        `Error creando incidente: ${incidentData.description}`,
        error
      );
    }
  }

  console.log("Incidents seeded successfully");
}

/**
 * Cargar imagen de ejemplo desde archivo local
 */
function loadSampleImage(): Buffer {
  const imagePath = path.join(
    __dirname,
    "../../assets/images/sample_incident.jpg"
  );

  if (fs.existsSync(imagePath)) {
    console.log("Usando imagen local: sample_incident.jpg");
    return fs.readFileSync(imagePath);
  }

  console.log("Imagen sample_incident.jpg no encontrada en src/assets/images/");
  console.log(
    'Por favor, coloca una imagen llamada "sample_incident.jpg" en la carpeta src/assets/images/'
  );

  // Crear un buffer vacío como fallback
  return Buffer.from([]);
}
