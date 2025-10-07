"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const requireAdmin_1 = require("../middlewares/requireAdmin");
const validateDtoClient_1 = require("../middlewares/validateDtoClient");
const accounting_dto_1 = require("../dto/accounting.dto");
const accounting_controller_1 = require("../controllers/accounting.controller");
const asyncWrapper_1 = require("../utils/asyncWrapper");
const BaseFilter_dto_1 = require("../dto/BaseFilter.dto");
const route = (0, express_1.Router)();
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
route.post("/", authMiddleware_1.authMiddleware, requireAdmin_1.requireAdmin, (0, validateDtoClient_1.validateDtoClient)(accounting_dto_1.CreateAccountingDto), (0, asyncWrapper_1.asyncWrapper)(accounting_controller_1.createAccoutingController));
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
route.get("/", authMiddleware_1.authMiddleware, requireAdmin_1.requireAdmin, (0, asyncWrapper_1.asyncWrapper)(accounting_controller_1.getAllAccoutingController));
/**
 * @openapi
 * /accountings/report:
 *   post:
 *     summary: Generate and download accounting PDF report for a date range
 *     description: Generate a PDF with accounting totals for an interval. If no dates are provided, totals for all time are returned.
 *     tags:
 *       - Accounting
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IntervalDateDto'
 *           example:
 *             dateFrom: "2025-01-01"
 *             dateTo: "2025-01-31"
 *     responses:
 *       '200':
 *         description: PDF report (file download)
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       '400':
 *         description: Bad request - e.g. no accounting data for the range
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 */
route.post("/report", authMiddleware_1.authMiddleware, requireAdmin_1.requireAdmin, (0, validateDtoClient_1.validateDtoClient)(BaseFilter_dto_1.IntervalDateDto), (0, asyncWrapper_1.asyncWrapper)(accounting_controller_1.getAccountingsBydatePuppeteerController));
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
route.get("/:id", authMiddleware_1.authMiddleware, requireAdmin_1.requireAdmin, (0, asyncWrapper_1.asyncWrapper)(accounting_controller_1.getByIdAccoutingController));
route.patch("/:id", authMiddleware_1.authMiddleware, requireAdmin_1.requireAdmin, (0, validateDtoClient_1.validateDtoClient)(accounting_dto_1.UpdateAccountingDto), (0, asyncWrapper_1.asyncWrapper)(accounting_controller_1.updateAccoutingController));
exports.default = route;
