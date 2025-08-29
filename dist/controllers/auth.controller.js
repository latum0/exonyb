"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile =
  exports.handleChangePassword =
  exports.resetPasswordController =
  exports.forgotPassword =
  exports.verifyEmailController =
  exports.refreshToken =
  exports.loginAdminHandler =
    void 0;
const auth_service_1 = require("../services/auth.service");
const email_1 = require("../utils/email");
const class_transformer_1 = require("class-transformer");
const auth_dto_1 = require("../dto/auth.dto");
const class_validator_1 = require("class-validator");
const loginAdminHandler = async (req, res) => {
  const { email, password } = req.body;
  try {
    const tokens = await (0, auth_service_1.loginUser)(email, password);
    if (tokens.statusCode) {
      res.status(tokens.statusCode).json({ message: tokens.message });
    }
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.status(200).json({ accessToken: tokens.accessToken });
  } catch (err) {
    res
      .status(401)
      .json({ statusCode: 401, message: err.message || "Invalid credentials" });
  }
};
exports.loginAdminHandler = loginAdminHandler;
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token)
      return res
        .status(401)
        .json({ statusCode: 401, message: "No refresh token" });
    const { accessToken, refreshToken } = await (0,
    auth_service_1.refreshAccessToken)(token);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return res.json({ statusCode: 200, accessToken });
  } catch (error) {
    return res
      .status(401)
      .json({ statusCode: 401, message: "une erreur serveur est survenue" });
  }
};
exports.refreshToken = refreshToken;
const verifyEmailController = async (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== "string") {
    return res
      .status(400)
      .json({ statusCode: 400, message: "Token manquant ou invalide" });
  }
  const result = await (0, auth_service_1.verifyEmailService)(token);
  res.status(result.statusCode).json(result);
};
exports.verifyEmailController = verifyEmailController;
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const token = await (0, auth_service_1.generateResetToken)(email);
    if (!token) {
      res
        .status(404)
        .json({ statusCode: 404, message: "Utilisateur non trouvé" });
      return;
    }
    await (0, email_1.sendResetPasswordEmail)(email, token);
    res.status(200).json({ statusCode: 200, message: "un email est envoyé" });
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error });
    // next(error);
  }
};
exports.forgotPassword = forgotPassword;
const resetPasswordController = async (req, res) => {
  const { token, newPassword } = req.body;
  const result = await (0, auth_service_1.resetPassword)(token, newPassword);
  if (!result.success) {
    res.status(400).json({ statusCode: 400, message: result.message });
    return;
  }
  res
    .status(200)
    .json({ statusCode: 200, message: "Password reset successful" });
};
exports.resetPasswordController = resetPasswordController;
const handleChangePassword = async (req, res, next) => {
  try {
    const dto = (0, class_transformer_1.plainToInstance)(
      auth_dto_1.ChangePasswordDto,
      req.body
    );
    try {
      await (0, class_validator_1.validateOrReject)(dto, { whitelist: true });
    } catch (validationErrors) {
      const errors = validationErrors.map((err) => ({
        field: err.property,
        errors: Object.values(err.constraints || {}),
      }));
      res.status(400).json({
        statusCode: 400,
        message: "Validation failed",
        errors,
      });
      return;
    }
    if (!req.user || !req.user.sub) {
      return res
        .status(401)
        .json({ statusCode: 401, message: "Utilisateur non found" });
    }
    const userId = Number(req.user.sub);
    const result = await (0, auth_service_1.changePassword)(userId, dto);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
exports.handleChangePassword = handleChangePassword;
const getProfile = async (req, res, next) => {
  try {
    const userId = req?.user?.sub;
    const profile = await (0, auth_service_1.getUserProfileService)(userId);
    if (profile.statusCode === 404) {
      res.status(404).json(profile);
      return;
    }
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};
exports.getProfile = getProfile;
