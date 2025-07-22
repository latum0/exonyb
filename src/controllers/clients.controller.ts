
import { Request, Response, NextFunction } from "express";
import { CreateClientDto, UpdateClientDto } from "../dto/client.dto";
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
} from "../services/clients.service";
import { ClientFilterDto } from "../dto/client-filter.dto";


export async function createClientController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const dto = req.body as CreateClientDto;
  const result = await createClient(dto);
  res.status(result.statusCode).json(result);
}


export async function getAllClientsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const filter = req.query as unknown as ClientFilterDto;
  const result = await getAllClients(filter);
  res.status(result.statusCode).json(result.data);
}

export async function filterClientsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const filter = req.body as ClientFilterDto;

  const result = await getAllClients(filter);
  res.status(result.statusCode).json(result.data);
}


export async function getClientByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ statusCode: 400, message: "Invalid client ID" });
    return;
  }
  const result = await getClientById(id);
  res.status(result.statusCode).json(result);
}


export async function updateClientController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ statusCode: 400, message: "Invalid client ID" });
    return;
  }
  const dto = req.body as UpdateClientDto;
  const result = await updateClient(id, dto);
  res.status(result.statusCode).json(result);
}


export async function deleteClientController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ statusCode: 400, message: "Invalid client ID" });
    return;
  }
  const result = await deleteClient(id);
  res.status(result.statusCode).json(result);
}

