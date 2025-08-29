import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncWrapper } from "../utils/asyncWrapper";
import {
    getLigneByCommandeController,
    getLigneByIdController,
    updateLignePrixUnitaireController,
} from "../controllers/ligneCommande.controller";
import { checkPermissions, Permission } from "../middlewares/permissions";
import { requireAdmin } from "../middlewares/requireAdmin";
import { validateDtoClient } from "../middlewares/validateDtoClient";
import { UpdatePrixUnitaireLigneDto } from "../dto/ligneCommande.dto";

const route = Router();

/**
 * @swagger
 * /lignes/{id}:
 *   patch:
 *     summary: Mettre à jour le prix unitaire d'une ligne (ADMIN requis)
 *     tags:
 *       - Lignes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ligne (idLigne)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePrixUnitaireLigneDto'
 *           example:
 *             prixUnitaire: "120.00"
 *     responses:
 *       '200':
 *         description: 'Prix unitaire mis à jour'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LigneResponseDto'
 *       '400':
 *         description: 'Prix unitaire invalide'
 *       '401':
 *         description: 'Non autorisé (token manquant ou invalide)'
 *       '403':
 *         description: 'Accès interdit (ADMIN requis)'
 *       '404':
 *         description: 'Ligne non trouvée'
 */
route.patch("/:id", authMiddleware, requireAdmin, validateDtoClient(UpdatePrixUnitaireLigneDto), asyncWrapper(updateLignePrixUnitaireController));

/**
 * @swagger
 * /lignes/byCommande/{id}:
 *   get:
 *     summary: Récupérer les lignes d'une commande (CONFIRMATEUR requis)
 *     tags:
 *       - Lignes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID (uuid) de la commande
 *     responses:
 *       '200':
 *         description: 'Liste des lignes de la commande'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LigneResponseDto'
 *       '401':
 *         description: 'Non autorisé'
 *       '403':
 *         description: 'Accès interdit'
 *       '404':
 *         description: 'Commande non trouvée'
 */
route.get(
    "/byCommande/:id",
    authMiddleware,
    checkPermissions([Permission.CONFIRMATEUR]),
    asyncWrapper(getLigneByCommandeController)
);

/**
 * @swagger
 * /lignes/{id}:
 *   get:
 *     summary: Récupérer une ligne par son ID (CONFIRMATEUR requis)
 *     tags:
 *       - Lignes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ligne (idLigne)
 *     responses:
 *       '200':
 *         description: 'Ligne trouvée'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LigneResponseDto'
 *       '401':
 *         description: 'Non autorisé'
 *       '403':
 *         description: 'Accès interdit'
 *       '404':
 *         description: 'Ligne non trouvée'
 */
route.get(
    "/:id",
    authMiddleware,
    checkPermissions([Permission.CONFIRMATEUR]),
    asyncWrapper(getLigneByIdController)
);

export default route;
