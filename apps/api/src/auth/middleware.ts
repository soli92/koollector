import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./jwt.js";

declare global {
  namespace Express {
    interface Request {
      actorUserId?: string;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = verifyToken(header.slice(7));
      req.actorUserId = payload.sub;
    } catch {
      // Invalid token: resolver will reject if the operation requires auth.
    }
  }
  next();
}

export function actorFromWsParams(connectionParams: unknown): string | null {
  if (typeof connectionParams !== "object" || connectionParams === null) return null;
  const auth = (connectionParams as Record<string, unknown>).authorization;
  if (typeof auth !== "string" || !auth.startsWith("Bearer ")) return null;
  try {
    return verifyToken(auth.slice(7)).sub;
  } catch {
    return null;
  }
}
