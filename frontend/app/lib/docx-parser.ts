import mammoth from "mammoth";

export async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  
  let text = result.value || "";
  
  // Trim to max 15,000 characters
  if (text.length > 15000) {
    text = text.substring(0, 15000) + "... [truncated]";
  }
  
  return text.trim();
}
