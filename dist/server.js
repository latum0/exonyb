"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const users_route_1 = __importDefault(require("./routes/users.route"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const clients_route_1 = __importDefault(require("./routes/clients.route"));
const fournisseur_route_1 = __importDefault(require("./routes/fournisseur.route"));
const retour_route_1 = __importDefault(require("./routes/retour.route"));
const historique_route_1 = __importDefault(require("./routes/historique.route"));
const produit_route_1 = __importDefault(require("./routes/produit.route"));
const node_cron_1 = __importDefault(require("node-cron"));
const historique_service_1 = require("./services/historique.service");
const error_handler_1 = require("./middlewares/error-handler");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
}));
app.use("/auth", auth_route_1.default);
app.use("/users", users_route_1.default);
app.use("/clients", clients_route_1.default);
app.use("/fournisseurs", fournisseur_route_1.default);
app.use("/retours", retour_route_1.default);
app.use("/historiques", historique_route_1.default);
app.use("/produits", produit_route_1.default);
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "..", "public")));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use("/", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.use(error_handler_1.errorHandler);
node_cron_1.default.schedule("0 0 * * *", async () => {
    try {
        const result = await (0, historique_service_1.deleteOldHistoriques)();
        if (result.count > 0) {
            console.log(`Deleted ${result.count} historiques older than 7 days.`);
        }
    }
    catch (err) {
        console.error("Error running historique cleanup job:", err);
    }
});
const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}/`);
});
