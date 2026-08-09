import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "@/utils/jwt";
import { sendError } from "@/utils/apiResponse";

// Protects routes: expects `Authorization: Bearer <accessToken>`.
export function authGuard(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return sendError(res, "Authentication token missing", 401);
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    return next();
  } catch (err) {
    return sendError(res, "Invalid or expired token", 401);
  }
}
