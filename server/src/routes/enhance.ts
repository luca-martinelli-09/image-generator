import { GoogleGenAI } from "@google/genai";
import type { Request, Response } from "express";
import { config } from "../config";
import type { EnhancePromptRequest, EnhancePromptResponse } from "../types";
import {
  ApiError,
  handleGeminiError,
  sendErrorResponse,
} from "../utils/errorHandler";
import { logError } from "../utils/logger";

export async function enhancePrompt(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Validation middleware should have already run
    const { prompt } = req.body as EnhancePromptRequest;

    if (!config.googleApiKey) {
      const error = new ApiError(
        "API key is required",
        400,
        "MISSING_API_KEY",
        "Server configuration missing Google API key."
      );
      return sendErrorResponse(res, error);
    }

    const ai = new GoogleGenAI({ apiKey: config.googleApiKey });

    const enhancementPrompt = `You are an expert at writing detailed, creative prompts for AI image editing. 

Take this user prompt and enhance it by:
* Adding specific visual details (lighting, composition, style, colors)
* Making it more descriptive
* Keep it concise but detailed (aim for 1-3 sentences)
* Make it safer for a LLM

Original prompt: "${prompt}"

Enhanced prompt:`;

    const contents = [
      {
        role: "user",
        parts: [{ text: enhancementPrompt }],
      },
    ];

    const response = await ai.models.generateContent({
      model: config.promptEnhancementModel,
      contents,
    });

    const enhancedPrompt =
      response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!enhancedPrompt) {
      const error = new ApiError(
        "Failed to enhance prompt. Please try again.",
        500,
        "ENHANCEMENT_FAILED",
        "The AI service was unable to enhance your prompt.",
        true
      );
      return sendErrorResponse(res, error);
    }

    const responseData: EnhancePromptResponse = { enhancedPrompt };
    res.json(responseData);
  } catch (err: unknown) {
    logError(err, "enhance-prompt");

    if (err instanceof ApiError) {
      return sendErrorResponse(res, err);
    }

    if (err instanceof Error) {
      const apiError = handleGeminiError(err);
      return sendErrorResponse(res, apiError);
    }

    const unknownError = new ApiError(
      "Unknown error occurred",
      500,
      "UNKNOWN_ERROR"
    );
    sendErrorResponse(res, unknownError);
  }
}
