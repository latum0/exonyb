import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { requireAdmin } from "../middlewares/requireAdmin";
import { validateDtoClient } from "../middlewares/validateDtoClient";
import { CreateAccountingDto, UpdateAccountingDto } from "../dto/accounting.dto";
import { createAccoutingController, getAccountingsBydatePuppeteerController, getAllAccoutingController, getByIdAccoutingController, updateAccoutingController } from "../controllers/accounting.controller";
import { asyncWrapper } from "../utils/asyncWrapper";
import { IntervalDateDto } from "../dto/BaseFilter.dto";




const route = Router();
/**
 * @openapi
 * /accountings:
 *   post:
 *     summary: Create an accounting entry
 *     tags:
 *       - Accounting
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Create a new accounting row. Requires admin privileges.
 *       All numeric fields are sent as decimal strings with 0-2 fraction digits (e.g. "1200.50").
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAccountingDto'
 *           examples:
 *             simple:
 *               value:
 *                 achatProduits: "1200.50"
 *                 ads: "300.00"
 *                 emballage: "150.75"
 *                 salaires: "2500.00"
 *                 abonnementTel: "80.00"
 *                 autre: "50.00"
 *                 commentaire: "Monthly accounting report"
 *     responses:
 *       '201':
 *         description: Created - returns the created accounting
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountingResponseDto'
 *             examples:
 *               created:
 *                 value:
 *                   id: 3
 *                   achatProduits: "1200.50"
 *                   ads: "300.00"
 *                   emballage: "150.75"
 *                   abonnementTel: "80.00"
 *                   autre: "50.00"
 *                   salaires: "2500.00"
 *                   commentaire: "Monthly accounting report"
 *                   total: "4281.25"
 *       '400':
 *         description: Validation error / Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized (missing/invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Forbidden (not admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

route.post("/", authMiddleware, requireAdmin, validateDtoClient(CreateAccountingDto), asyncWrapper(createAccoutingController))

/**
 * @swagger
 * /accountings:
 *   get:
 *     summary: Get all accounting entries
 *     description: Retrieve a paginated list of accounting records with optional filters.
 *     tags:
 *       - Accounting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           example: 10
 *         description: Number of items per page (default 10, max 100)
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *           example: 5
 *         description: Filter by accounting ID
 *       - in: query
 *         name: minTotal
 *         schema:
 *           type: number
 *           example: 1000
 *         description: Minimum total filter
 *       - in: query
 *         name: maxTotal
 *         schema:
 *           type: number
 *           example: 5000
 *         description: Maximum total filter
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *         description: Filter by creation date (from)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-12-31"
 *         description: Filter by creation date (to)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "Monthly report"
 *         description: Search in commentaire (case-insensitive)
 *     responses:
 *       200:
 *         description: List of accounting entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accountings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AccountingResponseDto'
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 total:
 *                   type: integer
 *                   example: 42
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *       400:
 *         description: Invalid query parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
route.get("/", authMiddleware, requireAdmin, asyncWrapper(getAllAccoutingController))
route.get("/report", authMiddleware, requireAdmin, validateDtoClient(IntervalDateDto), asyncWrapper(getAccountingsBydatePuppeteerController))

/**
 * @swagger
 * /accountings/{id}:
 *   get:
 *     summary: Get an accounting entry by ID
 *     description: Returns a single accounting record with totals and details.
 *     tags:
 *       - Accounting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The ID of the accounting entry
 *     responses:
 *       200:
 *         description: Accounting entry found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountingResponseDto'
 *       400:
 *         description: Invalid accounting ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Accounting entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
route.get("/:id", authMiddleware, requireAdmin, asyncWrapper(getByIdAccoutingController))
route.patch("/:id", authMiddleware, requireAdmin, validateDtoClient(UpdateAccountingDto), asyncWrapper(updateAccoutingController))



export default route;