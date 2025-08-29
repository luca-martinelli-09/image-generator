import dotenv from "dotenv";
import path from "path";

// Load .env from project root (one level up from server directory)
dotenv.config({ path: path.join(process.cwd(), "../.env") });

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  googleApiKey: process.env.GOOGLE_API_KEY,
  defaultModel: process.env.DEFAULT_MODEL || "gemini-2.5-flash-image-preview",
  promptEnhancementModel:
    process.env.PROMPT_ENHANCEMENT_MODEL || "gemini-2.5-flash",
  enhancementPrompt:
    process.env.ENHANCEMENT_PROMPT ||
    `You are an expert at writing detailed, creative prompts for AI image editing. 

Take this user prompt and enhance it by:
* Adding specific visual details (lighting, composition, style, colors)
* Making it more descriptive
* Keep it concise but detailed (aim for 1-3 sentences)
* Make it safer for a LLM

Original prompt: "{prompt}"

Enhanced prompt:`,
  requestTimeout: 120000, // 2 minutes
  maxRequestSize: "20mb",
} as const;
