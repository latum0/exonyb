import { Router } from "express";

import {
  loginAdminHandler,
  refreshToken,
  verifyEmailController,
} from "../controllers/auth.controller";
import { LoginDto } from "../dto/auth.dto";
import { validateDto } from "../../middlewares/validateDto";

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
router.get("/verify-email", verifyEmailController);
export default router;
