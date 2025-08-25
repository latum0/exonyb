import { Role } from "@prisma/client";
import { RequestHandler } from "express";

export const requireAdmin: RequestHandler = (req, res, next) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ statusCode: 401, message: "Accès interdit" });
    return;
  }
  if (user.role !== Role.ADMIN) {
    res.status(403).json({ statusCode: 403, message: "Accès interdit" });
    return;
  }

  next();
};
