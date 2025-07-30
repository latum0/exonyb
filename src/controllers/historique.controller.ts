import { Request, Response, NextFunction } from "express";
import { getAllHistoriques, getHistoriqueById, deleteHistoriqueById, deleteOldHistoriques } from "../services/historique.service";

export async function getAllHistoriquesController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    const filters = req.query;
    const { statusCode, data } = await getAllHistoriques(filters);
    res.status(statusCode).json(data);

}

export async function getHistoriqueByIdController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    const id = Number(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ statusCode: 400, message: "Invalid historique ID" });
        return;
    }
    const { statusCode, data } = await getHistoriqueById(id);
    res.status(statusCode).json(data);

}

export async function deleteHistoriqueByIdController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    const id = Number(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ statusCode: 400, message: "Invalid historique ID" });
        return;
    }
    const userId = (req.user as { sub: number }).sub;
    const { statusCode, message } = await deleteHistoriqueById(id, userId);
    res.status(statusCode).json({ message });
}

export async function deleteOldHistoriquesController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    const result = await deleteOldHistoriques();
    res.status(200).json({ deleted: result.count });

} 