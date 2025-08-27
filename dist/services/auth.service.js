"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfileService =
  exports.changePassword =
  exports.resetPassword =
  exports.generateResetToken =
  exports.verifyEmailService =
  exports.refreshAccessToken =
    void 0;
exports.loginUser = loginUser;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const tokens_1 = require("../utils/tokens");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_1 = require("../utils/email");
const prisma = new client_1.PrismaClient();
const accessSecret = process.env.JWT_ACCESS_SECRET;
async function loginUser(email, password) {
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) throw new Error("Email ou mot de passe invalide");
  const isValid = await bcrypt_1.default.compare(password, user.password);
  if (!isValid) throw new Error("Email ou mot de passe invalide");
  const basePayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  if (user.role === client_1.Role.MANAGER) {
    basePayload.permissions = user.permissions;
    if (!user.emailVerified) {
      const token = (0, tokens_1.generateEmailVerificationToken)(user.id);
      await (0, email_1.sendVerificationEmail)(user.email, token);
      return {
        statusCode: 400,
        message: "Un email de vérification a été envoyé.",
      };
    }
  }
  const tokens = (0, tokens_1.generateTokens)(basePayload);
  const hashedRefreshToken = await bcrypt_1.default.hash(
    tokens.refreshToken,
    10
  );
  await prisma.users.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefreshToken },
  });
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}
const refreshAccessToken = async (refreshToken) => {
  const decoded = (0, tokens_1.verifyRefreshToken)(refreshToken);
  const user = await prisma.users.findUnique({
    where: { id: decoded.sub },
  });
  if (!user || !user.refreshToken) {
    throw new Error("Invalid refresh token");
  }
  const isValid = await bcrypt_1.default.compare(
    refreshToken,
    user.refreshToken
  );
  if (!isValid) {
    throw new Error("Invalid refresh token");
  }
  const basePayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  if (user.role === client_1.Role.MANAGER) {
    basePayload.permissions = user.permissions;
  }
  const tokens = (0, tokens_1.generateTokens)(basePayload);
  const hashed = await bcrypt_1.default.hash(tokens.refreshToken, 10);
  await prisma.users.update({
    where: { id: user.id },
    data: { refreshToken: hashed },
  });
  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
};
exports.refreshAccessToken = refreshAccessToken;
const verifyEmailService = async (token) => {
  try {
    const decoded = jsonwebtoken_1.default.verify(token, accessSecret);
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
exports.verifyEmailService = verifyEmailService;
const generateResetToken = async (email) => {
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) return null;
  const token = jsonwebtoken_1.default.sign(
    { userId: user.id },
    process.env.JWT_RESET_SECRET,
    {
      expiresIn: "1h",
    }
  );
  return token;
};
exports.generateResetToken = generateResetToken;
const resetPassword = async (token, newPassword) => {
  try {
    const decoded = jsonwebtoken_1.default.verify(
      token,
      process.env.JWT_RESET_SECRET
    );
    const userId = decoded.userId;
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: "Token invalid or expired" };
  }
};
exports.resetPassword = resetPassword;
const changePassword = async (userId, dto) => {
  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) {
    return {
      statusCode: 404,
      message: "Utilisateur introuvable.",
    };
  }
  const isMatch = await bcrypt_1.default.compare(
    dto.oldPassword,
    user.password
  );
  if (!isMatch) {
    return {
      statusCode: 400,
      message: "Ancien mot de passe incorrect.",
    };
  }
  const hashed = await bcrypt_1.default.hash(dto.newPassword, 10);
  await prisma.users.update({
    where: { id: userId },
    data: { password: hashed },
  });
  return { statusCode: 200, message: "Mot de passe modifié avec succès" };
};
exports.changePassword = changePassword;
const getUserProfileService = async (userId) => {
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
exports.getUserProfileService = getUserProfileService;
