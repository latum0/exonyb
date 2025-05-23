import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Exony Admin API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ForgotPasswordDto: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "exemple@mail.com",
            },
          },
          required: ["email"],
        },
        ChangePasswordDto: {
          type: "object",
          properties: {
            oldPassword: { type: "string", example: "AncienPass123!" },
            newPassword: {
              type: "string",
              example: "NouveauPass123!",
              minLength: 8,
            },
          },
          required: ["oldPassword", "newPassword"],
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts", "./src/dto/*.ts"], // selon où tu mets tes décorateurs Swagger
};

export const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
