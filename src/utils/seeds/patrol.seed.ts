import { AppDataSource } from "@configs/data-source";
import { Patrol } from "@entities/patrol.entity";

export async function seedPatrols() {
  const patrolRepository = AppDataSource.getRepository(Patrol);
  const patrols = [
    {
      name: "ronda_matutina",
      active: true,
      branch: { id: 1 },
    },
    {
      name: "ronda_vespertina",
      active: true,
      branch: { id: 3 },
    },
    {
      name: "ronda_nocturna",
      active: false,
      branch: { id: 2 },
    },
  ];

  for (const patrolData of patrols) {
    const patrol = patrolRepository.create(patrolData);
    await patrolRepository.save(patrol);
  }

  console.log("Patrols seeded successfully");
}
