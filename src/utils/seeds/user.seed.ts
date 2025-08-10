import { AppDataSource } from "@configs/data-source";
import { User } from "@entities/user.entity";

export async function seedUsers() {
  const userRepository = AppDataSource.getRepository(User);

  console.log("Iniciando seeder de usuarios...");
  const users = [
    {
      name: "Miguel",
      last_name: "Villalpando",
      curp: "MIGS456789HDFLNR05",
      email: "miguelvillalpando19@gmail.com",
      password: "pastelito123",
      active: true,
      role: { id: 1 },
    },
    {
      name: "vielma",
      last_name: "vielma",
      curp: "VIEV456789HDFLNR06",
      email: "vielma7220@gmail.com",
      password: "vielmasex123",
      active: true,
      role: { id: 4 },
    },
    {
      name: "Carlos",
      last_name: "Duron",
      curp: "CAWS456789HDFLNR07",
      email: "carlosduron973@gmail.com",
      password: "carlos123sexo",
      active: true,
      role: { id: 1 },
    },
    {
      name: "Fernando",
      last_name: "Garcia",
      curp: "FENG456789HDFLNR08",
      email: "fgolmos10@gmail.com",
      password: "fernando123",
      active: true,
      role: { id: 1 },
    },
  ];

  for (const userData of users) {
    const user = userRepository.create(userData);
    await userRepository.save(user);
  }

  console.log("User seeded successfully");
}
