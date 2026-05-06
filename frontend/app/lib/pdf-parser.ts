import * as pdfjs from "pdfjs-dist";

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

// Maximum character limit for extracted text
const MAX_TEXT_LENGTH = 15000;

/**
 * Extracts text content from a PDF file
 * @param file - The PDF file to extract text from
 * @returns Promise resolving to the extracted text
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument(arrayBuffer).promise;
  
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    
    fullText += pageText + "\n";
  }
  
  // Trim to max character limit
  if (fullText.length > MAX_TEXT_LENGTH) {
    fullText = fullText.substring(0, MAX_TEXT_LENGTH) + "... [truncated]";
  }
  
  return fullText.trim();
}
