import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { requireAdmin } from "../../middlewares/requireAdmin";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { getLigneByCommandeController, getLigneByIdController, updateLignePrixUnitaireController } from "../controllers/ligneCommande.controller";



const route = Router();
route.patch("/:id", authMiddleware, requireAdmin, asyncWrapper(updateLignePrixUnitaireController))
route.get("/byCommande/:id", authMiddleware, requireAdmin, asyncWrapper(getLigneByCommandeController))
route.get("/:id", authMiddleware, requireAdmin, asyncWrapper(getLigneByIdController))



export default route;