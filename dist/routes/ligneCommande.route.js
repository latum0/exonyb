"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const asyncWrapper_1 = require("../utils/asyncWrapper");
const ligneCommande_controller_1 = require("../controllers/ligneCommande.controller");
const permissions_1 = require("../middlewares/permissions");
const requireAdmin_1 = require("../middlewares/requireAdmin");
const validateDtoClient_1 = require("../middlewares/validateDtoClient");
const ligneCommande_dto_1 = require("../dto/ligneCommande.dto");
const route = (0, express_1.Router)();
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
route.patch("/:id", authMiddleware_1.authMiddleware, requireAdmin_1.requireAdmin, (0, validateDtoClient_1.validateDtoClient)(ligneCommande_dto_1.UpdatePrixUnitaireLigneDto), (0, asyncWrapper_1.asyncWrapper)(ligneCommande_controller_1.updateLignePrixUnitaireController));
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
route.get("/byCommande/:id", authMiddleware_1.authMiddleware, (0, permissions_1.checkPermissions)([permissions_1.Permission.CONFIRMATEUR]), (0, asyncWrapper_1.asyncWrapper)(ligneCommande_controller_1.getLigneByCommandeController));
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
route.get("/:id", authMiddleware_1.authMiddleware, (0, permissions_1.checkPermissions)([permissions_1.Permission.CONFIRMATEUR]), (0, asyncWrapper_1.asyncWrapper)(ligneCommande_controller_1.getLigneByIdController));
exports.default = route;
