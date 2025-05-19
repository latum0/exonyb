import { Request, Response } from "express";
import { CreateUserDto, UpdatePermissionsDto } from "../dto/user.dto";
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserByIdService,
  updateUserPermissionsService,
} from "../services/users.service";
import jwt from "jsonwebtoken";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export const createUserController = async (req: Request, res: Response) => {
  const dto: CreateUserDto = req.body;
  const user = await createUser(dto);
  res.status(201).json(user);
};

export async function getAllUsersController(req: Request, res: Response) {
  const result = await getAllUsers();
  res.status(result.statusCode).json(result);
}
export const getUserByIdController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await getUserByIdService(id);
    if (!user) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Utilisateur non trouvé" });
    }
    res.status(200).json({ statusCode: 200, user });
  } catch (error) {
    console.error("Error in getUserByIdController:", error);
    res.status(500).json({ statusCode: 500, message: "Internal server error" });
  }
};
export const updateUserPermissionsController = async (
  req: Request,
  res: Response
) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const dto = plainToInstance(UpdatePermissionsDto, req.body);
  const errors = await validate(dto);

  if (errors.length > 0) {
    return res
      .status(400)
      .json({ statusCode: 400, message: "Validation failed", errors });
  }

  const result = await updateUserPermissionsService(userId, dto.permissions);

  return res.status(result.statusCode).json({
    statusCode: result.statusCode,
    message: result.message,
  });
};

export async function deleteUserController(req: Request, res: Response) {
  const userId = Number(req.params.id);
  const result = await deleteUserById(userId);

  res.status(result.statusCode).json({
    statusCode: result.statusCode,
    message: result.message,
  });
}
