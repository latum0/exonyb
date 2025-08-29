
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
  const userId = (req.user as { sub: number }).sub;

  const { statusCode, data } = await createClient(dto, userId);
  res.status(statusCode).json({ data });

}

export async function getAllClientsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const filter = req.query as unknown as ClientFilterDto;

  const { statusCode, data } = await getAllClients(filter);
  res.status(statusCode).json(data);
}

export async function filterClientsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const filter = req.body as ClientFilterDto;

  const { statusCode, data } = await getAllClients(filter);
  res.status(statusCode).json(data);
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
  const { statusCode, data } = await getClientById(id);
  res.status(statusCode).json(data);
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
  const userId = (req.user as { sub: number }).sub;

  const { statusCode, data } = await updateClient(id, dto, userId);
  res.status(statusCode).json({ data });
}



export async function deleteClientController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res
      .status(400)
      .json({ statusCode: 400, message: "Invalid client ID" });
  }

  const userId = (req.user as { sub: number }).sub;
  const { statusCode, message } = await deleteClient(id, userId);

  res.status(statusCode).json({ message });
}

