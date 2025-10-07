"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDtoClient = void 0;
require("reflect-metadata");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const errors_1 = require("../utils/errors");
const validateDtoClient = (DtoClass, source = "body") => {
    return async (req, res, next) => {
        try {
            const data = source === "query" ? req.query : req.body;
            const dtoObject = (0, class_transformer_1.plainToInstance)(DtoClass, data);
            const errors = await (0, class_validator_1.validate)(dtoObject, {
                whitelist: true,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
            });
            if (errors.length > 0) {
                const flatten = (errs) => errs.flatMap(err => [
                    ...(err.constraints ? Object.values(err.constraints) : []),
                    ...(err.children?.length ? flatten(err.children) : []),
                ]);
                const details = flatten(errors);
                return next(new errors_1.ValidationError("Validation failed", details));
            }
            if (source === "query") {
                req.query = dtoObject;
            }
            else {
                req.body = dtoObject;
            }
            return next();
        }
        catch (err) {
            return next(err);
        }
    };
};
exports.validateDtoClient = validateDtoClient;
