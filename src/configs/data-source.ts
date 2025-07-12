import 'dotenv/config';
import { DataSource } from "typeorm";
import { User } from "../interfaces/entity/user.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false,
    logging: true,
    entities: [User],
    subscribers: [],
        migrations: [__dirname + '/../utils/migrations/*.{ts,js}'],
})
