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
import fournisseursRoutes from "./routes/fournisseur.route"
import { errorHandler } from "../middlewares/error-handler";
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
app.use("/fournisseurs", fournisseursRoutes)

app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(errorHandler);

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}/`);
});
