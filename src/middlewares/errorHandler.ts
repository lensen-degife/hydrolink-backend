import { NextFunction, Request, Response } from "express";
import { AppError } from "@/utils/AppError";
import { sendError } from "@/utils/apiResponse";

// Centralized error handler. Any error passed to next(err), or thrown
// inside an asyncHandler-wrapped route, ends up here.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  // Prisma known request errors (e.g. unique constraint violation)
  if (typeof err === "object" && err !== null && "code" in err) {
    const prismaErr = err as { code: string; meta?: { target?: string[] } };
    if (prismaErr.code === "P2002") {
      const field = prismaErr.meta?.target?.join(", ") || "field";
      return sendError(res, `Duplicate value for ${field}`, 409);
    }
    if (prismaErr.code === "P2025") {
      return sendError(res, "Record not found", 404);
    }
  }

  console.error("Unhandled error:", err);
  const message = err instanceof Error ? err.message : "Internal server error";
  return sendError(res, "Internal server error", 500, message);
}

export function notFoundHandler(req: Request, res: Response) {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}
