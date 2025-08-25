"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
exports.getAllClients = getAllClients;
exports.getClientById = getClientById;
exports.updateClient = updateClient;
exports.deleteClient = deleteClient;
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
const errors_1 = require("../utils/errors");
const helpers_1 = require("../utils/helpers");
const historique_service_1 = require("./historique.service");
const prisma_1 = __importDefault(require("../prisma"));
async function createClient(dto, utilisateurId) {
    try {
        const { commentaires, ...clientData } = dto;
        const newClient = await prisma_1.default.$transaction(async (tx) => {
            const client = await tx.client.create({ data: clientData });
            if (commentaires?.length) {
                const commentaireInputs = commentaires.map((c) => ({
                    contenu: c.contenu,
                    clientId: client.idClient,
                }));
                await tx.commentaire.createMany({ data: commentaireInputs });
            }
            await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Création du client ${dto.nom} ${dto.prenom}`);
            return client;
        });
        return { statusCode: 201, data: newClient };
    }
    catch (err) {
        if (err instanceof library_1.PrismaClientKnownRequestError && err.code === "P2002") {
            const field = Array.isArray(err.meta?.target)
                ? err.meta.target[0]
                : err.meta?.target;
            throw new errors_1.ConflictError("Client", field);
        }
        throw err;
    }
}
async function getAllClients(filter = {}) {
    const perPage = filter.perPage ? parseInt(filter.perPage) : 25;
    const page = filter.page ? parseInt(filter.page) : 1;
    const skip = (page - 1) * perPage;
    const baseWhere = {};
    if (filter.nom)
        baseWhere.nom = filter.nom;
    if (filter.prenom)
        baseWhere.prenom = filter.prenom;
    if (filter.adresse)
        baseWhere.adresse = filter.adresse;
    if (filter.email)
        baseWhere.email = filter.email;
    if (filter.numeroTelephone)
        baseWhere.numeroTelephone = filter.numeroTelephone;
    if (filter.search) {
        baseWhere.OR = [
            { nom: { contains: filter.search } },
            { prenom: { contains: filter.search } },
            { adresse: { contains: filter.search } },
            { email: { contains: filter.search } },
            { numeroTelephone: { contains: filter.search } },
        ];
    }
    const statutCondition = filter.statut
        ? filter.statut
        : { not: client_1.ClientStatut.BLACKLISTED };
    const where = {
        ...baseWhere,
        statut: statutCondition,
    };
    try {
        const [total, clients] = await Promise.all([
            prisma_1.default.client.count({ where }),
            prisma_1.default.client.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { nom: "asc" },
                include: {
                    commentaires: {
                        take: 5,
                        orderBy: { dateCreated: "desc" },
                    },
                },
            }),
        ]);
        return {
            statusCode: 200,
            data: {
                data: clients,
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
        console.error("Error in getAllClients:", e);
        throw e;
    }
}
async function getClientById(id) {
    const find = await prisma_1.default.client.findFirst({
        where: { idClient: id },
        include: {
            commentaires: {
                take: 5,
                orderBy: { dateCreated: "desc" },
            },
        },
    });
    if (!find) {
        return { statusCode: 404, error: "Not found" };
    }
    return { statusCode: 200, data: find };
}
async function updateClient(id, dto, utilisateurId) {
    await (0, helpers_1.ensureExists)(() => prisma_1.default.client.findUnique({ where: { idClient: id } }), "Client");
    const { commentaires, ...rest } = dto;
    const data = (0, helpers_1.stripNullish)(rest);
    if (data.email || data.numeroTelephone) {
        const existing = await prisma_1.default.client.findFirst({
            where: {
                idClient: { not: id },
                OR: [
                    data.email ? { email: data.email } : undefined,
                    data.numeroTelephone
                        ? { numeroTelephone: data.numeroTelephone }
                        : undefined,
                ].filter(Boolean),
            },
        });
        if (existing) {
            throw new errors_1.ConflictError("Client", data.email && existing.email === data.email
                ? "email"
                : "numeroTelephone");
        }
    }
    try {
        const updatedClient = await prisma_1.default.$transaction(async (tx) => {
            const client = await tx.client.update({
                where: { idClient: id },
                data,
                include: { commentaires: true },
            });
            if (commentaires?.length) {
                const inputs = commentaires.map((c) => ({
                    contenu: c.contenu,
                    clientId: id,
                }));
                await tx.commentaire.createMany({ data: inputs });
            }
            await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `Modification du client ${client.nom} ${client.prenom}`);
            return client;
        });
        return { statusCode: 200, data: updatedClient };
    }
    catch (err) {
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002") {
            const field = Array.isArray(err.meta?.target)
                ? err.meta.target[0]
                : err.meta?.target;
            throw new errors_1.ConflictError("Client", field);
        }
        throw err;
    }
}
async function deleteClient(id, utilisateurId) {
    const client = await (0, helpers_1.ensureExists)(() => prisma_1.default.client.findUnique({ where: { idClient: id } }), "Client");
    await prisma_1.default.$transaction(async (tx) => {
        await tx.commentaire.deleteMany({ where: { clientId: id } });
        await tx.client.delete({ where: { idClient: id } });
        await (0, historique_service_1.createHistoriqueService)(tx, utilisateurId, `suppression du client ${client.nom} ${client.prenom}`);
    });
    return {
        statusCode: 200,
        message: "Client deleted successfully.",
    };
}
