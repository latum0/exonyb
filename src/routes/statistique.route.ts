import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncWrapper } from "../utils/asyncWrapper";
import {
    getCommandeStatsController,
    getPourcentageClientsParProduitController,
    getPourcentageRetoursParProduitController,
    getPourcentageRetoursCommandeController,
} from "../controllers/statistique.controller";
const route = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error class name
 *         message:
 *           type: string
 *           description: Human readable message
 *       required:
 *         - error
 *         - message
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         message:
 *           type: string
 *         details:
 *           type: array
 *           items:
 *             type: string
 *       required:
 *         - error
 *         - message
 *         - details
 *
 * tags:
 *   - name: Statistiques
 *     description: Statistical endpoints (commandes, clients, retours)
 */

/**
 * @swagger
 * /statistiques/commande:
 *   get:
 *     tags:
 *       - Statistiques
 *     summary: Percentage of commandes (optionally filtered by product and date ranges)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Window start (inclusive). ISO 8601 datetime.
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Window end (inclusive). ISO 8601 datetime.
 *       - in: query
 *         name: denominatorPeriodStart
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Denominator period start (optional).
 *       - in: query
 *         name: denominatorPeriodEnd
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Denominator period end (optional).
 *       - in: query
 *         name: produitId
 *         schema:
 *           type: string
 *         description: Optional product id to filter commandes that contain this product.
 *     responses:
 *       '200':
 *         description: Percentage result with raw counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 percentage:
 *                   type: number
 *                   format: float
 *                 windowCount:
 *                   type: integer
 *                 totalCount:
 *                   type: integer
 *               required:
 *                 - percentage
 *                 - windowCount
 *                 - totalCount
 *       '400':
 *         description: Bad request (BadRequestError)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized (no token or invalid token)
 *       '403':
 *         description: Forbidden - insufficient permissions
 *       '404':
 *         description: Not found (NotFoundError)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '409':
 *         description: Conflict (ConflictError)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '422':
 *         description: Validation failed (ValidationError)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
route.get(
    "/commande",
    authMiddleware,
    asyncWrapper(getCommandeStatsController)
);

/**
 * @swagger
 * /statistiques/client:
 *   get:
 *     tags:
 *       - Statistiques
 *     summary: Percentage of clients per product (and/or date)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: denominatorPeriodStart
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: denominatorPeriodEnd
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: produitId
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Percentage result with raw counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 percentage:
 *                   type: number
 *                 clientCountWindow:
 *                   type: integer
 *                 clientCountTotal:
 *                   type: integer
 *               required:
 *                 - percentage
 *                 - clientCountWindow
 *                 - clientCountTotal
 *       '400':
 *         description: Bad request (BadRequestError)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized (no token or invalid token)
 *       '403':
 *         description: Forbidden - insufficient permissions
 *       '422':
 *         description: Validation failed (ValidationError)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
route.get(
    "/client",
    authMiddleware,
    asyncWrapper(getPourcentageClientsParProduitController)
);

/**
 * @swagger
 * /statistiques/retour:
 *   get:
 *     tags:
 *       - Statistiques
 *     summary: Percentage of returns per product (share among returns)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: denominatorPeriodStart
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: denominatorPeriodEnd
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: produitId
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Percentage result with raw counts
 *       '400':
 *         description: Bad request (BadRequestError)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized (no token or invalid token)
 *       '403':
 *         description: Forbidden - insufficient permissions
 *       '422':
 *         description: Validation failed (ValidationError)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
route.get(
    "/retour",
    authMiddleware,
    asyncWrapper(getPourcentageRetoursParProduitController)
);

/**
 * @swagger
 * /statistiques/retour/commande:
 *   get:
 *     tags:
 *       - Statistiques
 *     summary: Returns (numerator) vs commandes (denominator) for a product/date range
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: denominatorPeriodStart
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: denominatorPeriodEnd
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: produitId
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Percentage result with raw counts
 *       '400':
 *         description: Bad request (BadRequestError)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized (no token or invalid token)
 *       '403':
 *         description: Forbidden - insufficient permissions
 *       '422':
 *         description: Validation failed (ValidationError)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
route.get(
    "/retour/commande",
    authMiddleware,
    asyncWrapper(getPourcentageRetoursCommandeController)
);

export default route;
