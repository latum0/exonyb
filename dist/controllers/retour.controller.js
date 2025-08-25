"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRetourController = createRetourController;
exports.getAllRetoursController = getAllRetoursController;
exports.filterRetoursController = filterRetoursController;
exports.getretourByIdController = getretourByIdController;
exports.updateRetourController = updateRetourController;
exports.deleteRetourController = deleteRetourController;
const retour_service_1 = require("../services/retour.service");
const errors_1 = require("../utils/errors");
async function createRetourController(req, res, next) {
    const dto = req.body;
    const userId = req.user.sub;
    const { statusCode, data, error } = await (0, retour_service_1.createRetour)(dto, userId);
    if (error) {
        res.status(statusCode).json({ error: error });
        return;
    }
    res.status(statusCode).json(data);
    return;
}
async function getAllRetoursController(req, res, next) {
    const raw = req.query;
    const filters = {
        page: raw.page ? parseInt(raw.page, 10) : undefined,
        perPage: raw.perPage ? parseInt(raw.perPage, 10) : undefined,
        dateFrom: raw.dateFrom,
        dateTo: raw.dateTo,
        search: raw.search,
        statutRetour: raw.statutRetour,
    };
    const { statusCode, data } = await (0, retour_service_1.getAllRetours)(filters);
    res.status(statusCode).json(data);
}
async function filterRetoursController(req, res, next) {
    const filters = req.body;
    const { statusCode, data } = await (0, retour_service_1.getAllRetours)(filters);
    res.status(statusCode).json(data);
}
async function getretourByIdController(req, res, next) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new errors_1.BadRequestError(`Invalid id parameter: "${req.params.id}"`);
    }
    const { statusCode, data } = await (0, retour_service_1.getRetourById)(id);
    res.status(statusCode).json(data);
    return;
}
async function updateRetourController(req, res, next) {
    const dto = req.body;
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new errors_1.BadRequestError(`Invalid id parameter: "${req.params.id}"`);
    }
    const userId = req.user.sub;
    const { data, statusCode } = await (0, retour_service_1.updateRetour)(id, dto, userId);
    res.status(statusCode).json(data);
}
async function deleteRetourController(req, res, next) {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new errors_1.BadRequestError(`Invalid id parameter: "${req.params.id}"`);
    }
    const userId = req.user.sub;
    const { statusCode, data, message } = await (0, retour_service_1.deleteRetour)(id, userId);
    res.status(statusCode).json({ data, message });
}
