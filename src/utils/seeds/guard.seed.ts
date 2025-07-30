import { AppDataSource } from "@configs/data-source";
import { User } from "@entities/user.entity";

export async function seedGuards() {
  const userRepository = AppDataSource.getRepository(User);
  const guards = [
    {
      name: "guard1",
      last_name: "Doe",
      curp: "JDOE123456HDFLNR01",
      email: "guard1@gmail.com",
      password: "Password123!",
      active: true,
      role: { id: 4 },
      branches: [{ id: 1 }],
    },
    {
      name: "guard2",
      last_name: "Smith",
      curp: "JSMI234567MDFLNR02",
      email: "guard2@gmail.com",
      password: "Password456!",
      active: true,
      role: { id: 4 },
      branches: [{ id: 2 }],
    },
    {
      name: "guard3",
      last_name: "Ramirez",
      curp: "CRAM345678HDFLNR03",
      email: "guard3@gmail.com",
      password: "Password789!",
      active: false,
      role: { id: 4 },
      branches: [{ id: 3 }],
    },
    {
      name: "guard4",
      last_name: "Lopez",
      curp: "ALOP456789MDFLNR04",
      email: "guard4@gmail.com",
      password: "Password321!",
      active: true,
      role: { id: 4 },
      branches: [{ id: 4 }],
    },
  ];

  for (const userData of guards) {
    const user = userRepository.create(userData);
    await userRepository.save(user);
  }

  console.log("Guard seeded successfully");
}
