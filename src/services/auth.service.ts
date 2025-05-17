import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateTokens, verifyRefreshToken } from "../../utils/tokens";

const prisma = new PrismaClient();

export async function loginAdmin(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin) throw new Error("champs invalides");

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) throw new Error("champs invalids");

  const payload = { sub: admin.id, email: admin.email };
  const tokens = generateTokens(payload);

  const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { refreshToken: hashedRefreshToken },
  });

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

export const refreshAccessToken = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken) as any;

  const admin = await prisma.admin.findUnique({
    where: { id: decoded.sub },
  });

  if (!admin || !admin.refreshToken) {
    throw new Error("Invalid refresh token");
  }

  const isValid = await bcrypt.compare(refreshToken, admin.refreshToken);
  if (!isValid) {
    throw new Error("Invalid refresh token");
  }

  const payload = { sub: admin.id, email: admin.email };
  const tokens = generateTokens(payload);

  const hashed = await bcrypt.hash(tokens.refreshToken, 10);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { refreshToken: hashed },
  });

  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
};
