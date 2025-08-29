import { Router } from "express";

import {
  forgotPassword,
  getProfile,
  handleChangePassword,
  loginAdminHandler,
  logoutController,
  refreshToken,
  resetPasswordController,
  updateProfileController,
  verifyEmailController,
} from "../controllers/auth.controller";
import { ForgotPasswordDto, LoginDto, UpdateProfileDto } from "../dto/auth.dto";
import { validateDto } from "../middlewares/validateDto";
import { authMiddleware } from "../middlewares/authMiddleware";
import { swaggerRouteDoc } from "../utils/waggerHelpers";
import { updateUserProfile } from "../services/auth.service";
import { asyncWrapper } from "../utils/asyncWrapper";

const router = Router();

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
  validateDto(LoginDto),
  loginAdminHandler
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
  refreshToken
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
  verifyEmailController
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

router.post("/forgot-password", validateDto(ForgotPasswordDto), forgotPassword);

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
router.post("/reset-password", resetPasswordController);
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
  authMiddleware,
  //@ts-ignore
  handleChangePassword
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
  authMiddleware,

  getProfile
);

/**
 * @swagger
 * /auth/profile:
 *   patch:
 *     summary: Met à jour le profil de l'utilisateur authentifié
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileDto'
 *           example:
 *             name: "Ali Ben"
 *             email: "ali.ben@example.com"
 *             phone: "+213612345678"
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request (invalid body)
 *       401:
 *         description: Non autorisé
 *       409:
 *         description: Conflit (email ou téléphone déjà utilisé)
 *       422:
 *         description: Erreur de validation (format email/téléphone invalide)
 *       500:
 *         description: Internal server error
 */


router.patch("/profile", authMiddleware, validateDto(UpdateProfileDto), asyncWrapper(updateProfileController))

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Déconnexion
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       401:
 *         description: Non autorisé
 */
router.post(
  "/logout",
  authMiddleware,
  //@ts-ignore
  logoutController
);

export default router;
