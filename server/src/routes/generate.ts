import { GoogleGenAI } from "@google/genai";
import type { Request, Response } from "express";
import mime from "mime";
import { config } from "../config";
import { validateApiKey } from "../middleware/validation";
import type { GenerateRequest, GenerateResponse, OutputFile } from "../types";
import {
  ApiError,
  handleFinishReason,
  handleGeminiError,
  sendErrorResponse,
} from "../utils/errorHandler";
import { logError } from "../utils/logger";

export async function generateImage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Validation middleware should have already run
    const { apiKey, model, prompt, images } = req.body as GenerateRequest;

    const finalApiKey = validateApiKey(apiKey, config.googleApiKey);
    const finalModel = model || config.defaultModel;

    const ai = new GoogleGenAI({ apiKey: finalApiKey });

    const contents = [
      {
        role: "user",
        parts: [
          ...images.map((img) => ({
            inlineData: {
              data: img.base64,
              mimeType: img.mimeType,
            },
          })),
          { text: prompt },
        ],
      },
    ];

    const response = await ai.models.generateContentStream({
      model: finalModel,
      contents,
    });

    const outputs: OutputFile[] = [];

    for await (const chunk of response) {
      // Check for finish reasons that indicate errors or blocks
      const candidate = chunk.candidates?.[0];
      if (candidate?.finishReason && candidate.finishReason !== "STOP") {
        // Handle actual error finish reasons
        const error = handleFinishReason(candidate.finishReason);
        return sendErrorResponse(res, error);
      }

      const inlineData = chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (inlineData && inlineData.mimeType && inlineData.data) {
        const extension =
          mime.getExtension(inlineData.mimeType || "png") || "png";
        outputs.push({
          mimeType: inlineData.mimeType,
          base64: inlineData.data,
          filename: `output-${Date.now()}.${extension}`,
        });
      }
    }

    // Check if no outputs were generated
    if (outputs.length === 0) {
      const error = new ApiError(
        "No images were generated. The request may have been blocked or failed.",
        400,
        "NO_OUTPUT",
        "Try a different prompt or check if your content meets content policy guidelines.",
        true
      );
      return sendErrorResponse(res, error);
    }

    const responseData: GenerateResponse = { outputs };
    res.json(responseData);
  } catch (err: unknown) {
    logError(err, "generate-image");

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
