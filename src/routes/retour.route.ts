import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/requireAdmin";
import { CreateRetourDto, UpdateRetourDto } from "../dto/retour.dto";
import {
  createRetourController,
  deleteRetourController,
  filterRetoursController,
  getAllRetoursController,
  getretourByIdController,
  updateRetourController,
} from "../controllers/retour.controller";
import { asyncWrapper } from "../utils/asyncWrapper";
import { RetourFilterDto } from "../dto/retour-filter.dto";
import { validateDtoClient } from "../middlewares/validateDtoClient";
import { checkPermissions } from "../middlewares/permissions";
import { Permission } from "@prisma/client";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Retours
 *     description: Gestion des retours de commande
 */

/**
 * @swagger
 * /retours:
 *   post:
 *     summary: Créer un nouveau retour de commande
 *     tags:
 *       - Retours
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dateRetour
 *               - statutRetour
 *               - raisonRetour
 *               - commandeId
 *             properties:
 *               dateRetour:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-20T14:30:00Z"
 *               statutRetour:
 *                 type: string
 *                 example: "PENDING"
 *               raisonRetour:
 *                 type: string
 *                 example: "Produit défectueux"
 *               commandeId:
 *                 type: string
 *                 example: "cmd123abc"
 *     responses:
 *       '201':
 *         description: Retour créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Retour'
 *       '400':
 *         description: Données du retour invalides
 *       '401':
 *         description: Non autorisé
 *       '403':
 *         description: Accès interdit
 */
router.post(
  "/",
  authMiddleware,
  //@ts-ignore
  checkPermissions([Permission.SAV, Permission.AGENT_DE_STOCK]),
  validateDtoClient(CreateRetourDto),
  asyncWrapper(createRetourController)
);

/**
 * @swagger
 * /retours:
 *   get:
 *     summary: Récupérer tous les retours avec pagination
 *     tags:
 *       - Retours
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Numéro de page
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           example: 25
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date minimale de retour
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date maximale de retour
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche textuelle dans raisonRetour
 *     responses:
 *       '200':
 *         description: Liste paginée des retours
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Retour'
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
 *       '401':
 *         description: Non autorisé
 *       '403':
 *         description: Accès interdit
 */
router.get(
  "/",
  authMiddleware,
  //@ts-ignore
  checkPermissions([Permission.SAV, Permission.AGENT_DE_STOCK]),
  asyncWrapper(getAllRetoursController)
);

/**
 * @swagger
 * /retours/filter:
 *   post:
 *     summary: Filtrer les retours
 *     tags:
 *       - Retours
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RetourFilter'
 *     responses:
 *       '200':
 *         description: Retours filtrés
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Retour'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       '400':
 *         description: Données de filtre invalides
 *       '401':
 *         description: Non autorisé
 *       '403':
 *         description: Accès interdit
 */
router.post(
  "/filter",
  authMiddleware,
  //@ts-ignore
  checkPermissions([Permission.SAV, Permission.AGENT_DE_STOCK]),
  validateDtoClient(RetourFilterDto),
  asyncWrapper(filterRetoursController)
);

/**
 * @swagger
 * /retours/{id}:
 *   get:
 *     summary: Récupérer un retour par ID
 *     tags:
 *       - Retours
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du retour
 *     responses:
 *       '200':
 *         description: Retour trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Retour'
 *       '401':
 *         description: Non autorisé
 *       '403':
 *         description: Accès interdit
 *       '404':
 *         description: Retour non trouvé
 */
router.get(
  "/:id",
  authMiddleware,
  //@ts-ignore
  checkPermissions([Permission.SAV, Permission.AGENT_DE_STOCK]),
  asyncWrapper(getretourByIdController)
);

/**
 * @swagger
 * /retours/{id}:
 *   patch:
 *     summary: Mettre à jour un retour existant
 *     tags:
 *       - Retours
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du retour à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRetour'
 *     responses:
 *       '200':
 *         description: Retour mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Retour'
 *       '400':
 *         description: Données invalides
 *       '401':
 *         description: Non autorisé
 *       '403':
 *         description: Accès interdit
 *       '404':
 *         description: Retour non trouvé
 */
router.patch(
  "/:id",
  authMiddleware,
  //@ts-ignore
  checkPermissions([Permission.SAV, Permission.AGENT_DE_STOCK]),
  validateDtoClient(UpdateRetourDto),
  asyncWrapper(updateRetourController)
);

/**
 * @swagger
 * /retours/{id}:
 *   delete:
 *     summary: Supprimer un retour par ID
 *     tags:
 *       - Retours
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du retour à supprimer
 *     responses:
 *       '204':
 *         description: Retour supprimé avec succès (no content)
 *       '401':
 *         description: Non autorisé
 *       '403':
 *         description: Accès interdit
 *       '404':
 *         description: Retour non trouvé
 */
router.delete(
  "/:id",
  authMiddleware,
  //@ts-ignore
  checkPermissions([Permission.SAV, Permission.AGENT_DE_STOCK]),
  asyncWrapper(deleteRetourController)
);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Retour:
 *       type: object
 *       properties:
 *         idRetour:
 *           type: integer
 *           example: 123
 *         dateRetour:
 *           type: string
 *           format: date-time
 *           example: "2025-07-20T14:30:00Z"
 *         statutRetour:
 *           type: string
 *           example: "COMPLETED"
 *         raisonRetour:
 *           type: string
 *           example: "Produit incorrect livré"
 *         commandeId:
 *           type: string
 *           example: "cmd123abc"
 *     RetourFilter:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           example: 1
 *         perPage:
 *           type: integer
 *           example: 25
 *         dateFrom:
 *           type: string
 *           format: date-time
 *         dateTo:
 *           type: string
 *           format: date-time
 *         search:
 *           type: string
 *         statutRetour:
 *           type: string
 *           example: "PENDING"
 *     UpdateRetour:
 *       type: object
 *       properties:
 *         dateRetour:
 *           type: string
 *           format: date-time
 *         statutRetour:
 *           type: string
 *         raisonRetour:
 *           type: string
 *         commandeId:
 *           type: string
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 100
 *         page:
 *           type: integer
 *           example: 1
 *         perPage:
 *           type: integer
 *           example: 25
 *         totalPages:
 *           type: integer
 *           example: 4
 */
