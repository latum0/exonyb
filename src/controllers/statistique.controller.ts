import { Request, Response, NextFunction } from 'express';
import { StatistiquesClientDto, StatistiquesCommandeDto, StatistiquesRetourDto } from '../dto/statistiques.dto';
import { ClientsParProduitParDate, commandeParDateParProduit, RetoursParDateParProduit, RetoursParProduitParDate } from '../services/statistique.service';

export async function getCommandeStatsController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    const query = req.query as unknown as StatistiquesCommandeDto;
    const { statusCode, data } = await commandeParDateParProduit(query);
    res.status(statusCode).json(data);

}


export async function getPourcentageClientsParProduitController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    const query = req.query as unknown as StatistiquesClientDto;
    const { statusCode, data } = await ClientsParProduitParDate(query);
    res.status(statusCode).json(data);

}


export async function getPourcentageRetoursParProduitController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    const query = req.query as unknown as StatistiquesRetourDto;
    const { statusCode, data } = await RetoursParProduitParDate(query);
    res.status(statusCode).json(data);

}

export async function getPourcentageRetoursCommandeController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {

    const query = req.query as unknown as StatistiquesRetourDto;
    const { statusCode, data } = await RetoursParDateParProduit(query);
    res.status(statusCode).json(data);

}