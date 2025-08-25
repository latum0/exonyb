"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.BadRequestError = exports.ConflictError = exports.NotFoundError = void 0;
class NotFoundError extends Error {
    constructor(entity, context) {
        super(`${entity} not found ${context ? `:${context}` : ""}`);
        this.name = "NotFoundError";
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends Error {
    constructor(entity, field) {
        super(field ? `${entity} with this ${field} already exists` : `${entity} conflict`);
        this.name = "ConflictError";
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
exports.ConflictError = ConflictError;
class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.name = "BadRequestError";
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}
exports.BadRequestError = BadRequestError;
class ValidationError extends Error {
    constructor(message, details) {
        super(message);
        this.name = "ValidationError";
        this.details = details;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
exports.ValidationError = ValidationError;
