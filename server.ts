import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import mime from "mime";

dotenv.config();
const app = express();
app.use(express.json({ limit: "20mb" }));

interface UploadedImage {
  id: number;
  base64: string;
  mimeType: string;
}

app.post("/api/generate", async (req: Request, res: Response) => {
  try {
    const { apiKey, model, prompt, images } = req.body as {
      apiKey?: string;
      model?: string;
      prompt: string;
      images: UploadedImage[];
    };

    const finalApiKey = apiKey || DEFAULT_API_KEY;
    const finalModel = model || DEFAULT_MODEL;

    if (!finalApiKey) {
      return res.status(400).json({ error: "API key is required" });
    }

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

    const outputs: {
      mimeType: string;
      base64: string;
      filename: string;
    }[] = [];

    for await (const chunk of response) {
      // Check for finish reasons that indicate errors or blocks
      const candidate = chunk.candidates?.[0];
      if (candidate?.finishReason) {
        switch (candidate.finishReason) {
          case 'PROHIBITED_CONTENT':
            return res.status(400).json({
              error: "Content policy violation. Your prompt or images contain prohibited content.",
              code: "PROHIBITED_CONTENT",
              suggestion: "Please modify your prompt to avoid inappropriate, harmful, or policy-violating content.",
              retryable: false
            });
          case 'SAFETY':
            return res.status(400).json({
              error: "Content blocked by safety filters.",
              code: "SAFETY_BLOCKED",
              suggestion: "Please revise your prompt to ensure it's safe and appropriate.",
              retryable: false
            });
          case 'RECITATION':
            return res.status(400).json({
              error: "Content blocked due to recitation concerns.",
              code: "RECITATION_BLOCKED",
              suggestion: "Please use more original content in your prompt.",
              retryable: false
            });
          case 'OTHER':
            return res.status(400).json({
              error: "Content generation was blocked for an unspecified reason.",
              code: "CONTENT_BLOCKED",
              suggestion: "Please try rephrasing your prompt or using different images.",
              retryable: true
            });
          case 'MAX_TOKENS':
            return res.status(400).json({
              error: "Response was truncated due to length limits.",
              code: "MAX_TOKENS",
              suggestion: "Try using a shorter prompt or fewer images.",
              retryable: true
            });
        }
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
      return res.status(400).json({
        error: "No images were generated. The request may have been blocked or failed.",
        code: "NO_OUTPUT",
        suggestion: "Try a different prompt or check if your content meets content policy guidelines.",
        retryable: true
      });
    }

    res.json({ outputs });
  } catch (err: unknown) {
    console.error('Full error details:', {
      error: err,
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      type: typeof err,
      name: err instanceof Error ? err.name : undefined,
      timestamp: new Date().toISOString()
    });
    
    // Enhanced error handling for Gemini API errors
    if (err instanceof Error) {
      const message = err.message.toLowerCase();
      
      // Check for specific Gemini API error patterns
      if (message.includes('invalid_argument') || message.includes('400')) {
        if (message.includes('failed_precondition') || message.includes('billing')) {
          return res.status(400).json({ 
            error: "API requires billing in your region. Enable billing in Google AI Studio.",
            code: "REGION_BILLING_REQUIRED",
            suggestion: "Visit Google AI Studio to enable billing for your project."
          });
        }
        return res.status(400).json({ 
          error: "Invalid request. Please check your prompt and images.",
          code: "INVALID_REQUEST",
          suggestion: "Verify your prompt format and uploaded images."
        });
      }
      
      if (message.includes('permission_denied') || message.includes('403')) {
        return res.status(403).json({ 
          error: "Invalid API key or insufficient permissions.",
          code: "PERMISSION_DENIED",
          suggestion: "Check your API key configuration."
        });
      }
      
      if (message.includes('not_found') || message.includes('404')) {
        return res.status(404).json({ 
          error: "Resource not found. Please try again.",
          code: "NOT_FOUND",
          suggestion: "Verify all referenced files exist."
        });
      }
      
      if (message.includes('resource_exhausted') || message.includes('429')) {
        return res.status(429).json({ 
          error: "Rate limit exceeded. Please wait and try again.",
          code: "RATE_LIMITED",
          suggestion: "Wait a moment before making another request.",
          retryable: true
        });
      }
      
      if (message.includes('unavailable') || message.includes('503')) {
        return res.status(503).json({ 
          error: "Service temporarily unavailable.",
          code: "SERVICE_UNAVAILABLE", 
          suggestion: "Try again in a few moments or switch to a different model.",
          retryable: true
        });
      }
      
      if (message.includes('deadline_exceeded') || message.includes('504')) {
        return res.status(504).json({ 
          error: "Request timed out. Try a shorter prompt.",
          code: "TIMEOUT",
          suggestion: "Reduce your prompt length or try again.",
          retryable: true
        });
      }
      
      if (message.includes('internal') || message.includes('500')) {
        return res.status(500).json({ 
          error: "Server error. Try reducing context or switching models.",
          code: "INTERNAL_ERROR",
          suggestion: "Reduce input length or try Gemini 1.5 Flash model.",
          retryable: true
        });
      }
      
      // Generic error with original message
      return res.status(500).json({ 
        error: err.message,
        code: "UNKNOWN_ERROR"
      });
    }
    
    res.status(500).json({ 
      error: "Unknown error occurred",
      code: "UNKNOWN_ERROR"
    });
  }
});

app.post("/api/enhance-prompt", async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body as {
      prompt: string;
    };

    if (!DEFAULT_API_KEY) {
      return res.status(400).json({ error: "API key is required" });
    }

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = new GoogleGenAI({ apiKey: DEFAULT_API_KEY });

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
      model: PROMPT_ENHANCEMENT_MODEL,
      contents,
    });

    const enhancedPrompt =
      response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    res.json({ enhancedPrompt });
  } catch (err: unknown) {
    console.error(err);
    res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

const PORT = process.env.PORT || 3000;
const DEFAULT_API_KEY = process.env.GOOGLE_API_KEY;
const DEFAULT_MODEL =
  process.env.DEFAULT_MODEL || "gemini-2.5-flash-image-preview";
const PROMPT_ENHANCEMENT_MODEL =
  process.env.PROMPT_ENHANCEMENT_MODEL || "gemini-2.5-flash";

app
  .listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  })
  .on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${PORT} is busy, trying ${Number(PORT) + 1}...`);
      app.listen(Number(PORT) + 1, () => {
        console.log(`Server running at http://localhost:${Number(PORT) + 1}`);
      });
    } else {
      console.error("Server error:", err);
    }
  });
