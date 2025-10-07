"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationByIdController = getNotificationByIdController;
exports.getNotificationsController = getNotificationsController;
exports.deleteNotificationController = deleteNotificationController;
const notification_service_1 = require("../services/notification.service");
async function getNotificationByIdController(req, res, next) {
    const id = req.params.id;
    const { statusCode, data, message } = await (0, notification_service_1.getNotificationById)(id);
    res.status(statusCode).json({ data, message });
}
async function getNotificationsController(req, res, next) {
    const dto = req.query;
    const { statusCode, data } = await (0, notification_service_1.getNotifications)();
    res.status(statusCode).json({ data });
}
async function deleteNotificationController(req, res, next) {
    const id = req.params.id;
    const userId = req.user.sub;
    const { statusCode, data, message } = await (0, notification_service_1.deleteNotification)(id, userId);
    res.status(statusCode).json({ data, message });
}
