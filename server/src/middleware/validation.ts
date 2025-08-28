import type { NextFunction, Request, Response } from "express";
import type { EnhancePromptRequest, GenerateRequest } from "../types";
import { ApiError } from "../utils/errorHandler";

export function validateGenerateRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { prompt, images } = req.body as GenerateRequest;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new ApiError(
      "Prompt is required and must be a non-empty string",
      400,
      "INVALID_PROMPT"
    );
  }

  if (!Array.isArray(images)) {
    throw new ApiError("Images must be an array", 400, "INVALID_IMAGES");
  }

  // Validate each image
  for (const [index, img] of images.entries()) {
    if (!img || typeof img !== "object") {
      throw new ApiError(
        `Image at index ${index} must be an object`,
        400,
        "INVALID_IMAGE_OBJECT"
      );
    }

    if (!img.id || typeof img.id !== "number") {
      throw new ApiError(
        `Image at index ${index} must have a valid numeric id`,
        400,
        "INVALID_IMAGE_ID"
      );
    }

    if (!img.base64 || typeof img.base64 !== "string") {
      throw new ApiError(
        `Image at index ${index} must have a valid base64 string`,
        400,
        "INVALID_IMAGE_BASE64"
      );
    }

    if (
      !img.mimeType ||
      typeof img.mimeType !== "string" ||
      !img.mimeType.startsWith("image/")
    ) {
      throw new ApiError(
        `Image at index ${index} must have a valid image mime type`,
        400,
        "INVALID_IMAGE_MIME_TYPE"
      );
    }
  }

  next();
}

export function validateEnhancePromptRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { prompt } = req.body as EnhancePromptRequest;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new ApiError(
      "Prompt is required and must be a non-empty string",
      400,
      "INVALID_PROMPT"
    );
  }

  if (prompt.length > 2000) {
    throw new ApiError(
      "Prompt is too long. Maximum 2000 characters allowed.",
      400,
      "PROMPT_TOO_LONG"
    );
  }

  next();
}

export function validateApiKey(
  apiKey: string | undefined,
  defaultApiKey: string | undefined
): string {
  const finalApiKey = apiKey || defaultApiKey;

  if (!finalApiKey) {
    throw new ApiError(
      "API key is required",
      400,
      "MISSING_API_KEY",
      "Please provide a Google AI API key."
    );
  }

  return finalApiKey;
}
