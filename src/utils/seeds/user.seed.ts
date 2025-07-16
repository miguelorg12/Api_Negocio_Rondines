import { AppDataSource } from "@configs/data-source";
import { User } from "@entities/user.entity";

export async function seedUsers() {
  const userRepository = AppDataSource.getRepository(User);
  // const user = userRepository.create({
  //   name: "Admin",
  //   last_name: "Principal",
  //   curp: "XEXX010101HNEXXXA0",
  //   email: "admin@demo.com",
  //   password: "admin123",
  //   role_id: 1,
  //   active: true,
  //   biometric: "",
  // });
  // await userRepository.save(user);
  console.log("User seeded successfully");
}
