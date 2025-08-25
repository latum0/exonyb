"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDto = void 0;
const class_validator_1 = require("class-validator");
const validateDto = (dtoClass) => {
    return async (req, res, next) => {
        try {
            const dtoInstance = Object.assign(new dtoClass(), req.body);
            const errors = await (0, class_validator_1.validate)(dtoInstance);
            if (errors.length > 0) {
                const message = errors
                    .map((err) => Object.values(err.constraints || {}))
                    .flat();
                res.status(400).json({
                    statusCode: 400,
                    message: "Validation failed",
                    errors: message,
                });
                return;
            }
            req.body = dtoInstance;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateDto = validateDto;
