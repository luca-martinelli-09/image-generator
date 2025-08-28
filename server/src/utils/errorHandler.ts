import type { Response } from "express";
import type { ErrorResponse } from "../types";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly suggestion?: string;
  public readonly retryable?: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    suggestion?: string,
    retryable?: boolean
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.suggestion = suggestion;
    this.retryable = retryable;
    this.name = "ApiError";
  }
}

export function createErrorResponse(error: ApiError): ErrorResponse {
  return {
    error: error.message,
    code: error.code,
    suggestion: error.suggestion,
    retryable: error.retryable,
  };
}

export function handleGeminiError(err: Error): ApiError {
  console.error(err)
  const message = err.message.toLowerCase();

  // Check for specific Gemini API error patterns
  if (message.includes("invalid_argument") || message.includes("400")) {
    if (
      message.includes("failed_precondition") ||
      message.includes("billing")
    ) {
      return new ApiError(
        "API requires billing in your region. Enable billing in Google AI Studio.",
        400,
        "REGION_BILLING_REQUIRED",
        "Visit Google AI Studio to enable billing for your project."
      );
    }
    return new ApiError(
      "Invalid request. Please check your prompt and images.",
      400,
      "INVALID_REQUEST",
      "Verify your prompt format and uploaded images."
    );
  }

  if (message.includes("permission_denied") || message.includes("403")) {
    return new ApiError(
      "Invalid API key or insufficient permissions.",
      403,
      "PERMISSION_DENIED",
      "Check your API key configuration."
    );
  }

  if (message.includes("not_found") || message.includes("404")) {
    return new ApiError(
      "Resource not found. Please try again.",
      404,
      "NOT_FOUND",
      "Verify all referenced files exist."
    );
  }

  if (message.includes("resource_exhausted") || message.includes("429")) {
    return new ApiError(
      "Rate limit exceeded. Please wait and try again.",
      429,
      "RATE_LIMITED",
      "Wait a moment before making another request.",
      true
    );
  }

  if (message.includes("unavailable") || message.includes("503")) {
    return new ApiError(
      "Service temporarily unavailable.",
      503,
      "SERVICE_UNAVAILABLE",
      "Try again in a few moments or switch to a different model.",
      true
    );
  }

  if (message.includes("deadline_exceeded") || message.includes("504")) {
    return new ApiError(
      "Request timed out. Try a shorter prompt.",
      504,
      "TIMEOUT",
      "Reduce your prompt length or try again.",
      true
    );
  }

  if (message.includes("internal") || message.includes("500")) {
    return new ApiError(
      "Server error. Try reducing context or switching models.",
      500,
      "INTERNAL_ERROR",
      "Reduce input length or try Gemini 1.5 Flash model.",
      true
    );
  }

  // Generic error
  return new ApiError(err.message, 500, "UNKNOWN_ERROR");
}

export function handleFinishReason(finishReason: string): ApiError {
  switch (finishReason) {
    case "PROHIBITED_CONTENT":
      return new ApiError(
        "Content policy violation. Your prompt or images contain prohibited content.",
        400,
        "PROHIBITED_CONTENT",
        "Please modify your prompt to avoid inappropriate, harmful, or policy-violating content.",
        false
      );
    case "SAFETY":
      return new ApiError(
        "Content blocked by safety filters.",
        400,
        "SAFETY_BLOCKED",
        "Please revise your prompt to ensure it's safe and appropriate.",
        false
      );
    case "RECITATION":
      return new ApiError(
        "Content blocked due to recitation concerns.",
        400,
        "RECITATION_BLOCKED",
        "Please use more original content in your prompt.",
        false
      );
    case "OTHER":
      return new ApiError(
        "Content generation was blocked for an unspecified reason.",
        400,
        "CONTENT_BLOCKED",
        "Please try rephrasing your prompt or using different images.",
        true
      );
    case "MAX_TOKENS":
      return new ApiError(
        "Response was truncated due to length limits.",
        400,
        "MAX_TOKENS",
        "Try using a shorter prompt or fewer images.",
        true
      );
    default:
      return new ApiError(
        `Content generation was blocked. Finish reason: ${finishReason}`,
        400,
        "UNKNOWN_BLOCK",
        "Please try rephrasing your prompt or using different images. Check the server logs for more details.",
        true
      );
  }
}

export function sendErrorResponse(res: Response, error: ApiError): void {
  console.error("API Error:", {
    message: error.message,
    statusCode: error.statusCode,
    code: error.code,
    suggestion: error.suggestion,
    retryable: error.retryable,
    timestamp: new Date().toISOString(),
  });

  res.status(error.statusCode).json(createErrorResponse(error));
}
