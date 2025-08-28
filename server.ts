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

    res.json({ outputs });
  } catch (err: unknown) {
    console.error(err);
    res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
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
1. Adding specific visual details (lighting, composition, style, colors)
2. Making it more descriptive
3. Keeping the original intent but making it more likely to produce a stunning image
4. Keep it concise but detailed (aim for 1-3 sentences)
5. Make it safer for a LLM

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
