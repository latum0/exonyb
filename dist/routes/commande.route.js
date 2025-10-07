"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const commande_dto_1 = require("../dto/commande.dto");
const commande_controller_1 = require("../controllers/commande.controller");
const asyncWrapper_1 = require("../utils/asyncWrapper");
const validateDtoClient_1 = require("../middlewares/validateDtoClient");
const permissions_1 = require("../middlewares/permissions");
const route = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     LigneResponseDto:
 *       type: object
 *       properties:
 *         idLigne:
 *           type: integer
 *           example: 1
 *         produitId:
 *           type: string
 *           format: uuid
 *           example: "83e7cfd1-b5c9-4ff2-a865-d1557143b10f"
 *         quantite:
 *           type: integer
 *           example: 2
 *         prixUnitaire:
 *           type: string
 *           example: "120.00"
 *     CommandeResponseDto:
 *       type: object
 *       properties:
 *         idCommande:
 *           type: string
 *           format: uuid
 *           example: "e7a1c2d3-4b5f-6a7b-8c9d-0e1f2a3b4c5d"
 *         dateCommande:
 *           type: string
 *           format: date-time
 *           example: "2025-08-25T16:40:00.000Z"
 *         statut:
 *           type: string
 *           example: "EN_ATTENTE"
 *         qrSVG:
 *           type: string
 *           nullable: true
 *           description: "QR code as SVG string (SVG XML content). May be null if not generated."
 *           example: "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>...</svg>"
 *         adresseLivraison:
 *           type: string
 *           example: "123 Rue de Paris, Alger"
 *         montantTotal:
 *           type: string
 *           example: "1200.00"
 *         clientId:
 *           type: integer
 *           example: 1
 *         client:
 *           type: string
 *           nullable: true
 *         ligne:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LigneResponseDto'
 */
/**
 * @swagger
 * /commandes:
 *   post:
 *     summary: Créer une nouvelle commande (CONFIRMATEUR requis)
 *     tags:
 *       - Commandes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommandeDto'
 *           example:
 *             dateCommande: "2025-08-25T16:40:00.000Z"
 *             statut: "EN_ATTENTE"
 *             adresseLivraison: "123 Rue de Paris, Alger"
 *             clientId: 1
 *             lignes:
 *               - quantite: 2
 *                 produitId: "83e7cfd1-b5c9-4ff2-a865-d1557143b10f"
 *               - quantite: 1
 *                 produitId: "91a5de21-7e3a-42c4-9e5b-0a9a0f4e9a33"
 *     responses:
 *       '201':
 *         description: 'Commande créée avec succès'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommandeResponseDto'
 *       '400':
 *         description: 'Données invalides (validation)'
 *       '401':
 *         description: 'Non autorisé (token manquant ou invalide)'
 *       '403':
 *         description: 'Accès interdit (droits insuffisants)'
 *       '409':
 *         description: 'Conflit (ex: stock insuffisant)'
 */
route.post("/", authMiddleware_1.authMiddleware, (0, permissions_1.checkPermissions)([permissions_1.Permission.CONFIRMATEUR]), (0, validateDtoClient_1.validateDtoClient)(commande_dto_1.CreateCommandeDto), (0, asyncWrapper_1.asyncWrapper)(commande_controller_1.createCommandeController));
/**
 * @swagger
 * /commandes:
 *   get:
 *     summary: Récupérer la liste des commandes (pagination & filtres) (CONFIRMATEUR requis)
 *     tags:
 *       - Commandes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page (>=1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Nombre d'éléments par page (max 100)
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: integer
 *         description: Filtrer par clientId
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *         description: Filtrer par statut de commande
 *       - in: query
 *         name: produitId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par produit présent dans la commande
 *       - in: query
 *         name: minTotal
 *         schema:
 *           type: number
 *         description: Montant minimum (montantTotal >= minTotal)
 *       - in: query
 *         name: maxTotal
 *         schema:
 *           type: number
 *         description: Montant maximum (montantTotal <= maxTotal)
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début (createdAt >= dateFrom)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin (createdAt <= dateTo)
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [dateCommande, montantTotal, clientId]
 *         description: Champ de tri
 *       - in: query
 *         name: orderDir
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Direction du tri
 *     responses:
 *       '200':
 *         description: Liste paginée des commandes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CommandeResponseDto'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       '401':
 *         description: Non autorisé
 *       '403':
 *         description: Accès interdit
 */
route.get("/", authMiddleware_1.authMiddleware, (0, permissions_1.checkPermissions)([permissions_1.Permission.CONFIRMATEUR]), (0, asyncWrapper_1.asyncWrapper)(commande_controller_1.getAllCommandesController));
/**
 * @swagger
 * /commandes/{id}:
 *   get:
 *     summary: Récupérer une commande par son ID (CONFIRMATEUR requis)
 *     tags:
 *       - Commandes
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
 *         description: Commande trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommandeResponseDto'
 *       '401':
 *         description: Non autorisé
 *       '403':
 *         description: Accès interdit
 *       '404':
 *         description: Commande non trouvée
 */
route.get("/:id", authMiddleware_1.authMiddleware, (0, permissions_1.checkPermissions)([permissions_1.Permission.CONFIRMATEUR]), (0, asyncWrapper_1.asyncWrapper)(commande_controller_1.getCommandeByIdController));
/**
 * @swagger
 * /commandes/{id}:
 *   delete:
 *     summary: Supprimer une commande par son ID (CONFIRMATEUR requis)
 *     tags:
 *       - Commandes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID (uuid) de la commande à supprimer
 *     responses:
 *       '200':
 *         description: Commande supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Commande supprimée"
 *       '401':
 *         description: Non autorisé
 *       '403':
 *         description: Accès interdit
 *       '404':
 *         description: Commande non trouvée
 */
route.delete("/:id", authMiddleware_1.authMiddleware, (0, permissions_1.checkPermissions)([permissions_1.Permission.CONFIRMATEUR]), (0, asyncWrapper_1.asyncWrapper)(commande_controller_1.deleteCommandeController));
/**
 * @swagger
 * /commandes/{id}:
 *   patch:
 *     summary: Mettre à jour une commande (statut, adresse, lignes) (CONFIRMATEUR requis)
 *     tags:
 *       - Commandes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID (uuid) de la commande
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCommandeDto'
 *           example:
 *             statut: "EN_COURS"
 *             adresseLivraison: "Nouvelle adresse 45, Alger"
 *             lignes:
 *               - op: "update"
 *                 produitId: "83e7cfd1-b5c9-4ff2-a865-d1557143b10f"
 *                 quantite: 3
 *               - op: "add"
 *                 produitId: "91a5de21-7e3a-42c4-9e5b-0a9a0f4e9a33"
 *                 quantite: 1
 *               - op: "remove"
 *                 produitId: "40b2..."
 *     responses:
 *       '200':
 *         description: 'Commande mise à jour'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommandeResponseDto'
 *       '400':
 *         description: 'Requête invalide (ex: op invalide, quantité manquante)'
 *       '401':
 *         description: 'Non autorisé'
 *       '403':
 *         description: 'Accès interdit'
 *       '404':
 *         description: 'Commande ou produit non trouvé'
 *       '409':
 *         description: 'Conflit (ex: stock insuffisant)'
 */
route.patch("/:id", authMiddleware_1.authMiddleware, (0, permissions_1.checkPermissions)([permissions_1.Permission.CONFIRMATEUR]), (0, validateDtoClient_1.validateDtoClient)(commande_dto_1.UpdateCommandeDto, "body"), (0, asyncWrapper_1.asyncWrapper)(commande_controller_1.updateCommandeController));
/**
 * @swagger
 * /commandes/{id}/montant:
 *   patch:
 *     summary: Mettre à jour le montant total d'une commande (ADMIN requis)
 *     tags:
 *       - Commandes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID (uuid) de la commande
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               montantTotal:
 *                 type: string
 *                 example: "1200.00"
 *           example:
 *             montantTotal: "1200.00"
 *     responses:
 *       '200':
 *         description: Montant mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommandeResponseDto'
 *       '400':
 *         description: Montant invalide
 *       '401':
 *         description: Non autorisé
 *       '403':
 *         description: Accès interdit (ADMIN requis)
 *       '404':
 *         description: Commande non trouvée
 */
route.patch("/:id/montant", authMiddleware_1.authMiddleware, (0, permissions_1.checkPermissions)([permissions_1.Permission.CONFIRMATEUR]), (0, asyncWrapper_1.asyncWrapper)(commande_controller_1.updateCommandeMontantController));
exports.default = route;
