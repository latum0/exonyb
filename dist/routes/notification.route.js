"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const asyncWrapper_1 = require("../utils/asyncWrapper");
const route = (0, express_1.Router)();
/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Récupérer la liste des notifications (ADMIN requis)
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: 'Liste des notifications'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationListResponseDto'
 *       '401':
 *         description: 'Non autorisé'
 *       '403':
 *         description: 'Accès interdit (ADMIN requis)'
 */
route.get("/", authMiddleware_1.authMiddleware, (0, asyncWrapper_1.asyncWrapper)(notification_controller_1.getNotificationsController));
/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Récupérer une notification par son ID (ADMIN requis)
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID (uuid) de la notification
 *     responses:
 *       '200':
 *         description: 'Notification trouvée'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponseDto'
 *       '401':
 *         description: 'Non autorisé'
 *       '403':
 *         description: 'Accès interdit (ADMIN requis)'
 *       '404':
 *         description: 'Notification non trouvée'
 */
route.get("/:id", authMiddleware_1.authMiddleware, (0, asyncWrapper_1.asyncWrapper)(notification_controller_1.getNotificationByIdController));
/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Supprimer une notification (ADMIN requis)
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID (uuid) de la notification à supprimer
 *     responses:
 *       '200':
 *         description: 'Notification supprimée avec succès'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Notification supprimée avec succès."
 *       '401':
 *         description: 'Non autorisé'
 *       '403':
 *         description: 'Accès interdit (ADMIN requis)'
 *       '404':
 *         description: 'Notification non trouvée'
 */
route.delete("/:id", authMiddleware_1.authMiddleware, (0, asyncWrapper_1.asyncWrapper)(notification_controller_1.deleteNotificationController));
exports.default = route;
