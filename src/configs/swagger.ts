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
        ValidationErrorItem: {
          type: "object",
          properties: {
            type: { type: "string", example: "field" },
            value: { type: ["string", "number", "boolean", "null"] },
            msg: { type: "string", example: "El nombre es obligatorio" },
            path: { type: "string", example: "name" },
            location: { type: "string", example: "body" },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Error en la validación de datos",
            },
            errors: {
              type: "array",
              items: { $ref: "#/components/schemas/ValidationErrorItem" },
            },
          },
        },
        Role: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            last_name: { type: "string" },
            curp: { type: "string" },
            email: { type: "string" },
            active: { type: "boolean" },
            biometric: { type: "string" },
            role: { $ref: "#/components/schemas/Role" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            deleted_at: { type: "string", format: "date-time", nullable: true },
          },
        },
        UserCreateRequest: {
          type: "object",
          required: [
            "name",
            "last_name",
            "curp",
            "email",
            "password",
            "biometric",
            "role_id",
          ],
          properties: {
            name: { type: "string" },
            last_name: { type: "string" },
            curp: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            biometric: { type: "string" },
            role_id: { type: "integer" },
          },
        },
        Shift: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            start_time: { type: "string", format: "time" },
            end_time: { type: "string", format: "time" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            deleted_at: { type: "string", format: "date-time", nullable: true },
          },
        },
        Patrol: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: {
              type: "string",
              enum: ["ronda_matutina", "ronda_vespertina", "ronda_nocturna"],
            },
            frequency: {
              type: "string",
              enum: ["diaria", "semanal", "mensual"],
            },
            active: { type: "boolean" },
            branch_id: { type: "integer", nullable: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            deleted_at: { type: "string", format: "date-time", nullable: true },
          },
        },
        PatrolCreateRequest: {
          type: "object",
          required: ["name", "frequency", "branch_id"],
          properties: {
            name: {
              type: "string",
              enum: ["ronda_matutina", "ronda_vespertina", "ronda_nocturna"],
            },
            frequency: {
              type: "string",
              enum: ["diaria", "semanal", "mensual"],
            },
            branch_id: { type: "integer" },
          },
        },
        Company: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            address: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            deleted_at: { type: "string", format: "date-time", nullable: true },
          },
        },
        CompanyCreateRequest: {
          type: "object",
          required: ["name", "address", "email", "phone"],
          properties: {
            name: { type: "string" },
            address: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
          },
        },
        Branch: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            address: { type: "string" },
            company_id: { type: "integer" },
            user_id: { type: "integer" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            deleted_at: { type: "string", format: "date-time", nullable: true },
          },
        },
        BranchCreateRequest: {
          type: "object",
          required: ["name", "address", "company_id", "user_id"],
          properties: {
            name: { type: "string" },
            address: { type: "string" },
            company_id: { type: "integer" },
            user_id: { type: "integer" },
          },
        },
        Checkpoint: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            nfc_uid: { type: "string" },
            x: { type: "number" },
            y: { type: "number" },
            plan_id: { type: "integer" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            deleted_at: { type: "string", format: "date-time", nullable: true },
          },
        },
        CheckpointCreateRequest: {
          type: "object",
          required: ["name", "x", "y", "branch_id"],
          properties: {
            name: { type: "string" },
            nfc_uid: { type: "string" },
            x: { type: "number" },
            y: { type: "number" },
            branch_id: { type: "integer" },
          },
        },
        PatrolAssignment: {
          type: "object",
          properties: {
            id: { type: "integer" },
            date: { type: "string", format: "date-time" },
            user: { $ref: "#/components/schemas/UserResponse" },
            patrol: { $ref: "#/components/schemas/Patrol" },
            shift: { $ref: "#/components/schemas/Shift" },
            deleted_at: { type: "string", format: "date-time", nullable: true },
          },
        },
        PatrolAssignmentCreateRequest: {
          type: "object",
          required: ["user_id", "patrol_id", "shift_id", "date"],
          properties: {
            user_id: { type: "integer" },
            patrol_id: { type: "integer" },
            shift_id: { type: "integer" },
            date: { type: "string", format: "date-time" },
          },
        },
        GuardResponse: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            last_name: { type: "string" },
            curp: { type: "string" },
            email: { type: "string" },
            active: { type: "boolean" },
            role: { $ref: "#/components/schemas/Role" },
            branches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" },
                },
              },
            },
          },
        },
        GuardCreateRequest: {
          type: "object",
          required: [
            "name",
            "last_name",
            "curp",
            "email",
            "password",
            "role_id",
            "active",
            "biometric",
            "branch_id",
          ],
          properties: {
            name: { type: "string" },
            last_name: { type: "string" },
            curp: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            role_id: { type: "integer" },
            active: { type: "boolean" },
            biometric: { type: "string" },
            branch_id: { type: "integer" },
          },
        },
        GuardPatrolAssignment: {
          type: "object",
          properties: {
            id: { type: "integer" },
            date: { type: "string", format: "date-time" },
            patrol: {
              type: "object",
              properties: {
                id: { type: "integer" },
                name: { type: "string" },
              },
            },
            shift: {
              type: "object",
              properties: {
                id: { type: "integer" },
                name: { type: "string" },
              },
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
