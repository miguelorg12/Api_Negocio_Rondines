import { AppDataSource } from "@configs/data-source";
import { seedUsers } from "@utils/seeds/user.seed";
import { seedRoles } from "@utils/seeds/role.seed";
import { seedCompanies } from "@utils/seeds/company.seed";
import { seedBranches } from "@utils/seeds/branch.seed";

async function main() {
  await AppDataSource.initialize();
  await seedRoles();
  await seedUsers();
  await seedCompanies();
  await seedBranches();
  await AppDataSource.destroy();

  console.log("Seeding completed successfully.");
}

main().catch((error) => {
  console.error("Error during seeding:", error);
});
