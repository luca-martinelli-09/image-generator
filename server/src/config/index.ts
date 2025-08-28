import dotenv from "dotenv";
import path from "path";

// Load .env from project root (one level up from server directory)
dotenv.config({ path: path.join(process.cwd(), "../.env") });

export const config = {
  port: process.env.PORT || 3000,
  googleApiKey: process.env.GOOGLE_API_KEY,
  defaultModel: process.env.DEFAULT_MODEL || "gemini-2.5-flash-image-preview",
  promptEnhancementModel:
    process.env.PROMPT_ENHANCEMENT_MODEL || "gemini-2.5-flash",
  requestTimeout: 120000, // 2 minutes
  maxRequestSize: "20mb",
} as const;
