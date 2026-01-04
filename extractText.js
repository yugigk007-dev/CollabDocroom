import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
export async function extractTextFromPDF(buffer) {
  const data = await pdf(buffer);
  return data.text;
}
