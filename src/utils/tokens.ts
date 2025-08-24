import * as jwt from "jsonwebtoken";

const accessSecret = process.env.JWT_ACCESS_SECRET!;
const refreshSecret = process.env.JWT_REFRESH_SECRET!;

const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

if (!accessSecret || !refreshSecret) {
  throw new Error("JWT secrets are not defined in environment variables");
}

export const generateTokens = (payload: any) => {
  const accessToken = jwt.sign(payload, accessSecret as jwt.Secret, {
    expiresIn: accessExpiresIn,
  });

  const refreshToken = jwt.sign(payload, refreshSecret as jwt.Secret, {
    expiresIn: refreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, accessSecret as jwt.Secret);

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, refreshSecret as jwt.Secret);

export const generateEmailVerificationToken = (userId: number) => {
  return jwt.sign({ sub: userId }, accessSecret, {
    expiresIn: "1h",
  });
};
