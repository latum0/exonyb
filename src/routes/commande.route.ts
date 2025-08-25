import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/requireAdmin";
import { CreateCommandeDto } from "../dto/commande.dto";
import { createCommandeController, deleteCommandeController, getAllCommandesController, getCommandeByIdController, updateCommandeController } from "../controllers/commande.controller";
import { asyncWrapper } from "../utils/asyncWrapper";
import { validateDtoClient } from "../middlewares/validateDtoClient";




const route = Router();

route.post("/", authMiddleware, requireAdmin, validateDtoClient(CreateCommandeDto), asyncWrapper(createCommandeController))
route.get("/:id", authMiddleware, requireAdmin, asyncWrapper(getCommandeByIdController))
route.get("/", authMiddleware, requireAdmin, asyncWrapper(getAllCommandesController))
route.delete("/:id", authMiddleware, requireAdmin, asyncWrapper(deleteCommandeController))
route.patch("/:id", authMiddleware, requireAdmin, asyncWrapper(updateCommandeController))



export default route;