import { Request, Response, NextFunction, RequestHandler } from "express";

export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  // add others
}

export enum Permission {
  AGENT_DE_STOCK = "AGENT_DE_STOCK",
  CONFIRMATEUR = "CONFIRMATEUR",
  SAV = "SAV",
}

// Define a User interface matching what Express expects plus your custom fields
interface User {
  id: string;
  email: string;
  role: Role;
  permissions: Permission[];
  [key: string]: any;
}

// Type safety for req.user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// ✅ Typing retour RequestHandler
export const checkPermissions = (
  requiredPermissions: Permission[]
): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { role, permissions } = req.user;

    if (role === Role.ADMIN) {
      return next(); // ADMIN has accès à tout
    }

    const hasPermission = permissions?.some((p) =>
      requiredPermissions.includes(p as Permission)
    );

    if (!hasPermission) {
      res.status(403).json({ message: "Forbidden: insufficient permissions" });
      return;
    }

    next();
  };
};
