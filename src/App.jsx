// src/App.jsx
import React, { useState } from "react";
import VoiceRoom from "./components/VoiceRoom";

function App() {
  const [pdfUrl, setPdfUrl] = useState(null); // To view the PDF
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Handle File Upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // A. Show PDF immediately in the iframe
    const objectUrl = URL.createObjectURL(file);
    setPdfUrl(objectUrl);

    // B. Send to Backend for AI processing
    const formData = new FormData();
    formData.append("pdf", file);

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data.textLength > 0) {
        alert(`PDF Uploaded! AI read ${data.textLength} characters.`);
      } else {
        alert("Uploaded, but the PDF seems empty?");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Server error. Check terminal.");
    }
    setLoading(false);
  };

  // 2. Handle AI Chat
  const askAI = async () => {
    if (!question) return;
    
    const newHistory = [...chatHistory, { role: "user", text: question }];
    setChatHistory(newHistory);
    setQuestion("");
    
    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      setChatHistory([...newHistory, { role: "ai", text: data.answer }]);
    } catch (error) {
      setChatHistory([...newHistory, { role: "ai", text: "Error: Is the server running?" }]);
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* TOP BAR: VOICE */}
      <div style={{ padding: "10px", borderBottom: "1px solid #ccc", background: "#f5f5f5" }}>
        <VoiceRoom />
      </div>

      {/* MAIN BODY */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* LEFT: PDF VIEWER */}
        <div style={{ flex: 1, borderRight: "1px solid #ccc", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px", background: "#eee" }}>
            <input type="file" onChange={handleFileChange} accept="application/pdf" />
          </div>
          
          {/* This iframe actually displays the PDF now 👇 */}
          {pdfUrl ? (
            <iframe src={pdfUrl} width="100%" height="100%" title="PDF Viewer" />
          ) : (
            <div style={{ padding: "20px", color: "#666" }}>Upload a PDF to view it here.</div>
          )}
        </div>

        {/* RIGHT: CHAT */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "10px" }}>
          <div style={{ flex: 1, overflowY: "auto", marginBottom: "10px", border: "1px solid #eee", padding: "10px" }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ 
                textAlign: msg.role === "user" ? "right" : "left",
                margin: "5px 0" 
              }}>
                <span style={{ 
                  background: msg.role === "user" ? "#007bff" : "#e9ecef",
                  color: msg.role === "user" ? "white" : "black",
                  padding: "8px 12px",
                  borderRadius: "15px",
                  display: "inline-block"
                }}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{ display: "flex", gap: "5px" }}>
            <input 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && askAI()}
              placeholder="Ask about the PDF..."
              style={{ flex: 1, padding: "10px" }}
            />
            <button onClick={askAI} style={{ padding: "10px 20px" }}>Send</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;