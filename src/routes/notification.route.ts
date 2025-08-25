import { Router } from "express";
import { deleteNotificationController, getNotificationByIdController, getNotificationsController } from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/requireAdmin";
import { asyncWrapper } from "../utils/asyncWrapper";



const route = Router();
route.get("/", authMiddleware, requireAdmin, asyncWrapper(getNotificationsController))
route.get("/:id", authMiddleware, requireAdmin, asyncWrapper(getNotificationByIdController))
route.delete("/:id", authMiddleware, requireAdmin, asyncWrapper(deleteNotificationController))



export default route;