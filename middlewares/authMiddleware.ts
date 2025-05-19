import jwt from "jsonwebtoken";

export const authMiddleware = //@ts-ignore
  (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });

    const token = authHeader.split(" ")[1];
    try {
      if (!process.env.JWT_ACCESS_SECRET) {
        return res.status(500).json({ message: "JWT secret not configured" });
      }
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET as string
      );
      req.user = decoded;
      next();
    } catch (e) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
