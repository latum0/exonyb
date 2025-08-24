"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fournisseur_controller_1 = require("../controllers/fournisseur.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const requireAdmin_1 = require("../middlewares/requireAdmin");
const fournisseur_dto_1 = require("../dto/fournisseur.dto");
const asyncWrapper_1 = require("../utils/asyncWrapper");
const validateDtoClient_1 = require("../middlewares/validateDtoClient");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /fournisseurs:
 *   post:
 *     summary: Créer un nouveau fournisseur
 *     tags:
 *       - Fournisseurs
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
 *               - adresse
 *               - contact
 *               - telephone
 *               - email
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Société Fourniture SARL"
 *               adresse:
 *                 type: string
 *                 example: "456 Avenue Exemple, Oran"
 *               contact:
 *                 type: string
 *                 example: "Responsable Achats"
 *               telephone:
 *                 type: string
 *                 pattern: '^(\\+213|0)(5|6|7)[0-9]{8}$'
 *                 example: "+213612345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contact@fourniture.dz"
 *     responses:
 *       '201':
 *         description: Fournisseur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "f123abc"
 *                 nom:
 *                   type: string
 *                   example: "Société Fourniture SARL"
 *                 adresse:
 *                   type: string
 *                   example: "456 Avenue Exemple, Oran"
 *                 contact:
 *                   type: string
 *                   example: "Responsable Achats"
 *                 telephone:
 *                   type: string
 *                   example: "+213612345678"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "contact@fourniture.dz"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-10T08:30:00Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-12T14:45:00Z"
 *       '400':
 *         description: Données du fournisseur invalides
 *       '401':
 *         description: Non autorisé (token manquant ou invalide)
 *       '403':
 *         description: Accès interdit (droits insuffisants)
 */
router.post("/", authMiddleware_1.authMiddleware, requireAdmin_1.requireAdmin, (0, validateDtoClient_1.validateDtoClient)(fournisseur_dto_1.CreateFournisseurDto), (0, asyncWrapper_1.asyncWrapper)(fournisseur_controller_1.createFournisseurController));
/**
 * @swagger
 * /fournisseurs/{id}:
 *   patch:
 *     summary: Mettre à jour un fournisseur existant
 *     tags:
 *       - Fournisseurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du fournisseur à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Société Fourniture SARL"
 *               adresse:
 *                 type: string
 *                 example: "456 Avenue Exemple, Oran"
 *               contact:
 *                 type: string
 *                 example: "Responsable Achats"
 *               telephone:
 *                 type: string
 *                 pattern: '^(\\+213|0)(5|6|7)[0-9]{8}$'
 *                 example: "+213612345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contact@fourniture.dz"
 *     responses:
 *       '200':
 *         description: Fournisseur mis à jour avec succès
 *       '400':
 *         description: Données invalides
 *       '401':
 *         description: Non autorisé (token manquant ou invalide)
 *       '403':
 *         description: Accès interdit (droits insuffisants)
 *       '404':
 *         description: Fournisseur non trouvé
 */
router.patch("/:id", authMiddleware_1.authMiddleware, requireAdmin_1.requireAdmin, (0, validateDtoClient_1.validateDtoClient)(fournisseur_dto_1.UpdateFournisseurDto), (0, asyncWrapper_1.asyncWrapper)(fournisseur_controller_1.updateFournisseurController));
/**
 * @swagger
 * /fournisseurs:
 *   get:
 *     summary: Récupérer la liste de tous les fournisseurs
 *     tags:
 *       - Fournisseurs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Liste des fournisseurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "f123abc"
 *                   nom:
 *                     type: string
 *                     example: "Société Fourniture SARL"
 *                   adresse:
 *                     type: string
 *                     example: "456 Avenue Exemple, Oran"
 *                   contact:
 *                     type: string
 *                     example: "Responsable Achats"
 *                   telephone:
 *                     type: string
 *                     example: "+213612345678"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "contact@fourniture.dz"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-07-10T08:30:00Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-07-12T14:45:00Z"
 *       '401':
 *         description: Non autorisé (token manquant ou invalide)
 *       '403':
 *         description: Accès interdit (droits insuffisants)
 */
router.get("/", authMiddleware_1.authMiddleware, requireAdmin_1.requireAdmin, (0, asyncWrapper_1.asyncWrapper)(fournisseur_controller_1.getAllFournisseurController));
/**
 * @swagger
 * /fournisseurs/{id}:
 *   get:
 *     summary: Récupérer un fournisseur par son ID
 *     tags:
 *       - Fournisseurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du fournisseur
 *     responses:
 *       '200':
 *         description: Fournisseur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "f123abc"
 *                 nom:
 *                   type: string
 *                   example: "Société Fourniture SARL"
 *                 adresse:
 *                   type: string
 *                   example: "456 Avenue Exemple, Oran"
 *                 contact:
 *                   type: string
 *                   example: "Responsable Achats"
 *                 telephone:
 *                   type: string
 *                   example: "+213612345678"
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: "contact@fourniture.dz"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-10T08:30:00Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-12T14:45:00Z"
 *       '401':
 *         description: Non autorisé (token manquant ou invalide)
 *       '403':
 *         description: Accès interdit (droits insuffisants)
 *       '404':
 *         description: Fournisseur non trouvé
 */
router.get("/:id", authMiddleware_1.authMiddleware, requireAdmin_1.requireAdmin, (0, asyncWrapper_1.asyncWrapper)(fournisseur_controller_1.getFournisseurByIdController));
/**
 * @swagger
 * /fournisseurs/{id}:
 *   delete:
 *     summary: Supprimer un fournisseur par son ID
 *     tags:
 *       - Fournisseurs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du fournisseur à supprimer
 *     responses:
 *       '200':
 *         description: Fournisseur supprimé avec succès
 *       '401':
 *         description: Non autorisé (token manquant ou invalide)
 *       '403':
 *         description: Accès interdit (droits insuffisants)
 *       '404':
 *         description: Fournisseur non trouvé
 */
router.delete("/:id", authMiddleware_1.authMiddleware, requireAdmin_1.requireAdmin, (0, asyncWrapper_1.asyncWrapper)(fournisseur_controller_1.deleteFournisseurController));
exports.default = router;
