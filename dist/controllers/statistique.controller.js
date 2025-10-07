"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommandeStatsController = getCommandeStatsController;
exports.getPourcentageClientsParProduitController = getPourcentageClientsParProduitController;
exports.getPourcentageRetoursParProduitController = getPourcentageRetoursParProduitController;
exports.getPourcentageRetoursCommandeController = getPourcentageRetoursCommandeController;
const statistique_service_1 = require("../services/statistique.service");
async function getCommandeStatsController(req, res, next) {
    const query = req.query;
    const { statusCode, data } = await (0, statistique_service_1.commandeParDateParProduit)(query);
    res.status(statusCode).json(data);
}
async function getPourcentageClientsParProduitController(req, res, next) {
    const query = req.query;
    const { statusCode, data } = await (0, statistique_service_1.ClientsParProduitParDate)(query);
    res.status(statusCode).json(data);
}
async function getPourcentageRetoursParProduitController(req, res, next) {
    const query = req.query;
    const { statusCode, data } = await (0, statistique_service_1.RetoursParProduitParDate)(query);
    res.status(statusCode).json(data);
}
async function getPourcentageRetoursCommandeController(req, res, next) {
    const query = req.query;
    const { statusCode, data } = await (0, statistique_service_1.RetoursParDateParProduit)(query);
    res.status(statusCode).json(data);
}
