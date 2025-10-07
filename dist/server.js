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
const statistique_route_1 = __importDefault(require("./routes/statistique.route"));
const retour_route_1 = __importDefault(require("./routes/retour.route"));
const historique_route_1 = __importDefault(require("./routes/historique.route"));
const commande_route_1 = __importDefault(require("./routes/commande.route"));
const ligneCommande_route_1 = __importDefault(require("./routes/ligneCommande.route"));
const accounting_route_1 = __importDefault(require("./routes/accounting.route"));
const notification_route_1 = __importDefault(require("./routes/notification.route"));
const historiqueCleanup_1 = require("./jobs/historiqueCleanup");
const produit_route_1 = __importDefault(require("./routes/produit.route"));
const error_handler_1 = require("./middlewares/error-handler");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: "https://exonyf.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
}));
app.use("/auth", auth_route_1.default);
app.use("/users", users_route_1.default);
app.use("/clients", clients_route_1.default);
app.use("/fournisseurs", fournisseur_route_1.default);
app.use("/retours", retour_route_1.default);
app.use("/historiques", historique_route_1.default);
app.use("/commandes", commande_route_1.default);
app.use("/lignes", ligneCommande_route_1.default);
app.use("/notifications", notification_route_1.default);
app.use("/produits", produit_route_1.default);
app.use("/statistiques", statistique_route_1.default);
app.use("/accountings", accounting_route_1.default);
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "..", "public")));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use("/", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.use(error_handler_1.errorHandler);
(0, historiqueCleanup_1.scheduleHistoriqueCleanup)(process.env.HISTO_CLEANUP_CRON);
const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}/`);
});
