import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.GEMINI_VIDEO_MODEL || "gemini-omni-1.1-flash";

app.disable("x-powered-by");
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:"],
      mediaSrc: ["'self'", "blob:"],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public")));

const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many video requests from this connection. Please wait 15 minutes and try again." }
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "XP Video Studio",
    model: MODEL,
    apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

app.post("/api/generate", generateLimiter, async (req, res) => {
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  const resolution = req.body?.resolution === "1080p" ? "1080p" : "720p";

  if (!prompt) return res.status(400).json({ error: "Enter a video prompt first." });
  if (prompt.length > 4000) return res.status(400).json({ error: "Please keep your prompt under 4,000 characters." });
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      error: "The backend is not configured yet. Add GEMINI_API_KEY to your hosting environment variables."
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const interaction = await ai.interactions.create({
      model: MODEL,
      input: prompt,
      response_format: { type: "video", resolution }
    });

    const encoded = interaction?.output_video?.data;
    if (!encoded || typeof encoded !== "string") {
      console.error("Video API returned no output_video.data. Interaction id:", interaction?.id || "unknown");
      return res.status(502).json({
        error: "The video model did not return a downloadable video. Check model access and API quota, then try again."
      });
    }

    const videoBytes = Buffer.from(encoded, "base64");
    if (!videoBytes.length) {
      return res.status(502).json({ error: "The video model returned an empty file. Please try again." });
    }

    const safeName = `xp-video-${Date.now()}.mp4`;
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Video-Model", MODEL);
    return res.status(200).send(videoBytes);
  } catch (err) {
    console.error("Video generation failed:", err?.status || "", err?.message || err);
    const message = String(err?.message || "");
    let userMessage = "Video generation failed. Please try again in a moment.";
    if (/API key|api_key|unauthorized|permission|forbidden/i.test(message)) {
      userMessage = "Google API authentication failed. Check that GEMINI_API_KEY is correct and has access to the video model.";
    } else if (/quota|rate limit|resource exhausted|429/i.test(message)) {
      userMessage = "The Google AI quota or rate limit has been reached. Check your Google AI plan and try again later.";
    } else if (/safety|blocked|policy/i.test(message)) {
      userMessage = "This prompt may have been blocked by the model's safety checks. Try rephrasing it.";
    } else if (/model|not found|404/i.test(message)) {
      userMessage = `The configured model (${MODEL}) may not be available to your API project. Check model access or set GEMINI_VIDEO_MODEL to an available video model.`;
    }
    return res.status(502).json({ error: userMessage });
  }
});

app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`XP Video Studio listening on port ${PORT}`);
});
