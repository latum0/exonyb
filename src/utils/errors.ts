export class NotFoundError extends Error {
    constructor(entity: string, context?: string) {
        super(`${entity} introuvable${context ? `: ${context}` : ""}`);
        this.name = "NotFoundError";
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ConflictError extends Error {
    constructor(entity: string, field?: string) {
        super(field ? `${entity} avec ce ${field} existe déjà` : `${entity} en conflit`);
        this.name = "ConflictError";
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}


export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BadRequestError"
        Object.setPrototypeOf(this, BadRequestError.prototype)
    }
}

export class ValidationError extends Error {
    public readonly details?: unknown;

    constructor(message: string, details?: unknown) {
        super(message);
        this.name = "ValidationError";
        this.details = details;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
