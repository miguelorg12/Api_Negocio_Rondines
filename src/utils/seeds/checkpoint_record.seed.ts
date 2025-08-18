import { AppDataSource } from "@configs/data-source";
import { CheckpointRecord } from "@entities/checkpoint_record.entity";
import { PatrolAssignment } from "@entities/patrol_assigment.entity";
import { Checkpoint } from "@entities/checkpoint.entity";

export const seedCheckpointRecords = async () => {
  const checkpointRecordRepository =
    AppDataSource.getRepository(CheckpointRecord);
  const patrolAssignmentRepository =
    AppDataSource.getRepository(PatrolAssignment);
  const checkpointRepository = AppDataSource.getRepository(Checkpoint);

  try {
    // Obtener algunas patrol assignments existentes
    const patrolAssignments = await patrolAssignmentRepository.find({
      relations: ["user", "patrol", "shift"],
      take: 5,
    });

    // Obtener algunos checkpoints existentes
    const checkpoints = await checkpointRepository.find({
      take: 10,
    });

    if (patrolAssignments.length === 0) {
      console.log(
        "No hay patrol assignments disponibles para crear checkpoint records"
      );
      return;
    }

    if (checkpoints.length === 0) {
      console.log(
        "No hay checkpoints disponibles para crear checkpoint records"
      );
      return;
    }

    const checkpointRecords = [];

    // Crear checkpoint records para cada patrol assignment
    for (const patrolAssignment of patrolAssignments) {
      // Seleccionar algunos checkpoints aleatorios para esta patrol assignment
      const selectedCheckpoints = checkpoints.slice(
        0,
        Math.floor(Math.random() * 3) + 1
      );

      for (const checkpoint of selectedCheckpoints) {
        // Calcular la hora de verificación basada en el turno
        const assignmentDate = new Date(patrolAssignment.date);

        // Ahora que usamos columnas 'time', necesitamos crear fechas base
        const baseDate = new Date();

        // TypeORM devuelve columnas 'time' como string, necesitamos parsearlas
        let shiftStartHours: number, shiftStartMinutes: number;
        let shiftEndHours: number, shiftEndMinutes: number;

        if (typeof patrolAssignment.shift.start_time === "string") {
          const startTimeParts = patrolAssignment.shift.start_time.split(":");
          shiftStartHours = parseInt(startTimeParts[0], 10);
          shiftStartMinutes = parseInt(startTimeParts[1], 10);
        } else if (patrolAssignment.shift.start_time instanceof Date) {
          shiftStartHours = patrolAssignment.shift.start_time.getHours();
          shiftStartMinutes = patrolAssignment.shift.start_time.getMinutes();
        } else {
          throw new Error(
            `Tipo de dato no válido para start_time: ${typeof patrolAssignment
              .shift.start_time}`
          );
        }

        if (typeof patrolAssignment.shift.end_time === "string") {
          const endTimeParts = patrolAssignment.shift.end_time.split(":");
          shiftEndHours = parseInt(endTimeParts[0], 10);
          shiftEndMinutes = parseInt(endTimeParts[1], 10);
        } else if (patrolAssignment.shift.end_time instanceof Date) {
          shiftEndHours = patrolAssignment.shift.end_time.getHours();
          shiftEndMinutes = patrolAssignment.shift.end_time.getMinutes();
        } else {
          throw new Error(
            `Tipo de dato no válido para end_time: ${typeof patrolAssignment
              .shift.end_time}`
          );
        }

        const shiftStart = new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate(),
          shiftStartHours,
          shiftStartMinutes,
          0,
          0
        );
        const shiftEnd = new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate(),
          shiftEndHours,
          shiftEndMinutes,
          0,
          0
        );

        // Crear una hora de verificación aleatoria dentro del turno
        const checkTime = new Date(assignmentDate);
        checkTime.setHours(
          shiftStart.getHours() +
            Math.floor(
              Math.random() * (shiftEnd.getHours() - shiftStart.getHours())
            ),
          Math.floor(Math.random() * 60),
          0,
          0
        );

        // Determinar el estado basado en si ya pasó la hora
        const now = new Date();
        let status: "pending" | "completed" | "missed" | "late" = "pending";
        let realCheck: Date | null = null;

        if (checkTime < now) {
          // Si ya pasó la hora, determinar si se completó o se perdió
          if (Math.random() > 0.3) {
            status = "completed";
            // Crear una hora real de verificación (puede ser antes o después de la hora programada)
            realCheck = new Date(checkTime);
            realCheck.setMinutes(
              realCheck.getMinutes() +
                (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 30)
            );
          } else {
            status = "missed";
          }
        }

        const checkpointRecord = checkpointRecordRepository.create({
          patrolAssignment,
          checkpoint,
          check_time: checkTime,
          real_check: realCheck,
          status,
        });

        checkpointRecords.push(checkpointRecord);
      }
    }

    await checkpointRecordRepository.save(checkpointRecords);

    console.log(`✅ Se crearon ${checkpointRecords.length} checkpoint records`);
  } catch (error) {
    console.error("❌ Error al crear checkpoint records:", error);
  }
};
