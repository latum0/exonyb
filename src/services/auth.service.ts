import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  generateEmailVerificationToken,
  generateTokens,
  verifyRefreshToken,
} from "../utils/tokens";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/email";
import { ChangePasswordDto } from "../dto/auth.dto";
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
export const generateResetToken = async (
  email: string
): Promise<string | null> => {
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) return null;

  const token = jwt.sign({ userId: user.id }, process.env.JWT_RESET_SECRET!, {
    expiresIn: "1h",
  });

  return token;
};
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_RESET_SECRET!);
    const userId = decoded.userId;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: "Token invalid or expired" };
  }
};

export const changePassword = async (
  userId: number,
  dto: ChangePasswordDto
) => {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) {
    return {
      statusCode: 404,
      message: "Utilisateur introuvable.",
    };
  }

  const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
  if (!isMatch) {
    return {
      statusCode: 400,
      message: "Ancien mot de passe incorrect.",
    };
  }

  const hashed = await bcrypt.hash(dto.newPassword, 10);

  await prisma.users.update({
    where: { id: userId },
    data: { password: hashed },
  });

  return { statusCode: 200, message: "Mot de passe modifié avec succès" };
};
export const getUserProfileService = async (userId: number) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,

      phone: true,
      role: true,
      permissions: true,
      name: true,
    },
  });
  if (!user) {
    return {
      statusCode: 404,
      message: "Utilisateur introuvable.",
    };
  }
  return {
    statusCode: 200,
    data: user,
  };
};
