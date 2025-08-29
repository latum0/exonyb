import { NextFunction, Request, Response } from "express";
import {
  changePassword,
  generateResetToken,
  getUserProfileService,
  loginUser,
  refreshAccessToken,
  resetPassword,
  updateUserProfile,
  verifyEmailService,
  logout,
} from "../services/auth.service";
import { sendResetPasswordEmail } from "../utils/email";
import { plainToInstance } from "class-transformer";
import { ChangePasswordDto, UpdateProfileDto } from "../dto/auth.dto";
import { validateOrReject, ValidationError } from "class-validator";

export const loginAdminHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;
  try {
    const tokens = await loginUser(email, password);
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
  } catch (err: any) {
    res
      .status(401)
      .json({ statusCode: 401, message: err.message || "Invalid credentials" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token)
      return res
        .status(401)
        .json({ statusCode: 401, message: "No refresh token" });

    const { accessToken, refreshToken } = await refreshAccessToken(token);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.json({ statusCode: 200, accessToken });
  } catch (error: any) {
    return res
      .status(401)
      .json({ statusCode: 401, message: "une erreur serveur est survenue" });
  }
};
export const verifyEmailController = async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res
      .status(400)
      .json({ statusCode: 400, message: "Token manquant ou invalide" });
  }

  const result = await verifyEmailService(token);

  res.status(result.statusCode).json(result);
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const token = await generateResetToken(email);

    if (!token) {
      res
        .status(404)
        .json({ statusCode: 404, message: "Utilisateur non trouvé" });
      return;
    }

    await sendResetPasswordEmail(email, token);
    res.status(200).json({ statusCode: 200, message: "un email est envoyé" });
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error });
    // next(error);
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token, newPassword } = req.body;
  const result = await resetPassword(token, newPassword);

  if (!result.success) {
    res.status(400).json({ statusCode: 400, message: result.message });
    return;
  }

  res
    .status(200)
    .json({ statusCode: 200, message: "Password reset successful" });
};

export const handleChangePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const dto = plainToInstance(ChangePasswordDto, req.body);
    try {
      await validateOrReject(dto, { whitelist: true });
    } catch (validationErrors) {
      const errors = (validationErrors as ValidationError[]).map((err) => ({
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
    const result = await changePassword(userId, dto);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req?.user?.sub;
    const profile = await getUserProfileService(userId!);

    if (profile.statusCode === 404) {
      res.status(404).json(profile);
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub;
    await logout(Number(userId));

    return res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error: any) {
    console.error("Erreur logout:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export async function updateProfileController(req: Request, res: Response): Promise<void> {

  const userId = (req as any).user?.sub ?? (req as any).userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
  }

  const dto = req.body as UpdateProfileDto;
  const serviceResp: ServiceResponse<any> = await updateUserProfile(userId, dto);

  res.status(serviceResp.statusCode).json({ data: serviceResp.data, message: serviceResp.message ?? "Updated" });

}