"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_dto_1 = require("../dto/auth.dto");
const validateDto_1 = require("../middlewares/validateDto");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary:  login
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDto'
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post(
  "/login",
  //@ts-ignore
  (0, validateDto_1.validateDto)(auth_dto_1.LoginDto),
  auth_controller_1.loginAdminHandler
);
/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token from cookie
 *     description: Returns a new access token if the refresh token is valid. The refresh token must be sent as an HTTP-only cookie.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: New access token successfully returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *       401:
 *         description: Refresh token missing in cookie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Refresh token missing
 *       403:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired refresh token
 */
router.post(
  "/refresh",
  //@ts-ignore
  auth_controller_1.refreshToken
);
/**
 * @openapi
 * /auth/verify-email:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Vérifie l'email à partir du lien reçu par email
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Le token JWT envoyé par email
 *     responses:
 *       200:
 *         description: Email vérifié avec succès
 *       400:
 *         description: Token invalide ou manquant
 *       404:
 *         description: Utilisateur introuvable
 */
router.get(
  "/verify-email",
  //@ts-ignore
  auth_controller_1.verifyEmailController
);
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Demander une réinitialisation de mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordDto'
 *     responses:
 *       200:
 *         description: Email envoyé
 *       404:
 *         description: Utilisateur non trouvé
 */
router.post(
  "/forgot-password",
  (0, validateDto_1.validateDto)(auth_dto_1.ForgotPasswordDto),
  auth_controller_1.forgotPassword
);
/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe avec le token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé
 */
router.post("/reset-password", auth_controller_1.resetPasswordController);
/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Changer le mot de passe (à l'interieur de l'application)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordDto'
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non autorisé
 */
router.post(
  "/change-password",
  authMiddleware_1.authMiddleware,
  //@ts-ignore
  auth_controller_1.handleChangePassword
);
/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données du profil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/UserProfileDto"
 *       401:
 *         description: Non autorisé
 */
router.get(
  "/profile",
  authMiddleware_1.authMiddleware,
  auth_controller_1.getProfile
);
exports.default = router;
