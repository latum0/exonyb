"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFournisseur = createFournisseur;
exports.updateFournisseur = updateFournisseur;
exports.getFournisseurById = getFournisseurById;
exports.getAllFournisseur = getAllFournisseur;
exports.deleteFournisseur = deleteFournisseur;
const helpers_1 = require("../utils/helpers");
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
const historique_service_1 = require("./historique.service");
const prisma_1 = __importDefault(require("../prisma"));
async function createFournisseur(data, utilisateurId) {
    try {
        const { produitIds, ...fournisseurData } = data;
        if (produitIds && produitIds.length > 0) {
            const foundProducts = await prisma_1.default.produit.findMany({
                where: { idProduit: { in: produitIds } },
                select: { idProduit: true },
            });
            const foundIds = foundProducts.map((p) => p.idProduit);
            const missing = produitIds.filter((id) => !foundIds.includes(id));
            if (missing.length > 0) {
                throw new errors_1.NotFoundError("Produit", `The following product IDs do not exist: ${missing.join(", ")}`);
            }
        }
        const result = await prisma_1.default.$transaction(async (tx) => {
            const fournisseur = await tx.fournisseur.create({
                data: {
                    ...fournisseurData,
                    produits: produitIds && produitIds.length > 0
                        ? { connect: produitIds.map((id) => ({ idProduit: id })) }
                        : undefined,
                },
            });
            await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Création du fournisseur ${fournisseur.nom}`);
            return fournisseur;
        });
        return { statusCode: 201, data: result };
    }
    catch (err) {
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002") {
            const field = Array.isArray(err.meta?.target)
                ? err.meta.target[0]
                : err.meta?.target;
            throw new errors_1.ConflictError("Fournisseur", field);
        }
        throw err;
    }
}
async function updateFournisseur(id, data, utilisateurId) {
    await (0, helpers_1.ensureExists)(() => prisma_1.default.fournisseur.findUnique({ where: { idFournisseur: id } }), "Fournisseur");
    try {
        const stripData = (0, helpers_1.stripNullish)(data);
        const updated = await prisma_1.default.$transaction(async (tx) => {
            const fournisseur = await tx.fournisseur.update({
                where: { idFournisseur: id },
                data: stripData,
            });
            await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Modification du fournisseur ${fournisseur.nom} `);
            return fournisseur;
        });
        return { statusCode: 200, data: updated };
    }
    catch (err) {
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002") {
            const field = Array.isArray(err.meta?.target)
                ? err.meta.target[0]
                : err.meta?.target;
            throw new errors_1.ConflictError("Fournisseur", field);
        }
        throw err;
    }
}
async function getFournisseurById(id) {
    const find = await prisma_1.default.fournisseur.findFirst({
        where: { idFournisseur: id },
    });
    if (!find) {
        return { statusCode: 404, error: "Not found" };
    }
    return { statusCode: 200, data: find };
}
async function getAllFournisseur(opts) {
    const { skip = 0, take = 100 } = opts || {};
    const list = await prisma_1.default.fournisseur.findMany({
        skip,
        take,
        orderBy: { nom: "asc" },
    });
    return {
        statusCode: 200,
        data: list,
    };
}
async function deleteFournisseur(id, utilisateurId) {
    await (0, helpers_1.ensureExists)(() => prisma_1.default.fournisseur.findUnique({ where: { idFournisseur: id } }), "Fournisseur");
    await prisma_1.default.$transaction(async (tx) => {
        await tx.fournisseur.update({
            where: { idFournisseur: id },
            data: { produits: { set: [] } },
        });
        const deleted = await tx.fournisseur.delete({
            where: { idFournisseur: id },
        });
        await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Suppression du fournisseur ${deleted.nom}`);
    });
    return {
        statusCode: 200,
        message: "Fournisseur supprimé avec succès.",
    };
}
