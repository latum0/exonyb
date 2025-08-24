import { Request, Response, NextFunction } from "express";
import {
  createFournisseur,
  updateFournisseur,
  getFournisseurById,
  getAllFournisseur,
  deleteFournisseur,
} from "../services/fournisseur.service";
import {
  CreateFournisseurDto,
  UpdateFournisseurDto,
} from "../dto/fournisseur.dto";
import { BadRequestError } from "../utils/errors";

export async function createFournisseurController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const dto = req.body as CreateFournisseurDto;
  const userId = (req.user as { sub: number }).sub;
  const { data, statusCode } = await createFournisseur(dto, userId);
  res.status(statusCode).json(data);
}

export async function updateFournisseurController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new BadRequestError(`Invalid id parameter: "${req.params.id}"`);
  }
  const userId = (req.user as { sub: number }).sub;
  const dto = req.body as UpdateFournisseurDto;
  const { data, statusCode } = await updateFournisseur(id, dto, userId);
  res.status(statusCode).json(data);
}

export async function getFournisseurByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new BadRequestError(`Invalid id parameter: "${req.params.id}"`);
  }
  const { data, statusCode } = await getFournisseurById(id);
  res.status(statusCode).json(data ?? { message: "Not found" });
}

export async function getAllFournisseurController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { data, error, statusCode } = await getAllFournisseur(req.query as any);
  res.status(statusCode).json({ data, error });
}

export async function deleteFournisseurController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw new BadRequestError(`Invalid id parameter: "${req.params.id}"`);
  }
  const userId = (req.user as { sub: number }).sub;
  const { statusCode, message } = await deleteFournisseur(id, userId);
  res.status(statusCode).json(message);
  return;
}
