import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// index.html aur static files serve karne ke liye
app.use(express.static(__dirname));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/api/chat", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question likhna zaroori hai." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Server par GEMINI_API_KEY configure nahi hai." });
    }

    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: question,
    });

    res.json({ answer: interaction.output_text });
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ 
      error: error.message && error.message.includes("503") 
        ? "AI server par abhi load zyada hai, kripya 5 second baad dobara koshish karein." 
        : (error.message || "Something went wrong") 
    });
  }
});

// Root URL par index.html bhejne ke liye
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`EduSathi live on port ${PORT}`);
});