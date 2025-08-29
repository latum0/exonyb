import { PrismaClient, Role, Users } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  generateEmailVerificationToken,
  generateTokens,
  verifyRefreshToken,
} from "../utils/tokens";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/email";
import { ChangePasswordDto, UpdateProfileDto } from "../dto/auth.dto";
import { ensureExists, ensureUnique, stripNullish } from "../utils/helpers";
import { ConflictError } from "../utils/errors";
import { UserResponseDto } from "../dto/response.dto";
import { createHistoriqueService } from "./historique.service";
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
export const logout = async (userId: number) => {
  return prisma.users.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
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





export async function updateUserProfile(
  idUser: number,
  dto: UpdateProfileDto
): Promise<ServiceResponse<UserResponseDto>> {
  const existedUser = await ensureExists(
    () => prisma.users.findUnique({ where: { id: idUser } }),
    "User"
  );

  const normalized: Partial<UpdateProfileDto> = {
    ...(typeof dto.name !== "undefined" ? { name: String(dto.name).trim() } : {}),
    ...(typeof dto.email !== "undefined"
      ? { email: String(dto.email).trim().toLowerCase() }
      : {}),
    ...(typeof dto.phone !== "undefined" ? { phone: String(dto.phone).trim() } : {}),
  };
  const payload = stripNullish(normalized);
  if (Object.keys(payload).length === 0) {
    return { statusCode: 200, data: { name: existedUser.name, email: existedUser.email, phone: existedUser.phone }, message: "Aucune modification fournie." };
  }

  if (payload.email) {
    const other = await prisma.users.findFirst({
      where: { email: payload.email, NOT: { id: idUser } },
    });
    if (other) throw new ConflictError("Cette adresse e-mail est déjà utilisée.");
  }
  if (payload.phone) {
    const other = await prisma.users.findFirst({
      where: { phone: payload.phone, NOT: { id: idUser } },
    });
    if (other) throw new ConflictError("Ce numéro de téléphone est déjà utilisé.");
  }

  const emailChanged = typeof payload.email !== "undefined" && payload.email !== existedUser.email;

  const updateData: any = { ...payload };
  if (emailChanged) updateData.emailVerified = false;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.users.update({
        where: { id: idUser },
        data: updateData,
        select: { id: true, name: true, email: true, phone: true },
      });

      await createHistoriqueService(tx, idUser, emailChanged ? "EMAIL_CHANGED" : "PROFILE_UPDATED")

      return user;
    });

    if (emailChanged) {
      const verifToken = jwt.sign({ sub: updated.id, email: updated.email }, accessSecret, { expiresIn: "1d" });
      try {
        await sendVerificationEmail(updated.email, verifToken);
      } catch (mailErr) {
        console.error("Failed to send verification email:", mailErr);
      }
    }

    return { statusCode: 200, data: { name: updated.name, email: updated.email, phone: updated.phone }, message: "Profil mis à jour avec succès" };
  } catch (err: any) {
    if (err?.code === "P2002" && err?.meta?.target?.includes("email")) {
      return { statusCode: 409, error: "Cette adresse e-mail est déjà utilisée." };
    }
    if (err?.code === "P2002" && err?.meta?.target?.includes("phone")) {
      return { statusCode: 409, error: "Ce numéro de téléphone est déjà utilisé." };
    }

    console.error(err);
    return { statusCode: 500, error: "Erreur lors de la mise à jour du profil." };
  }
}
