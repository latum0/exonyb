
import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { Request, Response, NextFunction } from "express";


export const validateDtoClient = (DtoClass: any) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        const dtoObject = plainToInstance(DtoClass, req.body);


        const errors = await validate(dtoObject, {
            whitelist: true,
            forbidNonWhitelisted: true,
            forbidUnknownValues: true,
        });

        if (errors.length > 0) {

            const flatten = (errs: ValidationError[]): string[] =>
                errs.reduce<string[]>((acc, err) => {
                    if (err.constraints) {
                        acc.push(...Object.values(err.constraints));
                    }
                    if (err.children?.length) {
                        acc.push(...flatten(err.children));
                    }
                    return acc;
                }, []);
            res.status(400).json({
                statusCode: 400,
                message: "Validation failed",
                errors: flatten(errors),
            });

            return
        }


        req.body = dtoObject;
        next();
    };
};
