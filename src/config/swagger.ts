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

        // ------------ Commande / Ligne schemas ------------
        CreateLigneCommandeDto: {
          type: "object",
          properties: {
            quantite: { type: "integer", example: 2, minimum: 1 },
            produitId: { type: "string", format: "uuid", example: "83e7cfd1-b5c9-4ff2-a865-d1557143b10f" },
          },
          required: ["quantite", "produitId"],
        },

        CreateCommandeDto: {
          type: "object",
          properties: {
            dateCommande: { type: "string", format: "date-time", example: "2025-08-25T16:40:00.000Z" },
            statut: { type: "string", example: "EN_ATTENTE" },
            adresseLivraison: { type: "string", example: "123 Rue de Paris, Alger", maxLength: 200 },
            clientId: { type: "integer", example: 1 },
            lignes: { type: "array", items: { $ref: "#/components/schemas/CreateLigneCommandeDto" } },
          },
          required: ["statut", "adresseLivraison", "clientId", "lignes"],
        },

        UpdateLinePatchDto: {
          type: "object",
          properties: {
            op: { type: "string", enum: ["add", "update", "remove"], example: "update" },
            produitId: { type: "string", format: "uuid", example: "83e7cfd1-b5c9-4ff2-a865-d1557143b10f" },
            quantite: { type: "integer", example: 3, minimum: 1 },
          },
          required: ["op", "produitId"],
        },

        UpdateCommandeDto: {
          type: "object",
          properties: {
            statut: { type: "string", example: "EN_COURS" },
            adresseLivraison: { type: "string", example: "Nouvelle adresse 45, Alger", maxLength: 200 },
            clientId: { type: "integer", example: 1 },
            lignes: { type: "array", items: { $ref: "#/components/schemas/UpdateLinePatchDto" } },
          },
        },

        LigneResponseDto: {
          type: "object",
          properties: {
            idLigne: { type: "integer", example: 1 },
            produitId: { type: "string", format: "uuid", example: "83e7cfd1-b5c9-4ff2-a865-d1557143b10f" },
            quantite: { type: "integer", example: 2 },
            prixUnitaire: { type: "string", example: "120.00" },
            commandeId: { type: "string", format: "uuid", example: "f4b8c7d2-3e2a-4b5c-9f1e-123456789abc" },
          },
        },

        CommandeResponseDto: {
          type: "object",
          properties: {
            idCommande: { type: "string", format: "uuid", example: "f4b8c7d2-3e2a-4b5c-9f1e-123456789abc" },
            dateCommande: { type: "string", format: "date-time", example: "2025-08-25T16:40:00.000Z" },
            statut: { type: "string", example: "EN_ATTENTE" },
            adresseLivraison: { type: "string", example: "123 Rue de Paris, Alger" },
            montantTotal: { type: "string", example: "1200.00" },
            clientId: { type: "integer", example: 1 },
            ligne: { type: "array", items: { $ref: "#/components/schemas/LigneResponseDto" } },
          },
        },

        CommandeListResponseDto: {
          type: "object",
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/CommandeResponseDto" } },
            meta: {
              type: "object",
              properties: {
                total: { type: "integer", example: 42 },
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 10 },
                totalPages: { type: "integer", example: 5 },
              },
            },
          },
        },

        // --------- Ligne update/request DTOs ----------
        UpdatePrixUnitaireLigneDto: {
          type: "object",
          properties: {
            prixUnitaire: { type: "string", example: "120.00", description: "Format décimal avec 2 décimales en chaîne" },
          },
          required: ["prixUnitaire"],
        },

        UpdateQuantityLigneDto: {
          type: "object",
          properties: {
            quantite: { type: "integer", example: 3, minimum: 1 },
          },
          required: ["quantite"],
        },

        // ------------ Notification schemas ------------
        NotificationType: {
          type: "string",
          enum: ["OUT_OF_STOCK", "LOW_STOCK"],
        },

        CreateNotificationDto: {
          type: "object",
          properties: {
            produitId: { type: "string", format: "uuid", example: "83e7cfd1-b5c9-4ff2-a865-d1557143b10f" },
            type: { $ref: "#/components/schemas/NotificationType", example: "OUT_OF_STOCK" },
            message: { type: "string", example: "Produit 'X' en rupture de stock." },
          },
          required: ["produitId"],
        },

        UpdateNotificationDto: {
          type: "object",
          properties: {
            resolved: { type: "boolean", example: true },
            message: { type: "string", example: "Notification traitée manuellement." },
          },
        },

        NotificationResponseDto: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            produitId: { type: "string", format: "uuid" },
            type: { $ref: "#/components/schemas/NotificationType" },
            message: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            resolved: { type: "boolean" },
          },
        },

        NotificationListResponseDto: {
          type: "object",
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/NotificationResponseDto" } },
            meta: {
              type: "object",
              properties: {
                total: { type: "integer", example: 10 },
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 25 },
                totalPages: { type: "integer", example: 1 },
              },
            },
          },
        },

        // ------------ Profile / Auth related schemas (ADDED) ------------
        UpdateProfileDto: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Optional display name",
              example: "Ali Ben"
            },
            email: {
              type: "string",
              format: "email",
              description: "Optional email (must be unique)",
              example: "ali.ben@example.com"
            },
            phone: {
              type: "string",
              description: "Optional Algerian phone number. Accepts +213... or 0... formats.",
              example: "+213612345678",
              pattern: "^(\\+213|0)(5|6|7)[0-9]{8}$"
            }
          },
          additionalProperties: false
        },

        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Ali Ben" },
            email: { type: "string", format: "email", example: "ali.ben@example.com" },
            phone: { type: "string", example: "+213612345678" },
            role: { type: "string", example: "USER" },
            permissions: { type: "object", nullable: true, example: null },
            emailVerified: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time", example: "2025-08-29T12:00:00Z" },
            updatedAt: { type: "string", format: "date-time", example: "2025-08-29T12:05:00Z" }
          },
          required: ["id", "email", "name"]
        },

        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "BadRequestError" },
            message: { type: "string", example: "Message explicatif de l'erreur" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/**/*.ts", "./src/dto/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
