import { Router } from "express";
import {
    deleteNotificationController,
    getNotificationByIdController,
    getNotificationsController,
} from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncWrapper } from "../utils/asyncWrapper";

const route = Router();

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
route.get("/", authMiddleware, asyncWrapper(getNotificationsController));

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
route.get("/:id", authMiddleware, asyncWrapper(getNotificationByIdController));

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
route.delete("/:id", authMiddleware, asyncWrapper(deleteNotificationController));

export default route;
