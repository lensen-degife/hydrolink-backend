import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { sendError } from "@/utils/apiResponse";

// Validates req.body / req.query / req.params against a Zod schema.
// Usage: router.post("/", validate(schema), controller)
export function validate(schema: AnyZodObject) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("; ");
        return sendError(res, "Validation failed", 422, message);
      }
      return next(err);
    }
  };
}
