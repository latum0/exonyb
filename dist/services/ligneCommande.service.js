"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLigne = addLigne;
exports.calcMontantT = calcMontantT;
exports.updateLigneQuantity = updateLigneQuantity;
exports.updateLignePrixUnitaire = updateLignePrixUnitaire;
exports.getLigneById = getLigneById;
exports.getLignesByCommande = getLignesByCommande;
exports.removeLigne = removeLigne;
const prisma_1 = __importDefault(require("../prisma"));
const helpers_1 = require("../utils/helpers");
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
const historique_service_1 = require("./historique.service");
const notification_service_1 = require("./notification.service");
async function addLigne(tx, commandeId, produitId, quantite, utilisateurId) {
    if (!Number.isInteger(quantite) || quantite <= 0)
        throw new errors_1.BadRequestError('Quantité invalide');
    const prod = await tx.produit.findUnique({ where: { idProduit: produitId } });
    if (!prod)
        throw new errors_1.NotFoundError('Produit');
    const existing = await tx.ligneCommande.findFirst({ where: { commandeId, produitId } });
    if (existing) {
        await updateLigneQuantity(tx, produitId, commandeId, existing.quantite + quantite, utilisateurId);
        return;
    }
    const res = await tx.produit.updateMany({
        where: { idProduit: produitId, stock: { gte: quantite } },
        data: { stock: { decrement: quantite } }
    });
    if (res.count === 0)
        throw new errors_1.BadRequestError('Stock insuffisant');
    const prixStr = (Number(prod.prix)).toFixed(2);
    await tx.ligneCommande.create({
        data: {
            commandeId,
            produitId,
            quantite,
            prixUnitaire: prixStr
        }
    });
    if (utilisateurId) {
        await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Ajout produit ${produitId} (x${quantite}) à la commande ${commandeId}`);
    }
    try {
        await (0, notification_service_1.createStockNotificationsIfNeeded)(tx, [produitId], { trigger: `addLigne:${commandeId}`, utilisateurId });
    }
    catch (err) {
        console.error("Notification creation failed (addLigne)", err);
    }
}
async function findCmdLine(tx, produitId, commandeId) {
    const line = await (0, helpers_1.ensureExists)(() => tx.ligneCommande.findFirst({
        where: {
            produitId,
            commandeId
        }
    }), "Ligne Commande");
    const cmd = await (0, helpers_1.ensureExists)(() => tx.commande.findUnique({ where: { idCommande: commandeId } }), "Commande");
    return { line, cmd };
}
async function calcMontantT(tx, commandeId) {
    const lines = await tx.ligneCommande.findMany({ where: { commandeId } });
    const totalDecimal = lines.reduce((acc, l) => {
        return acc.add(new client_1.Prisma.Decimal(l.prixUnitaire).mul(l.quantite));
    }, new client_1.Prisma.Decimal(0));
    return totalDecimal;
}
async function updateLigneQuantity(tx, produitId, commandeId, quantity, utilisateurId) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new errors_1.BadRequestError("Quantité invalide");
    }
    const { line } = await findCmdLine(tx, produitId, commandeId);
    await (0, helpers_1.ensureExists)(() => tx.produit.findUnique({ where: { idProduit: produitId } }), "Produit");
    const oldQuantity = line.quantite;
    const delta = quantity - oldQuantity;
    if (delta > 0) {
        const res = await tx.produit.updateMany({
            where: { idProduit: produitId, stock: { gte: delta } },
            data: { stock: { decrement: delta } }
        });
        if (res.count === 0)
            throw new errors_1.BadRequestError("Stock insuffisant pour le produit " + produitId);
        try {
            await (0, notification_service_1.createStockNotificationsIfNeeded)(tx, [produitId], { trigger: `updateLigne:${commandeId}`, utilisateurId });
        }
        catch (err) {
            console.error("Notification creation failed (updateLigneQuantity)", err);
        }
    }
    else if (delta < 0) {
        await tx.produit.update({
            where: { idProduit: produitId },
            data: { stock: { increment: -delta } }
        });
        try {
            await (0, notification_service_1.restockNotification)(tx, [produitId]);
        }
        catch (err) {
            console.error("Notification resolving failed (updateLigneQuantity)", err);
        }
    }
    await tx.ligneCommande.update({
        where: { idLigne: line.idLigne },
        data: { quantite: quantity }
    });
}
async function updateLignePrixUnitaire(idLigne, dto, utilisateurId) {
    const updated = await prisma_1.default.$transaction(async (tx) => {
        const ligne = await (0, helpers_1.ensureExists)(() => tx.ligneCommande.findUnique({
            where: { idLigne },
            select: { idLigne: true, commandeId: true, prixUnitaire: true, quantite: true, produitId: true }
        }), "Ligne Commande");
        let prixDec;
        try {
            prixDec = new client_1.Prisma.Decimal(dto.prixUnitaire).toDecimalPlaces(2);
            if (prixDec.lte(0))
                throw new Error('prix <= 0');
        }
        catch {
            throw new errors_1.BadRequestError('Prix unitaire invalide');
        }
        const updateLine = await tx.ligneCommande.update({
            where: { idLigne },
            data: { prixUnitaire: prixDec.toFixed(2) }
        });
        const totalDecimal = await calcMontantT(tx, ligne.commandeId);
        await tx.commande.update({
            where: { idCommande: ligne.commandeId },
            data: { montantTotal: totalDecimal.toFixed(2) }
        });
        await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Prix unitaire modifié pour commande ${ligne.commandeId}, produit ${ligne.produitId}: ${String(ligne.prixUnitaire)} -> ${prixDec.toFixed(2)}`);
        return updateLine;
    });
    const responseDto = {
        idLigne: updated.idLigne,
        quantite: updated.quantite,
        prixUnitaire: updated.prixUnitaire.toString()
    };
    return { statusCode: 200, data: responseDto };
}
async function getLigneById(idLigne) {
    const line = await (0, helpers_1.ensureExists)(() => prisma_1.default.ligneCommande.findUnique({ where: { idLigne } }), "Ligne Commande");
    return { statusCode: 200, data: line };
}
async function getLignesByCommande(commandeId) {
    await (0, helpers_1.ensureExists)(() => prisma_1.default.commande.findUnique({
        where: { idCommande: commandeId }
    }), "Commande");
    const lignes = await (0, helpers_1.ensureExists)(() => prisma_1.default.ligneCommande.findMany({
        where: { commandeId },
        select: { idLigne: true, produitId: true, quantite: true, prixUnitaire: true, commandeId: true }
    }), "Ligne Commande");
    if (lignes === null) {
        throw new errors_1.NotFoundError("no order");
    }
    return { statusCode: 200, data: lignes };
}
async function removeLigne(tx, commandeId, produitId, utilisateurId) {
    const line = await tx.ligneCommande.findFirst({ where: { commandeId, produitId } });
    if (!line)
        throw new errors_1.NotFoundError('Ligne');
    await tx.produit.update({
        where: { idProduit: produitId },
        data: { stock: { increment: line.quantite } }
    });
    await tx.ligneCommande.delete({ where: { idLigne: line.idLigne } });
    if (utilisateurId) {
        await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Suppression produit ${produitId} (x${line.quantite}) de la commande ${commandeId}`);
    }
    try {
        await (0, notification_service_1.restockNotification)(tx, [produitId]);
    }
    catch (err) {
        console.error("Notification resolving failed (removeLigne)", err);
    }
}
