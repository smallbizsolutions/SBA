import React from "react";
import FileUpload from "./components/FileUpload.jsx";
import ChatBox from "./components/ChatBox.jsx";

export default function App() {
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 600, margin: "auto" }}>
      <h1>Sortier Lite 🧠</h1>
      <p>Upload files and ask questions using your business knowledge.</p>
      <FileUpload />
      <hr />
      <ChatBox />
    </div>
  );
}
