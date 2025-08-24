import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/errors";
import {
  addToBlacklist,
  deleteFromBlacklist,
  getAllBlacklistedClients,
  getBlacklistedClientById,
} from "../services/liste-noire.service";

export async function addToBlacklistController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new BadRequestError(`Invalid id parameter: "${req.params.id}"`);
  }
  const userId = (req.user as { sub: number }).sub;
  const { data, statusCode, message } = await addToBlacklist(id, userId);
  res.status(statusCode).json({ data, message });
}

export async function deleteFromBlacklistController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new BadRequestError(`Invalid id parameter: "${req.params.id}"`);
  }
  const userId = (req.user as { sub: number }).sub;

  const { data, statusCode, message } = await deleteFromBlacklist(id, userId);
  res.status(statusCode).json({ data, message });
}

export async function getAllBlacklistedClientsController(
  req: Request,
  res: Response
) {
  const skip = Number(req.query.skip) || 0;
  const take = Number(req.query.take) || 100;

  const { data, statusCode, message } = await getAllBlacklistedClients({
    skip,
    take,
  });
  res.status(statusCode).json({ data, message });
}

export async function getBlacklistedClientsByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new BadRequestError(`Invalid id parameter: "${req.params.id}"`);
  }

  const { data, statusCode, message } = await getBlacklistedClientById(id);
  res.status(statusCode).json({ data, message });
}
