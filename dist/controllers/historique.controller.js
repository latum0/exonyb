"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllHistoriquesController = getAllHistoriquesController;
exports.getHistoriqueByIdController = getHistoriqueByIdController;
exports.deleteHistoriqueByIdController = deleteHistoriqueByIdController;
exports.deleteOldHistoriquesController = deleteOldHistoriquesController;
const historique_service_1 = require("../services/historique.service");
async function getAllHistoriquesController(req, res, next) {
    const filters = req.query;
    const { statusCode, data } = await (0, historique_service_1.getAllHistoriques)(filters);
    res.status(statusCode).json(data);
}
async function getHistoriqueByIdController(req, res, next) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ statusCode: 400, message: "Invalid historique ID" });
        return;
    }
    const { statusCode, data } = await (0, historique_service_1.getHistoriqueById)(id);
    res.status(statusCode).json(data);
}
async function deleteHistoriqueByIdController(req, res, next) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ statusCode: 400, message: "Invalid historique ID" });
        return;
    }
    const userId = req.user.sub;
    const { statusCode, message } = await (0, historique_service_1.deleteHistoriqueById)(id, userId);
    res.status(statusCode).json({ message });
}
async function deleteOldHistoriquesController(req, res, next) {
    const result = await (0, historique_service_1.deleteOldHistoriques)();
    res.status(200).json({ deleted: result.count });
}
