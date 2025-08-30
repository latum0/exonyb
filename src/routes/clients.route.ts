import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validateDtoClient } from "../middlewares/validateDtoClient";
import { CreateClientDto, UpdateClientDto } from "../dto/client.dto";
import { requireAdmin } from "../middlewares/requireAdmin";
import {
  createClientController,
  getAllClientsController,
  getClientByIdController,
  updateClientController,
  deleteClientController,
  filterClientsController,
} from "../controllers/clients.controller";
import {
  addToBlacklistController,
  deleteFromBlacklistController,
  getAllBlacklistedClientsController,
  getBlacklistedClientsByIdController,
} from "../controllers/liste-noire.controller";

import { checkPermissions, Permission } from "../middlewares/permissions";
import { asyncWrapper } from "../utils/asyncWrapper";
import { ClientFilterDto } from "../dto/client-filter.dto";

const router = Router();
/**
 * @swagger
 * /clients/blacklist:
 *   get:
 *     summary: Récupérer la liste de tous les clients mis en liste noire
 *     tags:
 *       - Blacklist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des clients blacklistés récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idClient:
 *                     type: integer
 *                     example: 8
 *                   nom:
 *                     type: string
 *                     example: "sdaf"
 *                   prenom:
 *                     type: string
 *                     example: "John"
 *                   adresse:
 *                     type: string
 *                     example: "123 Rue Principale"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "john.doe@example.com"
 *                   numeroTelephone:
 *                     type: string
 *                     example: "+213700000000"
 *                   statut:
 *                     type: string
 *                     enum: [ACTIVE, BLACKLISTED]
 *                     example: "BLACKLISTED"
 *                   commentaires:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         contenu:
 *                           type: string
 *                           example: "Très bonne cliente, paiement rapide."
 *                         dateCreated:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-07-22T15:46:12.109Z"
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       403:
 *         description: Accès interdit (permissions insuffisantes)
 */
router.get(
  "/blacklist",
  authMiddleware,
  //@ts-ignore
  checkPermissions([Permission.SAV]),
  getAllBlacklistedClientsController
);

/**
 * @swagger
 * /clients/blacklist/{id}:
 *   get:
 *     summary: Récupérer un client blacklisté par son ID
 *     tags:
 *       - Blacklist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du client blacklisté
 *     responses:
 *       200:
 *         description: Client blacklisté trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idClient:
 *                   type: integer
 *                   example: 8
 *                 nom:
 *                   type: string
 *                   example: "sdaf"
 *                 prenom:
 *                   type: string
 *                   example: "John"
 *                 adresse:
 *                   type: string
 *                   example: "123 Rue Principale"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "john.doe@example.com"
 *                 numeroTelephone:
 *                   type: string
 *                   example: "+213700000000"
 *                 statut:
 *                   type: string
 *                   enum: [ACTIVE, BLACKLISTED]
 *                   example: "BLACKLISTED"
 *                 commentaires:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       contenu:
 *                         type: string
 *                         example: "Très bonne cliente, paiement rapide."
 *                       dateCreated:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-22T15:46:12.109Z"
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       403:
 *         description: Accès interdit (permissions insuffisantes)
 *       404:
 *         description: Client blacklisté non trouvé
 */
router.get(
  "/blacklist/:id",
  authMiddleware,
  checkPermissions([Permission.SAV]),
  asyncWrapper(getBlacklistedClientsByIdController)
);

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Créer un nouveau client
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - prenom
 *               - adresse
 *               - email
 *               - numeroTelephone
 *               - statut
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Dupont"
 *               prenom:
 *                 type: string
 *                 example: "Jean"
 *               adresse:
 *                 type: string
 *                 example: "123 Rue Exemple, Alger"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@example.com"
 *               numeroTelephone:
 *                 type: string
 *                 pattern: '^(\+213|0)(5|6|7)[0-9]{8}$'
 *                 example: "+213612345678"
 *               commentaires:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - contenu
 *                     - date
 *                   properties:
 *                     contenu:
 *                       type: string
 *                       example: "Premier commentaire du client"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-14T10:00:00Z"
 *                 description: Liste optionnelle de commentaires
 *               statut:
 *                 type: string
 *                 example: "actif"
 *     responses:
 *       '201':
 *         description: Client créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "c123abc"
 *                 nom:
 *                   type: string
 *                   example: "Dupont"
 *                 prenom:
 *                   type: string
 *                   example: "Jean"
 *                 adresse:
 *                   type: string
 *                   example: "123 Rue Exemple, Alger"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "jean.dupont@example.com"
 *                 numeroTelephone:
 *                   type: string
 *                   example: "+213612345678"
 *                 commentaires:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       contenu:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                 statut:
 *                   type: string
 *                   example: "actif"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-14T09:00:00Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-14T09:00:00Z"
 *       '400':
 *         description: Données du client invalides
 *       '401':
 *         description: Non autorisé (token manquant ou invalide)
 *       '403':
 *         description: Accès interdit (permissions insuffisantes)
 *       '422':
 *         description: Erreur de validation (détails en réponse)
 */

router.post(
  "/",
  authMiddleware,
  //@ts-ignore
  checkPermissions([Permission.SAV, Permission.CONFIRMATEUR]),
  validateDtoClient(CreateClientDto),
  asyncWrapper(createClientController)
);

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Récupérer la liste paginée et filtrée de tous les clients
 *     tags:
 *       - Clients
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
 *         name: search
 *         schema:
 *           type: string
 *           example: "Dupont"
 *         description: Recherche “contains” sur nom, prénom ou adresse
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *           example: "jean.dupont@example.com"
 *         description: Filtrer par email (exact)
 *       - in: query
 *         name: numeroTelephone
 *         schema:
 *           type: string
 *           example: "+213612345678"
 *         description: Filtrer par numéro de téléphone (exact)
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [ACTIVE, BLACKLISTED]
 *           example: ACTIVE
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des clients récupérée avec succès
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
 *                       idClient:
 *                         type: integer
 *                         example: 1
 *                       nom:
 *                         type: string
 *                         example: "Dupont"
 *                       prenom:
 *                         type: string
 *                         example: "Jean"
 *                       adresse:
 *                         type: string
 *                         example: "123 Rue Exemple, Alger"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "jean.dupont@example.com"
 *                       numeroTelephone:
 *                         type: string
 *                         example: "+213612345678"
 *                       statut:
 *                         type: string
 *                         enum: [ACTIVE, BLACKLISTED]
 *                         example: "ACTIVE"
 *                       commentaires:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             contenu:
 *                               type: string
 *                               example: "Commentaire…"
 *                             dateCreated:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-07-22T15:46:12.109Z"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-14T09:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-14T12:00:00Z"
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
  checkPermissions([Permission.SAV, Permission.CONFIRMATEUR]),
  asyncWrapper(getAllClientsController)
);

/**
 * @swagger
 * /clients/filter:
 *   post:
 *     summary: Récupérer la liste des clients correspondant à des filtres
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Critères de filtrage et pagination (tous champs optionnels)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               perPage:
 *                 type: integer
 *                 minimum: 1
 *                 example: 25
 *               nom:
 *                 type: string
 *                 example: "Dupont"
 *               prenom:
 *                 type: string
 *                 example: "Jean"
 *               adresse:
 *                 type: string
 *                 example: "123 Rue Exemple, Alger"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@example.com"
 *               numeroTelephone:
 *                 type: string
 *                 pattern: '^(\+213|0)(5|6|7)[0-9]{8}$'
 *                 example: "+213612345678"
 *               statut:
 *                 type: string
 *                 enum:
 *                   - ACTIVE
 *                   - BLACKLISTED
 *                 example: "ACTIVE"
 *     responses:
 *       '200':
 *         description: Liste des clients filtrés récupérée avec succès
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
 *                       idClient:
 *                         type: integer
 *                         example: 1
 *                       nom:
 *                         type: string
 *                         example: "Dupont"
 *                       prenom:
 *                         type: string
 *                         example: "Jean"
 *                       adresse:
 *                         type: string
 *                         example: "123 Rue Exemple, Alger"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "jean.dupont@example.com"
 *                       numeroTelephone:
 *                         type: string
 *                         example: "+213612345678"
 *                       statut:
 *                         type: string
 *                         enum:
 *                           - ACTIVE
 *                           - BLACKLISTED
 *                         example: "ACTIVE"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-14T09:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-14T12:00:00Z"
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
 *       '400':
 *         description: Filtre invalide (BadRequest)
 *       '401':
 *         description: Non autorisé (token manquant ou invalide)
 *       '403':
 *         description: Accès interdit (droits insuffisants)
 */

router.post(
  "/filter",
  authMiddleware,
  checkPermissions([Permission.SAV, Permission.CONFIRMATEUR]),
  validateDtoClient(ClientFilterDto),
  asyncWrapper(filterClientsController)
);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Récupérer un client par son ID
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du client
 *     responses:
 *       200:
 *         description: Client trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idClient:
 *                   type: integer
 *                   example: 1
 *                 nom:
 *                   type: string
 *                   example: "Dupont"
 *                 prenom:
 *                   type: string
 *                   example: "Jean"
 *                 adresse:
 *                   type: string
 *                   example: "123 Rue Exemple, Alger"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "jean.dupont@example.com"
 *                 numeroTelephone:
 *                   type: string
 *                   example: "+213612345678"
 *                 statut:
 *                   type: string
 *                   enum: [ACTIVE, BLACKLISTED]
 *                   example: "ACTIVE"
 *                 commentaires:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       contenu:
 *                         type: string
 *                         example: "Premier commentaire du client"
 *                       dateCreated:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-07-14T10:00:00Z"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-14T09:00:00Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-14T12:00:00Z"
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       403:
 *         description: Accès interdit (permissions insuffisantes)
 *       404:
 *         description: Client non trouvé
 */
router.get(
  "/:id",
  authMiddleware,
  checkPermissions([Permission.SAV, Permission.CONFIRMATEUR]),
  asyncWrapper(getClientByIdController)
);

/**
 * @swagger
 * /clients/{id}:
 *   patch:
 *     summary: Mettre à jour un client existant
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du client à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Dupont"
 *               prenom:
 *                 type: string
 *                 example: "Jean"
 *               adresse:
 *                 type: string
 *                 example: "123 Rue Exemple, Alger"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@example.com"
 *               numeroTelephone:
 *                 type: string
 *                 pattern: '^(\+213|0)(5|6|7)[0-9]{8}$'
 *                 example: "+213612345678"
 *               commentaires:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - contenu
 *                     - date
 *                   properties:
 *                     contenu:
 *                       type: string
 *                       example: "Commentaire mis à jour"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-15T14:30:00Z"
 *               statut:
 *                 type: string
 *                 example: "inactif"
 *     responses:
 *       '200':
 *         description: Client mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "c123abc"
 *                 nom:
 *                   type: string
 *                   example: "Dupont"
 *                 prenom:
 *                   type: string
 *                   example: "Jean"
 *                 adresse:
 *                   type: string
 *                   example: "123 Rue Exemple, Alger"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "jean.dupont@example.com"
 *                 numeroTelephone:
 *                   type: string
 *                   example: "+213612345678"
 *                 commentaires:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       contenu:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                 statut:
 *                   type: string
 *                   example: "inactif"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-14T09:00:00Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-15T14:30:00Z"
 *       '400':
 *         description: Données du client invalides
 *       '401':
 *         description: Non autorisé (token manquant ou invalide)
 *       '403':
 *         description: Accès interdit (permissions insuffisantes)
 *       '404':
 *         description: Client non trouvé
 */

router.patch(
  "/:id",
  authMiddleware,
  //@ts-ignore
  checkPermissions([Permission.SAV], [Permission.CONFIRMATEUR]),
  validateDtoClient(UpdateClientDto),
  asyncWrapper(updateClientController)
);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Supprimer un client par son ID
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du client à supprimer
 *     responses:
 *       '200':
 *         description: Client supprimé avec succès
 *       '401':
 *         description: Non autorisé (token manquant ou invalide)
 *       '403':
 *         description: Accès interdit (permissions insuffisantes)
 *       '404':
 *         description: Client non trouvé
 */

router.delete(
  "/:id",
  authMiddleware,
  //@ts-ignore
  checkPermissions([Permission.SAV, Permission.CONFIRMATEUR]),
  asyncWrapper(deleteClientController)
);

/**
 * @swagger
 * /clients/addBlacklist/{id}:
 *   patch:
 *     summary: Ajouter un client à la liste noire
 *     tags:
 *       - Blacklist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du client à blacklister
 *     responses:
 *       '201':
 *         description: Client ajouté à la liste noire avec succès
 *       '400':
 *         description: Requête invalide
 *       '401':
 *         description: Non autorisé (token manquant ou invalide)
 *       '403':
 *         description: Accès interdit (permissions insuffisantes)
 *       '404':
 *         description: Client non trouvé
 */

router.patch(
  "/addBlacklist/:id",
  authMiddleware,
  //@ts-ignore
  checkPermissions([Permission.SAV]),
  asyncWrapper(addToBlacklistController)
);

/**
 * @swagger
 * /clients/deleteBlacklist/{id}:
 *   patch:
 *     summary: Retirer un client de la liste noire
 *     tags:
 *       - Blacklist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du client à retirer de la liste noire
 *     responses:
 *       '200':
 *         description: Client retiré de la liste noire avec succès
 *       '400':
 *         description: Requête invalide
 *       '401':
 *         description: Non autorisé (token manquant ou invalide)
 *       '403':
 *         description: Accès interdit (permissions insuffisantes)
 *       '404':
 *         description: Client blacklisté non trouvé
 */
router.patch(
  "/deleteBlacklist/:id",
  authMiddleware,
  //@ts-ignore
  checkPermissions([Permission.SAV]),
  asyncWrapper(deleteFromBlacklistController)
);

export default router;
