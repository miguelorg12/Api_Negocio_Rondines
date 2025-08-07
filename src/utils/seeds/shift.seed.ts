import { AppDataSource } from "@configs/data-source";
import { Shift } from "@interfaces/entity/shift.entity";

export async function seedShifts() {
  const shiftRepository = AppDataSource.getRepository(Shift);
  const shifts = [
    {
      name: "matutino",
      start_time: new Date("2023-01-01T07:00:00Z"),
      end_time: new Date("2023-01-01T17:00:00Z"),
    },
    {
      name: "vespertino",
      start_time: new Date("2023-01-01T17:00:00Z"),
      end_time: new Date("2023-01-01T23:00:00Z"),
    },
    {
      name: "nocturno",
      start_time: new Date("2023-01-01T23:00:00Z"),
      end_time: new Date("2023-01-02T06:00:00Z"),
    },
  ];

  for (const shiftData of shifts) {
    const shift = shiftRepository.create(shiftData);
    await shiftRepository.save(shift);
  }

  console.log("Shifts seeded successfully");
}
