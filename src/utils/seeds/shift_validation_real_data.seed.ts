import { AppDataSource } from "@configs/data-source";
import { User } from "@entities/user.entity";
import { Branch } from "@entities/branch.entity";
import { Patrol } from "@entities/patrol.entity";
import { PatrolAssignment } from "@entities/patrol_assigment.entity";
import { Shift } from "@entities/shift.entity";
import { PatrolService } from "@services/patrol.service";
import { PatrolAssignmentService } from "@services/patrol_assigment.service";

export async function seedShiftValidationRealData() {
  const userRepository = AppDataSource.getRepository(User);
  const branchRepository = AppDataSource.getRepository(Branch);
  const patrolRepository = AppDataSource.getRepository(Patrol);
  const patrolAssignmentRepository =
    AppDataSource.getRepository(PatrolAssignment);
  const shiftRepository = AppDataSource.getRepository(Shift);

  const patrolService = new PatrolService();
  const patrolAssignmentService = new PatrolAssignmentService();

  console.log(
    "\n🌱 Iniciando seed de datos reales para validación de turnos..."
  );

  // Obtener branches existentes
  const existingBranches = await branchRepository.find();
  if (existingBranches.length === 0) {
    console.log("❌ No hay branches disponibles para crear patrols");
    return;
  }

  // Obtener shifts existentes
  const existingShifts = await shiftRepository.find();
  if (existingShifts.length === 0) {
    console.log("❌ No hay shifts disponibles para crear assignments");
    return;
  }

  // Obtener usuarios existentes
  const existingUsers = await userRepository.find();
  if (existingUsers.length === 0) {
    console.log("❌ No hay usuarios disponibles para crear assignments");
    return;
  }

  console.log(`✅ Found ${existingBranches.length} branches`);
  console.log(`✅ Found ${existingShifts.length} shifts`);
  console.log(`✅ Found ${existingUsers.length} users`);

  try {
    // Crear usuarios de prueba si no existen
    console.log("\n👥 Creando usuarios de prueba...");
    const testUsers = [
      {
        name: "Juan",
        last_name: "Pérez",
        curp: "JUPE123456HDFLNR01",
        email: "juan.perez@test.com",
        password: "password123",
        biometric: 1001,
        role: { id: 2 }, // Guard role
      },
      {
        name: "María",
        last_name: "González",
        curp: "MAGO234567MDFLNR02",
        email: "maria.gonzalez@test.com",
        password: "password123",
        biometric: 1002,
        role: { id: 2 }, // Guard role
      },
      {
        name: "Carlos",
        last_name: "Rodríguez",
        curp: "CARO345678HDFLNR03",
        email: "carlos.rodriguez@test.com",
        password: "password123",
        biometric: 1003,
        role: { id: 2 }, // Guard role
      },
      {
        name: "Ana",
        last_name: "López",
        curp: "ANLO456789MDFLNR04",
        email: "ana.lopez@test.com",
        password: "password123",
        biometric: 1004,
        role: { id: 2 }, // Guard role
      },
      {
        name: "Luis",
        last_name: "Martínez",
        curp: "LUMO567890HDFLNR05",
        email: "luis.martinez@test.com",
        password: "password123",
        biometric: 1005,
        role: { id: 2 }, // Guard role
      },
    ];

    for (const userData of testUsers) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      });
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists`);
      } else {
        const user = userRepository.create(userData);
        const savedUser = await userRepository.save(user);
        console.log(
          `✅ Created user: ${savedUser.name} ${savedUser.last_name} (Biometric: ${savedUser.biometric})`
        );
      }
    }

    // Crear patrols usando el servicio
    console.log("\n🛡️  Creando patrols...");
    const testPatrols: Array<{
      name: string;
      active: boolean;
      branch_id: number;
    }> = [
      {
        name: "Ronda Matutina Principal",
        active: true,
        branch_id: existingBranches[0].id,
      },
      {
        name: "Ronda Vespertina Principal",
        active: true,
        branch_id: existingBranches[0].id,
      },
      {
        name: "Ronda Nocturna Principal",
        active: true,
        branch_id: existingBranches[0].id,
      },
      {
        name: "Ronda Matutina Secundaria",
        active: true,
        branch_id: existingBranches[0].id,
      },
      {
        name: "Ronda Vespertina Secundaria",
        active: true,
        branch_id: existingBranches[0].id,
      },
      // Patrols adicionales para vielmasexo
      {
        name: "Ronda Especial Vielmasexo 1",
        active: true,
        branch_id: existingBranches[0].id,
      },
      {
        name: "Ronda Especial Vielmasexo 2",
        active: true,
        branch_id: existingBranches[0].id,
      },
      {
        name: "Ronda Especial Vielmasexo 3",
        active: true,
        branch_id: existingBranches[0].id,
      },
      {
        name: "Ronda Especial Vielmasexo 4",
        active: true,
        branch_id: existingBranches[0].id,
      },
      {
        name: "Ronda Especial Vielmasexo 5",
        active: true,
        branch_id: existingBranches[0].id,
      },
    ];

    const createdPatrols = [];
    for (const patrolData of testPatrols) {
      const existingPatrol = await patrolRepository.findOne({
        where: { name: patrolData.name },
      });
      if (existingPatrol) {
        console.log(`⚠️  Patrol ${patrolData.name} already exists`);
        createdPatrols.push(existingPatrol);
      } else {
        // Usar el servicio para crear el patrol
        const patrol = await patrolService.create({
          name: patrolData.name,
          active: patrolData.active,
          branch_id: patrolData.branch_id,
        });

        createdPatrols.push(patrol);
        console.log(`✅ Created patrol: ${patrol.name}`);
      }
    }

    // Crear patrol assignments para diferentes escenarios
    console.log("\n📋 Creando patrol assignments...");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const testAssignments = [
      // Assignments para hoy
      {
        user_id: existingUsers[0].id,
        patrol_id: createdPatrols[0].id,
        shift_id: existingShifts[0].id,
        date: today,
      },
      {
        user_id: existingUsers[1].id,
        patrol_id: createdPatrols[1].id,
        shift_id: existingShifts[1].id,
        date: today,
      },
      {
        user_id: existingUsers[2].id,
        patrol_id: createdPatrols[2].id,
        shift_id: existingShifts[2].id,
        date: today,
      },
      // Assignments para mañana
      {
        user_id: existingUsers[3].id,
        patrol_id: createdPatrols[3].id,
        shift_id: existingShifts[0].id,
        date: tomorrow,
      },
      {
        user_id: existingUsers[4].id,
        patrol_id: createdPatrols[4].id,
        shift_id: existingShifts[1].id,
        date: tomorrow,
      },
    ];

    for (const assignmentData of testAssignments) {
      const existingAssignment = await patrolAssignmentRepository.findOne({
        where: {
          user: { id: assignmentData.user_id },
          patrol: { id: assignmentData.patrol_id },
          shift: { id: assignmentData.shift_id },
          date: assignmentData.date,
        },
      });

      if (existingAssignment) {
        console.log(
          `⚠️  Assignment for user ${assignmentData.user_id}, patrol ${assignmentData.patrol_id}, shift ${assignmentData.shift_id} already exists`
        );
      } else {
        const assignment = await patrolAssignmentService.create(assignmentData);
        console.log(
          `✅ Created assignment: User ${assignmentData.user_id} -> Patrol ${assignmentData.patrol_id} -> Shift ${assignmentData.shift_id}`
        );
      }
    }

    console.log("\n✅ Seed de datos reales completado exitosamente!");
    console.log("\n📊 Resumen:");
    console.log(`- Usuarios creados: ${testUsers.length}`);
    console.log(`- Patrols creados: ${createdPatrols.length}`);
    console.log(`- Assignments creados: ${testAssignments.length}`);
    console.log(`- Total: 5 patrols asignados`);
  } catch (error) {
    console.error("❌ Error durante el seed:", error);
    throw error;
  }
}
