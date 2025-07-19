import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Negocio Rondines",
      version: "1.0.0",
      description: "Documentación de la API para el sistema de rondines",
    },
    components: {
      schemas: {
        UserResponse: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            last_name: { type: "string" },
            curp: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            active: { type: "boolean" },
            biometric: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            deleted_at: { type: "string", format: "date-time", nullable: true },
          },
        },
        UserAllResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            users: {
              type: "array",
              items: { $ref: "#/components/schemas/UserResponse" },
            },
          },
        },
      },
    },
  },
  apis: [
    "./src/routes/*.ts",
    "./src/utils/validators/*.ts",
    "./src/controllers/*.ts",
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
export { swaggerUi };
