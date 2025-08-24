import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export const validateDto = (dtoClass: any) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dtoInstance = Object.assign(new dtoClass(), req.body);
      const errors = await validate(dtoInstance);

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
    } catch (error) {
      next(error);
    }
  };
};