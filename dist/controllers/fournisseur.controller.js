"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFournisseurController = createFournisseurController;
exports.updateFournisseurController = updateFournisseurController;
exports.getFournisseurByIdController = getFournisseurByIdController;
exports.getAllFournisseurController = getAllFournisseurController;
exports.deleteFournisseurController = deleteFournisseurController;
const fournisseur_service_1 = require("../services/fournisseur.service");
const errors_1 = require("../utils/errors");
async function createFournisseurController(req, res, next) {
    const dto = req.body;
    const userId = req.user.sub;
    const { data, statusCode } = await (0, fournisseur_service_1.createFournisseur)(dto, userId);
    res.status(statusCode).json(data);
}
async function updateFournisseurController(req, res, next) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new errors_1.BadRequestError(`Invalid id parameter: "${req.params.id}"`);
    }
    const userId = req.user.sub;
    const dto = req.body;
    const { data, statusCode } = await (0, fournisseur_service_1.updateFournisseur)(id, dto, userId);
    res.status(statusCode).json(data);
}
async function getFournisseurByIdController(req, res, next) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new errors_1.BadRequestError(`Invalid id parameter: "${req.params.id}"`);
    }
    const { data, statusCode } = await (0, fournisseur_service_1.getFournisseurById)(id);
    res.status(statusCode).json(data ?? { message: "Not found" });
}
async function getAllFournisseurController(req, res, next) {
    const { data, error, statusCode } = await (0, fournisseur_service_1.getAllFournisseur)(req.query);
    res.status(statusCode).json({ data, error });
}
async function deleteFournisseurController(req, res, next) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new errors_1.BadRequestError(`Invalid id parameter: "${req.params.id}"`);
    }
    const userId = req.user.sub;
    const { statusCode, message } = await (0, fournisseur_service_1.deleteFournisseur)(id, userId);
    res.status(statusCode).json(message);
    return;
}
