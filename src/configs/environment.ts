import dotenv from "dotenv";
import path from "path";

// Cargar el archivo de configuración según el entorno
const loadEnvironmentConfig = () => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const envFile = path.resolve(process.cwd(), `env.${nodeEnv}`);

  try {
    dotenv.config({ path: envFile });
    console.log(`Loaded environment configuration for: ${nodeEnv}`);
  } catch (error) {
    console.warn(`Could not load ${envFile}, using default .env`);
    dotenv.config();
  }
};

loadEnvironmentConfig();

// Configuración centralizada
export const config = {
  // Entorno
  NODE_ENV: process.env.NODE_ENV || "development",

  // Servidor
  PORT: parseInt(process.env.PORT || "3000", 10),

  // Base de datos
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT || "5432", 10),
  DB_USERNAME: process.env.DB_USERNAME || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "password",
  DB_DATABASE: process.env.DB_DATABASE || "ronditrack_dev",

  // Configuraciones adicionales
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  ENABLE_SWAGGER: process.env.ENABLE_SWAGGER === "true",
  ENABLE_LOGGING: process.env.ENABLE_LOGGING === "true",

  // AWS (si usas S3)
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
};

// Validación de configuración
export const validateConfig = () => {
  const requiredFields = [
    "DB_HOST",
    "DB_USERNAME",
    "DB_PASSWORD",
    "DB_DATABASE",
  ];

  const missingFields = requiredFields.filter(
    (field) => !config[field as keyof typeof config]
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingFields.join(", ")}`
    );
  }
};

// Configuraciones específicas por entorno
export const isDevelopment = config.NODE_ENV === "development";
export const isQA = config.NODE_ENV === "qa";
export const isProduction = config.NODE_ENV === "production";

export default config;
