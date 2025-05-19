import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { CreateUserDto } from "../dto/user.dto";

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
      message: "Phone Déjà  exist",
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

  return {
    statusCode: 201,
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
  };
}
