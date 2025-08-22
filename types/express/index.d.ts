import { Role, Permission } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: Role;
      permissions?: Permission[];
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
