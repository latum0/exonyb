import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  generateEmailVerificationToken,
  generateTokens,
  verifyRefreshToken,
} from "../../utils/tokens";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../../utils/email";
const prisma = new PrismaClient();
const accessSecret = process.env.JWT_ACCESS_SECRET!;
export async function loginUser(email: string, password: string) {
  const user = await prisma.users.findUnique({ where: { email } });

  if (!user) throw new Error("Email ou mot de passe invalide");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Email ou mot de passe invalide");

  const basePayload: any = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  if (user.role === Role.MANAGER) {
    basePayload.permissions = user.permissions;
    if (!user.emailVerified) {
      const token = generateEmailVerificationToken(user.id);
      await sendVerificationEmail(user.email, token);
      return {
        statusCode: 400,
        message: "Un email de vérification a été envoyé.",
      };
    }
  }

  const tokens = generateTokens(basePayload);

  const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

  await prisma.users.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefreshToken },
  });

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}
export const refreshAccessToken = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken) as any;

  const user = await prisma.users.findUnique({
    where: { id: decoded.sub },
  });

  if (!user || !user.refreshToken) {
    throw new Error("Invalid refresh token");
  }

  const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!isValid) {
    throw new Error("Invalid refresh token");
  }

  const basePayload: any = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  if (user.role === Role.MANAGER) {
    basePayload.permissions = user.permissions;
  }
  const tokens = generateTokens(basePayload);

  const hashed = await bcrypt.hash(tokens.refreshToken, 10);
  await prisma.users.update({
    where: { id: user.id },
    data: { refreshToken: hashed },
  });

  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
};

export const verifyEmailService = async (token: string) => {
  try {
    const decoded: any = jwt.verify(token, accessSecret);

    const user = await prisma.users.findUnique({
      where: { id: Number(decoded.sub) },
    });

    if (!user) {
      return {
        success: false,
        message: "Utilisateur introuvable",
        statusCode: 404,
      };
    }

    if (user.emailVerified) {
      return { success: false, message: "Email déjà vérifié", statusCode: 400 };
    }

    await prisma.users.update({
      where: { id: Number(decoded.sub) },
      data: { emailVerified: true },
    });

    return { statusCode: 200, success: true };
  } catch (err) {
    return {
      success: false,
      message: "Token invalide ou expiré",
      statusCode: 400,
    };
  }
};
