"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommandeController = createCommandeController;
exports.getCommandeByIdController = getCommandeByIdController;
exports.getAllCommandesController = getAllCommandesController;
exports.deleteCommandeController = deleteCommandeController;
exports.updateCommandeController = updateCommandeController;
exports.updateCommandeMontantController = updateCommandeMontantController;
const commande_service_1 = require("../services/commande.service");
const errors_1 = require("../utils/errors");
async function createCommandeController(req, res, next) {
    try {
        const dto = req.body;
        const userId = req.user.sub;
        const { statusCode, data, error, message } = await (0, commande_service_1.createCommande)(dto, userId);
        res.status(statusCode).json({ data, message, error });
    }
    catch (err) {
        next(err);
    }
}
async function getCommandeByIdController(req, res, next) {
    const { id } = req.params;
    if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
        throw new errors_1.BadRequestError("Invalid idCommande");
    }
    const { statusCode, data, error } = await (0, commande_service_1.getCommandeById)(id);
    res.status(statusCode).json({ data, error });
}
async function getAllCommandesController(req, res, next) {
    const filter = req.query;
    const { statusCode, data } = await (0, commande_service_1.getCommandes)(filter);
    res.status(statusCode).json(data);
}
async function deleteCommandeController(req, res, next) {
    try {
        const { id } = req.params;
        if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
            throw new errors_1.BadRequestError("Invalid idCommande");
        }
        const userId = req.user.sub;
        const { statusCode, message } = await (0, commande_service_1.deleteCommande)(id, userId);
        res.status(statusCode).json({ message });
    }
    catch (err) {
        next(err);
    }
}
async function updateCommandeController(req, res, next) {
    const idCommande = req.params.id;
    if (!idCommande)
        return next(new errors_1.BadRequestError("Missing commande id in params"));
    const body = req.body;
    const utilisateur = req.user;
    const utilisateurId = utilisateur.id;
    const result = await (0, commande_service_1.updateCommande)(idCommande, body, utilisateurId);
    res.status(result.statusCode || 200).json(result.data);
}
async function updateCommandeMontantController(req, res, next) {
    const idCommande = req.params.id;
    if (!idCommande)
        return next(new errors_1.BadRequestError("Missing commande id in params"));
    const { montantT } = req.body;
    if (montantT === null || montantT === undefined) {
        return next(new errors_1.BadRequestError("Missing montantT in body"));
    }
    const utilisateur = req.user;
    const utilisateurId = utilisateur?.id;
    const montantTStr = typeof montantT === "string" ? montantT : String(montantT);
    const result = await (0, commande_service_1.updateCommandeMontantT)(idCommande, montantTStr, utilisateurId);
    res.status(result.statusCode || 200).json(result.data);
}
