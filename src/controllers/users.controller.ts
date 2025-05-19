import { Request, Response } from "express";
import { CreateUserDto } from "../dto/user.dto";
import { createUser } from "../services/users.service";
import jwt from "jsonwebtoken";

export const createUserController = async (req: Request, res: Response) => {
  const dto: CreateUserDto = req.body;
  const user = await createUser(dto);
  res.status(201).json(user);
};
