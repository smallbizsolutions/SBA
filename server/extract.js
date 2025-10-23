import fs from "node:fs";
import pdfParse from "pdf-parse";
import mime from "mime-types";

export async function extractTextFromFile(filePath) {
  const m = mime.lookup(filePath) || "application/octet-stream";
  if (m === "application/pdf") {
    const buffer = fs.readFileSync(filePath);
    const { text } = await pdfParse(buffer);
    return text || "";
  }
  if (m.startsWith("text/")) return fs.readFileSync(filePath, "utf8");
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}
