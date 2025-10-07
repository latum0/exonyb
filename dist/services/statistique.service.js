"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandeParDateParProduit = commandeParDateParProduit;
exports.ClientsParProduitParDate = ClientsParProduitParDate;
exports.RetoursParProduitParDate = RetoursParProduitParDate;
exports.RetoursParDateParProduit = RetoursParDateParProduit;
const prisma_1 = __importDefault(require("../prisma"));
const helpers_1 = require("../utils/helpers");
function toDateOrUndefined(v) {
    if (!v)
        return undefined;
    const d = new Date(v);
    if (isNaN(d.getTime()))
        throw new Error(`Invalid date: ${v}`);
    return d;
}
async function commandeParDateParProduit(query) {
    const dateFrom = toDateOrUndefined(query.dateFrom);
    const dateTo = toDateOrUndefined(query.dateTo);
    const denomFrom = toDateOrUndefined(query.denominatorPeriodStart);
    const denomTo = toDateOrUndefined(query.denominatorPeriodEnd);
    const whereWindow = {};
    (0, helpers_1.dateHelper)(whereWindow, dateFrom, dateTo, 'dateCommande');
    if (query.produitId)
        whereWindow.lignesCommande = { some: { produitId: query.produitId } };
    const whereTotal = {};
    if (denomFrom || denomTo) {
        (0, helpers_1.dateHelper)(whereTotal, denomFrom, denomTo, 'dateCommande');
    }
    const [windowCount, totalCount] = await Promise.all([
        prisma_1.default.commande.count({ where: whereWindow }),
        prisma_1.default.commande.count({ where: whereTotal }),
    ]);
    const percentage = totalCount === 0 ? 0 : Number(((windowCount / totalCount) * 100).toFixed(2));
    return { statusCode: 200, data: { percentage, windowCount, totalCount } };
}
async function ClientsParProduitParDate(query) {
    const dateFrom = toDateOrUndefined(query.dateFrom);
    const dateTo = toDateOrUndefined(query.dateTo);
    const denomFrom = toDateOrUndefined(query.denominatorPeriodStart);
    const denomTo = toDateOrUndefined(query.denominatorPeriodEnd);
    const where = {};
    if (query.produitId) {
        where.commandes = {
            some: { lignesCommande: { some: { produitId: query.produitId } } }
        };
    }
    (0, helpers_1.dateHelper)(where, dateFrom, dateTo, "dateCreated");
    const whereTotal = {};
    if (denomFrom || denomTo) {
        (0, helpers_1.dateHelper)(whereTotal, denomFrom, denomTo, "dateCreated");
    }
    const [clientCountWindow, clientCountTotal] = await Promise.all([
        prisma_1.default.client.count({ where }),
        prisma_1.default.client.count({ where: { ...whereTotal } })
    ]);
    const percentage = clientCountTotal === 0 ? 0 : Number(((clientCountWindow / clientCountTotal) * 100).toFixed(2));
    return { statusCode: 200, data: { percentage, clientCountWindow, clientCountTotal } };
}
async function RetoursParProduitParDate(query) {
    const dateFrom = toDateOrUndefined(query.dateFrom);
    const dateTo = toDateOrUndefined(query.dateTo);
    const denomFrom = toDateOrUndefined(query.denominatorPeriodStart);
    const denomTo = toDateOrUndefined(query.denominatorPeriodEnd);
    const whereRetourWindow = {};
    (0, helpers_1.dateHelper)(whereRetourWindow, dateFrom, dateTo, 'dateRetour');
    if (query.produitId) {
        whereRetourWindow.commande = { lignesCommande: { some: { produitId: query.produitId } } };
    }
    const whereRetourTotal = {};
    if (denomFrom || denomTo) {
        (0, helpers_1.dateHelper)(whereRetourTotal, denomFrom, denomTo, 'dateRetour');
    }
    const [retourCountWindow, retourCountTotal] = await Promise.all([
        prisma_1.default.retour.count({ where: whereRetourWindow }),
        prisma_1.default.retour.count({ where: whereRetourTotal }),
    ]);
    const percentage = retourCountTotal === 0 ? 0 : Number(((retourCountWindow / retourCountTotal) * 100).toFixed(2));
    return { statusCode: 200, data: { percentage, retourCountWindow, retourCountTotal } };
}
async function RetoursParDateParProduit(query) {
    const dateFrom = toDateOrUndefined(query.dateFrom);
    const dateTo = toDateOrUndefined(query.dateTo);
    const denomFrom = toDateOrUndefined(query.denominatorPeriodStart);
    const denomTo = toDateOrUndefined(query.denominatorPeriodEnd);
    const whereRetourWindow = {};
    (0, helpers_1.dateHelper)(whereRetourWindow, dateFrom, dateTo, 'dateRetour');
    if (query.produitId) {
        whereRetourWindow.commande = { lignesCommande: { some: { produitId: query.produitId } } };
    }
    const whereCommandeTotal = {};
    if (denomFrom || denomTo) {
        (0, helpers_1.dateHelper)(whereCommandeTotal, denomFrom, denomTo, 'dateCommande');
    }
    const [retourCountWindow, commandeCountTotal] = await Promise.all([
        prisma_1.default.retour.count({ where: whereRetourWindow }),
        prisma_1.default.commande.count({ where: whereCommandeTotal }),
    ]);
    const percentage = commandeCountTotal === 0 ? 0 : Number(((retourCountWindow / commandeCountTotal) * 100).toFixed(2));
    return { statusCode: 200, data: { percentage, retourCountWindow, commandeCountTotal } };
}
