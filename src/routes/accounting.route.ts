import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/requireAdmin";
import { validateDtoClient } from "../middlewares/validateDtoClient";
import { CreateAccountingDto, GetAccountingQueryDto, UpdateAccountingDto } from "../dto/accounting.dto";
import { createAccoutingController, getAllAccoutingController, getByIdAccoutingController, updateAccoutingController } from "../controllers/accounting.controller";
import { asyncWrapper } from "../utils/asyncWrapper";




const route = Router();

route.post("/", authMiddleware, requireAdmin, validateDtoClient(CreateAccountingDto), asyncWrapper(createAccoutingController))
route.get("/", authMiddleware, requireAdmin, asyncWrapper(getAllAccoutingController))
route.get("/:id", authMiddleware, requireAdmin, asyncWrapper(getByIdAccoutingController))
route.patch("/:id", authMiddleware, requireAdmin, validateDtoClient(UpdateAccountingDto), asyncWrapper(updateAccoutingController))


export default route;