"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientController = createClientController;
exports.getAllClientsController = getAllClientsController;
exports.filterClientsController = filterClientsController;
exports.getClientByIdController = getClientByIdController;
exports.updateClientController = updateClientController;
exports.deleteClientController = deleteClientController;
const clients_service_1 = require("../services/clients.service");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function createClientController(req, res, next) {
    const dto = req.body;
    const userId = req.user.sub;
    const { statusCode, data } = await (0, clients_service_1.createClient)(dto, userId);
    res.status(statusCode).json({ data });
}
async function getAllClientsController(req, res, next) {
    const filter = req.query;
    const { statusCode, data } = await (0, clients_service_1.getAllClients)(filter);
    res.status(statusCode).json(data);
}
async function filterClientsController(req, res, next) {
    const filter = req.body;
    const { statusCode, data } = await (0, clients_service_1.getAllClients)(filter);
    res.status(statusCode).json(data);
}
async function getClientByIdController(req, res, next) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ statusCode: 400, message: "Invalid client ID" });
        return;
    }
    const { statusCode, data } = await (0, clients_service_1.getClientById)(id);
    res.status(statusCode).json(data);
}
async function updateClientController(req, res, next) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ statusCode: 400, message: "Invalid client ID" });
        return;
    }
    const dto = req.body;
    const userId = req.user.sub;
    const { statusCode, data } = await (0, clients_service_1.updateClient)(id, dto, userId);
    res.status(statusCode).json({ data });
}
async function deleteClientController(req, res, next) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        res
            .status(400)
            .json({ statusCode: 400, message: "Invalid client ID" });
    }
    const userId = req.user.sub;
    const { statusCode, message } = await (0, clients_service_1.deleteClient)(id, userId);
    res.status(statusCode).json({ message });
}
