import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../utils/errors";
import { CreateAccountingDto, GetAccountingQueryDto, UpdateAccountingDto } from "../dto/accounting.dto";
import { createAccounting, getAccountingById, getAllAccounting, updateAccounting } from "../services/accounting.service";







export async function createAccoutingController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = (req.user as { sub: number }).sub;
    const dto = req.body as CreateAccountingDto;

    const { statusCode, data } = await createAccounting(dto, userId)
    res.status(statusCode).json(data)

}

export async function updateAccoutingController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = (req.user as { sub: number }).sub;
    const dto = req.body as UpdateAccountingDto;
    const idAccounting = Number(req.params.id);
    if (isNaN(idAccounting)) {
        throw new BadRequestError("idAccounting should be a number")
    }
    const { statusCode, data } = await updateAccounting(idAccounting, dto, userId)
    res.status(statusCode).json(data)
}

export async function getByIdAccoutingController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const idAccounting = Number(req.params.id);
    if (isNaN(idAccounting)) {
        res.status(400).json({ statusCode: 400, message: "Invalid client ID" });
        return;
    } const { statusCode, data } = await getAccountingById(idAccounting)
    res.status(statusCode).json(data)

}

export async function getAllAccoutingController(req: Request, res: Response, next: NextFunction): Promise<void> {

    const query = (req as any).validatedQuery ?? req.query;
    const { statusCode, data } = await getAllAccounting(query)
    res.status(statusCode).json(data)

}