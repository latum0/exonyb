import { Router } from "express";
import { requireAdmin } from "../middlewares/requireAdmin";
import { CreateUserDto } from "../dto/user.dto";
import {
  createUserController,
  deleteUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserPermissionsController,
} from "../controllers/users.controller";
import { validateDto } from "../middlewares/validateDto";
import { authMiddleware } from "../middlewares/authMiddleware";
import { checkPermissions } from "../middlewares/permissions";
import { Permission } from "@prisma/client";

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
/**
 * @swagger
 * /users/all:
 *   get:
 *     tags:
 *       - Users
 *     summary: Récupérer la liste de tous les utilisateurs
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       email:
 *                         type: string
 *                         example: user@example.com
 *                       name:
 *                         type: string
 *                         example: "Jean Dupont"
 *                       phone:
 *                         type: string
 *                         example: "+33123456789"
 *
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: string
 *                       emailVerified:
 *                         type: boolean
 *                         example: true
 */
router.get("/all", authMiddleware, requireAdmin, getAllUsersController);
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get(
  "/:id",

  authMiddleware,
  requireAdmin,
  //@ts-ignore
  getUserByIdController
);

/**
 * @swagger
 * /users/{id}/permissions:
 *   patch:
 *     summary: Update user permissions
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       description: Array of permissions
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [AGENT_DE_STOCK, CONFIRMATEUR, SAV]
 *             example:
 *               permissions: ["AGENT_DE_STOCK", "SAV"]
 *     responses:
 *       200:
 *         description: Permissions updated
 *       400:
 *         description: Validation error or invalid ID
 *       500:
 *         description: Internal server error
 */
router.patch(
  "/:id/permissions",
  authMiddleware,
  requireAdmin,
  //@ts-ignore
  updateUserPermissionsController
);
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found

 */
router.delete("/:id", authMiddleware, requireAdmin, deleteUserController);
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Access commande - requires CONFIRMATEUR or ADMIN
 *     tags:
 *       - Commande
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted
 *       401:
 *         description: Unauthorized (no token or invalid)
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get(
  "/",
  authMiddleware,
  //@ts-ignore
  checkPermissions([Permission.CONFIRMATEUR]),
  (req, res) => {
    res.json({ message: "Access granted to commande" });
  }
);
export default router;
