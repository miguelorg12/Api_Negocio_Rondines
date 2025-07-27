import { AppDataSource } from "@configs/data-source";
import { Patrol } from "@entities/patrol.entity";

export async function seedPatrols() {
  const patrolRepository = AppDataSource.getRepository(Patrol);
  const patrols = [
    {
      name: "ronda_matutina",
      frequency: "diaria",
      active: true,
      branch: { id: 1 },
      //   checkpoints: [{ id: 1 }, { id: 2 }],
    },
    {
      name: "ronda_vespertina",
      frequency: "semanal",
      active: true,
      branch: { id: 3 },
      //   checkpoints: [{ id: 3 }, { id: 4 }],
    },
    {
      name: "ronda_nocturna",
      frequency: "mensual",
      active: false,
      branch: { id: 2 },
      //   checkpoints: [{ id: 5 }, { id: 6 }],
    },
  ];

  for (const patrolData of patrols) {
    const patrol = patrolRepository.create(patrolData);
    await patrolRepository.save(patrol);
  }

  console.log("Patrols seeded successfully");
}
