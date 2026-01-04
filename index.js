import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// We are now confident this is the correct library
const pdfParse = require("pdf-parse"); 

console.log("🔍 NEW PDF LIB:", pdfParse); // Should say [Function: PDF]
// -----------------------

dotenv.config();

const app = express(); 
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup File Uploads
// ensure 'uploads' folder exists or create it manually if this fails
const upload = multer({ dest: "uploads/" }); 

// AI Config
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// UPGRADE: Use the newer 2.5 Flash model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

let currentPdfText = "";

// 1. Upload Route
app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });

    console.log("📄 Processing:", req.file.originalname);
    const dataBuffer = fs.readFileSync(req.file.path);

    // CALL THE FUNCTION
    const data = await pdfParse(dataBuffer);
    
    currentPdfText = data.text;
    fs.unlinkSync(req.file.path); // Cleanup

    console.log("✅ PDF Text Extracted (Chars):", currentPdfText.length);
    res.json({ message: "Success", textLength: currentPdfText.length });

  } catch (error) {
    console.error("❌ Upload Error:", error);
    res.status(500).json({ error: "Failed to read PDF" });
  }
});

// 2. Chat Route
app.post("/chat", async (req, res) => {
  try {
    const { question } = req.body;
    if (!currentPdfText) return res.json({ answer: "Please upload a PDF first." });

    const prompt = `Context: ${currentPdfText.substring(0, 30000)}\n\nQuestion: ${question}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.json({ answer: response.text() });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI Failed" });
  }
});

// Serve Website
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));

app.listen(port, () => console.log(`🚀 Server on port ${port}`));