import express, { type Request, type Response } from "express";
import { GoogleGenAI } from "@google/genai";
import mime from "mime";
import dotenv from "dotenv";

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
    const config = { responseModalities: ["IMAGE", "TEXT"] };

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
      config,
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

const PORT = process.env.PORT || 3000;
const DEFAULT_API_KEY = process.env.GOOGLE_API_KEY;
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || "gemini-2.5-flash-image-preview";

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}).on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying ${Number(PORT) + 1}...`);
    app.listen(Number(PORT) + 1, () => {
      console.log(`Server running at http://localhost:${Number(PORT) + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
});
