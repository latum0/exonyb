"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToBlacklist = addToBlacklist;
exports.deleteFromBlacklist = deleteFromBlacklist;
exports.getAllBlacklistedClients = getAllBlacklistedClients;
exports.getBlacklistedClientById = getBlacklistedClientById;
const helpers_1 = require("../utils/helpers");
const client_1 = require("@prisma/client");
const historique_service_1 = require("./historique.service");
const prisma_1 = __importDefault(require("../prisma"));
async function addToBlacklist(id, utilisateurId) {
    const client = await (0, helpers_1.ensureExists)(() => prisma_1.default.client.findUnique({ where: { idClient: id } }), "Client");
    if (client.statut === client_1.ClientStatut.BLACKLISTED) {
        return { statusCode: 409, message: "Client already blacklisted" };
    }
    const blacklisted = await prisma_1.default.$transaction(async (tx) => {
        const updated = await tx.client.update({
            where: { idClient: id },
            data: { statut: client_1.ClientStatut.BLACKLISTED },
        });
        await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Ajout du client ${updated.nom} ${updated.prenom} à la liste noire`);
        return updated;
    });
    return {
        statusCode: 200,
        data: blacklisted,
        message: "Client ajouté à la liste noire.",
    };
}
async function deleteFromBlacklist(id, utilisateurId) {
    const client = await (0, helpers_1.ensureExists)(() => prisma_1.default.client.findUnique({ where: { idClient: id } }), "Client");
    if (client.statut === client_1.ClientStatut.ACTIVE) {
        return { statusCode: 409, message: "Client already active" };
    }
    const activated = await prisma_1.default.$transaction(async (tx) => {
        const updated = await tx.client.update({
            where: { idClient: id },
            data: { statut: client_1.ClientStatut.ACTIVE },
        });
        await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Suppression du client ${updated.nom}  ${updated.prenom} de la liste noire`);
        return updated;
    });
    return {
        statusCode: 200,
        data: activated,
        message: "Client retiré de la liste noire.",
    };
}
async function getAllBlacklistedClients(opts) {
    const { skip = 0, take = 100 } = opts || {};
    const list = await prisma_1.default.client.findMany({
        where: { statut: client_1.ClientStatut.BLACKLISTED },
        skip,
        take,
        orderBy: { nom: "asc" },
        include: { commentaires: true },
    });
    return { statusCode: 200, data: list, message: "List of the blacklist." };
}
async function getBlacklistedClientById(id) {
    const blacklistedClient = await (0, helpers_1.ensureExists)(() => prisma_1.default.client.findUnique({
        where: { idClient: id, statut: client_1.ClientStatut.BLACKLISTED },
        include: { commentaires: true },
    }), "Blacklisted client");
    return { statusCode: 200, data: blacklistedClient };
}
