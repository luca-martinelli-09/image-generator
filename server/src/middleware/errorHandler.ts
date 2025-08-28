import type { NextFunction, Request, Response } from "express";
import { ApiError, sendErrorResponse } from "../utils/errorHandler";

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    return sendErrorResponse(res, err);
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    const apiError = new ApiError(err.message, 400, "VALIDATION_ERROR");
    return sendErrorResponse(res, apiError);
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && "body" in err) {
    const apiError = new ApiError(
      "Invalid JSON in request body",
      400,
      "INVALID_JSON"
    );
    return sendErrorResponse(res, apiError);
  }

  // Default to 500 server error
  const apiError = new ApiError("Internal server error", 500, "INTERNAL_ERROR");
  sendErrorResponse(res, apiError);
}
