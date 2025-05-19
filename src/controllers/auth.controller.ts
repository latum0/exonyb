import { Request, Response } from "express";
import {
  loginUser,
  refreshAccessToken,
  verifyEmailService,
} from "../services/auth.service";

export const loginAdminHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;
  try {
    const tokens = await loginUser(email, password);
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(tokens.statusCode || 400).json(tokens);
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
