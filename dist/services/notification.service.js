"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStockNotificationsIfNeeded = createStockNotificationsIfNeeded;
exports.restockNotification = restockNotification;
exports.getNotificationById = getNotificationById;
exports.getNotifications = getNotifications;
exports.deleteNotification = deleteNotification;
const helpers_1 = require("../utils/helpers");
const prisma_1 = __importDefault(require("../prisma"));
const historique_service_1 = require("./historique.service");
const email_1 = require("../utils/email");
async function createStockNotificationsIfNeeded(tx, produitIds, ctx) {
    if (!produitIds || produitIds.length === 0)
        return { created: 0 };
    const uniqueIds = Array.from(new Set(produitIds));
    const produits = await tx.produit.findMany({
        where: { idProduit: { in: uniqueIds } },
        select: { idProduit: true, stock: true, nom: true }
    });
    if (produits.length === 0)
        return { created: 0 };
    const existing = await tx.notification.findMany({
        where: {
            produitId: { in: uniqueIds },
            type: "OUT_OF_STOCK",
            resolved: false
        },
        select: { produitId: true }
    });
    const alreadyAlerted = new Set(existing.map((e) => e.produitId));
    const toCreate = produits
        .filter((p) => p.stock === 0 && !alreadyAlerted.has(p.idProduit))
        .map((p) => {
        const trigger = ctx?.trigger ? ` (trigger: ${ctx?.trigger})` : "";
        const message = `Produit "${p.nom ?? p.idProduit}" est en rupture de stock.`;
        (0, email_1.sendStockNotif)(p.idProduit, p.nom);
        return {
            produitId: p.idProduit,
            type: "OUT_OF_STOCK",
            message
        };
    });
    if (toCreate.length === 0)
        return { created: 0 };
    await tx.notification.createMany({
        data: toCreate,
        skipDuplicates: true
    });
    return { created: toCreate.length };
}
async function restockNotification(tx, produitIds) {
    if (!produitIds || produitIds.length === 0)
        return { resolved: 0 };
    const uniqueIds = Array.from(new Set(produitIds));
    const active = await tx.notification.findMany({
        where: { produitId: { in: uniqueIds }, type: "OUT_OF_STOCK", resolved: false },
        select: { id: true }
    });
    if (active.length === 0)
        return { resolved: 0 };
    const ids = active.map((a) => a.id);
    const result = await tx.notification.updateMany({
        where: { id: { in: ids } },
        data: { resolved: true }
    });
    return { resolved: result.count };
}
async function getNotificationById(id) {
    const notif = await (0, helpers_1.ensureExists)(() => prisma_1.default.notification.findUnique({
        where: { id },
        select: { id: true, produitId: true, type: true, message: true, createdAt: true, resolved: true }
    }), "Notification");
    const dto = {
        id: notif.id,
        produitId: notif.produitId,
        type: notif.type,
        message: notif.message,
        createdAt: notif.createdAt,
        resolved: notif.resolved
    };
    return { statusCode: 200, data: dto };
}
async function getNotifications() {
    const items = await prisma_1.default.notification.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            produitId: true,
            type: true,
            message: true,
            createdAt: true,
            resolved: true,
        },
    });
    return { statusCode: 200, data: items };
}
async function deleteNotification(id, utilisateurId) {
    const notif = await (0, helpers_1.ensureExists)(() => prisma_1.default.notification.findUnique({ where: { id } }), "Notification");
    await prisma_1.default.$transaction(async (tx) => {
        await tx.notification.delete({ where: { id } });
        await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Suppression de la notification ID=${notif.id}`);
    });
    return { statusCode: 200, message: "Notification supprimée avec succès." };
}
