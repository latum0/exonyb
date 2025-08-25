import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { requireAdmin } from "../../middlewares/requireAdmin";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { deleteNotificationController, getNotificationByIdController, getNotificationsController } from "../controllers/notification.controller";



const route = Router();
route.get("/", authMiddleware, requireAdmin, asyncWrapper(getNotificationsController))
route.get("/:id", authMiddleware, requireAdmin, asyncWrapper(getNotificationByIdController))
route.delete("/:id", authMiddleware, requireAdmin, asyncWrapper(deleteNotificationController))



export default route;