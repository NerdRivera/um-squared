import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { ValidationError } from "../utils/errors";

/**
 * Validates and replaces `req.body` with the parsed result of `schema`.
 * Throws a ValidationError (400) on failure, handled by the global error handler.
 */
export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );
      throw new ValidationError("Request validation failed", details);
    }
    req.body = result.data;
    next();
  };
}
