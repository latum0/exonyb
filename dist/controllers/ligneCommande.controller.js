"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLignePrixUnitaireController = updateLignePrixUnitaireController;
exports.getLigneByIdController = getLigneByIdController;
exports.getLigneByCommandeController = getLigneByCommandeController;
const errors_1 = require("../utils/errors");
const ligneCommande_service_1 = require("../services/ligneCommande.service");
async function updateLignePrixUnitaireController(req, res, next) {
    const dto = req.body;
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new errors_1.BadRequestError(`Invalid id parameter: "${req.params.id}"`);
    }
    const userId = req.user.sub;
    const { statusCode, data } = await (0, ligneCommande_service_1.updateLignePrixUnitaire)(id, dto, userId);
    res.status(statusCode).json({ data });
}
async function getLigneByIdController(req, res, next) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new errors_1.BadRequestError(`Invalid id parameter: "${req.params.id}"`);
    }
    const { statusCode, data } = await (0, ligneCommande_service_1.getLigneById)(id);
    res.status(statusCode).json(data);
    return;
}
async function getLigneByCommandeController(req, res, next) {
    const commandeId = req.params.id;
    if (!commandeId || typeof commandeId !== "string") {
        return next(new errors_1.BadRequestError(`Invalid commande id parameter: "${String(req.params.id)}"`));
    }
    const { statusCode, data } = await (0, ligneCommande_service_1.getLignesByCommande)(commandeId);
    res.status(statusCode).json(data);
    return;
}
