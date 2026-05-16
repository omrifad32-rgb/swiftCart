import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", keyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0 });
  });

  app.get("/api/env", (req, res) => {
    res.json(Object.keys(process.env));
  });

  app.post("/api/generate-description", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({ error: 'חסר מפתח API של Google Gemini. אנא הוסף בהגדרות/משתני סביבה כדי להשתמש בבינה מלאכותית.' });
      }
      
      const { name, currentDesc } = req.body;
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `You are an expert ecommerce copywriter.
Write a professional, compelling product description in Hebrew for a product named "${name}".
${currentDesc ? `Here is the current description/draft to improve upon: "${currentDesc}"` : ""}
The description should be persuasive, highlight key benefits, and sound highly professional. Return ONLY the description text, without any markdown formatting or introductory comments. Make it engaging and ready to be used on a premium ecommerce site.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ description: response.text });
    } catch (error: any) {
      console.error('Error generating description:', error);
      res.status(500).json({ error: error.message || 'Failed to generate description' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
