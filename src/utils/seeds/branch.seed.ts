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
    {
      name: "Tertiary Branch",
      address: "789 Tertiary St, City, Country",
      company: { id: 2 },
      user: { id: 3 },
    },
    {
      name: "Quaternary Branch",
      address: "101 Quaternary St, City, Country",
      company: { id: 2 },
      user: { id: 4 },
    },
  ];

  for (const branchData of branches) {
    const branch = branchRepository.create(branchData);
    await branchRepository.save(branch);
  }

  console.log("Branches seeded successfully");
}
