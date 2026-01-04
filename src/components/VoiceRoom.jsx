// src/components/VoiceRoom.jsx
import React, { useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

// 1. Keep client OUTSIDE the component so it doesn't reset on re-renders
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

function VoiceRoom() {
  const [calling, setCalling] = useState(false);
  const [users, setUsers] = useState([]);
  
  // 👇 PASTE YOUR APP ID HERE 👇
  const APP_ID = "23f24664d24c42c09dd3bce9e9ce042f"; 
  const CHANNEL = "main-room";

  useEffect(() => {
    const handleCall = async () => {
      if (calling) {
        try {
          await client.join(APP_ID, CHANNEL, null, null);
          const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
          await client.publish(micTrack);
          
          // Local cleanup function for track
          return () => {
            micTrack.stop();
            micTrack.close();
          };
        } catch (error) {
          console.error("Join error:", error);
        }
      } else {
        await client.leave();
        setUsers([]);
      }
    };

    handleCall();
  }, [calling]);

  useEffect(() => {
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === "audio") {
        user.audioTrack.play();
        setUsers((prev) => [...prev, user]);
      }
    });

    client.on("user-unpublished", (user) => {
      setUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    });
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      <button
        onClick={() => setCalling(!calling)}
        style={{
          backgroundColor: calling ? "#ff4d4d" : "#4CAF50",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        {calling ? "End Call ☎️" : "Join Room 📞"}
      </button>
      <span>
  Status: {calling ? "🟢 Live" : "⚪ Offline"} 
  | Remote Users: <strong>{users.length}</strong>
</span>
    </div>
  );
}

// 👇 THIS MAGIC LINE STOPS THE RE-RENDERS 👇
export default React.memo(VoiceRoom);