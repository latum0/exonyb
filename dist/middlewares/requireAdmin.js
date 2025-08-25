"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const client_1 = require("@prisma/client");
const requireAdmin = (req, res, next) => {
    const user = req.user;
    if (!user) {
        res.status(401).json({ statusCode: 401, message: "Accès interdit" });
        return;
    }
    if (user.role !== client_1.Role.ADMIN) {
        res.status(403).json({ statusCode: 403, message: "Accès interdit" });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
