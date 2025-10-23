import React, { useState } from "react";
import axios from "axios";

export default function ChatBox() {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [loading, setLoading] = useState(false);
  const API = import.meta.env.VITE_API_BASE || "http://localhost:8787";

  async function ask() {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/ask`, { question: q });
      setA(res.data.answer);
    } catch (err) {
      setA("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <textarea
        rows="3"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ask about your business files..."
        style={{ width: "100%", marginBottom: 8 }}
      />
      <button onClick={ask} disabled={loading}>
        {loading ? "Thinking..." : "Ask"}
      </button>
      <pre style={{ marginTop: 12, background: "#f5f5f5", padding: 12 }}>
        {a}
      </pre>
    </div>
  );
}
