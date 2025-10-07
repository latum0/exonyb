import "reflect-metadata";
import express, { Application, Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./routes/auth.route";
import usersRoutes from "./routes/users.route";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import clientsRoutes from "./routes/clients.route";
import fournisseursRoutes from "./routes/fournisseur.route";
import statistiquesRoutes from "./routes/statistique.route";
import retoursRoutes from "./routes/retour.route";
import historiquesRoutes from "./routes/historique.route";
import commandesRoutes from "./routes/commande.route";
import ligneRoutes from "./routes/ligneCommande.route";
import accountingRoutes from "./routes/accounting.route";

import notifRoutes from "./routes/notification.route";
import { scheduleHistoriqueCleanup } from "./jobs/historiqueCleanup";
import produitsRoutes from "./routes/produit.route";
import { errorHandler } from "./middlewares/error-handler";

const app: Application = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/clients", clientsRoutes);
app.use("/fournisseurs", fournisseursRoutes);
app.use("/retours", retoursRoutes);
app.use("/historiques", historiquesRoutes);
app.use("/commandes", commandesRoutes);
app.use("/lignes", ligneRoutes);
app.use("/notifications", notifRoutes);
app.use("/produits", produitsRoutes);
app.use("/statistiques", statistiquesRoutes);
app.use("/accountings", accountingRoutes)

app.use(((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://exonyf.onrender.com");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
}) as express.RequestHandler);


app.use("/public", express.static(path.join(__dirname, "..", "public")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(errorHandler);

scheduleHistoriqueCleanup(process.env.HISTO_CLEANUP_CRON);

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}/`);
});
