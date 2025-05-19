import { Router } from "express";
import { requireAdmin } from "../../middlewares/requireAdmin";
import { CreateUserDto } from "../dto/user.dto";
import {
  createUserController,
  verifyEmailController,
} from "../controllers/users.controller";
import { validateDto } from "../../middlewares/validateDto";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();

/**
 * @swagger
 * /users/create:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone
 *
 *               - permissions
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "Aa@123456"
 *               phone:
 *                 type: string
 *                 example: "+213612345678"
 *
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum:
 *
 *                 example: ["AGENT_DE_STOCK", "CONFIRMATEUR"]
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès interdit
 */

router.post(
  "/create",
  //@ts-ignore
  authMiddleware,
  requireAdmin,
  validateDto(CreateUserDto),
  createUserController
);

export default router;
