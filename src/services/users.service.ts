//services/users.service

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { CreateUserDto } from "../dto/user.dto";
import { generateEmailVerificationToken } from "../utils/tokens";
import { sendVerificationEmail } from "../utils/email";

const prisma = new PrismaClient();

export async function createUser(data: CreateUserDto) {
  const emailExists = await prisma.users.findUnique({
    where: { email: data.email },
  });
  if (emailExists) {
    return {
      statusCode: 409,
      message: "email Déjà exist",
    };
  }

  const phoneExists = await prisma.users.findUnique({
    where: { phone: data.phone },
  });
  if (phoneExists) {
    return {
      statusCode: 409,
      message: "Phone Déjà exist",
    };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.users.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      phone: data.phone,
      role: Role.MANAGER,
      permissions: data.permissions,
    },
  });

  const token = generateEmailVerificationToken(user.id);
  await sendVerificationEmail(user.email, token);
  return {
    statusCode: 201,
    message: "Utilisateur créé. Un email de vérification a été envoyé.",
  };
}
export async function getAllUsers() {
  const users = await prisma.users.findMany({
    where: {
      role: Role.MANAGER,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,

      permissions: true,
      emailVerified: true,
    },
  });

  return {
    statusCode: 200,
    users,
  };
}
export const getUserByIdService = async (id: number) => {
  return prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      permissions: true,
    },
  });
};
export const updateUserPermissionsService = async (
  userId: number,
  permissions: string[]
) => {
  const user = await prisma.users.findUnique({ where: { id: userId } });

  if (!user || user.role !== Role.MANAGER) {
    return {
      success: false,
      statusCode: 404,
      message: "User not found or user is not a MANAGER",
    };
  }

  const updatedUser = await prisma.users.update({
    where: { id: userId },
    data: { permissions },
  });

  return {
    success: true,
    statusCode: 200,
    message: "Permissions updated successfully",
  };
};

export async function deleteUserById(userId: number) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return {
      statusCode: 404,
      message: `Utilisateur non trouvé.`,
    };
  }

  if (user.role !== Role.MANAGER) {
    return {
      statusCode: 403,
      message: `Vous n'avez pas la permission de supprimer cet utilisateur.`,
    };
  }

  await prisma.users.delete({
    where: { id: userId },
  });

  return {
    statusCode: 200,
    message: `Utilisateur supprimé avec succès.`,
  };
}
