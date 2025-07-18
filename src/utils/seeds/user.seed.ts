import { AppDataSource } from "@configs/data-source";
import { User } from "@entities/user.entity";

export async function seedUsers() {
  const userRepository = AppDataSource.getRepository(User);

  console.log("User seeded successfully");
}
