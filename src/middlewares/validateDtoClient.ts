

import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError as ClassValidatorError } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/errors";

export const validateDtoClient = (DtoClass: any, source: "body" | "query" = "body") => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = source === "query" ? req.query : req.body;
            const dtoObject = plainToInstance(DtoClass, data);

            const errors = await validate(dtoObject, {
                whitelist: true,
                forbidNonWhitelisted: true,
                forbidUnknownValues: true,
            });

            if (errors.length > 0) {
                const flatten = (errs: ClassValidatorError[]): string[] =>
                    errs.flatMap(err => [
                        ...(err.constraints ? Object.values(err.constraints) : []),
                        ...(err.children?.length ? flatten(err.children) : []),
                    ]);

                const details = flatten(errors);
                return next(new ValidationError("Validation failed", details));
            }

            if (source === "query") {
                req.query = dtoObject as any;
            } else {
                req.body = dtoObject;
            }

            return next();
        } catch (err) {
            return next(err);
        }
    };
};