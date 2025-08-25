"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDtoClient = void 0;
require("reflect-metadata");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const errors_1 = require("../utils/errors");
const validateDtoClient = (DtoClass) => {
    return async (req, res, next) => {
        const dtoObject = (0, class_transformer_1.plainToInstance)(DtoClass, req.body);
        const errors = await (0, class_validator_1.validate)(dtoObject, {
            whitelist: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
        });
        if (errors.length > 0) {
            const flatten = (errs) => errs.reduce((acc, err) => {
                if (err.constraints) {
                    acc.push(...Object.values(err.constraints));
                }
                if (err.children?.length) {
                    acc.push(...flatten(err.children));
                }
                return acc;
            }, []);
            const details = flatten(errors);
            throw new errors_1.ValidationError("Validation failed", details);
        }
        req.body = dtoObject;
        next();
    };
};
exports.validateDtoClient = validateDtoClient;
