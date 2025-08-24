import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/requireAdmin";
import { asyncWrapper } from "../utils/asyncWrapper";
import {
  getAllHistoriquesController,
  getHistoriqueByIdController,
  deleteHistoriqueByIdController,
  deleteOldHistoriquesController,
} from "../controllers/historique.controller";

const router = Router();

/**
 * @swagger
 * /historiques:
 *   get:
 *     summary: Récupérer la liste paginée et filtrée de tous les historiques
 *     tags:
 *       - Historiques
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Numéro de la page à récupérer
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           example: 25
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: acteur
 *         schema:
 *           type: string
 *           example: "John Doe"
 *         description: Filtrer par nom de l'acteur (recherche partielle)
 *       - in: query
 *         name: descriptionAction
 *         schema:
 *           type: string
 *           example: "Création du client"
 *         description: Filtrer par description de l'action (recherche partielle)
 *       - in: query
 *         name: utilisateurId
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Filtrer par ID de l'utilisateur
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-07-01"
 *         description: Filtrer les historiques à partir de cette date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-07-10"
 *         description: Filtrer les historiques jusqu'à cette date
 *     responses:
 *       200:
 *         description: Liste des historiques récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idHistorique:
 *                         type: integer
 *                         example: 1
 *                       dateModification:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-07-15T10:30:00Z"
 *                       descriptionAction:
 *                         type: string
 *                         example: "Création du client Jean Dupont"
 *                       acteur:
 *                         type: string
 *                         example: "John Doe"
 *                       utilisateurId:
 *                         type: integer
 *                         example: 1
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     perPage:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 4
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       403:
 *         description: Accès interdit (permissions insuffisantes)
 */
router.get(
  "/",
  authMiddleware,
  requireAdmin,
  asyncWrapper(getAllHistoriquesController)
);

/**
 * @swagger
 * /historiques/{id}:
 *   get:
 *     summary: Récupérer un historique par son ID
 *     tags:
 *       - Historiques
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'historique
 *     responses:
 *       200:
 *         description: Historique trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idHistorique:
 *                   type: integer
 *                   example: 1
 *                 dateModification:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-07-15T10:30:00Z"
 *                 descriptionAction:
 *                   type: string
 *                   example: "Création du client Jean Dupont"
 *                 acteur:
 *                   type: string
 *                   example: "John Doe"
 *                 utilisateurId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       403:
 *         description: Accès interdit (permissions insuffisantes)
 *       404:
 *         description: Historique non trouvé
 */
router.get(
  "/:id",
  authMiddleware,
  requireAdmin,
  asyncWrapper(getHistoriqueByIdController)
);

/**
 * @swagger
 * /historiques/old:
 *   delete:
 *     summary: Supprimer tous les historiques plus anciens que 7 jours
 *     tags:
 *       - Historiques
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historiques supprimés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted:
 *                   type: integer
 *                   example: 15
 *                   description: Nombre d'historiques supprimés
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       403:
 *         description: Accès interdit (permissions insuffisantes)
 */
router.delete(
  "/old",
  authMiddleware,
  requireAdmin,
  asyncWrapper(deleteOldHistoriquesController)
);

/**
 * @swagger
 * /historiques/{id}:
 *   delete:
 *     summary: Supprimer un historique par son ID
 *     tags:
 *       - Historiques
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'historique à supprimer
 *     responses:
 *       200:
 *         description: Historique supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Historique supprimé avec succès."
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       403:
 *         description: Accès interdit (permissions insuffisantes)
 *       404:
 *         description: Historique non trouvé
 */
router.delete(
  "/:id",
  authMiddleware,
  requireAdmin,
  asyncWrapper(deleteHistoriqueByIdController)
);

export default router;
