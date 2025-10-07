"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommande = createCommande;
exports.updateCommandeMontantT = updateCommandeMontantT;
exports.updateCommande = updateCommande;
exports.getCommandeById = getCommandeById;
exports.getCommandes = getCommandes;
exports.deleteCommande = deleteCommande;
exports.updateCommandeStatut = updateCommandeStatut;
const client_1 = require("@prisma/client");
const helpers_1 = require("../utils/helpers");
const prisma_1 = __importDefault(require("../prisma"));
const errors_1 = require("../utils/errors");
const historique_service_1 = require("./historique.service");
const ligneCommande_service_1 = require("./ligneCommande.service");
const notification_service_1 = require("./notification.service");
const qrcode_1 = __importDefault(require("qrcode"));
async function createCommande(dto, utilisateurId) {
    // merge duplicate lines
    const mergedLinesMap = new Map();
    for (const l of dto.lignes) {
        const existing = mergedLinesMap.get(l.produitId);
        if (existing)
            existing.quantite += l.quantite;
        else
            mergedLinesMap.set(l.produitId, { quantite: l.quantite });
    }
    const mergedLines = Array.from(mergedLinesMap.entries()).map(([produitId, v]) => ({
        produitId,
        quantite: v.quantite,
    }));
    const produitIds = mergedLines.map((l) => l.produitId);
    const uniqueProduitIds = Array.from(new Set(produitIds));
    const createdCommande = await prisma_1.default.$transaction(async (tx) => {
        await (0, helpers_1.ensureExists)(() => tx.client.findUnique({ where: { idClient: dto.clientId } }), "Client");
        const produits = await tx.produit.findMany({
            where: { idProduit: { in: uniqueProduitIds } },
            select: {
                idProduit: true,
                prix: true,
                remise: true,
                stock: true,
                nom: true,
            },
        });
        const produitMap = new Map(produits.map((p) => [p.idProduit, p]));
        let total = new client_1.Prisma.Decimal(0);
        const linesPrepared = mergedLines.map((l) => {
            const prod = produitMap.get(l.produitId);
            if (!prod)
                throw new errors_1.NotFoundError(`Produit not found: ${l.produitId}`);
            const prixAfterRemise = (0, helpers_1.prixUnitaire)(prod.remise ?? 0, prod.prix);
            if (prixAfterRemise.isNegative())
                throw new errors_1.BadRequestError(`Prix négatif pour ${prod.nom}`);
            const lineTotal = prixAfterRemise.mul(l.quantite);
            total = total.plus(lineTotal);
            return {
                produitId: l.produitId,
                quantite: l.quantite,
                prixUnitaireDecimal: prixAfterRemise,
            };
        });
        for (const lp of linesPrepared) {
            const r = await tx.produit.updateMany({
                where: { idProduit: lp.produitId, stock: { gte: lp.quantite } },
                data: { stock: { decrement: lp.quantite } },
            });
            if (r.count === 0) {
                const prod = produitMap.get(lp.produitId);
                throw new errors_1.BadRequestError(`Stock insuffisant pour le produit ${prod?.nom ?? lp.produitId}`);
            }
        }
        const cmdId = crypto.randomUUID();
        const base = process.env.BASE_URL;
        const path = `/commandes/${cmdId}`;
        const QRUrl = `${base}${path}`;
        const svg = await qrcode_1.default.toString(QRUrl, {
            type: 'svg',
            errorCorrectionLevel: 'Q',
            margin: 2,
            width: 300,
        });
        const created = await tx.commande.create({
            data: {
                idCommande: cmdId,
                dateCommande: dto.dateCommande ?? new Date(),
                statut: dto.statut,
                adresseLivraison: dto.adresseLivraison,
                montantTotal: total.toString(),
                clientId: dto.clientId,
                qrSVG: svg,
                lignesCommande: {
                    create: linesPrepared.map((lp) => ({
                        produit: { connect: { idProduit: lp.produitId } },
                        quantite: lp.quantite,
                        prixUnitaire: lp.prixUnitaireDecimal.toString(),
                    })),
                }
            },
            include: {
                lignesCommande: true,
            },
        });
        await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Création de la commande ${created.idCommande} pour le client ${created.clientId}`);
        try {
            await (0, notification_service_1.createStockNotificationsIfNeeded)(tx, uniqueProduitIds, {
                trigger: `commande:${created.idCommande}`,
                utilisateurId,
            });
        }
        catch (err) {
            console.error("Failed to create stock notifications", err);
        }
        return created;
    });
    const responseDto = {
        idCommande: createdCommande.idCommande,
        dateCommande: createdCommande.dateCommande,
        statut: createdCommande.statut,
        qrSVG: createdCommande.qrSVG,
        adresseLivraison: createdCommande.adresseLivraison,
        montantTotal: createdCommande.montantTotal?.toString
            ? createdCommande.montantTotal.toString()
            : String(createdCommande.montantTotal),
        clientId: createdCommande.clientId,
        ligne: (createdCommande.lignesCommande || []).map((l) => ({
            idLigne: l.idLigne,
            produitId: l.produitId,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire?.toString
                ? l.prixUnitaire.toString()
                : String(l.prixUnitaire),
        })),
    };
    return { statusCode: 201, data: responseDto };
}
async function updateCommandeMontantT(idCommande, montantT, utilisateurId) {
    await (0, helpers_1.ensureExists)(() => prisma_1.default.commande.findUnique({
        where: { idCommande },
        select: { idCommande: true },
    }), "Commande");
    if (montantT === null || montantT === undefined) {
        throw new errors_1.BadRequestError("Montant total est invalide");
    }
    let dec;
    try {
        dec = new client_1.Prisma.Decimal(montantT).toDecimalPlaces(2);
        if (dec.isNegative())
            throw new Error();
    }
    catch {
        throw new errors_1.BadRequestError("Montant total invalide");
    }
    const updated = await prisma_1.default.$transaction(async (tx) => {
        const prev = await tx.commande.findUnique({ where: { idCommande } });
        const u = await tx.commande.update({
            where: { idCommande },
            data: { montantTotal: dec },
        });
        if (utilisateurId) {
            await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Montant total modifié pour la commande ${idCommande} (ancien: ${prev?.montantTotal?.toString() ?? "N/A"} -> nouveau: ${dec.toFixed(2)})`);
        }
        return u;
    });
    const responseDto = {
        dateCommande: updated.dateCommande,
        adresseLivraison: updated.adresseLivraison,
        qrSVG: updated.qrSVG,
        statut: updated.statut,
        montantTotal: updated.montantTotal.toString(),
        idCommande: updated.idCommande,
        clientId: updated.clientId,
    };
    return { statusCode: 200, data: responseDto };
}
async function updateCommande(idCommande, dto, utilisateurId) {
    if (dto.lignes && !Array.isArray(dto.lignes))
        throw new errors_1.BadRequestError("lignes must be an array");
    const strp = (0, helpers_1.stripNullish)(dto);
    const { lignes, ...commandePatch } = strp;
    const updatedCmd = await prisma_1.default.$transaction(async (tx) => {
        await (0, helpers_1.ensureExists)(() => tx.commande.findUnique({ where: { idCommande } }), "Commande");
        if (Array.isArray(lignes)) {
            for (const patch of lignes) {
                if (patch.op === "update") {
                    if (!patch.produitId || patch.quantite === undefined) {
                        throw new errors_1.BadRequestError("Le produitId ou la quantité doit exister.");
                    }
                    await (0, ligneCommande_service_1.updateLigneQuantity)(tx, patch.produitId, idCommande, patch.quantite, utilisateurId);
                    if (utilisateurId)
                        await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Quantité modifiée: produit ${patch.produitId} -> ${patch.quantite} (commande ${idCommande})`);
                }
                else if (patch.op === "add") {
                    if (!patch.produitId || patch.quantite === undefined)
                        throw new errors_1.BadRequestError("Le produitId ou la quantité doit exister.");
                    await (0, ligneCommande_service_1.addLigne)(tx, idCommande, patch.produitId, patch.quantite, utilisateurId);
                }
                else if (patch.op === "remove") {
                    if (!patch.produitId)
                        throw new errors_1.BadRequestError("Le produitId ou la quantité doit exister.");
                    await (0, ligneCommande_service_1.removeLigne)(tx, idCommande, patch.produitId, utilisateurId);
                }
                else {
                    throw new errors_1.BadRequestError("Opération invalide pour la ligne.");
                }
            }
        }
        const totalDecimal = await (0, ligneCommande_service_1.calcMontantT)(tx, idCommande);
        const totalStr = totalDecimal.toFixed(2);
        if (commandePatch.clientId) {
            await (0, helpers_1.ensureExists)(() => prisma_1.default.client.findUnique({
                where: { idClient: commandePatch.clientId },
            }), "Client");
        }
        const updated = await tx.commande.update({
            where: { idCommande },
            data: { ...commandePatch, montantTotal: totalStr },
            include: { lignesCommande: true },
        });
        return updated;
    });
    const responseDto = {
        idCommande: updatedCmd.idCommande,
        dateCommande: updatedCmd.dateCommande,
        statut: updatedCmd.statut,
        adresseLivraison: updatedCmd.adresseLivraison,
        montantTotal: updatedCmd.montantTotal.toString(),
        clientId: updatedCmd.clientId,
        ligne: (updatedCmd.lignesCommande || []).map((l) => ({
            idLigne: l.idLigne,
            produitId: l.produitId,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire != null ? String(l.prixUnitaire) : "0",
            commandeId: l.commandeId,
        })),
    };
    return { statusCode: 200, data: responseDto };
}
async function getCommandeById(idCommande) {
    const commande = await (0, helpers_1.ensureExists)(() => prisma_1.default.commande.findUnique({
        where: { idCommande },
        include: {
            client: {
                select: {
                    numeroTelephone: true,
                },
            },
            lignesCommande: {
                select: {
                    produit: {
                        select: {
                            nom: true,
                        },
                    },
                    idLigne: true,
                    produitId: true,
                    quantite: true,
                    prixUnitaire: true,
                    commandeId: true,
                },
            },
        },
    }), "Commande");
    const dto = {
        idCommande: commande.idCommande,
        dateCommande: commande.dateCommande,
        statut: commande.statut,
        qrSVG: commande.qrSVG,
        adresseLivraison: commande.adresseLivraison,
        montantTotal: commande.montantTotal.toString(),
        clientId: commande.clientId,
        client: commande.client.numeroTelephone,
        ligne: (commande.lignesCommande || []).map((l) => ({
            idLigne: l.idLigne,
            produitId: l.produitId,
            produit: l.produit.nom,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire != null ? String(l.prixUnitaire) : "0",
            commandeId: l.commandeId,
        })),
    };
    return { statusCode: 200, data: dto };
}
async function getCommandes(q = {}) {
    const page = Math.max(1, Math.floor(q.page ?? 1));
    const limit = Math.min(100, Math.max(1, Math.floor(q.limit ?? 10)));
    const where = {};
    if (typeof q.clientId === "number")
        where.clientId = q.clientId;
    if (q.statut)
        where.statut = q.statut;
    if (q.search) {
        where.adresseLivraison = { contains: q.search, mode: "insensitive" };
    }
    if (q.dateFrom || q.dateTo) {
        where.dateCommande = {};
        if (q.dateFrom)
            where.dateCommande.gte = new Date(q.dateFrom);
        if (q.dateTo)
            where.dateCommande.lte = new Date(q.dateTo);
    }
    if (typeof q.minTotal === "number" || typeof q.maxTotal === "number") {
        where.montantTotal = {};
        if (typeof q.minTotal === "number")
            where.montantTotal.gte = q.minTotal;
        if (typeof q.maxTotal === "number")
            where.montantTotal.lte = q.maxTotal;
    }
    if (q.produitId) {
        where.lignesCommande = { some: { produitId: q.produitId } };
    }
    const ALLOWED_ORDER_FIELDS = ["dateCommande", "montantTotal", "idCommande"];
    const rawOrderField = String(q.orderBy ?? "dateCommande");
    const orderField = ALLOWED_ORDER_FIELDS.includes(rawOrderField) ? rawOrderField : "dateCommande";
    const orderDir = (String(q.orderDir ?? "desc").toLowerCase() === "asc") ? "asc" : "desc";
    const skip = (page - 1) * limit;
    const [total, rows] = await prisma_1.default.$transaction([
        prisma_1.default.commande.count({ where }),
        prisma_1.default.commande.findMany({
            where,
            take: limit,
            skip,
            orderBy: { [orderField]: orderDir },
            include: {
                client: {
                    select: {
                        numeroTelephone: true,
                    },
                },
                retour: {
                    select: {
                        idRetour: true,
                    },
                },
                lignesCommande: {
                    select: {
                        idLigne: true,
                        produitId: true,
                        quantite: true,
                        prixUnitaire: true,
                        commandeId: true,
                    },
                },
            },
        }),
    ]);
    const commandes = rows.map((c) => ({
        idCommande: c.idCommande,
        dateCommande: c.dateCommande,
        statut: c.statut,
        qrSVG: c.qrSVG,
        adresseLivraison: c.adresseLivraison,
        montantTotal: c.montantTotal != null ? String(c.montantTotal) : "0",
        clientId: c.clientId,
        client: c.client?.numeroTelephone ?? null,
        retour: c.retour?.idRetour ?? null,
        ligne: (c.lignesCommande || []).map((l) => ({
            idLigne: l.idLigne,
            produitId: l.produitId,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire != null ? String(l.prixUnitaire) : "0",
            commandeId: l.commandeId,
        })),
    }));
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const meta = {
        total,
        page,
        limit,
        totalPages,
    };
    return { statusCode: 200, data: { commandes, meta } };
}
async function deleteCommande(idCommande, utilisateurId) {
    await (0, helpers_1.ensureExists)(() => prisma_1.default.commande.findUnique({ where: { idCommande } }), "Commande");
    await prisma_1.default.$transaction(async (tx) => {
        const lines = await tx.ligneCommande.findMany({
            where: { commandeId: idCommande },
            select: { quantite: true, produitId: true },
        });
        const totalsByProduit = lines.reduce((acc, l) => {
            acc[l.produitId] = (acc[l.produitId] || 0) + l.quantite;
            return acc;
        }, {});
        await tx.commande.deleteMany({ where: { idCommande } });
        const updates = Object.entries(totalsByProduit).map(([produitId, qty]) => tx.produit.update({
            where: { idProduit: produitId },
            data: { stock: { increment: qty } },
        }));
        await Promise.all(updates);
        await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `suppression de la commande ID=${idCommande}`);
    });
    return { statusCode: 200, message: "Commande supprimée" };
}
async function updateCommandeStatut(tx, idClient, statut) {
    await (0, helpers_1.ensureExists)(() => tx.client.findUnique({ where: { idClient } }), "Client");
    await prisma_1.default.commande.updateMany({
        where: { clientId: idClient },
        data: { statut },
    });
}
