"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToBlacklistController = addToBlacklistController;
exports.deleteFromBlacklistController = deleteFromBlacklistController;
exports.getAllBlacklistedClientsController = getAllBlacklistedClientsController;
exports.getBlacklistedClientsByIdController = getBlacklistedClientsByIdController;
const errors_1 = require("../utils/errors");
const liste_noire_service_1 = require("../services/liste-noire.service");
async function addToBlacklistController(req, res, next) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new errors_1.BadRequestError(`Invalid id parameter: "${req.params.id}"`);
    }
    const userId = req.user.sub;
    const { data, statusCode, message } = await (0, liste_noire_service_1.addToBlacklist)(id, userId);
    res.status(statusCode).json({ data, message });
}
async function deleteFromBlacklistController(req, res, next) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new errors_1.BadRequestError(`Invalid id parameter: "${req.params.id}"`);
    }
    const userId = req.user.sub;
    const { data, statusCode, message } = await (0, liste_noire_service_1.deleteFromBlacklist)(id, userId);
    res.status(statusCode).json({ data, message });
}
async function getAllBlacklistedClientsController(req, res) {
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 100;
    const { data, statusCode, message } = await (0, liste_noire_service_1.getAllBlacklistedClients)({
        skip,
        take,
    });
    res.status(statusCode).json({ data, message });
}
async function getBlacklistedClientsByIdController(req, res, next) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new errors_1.BadRequestError(`Invalid id parameter: "${req.params.id}"`);
    }
    const { data, statusCode, message } = await (0, liste_noire_service_1.getBlacklistedClientById)(id);
    res.status(statusCode).json({ data, message });
}
