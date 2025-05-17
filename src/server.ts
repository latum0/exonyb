import express, { Application } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./routes/auth.route";
import cookieParser from "cookie-parser";
const app: Application = express();
app.use(express.json());

app.use(cookieParser());

app.use("/auth", authRoutes);

app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}/`);
});
