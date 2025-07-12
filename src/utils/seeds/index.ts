import { AppDataSource } from "../../configs/data-source";
import { seedUsers } from "./user.seed";

async function main(){
    await AppDataSource.initialize();
    await seedUsers();
    await AppDataSource.destroy();
    console.log("Seeding completed successfully.");
}

main().catch((error) => {
    console.error("Error during seeding:", error);
});