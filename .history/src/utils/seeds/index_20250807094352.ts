import { AppDataSource } from "@configs/data-source";
import { seedUsers } from "@utils/seeds/user.seed";
import { seedRoles } from "@utils/seeds/role.seed";
import { seedCompanies } from "@utils/seeds/company.seed";
import { seedBranches } from "@utils/seeds/branch.seed";
import { seedClients } from "@utils/seeds/client.seed";
import { seedGuards } from "@utils/seeds/guard.seed";
import { seedShifts } from "@utils/seeds/shift.seed";
import { seedPatrols } from "@utils/seeds/patrol.seed";
import { seedPatrolAssignments } from "@utils/seeds/patrol_assigment.seed";
import { seedShiftValidationRealData } from "./shift_validation_real_data.seed";
import { seedIncidents } from "@utils/seeds/incident.seed";
import { seedCheckpoints } from "@utils/seeds/checkpoint.seed";
import { seedPatrolRoutePoints } from "./patrol_route_point.seed";
import { seedCheckpointRecords } from "./checkpoint_record.seed";

async function main() {
  await AppDataSource.initialize();
  await seedClients();
  await seedRoles();
  await seedUsers();
  await seedCompanies();
  await seedBranches();
  await seedCheckpoints();
  await seedGuards();
  await seedShifts();
  await seedPatrols();
  await seedPatrolAssignments();
  await seedShiftValidationRealData();
  await seedIncidents();

  await AppDataSource.destroy();

  console.log("Seeding completed successfully.");
}

main().catch((error) => {
  console.error("Error during seeding:", error);
});
