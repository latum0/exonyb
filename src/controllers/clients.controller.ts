// src/controllers/clients.controller.ts
import { Request, Response, NextFunction } from "express";
import { CreateClientDto, UpdateClientDto } from "../dto/client.dto";
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
} from "../services/clients.service";

/**
 * POST /clients/create
 */
export async function createClientController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dto = req.body as CreateClientDto;
    const result = await createClient(dto);
    // send response and exit
    res.status(result.statusCode).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /clients/all
 */
export async function getAllClientsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getAllClients();
    res.status(result.statusCode).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /clients/:id
 */
export async function getClientByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ statusCode: 400, message: "Invalid client ID" });
      return; // just exit, don’t return the response object
    }
    const result = await getClientById(id);
    res.status(result.statusCode).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /clients/:id
 */
export async function updateClientController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ statusCode: 400, message: "Invalid client ID" });
      return;
    }
    const dto = req.body as UpdateClientDto;
    const result = await updateClient(id, dto);
    res.status(result.statusCode).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /clients/:id
 */
export async function deleteClientController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ statusCode: 400, message: "Invalid client ID" });
      return;
    }
    const result = await deleteClient(id);
    res.status(result.statusCode).json(result);
  } catch (err) {
    next(err);
  }
}
