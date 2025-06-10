import { Request, Response, NextFunction } from "express";

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
interface AuthenticatedRequest extends Request {
  user?: User;
}

export const checkPermissions = (requiredPermissions: Permission[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { role, permissions } = req.user;

    if (role === Role.ADMIN) {
      return next(); // ADMIN has access to everything
    }

    const hasPermission = permissions?.some((p: string) =>
      requiredPermissions.includes(p as Permission)
    );

    if (!hasPermission) {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient permissions" });
    }

    return next();
  };
