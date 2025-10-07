"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAccoutingController = createAccoutingController;
exports.updateAccoutingController = updateAccoutingController;
exports.getByIdAccoutingController = getByIdAccoutingController;
exports.getAllAccoutingController = getAllAccoutingController;
exports.getAccountingsBydatePuppeteerController = getAccountingsBydatePuppeteerController;
const errors_1 = require("../utils/errors");
const accounting_service_1 = require("../services/accounting.service");
const puppeteer = __importStar(require("puppeteer"));
const helpers_1 = require("../utils/helpers");
async function createAccoutingController(req, res, next) {
    const userId = req.user.sub;
    const dto = req.body;
    const { statusCode, data } = await (0, accounting_service_1.createAccounting)(dto, userId);
    res.status(statusCode).json(data);
}
async function updateAccoutingController(req, res, next) {
    const userId = req.user.sub;
    const dto = req.body;
    const idAccounting = Number(req.params.id);
    if (isNaN(idAccounting)) {
        throw new errors_1.BadRequestError("idAccounting should be a number");
    }
    const { statusCode, data } = await (0, accounting_service_1.updateAccounting)(idAccounting, dto, userId);
    res.status(statusCode).json(data);
}
async function getByIdAccoutingController(req, res, next) {
    const idAccounting = Number(req.params.id);
    if (isNaN(idAccounting)) {
        res.status(400).json({ statusCode: 400, message: "Invalid client ID" });
        return;
    }
    const { statusCode, data } = await (0, accounting_service_1.getAccountingById)(idAccounting);
    res.status(statusCode).json(data);
}
async function getAllAccoutingController(req, res, next) {
    const query = req.validatedQuery ?? req.query;
    const { statusCode, data } = await (0, accounting_service_1.getAllAccounting)(query);
    res.status(statusCode).json(data);
}
async function getAccountingsBydatePuppeteerController(req, res, next) {
    let browser = null;
    const dateDto = req.body;
    const { data } = await (0, accounting_service_1.getAccountingsByDate)(dateDto);
    const totals = data?.totalData;
    const dateFrom = data?.dateFrom ?? "";
    const dateTo = data?.dateTo ?? "";
    if (!totals) {
        return next(new errors_1.BadRequestError("Aucune donnée comptable disponible pour la plage de dates indiquée."));
    }
    const html = (0, helpers_1.htmlPdf)(dateFrom, dateTo, totals.achatProduitsTotal ?? "0.00", totals.adsTotal ?? "0.00", totals.emballageTotal ?? "0.00", totals.abonnementTelTotal ?? "0.00", totals.salairesTotal ?? "0.00", totals.autreTotal ?? "0.00", totals.totalDate ?? "0.00");
    browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: true,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20mm", bottom: "20mm", left: "12mm", right: "12mm" },
    });
    await page.close();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="accounting_${dateFrom || "all"}_${dateTo || "now"}.pdf"`);
    res.send(pdfBuffer);
}
