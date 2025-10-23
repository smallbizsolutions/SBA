import React, { useState } from "react";
import axios from "axios";

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  const API = import.meta.env.VITE_API_BASE || "http://localhost:8787";

  async function upload(e) {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setMsg("Uploading...");
    try {
      await axios.post(`${API}/api/upload`, fd);
      setMsg("File uploaded and indexed ✅");
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  }

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={upload}>Upload</button>
      <p>{msg}</p>
    </div>
  );
}
