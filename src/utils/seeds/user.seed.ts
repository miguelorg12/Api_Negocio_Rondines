import { AppDataSource } from "@configs/data-source";
import { User } from "@entities/user.entity";

export async function seedUsers() {
  const userRepository = AppDataSource.getRepository(User);
  const users = [
    {
      name: "John",
      last_name: "Doe",
      curp: "JDOE123456HDFLNR01",
      email: "john@gmail.com",
      password: "Password123!",
      active: true,
      role: { id: 1 },
    },
    {
      name: "Jane",
      last_name: "Smith",
      curp: "JSMI234567MDFLNR02",
      email: "jane@gmail.com",
      password: "Password456!",
      active: true,
      role: { id: 2 },
    },
    {
      name: "Carlos",
      last_name: "Ramirez",
      curp: "CRAM345678HDFLNR03",
      email: "carlos@gmail.com",
      password: "Password789!",
      active: false,
      role: { id: 3 },
    },
    {
      name: "Ana",
      last_name: "Lopez",
      curp: "ALOP456789MDFLNR04",
      email: "ana@gmail.com",
      password: "Password321!",
      active: true,
      role: { id: 1 },
    },
    {
      name: "MiguelitoSexDeerOmgShit",
      last_name: "MiguelitoSexDeerOmgShit",
      curp: "MIGS456789HDFLNR05",
      email: "miguelvillalpando19@gmail.com",
      password: "pastelito123",
      active: true,
      role: { id: 1 },
    },
    {
      name: "vielmasexo",
      last_name: "vielmasex",
      curp: "VIEV456789HDFLNR06",
      email: "vielma7220@gmail.com",
      password: "vielmasex123",
      active: true,
      role: { id: 4 },
    },
    {
      name: "carlitosAWSOFTZZZWARE",
      last_name: "awsoftware",
      curp: "CAWS456789HDFLNR07",
      email: "carlosduron973@gmail.com",
      password: "carlos123sexo",
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
