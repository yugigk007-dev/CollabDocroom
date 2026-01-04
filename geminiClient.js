import { SYSTEM_PROMPT } from "./systemPrompt.js";

export async function askGemini(pdfText, question) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // ✅ UPDATED: Using the model confirmed to exist in your account
  const modelName = "gemini-2.5-flash"; 
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `${SYSTEM_PROMPT}\n\nPDF CONTENT:\n${pdfText}\n\nQUESTION:\n${question}`
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || "Unknown API Error");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
    
  } catch (error) {
    console.error("Direct API Call Failed:", error);
    throw error;
  }
}