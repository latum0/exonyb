import { NextFunction, Response, Request } from "express";
import { CreateRetourDto, UpdateRetourDto } from "../dto/retour.dto";
import { createRetour, deleteRetour, getAllRetours, getRetourById, updateRetour } from "../services/retour.service";
import { BadRequestError } from "../../utils/errors";
import { RetourFilterDto } from "../dto/retour-filter.dto";

export async function createRetourController(req: Request, res: Response, next: NextFunction): Promise<void> {

    const dto = req.body as CreateRetourDto;
    const result = await createRetour(dto);
    if (result.error) {
        res
            .status(result.statusCode)
            .json({ error: result.error });
        return;
    }
    res.status(result.statusCode).json(result.data);
    return;

}


export async function getAllRetoursController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const raw = req.query as Record<string, string>;
    const filters: RetourFilterDto = {
        page: raw.page ? parseInt(raw.page, 10) : undefined,
        perPage: raw.perPage ? parseInt(raw.perPage, 10) : undefined,
        dateFrom: raw.dateFrom,
        dateTo: raw.dateTo,
        search: raw.search,
        statutRetour: raw.statutRetour,
    };
    const result = await getAllRetours(filters);
    res
        .status(result.statusCode)
        .json(result.data);
}

export async function filterRetoursController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const filters = req.body as RetourFilterDto;

    const result = await getAllRetours(filters);
    res
        .status(result.statusCode)
        .json(result.data);
}


export async function getretourByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new BadRequestError(`Invalid id parameter: "${req.params.id}"`);
    }
    const { statusCode, data } = await getRetourById(id);
    res.status(statusCode).json(data);
    return;
}

export async function updateRetourController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = req.body as UpdateRetourDto;
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new BadRequestError(`Invalid id parameter: "${req.params.id}"`);
    }
    const { data, statusCode } = await updateRetour(id, dto)
    res.status(statusCode).json(data)

}



export async function deleteRetourController(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
        throw new BadRequestError(`Invalid id parameter: "${req.params.id}"`);
    }

    const { statusCode, data, message } = await deleteRetour(id);
    res.status(statusCode).json({ data, message })

}
