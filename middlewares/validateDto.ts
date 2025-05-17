import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { Request, Response, NextFunction } from "express";

export function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoObject = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoObject);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors
          .map((e) => (e.constraints ? Object.values(e.constraints) : []))
          .flat(),
      });
    }
    next();
  };
}
