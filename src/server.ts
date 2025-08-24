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

import retoursRoutes from "./routes/retour.route";
import historiquesRoutes from "./routes/historique.route";
import produitsRoutes from "./routes/produit.route";
import cron from "node-cron";
import { deleteOldHistoriques } from "./services/historique.service";
import { errorHandler } from "./middlewares/error-handler";

const app: Application = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
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
app.use("/produits", produitsRoutes);

app.use("/public", express.static(path.join(__dirname, "..", "public")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(errorHandler);

cron.schedule("0 0 * * *", async () => {
  try {
    const result = await deleteOldHistoriques();
    if (result.count > 0) {
      console.log(`Deleted ${result.count} historiques older than 7 days.`);
    }
  } catch (err) {
    console.error("Error running historique cleanup job:", err);
  }
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}/`);
});
