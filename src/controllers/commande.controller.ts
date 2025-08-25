import { NextFunction, Request, Response } from "express";
import { CreateCommandeDto, GetCommandesQueryDto, UpdateCommandeDto } from "../dto/commande.dto";
import { createCommande, deleteCommande, getCommandeById, getCommandes, updateCommande, updateCommandeMontantT } from "../services/commande.service";
import { BadRequestError } from "../utils/errors";





export async function createCommandeController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const dto = req.body as CreateCommandeDto;
        const userId = (req.user as { sub: number }).sub;
        const { statusCode, data, error, message } = await createCommande(dto, userId);
        res.status(statusCode).json({ data, message, error });
    } catch (err) {
        next(err);
    }
}
export async function getCommandeByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
        throw new BadRequestError("Invalid idCommande");
    }
    const { statusCode, data, error } = await getCommandeById(id)
    res.status(statusCode).json({ data, error })
}

export async function getAllCommandesController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    const filter = req.query as unknown as GetCommandesQueryDto;

    const { statusCode, data } = await getCommandes(filter);
    res.status(statusCode).json(data);

}

export async function deleteCommandeController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { id } = req.params;

        if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
            throw new BadRequestError("Invalid idCommande");
        }

        const userId = (req.user as { sub: number }).sub;

        const { statusCode, message } = await deleteCommande(id, userId);
        res.status(statusCode).json({ message });
    } catch (err) {
        next(err);
    }
}




export async function updateCommandeController(req: Request, res: Response, next: NextFunction): Promise<void> {

    const idCommande = req.params.id;
    if (!idCommande) return next(new BadRequestError("Missing commande id in params"));

    const body = req.body as UpdateCommandeDto;

    const utilisateur = (req as any).user;

    const utilisateurId = utilisateur.id as number;

    const result = await updateCommande(idCommande, body, utilisateurId);

    res.status(result.statusCode || 200).json(result.data);

}


export async function updateCommandeMontantController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const idCommande = req.params.id;
    if (!idCommande) return next(new BadRequestError("Missing commande id in params"));
    const { montantT } = req.body as { montantT?: string | number };

    if (montantT === null || montantT === undefined) {
        return next(new BadRequestError("Missing montantT in body"));
    }
    const utilisateur = (req as any).user;
    const utilisateurId = utilisateur?.id as number | undefined;
    const montantTStr = typeof montantT === "string" ? montantT : String(montantT);

    const result = await updateCommandeMontantT(idCommande, montantTStr, utilisateurId);

    res.status(result.statusCode || 200).json(result.data);
}
