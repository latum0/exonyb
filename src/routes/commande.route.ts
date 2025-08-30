import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/requireAdmin";
import { CreateCommandeDto, UpdateCommandeDto } from "../dto/commande.dto";
import { createCommandeController, deleteCommandeController, getAllCommandesController, getCommandeByIdController, updateCommandeController, updateCommandeMontantController } from "../controllers/commande.controller";
import { asyncWrapper } from "../utils/asyncWrapper";
import { validateDtoClient } from "../middlewares/validateDtoClient";
import { checkPermissions, Permission } from "../middlewares/permissions";




const route = Router();
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
route.post("/", authMiddleware, checkPermissions([Permission.CONFIRMATEUR]), validateDtoClient(CreateCommandeDto), asyncWrapper(createCommandeController))

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
route.get("/", authMiddleware, checkPermissions([Permission.CONFIRMATEUR]), asyncWrapper(getAllCommandesController))

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
route.get("/:id", authMiddleware, checkPermissions([Permission.CONFIRMATEUR]), asyncWrapper(getCommandeByIdController))

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
route.delete("/:id", authMiddleware, checkPermissions([Permission.CONFIRMATEUR]), asyncWrapper(deleteCommandeController))

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
route.patch("/:id", authMiddleware, checkPermissions([Permission.CONFIRMATEUR]), validateDtoClient(UpdateCommandeDto), asyncWrapper(updateCommandeController))

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
route.patch("/:id/montant", authMiddleware, checkPermissions([Permission.CONFIRMATEUR]), asyncWrapper(updateCommandeMontantController))



export default route;