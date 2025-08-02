import { AppDataSource } from "@configs/data-source";
import { Patrol } from "@entities/patrol.entity";
import { PatrolAssignment } from "@entities/patrol_assigment.entity";
import { PatrolRecord } from "@interfaces/entity/patrol_record.entity";
import { Shift } from "@interfaces/entity/shift.entity";
import { User } from "@entities/user.entity";
import { Branch } from "@entities/branch.entity";
import { Role } from "@entities/role.entity";

export async function seedShiftValidationRealData() {
  try {
    console.log("🌱 CREANDO DATOS REALES PARA SHIFT VALIDATION");
    console.log("=============================================");

    const shiftRepository = AppDataSource.getRepository(Shift);
    const patrolRepository = AppDataSource.getRepository(Patrol);
    const patrolAssignmentRepository =
      AppDataSource.getRepository(PatrolAssignment);
    const patrolRecordRepository = AppDataSource.getRepository(PatrolRecord);
    const userRepository = AppDataSource.getRepository(User);
    const branchRepository = AppDataSource.getRepository(Branch);
    const roleRepository = AppDataSource.getRepository(Role);

    // Verificar dependencias
    console.log("Verificando dependencias...");

    const existingBranches = await branchRepository.find();
    if (existingBranches.length === 0) {
      console.log("❌ No branches found. Please run the branch seeder first.");
      return;
    }

    const guardRole = await roleRepository.findOne({ where: { id: 4 } });
    if (!guardRole) {
      console.log(
        "❌ Guard role (id: 4) not found. Please run the role seeder first."
      );
      return;
    }

    const existingShifts = await shiftRepository.find();
    if (existingShifts.length === 0) {
      console.log("❌ No shifts found. Please run the shift seeder first.");
      return;
    }

    console.log(
      `✅ Found ${existingShifts.length} shifts, ${existingBranches.length} branches`
    );

    // Crear usuarios con biometric para testing
    console.log("\n👥 Creando usuarios con biometric...");
    const testUsers = [
      {
        name: "Juan",
        last_name: "Pérez",
        curp: "PERJ800101HDFXXX01",
        email: "juan.perez@test.com",
        password: "Test123!",
        role_id: 4,
        active: true,
        biometric: 1001,
        branch_id: existingBranches[0].id,
      },
      {
        name: "María",
        last_name: "García",
        curp: "GARM800101HDFXXX02",
        email: "maria.garcia@test.com",
        password: "Test123!",
        role_id: 4,
        active: true,
        biometric: 1002,
        branch_id: existingBranches[0].id,
      },
      {
        name: "Carlos",
        last_name: "López",
        curp: "LOPC800101HDFXXX03",
        email: "carlos.lopez@test.com",
        password: "Test123!",
        role_id: 4,
        active: true,
        biometric: 1003,
        branch_id: existingBranches[0].id,
      },
      {
        name: "Ana",
        last_name: "Martínez",
        curp: "MARA800101HDFXXX04",
        email: "ana.martinez@test.com",
        password: "Test123!",
        role_id: 4,
        active: true,
        biometric: 1004,
        branch_id: existingBranches[0].id,
      },
      {
        name: "Roberto",
        last_name: "Hernández",
        curp: "HERR800101HDFXXX05",
        email: "roberto.hernandez@test.com",
        password: "Test123!",
        role_id: 4,
        active: true,
        biometric: 1005,
        branch_id: existingBranches[0].id,
      },
      {
        name: "Laura",
        last_name: "Rodríguez",
        curp: "RODL800101HDFXXX06",
        email: "laura.rodriguez@test.com",
        password: "Test123!",
        role_id: 4,
        active: true,
        biometric: 1006,
        branch_id: existingBranches[0].id,
      },
      {
        name: "Miguel",
        last_name: "Sánchez",
        curp: "SANM800101HDFXXX07",
        email: "miguel.sanchez@test.com",
        password: "Test123!",
        role_id: 4,
        active: true,
        biometric: 1007,
        branch_id: existingBranches[0].id,
      },
      {
        name: "Patricia",
        last_name: "Flores",
        curp: "FLOP800101HDFXXX08",
        email: "patricia.flores@test.com",
        password: "Test123!",
        role_id: 4,
        active: true,
        biometric: 1008,
        branch_id: existingBranches[0].id,
      },
    ];

    const createdUsers = [];
    for (const userData of testUsers) {
      const existingUser = await userRepository.findOne({
        where: { biometric: userData.biometric },
      });
      if (existingUser) {
        console.log(
          `⚠️  User with biometric ${userData.biometric} already exists`
        );
        createdUsers.push(existingUser);
      } else {
        const user = userRepository.create({
          ...userData,
          role: { id: userData.role_id },
        });
        const savedUser = await userRepository.save(user);
        createdUsers.push(savedUser);
        console.log(
          `✅ Created user: ${savedUser.name} ${savedUser.last_name} (Biometric: ${savedUser.biometric})`
        );
      }
    }

    // Crear patrols para testing
    console.log("\n🛡️  Creando patrols...");
    const testPatrols = [
      {
        name: "Ronda Matutina Principal",
        frequency: "diaria",
        active: true,
        branch: { id: existingBranches[0].id },
      },
      {
        name: "Ronda Vespertina Principal",
        frequency: "diaria",
        active: true,
        branch: { id: existingBranches[0].id },
      },
      {
        name: "Ronda Nocturna Principal",
        frequency: "diaria",
        active: true,
        branch: { id: existingBranches[0].id },
      },
      {
        name: "Ronda Matutina Secundaria",
        frequency: "diaria",
        active: true,
        branch: { id: existingBranches[0].id },
      },
      {
        name: "Ronda Vespertina Secundaria",
        frequency: "diaria",
        active: true,
        branch: { id: existingBranches[0].id },
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
        const patrol = patrolRepository.create(patrolData);
        const savedPatrol = await patrolRepository.save(patrol);
        createdPatrols.push(savedPatrol);
        console.log(`✅ Created patrol: ${savedPatrol.name}`);
      }
    }

    // Crear patrol assignments para diferentes escenarios
    console.log("\n📋 Creando patrol assignments...");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    console.log(`📅 Fechas de referencia:`);
    console.log(`- Ayer: ${yesterday.toDateString()}`);
    console.log(`- Hoy: ${today.toDateString()}`);
    console.log(`- Mañana: ${tomorrow.toDateString()}`);
    console.log(`- Pasado mañana: ${dayAfterTomorrow.toDateString()}`);

    const patrolAssignments = [
      // ESCENARIO 1: Usuario con turno matutino para hoy (sin record previo)
      {
        date: today,
        user: { id: createdUsers[0].id },
        patrol: { id: createdPatrols[0].id },
        shift: { id: existingShifts[0].id }, // Matutino
      },
      // ESCENARIO 2: Usuario con turno vespertino para hoy (sin record previo)
      {
        date: today,
        user: { id: createdUsers[1].id },
        patrol: { id: createdPatrols[1].id },
        shift: { id: existingShifts[1]?.id || existingShifts[0].id }, // Vespertino
      },
      // ESCENARIO 3: Usuario con turno nocturno para hoy (sin record previo)
      {
        date: today,
        user: { id: createdUsers[2].id },
        patrol: { id: createdPatrols[2].id },
        shift: { id: existingShifts[2]?.id || existingShifts[0].id }, // Nocturno
      },
      // ESCENARIO 4: Usuario con turno para mañana
      {
        date: tomorrow,
        user: { id: createdUsers[3].id },
        patrol: { id: createdPatrols[0].id },
        shift: { id: existingShifts[0].id },
      },
      // ESCENARIO 5: Usuario con turno para ayer (completado)
      {
        date: yesterday,
        user: { id: createdUsers[4].id },
        patrol: { id: createdPatrols[1].id },
        shift: { id: existingShifts[1]?.id || existingShifts[0].id },
      },
      // ESCENARIO 6: Usuario con turno matutino para mañana
      {
        date: tomorrow,
        user: { id: createdUsers[5].id },
        patrol: { id: createdPatrols[3].id },
        shift: { id: existingShifts[0].id },
      },
      // ESCENARIO 7: Usuario con turno vespertino para mañana
      {
        date: tomorrow,
        user: { id: createdUsers[6].id },
        patrol: { id: createdPatrols[4].id },
        shift: { id: existingShifts[1]?.id || existingShifts[0].id },
      },
      // ESCENARIO 8: Usuario con turno para pasado mañana
      {
        date: dayAfterTomorrow,
        user: { id: createdUsers[7].id },
        patrol: { id: createdPatrols[0].id },
        shift: { id: existingShifts[0].id },
      },
    ];

    const createdAssignments = [];
    for (const assignmentData of patrolAssignments) {
      const existingAssignment = await patrolAssignmentRepository.findOne({
        where: {
          user: { id: assignmentData.user.id },
          date: assignmentData.date,
        },
      });

      if (existingAssignment) {
        console.log(
          `⚠️  Assignment for user ${
            assignmentData.user.id
          } on ${assignmentData.date.toDateString()} already exists`
        );
        createdAssignments.push(existingAssignment);
      } else {
        const assignment = patrolAssignmentRepository.create(assignmentData);
        const savedAssignment = await patrolAssignmentRepository.save(
          assignment
        );
        createdAssignments.push(savedAssignment);
        console.log(
          `✅ Created assignment: User ${savedAssignment.user.id} -> Patrol ${
            savedAssignment.patrol.id
          } -> Shift ${
            savedAssignment.shift.id
          } on ${savedAssignment.date.toDateString()}`
        );
      }
    }

    // Crear algunos patrol records para diferentes escenarios
    console.log("\n📝 Creando patrol records...");

    const testPatrolRecords = [
      // ESCENARIO A: Record completado para ayer (usuario 5)
      {
        date: yesterday,
        actual_start: new Date(yesterday.getTime() + 8 * 60 * 60 * 1000), // 8:00 AM
        actual_end: new Date(yesterday.getTime() + 16 * 60 * 60 * 1000), // 4:00 PM
        status: "completado",
        patrolAssignment: { id: createdAssignments[4].id },
      },
      // ESCENARIO B: Record en progreso para hoy (usuario 1 - matutino)
      {
        date: today,
        actual_start: new Date(today.getTime() + 6 * 60 * 60 * 1000), // 6:00 AM
        status: "en_progreso",
        patrolAssignment: { id: createdAssignments[0].id },
      },
      // ESCENARIO C: Record completado para hoy (usuario 2 - vespertino)
      {
        date: today,
        actual_start: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2:00 PM
        actual_end: new Date(today.getTime() + 22 * 60 * 60 * 1000), // 10:00 PM
        status: "completado",
        patrolAssignment: { id: createdAssignments[1].id },
      },
      // ESCENARIO D: Record pendiente para hoy (usuario 3 - nocturno)
      {
        date: today,
        status: "pendiente",
        patrolAssignment: { id: createdAssignments[2].id },
      },
      // ESCENARIO E: Record pendiente para mañana (usuario 4)
      {
        date: tomorrow,
        status: "pendiente",
        patrolAssignment: { id: createdAssignments[3].id },
      },
      // ESCENARIO F: Record pendiente para mañana (usuario 6)
      {
        date: tomorrow,
        status: "pendiente",
        patrolAssignment: { id: createdAssignments[5].id },
      },
      // ESCENARIO G: Record pendiente para mañana (usuario 7)
      {
        date: tomorrow,
        status: "pendiente",
        patrolAssignment: { id: createdAssignments[6].id },
      },
      // ESCENARIO H: Record pendiente para pasado mañana (usuario 8)
      {
        date: dayAfterTomorrow,
        status: "pendiente",
        patrolAssignment: { id: createdAssignments[7].id },
      },
    ];

    for (const recordData of testPatrolRecords) {
      const existingRecord = await patrolRecordRepository.findOne({
        where: {
          patrolAssignment: { id: recordData.patrolAssignment.id },
          date: recordData.date,
        },
      });

      if (existingRecord) {
        console.log(
          `⚠️  Record for assignment ${
            recordData.patrolAssignment.id
          } on ${recordData.date.toDateString()} already exists`
        );
      } else {
        const record = patrolRecordRepository.create(recordData);
        const savedRecord = await patrolRecordRepository.save(record);
        console.log(
          `✅ Created patrol record: ${savedRecord.status} for assignment ${
            savedRecord.patrolAssignment.id
          } on ${savedRecord.date.toDateString()}`
        );
      }
    }

    console.log("\n=== RESUMEN DE DATOS CREADOS ===");
    console.log("👥 Usuarios con biometric:");
    createdUsers.forEach((user) => {
      console.log(
        `- ${user.name} ${user.last_name}: Biometric ID ${user.biometric}`
      );
    });

    console.log("\n🛡️  Patrols:");
    createdPatrols.forEach((patrol) => {
      console.log(`- ${patrol.name} (ID: ${patrol.id})`);
    });

    console.log("\n⏰ Shifts disponibles:");
    existingShifts.forEach((shift) => {
      console.log(
        `- ${
          shift.name
        }: ${shift.start_time.toTimeString()} - ${shift.end_time.toTimeString()}`
      );
    });

    console.log("\n=== ESCENARIOS DE PRUEBA ===");
    console.log(
      "1. Usuario 1001 (Juan): Turno matutino en progreso - puede terminar"
    );
    console.log(
      "2. Usuario 1002 (María): Turno vespertino completado - no puede hacer nada"
    );
    console.log(
      "3. Usuario 1003 (Carlos): Turno nocturno pendiente - puede iniciar"
    );
    console.log("4. Usuario 1004 (Ana): Sin asignación para hoy - error");
    console.log(
      "5. Usuario 1005 (Roberto): Turno completado ayer - puede iniciar hoy"
    );
    console.log(
      "6. Usuario 1006 (Laura): Asignación para mañana con record pendiente"
    );
    console.log(
      "7. Usuario 1007 (Miguel): Asignación para mañana con record pendiente"
    );
    console.log(
      "8. Usuario 1008 (Patricia): Asignación para pasado mañana con record pendiente"
    );

    console.log("\n=== EJEMPLOS DE PRUEBA ===");
    console.log("1. Iniciar turno (usuario 1003 - nocturno):");
    console.log(`POST /api/v1/shift-validation`);
    console.log(
      `Body: { "biometric": 1003, "timestamp": "2024-01-15T22:30:00.000Z" }`
    );

    console.log("\n2. Terminar turno (usuario 1001 - matutino):");
    console.log(`POST /api/v1/shift-validation`);
    console.log(
      `Body: { "biometric": 1001, "timestamp": "2024-01-15T14:30:00.000Z" }`
    );

    console.log("\n3. Usuario sin asignación (usuario 1004):");
    console.log(`POST /api/v1/shift-validation`);
    console.log(
      `Body: { "biometric": 1004, "timestamp": "2024-01-15T08:30:00.000Z" }`
    );

    console.log("\n4. Usuario con turno completado (usuario 1002):");
    console.log(`POST /api/v1/shift-validation`);
    console.log(
      `Body: { "biometric": 1002, "timestamp": "2024-01-15T15:30:00.000Z" }`
    );

    console.log("\n✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedShiftValidationRealData();
}
