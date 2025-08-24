"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const errorHandler = (err, req, res, next) => {
    if (err instanceof errors_1.BadRequestError) {
        res.status(400).json({
            error: err.name,
            message: err.message,
        });
        return;
    }
    if (err instanceof errors_1.NotFoundError) {
        res.status(404).json({
            error: err.name,
            message: err.message,
        });
        return;
    }
    if (err instanceof errors_1.ConflictError) {
        res.status(409).json({
            error: err.name,
            message: err.message,
        });
        return;
    }
    if (err instanceof errors_1.ValidationError) {
        res.status(422).json({
            error: err.name,
            message: err.message,
            details: err.details,
        });
        return;
    }
    console.error("[UnhandledError]", err);
    res.status(500).json({
        error: "InternalServerError",
        message: "An unexpected error occurred",
    });
};
exports.errorHandler = errorHandler;
