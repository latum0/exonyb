import { Request, Response, NextFunction, RequestHandler } from "express";

export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
}

export enum Permission {
  AGENT_DE_STOCK = "AGENT_DE_STOCK",
  CONFIRMATEUR = "CONFIRMATEUR",
  SAV = "SAV",
}

interface User {
  id: number;
  email: string;
  role: Role;
  permissions: Permission[];
  [key: string]: any;
}

export const checkPermissions = (
  requiredPermissions: Permission[]
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return; // 👈 corrige le type
    }

    const { role, permissions } = req.user;

    if (role === Role.ADMIN) {
      next();
      return;
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
