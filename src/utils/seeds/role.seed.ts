import { AppDataSource } from "@configs/data-source";
import { Role } from "@interfaces/entity/role.entity";

export async function seedRoles() {
  const roleRepository = AppDataSource.getRepository(Role);

  const roles = [
    { name: "SuperAdmin" },
    { name: "CompanyAdmin" },
    { name: "BranchAdmin" },
    { name: "Guard" },
    { name: "Viewer" },
  ];

  for (const roleData of roles) {
    const role = roleRepository.create(roleData);
    await roleRepository.save(role);
  }

  console.log("Roles seeded successfully");
}
