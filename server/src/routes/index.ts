import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  validateEnhancePromptRequest,
  validateGenerateRequest,
} from "../middleware/validation";
import { enhancePrompt } from "./enhance";
import { generateImage } from "./generate";

const router = Router();

// Generate image endpoint
router.post("/generate", validateGenerateRequest, asyncHandler(generateImage));

// Enhance prompt endpoint
router.post(
  "/enhance-prompt",
  validateEnhancePromptRequest,
  asyncHandler(enhancePrompt)
);

export default router;
