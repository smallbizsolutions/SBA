import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import OpenAI from "openai";

import { supabase } from "./supabase.js";
import { extractTextFromFile } from "./extract.js";
import { chunkText } from "./chunker.js";
import { embedTexts, cosine } from "./embeddings.js";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: process.env.CORS_ORIGINS?.split(",") || "*" }));

const upload = multer({ dest: path.resolve("./tmp") });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Upload file → chunk → embed → store in Supabase
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const text = await extractTextFromFile(file.path);
    const chunks = chunkText(text);
    const embeddings = await embedTexts(chunks);

    // Store doc
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .insert({ name: file.originalname, mime: file.mimetype, bytes: file.size })
      .select()
      .single();
    if (docErr) throw docErr;

    // Store chunks
    const chunkRows = chunks.map((t, i) => ({
      document_id: doc.id,
      ord: i,
      text: t,
      embedding: embeddings[i]
    }));
    const { error: chunkErr } = await supabase.from("chunks").insert(chunkRows);
    if (chunkErr) throw chunkErr;

    fs.unlinkSync(file.path); // cleanup
    res.json({ success: true, document_id: doc.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Ask question using top-matching chunks
app.post("/api/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Missing question" });

  const qEmbed = (await embedTexts([question]))[0];

  // Fetch all chunks (optimize later with pgvector search)
  const { data: chunks, error } = await supabase.from("chunks").select("id,text,embedding");
  if (error) throw error;

  const scored = chunks.map((c) => ({
    text: c.text,
    score: cosine(qEmbed, c.embedding)
  }));
  const top = scored.sort((a, b) => b.score - a.score).slice(0, 4);
  const context = top.map((t) => t.text).join("\n---\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful business assistant using internal files." },
      { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` }
    ]
  });

  res.json({ answer: completion.choices[0].message.content });
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`✅ Sortier Lite running on port ${PORT}`));
