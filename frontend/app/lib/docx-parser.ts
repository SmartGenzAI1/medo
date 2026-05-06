import mammoth from "mammoth";

// Maximum character limit for extracted text
const MAX_TEXT_LENGTH = 15000;

/**
 * Extracts text content from a DOCX file
 * @param file - The DOCX file to extract text from
 * @returns Promise resolving to the extracted text
 */
export async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  
  let text = result.value || "";
  
  // Trim to max character limit
  if (text.length > MAX_TEXT_LENGTH) {
    text = text.substring(0, MAX_TEXT_LENGTH) + "... [truncated]";
  }
  
  return text.trim();
}
