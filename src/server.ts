import "reflect-metadata";
import "module-alias/register";

// Cargar el archivo de entorno correcto según NODE_ENV
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : process.env.NODE_ENV === "qa"
    ? ".env.qa"
    : ".env";

import { config } from "dotenv";
config({ path: envFile });

import app from "./app";
import { AppDataSource } from "./configs/data-source";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log(
      `Data Source has been initialized for ${
        process.env.NODE_ENV || "development"
      } environment!`
    );
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});
