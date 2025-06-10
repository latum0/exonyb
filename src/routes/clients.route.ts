// src/routes/clients.route.ts
import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { validateDtoClient } from "../../middlewares/validateDtoClient";
import { CreateClientDto, UpdateClientDto } from "../dto/client.dto";
import { requireAdmin } from "../../middlewares/requireAdmin";
import {
  createClientController,
  getAllClientsController,
  getClientByIdController,
  updateClientController,
  deleteClientController,
} from "../controllers/clients.controller";
import { checkPermissions, Permission } from "../../middlewares/permissions";

const router = Router();

/**
 * @swagger
 * /clients/create:
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
 *             $ref: '#/components/schemas/CreateClientDto'
 *     responses:
 *       201:
 *         description: Client créé
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès interdit
 */
router.post(
  "/create",
  authMiddleware,
  requireAdmin,
  validateDtoClient(CreateClientDto),
  createClientController
);

/**
 * @swagger
 * /clients/all:
 *   get:
 *     summary: Récupérer tous les clients
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des clients
 *       403:
 *         description: Accès interdit
 */
router.get("/all", authMiddleware, requireAdmin, getAllClientsController);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Récupérer un client par ID
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
 *       404:
 *         description: Client non trouvé
 */
router.get("/:id", authMiddleware, requireAdmin, getClientByIdController);

/**
 * @swagger
 * /clients/{id}:
 *   patch:
 *     summary: Mettre à jour un client
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateClientDto'
 *     responses:
 *       200:
 *         description: Client mis à jour
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Client non trouvé
 */
router.patch(
  "/:id",
  authMiddleware,
  requireAdmin,
  validateDtoClient(UpdateClientDto),
  updateClientController
);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Supprimer un client
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
 *         description: Client supprimé
 *       404:
 *         description: Client non trouvé
 */
router.delete("/:id", authMiddleware, requireAdmin, deleteClientController);


export default router;