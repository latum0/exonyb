"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../utils/upload");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const permissions_1 = require("../middlewares/permissions");
const produit_controller_1 = require("../controllers/produit.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /produits:
 *   post:
 *     tags:
 *       - Produits
 *     summary: Créer un produit (accessible par admin/agent de stock)
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 example: "Nike Air Max"
 *               description:
 *                 type: string
 *                 example: "Chaussures de sport légères"
 *               prix:
 *                 type: number
 *                 example: 120.5
 *               stock:
 *                 type: number
 *                 example: 50
 *               remise:
 *                 type: number
 *                 example: 10
 *               marque:
 *                 type: string
 *                 example: "Nike"
 *               categorie:
 *                 type: string
 *                 example: "Chaussures"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               fournisseurs:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 */
router.post("/", authMiddleware_1.authMiddleware, (0, permissions_1.checkPermissions)([permissions_1.Permission.AGENT_DE_STOCK]), upload_1.uploadProduitImages, 
//@ts-ignore
produit_controller_1.createProduitController);
/**
 * @swagger
 * /produits:
 *   get:
 *     summary: Récupérer tous les produits (accessible par admin/agent de stock)
 *     tags:
 *       - Produits
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page pour la pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: nom
 *         schema:
 *           type: string
 *         description: Filtrer par nom (recherche partielle)
 *       - in: query
 *         name: marque
 *         schema:
 *           type: string
 *         description: Filtrer par marque (recherche partielle)
 *       - in: query
 *         name: categorie
 *         schema:
 *           type: string
 *         description: Filtrer par catégorie (recherche partielle)
 *     responses:
 *       200:
 *         description: Liste des produits paginée (sans les images)
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
 *                       idProduit:
 *                         type: string
 *                       nom:
 *                         type: string
 *                       description:
 *                         type: string
 *                       prix:
 *                         type: number
 *                       stock:
 *                         type: integer
 *                       remise:
 *                         type: number
 *                       marque:
 *                         type: string
 *                       categorie:
 *                         type: string
 *                       qrCode:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *
 */
router.get("/", authMiddleware_1.authMiddleware, (0, permissions_1.checkPermissions)([permissions_1.Permission.AGENT_DE_STOCK]), produit_controller_1.getAllProduitsController);
/**
 * @swagger
 * /produits/{id}:
 *   get:
 *     summary: Récupérer un produit par ID (accessible par admin/agent de stock)
 *     tags:
 *       - Produits
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Détails complets du produit (y compris images et fournisseurs)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idProduit:
 *                   type: string
 *                 nom:
 *                   type: string
 *                 description:
 *                   type: string
 *                 prix:
 *                   type: number
 *                 stock:
 *                   type: integer
 *                 remise:
 *                   type: number
 *                 marque:
 *                   type: string
 *                 categorie:
 *                   type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                 qrCode:
 *                   type: string
 *                 fournisseurs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idFournisseur:
 *                         type: string
 *                       nom:
 *                         type: string
 *                       contact:
 *                         type: string
 *       404:
 *         description: Produit non trouvé
 */
router.get("/:id", authMiddleware_1.authMiddleware, (0, permissions_1.checkPermissions)([permissions_1.Permission.AGENT_DE_STOCK]), 
//@ts-ignore
produit_controller_1.getProduitByIdController);
/**
 * @swagger
 * /produits/{id}:
 *   put:
 *     summary: Mettre à jour un produit
 *     tags:
 *       - Produits
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du produit
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *               prix:
 *                 type: number
 *               stock:
 *                 type: integer
 *               remise:
 *                 type: number
 *               marque:
 *                 type: string
 *               categorie:
 *                 type: string
 *               keepImages:
 *                 type: string
 *                 example: '["dld1.png","old2.png"]'
 *               fournisseurs:
 *                 type: array
 *                 items:
 *                   type: number
 *                 example: [1,2]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Produit mis à jour avec succès
 *       404:
 *         description: Produit non trouvé ou fournisseurs non valides
 *       500:
 *         description: Erreur serveur
 */
router.put("/:id", authMiddleware_1.authMiddleware, (0, permissions_1.checkPermissions)([permissions_1.Permission.AGENT_DE_STOCK]), upload_1.uploadProduitImages, 
//@ts-ignore
produit_controller_1.updateProduitController);
/**
 * @swagger
 * /produits/{id}:
 *   delete:
 *     summary: Supprimer un produit (accessible par admin/agent de stock)
 *     tags:
 *       - Produits
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du produit à supprimer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produit supprimé avec succès
 *       404:
 *         description: Produit non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete("/:id", authMiddleware_1.authMiddleware, (0, permissions_1.checkPermissions)([permissions_1.Permission.AGENT_DE_STOCK]), 
//@ts-ignore
produit_controller_1.deleteProduitController);
exports.default = router;
