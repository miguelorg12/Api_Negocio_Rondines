import "module-alias/register";
import app from "./app";
import { AppDataSource } from "./configs/data-source";
import { config, validateConfig } from "./configs/environment";

// Validar configuración al inicio
validateConfig();

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

app.listen(config.PORT, () => {
  console.log(
    `Server is running on port ${config.PORT} in ${config.NODE_ENV} mode`
  );
});
