import { NextFunction, Response, Request } from "express";
import { UpdatePrixUnitaireLigneDto } from "../dto/ligneCommande.dto";
import { BadRequestError } from "../utils/errors";
import { getLigneById, getLignesByCommande, updateLignePrixUnitaire } from "../services/ligneCommande.service";


export async function updateLignePrixUnitaireController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = req.body as UpdatePrixUnitaireLigneDto;
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new BadRequestError(`Invalid id parameter: "${req.params.id}"`)
    }

    const userId = (req.user as { sub: number }).sub;

    const { statusCode, data } = await updateLignePrixUnitaire(id, dto, userId)
    res.status(statusCode).json({ data })

}


export async function getLigneByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new BadRequestError(`Invalid id parameter: "${req.params.id}"`);
    }
    const { statusCode, data } = await getLigneById(id);
    res.status(statusCode).json(data);
    return;
}


export async function getLigneByCommandeController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const commandeId = req.params.id;
    if (!commandeId || typeof commandeId !== "string") {
        return next(new BadRequestError(`Invalid commande id parameter: "${String(req.params.id)}"`));
    }

    const { statusCode, data } = await getLignesByCommande(commandeId);
    res.status(statusCode).json(data);
    return;
}