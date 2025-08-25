"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRetour = createRetour;
exports.getAllRetours = getAllRetours;
exports.getRetourById = getRetourById;
exports.updateRetour = updateRetour;
exports.deleteRetour = deleteRetour;
const client_1 = require("@prisma/client");
const historique_service_1 = require("./historique.service");
const prisma_1 = __importDefault(require("../prisma"));
const errors_1 = require("../utils/errors");
const helpers_1 = require("../utils/helpers");
async function createRetour(data, utilisateurId) {
    await (0, helpers_1.ensureExists)(() => prisma_1.default.commande.findUnique({ where: { idCommande: data.commandeId } }), "Order");
    await (0, helpers_1.ensureUnique)(() => prisma_1.default.retour.findUnique({ where: { commandeId: data.commandeId } }), "Return for this order");
    try {
        const newRetour = await prisma_1.default.$transaction(async (tx) => {
            const created = await tx.retour.create({
                data: {
                    dateRetour: new Date(data.dateRetour),
                    statutRetour: data.statutRetour,
                    raisonRetour: data.raisonRetour,
                    commande: { connect: { idCommande: data.commandeId } },
                },
            });
            await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Création du retour pour commande ID=${data.commandeId}`);
            return created;
        });
        return { statusCode: 201, data: newRetour };
    }
    catch (err) {
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002") {
            throw new errors_1.ConflictError(`Un retour existe déjà pour la commande ID=${data.commandeId}.`);
        }
        throw err;
    }
}
async function getAllRetours(filters = {}) {
    const page = filters.page ?? 1;
    const perPage = filters.perPage ?? 25;
    const skip = (page - 1) * perPage;
    const where = {};
    if (filters.statutRetour) {
        where.statutRetour = filters.statutRetour;
    }
    if (filters.dateFrom || filters.dateTo) {
        where.dateRetour = {};
        if (filters.dateFrom)
            where.dateRetour.gte = new Date(filters.dateFrom);
        if (filters.dateTo)
            where.dateRetour.lte = new Date(filters.dateTo);
    }
    if (filters.search) {
        where.raisonRetour = {
            contains: filters.search,
        };
    }
    try {
        const [total, retours] = await Promise.all([
            prisma_1.default.retour.count({ where }),
            prisma_1.default.retour.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { dateRetour: "asc" },
            }),
        ]);
        return {
            statusCode: 200,
            data: {
                data: retours,
                meta: {
                    total,
                    page,
                    perPage,
                    totalPages: Math.ceil(total / perPage),
                },
            },
        };
    }
    catch (e) {
        console.error("Error in getAllRetours:", e);
        throw e;
    }
}
async function getRetourById(id) {
    const retour = await (0, helpers_1.ensureExists)(() => prisma_1.default.retour.findUnique({ where: { idRetour: id } }), "Retour");
    return { statusCode: 200, data: retour };
}
async function updateRetour(id, data, utilisateurId) {
    await (0, helpers_1.ensureExists)(() => prisma_1.default.retour.findUnique({ where: { idRetour: id } }), "Retour");
    if (data.commandeId) {
        await (0, helpers_1.ensureExists)(() => prisma_1.default.commande.findUnique({ where: { idCommande: data.commandeId } }), "Commande");
        await (0, helpers_1.ensureUnique)(() => prisma_1.default.retour.findUnique({ where: { commandeId: data.commandeId } }), "Retour");
    }
    const stripData = (0, helpers_1.stripNullish)(data);
    const updatedRetour = await prisma_1.default.$transaction(async (tx) => {
        const before = await tx.retour.findUnique({ where: { idRetour: id } });
        const retour = await tx.retour.update({
            where: { idRetour: id },
            data: { ...stripData },
        });
        await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Modification du retour ID=${id}`);
        return retour;
    });
    return { statusCode: 200, data: updatedRetour };
}
async function deleteRetour(id, utilisateurId) {
    await (0, helpers_1.ensureExists)(() => prisma_1.default.retour.findUnique({ where: { idRetour: id } }), "Retour");
    await prisma_1.default.$transaction(async (tx) => {
        const deleted = await tx.retour.delete({ where: { idRetour: id } });
        await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Suppression du retour ID=${deleted.idRetour}`);
    });
    return { statusCode: 200, message: "Retour supprimé avec succès." };
}
