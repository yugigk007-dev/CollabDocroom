// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // <--- Import App instead of VoiceRoom

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />  {/* <--- Render App here */}
  </React.StrictMode>,
)