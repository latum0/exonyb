"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = exports.swaggerSpec = void 0;
// src/swagger.ts
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Exony Admin API",
            version: "1.0.0",
            description: "Admin API for Exony - accounting, orders, notifications, users, etc."
        },
        // --- Paths: documented endpoints (POST create + PATCH update) ---
        paths: {
            "/accountings": {
                post: {
                    summary: "Create an accounting entry",
                    tags: ["Accounting"],
                    operationId: "createAccounting",
                    security: [{ bearerAuth: [] }],
                    description: "Create a new accounting row. Requires admin privileges. Numeric fields are decimal strings (0-2 fraction digits).",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/CreateAccountingDto" },
                                examples: {
                                    simple: {
                                        value: {
                                            achatProduits: "1200.50",
                                            ads: "300.00",
                                            emballage: "150.75",
                                            salaires: "2500.00",
                                            abonnementTel: "80.00",
                                            autre: "50.00",
                                            commentaire: "Monthly accounting report",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        "201": {
                            description: "Created - returns the created accounting",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/AccountingResponseDto" },
                                    examples: {
                                        created: {
                                            value: {
                                                id: 3,
                                                achatProduits: "1200.50",
                                                ads: "300.00",
                                                emballage: "150.75",
                                                abonnementTel: "80.00",
                                                autre: "50.00",
                                                salaires: "2500.00",
                                                commentaire: "Monthly accounting report",
                                                total: "4281.25",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Validation error / Bad Request",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
                        },
                        "401": {
                            description: "Unauthorized (missing/invalid token)",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
                        },
                        "403": {
                            description: "Forbidden (not admin)",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
                        },
                    },
                },
            },
            "/accountings/{id}": {
                patch: {
                    summary: "Update an accounting entry (partial)",
                    tags: ["Accounting"],
                    operationId: "updateAccounting",
                    security: [{ bearerAuth: [] }],
                    description: "Partially update an accounting row. Fields are optional; only provided fields will be updated. Requires admin privileges.",
                    parameters: [
                        {
                            name: "id",
                            in: "path",
                            required: true,
                            schema: { type: "integer", example: 1 },
                            description: "Numeric id of the accounting row to update",
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/UpdateAccountingDto" },
                                examples: {
                                    partial: {
                                        value: {
                                            achatProduits: "1300.00",
                                            commentaire: "Adjusted purchase cost",
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        "200": {
                            description: "OK - updated accounting row",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/AccountingResponseDto" },
                                    examples: {
                                        updated: {
                                            value: {
                                                id: 1,
                                                achatProduits: "1300.00",
                                                ads: "300.00",
                                                emballage: "150.75",
                                                abonnementTel: "80.00",
                                                autre: "50.00",
                                                salaires: "2500.00",
                                                commentaire: "Adjusted purchase cost",
                                                total: "4381.25",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Bad Request (invalid id or payload)",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
                        },
                        "401": {
                            description: "Unauthorized",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
                        },
                        "403": {
                            description: "Forbidden (not admin)",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
                        },
                        "404": {
                            description: "Not Found (accounting row doesn't exist)",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
                        },
                        "422": {
                            description: "Validation error (class-validator) - detailed",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: { type: "string", example: "ValidationError" },
                                            message: { type: "string", example: "Validation failed" },
                                            details: { type: "array", example: [{ property: "ads", constraints: { matches: "price must be a number" } }] },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        // --- Components: security + schemas (existing + new) ---
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                // --- previously provided schemas and many others (kept as-is) ---
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
                // --- User / Error schemas ---
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
                // ----------------- Accounting-specific schemas (previous + new) -----------------
                CreateAccountingDto: {
                    type: "object",
                    properties: {
                        achatProduits: {
                            type: "string",
                            pattern: "^\\d+(\\.\\d{1,2})?$",
                            example: "1200.50",
                            description: "Decimal string with up to 2 fraction digits"
                        },
                        ads: {
                            type: "string",
                            pattern: "^\\d+(\\.\\d{1,2})?$",
                            example: "300.00"
                        },
                        emballage: {
                            type: "string",
                            pattern: "^\\d+(\\.\\d{1,2})?$",
                            example: "150.75"
                        },
                        salaires: {
                            type: "string",
                            pattern: "^\\d+(\\.\\d{1,2})?$",
                            example: "2500.00"
                        },
                        abonnementTel: {
                            type: "string",
                            pattern: "^\\d+(\\.\\d{1,2})?$",
                            example: "80.00"
                        },
                        autre: {
                            type: "string",
                            pattern: "^\\d+(\\.\\d{1,2})?$",
                            example: "50.00"
                        },
                        commentaire: {
                            type: "string",
                            nullable: true,
                            example: "Monthly accounting report"
                        }
                    },
                    required: [
                        "achatProduits",
                        "ads",
                        "emballage",
                        "salaires",
                        "abonnementTel",
                        "autre"
                    ],
                    additionalProperties: false
                },
                AccountingResponseDto: {
                    type: "object",
                    properties: {
                        id: { type: "integer", example: 1 },
                        achatProduits: { type: "string", example: "1200.50" },
                        ads: { type: "string", example: "300.00" },
                        emballage: { type: "string", example: "150.75" },
                        abonnementTel: { type: "string", example: "80.00" },
                        autre: { type: "string", example: "50.00" },
                        salaires: { type: "string", example: "2500.00" },
                        commentaire: { type: "string", nullable: true, example: "Monthly accounting report" },
                        total: { type: "string", example: "4281.25" }
                    },
                    required: ["id", "achatProduits", "ads", "emballage", "abonnementTel", "autre", "salaires", "total"],
                    additionalProperties: false
                },
                UpdateAccountingDto: {
                    type: "object",
                    properties: {
                        achatProduits: {
                            type: "string",
                            pattern: "^\\d+(\\.\\d{1,2})?$",
                            example: "1300.00",
                            description: "Optional decimal string (up to 2 decimals)"
                        },
                        ads: {
                            type: "string",
                            pattern: "^\\d+(\\.\\d{1,2})?$",
                            example: "300.00"
                        },
                        emballage: {
                            type: "string",
                            pattern: "^\\d+(\\.\\d{1,2})?$",
                            example: "150.75"
                        },
                        salaires: {
                            type: "string",
                            pattern: "^\\d+(\\.\\d{1,2})?$",
                            example: "2500.00"
                        },
                        abonnementTel: {
                            type: "string",
                            pattern: "^\\d+(\\.\\d{1,2})?$",
                            example: "80.00"
                        },
                        autre: {
                            type: "string",
                            pattern: "^\\d+(\\.\\d{1,2})?$",
                            example: "50.00"
                        },
                        commentaire: {
                            type: "string",
                            nullable: true,
                            example: "Adjusted purchase cost"
                        }
                    },
                    additionalProperties: false,
                    description: "All fields optional — only provided fields will be updated."
                },
                // ------------------------------------------------------------------------
            },
        },
        security: [{ bearerAuth: [] }],
    },
    // swagger-jsdoc will also scan these globs for JSDoc comments (if you prefer route-level JSDoc)
    apis: ["./src/routes/**/*.ts", "./src/dto/*.ts"],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use("/", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(exports.swaggerSpec));
};
exports.setupSwagger = setupSwagger;
