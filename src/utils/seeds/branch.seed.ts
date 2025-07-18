import { AppDataSource } from "@configs/data-source";
import { Branch } from "@entities/branch.entity";

export async function seedBranches() {
  const branchRepository = AppDataSource.getRepository(Branch);
  const branches = [
    {
      name: "Main Branch",
      address: "123 Main St, City, Country",
      company: { id: 1 },
      user: { id: 1 },
    },
    {
      name: "Secondary Branch",
      address: "456 Secondary St, City, Country",
      company: { id: 1 },
      user: { id: 2 },
    },
  ];

  for (const branchData of branches) {
    const branch = branchRepository.create(branchData);
    await branchRepository.save(branch);
  }

  console.log("Branches seeded successfully");
}
