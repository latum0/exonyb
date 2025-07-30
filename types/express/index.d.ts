import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: number;
      sub: number;
      email: string;
      role: Role;
      permissions?: string[];
    }

    interface Request {
      user?: User;
    }
  }
}