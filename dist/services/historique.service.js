"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHistoriqueService = createHistoriqueService;
exports.getHistoriqueById = getHistoriqueById;
exports.getAllHistoriques = getAllHistoriques;
exports.deleteOldHistoriques = deleteOldHistoriques;
exports.deleteHistoriqueById = deleteHistoriqueById;
const helpers_1 = require("../utils/helpers");
const prisma_1 = __importDefault(require("../prisma"));
async function createHistoriqueService(tx, utilisateurId, descriptionAction) {
    const user = await (0, helpers_1.ensureExists)(() => tx.users.findUnique({ where: { id: utilisateurId } }), "User");
    const dateModification = new Date();
    await tx.historique.create({
        data: {
            dateModification,
            descriptionAction,
            utilisateurId,
        },
    });
}
async function getHistoriqueById(id) {
    const historique = await (0, helpers_1.ensureExists)(() => prisma_1.default.historique.findUnique({ where: { idHistorique: id } }), "Historique");
    return { statusCode: 200, data: historique };
}
async function getAllHistoriques(filters = {}) {
    const page = filters.page ? parseInt(filters.page) : 1;
    const perPage = filters.perPage ? parseInt(filters.perPage) : 25;
    const skip = (page - 1) * perPage;
    const where = {};
    if (filters.acteur) {
        where.utilisateur = {
            name: {
                contains: filters.acteur,
            },
        };
    }
    if (filters.descriptionAction) {
        where.descriptionAction = { contains: filters.descriptionAction };
    }
    if (filters.utilisateurId) {
        where.utilisateurId = Number(filters.utilisateurId);
    }
    if (filters.dateFrom || filters.dateTo) {
        where.dateModification = {};
        if (filters.dateFrom)
            where.dateModification.gte = new Date(filters.dateFrom);
        if (filters.dateTo)
            where.dateModification.lte = new Date(filters.dateTo);
    }
    try {
        const [total, historiques] = await Promise.all([
            prisma_1.default.historique.count({ where }),
            prisma_1.default.historique.findMany({
                where,
                skip,
                take: perPage,
                select: {
                    idHistorique: true,
                    dateModification: true,
                    descriptionAction: true,
                    utilisateur: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: { dateModification: "desc" },
            }),
        ]);
        return {
            statusCode: 200,
            data: {
                data: historiques,
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
        console.error("Error in getAllHistoriques:", e);
        throw e;
    }
}
async function deleteOldHistoriques() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await prisma_1.default.historique.deleteMany({
        where: {
            dateModification: {
                lt: oneWeekAgo,
            },
        },
    });
    return { count: result.count };
}
async function deleteHistoriqueById(id, utilisateurId) {
    await (0, helpers_1.ensureExists)(() => prisma_1.default.historique.findUnique({ where: { idHistorique: id } }), "Historique");
    await prisma_1.default.$transaction(async (tx) => {
        const deleted = await tx.historique.delete({
            where: { idHistorique: id },
        });
    });
    return {
        statusCode: 200,
        message: "Historique supprimé avec succès.",
    };
}
