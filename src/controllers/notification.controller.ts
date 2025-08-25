import { Request, Response, NextFunction } from "express";
import {
    getNotificationById,
    getNotifications,
    deleteNotification
} from "../services/notification.service";
import { NotificationQueryDto } from "../dto/notification.dto";

export async function getNotificationByIdController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const id = req.params.id as string;
    const { statusCode, data, message } = await getNotificationById(id);
    res.status(statusCode).json({ data, message });
}

export async function getNotificationsController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const dto = req.query as NotificationQueryDto;

    const { statusCode, data } = await getNotifications();
    res.status(statusCode).json({ data });
}

export async function deleteNotificationController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const id = req.params.id as string;
    const userId = (req.user as { sub: number }).sub;

    const { statusCode, data, message } = await deleteNotification(id, userId);
    res.status(statusCode).json({ data, message });
}
