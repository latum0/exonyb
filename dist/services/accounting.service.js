"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingGetResponse = void 0;
exports.createAccounting = createAccounting;
exports.updateAccounting = updateAccounting;
exports.getAccountingById = getAccountingById;
exports.getAllAccounting = getAllAccounting;
exports.getAccountingsByDate = getAccountingsByDate;
const prisma_1 = __importDefault(require("../prisma"));
const helpers_1 = require("../utils/helpers");
const historique_service_1 = require("./historique.service");
const client_1 = require("@prisma/client");
function payloadAccounting(id, achatProduits, ads, emballage, abonnementTel, autre, salaires, total, commentaire) {
    const payload = {
        id,
        achatProduits: achatProduits.toString(),
        ads: ads.toString(),
        emballage: emballage.toString(),
        abonnementTel: abonnementTel.toString(),
        autre: autre.toString(),
        salaires: salaires.toString(),
        commentaire: commentaire,
        total: total.toString(),
    };
    return payload;
}
async function createAccounting(dto, utilisateurId) {
    const { achatProduits, ads, emballage, abonnementTel, autre, salaires } = (0, helpers_1.stringToDecimalAccounting)(dto);
    const total = achatProduits
        .add(ads)
        .add(emballage)
        .add(abonnementTel)
        .add(autre)
        .add(salaires);
    const payloadCreate = {
        achatProduits: achatProduits.toString(),
        ads: ads.toString(),
        emballage: emballage.toString(),
        abonnementTel: abonnementTel.toString(),
        autre: autre.toString(),
        salaires: salaires.toString(),
        commentaire: dto.commentaire
    };
    const accounting = await prisma_1.default.$transaction(async (tx) => {
        const create = await tx.accounting.create({ data: { ...payloadCreate, total } });
        await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `creation de la ligne comptabilite ${create.id}`);
        return create;
    });
    const payload = payloadAccounting(accounting.id, accounting.achatProduits, accounting.ads, accounting.emballage, accounting.abonnementTel, accounting.autre, accounting.salaires, accounting.total, dto.commentaire);
    return { statusCode: 201, data: payload };
}
async function updateAccounting(id, dto, utilisateurId) {
    const oldrow = await (0, helpers_1.ensureExists)(() => prisma_1.default.accounting.findUnique({ where: { id } }), "Accounting");
    const strp = (0, helpers_1.stripNullish)(dto);
    const abonnementTel = strp.abonnementTel ? (0, helpers_1.stringToDecimal)(strp.abonnementTel) : new client_1.Prisma.Decimal(oldrow.abonnementTel ?? "0");
    const achatProduits = strp.achatProduits ? (0, helpers_1.stringToDecimal)(strp.achatProduits) : new client_1.Prisma.Decimal(oldrow.achatProduits ?? "0");
    const ads = strp.ads ? (0, helpers_1.stringToDecimal)(strp.ads) : new client_1.Prisma.Decimal(oldrow.ads ?? "0");
    const autre = strp.autre ? (0, helpers_1.stringToDecimal)(strp.autre) : new client_1.Prisma.Decimal(oldrow.autre ?? "0");
    const emballage = strp.emballage ? (0, helpers_1.stringToDecimal)(strp.emballage) : new client_1.Prisma.Decimal(oldrow.emballage ?? "0");
    const salaires = strp.salaires ? (0, helpers_1.stringToDecimal)(strp.salaires) : new client_1.Prisma.Decimal(oldrow.salaires ?? "0");
    const total = abonnementTel
        .add(achatProduits)
        .add(ads)
        .add(autre)
        .add(emballage)
        .add(salaires);
    const accounting = await prisma_1.default.$transaction(async (tx) => {
        const updated = await tx.accounting.update({
            where: { id },
            data: {
                ...strp,
                total,
            },
        });
        await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `mis a jour de la ligne ${updated.id}`);
        return updated;
    });
    const payload = payloadAccounting(accounting.id, accounting.achatProduits, accounting.ads, accounting.emballage, accounting.abonnementTel, accounting.autre, accounting.salaires, accounting.total, accounting.commentaire);
    return { statusCode: 200, data: payload, message: "mis a jour success" };
}
async function getAccountingById(id) {
    const accounting = await (0, helpers_1.ensureExists)(() => prisma_1.default.accounting.findUnique({ where: { id } }), "Accounting");
    const payload = payloadAccounting(accounting.id, accounting.achatProduits, accounting.ads, accounting.emballage, accounting.abonnementTel, accounting.autre, accounting.salaires, accounting.total, accounting.commentaire);
    return { statusCode: 200, data: payload };
}
async function getAllAccounting(q) {
    const parseNumber = (v) => {
        if (v === undefined || v === null)
            return undefined;
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    };
    const page = Math.max(1, Math.floor(q.page ?? 1));
    const limit = Math.min(100, Math.max(1, Math.floor(q.limit ?? 10)));
    const where = {};
    if (q.dateFrom || q.dateTo) {
        where.createdAt = {};
        if (q.dateFrom)
            where.createdAt.gte = new Date(q.dateFrom);
        if (q.dateTo)
            where.createdAt.lte = new Date(q.dateTo);
    }
    const idNum = parseNumber(q.id);
    if (typeof idNum === "number")
        where.id = idNum;
    const minTotalNum = parseNumber(q.minTotal);
    const maxTotalNum = parseNumber(q.maxTotal);
    if (minTotalNum !== undefined || maxTotalNum !== undefined) {
        where.total = {};
        if (minTotalNum !== undefined)
            where.total.gte = minTotalNum;
        if (maxTotalNum !== undefined)
            where.total.lte = maxTotalNum;
    }
    if (q.search) {
        where.commentaire = { contains: String(q.search).trim() };
    }
    const skip = (page - 1) * limit;
    const [total, rows] = await prisma_1.default.$transaction([
        prisma_1.default.accounting.count({ where }),
        prisma_1.default.accounting.findMany({
            where,
            take: limit,
            skip,
            orderBy: { createdAt: "desc" },
        })
    ]);
    const accountings = rows.map((c) => ({
        id: c.id,
        abonnementTel: c.abonnementTel.toString(),
        achatProduits: c.achatProduits.toString(),
        ads: c.ads.toString(),
        autre: c.autre.toString(),
        commentaire: c.commentaire,
        createdAt: c.createdAt.toString(),
        emballage: c.emballage.toString(),
        salaires: c.salaires.toString(),
        total: c.total.toString(),
    }));
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { statusCode: 200, data: { accountings, totalPages, total, page, limit } };
}
class AccountingGetResponse {
}
exports.AccountingGetResponse = AccountingGetResponse;
async function getAccountingsByDate(date) {
    const where = {};
    const payload = {
        achatProduitsTotal: "0.00",
        adsTotal: "0.00",
        emballageTotal: "0.00",
        abonnementTelTotal: "0.00",
        autreTotal: "0.00",
        salairesTotal: "0.00",
        totalDate: "0.00",
    };
    // Helper: convert incoming date-string to Date (start / end of day)
    const toStartOfDay = (d) => {
        if (!d)
            return undefined;
        if (d.includes("T"))
            return new Date(d);
        return new Date(`${d}T00:00:00.000Z`);
    };
    const toEndOfDay = (d) => {
        if (!d)
            return undefined;
        if (d.includes("T"))
            return new Date(d);
        return new Date(`${d}T23:59:59.999Z`);
    };
    const fmt = (v) => {
        if (v === null || v === undefined)
            return "0.00";
        try {
            if (typeof v === "object" && typeof v.toFixed === "function") {
                return v.toFixed(2);
            }
            const n = Number(v);
            if (Number.isNaN(n))
                return String(v);
            return n.toFixed(2);
        }
        catch {
            return String(v);
        }
    };
    if (date?.dateFrom || date?.dateTo) {
        where.createdAt = {};
        const from = toStartOfDay(date?.dateFrom);
        const to = toEndOfDay(date?.dateTo);
        if (from)
            where.createdAt.gte = from;
        if (to)
            where.createdAt.lte = to;
    }
    const accountings = await prisma_1.default.accounting.aggregate({
        where,
        _sum: {
            achatProduits: true,
            ads: true,
            emballage: true,
            abonnementTel: true,
            autre: true,
            salaires: true,
            total: true,
        },
    });
    payload.achatProduitsTotal = fmt(accountings._sum.achatProduits);
    payload.adsTotal = fmt(accountings._sum.ads);
    payload.emballageTotal = fmt(accountings._sum.emballage);
    payload.abonnementTelTotal = fmt(accountings._sum.abonnementTel);
    payload.autreTotal = fmt(accountings._sum.autre);
    payload.salairesTotal = fmt(accountings._sum.salaires);
    payload.totalDate = fmt(accountings._sum.total);
    return {
        statusCode: 200,
        data: {
            totalData: payload,
            dateFrom: date.dateFrom ? String(date.dateFrom) : "",
            dateTo: date?.dateTo ? String(date.dateTo) : "",
        },
    };
}
