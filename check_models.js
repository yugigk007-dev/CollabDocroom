import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
  console.log("🔍 Checking available AI models...");
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
        console.error("❌ Error:", data.error.message);
        return;
    }

    console.log("\n✅ AVAILABLE MODELS FOR YOU:");
    const models = data.models || [];
    // We only want models that can chat (generateContent)
    const chatModels = models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
    
    chatModels.forEach(m => console.log(`👉 ${m.name.replace("models/", "")}`));
    
    if (chatModels.length === 0) {
        console.log("❌ No chat models found.");
    }
  } catch (error) {
    console.error("Network Error:", error);
  }
}

listModels();